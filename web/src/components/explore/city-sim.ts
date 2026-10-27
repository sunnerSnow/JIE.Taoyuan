import type { CategorySlug } from "@/data/types";
import type { WalkMap } from "@/lib/map-data";

// 「市民在路上」：每位市民（政策的虛構情境）從自己政策的建築出發，
// 多半在島上兩棟建築之間散步；有政策關聯時，偶爾沿著航線走到另一座島的相關政策，再走回來。
// 沿著關聯跨島的行程會寫進城市日誌（同島的短程不記，日誌才不會刷太快）。座標都是世界圖的百分比；只在瀏覽器端跑，動畫關掉時暫停。

type Pt = { x: number; y: number };

export type SimPolicy = { slug: string; island: CategorySlug; door: Pt };
export type SimCitizen = { id: string; island: CategorySlug; policySlug: string };

export type LogEntry = { id: number; time: string; kind: "depart" | "arrive"; citizenId: string; from: string; to: string };
/** 市民現在的狀態：walking 時 from → to；停留時 at */
export type CitizenStatus = { walking: boolean; at: string; from?: string; to?: string; relation: boolean };

type Walker = {
  c: SimCitizen;
  /** 同一棟建築的兩位市民錯開一點，不會疊在一起 */
  jx: number;
  jy: number;
  x: number;
  y: number;
  dir: 1 | -1;
  speed: number;
  path: Pt[];
  seg: number;
  segT: number;
  rest: number;
  status: CitizenStatus;
};

/** 每秒走多遠（世界寬度的百分比） */
const SPEED: [number, number] = [0.9, 1.4];
const REST_HOME: [number, number] = [8, 20];
const REST_AWAY: [number, number] = [4, 10];
/** 在家時，下一趟走去相關政策（可能在別座島）的機率 */
const RELATION_CHANCE = 0.35;
const LOG_MAX = 40;

const rand = ([a, b]: [number, number]) => a + Math.random() * (b - a);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

/** 二次貝茲曲線取樣（航線） */
function quad(a: Pt, c: Pt, b: Pt, n = 14): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
  });
}

const clock = new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });

export class CitySim {
  private walkers: Walker[];
  private policies: Map<string, SimPolicy>;
  private related: Map<string, string[]>;
  private sameIsland: Map<CategorySlug, string[]>;
  private listeners = new Set<() => void>();
  private log: LogEntry[] = [];
  private seq = 0;
  /** 每次狀態改變（出發、抵達）就換新的值，給 useSyncExternalStore 比對 */
  private version = 0;

  constructor(
    citizens: SimCitizen[],
    policies: SimPolicy[],
    relations: { a: string; b: string }[],
    private walk: WalkMap,
    /** 世界圖寬高比：y 的百分比要換成和 x 同一個尺度才能算距離 */
    private ratio: number,
  ) {
    this.policies = new Map(policies.map((p) => [p.slug, p]));
    this.related = new Map();
    for (const r of relations) {
      if (!this.policies.has(r.a) || !this.policies.has(r.b)) continue;
      this.related.set(r.a, [...(this.related.get(r.a) ?? []), r.b]);
      this.related.set(r.b, [...(this.related.get(r.b) ?? []), r.a]);
    }
    this.sameIsland = new Map();
    for (const p of policies) this.sameIsland.set(p.island, [...(this.sameIsland.get(p.island) ?? []), p.slug]);
    this.walkers = citizens.map((c, i) => {
      const door = this.policies.get(c.policySlug)!.door;
      const jx = ((i % 5) - 2) * 0.32;
      const jy = ((i % 3) - 1) * 0.45;
      return {
        c,
        jx,
        jy,
        x: door.x + jx,
        y: door.y + jy,
        dir: i % 2 ? 1 : -1,
        // 建構時不能用 Math.random（頁面會先在伺服器端預先產生），用編號錯開速度與出發時間
        speed: SPEED[0] + ((i * 37) % 50) / 100,
        path: [],
        seg: 0,
        segT: 0,
        // 一開始錯開出發時間，地圖一打開就有人在走
        rest: (i * 1.7) % 14,
        status: { walking: false, at: c.policySlug, relation: false },
      };
    });
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getVersion = () => this.version;
  getLog = () => this.log;
  statusOf = (id: string) => this.walkers.find((w) => w.c.id === id)?.status ?? null;
  walkingCount = () => this.walkers.filter((w) => w.status.walking).length;
  /** 給畫面更新位置用 */
  positions() {
    return this.walkers;
  }

  private emit() {
    this.version++;
    for (const fn of this.listeners) fn();
  }

  private dist(a: Pt, b: Pt) {
    return Math.hypot(b.x - a.x, (b.y - a.y) / this.ratio);
  }

  /** 從現在的位置走到某項政策的建築門口：同島直走；跨島沿航線經過中央小島 */
  private route(w: Walker, from: SimPolicy, to: SimPolicy): Pt[] {
    const start = { x: w.x, y: w.y };
    // 到了之後在門口附近隨意站，不要每個人都擠在同一點
    const end = { x: to.door.x + w.jx + (Math.random() - 0.5) * 0.8, y: to.door.y + w.jy + (Math.random() - 0.5) * 0.7 };
    if (from.island === to.island) return [start, end];
    const A = this.walk.islands[from.island];
    const B = this.walk.islands[to.island];
    const out = quad(this.walk.hub, A.ctrl, A.dock).reverse();
    const back = quad(this.walk.hub, B.ctrl, B.dock);
    return [start, ...out, ...back.slice(1), end];
  }

  private crosses(a: string, b: string) {
    return this.policies.get(a)?.island !== this.policies.get(b)?.island;
  }

  private record(kind: LogEntry["kind"], w: Walker, from: string, to: string) {
    this.log = [{ id: ++this.seq, time: clock.format(new Date()), kind, citizenId: w.c.id, from, to }, ...this.log].slice(0, LOG_MAX);
  }

  private depart(w: Walker) {
    const home = w.c.policySlug;
    const here = w.status.at;
    let to: string;
    let relation = false;
    if (here !== home) {
      to = home;
      relation = (this.related.get(home) ?? []).includes(here);
    } else {
      const rel = this.related.get(home) ?? [];
      if (rel.length && Math.random() < RELATION_CHANCE) {
        to = pick(rel);
        relation = true;
      } else {
        const others = (this.sameIsland.get(w.c.island) ?? []).filter((s) => s !== home);
        to = others.length ? pick(others) : home;
      }
    }
    w.path = this.route(w, this.policies.get(here)!, this.policies.get(to)!);
    w.seg = 0;
    w.segT = 0;
    w.status = { walking: true, at: here, from: here, to, relation };
    if (relation && this.crosses(here, to)) this.record("depart", w, here, to);
    return true;
  }

  private arrive(w: Walker) {
    const { from = w.status.at, to = w.status.at, relation } = w.status;
    w.status = { walking: false, at: to, relation: false };
    w.rest = rand(to === w.c.policySlug ? REST_HOME : REST_AWAY);
    if (relation && this.crosses(from, to)) this.record("arrive", w, from, to);
  }

  /** 前進 dt 秒；有人出發或抵達時通知訂閱者 */
  tick(dt: number) {
    let changed = false;
    for (const w of this.walkers) {
      if (!w.status.walking) {
        w.rest -= dt;
        if (w.rest <= 0) changed = this.depart(w) || changed;
        continue;
      }
      let left = w.speed * dt;
      while (left > 0 && w.seg < w.path.length - 1) {
        const a = w.path[w.seg];
        const b = w.path[w.seg + 1];
        const len = this.dist(a, b);
        if (w.segT + left < len) {
          w.segT += left;
          left = 0;
        } else {
          left -= len - w.segT;
          w.seg++;
          w.segT = 0;
        }
      }
      if (w.seg >= w.path.length - 1) {
        const end = w.path[w.path.length - 1];
        w.x = end.x;
        w.y = end.y;
        this.arrive(w);
        changed = true;
        continue;
      }
      const a = w.path[w.seg];
      const b = w.path[w.seg + 1];
      const len = this.dist(a, b) || 1;
      const t = w.segT / len;
      w.x = a.x + (b.x - a.x) * t;
      w.y = a.y + (b.y - a.y) * t;
      if (Math.abs(b.x - a.x) > 0.01) w.dir = b.x > a.x ? 1 : -1;
    }
    if (changed) this.emit();
  }
}

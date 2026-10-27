// 等距（isometric）小型繪圖引擎：世界座標 (x, y, z) → SVG 座標。
// +x 往右下、+y 往左下、+z 往上；x + y 越大越靠近觀看者，所以畫的順序要由小到大。

export const INK = "#193A42";

const C = Math.cos(Math.PI / 6);
const S = 0.5;

export type Pt = [number, number];
export type V3 = [number, number, number];

export function project(x: number, y: number, z = 0): Pt {
  return [(x - y) * C, (x + y) * S - z];
}

/** 螢幕座標反推地面（z = 0）上的世界座標，方便用畫面位置擺島 */
export function fromScreen(sx: number, sy: number): [number, number] {
  const a = sx / C;
  const b = sy / S;
  return [(a + b) / 2, (b - a) / 2];
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function pathOf(pts: Pt[], close = true) {
  return "M" + pts.map(([x, y]) => `${r2(x)} ${r2(y)}`).join("L") + (close ? "Z" : "");
}

export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.max(0, Math.min(255, Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount))),
  );
  return "#" + ch.map((c) => c.toString(16).padStart(2, "0")).join("");
}

export type Shape = {
  d: string;
  fill: string;
  stroke?: string;
  sw?: number;
  dash?: string;
  opacity?: number;
  cap?: "round" | "butt";
  /** 屬於哪座島（探索地圖用來點島、淡化其他島） */
  island?: string;
  /** 屬於哪一個政策圖釘位置的建築（探索地圖用來點建築、高亮選取的政策） */
  spot?: number;
};

/**
 * 扁平風（參考 unouplus）：填色面不描邊，只用同色細線補面與面之間的接縫；線條類改成柔和的深青灰。
 * line 是原本 sw=1 時的線寬（網頁用螢幕 px，分享圖用換算後的世界座標）。
 */
export function flatStroke(s: Shape, line: number): { stroke?: string; width?: number; dash?: string } {
  if (!s.stroke) return {};
  if (s.fill !== "none" && s.stroke === INK) return { stroke: s.fill, width: line / 2 };
  return { stroke: s.stroke === INK ? "#3b6466" : s.stroke, width: (s.sw ?? 1) * line, dash: s.dash };
}

type FaceColors = { top: string; left?: string; right?: string };
type Opts = { stroke?: string | null; sw?: number; dash?: string; opacity?: number };

function faces(c: string | FaceColors) {
  const top = typeof c === "string" ? c : c.top;
  return {
    top,
    left: typeof c === "string" || !c.left ? shade(top, -0.07) : c.left,
    right: typeof c === "string" || !c.right ? shade(top, -0.16) : c.right,
  };
}

function convexHull(points: Pt[]): Pt[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Pt[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Pt[] = [];
  for (const p of pts.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

/** 以世界座標下指令的畫布；ox/oy/oz 是整座島的原點位移 */
export class Iso {
  shapes: Shape[] = [];
  /** 之後畫的圖形都標上這座島 */
  island?: string;
  /** 之後畫的圖形都屬於這個圖釘位置的建築；用 building() 切換 */
  spot?: number;
  minX = Infinity;
  minY = Infinity;
  maxX = -Infinity;
  maxY = -Infinity;

  constructor(
    public ox = 0,
    public oy = 0,
    public oz = 0,
  ) {}

  at(x: number, y: number, z = 0): Pt {
    const p = project(x + this.ox, y + this.oy, z + this.oz);
    this.minX = Math.min(this.minX, p[0]);
    this.maxX = Math.max(this.maxX, p[0]);
    this.minY = Math.min(this.minY, p[1]);
    this.maxY = Math.max(this.maxY, p[1]);
    return p;
  }

  /** 接下來畫的圖形屬於第 i 個圖釘位置的建築；null 結束 */
  building(i: number | null) {
    this.spot = i ?? undefined;
  }

  push(d: string, fill: string, o: Opts = {}) {
    this.shapes.push({
      d,
      fill,
      stroke: o.stroke === null ? undefined : (o.stroke ?? INK),
      sw: o.sw,
      dash: o.dash,
      opacity: o.opacity,
      island: this.island,
      spot: this.spot,
    });
  }

  poly(pts: V3[], fill: string, o?: Opts) {
    this.push(pathOf(pts.map(([x, y, z]) => this.at(x, y, z))), fill, o);
  }

  line(pts: V3[], stroke = INK, sw?: number, dash?: string) {
    this.shapes.push({
      d: pathOf(pts.map(([x, y, z]) => this.at(x, y, z)), false),
      fill: "none",
      stroke,
      sw,
      dash,
      cap: "round",
      island: this.island,
      spot: this.spot,
    });
  }

  /** 螢幕座標的自由路徑（以某個世界點為原點） */
  free(x: number, y: number, z: number, d: (o: Pt) => string, fill: string, o?: Opts) {
    this.push(d(this.at(x, y, z)), fill, o);
  }

  box(x: number, y: number, z: number, w: number, d: number, h: number, color: string | FaceColors, o?: Opts) {
    const f = faces(color);
    const t = z + h;
    this.poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, t], [x + w, y, t]], f.right, o);
    this.poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, t], [x, y + d, t]], f.left, o);
    this.poly([[x, y, t], [x + w, y, t], [x + w, y + d, t], [x, y + d, t]], f.top, o);
  }

  /** 地面上的平面矩形（道路、草皮、斑馬線） */
  flat(x: number, y: number, z: number, w: number, d: number, fill: string, o?: Opts) {
    this.poly([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], fill, o);
  }

  /** 朝向 +y（畫面左下）牆面上的窗、門 */
  winL(yPlane: number, x0: number, x1: number, z0: number, z1: number, fill = "#DCEBF0", o?: Opts) {
    this.poly([[x0, yPlane, z0], [x1, yPlane, z0], [x1, yPlane, z1], [x0, yPlane, z1]], fill, { sw: 0.9, ...o });
  }

  /** 朝向 +x（畫面右下）牆面上的窗、門 */
  winR(xPlane: number, y0: number, y1: number, z0: number, z1: number, fill = "#DCEBF0", o?: Opts) {
    this.poly([[xPlane, y0, z0], [xPlane, y1, z0], [xPlane, y1, z1], [xPlane, y0, z1]], fill, { sw: 0.9, ...o });
  }

  /** 一排窗：沿牆面平均分布 */
  windowsL(yPlane: number, x0: number, x1: number, z0: number, z1: number, n: number, fill?: string) {
    const span = (x1 - x0) / n;
    for (let i = 0; i < n; i++) this.winL(yPlane, x0 + span * i + span * 0.2, x0 + span * (i + 1) - span * 0.2, z0, z1, fill);
  }

  windowsR(xPlane: number, y0: number, y1: number, z0: number, z1: number, n: number, fill?: string) {
    const span = (y1 - y0) / n;
    for (let i = 0; i < n; i++) this.winR(xPlane, y0 + span * i + span * 0.2, y0 + span * (i + 1) - span * 0.2, z0, z1, fill);
  }

  /** 人字屋頂；ridge 'x' 表示屋脊沿 x 方向 */
  gable(x: number, y: number, z: number, w: number, d: number, h: number, ridge: "x" | "y", roof: string, wall: string) {
    if (ridge === "x") {
      const m = y + d / 2;
      this.poly([[x, y, z], [x + w, y, z], [x + w, m, z + h], [x, m, z + h]], shade(roof, 0.12));
      this.poly([[x + w, y, z], [x + w, y + d, z], [x + w, m, z + h]], shade(wall, -0.16));
      this.poly([[x, y + d, z], [x + w, y + d, z], [x + w, m, z + h], [x, m, z + h]], roof);
    } else {
      const m = x + w / 2;
      this.poly([[x, y, z], [x, y + d, z], [m, y + d, z + h], [m, y, z + h]], shade(roof, 0.12));
      this.poly([[x, y + d, z], [x + w, y + d, z], [m, y + d, z + h]], shade(wall, -0.07));
      this.poly([[x + w, y, z], [x + w, y + d, z], [m, y + d, z + h], [m, y, z + h]], shade(roof, -0.1));
    }
  }

  /** 直立圓柱（水塔、體育館、樹幹） */
  cylinder(cx: number, cy: number, z: number, r: number, h: number, color: string, top?: string, o?: Opts) {
    const [px, py] = this.at(cx, cy, z);
    const rx = r * Math.SQRT2 * C;
    const ry = r * Math.SQRT2 * S;
    this.at(cx, cy, z + h);
    this.minX = Math.min(this.minX, px - rx);
    this.maxX = Math.max(this.maxX, px + rx);
    const tY = py - h;
    this.push(
      `M${r2(px - rx)} ${r2(tY)}L${r2(px - rx)} ${r2(py)}A${r2(rx)} ${r2(ry)} 0 0 0 ${r2(px + rx)} ${r2(py)}L${r2(px + rx)} ${r2(tY)}Z`,
      shade(color, -0.1),
      o,
    );
    this.push(`M${r2(px - rx)} ${r2(tY)}a${r2(rx)} ${r2(ry)} 0 1 0 ${r2(rx * 2)} 0a${r2(rx)} ${r2(ry)} 0 1 0 ${r2(-rx * 2)} 0Z`, top ?? color, o);
  }

  /** 地面上的圓／橢圓（池塘、花圃、球場） */
  disk(cx: number, cy: number, z: number, r: number, fill: string, o?: Opts & { sx?: number; sy?: number }) {
    const [px, py] = this.at(cx, cy, z);
    const rx = r * Math.SQRT2 * C * (o?.sx ?? 1);
    const ry = r * Math.SQRT2 * S * (o?.sy ?? 1);
    this.push(`M${r2(px - rx)} ${r2(py)}a${r2(rx)} ${r2(ry)} 0 1 0 ${r2(rx * 2)} 0a${r2(rx)} ${r2(ry)} 0 1 0 ${r2(-rx * 2)} 0Z`, fill, o);
  }

  /** 圓形樹冠的行道樹 */
  tree(x: number, y: number, z = 0, size = 1, leaf = "#9CCB86") {
    const [px, py] = this.at(x, y, z);
    const r = 2.1 * size;
    this.push(`M${r2(px - r * 0.9)} ${r2(py)}a${r2(r * 0.9)} ${r2(r * 0.42)} 0 1 0 ${r2(r * 1.8)} 0a${r2(r * 0.9)} ${r2(r * 0.42)} 0 1 0 ${r2(-r * 1.8)} 0Z`, "#BFD9C8", { stroke: null });
    this.push(`M${r2(px - 0.35)} ${r2(py)}L${r2(px - 0.35)} ${r2(py - 2.4 * size)}L${r2(px + 0.35)} ${r2(py - 2.4 * size)}L${r2(px + 0.35)} ${r2(py)}Z`, "#C9A27A", { sw: 0.8 });
    const cy = py - 2.4 * size - r * 0.8;
    this.push(`M${r2(px - r)} ${r2(cy)}a${r2(r)} ${r2(r)} 0 1 0 ${r2(r * 2)} 0a${r2(r)} ${r2(r)} 0 1 0 ${r2(-r * 2)} 0Z`, leaf);
    this.minY = Math.min(this.minY, cy - r);
  }

  /** 圓錐形的樹 */
  pine(x: number, y: number, z = 0, size = 1, leaf = "#6FAF83") {
    const [px, py] = this.at(x, y, z);
    const w = 1.7 * size;
    const h = 6.5 * size;
    this.push(`M${r2(px - 0.3)} ${r2(py)}L${r2(px - 0.3)} ${r2(py - 1.4 * size)}L${r2(px + 0.3)} ${r2(py - 1.4 * size)}L${r2(px + 0.3)} ${r2(py)}Z`, "#C9A27A", { sw: 0.8 });
    this.push(
      `M${r2(px - w)} ${r2(py - 1.2 * size)}Q${r2(px - w * 0.6)} ${r2(py - h * 0.75)} ${r2(px)} ${r2(py - h)}Q${r2(px + w * 0.6)} ${r2(py - h * 0.75)} ${r2(px + w)} ${r2(py - 1.2 * size)}Q${r2(px)} ${r2(py - 0.4 * size)} ${r2(px - w)} ${r2(py - 1.2 * size)}Z`,
      leaf,
    );
    this.minY = Math.min(this.minY, py - h);
  }

  /** 小人：頭＋身體，站在地面 */
  person(x: number, y: number, z = 0, body = "#477D73", opts: { h?: number; skin?: string; hair?: string } = {}) {
    const [px, py] = this.at(x, y, z);
    const h = opts.h ?? 1;
    this.push(`M${r2(px - 0.7)} ${r2(py)}a0.7 0.3 0 1 0 1.4 0a0.7 0.3 0 1 0 -1.4 0Z`, "#B9D6CB", { stroke: null });
    this.push(
      `M${r2(px - 0.55 * h)} ${r2(py - 0.1)}L${r2(px - 0.65 * h)} ${r2(py - 2.3 * h)}Q${r2(px)} ${r2(py - 2.9 * h)} ${r2(px + 0.65 * h)} ${r2(py - 2.3 * h)}L${r2(px + 0.55 * h)} ${r2(py - 0.1)}Z`,
      body,
      { sw: 0.8 },
    );
    const hy = py - 3.05 * h;
    this.push(`M${r2(px - 0.6 * h)} ${r2(hy)}a${0.6 * h} ${0.6 * h} 0 1 0 ${1.2 * h} 0a${0.6 * h} ${0.6 * h} 0 1 0 ${-1.2 * h} 0Z`, opts.skin ?? "#F6D7BF", { sw: 0.8 });
    this.push(
      `M${r2(px - 0.62 * h)} ${r2(hy - 0.05)}Q${r2(px)} ${r2(hy - 1.05 * h)} ${r2(px + 0.62 * h)} ${r2(hy - 0.05)}Q${r2(px)} ${r2(hy - 0.45 * h)} ${r2(px - 0.62 * h)} ${r2(hy - 0.05)}Z`,
      opts.hair ?? INK,
      { sw: 0.6 },
    );
    this.minY = Math.min(this.minY, hy - h);
  }

  /** 圓角矩形的島：頂面＋可見的側面（用凸包求外輪廓） */
  slab(x: number, y: number, w: number, d: number, r: number, thick: number, top: string, side: string, z = 0) {
    const ring = (grow: number) => {
      const out: [number, number][] = [];
      const corners: [number, number, number][] = [
        [x + w - r, y + r, -90],
        [x + w - r, y + d - r, 0],
        [x + r, y + d - r, 90],
        [x + r, y + r, 180],
      ];
      for (const [cx, cy, start] of corners) {
        for (let i = 0; i <= 6; i++) {
          const a = ((start + i * 15) * Math.PI) / 180;
          out.push([cx + Math.cos(a) * (r + grow), cy + Math.sin(a) * (r + grow)]);
        }
      }
      return out;
    };
    // 島邊的水波圈
    this.push(pathOf(ring(2.2).map(([a, b]) => this.at(a, b, z - thick))), "#E9F4F6", { stroke: "#FFFFFF", sw: 1.4, opacity: 0.85 });
    const topPts = ring(0).map(([a, b]) => this.at(a, b, z));
    const botPts = ring(0).map(([a, b]) => this.at(a, b, z - thick));
    this.push(pathOf(convexHull([...topPts, ...botPts])), side);
    this.push(pathOf(topPts), top);
  }
}

export type IsoBounds = { x: number; y: number; w: number; h: number };

export function boundsOf(iso: Iso, pad = 4): IsoBounds {
  return {
    x: iso.minX - pad,
    y: iso.minY - pad,
    w: iso.maxX - iso.minX + pad * 2,
    h: iso.maxY - iso.minY + pad * 2,
  };
}

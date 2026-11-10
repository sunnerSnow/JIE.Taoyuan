import Form from "next/form";
import Link from "next/link";
import { PenguinSays } from "@/components/art/speech";
import { WISH_DISTRICTS, WISH_TYPES, type WishType } from "@/lib/wish/options";
import { getWall, getWallStats, type WallQuery } from "@/lib/wish/store";
import { WishNote } from "./wish-note";

const PAGE = 24;
const MAX = 240;

type SearchParams = Record<string, string | string[] | undefined>;

function parseWall(sp: SearchParams): WallQuery {
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).trim() : "");
  const type = WISH_TYPES.find((t) => t.key === one("type"))?.key ?? null;
  const district = (WISH_DISTRICTS as readonly string[]).includes(one("district")) ? one("district") : null;
  const n = Number(one("n"));
  return {
    sort: one("sort") === "hot" ? "hot" : "new",
    type,
    district,
    q: Array.from(one("q")).slice(0, 30).join(""),
    limit: Number.isInteger(n) && n > PAGE ? Math.min(MAX, Math.ceil(n / PAGE) * PAGE) : PAGE,
  };
}

/** 願望牆的網址：只帶非預設的條件 */
function wallHref(w: WallQuery, patch: Partial<WallQuery>) {
  const next = { ...w, limit: PAGE, ...patch };
  const p = new URLSearchParams();
  if (next.sort === "hot") p.set("sort", "hot");
  if (next.type) p.set("type", next.type);
  if (next.district) p.set("district", next.district);
  if (next.q) p.set("q", next.q);
  if (next.limit > PAGE) p.set("n", String(next.limit));
  const qs = p.toString();
  return qs ? `/wish?${qs}` : "/wish";
}

const chip = (on: boolean) =>
  `inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-[14px] font-black tracking-[0.04em] transition-colors ${
    on ? "border-teal-deep bg-teal-deep text-paper" : "border-edge bg-paper hover:bg-mint"
  }`;

/** 願望牆：最新／熱門、類型、行政區、關鍵字。條件都在網址上，可以直接分享 */
export async function WishWall({ searchParams, open, readable }: { searchParams: Promise<SearchParams>; open: boolean; readable: boolean }) {
  const w = parseWall(await searchParams);

  if (!readable) {
    return (
      <PenguinSays pose="stand" className="mt-10" bubbleClassName="max-w-md">
        願望牆還在準備中，開放後大家的願望就會貼在這裡。
      </PenguinSays>
    );
  }

  let data: Awaited<ReturnType<typeof getWall>>;
  let stats: Awaited<ReturnType<typeof getWallStats>>;
  try {
    [data, stats] = await Promise.all([getWall(w), getWallStats()]);
  } catch {
    return (
      <p role="alert" className="mt-10 rounded-2xl bg-peach px-5 py-4 text-[15px] font-bold">
        願望牆暫時讀不到，請稍後重新整理再試一次。
      </p>
    );
  }

  const filtered = Boolean(w.type || w.district || w.q);
  const typeCount = (k: WishType | null) => (k ? (stats.byType[k] ?? 0) : stats.total);

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label="排序">
        {(["new", "hot"] as const).map((s) => (
          <Link key={s} href={wallHref(w, { sort: s })} scroll={false} aria-current={w.sort === s ? "true" : undefined} className={chip(w.sort === s)}>
            {s === "new" ? "最新" : "最多人認同"}
          </Link>
        ))}
      </div>
      <nav className="mt-3 flex flex-wrap items-center gap-2" aria-label="依類型篩選">
        {[null, ...WISH_TYPES.map((t) => t.key)].map((k) => (
          <Link key={k ?? "all"} href={wallHref(w, { type: k })} scroll={false} aria-current={w.type === k ? "true" : undefined} className={chip(w.type === k)}>
            {k ? WISH_TYPES.find((t) => t.key === k)?.label : "全部"}
            <span className="font-display text-[13px] opacity-80">{typeCount(k)}</span>
          </Link>
        ))}
      </nav>

      <Form action="/wish" scroll={false} className="mt-4 flex flex-wrap items-end gap-3">
        {w.sort === "hot" && <input type="hidden" name="sort" value="hot" />}
        {w.type && <input type="hidden" name="type" value={w.type} />}
        <label className="block w-full sm:w-auto">
          <span className="text-[13px] font-black text-ink-soft">行政區</span>
          <select name="district" defaultValue={w.district ?? ""} className="mt-1 block h-11 w-full rounded-full border-2 border-edge bg-paper px-4 text-[15px] font-bold">
            <option value="">全部行政區</option>
            {WISH_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-0 flex-1 basis-40">
          <span className="text-[13px] font-black text-ink-soft">關鍵字</span>
          <input
            type="search"
            name="q"
            defaultValue={w.q}
            maxLength={30}
            placeholder="例如：公車、托育、公園"
            className="mt-1 block h-11 w-full rounded-full border-2 border-edge bg-paper px-4 text-[15px] font-bold"
          />
        </label>
        <button type="submit" className="btn btn-sm btn-ink !min-h-11">
          搜尋
        </button>
        {filtered && (
          <Link href={wallHref(w, { type: null, district: null, q: "" })} scroll={false} className="link-ink pb-2.5 text-[14px] font-bold text-ink">
            清除條件
          </Link>
        )}
      </Form>

      <p className="mt-6 text-[14px] font-bold text-ink-soft" role="status">
        {filtered ? `符合條件的願望有 ${data.total} 則` : `目前有 ${stats.total} 則公開的願望`}
      </p>

      {data.items.length === 0 ? (
        <PenguinSays pose="point" className="mt-8" bubbleClassName="max-w-md">
          {filtered ? "找不到符合條件的願望，換個條件看看吧。" : "還沒有人貼上願望。當第一個吧！"}
          {!filtered && open && (
            <a href="#write" className="link-ink mt-2 block text-teal-deep">
              寫下我的願望
            </a>
          )}
        </PenguinSays>
      ) : (
        <ul className="mt-8 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item, i) => (
            <li key={item.id}>
              <WishNote wish={item} index={i} open={open} />
            </li>
          ))}
        </ul>
      )}

      {data.items.length < data.total && w.limit < MAX && (
        <div className="mt-10 text-center">
          <Link href={wallHref(w, { limit: w.limit + PAGE })} scroll={false} className="btn">
            載入更多
          </Link>
        </div>
      )}
    </>
  );
}

export function WishWallSkeleton() {
  return (
    <div className="mt-8" aria-hidden="true">
      <div className="h-10 w-64 rounded-full bg-mist/70" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-60 rounded-[10px] bg-mist/50" />
        ))}
      </div>
    </div>
  );
}

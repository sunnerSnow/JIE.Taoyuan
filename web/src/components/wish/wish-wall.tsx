import Form from "next/form";
import Link from "next/link";
import { PenguinSays } from "@/components/art/speech";
import { WISH_DISTRICTS, WISH_TYPES, type WishType } from "@/lib/wish/options";
import { getWall, getWallStats, WALL_PAGE, type WallQuery } from "@/lib/wish/store";
import { PagedBoard } from "./paged-board";
import { pileLayout } from "./wish-art";
import { WishNote } from "./wish-note";

type SearchParams = Record<string, string | string[] | undefined>;

function parseWall(sp: SearchParams): WallQuery {
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).trim() : "");
  const type = WISH_TYPES.find((t) => t.key === one("type"))?.key ?? null;
  const district = (WISH_DISTRICTS as readonly string[]).includes(one("district")) ? one("district") : null;
  const page = Number(one("p"));
  return {
    sort: one("sort") === "hot" ? "hot" : "new",
    type,
    district,
    q: Array.from(one("q")).slice(0, 30).join(""),
    page: Number.isInteger(page) && page > 1 ? Math.min(page, 1000) : 1,
  };
}

/** 願望牆的網址：只帶非預設的條件；換條件就回到第一面，h=2 表示手機從這一頁的後半開始看 */
function wallHref(w: WallQuery, patch: Partial<WallQuery>, secondHalf = false) {
  const next = { ...w, page: 1, ...patch };
  const p = new URLSearchParams();
  if (next.sort === "hot") p.set("sort", "hot");
  if (next.type) p.set("type", next.type);
  if (next.district) p.set("district", next.district);
  if (next.q) p.set("q", next.q);
  if (next.page > 1) p.set("p", String(next.page));
  if (secondHalf) p.set("h", "2");
  const qs = p.toString();
  return qs ? `/wish?${qs}` : "/wish";
}

const chip = (on: boolean) =>
  `inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-[14px] font-black tracking-[0.04em] transition-colors ${
    on ? "border-teal-deep bg-teal-deep text-paper" : "border-edge bg-paper hover:bg-mint"
  }`;

/** 願望牆：最新／熱門、類型、行政區、關鍵字。條件都在網址上，可以直接分享 */
export async function WishWall({ searchParams, open, readable }: { searchParams: Promise<SearchParams>; open: boolean; readable: boolean }) {
  const sp = await searchParams;
  const w = parseWall(sp);

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
  const pages = Math.max(1, Math.ceil(data.total / WALL_PAGE));
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

      {data.items.length === 0 && data.total > 0 ? (
        <PenguinSays pose="point" className="mt-8" bubbleClassName="max-w-md">
          這一面沒有願望了。
          <Link href={`${wallHref(w, { page: 1 })}#wall`} className="link-ink mt-2 block text-teal-deep">
            回到第一面
          </Link>
        </PenguinSays>
      ) : data.items.length === 0 ? (
        <PenguinSays pose="point" className="mt-8" bubbleClassName="max-w-md">
          {filtered ? "找不到符合條件的願望，換個條件看看吧。" : "還沒有人貼上願望。當第一個吧！"}
          {!filtered && open && (
            <a href="#write" className="link-ink mt-2 block text-teal-deep">
              寫下我的願望
            </a>
          )}
        </PenguinSays>
      ) : (
        // 願望牆：一面 12 張（手機 6 張），便利貼歪歪的、錯開一點、邊緣互相壓住；越新的疊在越上面，滑過或聚焦時拿到最上層
        <PagedBoard
          key={`${wallHref(w, { page: w.page })}-${sp.h === "2" ? 2 : 1}`}
          page={w.page}
          pages={pages}
          total={data.total}
          count={data.items.length}
          initialHalf={sp.h === "2" ? 1 : 0}
          prevHref={w.page > 1 ? wallHref(w, { page: w.page - 1 }) : null}
          prevHalfHref={w.page > 1 ? wallHref(w, { page: w.page - 1 }, true) : null}
          nextHref={w.page < pages ? wallHref(w, { page: w.page + 1 }) : null}
        >
          {data.items.map((item, i) => {
            const p = pileLayout(item.id);
            return (
              <li
                key={item.id}
                className="wish-pin relative -my-2 mx-1 max-w-[calc(100vw-64px)] transition-[rotate,translate] duration-300 hover:!z-[300] focus-within:!z-[300] motion-safe:hover:!rotate-0 sm:-my-3 sm:mx-0"
                style={{
                  width: p.width,
                  zIndex: data.items.length - i,
                  rotate: `${p.tilt}deg`,
                  translate: `${p.dx}px ${p.dy}px`,
                  animationDelay: `${Math.min(i, 12) * 45}ms`,
                }}
              >
                <WishNote wish={item} open={open} stickerTilt={p.stickerTilt} />
              </li>
            );
          })}
        </PagedBoard>
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

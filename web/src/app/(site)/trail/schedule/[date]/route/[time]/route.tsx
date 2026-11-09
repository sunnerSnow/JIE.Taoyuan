import { ImageResponse } from "next/og";
import { routeMaps } from "@/data/route-maps";
import { routeSlug, schedule } from "@/data/schedule";
import { RouteMapCard, scheduleCardFonts } from "@/lib/schedule-card";
import { routeMapCardSize } from "@/lib/schedule-layout";

// 車隊掃街的路線圖卡：/trail/schedule/2026-11-05/route/0900，一場一張；完整路線在 ./list 的路線清單卡。地圖資料由 tools/route-map/build.py 產生（data/route-maps.ts）

export function generateStaticParams() {
  return schedule.flatMap((d) => d.items.filter((it) => routeMaps[`${d.date} ${it.time}`]).map((it) => ({ date: d.date, time: routeSlug(it.time) })));
}

export async function GET(_req: Request, ctx: RouteContext<"/trail/schedule/[date]/route/[time]">) {
  const { date, time } = await ctx.params;
  const item = schedule.find((d) => d.date === date)?.items.find((it) => routeSlug(it.time) === time);
  const map = item && routeMaps[`${date} ${item.time}`];
  if (!item || !map) return new Response("找不到這場車掃的路線圖", { status: 404 });
  return new ImageResponse(<RouteMapCard date={date} item={item} map={map} />, {
    ...routeMapCardSize(item, map),
    fonts: await scheduleCardFonts(),
    // 路線可能臨時更改，CDN 只快取一小時
    headers: { "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
  });
}

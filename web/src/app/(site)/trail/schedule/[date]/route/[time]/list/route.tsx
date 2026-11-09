import { ImageResponse } from "next/og";
import { routeMaps } from "@/data/route-maps";
import { routeSlug, schedule } from "@/data/schedule";
import { RouteListCard, scheduleCardFonts } from "@/lib/schedule-card";
import { routeListCardSize } from "@/lib/schedule-layout";

// 車隊掃街的路線清單卡：/trail/schedule/2026-11-05/route/0900/list，照號碼列出完整路線（號碼和上一層的路線圖卡一致）

export function generateStaticParams() {
  return schedule.flatMap((d) => d.items.filter((it) => routeMaps[`${d.date} ${it.time}`]).map((it) => ({ date: d.date, time: routeSlug(it.time) })));
}

export async function GET(_req: Request, ctx: RouteContext<"/trail/schedule/[date]/route/[time]/list">) {
  const { date, time } = await ctx.params;
  const item = schedule.find((d) => d.date === date)?.items.find((it) => routeSlug(it.time) === time);
  const map = item && routeMaps[`${date} ${item.time}`];
  if (!item || !map) return new Response("找不到這場車掃的路線清單", { status: 404 });
  return new ImageResponse(<RouteListCard date={date} item={item} map={map} />, {
    ...routeListCardSize(item, map),
    fonts: await scheduleCardFonts(),
    // 路線可能臨時更改，CDN 只快取一小時
    headers: { "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
  });
}

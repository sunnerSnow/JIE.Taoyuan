import { ImageResponse } from "next/og";
import { schedule } from "@/data/schedule";
import { ScheduleCard, scheduleCardFonts } from "@/lib/schedule-card";
import { scheduleCardSize } from "@/lib/schedule-layout";

// 行程預告的分享圖：/trail/schedule/2026-11-02，一天一張。杰伴出發頁上的預覽、分享與下載都用這一張

export function generateStaticParams() {
  return schedule.map((d) => ({ date: d.date }));
}

export async function GET(_req: Request, ctx: RouteContext<"/trail/schedule/[date]">) {
  const { date } = await ctx.params;
  const day = schedule.find((d) => d.date === date);
  if (!day) return new Response("找不到這一天的行程預告", { status: 404 });
  return new ImageResponse(<ScheduleCard day={day} />, {
    ...scheduleCardSize(day),
    fonts: await scheduleCardFonts(),
    // 行程隨時可能補上或更改，CDN 只快取一小時
    headers: { "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
  });
}

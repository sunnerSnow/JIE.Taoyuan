import { ImageResponse } from "next/og";
import { parseCardCode, sampleCardCodes } from "@/data/lab";
import { StoryCard, cardFonts } from "@/lib/card-image";

// 「下載分享圖」的直式桃園卡（1080×1620）：和頁面上的卡片同一個版型，存到手機就能發限時動態

const WIDTH = 1080;

export function generateStaticParams() {
  return sampleCardCodes().map((code) => ({ code }));
}

export async function GET(_req: Request, ctx: RouteContext<"/lab/card/[code]/story">) {
  const picks = parseCardCode((await ctx.params).code);
  if (!picks) return new Response("找不到這張桃園卡", { status: 404 });
  // 沒有預先產生的組合每次都要重畫：交給 CDN 快取一天，過期後先給舊圖、背景再更新
  return new ImageResponse(<StoryCard picks={picks} width={WIDTH} />, {
    width: WIDTH,
    height: WIDTH * 1.5,
    fonts: await cardFonts(),
    headers: { "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800" },
  });
}

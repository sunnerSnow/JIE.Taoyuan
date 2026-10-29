import { ImageResponse } from "next/og";
import { categories } from "@/data/categories";
import { easyCardTheme } from "@/data/easy";
import { themePolicies } from "@/data/lab";
import { EasyStoryCard, easyCardFonts } from "@/lib/easy-card";

// 大字版圖卡的圖檔（900×1600）：/easy/card/類別/政見 id，一張一項政見。圖卡頁上的預覽、分享與下載都用這一張

const WIDTH = 900;

export function generateStaticParams() {
  return categories.flatMap((c) => themePolicies(c.slug).map((p) => ({ theme: c.slug, id: p.id })));
}

export async function GET(_req: Request, ctx: RouteContext<"/easy/card/[theme]/[id]">) {
  const params = await ctx.params;
  const theme = easyCardTheme(params.theme);
  const list = theme ? themePolicies(theme) : [];
  const index = list.findIndex((p) => p.id === params.id);
  if (index < 0) return new Response("找不到這張圖卡", { status: 404 });
  return new ImageResponse(<EasyStoryCard policy={list[index]} index={index} total={list.length} width={WIDTH} />, {
    width: WIDTH,
    height: (WIDTH * 16) / 9,
    fonts: await easyCardFonts(),
    headers: { "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800" },
  });
}

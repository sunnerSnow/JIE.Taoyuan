import { ImageResponse } from "next/og";
import { categories } from "@/data/categories";
import { easyCardTheme } from "@/data/easy";
import { EasyWideCard, easyCardFonts } from "@/lib/easy-card";

// 大字版圖卡頁的連結預覽：左邊是這一類的政見短標題，右邊是插畫（版型在 lib/easy-card.tsx）

export const alt = "JIE.Taoyuan 杰伴桃園：大字版政見圖卡";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return categories.map((c) => ({ theme: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ theme: string }> }) {
  const theme = easyCardTheme((await params).theme) ?? categories[0].slug;
  return new ImageResponse(<EasyWideCard theme={theme} />, { ...size, fonts: await easyCardFonts() });
}

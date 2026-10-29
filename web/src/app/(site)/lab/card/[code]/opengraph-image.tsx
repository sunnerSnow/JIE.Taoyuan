import { ImageResponse } from "next/og";
import { parseCardCode, sampleCardCodes } from "@/data/lab";
import { WideCard, cardFonts } from "@/lib/card-image";

// 桃園卡的分享預覽圖：左邊是三塊積木，右邊是插畫「企鵝不捨 桃園第①」（版型在 lib/card-image.tsx）

export const alt = "JIE.Taoyuan 杰伴桃園：我探索的桃園";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return sampleCardCodes().map((code) => ({ code }));
}

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const card = parseCardCode((await params).code) ?? parseCardCode(sampleCardCodes()[0])!;
  return new ImageResponse(<WideCard theme={card.theme} picks={card.picks} />, { ...size, fonts: await cardFonts() });
}

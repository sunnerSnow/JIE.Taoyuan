import type { CategorySlug } from "@/data/types";
import { buildIsland } from "./scene";

/**
 * 分享圖用的 Noto Sans TC：next/og 的排版引擎不吃 woff2，所以向 Google Fonts 要只含這些字的 TTF 子集（OFL 授權）。
 * 不帶瀏覽器 User-Agent 時，Google Fonts 會回 TTF。結果快取起來，build 時每組文字只抓一次。
 */
export async function loadNotoSansTC(text: string, weight: 700 | 900): Promise<ArrayBuffer> {
  "use cache";
  const chars = [...new Set(text)].join("");
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@${weight}&text=${encodeURIComponent(chars)}`)).text();
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!src) throw new Error("無法從 Google Fonts 取得 Noto Sans TC");
  return (await fetch(src)).arrayBuffer();
}

/** 把島嶼插畫轉成 SVG data URI（分享圖不支援 non-scaling-stroke，所以依顯示寬度換算線寬） */
export function islandImage(slug: CategorySlug, displayWidth: number) {
  const { shapes, viewBox: vb } = buildIsland(slug);
  const unit = vb.w / displayWidth;
  const paths = shapes
    .map((s) => {
      const attrs = [`d="${s.d}"`, `fill="${s.fill}"`];
      if (s.stroke) {
        attrs.push(`stroke="${s.stroke}"`, `stroke-width="${((s.sw ?? 1) * 1.6 * unit).toFixed(3)}"`, `stroke-linejoin="round"`);
        if (s.dash) attrs.push(`stroke-dasharray="${s.dash.split(" ").map((n) => (Number(n) * 3 * unit).toFixed(2)).join(" ")}"`);
        if (s.cap) attrs.push(`stroke-linecap="${s.cap}"`);
      }
      if (s.opacity !== undefined) attrs.push(`opacity="${s.opacity}"`);
      return `<path ${attrs.join(" ")}/>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}">${paths}</svg>`;
  return { src: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`, height: Math.round((displayWidth * vb.h) / vb.w) };
}

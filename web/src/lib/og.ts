import type { CategorySlug } from "@/data/types";
import { flatStroke } from "./iso";
import { buildIsland } from "./scene";

/** build 時同時產生幾十張分享圖，偶爾會被斷線，失敗就退避重試 */
async function fetchRetry(url: string, tries = 4): Promise<Response> {
  for (let i = 0; ; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      if (i >= tries - 1) throw err;
      await new Promise((r) => setTimeout(r, 600 * 2 ** i));
    }
  }
}

/**
 * 分享圖用的字型：next/og 的排版引擎不吃 woff2，所以向 Google Fonts 要只含這些字的 TTF 子集（OFL 授權）。
 * 不帶瀏覽器 User-Agent 時，Google Fonts 會回 TTF。呼叫端傳入「所有分享圖用得到的字」，同一個 build 只抓一次並快取。
 */
export async function loadGoogleFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  "use cache";
  const chars = [...new Set(text)].sort().join("");
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(chars)}`;
  const css = await (await fetchRetry(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!src) throw new Error(`無法從 Google Fonts 取得 ${family}`);
  return (await fetchRetry(src)).arrayBuffer();
}

/** 把島嶼插畫轉成 SVG data URI（分享圖不支援 non-scaling-stroke，所以依顯示寬度換算線寬） */
export function islandImage(slug: CategorySlug, displayWidth: number) {
  const { shapes, viewBox: vb } = buildIsland(slug);
  const unit = vb.w / displayWidth;
  const paths = shapes
    .map((s) => {
      const attrs = [`d="${s.d}"`, `fill="${s.fill}"`];
      const line = flatStroke(s, 1.6 * unit);
      if (line.stroke) {
        attrs.push(`stroke="${line.stroke}"`, `stroke-width="${(line.width ?? 0).toFixed(3)}"`, `stroke-linejoin="round"`);
        if (line.dash) attrs.push(`stroke-dasharray="${line.dash.split(" ").map((n) => (Number(n) * 3 * unit).toFixed(2)).join(" ")}"`);
        if (s.cap) attrs.push(`stroke-linecap="${s.cap}"`);
      }
      if (s.opacity !== undefined) attrs.push(`opacity="${s.opacity}"`);
      return `<path ${attrs.join(" ")}/>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}">${paths}</svg>`;
  return { src: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`, height: Math.round((displayWidth * vb.h) / vb.w) };
}

import type { RouteMap } from "@/data/route-maps";

// 車隊掃街路線圖的底圖（只在伺服器端用）：扁平風格，米色底、白色道路分三級、灰色虛線鐵路、珊瑚色路線加白色行進箭頭。
// 路名標籤和起點另外疊在圖上（next/og 把 SVG 當圖片畫，裡面的文字用不到網頁字型）。

export const ROUTE_COLORS = { ground: "#EFE7D6", road: "#FFFFFF", rail: "#8E9C9B", route: "#DE6447", start: "#007A74" };

export function routeMapSvg(m: RouteMap) {
  const c = ROUTE_COLORS;
  const stroke = (d: string, color: string, width: number, extra = "") =>
    d ? `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${extra}/>` : "";
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${m.width} ${m.height}">`,
    `<rect width="${m.width}" height="${m.height}" fill="${c.ground}"/>`,
    stroke(m.minor, c.road, 3.5),
    stroke(m.mid, c.road, 7),
    stroke(m.major, c.road, 11),
    stroke(m.rail, c.rail, 4, ` stroke-dasharray="12 9"`),
    stroke(m.route, c.road, 22),
    stroke(m.route, c.route, 12),
    stroke(m.arrows, c.road, 3.6),
    "</svg>",
  ].join("");
}

export const routeMapDataUri = (m: RouteMap) => `data:image/svg+xml;base64,${Buffer.from(routeMapSvg(m)).toString("base64")}`;

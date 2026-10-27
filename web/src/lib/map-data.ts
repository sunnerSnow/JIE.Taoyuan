import { categories, categoryColor } from "@/data/categories";
import { policiesIn } from "@/data/policies";
import type { CategorySlug, PolicyStatus } from "@/data/types";
import { buildIsland, buildWorld, type PinPos } from "./scene";
import type { IsoBounds } from "./iso";

// 把插畫座標換成百分比，給 HTML 疊在 SVG 上的名牌、圖釘使用

export type IslandPin = {
  slug: CategorySlug;
  no: string;
  name: string;
  short: string;
  tagline: string;
  color: string;
  x: number;
  y: number;
  count: number;
  frame: { x: number; y: number; w: number; h: number };
};

export type SpotPin = { slug: string; title: string; status: PolicyStatus; n: number; x: number; y: number };

const pct = (p: PinPos, vb: IsoBounds) => ({
  x: ((p.x - vb.x) / vb.w) * 100,
  y: ((p.y - vb.y) / vb.h) * 100,
});

export function worldPins() {
  const world = buildWorld();
  const vb = world.viewBox;
  const islands: IslandPin[] = categories.map((c) => {
    const f = world.frames[c.slug];
    return {
      slug: c.slug,
      no: c.no,
      name: c.name,
      short: c.short,
      tagline: c.tagline,
      color: categoryColor[c.slug].base,
      ...pct(world.anchors[c.slug], vb),
      count: policiesIn(c.slug).length,
      frame: { x: ((f.x - vb.x) / vb.w) * 100, y: ((f.y - vb.y) / vb.h) * 100, w: (f.w / vb.w) * 100, h: (f.h / vb.h) * 100 },
    };
  });
  const spots = Object.fromEntries(
    categories.map((c) => [
      c.slug,
      policiesIn(c.slug).map((p, i) => ({
        slug: p.slug,
        title: p.title,
        status: p.status,
        n: i + 1,
        ...pct(world.spots[c.slug][p.spot] ?? world.anchors[c.slug], vb),
      })),
    ]),
  ) as Record<CategorySlug, SpotPin[]>;
  /** 沿著島的前緣平均排開 n 個位置（兩端各留一點空），給市民（虛構情境）站 */
  const alongRim = (slug: CategorySlug, n: number) => {
    const [a, b, c] = world.rims[slug].map((p) => pct(p, vb));
    const l1 = Math.hypot(b.x - a.x, b.y - a.y);
    const l2 = Math.hypot(c.x - b.x, c.y - b.y);
    return Array.from({ length: n }, (_, i) => {
      const d = (0.06 + (0.88 * (i + 0.5)) / n) * (l1 + l2);
      if (d <= l1) return { x: a.x + ((b.x - a.x) * d) / l1, y: a.y + ((b.y - a.y) * d) / l1 };
      const t = (d - l1) / l2;
      return { x: b.x + (c.x - b.x) * t, y: b.y + (c.y - b.y) * t };
    });
  };
  /** 地圖上任意螢幕座標（插畫單位）換成百分比，用來擺企鵝、裝飾 */
  const at = (sx: number, sy: number) => pct({ x: sx, y: sy }, vb);
  return { world, islands, spots, alongRim, ratio: vb.w / vb.h, at };
}

export function islandSpots(slug: CategorySlug) {
  const art = buildIsland(slug);
  const spots: SpotPin[] = policiesIn(slug).map((p, i) => ({
    slug: p.slug,
    title: p.title,
    status: p.status,
    n: i + 1,
    ...pct(art.spots[p.spot], art.viewBox),
  }));
  return { art, spots };
}

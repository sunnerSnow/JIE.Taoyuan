import type { Metadata } from "next";
import { IsoSvg } from "@/components/art/iso-svg";
import { ExploreApp, type ExploreIsland } from "@/components/explore/explore-app";
import { categories, categoryColor } from "@/data/categories";
import { policiesIn, sourceTypeLabel } from "@/data/policies";
import { relations } from "@/data/relations";
import { worldPins } from "@/lib/map-data";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "探索政策島",
  description: "點一座島，走進生活場景。交通、育兒家庭、健康共好、宜居環境、未來發展五座政策島，每一項政策都附上狀態與來源。",
  path: "/explore",
});

export default function ExplorePage() {
  const { world, islands, spots, ratio } = worldPins();
  const data: ExploreIsland[] = categories.map((c) => {
    const pin = islands.find((p) => p.slug === c.slug)!;
    return {
      pin,
      tagline: c.tagline,
      intro: c.intro,
      topics: c.topics,
      penguinTip: c.penguinTip,
      soft: categoryColor[c.slug].soft,
      policies: policiesIn(c.slug).map((p, i) => ({
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        status: p.status,
        n: i + 1,
        spot: p.spot,
        sample: !!p.sample,
        sourceLabel: sourceTypeLabel[p.sourceType],
        sourceTitle: p.sourceTitle,
        sourceUrl: p.sourceUrl,
        publishedAt: p.publishedAt,
        verifiedAt: p.retrievedAt,
        updatedAt: p.updatedAt,
        audience: p.audience,
        extraSources: p.extraSources?.length ?? 0,
        tags: p.tags ?? [],
        keywords: [...(p.approach ?? []), ...(p.pillars ?? []).flatMap((x) => [x.title, x.tagline ?? "", ...x.items])].join(" "),
      })),
      spots: spots[c.slug],
    };
  });

  return (
    <main id="main">
      <h1 className="sr-only">探索桃園政策島</h1>
      <ExploreApp
        islands={data}
        ratio={ratio}
        relations={relations}
        map={<IsoSvg shapes={world.shapes} viewBox={world.viewBox} className="absolute inset-0 h-full" label="桃園政策島插畫" />}
      />
    </main>
  );
}

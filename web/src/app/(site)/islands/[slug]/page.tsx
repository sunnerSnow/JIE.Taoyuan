import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IsoSvg } from "@/components/art/iso-svg";
import { PenguinSays } from "@/components/art/speech";
import { IslandPins } from "@/components/map/island-pins";
import { PolicyCard } from "@/components/policy/policy-card";
import { JsonLd } from "@/components/site/json-ld";
import { Breadcrumbs } from "@/components/site/page-head";
import { SampleNotice } from "@/components/site/sample-notice";
import { ArrowCurve, ArrowRight, Scallop, Squiggle } from "@/components/ui/decor";
import { categories, categoryColor, getCategory } from "@/data/categories";
import { policiesIn } from "@/data/policies";
import { islandGraph } from "@/lib/jsonld";
import { islandSpots } from "@/lib/map-data";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/islands/[slug]">): Promise<Metadata> {
  const category = getCategory((await params).slug);
  if (!category) return {};
  const topic = `${site.candidate.name}的${category.short}政見`;
  return pageMetadata({
    title: `${category.name}｜${topic}`,
    description: `${topic}（${policiesIn(category.slug).length} 項）：${category.tagline}${category.intro}`,
    path: `/islands/${category.slug}`,
  });
}

// 網址參數不放進 Suspense：理由同政見詳情頁（主內容要留在原位，不串流到頁尾後的 hidden 區塊）
export const instant = false;

export default async function IslandPage({ params }: PageProps<"/islands/[slug]">) {
  const category = getCategory((await params).slug);
  if (!category) notFound();

  const color = categoryColor[category.slug];
  const list = policiesIn(category.slug);
  const { art, spots } = islandSpots(category.slug);
  const others = categories.filter((c) => c.slug !== category.slug);

  return (
    <>
      <JsonLd data={islandGraph(category, list)} />
      <section aria-labelledby="island-title" className="relative overflow-hidden border-b-2 border-edge" style={{ background: color.soft }}>
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-4 pb-14 pt-28 sm:px-6 sm:pt-32 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <div>
            <Breadcrumbs items={[{ href: "/", label: "首頁" }, { href: "/explore", label: "探索政策島" }]} current={category.name} />
            <div className="mt-8 flex items-center gap-4">
              <Scallop color={color.base} size={64} className="text-[17px]">
                {category.no}
              </Scallop>
              <div>
                <p className="eyebrow flex items-center gap-3">
                  Policy Island {category.no}
                  <Squiggle className="h-2.5 w-12" color="#00A6A1" />
                </p>
                <h1 id="island-title" className="section-title">
                  {category.name}
                </h1>
              </div>
            </div>
            <p className="mt-6 text-[18px] font-black leading-relaxed tracking-[0.06em]">{category.tagline}</p>
            <p className="mt-3 max-w-xl text-[15.5px] leading-[1.9] text-ink-soft">{category.intro}</p>
            <h2 className="mt-6 text-[13px] font-bold tracking-[0.2em] text-teal-deep">可能涵蓋</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {category.topics.map((t) => (
                <li key={t} className="chip border-2 border-edge !bg-paper">
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/explore?island=${category.slug}`} className="btn btn-sun">
                在地圖上看這座島
                <ArrowCurve className="h-5 w-5" />
              </Link>
              <Link href="#island-policies" className="btn">
                看 {list.length} 項政策
              </Link>
            </div>
          </div>

          {/* 島嶼插畫＋政策圖釘（編號對應下方卡片） */}
          <div className="relative mx-auto w-full max-w-[560px]">
            <IsoSvg shapes={art.shapes} viewBox={art.viewBox} label={`${category.name}插畫：${category.scenes.join("、")}`} />
            <IslandPins spots={spots} color={color.base} label={`${category.name}的政策圖釘`} />
          </div>
        </div>
      </section>

      <section id="island-policies" aria-labelledby="island-policies-title" className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 id="island-policies-title" className="section-title !text-[clamp(24px,3.4vw,36px)]">
                這座島上的政策
              </h2>
              <p className="mt-2 text-[15px] text-ink-soft">
                共 {list.length} 項。編號對應上方插畫的圖釘，每一項都標示狀態、來源與更新日期。
              </p>
            </div>
            <PenguinSays pose="point" penguinClassName="h-24 w-20" bubbleClassName="max-w-sm text-[14px]">
              {category.penguinTip}
            </PenguinSays>
          </div>
          <SampleNotice className="mt-8" />
          {list.length > 0 ? (
            <ol className="mt-8 grid gap-6 md:grid-cols-2">
              {list.map((p, i) => (
                <li key={p.id}>
                  <PolicyCard policy={p} n={i + 1} />
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-8 rounded-2xl border-2 border-dashed border-teal-deep/30 bg-paper p-6 text-center text-ink-soft">
              這座島的政策還在整理中，目前尚無可查證資訊。
            </p>
          )}
        </div>
      </section>

      <nav aria-labelledby="other-islands-title" className="border-t-2 border-edge bg-paper py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h2 id="other-islands-title" className="text-[20px] font-black tracking-[0.08em]">
            繼續逛其他島
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/islands/${c.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border-2 border-edge p-4 shadow-soft transition-transform hover:-translate-y-0.5"
                  style={{ background: categoryColor[c.slug].soft }}
                >
                  <Scallop color={categoryColor[c.slug].base} size={44} className="text-[12px]">
                    {c.no}
                  </Scallop>
                  <span className="flex-1">
                    <span className="block text-[16px] font-black tracking-[0.06em]">{c.name}</span>
                    <span className="block text-[12.5px] leading-snug text-ink-soft">{c.tagline}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

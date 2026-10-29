import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { type EasyCard, EasyCards } from "@/components/easy/easy-cards";
import { PageSkeleton } from "@/components/site/page-skeleton";
import { categories, categoryColor, categoryMap } from "@/data/categories";
import { easyCardTheme, easyPoints } from "@/data/easy";
import { themePolicies } from "@/data/lab";
import { shortTitle } from "@/data/policies";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

// 大字版圖卡：一類政見有幾項就有幾張圖（一張一項，字才夠大），給長輩傳給家人朋友。圖檔在 ./[id]，連結預覽在 ./opengraph-image。
// 內容和大字版頁面重複，不讓搜尋引擎收錄。

export function generateStaticParams() {
  return categories.map((c) => ({ theme: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/easy/card/[theme]">): Promise<Metadata> {
  const theme = easyCardTheme((await params).theme);
  if (!theme) return {};
  const short = categoryMap[theme].short;
  return {
    ...pageMetadata({
      title: `大字版圖卡：${site.candidate.name}的${short}政見`,
      description: `${short}：${themePolicies(theme)
        .map((p) => shortTitle(p.title))
        .join("、")}。字大好讀的政見重點，可以傳給家人朋友。`,
      path: `/easy/card/${theme}`,
      ownImage: true,
    }),
    robots: { index: false, follow: true },
  };
}

export default function EasyCardPage({ params }: PageProps<"/easy/card/[theme]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CardContent params={params} />
    </Suspense>
  );
}

async function CardContent({ params }: { params: PageProps<"/easy/card/[theme]">["params"] }) {
  const theme = easyCardTheme((await params).theme);
  if (!theme) notFound();
  const short = categoryMap[theme].short;
  const cards: EasyCard[] = themePolicies(theme).map((p, i) => ({
    id: p.id,
    title: shortTitle(p.title),
    alt: `${short}第 ${i + 1} 張圖卡：${shortTitle(p.title)}。${easyPoints[p.id].join("。")}`,
    image: `/easy/card/${theme}/${p.id}`,
    fileName: `黃世杰政見-${short}-${i + 1}-${shortTitle(p.title)}`,
  }));

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-[1100px] px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
        <Link href={`/easy#easy-${theme}`} className="inline-flex min-h-[48px] items-center text-[20px] font-black text-teal-deep underline decoration-2 underline-offset-[6px]">
          <span aria-hidden="true" className="mr-1.5">
            ←
          </span>
          回大字版
        </Link>
        <h1 className="mt-4 text-[34px] font-black leading-tight tracking-[0.06em] text-teal-deep sm:text-[42px]">「{short}」圖卡</h1>
        <p className="mt-3 text-[21px] font-bold leading-relaxed">
          共 {cards.length} 張，一張一項政見。
          <br />
          可以挑一張傳，也可以全部一起傳給家人朋友。
        </p>

        <div className="mt-8">
          {/* 換類別時重新建立：上一類抓好的圖不會留到這一類 */}
          <EasyCards key={theme} cards={cards} title={`${site.candidate.name}的${short}政見重點`} pageUrl={new URL(`/easy/card/${theme}`, site.url).toString()} />
        </div>

        <div className="mt-16 max-w-[720px]">
          <h2 className="text-[24px] font-black">其他類別的圖卡</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {categories
              .filter((c) => easyCardTheme(c.slug))
              .map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/easy/card/${c.slug}`}
                    aria-current={c.slug === theme ? "page" : undefined}
                    className={`flex min-h-[60px] items-center gap-3 rounded-2xl border-2 px-4 text-[21px] font-black ${
                      c.slug === theme ? "border-teal-deep" : "border-edge"
                    }`}
                    style={{ background: categoryColor[c.slug].soft }}
                  >
                    <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: categoryColor[c.slug].base }} aria-hidden="true" />
                    {c.short}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

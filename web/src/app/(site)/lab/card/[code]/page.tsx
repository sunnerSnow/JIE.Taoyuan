import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { IsoSvg } from "@/components/art/iso-svg";
import { Brick } from "@/components/lab/brick";
import { Stepper } from "@/components/lab/stepper";
import { PolicyCard } from "@/components/policy/policy-card";
import { ShareButtons } from "@/components/policy/share-buttons";
import { PageHead } from "@/components/site/page-head";
import { PageSkeleton } from "@/components/site/page-skeleton";
import { ArrowCurve } from "@/components/ui/decor";
import { categoryColor, categoryMap } from "@/data/categories";
import { allCardCodes, labThemes, parseCardCode } from "@/data/lab";
import { shortTitle, sourceTypeLabel } from "@/data/policies";
import { pageMetadata } from "@/lib/metadata";
import { buildIsland } from "@/lib/scene";
import { site } from "@/lib/site";

// 桃園卡：「3 分鐘，拼出你心中的桃園」的成果頁。網址就是卡片內容（三項政見的 id），分享出去會直接打開同一張卡。
// 卡片只寫探索了哪些政見，不推斷或標示任何人的政治立場。

export function generateStaticParams() {
  return allCardCodes().map((code) => ({ code }));
}

export async function generateMetadata({ params }: PageProps<"/lab/card/[code]">): Promise<Metadata> {
  const { code } = await params;
  const card = parseCardCode(code);
  if (!card) return {};
  const theme = labThemes[card.theme];
  return {
    ...pageMetadata({
      title: `我探索的桃園：${theme.label}`,
      description: `用 3 分鐘探索「${theme.label}」：${card.picks.map((p) => shortTitle(p.title)).join("、")}。每項政見都附來源，你也可以拼一張自己的桃園卡。`,
      path: `/lab/card/${code}`,
      ownImage: true,
    }),
    // 幾十種組合內容大同小異，是給人分享用的，不讓搜尋引擎收錄
    robots: { index: false, follow: true },
  };
}

export default function CardPage({ params }: PageProps<"/lab/card/[code]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CardContent params={params} />
    </Suspense>
  );
}

async function CardContent({ params }: { params: PageProps<"/lab/card/[code]">["params"] }) {
  const { code } = await params;
  const card = parseCardCode(code);
  if (!card) notFound();

  const island = categoryMap[card.theme];
  const color = categoryColor[card.theme];
  const theme = labThemes[card.theme];
  const art = buildIsland(card.theme);

  return (
    <>
      <PageHead
        title="我探索的桃園"
        eyebrow="Penguin Lab"
        crumbs={[{ href: "/lab", label: "3 分鐘，拼出你心中的桃園" }]}
        lead="這是一張「3 分鐘，拼出你心中的桃園」探索成果卡。你也可以選一個生活主題，拼一張自己的。"
      />

      <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-6 sm:py-16">
        <Stepper at={2} />

        <figure aria-labelledby="taoyuan-card-title" className="mt-8 overflow-hidden rounded-[32px] border-2 border-edge bg-paper shadow-lift">
          <div className="grid md:grid-cols-[1fr_320px]">
            <div className="p-6 sm:p-9">
              <p className="text-[13px] font-black tracking-[0.14em] text-teal-deep">3 分鐘，拼出你心中的桃園</p>
              <h2 id="taoyuan-card-title" className="mt-2 text-[34px] font-black leading-tight tracking-[0.08em] text-teal-deep sm:text-[42px]">
                我探索的桃園
              </h2>
              <p className="chip mt-4" style={{ background: color.soft }}>
                <span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-edge" style={{ background: color.base }} aria-hidden="true" />
                {theme.label}・{island.name}
              </p>
              <ol className="mt-6 space-y-4">
                {card.picks.map((p) => (
                  <li key={p.id} className="flex items-center gap-4">
                    <Brick color={color.base} className="h-10 w-14 shrink-0" />
                    <span className="min-w-0">
                      <Link href={`/policies/${p.slug}`} className="block text-[18px] font-black leading-snug tracking-[0.04em] hover:underline">
                        {shortTitle(p.title)}
                      </Link>
                      <span className="block text-[13px] font-bold text-ink-soft">{sourceTypeLabel[p.sourceType]}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="relative hidden place-items-center overflow-hidden md:grid" style={{ background: color.soft }} aria-hidden="true">
              <div className="absolute right-8 top-8 h-20 w-20 rounded-full bg-sun/90" />
              <IsoSvg shapes={art.shapes} viewBox={art.viewBox} className="relative w-[280px]" />
            </div>
          </div>
          <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t-2 border-dashed border-teal-deep/20 px-6 py-4 text-[12.5px] font-bold text-ink-soft sm:px-9">
            <span>
              <span className="font-display text-[16px] tracking-normal text-teal">JIE.Taoyuan</span> 杰伴桃園・{new URL(site.url).host}
            </span>
            <span>{site.stance}</span>
          </figcaption>
        </figure>

        <div className="mt-6">
          <ShareButtons title={`我探索的桃園：${theme.label}`} fileName={`JIE.Taoyuan-${code}`} label="分享這張桃園卡" />
          <p className="mt-3 text-[13.5px] text-ink-soft">分享出去的連結會直接打開這張桃園卡。</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/lab" className="btn btn-sun">
            換個主題再探索
            <ArrowCurve className="h-5 w-5" />
          </Link>
          <Link href={`/explore?island=${card.theme}`} className="btn">
            繼續看政策
          </Link>
        </div>
      </div>

      <section aria-labelledby="picks-title" className="border-t-2 border-edge bg-paper py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h2 id="picks-title" className="text-[22px] font-black tracking-[0.08em]">
            這張卡上的 3 項政見
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">主題與政策島的對應是本站整理；政見內容以原始來源為準，每張卡片點進去都有完整來源。</p>
          <ul className="mt-6 grid gap-6 md:grid-cols-3">
            {card.picks.map((p) => (
              <li key={p.id}>
                <PolicyCard policy={p} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

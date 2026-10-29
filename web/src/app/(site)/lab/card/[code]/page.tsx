import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Stepper } from "@/components/lab/stepper";
import { TaoyuanCard } from "@/components/lab/taoyuan-card";
import { PolicyCard } from "@/components/policy/policy-card";
import { ShareButtons } from "@/components/policy/share-buttons";
import { PageHead } from "@/components/site/page-head";
import { PageSkeleton } from "@/components/site/page-skeleton";
import { ArrowCurve } from "@/components/ui/decor";
import { allCardCodes, labThemes, parseCardCode } from "@/data/lab";
import { shortTitle } from "@/data/policies";
import { pageMetadata } from "@/lib/metadata";

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
  const theme = labThemes[card.theme];

  return (
    <>
      <PageHead
        title="我探索的桃園"
        eyebrow="Penguin Lab"
        crumbs={[{ href: "/lab", label: "3 分鐘，拼出你心中的桃園" }]}
        lead="這是一張「3 分鐘，拼出你心中的桃園」探索成果卡。你也可以選一個生活主題，挑 3 項政見拼一張自己的。"
      />

      <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-6 sm:py-16">
        <Stepper at={2} />

        <div className="mt-8 grid items-start gap-8 md:grid-cols-[minmax(0,420px)_1fr] md:gap-10">
          <TaoyuanCard theme={card.theme} picks={card.picks} />

          <div className="md:pt-4">
            <h2 className="text-[22px] font-black tracking-[0.06em]">分享這張桃園卡</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
              分享出去的連結會直接打開這張卡。「下載分享圖」是直式的卡片圖，存到手機就能發限時動態。
            </p>
            <div className="mt-5">
              <ShareButtons title={`我探索的桃園：${theme.label}`} fileName={`JIE.Taoyuan-${code}`} image={`/lab/card/${code}/story`} label="分享這張桃園卡" />
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

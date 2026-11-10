import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PenguinSays } from "@/components/art/speech";
import { Breadcrumbs } from "@/components/site/page-head";
import { ArrowCurve, Squiggle } from "@/components/ui/decor";
import { FloatingNote, NOTE_STYLE, TypeIcon } from "@/components/wish/wish-art";
import { WishForm } from "@/components/wish/wish-form";
import { WishWall, WishWallSkeleton } from "@/components/wish/wish-wall";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { wishConfig } from "@/lib/wish/config";
import { REPORT_HIDE_AT, WISH_TYPES } from "@/lib/wish/options";

export const metadata: Metadata = pageMetadata({
  title: "杰個願望 JIE WISH",
  description: `每個願望，都值得被聽見。給${site.candidate.name}一句加油、對桃園許下心願、說出生活裡的問題，或提出讓生活更好的點子。`,
  path: "/wish",
});

/** 留言規範：表單的同意勾選會連到這裡 */
const RULES = [
  "歡迎加油打氣、對桃園的期待、生活裡遇到的問題，以及具體的改善點子。",
  "不要留下個人資料：電話、身分證字號、email、住址，自己的和別人的都一樣。",
  "不放網址和廣告。",
  "不攻擊、不謾罵，也不寫沒有查證的指控；負評、比較或攻擊其他候選人的內容不會公開。",
  "送出時系統會自動檢查：符合規範的留言直接貼上願望牆，不符合的不會公開，可以修改後再送。",
  `已經公開的留言如果有問題，請按「檢舉」；被 ${REPORT_HIDE_AT} 個以上的人檢舉會先下架，志工團隊也會下架不當內容。`,
];

export default function WishPage({ searchParams }: PageProps<"/wish">) {
  const cfg = wishConfig();
  return (
    <>
      <div className="relative overflow-hidden border-b-2 border-edge" style={{ background: "linear-gradient(180deg, #FFF9DC 0%, #F1FAF9 100%)" }}>
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-8 px-4 pb-14 pt-28 sm:px-6 sm:pt-32 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Breadcrumbs items={[{ href: "/", label: "首頁" }]} current="杰個願望" />
            <h1 className="section-title mt-6">杰個願望</h1>
            <p className="eyebrow mt-2 flex items-center gap-3">
              JIE WISH
              <Squiggle className="h-2.5 w-12" color="#00A6A1" />
            </p>
            <p className="mt-6 text-[clamp(21px,2.8vw,30px)] font-black leading-snug tracking-[0.08em] text-teal-deep">每個願望，都值得被聽見。</p>
            <p className="mt-4 max-w-xl text-[15.5px] leading-[1.9] text-ink-soft">
              桃園有什麼地方可以更好？你有什麼期待想實現？
              <br />給{site.candidate.name.slice(1)}一句加油，或留下你對桃園的願望吧！
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#write" className="btn btn-sun">
                寫下我的願望
                <ArrowCurve className="h-4 w-4" />
              </a>
              <a href="#wall" className="btn">
                看看大家的願望
              </a>
            </div>
          </div>
          <div className="relative mx-auto h-[300px] w-full max-w-[400px] sm:h-[340px]" aria-hidden="true">
            <FloatingNote color="#FFF5C4" className="anim-bob left-[6%] top-[2%] h-14 w-14" style={{ rotate: "-8deg" }} />
            <FloatingNote color="#FBE4D8" className="anim-bob right-[6%] top-0 h-12 w-12 [animation-delay:-1.2s]" style={{ rotate: "10deg" }} />
            <FloatingNote color="#D3EEEC" className="anim-bob left-[38%] top-[-2%] h-10 w-10 [animation-delay:-2.4s]" style={{ rotate: "6deg" }} />
            {/* 插畫「小企鵝開吉普車」（使用者提供，tools/wish-stickers/cutout.py 去背） */}
            <Image
              src="/wish/jeep-hero.png"
              alt=""
              width={720}
              height={572}
              loading="eager"
              sizes="(min-width: 1024px) 380px, 320px"
              className="absolute bottom-0 left-1/2 w-[86%] max-w-[380px] -translate-x-1/2"
            />
          </div>
        </div>
      </div>

      <section aria-labelledby="entries-title" className="mx-auto max-w-[1200px] px-4 pt-14 sm:px-6">
        <h2 id="entries-title" className="section-title !text-[clamp(24px,3.2vw,34px)]">
          想說什麼，都可以
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WISH_TYPES.map((t) => (
            <li key={t.key}>
              <a
                href={`#write-${t.key}`}
                className="group flex h-full flex-col rounded-[22px] border-2 border-edge p-5 shadow-soft transition-transform duration-300 hover:-translate-y-1"
                style={{ background: NOTE_STYLE[t.key].paper }}
              >
                <span className="grid h-11 w-11 place-items-center rounded-full" style={{ background: NOTE_STYLE[t.key].tag, color: NOTE_STYLE[t.key].tagText }}>
                  <TypeIcon type={t.key} className="h-6 w-6" />
                </span>
                <span className="mt-4 text-[20px] font-black tracking-[0.08em]">{t.label}</span>
                <span className="mt-1 text-[15px] font-bold text-ink-soft">{t.lead}</span>
                <span className="mt-auto pt-4 text-[14px] font-black text-teal-deep">
                  開始寫 <span aria-hidden="true">→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section id="write" aria-labelledby="write-title" className="mx-auto max-w-[1200px] scroll-mt-24 px-4 py-14 sm:px-6">
        <h2 id="write-title" className="section-title !text-[clamp(24px,3.2vw,34px)]">
          寫下我的願望
        </h2>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-[1.9] text-ink-soft">給世杰一句加油，或寫下你對桃園的期待。讓每一個聲音，都有機會被看見。</p>
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <WishForm siteKey={cfg.siteKey} open={cfg.open} />
          <aside id="rules" aria-labelledby="rules-title" className="scroll-mt-24 rounded-[28px] border-2 border-edge bg-cream p-6">
            <h3 id="rules-title" className="text-[20px] font-black tracking-[0.08em]">
              留言規範
            </h3>
            <ol className="mt-4 space-y-3 text-[14.5px] leading-[1.8] text-ink-soft">
              {RULES.map((r, i) => (
                <li key={r} className="flex gap-3">
                  <span className="font-display text-[16px] leading-[1.6] text-teal-deep" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 border-t-2 border-dashed border-teal-deep/20 pt-4 text-[13.5px] leading-[1.8] text-ink-soft">
              杰個願望由杰伴桃園志工團隊整理。本站是支持者自發經營的非官方網站，不是候選人或競選團隊的官方管道，回覆也由志工團隊撰寫。蒐集哪些資料、怎麼使用，見
              <Link href="/privacy#wish" className="link-ink mx-1 font-bold text-ink">
                隱私權政策
              </Link>
              。
            </p>
            <PenguinSays pose="wave" className="mt-6" penguinClassName="h-24 w-20" bubbleClassName="text-[14px]">
              一句加油也好，一個小點子也好，都很重要！
            </PenguinSays>
          </aside>
        </div>
      </section>

      <section id="wall" aria-labelledby="wall-title" className="scroll-mt-24 overflow-x-clip border-t-2 border-edge bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h2 id="wall-title" className="section-title !text-[clamp(24px,3.2vw,34px)]">
            大家的願望
          </h2>
          <p className="mt-3 text-[15.5px] leading-[1.9] text-ink-soft">看看桃園人正在期待什麼，也為認同的想法按個讚。</p>
          <Suspense fallback={<WishWallSkeleton />}>
            <WishWall searchParams={searchParams} open={cfg.open} readable={cfg.readable} />
          </Suspense>
        </div>
      </section>
    </>
  );
}

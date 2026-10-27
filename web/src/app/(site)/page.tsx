import Link from "next/link";
import { PenguinSays } from "@/components/art/speech";
import { HomeMap } from "@/components/map/home-map";
import { IslandCard } from "@/components/policy/island-card";
import { LessonList } from "@/components/policy/lesson-list";
import { PolicyCard } from "@/components/policy/policy-card";
import { BallotBadge } from "@/components/site/ballot-badge";
import { SampleNotice } from "@/components/site/sample-notice";
import { ArrowCurve, Cloud, Squiggle } from "@/components/ui/decor";
import { StatusBadge } from "@/components/ui/status-badge";
import { categories } from "@/data/categories";
import { lessons } from "@/data/learn";
import { latestPolicies, policies, statusInfo, statusOrder } from "@/data/policies";
import { site } from "@/lib/site";

export default function HomePage() {
  const latest = latestPolicies(3);
  return (
    <>
      <Hero />

      {/* 直書標語（unouplus 首頁的語彙） */}
      <div className="flex justify-center gap-5 pt-20 sm:gap-8 sm:pt-28" aria-hidden="true">
        <p className="vertical text-[clamp(24px,3.2vw,36px)] font-black leading-[1.6] tracking-[0.2em] text-teal-deep">
          <span className="wavy-v">都更有感。</span>
        </p>
        <p className="vertical mt-[2.2em] text-[clamp(24px,3.2vw,36px)] font-black leading-[1.6] tracking-[0.2em] text-teal">讓每一個桃園人的生活，</p>
      </div>
      <p className="sr-only">{site.tagline}</p>

      {/* 政策分類：圓形島嶼卡（手機可左右滑動） */}
      <section aria-labelledby="islands-title" className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <SectionHead
            id="islands-title"
            eyebrow="Policy Islands"
            title="你最關心桃園的哪一件事？"
            lead="選擇生活中的一個議題，了解政策內容、公開來源與目前進度。"
          />
        </div>
        <ul className="mx-auto mt-14 flex max-w-[1200px] snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-6 sm:px-6 lg:grid lg:grid-cols-5 lg:gap-8 lg:overflow-visible lg:pb-0">
          {categories.map((c) => (
            <li key={c.slug} className="w-[64vw] max-w-[260px] shrink-0 snap-center lg:w-auto lg:max-w-none">
              <IslandCard category={c} />
            </li>
          ))}
        </ul>
      </section>

      {/* 政策焦點 */}
      <section aria-labelledby="latest-title" className="relative overflow-hidden py-20 sm:py-24">
        <div aria-hidden="true" className="absolute left-0 top-0 h-[480px] w-[min(100%,1040px)] rounded-br-[200px] bg-teal sm:h-[440px]" />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHead id="latest-title" eyebrow="Latest Updates" title="最近更新的政策" lead="每張卡片都標示分類、狀態、資料來源與更新日期。" light />
            <Link href="/policies" className="btn btn-sm shrink-0 self-start md:self-auto">
              查看全部政策
              <ArrowCurve className="h-4 w-4" />
            </Link>
          </div>
          <SampleNotice className="mt-8" />
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {latest.map((p) => (
              <li key={p.id}>
                <PolicyCard policy={p} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ProgressBoard />

      {/* 企鵝阿爸的政策小教室 */}
      <section aria-labelledby="classroom-title" className="relative py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHead
              id="classroom-title"
              eyebrow="Penguin Classroom"
              title="企鵝阿爸的政策小教室"
              lead="政策名詞看不懂？先看「一句話看懂」，想知道更多再展開「詳細內容」。"
            />
            <PenguinSays pose="point" className="mt-10" penguinClassName="h-36 w-32" bubbleClassName="max-w-xs">
              不懂的地方不用硬記。我們回去，好好研究，再用白話說給你聽。
            </PenguinSays>
            <Link href="/faq#classroom" className="btn btn-sm mt-6">
              更多政策名詞
              <ArrowCurve className="h-4 w-4" />
            </Link>
          </div>
          <LessonList lessons={lessons.slice(0, 4)} />
        </div>
      </section>
    </>
  );

  function ProgressBoard() {
    return (
      <section
        aria-labelledby="progress-title"
        className="relative overflow-hidden py-20 sm:py-28"
        style={{ background: "linear-gradient(170deg, #FFF5C4 0%, #F3F9EE 45%, #E8F5F4 100%)" }}
      >
        <Cloud className="anim-bob absolute right-[6%] top-12 w-28 sm:w-36" />
        <Cloud className="anim-bob absolute left-[46%] top-6 hidden w-16 [animation-delay:-1.5s] md:block" />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
          <SectionHead
            id="progress-title"
            eyebrow="Progress"
            title="政策走到哪裡了？"
            lead="狀態必須由可查證的公開資料支持；找不到資料時，我們會直接寫「暫無可查證進度」。"
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statusOrder.map((s) => {
              const count = policies.filter((p) => p.status === s).length;
              return (
                <li key={s}>
                  <Link
                    href={`/policies?status=${s}`}
                    className="group flex h-full items-start gap-4 rounded-[22px] border-2 border-edge bg-paper p-5 shadow-soft transition-transform hover:-translate-y-1"
                  >
                    <span className="font-display text-[46px] leading-none text-teal" aria-hidden="true">
                      {String(count).padStart(2, "0")}
                    </span>
                    <span className="flex-1">
                      <StatusBadge status={s} />
                      <span className="mt-2 block text-[13.5px] leading-relaxed text-ink-soft">{statusInfo[s].desc}</span>
                      <span className="sr-only">，共 {count} 項</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-10">
            <Link href="/progress" className="btn btn-sun">
              看完整政策進度
              <ArrowCurve className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    );
  }
}

/** 區塊標題：上方英文小標＋青綠中文大標（light：放在青綠色塊上時反白） */
function SectionHead({ id, eyebrow, title, lead, light = false }: { id: string; eyebrow: string; title: string; lead?: string; light?: boolean }) {
  return (
    <div>
      <p className={`eyebrow flex items-center gap-3 ${light ? "!text-sun" : ""}`}>
        {eyebrow}
        <Squiggle className="h-2.5 w-12" color={light ? "#F9DE3A" : "#00A6A1"} />
      </p>
      <h2 id={id} className={`section-title mt-2 ${light ? "!text-paper" : ""}`}>
        {title}
      </h2>
      {lead && <p className={`mt-4 max-w-xl text-[15.5px] leading-[1.9] ${light ? "text-paper/90" : "text-ink-soft"}`}>{lead}</p>}
    </div>
  );
}

/** 左側海面的波浪與小船，讓文字卡片像浮在海上 */
function HeroSea() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      <Cloud className="anim-bob absolute left-[6%] top-[16%] w-36" />
      <Squiggle className="absolute left-[24%] top-[30%] h-3 w-14" color="#7FB2C2" />
      <Squiggle className="absolute left-[4%] top-[42%] h-3 w-12" color="#7FB2C2" />
      <Squiggle className="absolute left-[18%] top-[52%] h-3 w-10" color="#7FB2C2" />
      <svg viewBox="0 0 40 36" className="anim-bob absolute left-[22%] top-[38%] w-10 [animation-delay:-2s]">
        <path d="M4 28h32l-5 6H9z" fill="#FFFFFF" />
        <path d="M19 27V3l13 22z" fill="#F9DE3A" />
      </svg>
    </div>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #F1FAF9 0%, #E2F4F2 55%, #D3EEEC 100%)" }}>
      {/* 手機：文字在上、地圖在下；桌機：文字卡片在左側海面，地圖等比塞滿右側 */}
      <div className="relative mx-auto max-w-[1680px] lg:h-[max(680px,100svh)]">
        <HeroSea />
        <div className="relative px-4 pb-6 pt-28 sm:px-6 lg:absolute lg:bottom-14 lg:left-6 lg:z-10 lg:w-[400px] lg:p-0 xl:left-12">
          <PenguinSays side="right" className="absolute -top-[150px] right-2 hidden lg:flex" penguinClassName="h-28 w-24 anim-bob" bubbleClassName="w-56 text-[14px]">
            嗨！我是企鵝阿爸，帶你來逛桃園政策島。
          </PenguinSays>
          <div className="lg:rounded-[28px] lg:border-2 lg:border-edge lg:bg-paper lg:p-8 lg:shadow-lift">
            <p className="font-display text-[24px] leading-none text-teal-deep sm:text-[30px]">
              JIE.<span className="text-teal">Taoyuan</span>
            </p>
            <BallotBadge className="mt-4" />
            <p className="mt-3 block w-fit rounded-full border-2 border-dashed border-teal-deep/40 px-3 py-0.5 text-[12.5px] font-bold text-ink-soft">{site.stance}</p>
            <h1 id="hero-title" className="mt-5 text-[30px] font-black leading-[1.55] tracking-[0.08em] text-teal-deep sm:text-[38px]">
              <span className="wavy">桃園的未來，</span>
              <br />
              <span className="wavy">一起來探索。</span>
            </h1>
            <p className="mt-3 text-[15.5px] leading-[1.9] text-ink-soft">從每天的生活出發，看看一座城市可以如何改變。</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/explore" className="btn btn-sun">
                開始探索政策島
                <ArrowCurve className="h-5 w-5" />
              </Link>
              <Link href="/policies" className="btn">
                查看全部政策
              </Link>
            </div>
          </div>
        </div>

        <div className="relative lg:absolute lg:bottom-6 lg:left-[400px] lg:right-2 lg:top-24 lg:grid lg:place-items-center lg:[container-type:size] xl:left-[440px]">
          {/* 地圖後方的大圓與太陽（unouplus 主視覺的語彙） */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="relative aspect-square w-[96%] max-w-[860px] lg:h-[98cqh] lg:w-auto">
              <div className="absolute inset-0 rounded-full bg-white/55" />
              <div className="absolute right-[6%] top-[2%] aspect-square w-[26%] rounded-full bg-sun/90" />
            </div>
          </div>
          <HomeMap contain className="relative mx-auto w-full" />
        </div>

        <div className="px-4 pb-10 pt-2 sm:px-6 lg:hidden">
          <PenguinSays penguinClassName="h-24 w-20" bubbleClassName="text-[14px]">
            嗨！我是企鵝阿爸，帶你來逛桃園政策島。從交通、家庭到城市未來，選一座島，認識與生活有關的政策。
          </PenguinSays>
        </div>
      </div>
    </section>
  );
}

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

      {/* 政策分類：手機是可滑動的卡片，桌機是 3＋2 的拼貼 */}
      <section aria-labelledby="islands-title" className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <SectionHead
            id="islands-title"
            eyebrow="Policy Islands"
            title="你最關心桃園的哪一件事？"
            lead="選擇生活中的一個議題，了解政策內容、公開來源與目前進度。"
          />
        </div>
        <ul className="mx-auto mt-12 flex max-w-[1200px] snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 sm:px-6 lg:grid lg:grid-cols-6 lg:gap-6 lg:overflow-visible lg:pb-0">
          {categories.map((c, i) => (
            <li key={c.slug} className={`w-[78vw] max-w-[320px] shrink-0 snap-center lg:w-auto lg:max-w-none ${i < 3 ? "lg:col-span-2" : "lg:col-span-3"}`}>
              <IslandCard category={c} />
            </li>
          ))}
        </ul>
      </section>

      {/* 政策焦點 */}
      <section aria-labelledby="latest-title" className="border-y-2 border-ink bg-paper py-20 sm:py-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHead id="latest-title" eyebrow="Latest Updates" title="最近更新的政策" lead="每張卡片都標示分類、狀態、資料來源與更新日期。" />
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
        style={{ background: "linear-gradient(160deg, #F9E3D8 0%, #FBF0C8 55%, #F7F4EB 100%)" }}
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
                    className="group flex h-full items-start gap-4 rounded-[22px] border-2 border-ink bg-paper p-5 shadow-[0_5px_0_#193A42] transition-transform hover:-translate-y-1"
                  >
                    <span className="text-[44px] font-black leading-none tracking-tight" aria-hidden="true">
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

function SectionHead({ id, eyebrow, title, lead }: { id: string; eyebrow: string; title: string; lead?: string }) {
  return (
    <div>
      <h2 id={id} className="section-title">
        {title}
      </h2>
      <p className="eyebrow mt-2 flex items-center gap-3">
        {eyebrow}
        <Squiggle className="h-2.5 w-12" color="#35635B" />
      </p>
      {lead && <p className="mt-5 max-w-xl text-[15.5px] leading-[1.9] text-ink-soft">{lead}</p>}
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
        <path d="M4 28h32l-5 6H9z" fill="#FFFDF7" stroke="#193A42" strokeWidth={2} strokeLinejoin="round" />
        <path d="M19 27V3l13 22z" fill="#F9E3D8" stroke="#193A42" strokeWidth={2} strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #EEF6F8 0%, #D6E9EF 46%, #CFE4EB 100%)" }}>
      {/* 手機：文字在上、地圖在下；桌機：文字卡片在左側海面，地圖等比塞滿右側 */}
      <div className="relative mx-auto max-w-[1680px] lg:h-[max(680px,100svh)]">
        <HeroSea />
        <div className="relative px-4 pb-6 pt-28 sm:px-6 lg:absolute lg:bottom-14 lg:left-6 lg:z-10 lg:w-[400px] lg:p-0 xl:left-12">
          <PenguinSays side="right" className="absolute -top-[150px] right-2 hidden lg:flex" penguinClassName="h-28 w-24 anim-bob" bubbleClassName="w-56 text-[14px]">
            嗨！我是企鵝阿爸，帶你來逛桃園政策島。
          </PenguinSays>
          <div className="lg:rounded-[28px] lg:border-2 lg:border-ink lg:bg-paper lg:p-8 lg:shadow-[0_10px_0_#BFE0CF]">
            <p className="font-display text-[22px] leading-none sm:text-[28px]">
              JIE.<span className="text-teal">Taoyuan</span>
            </p>
            <BallotBadge className="mt-4" />
            <p className="mt-3 block w-fit rounded-full border-2 border-dashed border-ink/40 px-3 py-0.5 text-[12.5px] font-bold text-ink-soft">{site.stance}</p>
            <h1 id="hero-title" className="mt-4 text-[30px] font-black leading-[1.35] tracking-[0.06em] sm:text-[36px]">
              桃園的未來，
              <br />
              一起來探索。
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
          <HomeMap contain className="mx-auto w-full" />
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

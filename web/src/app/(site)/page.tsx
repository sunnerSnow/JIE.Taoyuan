import Link from "next/link";
import { PenguinSays } from "@/components/art/speech";
import { TaoyuanCard } from "@/components/lab/taoyuan-card";
import { HomeMap } from "@/components/map/home-map";
import { IslandCard } from "@/components/policy/island-card";
import { LessonList } from "@/components/policy/lesson-list";
import { PolicyCard } from "@/components/policy/policy-card";
import { BallotBadge } from "@/components/site/ballot-badge";
import { ElectionCountdown } from "@/components/site/election-countdown";
import { SampleNotice } from "@/components/site/sample-notice";
import { CandidateSocials } from "@/components/site/candidate-socials";
import { ArrowCurve, ArrowRight, Cloud, Squiggle } from "@/components/ui/decor";
import { categories, categoryColor } from "@/data/categories";
import { lessons } from "@/data/learn";
import { changeTypeInfo, changelog } from "@/data/changelog";
import { parseCardCode, sampleCardCodes } from "@/data/lab";
import { actionCount, formatDate, latestPolicies, policies, policiesIn } from "@/data/policies";
import { featuredRecords, records, roles } from "@/data/record";
import { labNav } from "@/lib/nav";
import { site } from "@/lib/site";

export default function HomePage() {
  const latest = latestPolicies(3);
  const latestChange = changelog[0];
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

      <LabPromo />

      {/* 政策焦點 */}
      <section aria-labelledby="latest-title" className="relative overflow-hidden py-20 sm:py-24">
        <div aria-hidden="true" className="absolute left-0 top-0 h-[480px] w-[min(100%,1040px)] rounded-br-[200px] bg-teal sm:h-[440px]" />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHead id="latest-title" eyebrow="Latest Updates" title="最近更新的政策" lead="每張卡片都標示分類、狀態、資料來源與更新日期。" light />
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link href="/policies" className="btn btn-sm">
                查看全部政策
                <ArrowCurve className="h-4 w-4" />
              </Link>
              <Link href="/updates" className="btn btn-sm">
                看更新紀錄
              </Link>
            </div>
          </div>
          {latestChange && (
            <Link
              href={`/updates#${latestChange.id}`}
              className="mt-6 flex w-fit max-w-full flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl bg-paper/95 px-4 py-2.5 text-[14px] font-bold shadow-soft hover:bg-paper"
            >
              <span className="shrink-0 rounded-full bg-sun px-2.5 py-0.5 text-[12px] font-black tracking-[0.08em]">{changeTypeInfo[latestChange.type].label}</span>
              <time dateTime={latestChange.date} className="shrink-0 text-ink-soft">
                {formatDate(latestChange.date)}
              </time>
              {/* 手機：標題自己一行，不被類型與日期擠窄 */}
              <span className="flex min-w-0 basis-full items-center gap-2 leading-snug sm:basis-auto">
                {latestChange.title}
                <ArrowRight className="h-4 w-4 shrink-0" />
              </span>
            </Link>
          )}
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

      <TrackerBoard />

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

  /** 3 分鐘探索的介紹，旁邊放一張範例桃園卡（插畫「企鵝不捨 桃園第①」），先讓人看到玩完會拿到什麼 */
  function LabPromo() {
    const sample = parseCardCode(sampleCardCodes()[0])!;
    const steps = ["選一個生活主題", "主題裡的政見全部攤開，挑 3 塊積木", "拿到桃園卡：分享連結，或下載直式圖發限時動態"];
    return (
      <section aria-labelledby="lab-title" className="relative overflow-hidden py-20 sm:py-24" style={{ background: "linear-gradient(180deg, #FBF7EE 0%, #F6EFE0 100%)" }}>
        <div className="mx-auto grid max-w-[1100px] items-center gap-12 px-4 sm:px-6 md:grid-cols-[1fr_minmax(0,340px)] lg:gap-20">
          <div>
            <SectionHead id="lab-title" eyebrow="Penguin Lab" title={labNav.title} lead="不知道從哪裡看起？挑一個你最在意的生活主題，3 分鐘就能拼出一張自己的桃園卡。不用登入，也不用填資料。" />
            <ol className="mt-8 space-y-3">
              {steps.map((s, i) => (
                <li key={s} className="flex items-center gap-3 text-[15.5px] font-bold">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-deep font-display text-[15px] text-paper" aria-hidden="true">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
            <Link href={labNav.href} className="btn btn-sun mt-9">
              開始 3 分鐘探索
              <ArrowCurve className="h-5 w-5" />
            </Link>
          </div>
          <div className="mx-auto w-full max-w-[300px] md:max-w-[340px]">
            <TaoyuanCard theme={sample.theme} picks={sample.picks} preview className="rotate-[2.5deg]" />
            <p className="mt-5 text-center text-[13px] font-bold text-ink-soft">桃園卡範例</p>
          </div>
        </div>
      </section>
    );
  }

  /** 政見與過去貢獻並列：選舉期間政見都還是「已提出」，旁邊放已經做到的事 */
  function TrackerBoard() {
    const most = Math.max(...categories.map((c) => policiesIn(c.slug).length));
    return (
      <section
        aria-labelledby="tracker-title"
        className="relative overflow-hidden py-20 sm:py-28"
        style={{ background: "linear-gradient(170deg, #FFF5C4 0%, #F3F9EE 45%, #E8F5F4 100%)" }}
      >
        <Cloud className="anim-bob absolute right-[6%] top-12 w-28 sm:w-36" />
        <Cloud className="anim-bob absolute left-[46%] top-6 hidden w-16 [animation-delay:-1.5s] md:block" />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
          <SectionHead
            id="tracker-title"
            eyebrow="Tracker"
            title="說了什麼、做過什麼"
            lead="政見是參選期間提出的主張，當選上任後才會開始執行；參選以前在市府、立法院和法務部做過的事，整理在「過去的貢獻」。"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col rounded-[26px] border-2 border-edge bg-paper p-6 shadow-soft sm:p-7">
              <h3 className="text-[15px] font-black tracking-[0.1em] text-teal-deep">提出的政見</h3>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-[56px] leading-none text-teal">{policies.length}</span>
                <span className="text-[16px] font-bold">項，分布在 {categories.length} 座政策島</span>
              </p>
              <p className="mt-1 text-[14px] text-ink-soft">共列出 {policies.reduce((n, p) => n + actionCount(p), 0)} 項具體做法，每一項都附來源。</p>
              <ul className="mt-6 space-y-2.5">
                {categories.map((c) => {
                  const n = policiesIn(c.slug).length;
                  return (
                    <li key={c.slug}>
                      <Link href={`/islands/${c.slug}`} className="group grid grid-cols-[6.5em_1fr_2em] items-center gap-3 text-[14.5px] font-bold">
                        <span className="group-hover:underline">{c.short}</span>
                        <span className="h-3 overflow-hidden rounded-full bg-mist" aria-hidden="true">
                          <span className="block h-full rounded-full" style={{ width: `${(n / most) * 100}%`, background: categoryColor[c.slug].base }} />
                        </span>
                        <span className="text-right font-display text-[17px] text-teal-deep">
                          {n}
                          <span className="sr-only"> 項</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-auto pt-7">
                <Link href="/progress" className="btn btn-sun">
                  看政見追蹤
                  <ArrowCurve className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="flex flex-col rounded-[26px] border-2 border-edge bg-paper p-6 shadow-soft sm:p-7">
              <h3 className="text-[15px] font-black tracking-[0.1em] text-teal-deep">過去的貢獻</h3>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-[56px] leading-none text-teal">{records.length}</span>
                <span className="text-[16px] font-bold">項，每一句都附出處</span>
              </p>
              <ul className="mt-6 divide-y-2 divide-dashed divide-teal-deep/15">
                {featuredRecords().map((r) => (
                  <li key={r.id}>
                    <Link href={`/record#${r.id}`} className="group flex items-center gap-3 py-3">
                      <span className="flex-1">
                        <span className="block text-[13px] font-bold text-ink-soft">
                          {roles[r.role].label}・{r.when}
                        </span>
                        <span className="mt-0.5 block text-[16px] font-black tracking-[0.04em] group-hover:underline">{r.title}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-7">
                <Link href="/record" className="btn">
                  看過去的貢獻
                  <ArrowCurve className="h-5 w-5" />
                </Link>
              </div>
            </div>
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
      {/* 手機：文字在上、地圖在下；桌機：文字卡片在左側海面、貼齊首屏底部，上方留出頁首的高度（螢幕太矮時首屏跟著變高，卡片不會被頁首蓋住），地圖等比塞滿右側 */}
      <div className="relative mx-auto max-w-[1680px] lg:flex lg:min-h-[max(680px,100svh)]">
        <HeroSea />
        <div className="relative px-4 pb-6 pt-28 sm:px-6 lg:z-10 lg:ml-6 lg:flex lg:w-[400px] lg:shrink-0 lg:flex-col lg:justify-end lg:px-0 lg:pb-14 xl:ml-12">
          <div className="relative">
            {/* 企鵝阿爸：螢幕夠高時站在卡片上方；不夠高時站到卡片右下，避免躲進頁首後面 */}
            <PenguinSays
              side="right"
              className="absolute hidden lg:bottom-0 lg:left-full lg:ml-5 lg:flex tall:lg:bottom-auto tall:lg:left-auto tall:lg:right-2 tall:lg:-top-[150px] tall:lg:ml-0"
              penguinClassName="h-28 w-24 anim-bob"
              bubbleClassName="w-56 text-[14px]"
            >
              嗨！我是企鵝阿爸，帶你來逛桃園政策島。
            </PenguinSays>
            <div className="lg:rounded-[28px] lg:border-2 lg:border-edge lg:bg-paper lg:p-8 lg:shadow-lift">
              <p className="font-display text-[24px] leading-none text-teal-deep sm:text-[30px]">
                JIE.<span className="text-teal">Taoyuan</span>
              </p>
              <BallotBadge className="mt-4" />
              <p className="mt-3 block w-fit rounded-full border-2 border-dashed border-teal-deep/40 px-3 py-0.5 text-[12.5px] font-bold text-ink-soft">{site.stance}</p>
              {/* 桌機的倒數在頁首右上，這裡只給手機與平板 */}
              <div className="lg:hidden">
                <ElectionCountdown className="mt-3" />
              </div>
              <h1 id="hero-title" className="mt-5 text-[30px] font-black leading-[1.55] tracking-[0.08em] text-teal-deep sm:text-[38px]">
                <span className="wavy">桃園的未來，</span>
                <br />
                <span className="wavy">一起來探索。</span>
              </h1>
              <p className="mt-3 text-[15.5px] leading-[1.9] text-ink-soft">從每天的生活出發，看看一座城市可以如何改變。</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={labNav.href} className="btn btn-sun">
                  開始 3 分鐘探索
                  <ArrowCurve className="h-5 w-5" />
                </Link>
                <Link href="/explore" className="btn">
                  進入政策島
                </Link>
                <CandidateSocials compact className="basis-full" />
              </div>
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

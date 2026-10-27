import type { Metadata } from "next";
import Link from "next/link";
import { PenguinSays } from "@/components/art/speech";
import { LessonList } from "@/components/policy/lesson-list";
import { PageHead } from "@/components/site/page-head";
import { ArrowCurve } from "@/components/ui/decor";
import { faqs, lessons } from "@/data/learn";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "常見問題",
  description: "關於 JIE.Taoyuan 政策資料來源、狀態判斷與網站使用的常見問題，以及企鵝阿爸的政策小教室。",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <PageHead title="常見問題" eyebrow="FAQ" lead="網站怎麼用、資料從哪來、狀態誰判斷？先看這裡。政策名詞看不懂，就到下方的政策小教室。" />

      <section aria-labelledby="faq-title" className="mx-auto max-w-[900px] px-4 py-14 sm:px-6">
        <h2 id="faq-title" className="sr-only">
          常見問題
        </h2>
        <ul className="space-y-4">
          {faqs.map((f, i) => (
            <li key={f.q} className="rounded-[22px] border-2 border-edge bg-paper shadow-soft">
              <details className="group" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-start gap-4 p-5 [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-[22px] leading-none text-teal" aria-hidden="true">
                    Q
                  </span>
                  <span className="flex-1 text-[17px] font-black leading-snug tracking-[0.04em]">{f.q}</span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-edge transition-transform group-open:rotate-45" aria-hidden="true">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
                      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <div className="mx-5 mb-5 flex gap-4 border-t-2 border-dashed border-teal-deep/20 pt-4">
                  <span className="font-display text-[22px] leading-none text-coral" aria-hidden="true">
                    A
                  </span>
                  <p className="flex-1 text-[15px] leading-[1.9] text-ink-soft">{f.a}</p>
                </div>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <section id="classroom" aria-labelledby="classroom-title" className="border-t-2 border-edge bg-paper py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 id="classroom-title" className="section-title !text-[clamp(26px,3.6vw,38px)]">
              企鵝阿爸的政策小教室
            </h2>
            <p className="eyebrow mt-2">Penguin Classroom</p>
            <p className="mt-5 text-[15.5px] leading-[1.9] text-ink-soft">先看「一句話看懂」，想知道更多再展開「詳細內容」。</p>
            <PenguinSays pose="point" className="mt-10" penguinClassName="h-32 w-28" bubbleClassName="max-w-xs">
              不懂的地方不用硬記。我們回去，好好研究，再用白話說給你聽。
            </PenguinSays>
            <Link href="/explore" className="btn btn-sun btn-sm mt-6">
              去政策島逛逛
              <ArrowCurve className="h-4 w-4" />
            </Link>
          </div>
          <LessonList lessons={lessons} />
        </div>
      </section>
    </>
  );
}

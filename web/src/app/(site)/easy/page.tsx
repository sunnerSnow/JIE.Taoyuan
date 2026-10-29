import type { Metadata } from "next";
import Link from "next/link";
import { BallotBadge } from "@/components/site/ballot-badge";
import { ElectionCountdown } from "@/components/site/election-countdown";
import { categoryColor, categoryMap } from "@/data/categories";
import { easyPoints, voteDay } from "@/data/easy";
import { themePolicies } from "@/data/lab";
import { policies, shortTitle } from "@/data/policies";
import type { CategorySlug } from "@/data/types";
import { pageMetadata } from "@/lib/metadata";
import { candidateFull } from "@/lib/seo";
import { site } from "@/lib/site";

// 大字版：給長輩看的精簡版。字大、行距寬、話說短，每項政見只列 2～4 個重點（data/easy.ts），詳細內容與出處連到政見頁。
// 字級至少 19px，重要文字都用深色，按鈕高度至少 48px；不放動畫、不放小字說明。

export const metadata: Metadata = pageMetadata({
  title: "大字版：黃世杰的政見一次看懂",
  description: `字放大、話說短：${candidateFull}的 ${policies.length} 項政見，每項只列幾個重點，長輩也能一眼看懂。`,
  path: "/easy",
});

/** 長輩最常關心的健康照顧放第一 */
const ORDER: CategorySlug[] = ["health", "transport", "environment", "family", "future"];

const SOCIAL_LABEL: Record<string, string> = { line: "加 LINE 好友", youtube: "看影片（YouTube）", facebook: "看臉書（Facebook）" };

export default function EasyPage() {
  const groups = ORDER.map((slug) => ({ category: categoryMap[slug], color: categoryColor[slug], list: themePolicies(slug) }));
  const socials = site.candidate.socials.filter((s) => s.key in SOCIAL_LABEL);

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-[820px] px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
        <h1 className="text-[36px] font-black leading-tight tracking-[0.06em] text-teal-deep sm:text-[44px]">
          黃世杰的政見
          <br />
          一次看懂
        </h1>
        <p className="mt-4 text-[21px] font-bold leading-relaxed">
          字放大、話說短。
          <br />
          每一項只寫重點。
        </p>

        <div className="mt-8 rounded-[28px] border-2 border-edge bg-cream p-6 sm:p-8">
          <BallotBadge large />
          <p className="mt-6 text-[22px] font-black leading-relaxed">
            投票日：<span className="inline-block">{voteDay()}</span>
          </p>
          <ElectionCountdown large className="mt-3" />
        </div>

        <p className="mt-6 rounded-2xl border-2 border-dashed border-teal-deep/50 px-5 py-4 text-[19px] font-bold leading-relaxed">
          這是支持者整理的網站，不是候選人的官方網站。
        </p>

        <nav aria-labelledby="easy-toc" className="mt-12">
          <h2 id="easy-toc" className="text-[24px] font-black">
            想看哪一類？
          </h2>
          <p className="mt-2 text-[19px] font-bold leading-relaxed">每一類最下面，都可以做成圖卡傳給家人朋友。</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {groups.map((g) => (
              <li key={g.category.slug}>
                <a
                  href={`#easy-${g.category.slug}`}
                  className="flex min-h-[64px] items-center gap-3 rounded-2xl border-2 border-edge px-5 text-[22px] font-black"
                  style={{ background: g.color.soft }}
                >
                  <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: g.color.base }} aria-hidden="true" />
                  {g.category.short}
                  <span className="ml-auto text-[19px]">{g.list.length} 項</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {groups.map((g) => (
          <section key={g.category.slug} id={`easy-${g.category.slug}`} aria-labelledby={`easy-${g.category.slug}-title`} className="mt-16">
            <h2
              id={`easy-${g.category.slug}-title`}
              className="flex items-center gap-3 border-b-4 pb-3 text-[32px] font-black tracking-[0.06em]"
              style={{ borderColor: g.color.base }}
            >
              <span className="h-5 w-5 shrink-0 rounded-full" style={{ background: g.color.base }} aria-hidden="true" />
              {g.category.short}
            </h2>
            <ol className="mt-6 space-y-5">
              {g.list.map((p) => (
                <li key={p.id}>
                  <article aria-labelledby={`easy-${p.id}`} className="rounded-[24px] border-2 border-edge bg-paper p-5 shadow-soft sm:p-7">
                    <h3 id={`easy-${p.id}`} className="text-[26px] font-black leading-snug tracking-[0.04em]">
                      {shortTitle(p.title)}
                    </h3>
                    <ul className="mt-4 space-y-3">
                      {easyPoints[p.id].map((t) => (
                        <li key={t} className="flex items-start gap-3 text-[21px] font-bold leading-[1.6]">
                          <span className="mt-[0.55em] h-3 w-3 shrink-0 rounded-full bg-teal-deep" aria-hidden="true" />
                          {t}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/policies/${p.slug}`}
                      className="mt-5 inline-flex min-h-[48px] items-center text-[19px] font-black text-teal-deep underline decoration-2 underline-offset-[6px]"
                    >
                      看詳細內容與出處
                      <span className="sr-only">：{shortTitle(p.title)}</span>
                      <span aria-hidden="true" className="ml-1.5">
                        →
                      </span>
                    </Link>
                  </article>
                </li>
              ))}
            </ol>
            <Link
              href={`/easy/card/${g.category.slug}`}
              className="mt-6 flex min-h-[64px] items-center justify-center gap-3 rounded-2xl bg-sun px-5 py-3 text-center text-[21px] font-black shadow-soft"
            >
              把「{g.category.short}」做成圖卡，傳給親友
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        ))}

        <section aria-labelledby="easy-follow" className="mt-16 rounded-[28px] bg-teal-deep p-6 text-paper sm:p-8">
          <h2 id="easy-follow" className="text-[28px] font-black tracking-[0.06em]">
            想聽黃世杰本人怎麼說
          </h2>
          <p className="mt-2 text-[19px] font-bold leading-relaxed">下面都是候選人本人的帳號。</p>
          <ul className="mt-6 grid gap-3">
            {socials.map((s) => (
              <li key={s.key}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[64px] items-center justify-between gap-3 rounded-2xl bg-paper px-6 text-[22px] font-black text-ink"
                >
                  {SOCIAL_LABEL[s.key]}
                  <span aria-hidden="true">↗</span>
                  <span className="sr-only">（另開新視窗）</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-12 text-center">
          <Link href="/" className="inline-flex min-h-[48px] items-center text-[20px] font-black text-teal-deep underline decoration-2 underline-offset-[6px]">
            回到一般版首頁
          </Link>
        </p>
      </div>
    </div>
  );
}

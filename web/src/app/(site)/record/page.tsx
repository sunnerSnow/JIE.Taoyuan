import type { Metadata } from "next";
import Link from "next/link";
import { PenguinSays } from "@/components/art/speech";
import { PageHead } from "@/components/site/page-head";
import { ArrowCurve } from "@/components/ui/decor";
import { formatDate } from "@/data/policies";
import { career, claimByInfo, claimByOrder, recordsIn, recordUpdatedAt, roles, type ClaimBy, type RecordItem, type RoleSlug } from "@/data/record";
import type { EditorNote, ExtraSource } from "@/data/types";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "過去的貢獻",
  description: "參選市長以前，黃世杰在桃園市政府、立法院和法務部做過哪些事？每一項都附上出處，並標明是官方紀錄、媒體報導，還是候選人或競選方的說法。",
  path: "/record",
});

const noteLabel: Record<EditorNote["kind"], string> = { supplement: "補充", check: "核對", clarify: "澄清" };
const roleOrder = Object.keys(roles) as RoleSlug[];

export default function RecordPage() {
  return (
    <>
      <PageHead
        title="過去的貢獻"
        eyebrow="Track Record"
        lead="參選市長以前，黃世杰在桃園市政府、立法院和法務部做過哪些事？每一項都附上出處，並標明是官方紀錄、媒體報導，還是候選人或競選方的說法。"
      >
        <nav aria-label="本頁目錄" className="mt-8">
          <ul className="flex flex-wrap gap-2 text-[14px] font-bold">
            {[["#career", "經歷一覽"], ["#how-to-read", "怎麼讀這一頁"], ...roleOrder.map((r) => [`#${r}`, roles[r].label])].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="inline-flex min-h-10 items-center rounded-full border-2 border-edge bg-paper px-4 hover:bg-mint">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHead>

      <section id="career" aria-labelledby="career-title" className="mx-auto max-w-[1200px] scroll-mt-24 px-4 py-14 sm:px-6">
        <SectionTitle id="career-title">經歷一覽</SectionTitle>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {career.map((c) => (
            <li key={c.when} className="flex flex-col rounded-[22px] border-2 border-edge bg-paper p-5 shadow-soft">
              <span className="font-display text-[30px] leading-none text-teal">{c.when}</span>
              <span className="mt-3 text-[17px] font-black tracking-[0.04em] text-ink">{c.title}</span>
              {c.detail && <span className="mt-1 text-[14px] leading-relaxed text-ink-soft">{c.detail}</span>}
              <span className="mt-auto pt-4 text-[12.5px] leading-relaxed text-ink-soft">
                出處：
                <SourceLink source={c.source} compact />
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section id="how-to-read" aria-labelledby="how-to-read-title" className="scroll-mt-24 border-y-2 border-edge bg-paper py-14">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <SectionTitle id="how-to-read-title">怎麼讀這一頁</SectionTitle>
            <p className="mt-3 max-w-2xl text-[15.5px] leading-[1.9] text-ink-soft">
              這一頁只收找得到出處的事。政績常常是候選人或支持者說的，所以每一句引文都標明是誰說的；評價性的說法（例如「排審超過 350
              案」）照原文引用，本站不替它背書。
            </p>
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {claimByOrder.map((by) => (
                <div key={by} className="rounded-2xl border-2 border-edge p-4">
                  <dt>
                    <ClaimBadge by={by} />
                  </dt>
                  <dd className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{claimByInfo[by].desc}</dd>
                </div>
              ))}
            </dl>
          </div>
          <PenguinSays pose="point" penguinClassName="h-24 w-20" bubbleClassName="max-w-xs text-[14px]">
            誰說的、出處在哪，都先看清楚！
          </PenguinSays>
        </div>
      </section>

      {roleOrder.map((role) => (
        <section key={role} id={role} aria-labelledby={`${role}-title`} className="mx-auto max-w-[900px] scroll-mt-24 px-4 pt-14 sm:px-6">
          <SectionTitle id={`${role}-title`}>
            {roles[role].label}
            <span className="ml-3 text-[15px] font-bold tracking-[0.06em] text-ink-soft">{roles[role].period}</span>
          </SectionTitle>
          <div className="mt-6 space-y-6">
            {recordsIn(role).map((r) => (
              <RecordCard key={r.id} item={r} />
            ))}
          </div>
        </section>
      ))}

      <section aria-labelledby="record-next-title" className="mx-auto max-w-[900px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="rounded-[26px] border-2 border-edge bg-sun-soft p-6 sm:p-8">
          <h2 id="record-next-title" className="text-[21px] font-black tracking-[0.08em] text-ink">
            接下來，看他想為桃園做什麼
          </h2>
          <p className="mt-3 text-[15px] leading-[1.9] text-ink-soft">
            本頁資料整理於 <time dateTime={recordUpdatedAt}>{formatDate(recordUpdatedAt)}</time>。資料有誤或原始來源失效時，我們會更正內容並標示更新日期。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/policies" className="btn btn-sun">
              看全部政見
              <ArrowCurve className="h-5 w-5" />
            </Link>
            <Link href="/explore" className="btn">
              探索政策島
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[24px] font-black tracking-[0.08em]">
      <span className="h-6 w-1.5 rounded-full bg-teal" aria-hidden="true" />
      {children}
    </h2>
  );
}

function ClaimBadge({ by }: { by: ClaimBy }) {
  const info = claimByInfo[by];
  return <span className={`inline-block rounded-md px-2 py-0.5 text-[12.5px] font-black leading-snug tracking-[0.1em] ${info.className}`}>{info.label}</span>;
}

/** 出處連結：媒體或機關名稱＋標題＋日期，另開新視窗 */
function SourceLink({ source, compact = false }: { source: ExtraSource; compact?: boolean }) {
  return (
    <>
      <a href={source.url} target="_blank" rel="noopener noreferrer" className="link-ink font-bold text-ink">
        {source.outlet}
        {!compact && <span className="font-normal text-ink-soft">〈{source.title}〉</span>}
        <span aria-hidden="true"> ↗</span>
        <span className="sr-only">{compact ? `〈${source.title}〉` : ""}（另開新視窗）</span>
      </a>
      {source.date && (
        <>
          ・<time dateTime={source.date}>{formatDate(source.date)}</time>
        </>
      )}
    </>
  );
}

function RecordCard({ item }: { item: RecordItem }) {
  return (
    <article id={item.id} aria-labelledby={`${item.id}-title`} className="scroll-mt-24 rounded-[26px] border-2 border-edge bg-paper p-5 shadow-soft sm:p-7">
      <p className="text-[13.5px] font-bold tracking-[0.08em] text-teal-deep">{item.when}</p>
      <h3 id={`${item.id}-title`} className="mt-1 text-[21px] font-black leading-snug tracking-[0.06em] text-ink">
        {item.title}
      </h3>
      <p className="mt-3 text-[15.5px] leading-[1.9] text-ink-soft">{item.summary}</p>

      {item.facts && item.facts.length > 0 && (
        <div className="mt-6">
          <h4 className="text-[14.5px] font-black tracking-[0.1em] text-ink">查得到的紀錄</h4>
          <ul className="mt-3 space-y-3">
            {item.facts.map((f) => (
              <li key={f.text} className="flex gap-3 text-[14.5px] leading-[1.8]">
                <span className="mt-[0.7em] h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                <span>
                  <span className="text-ink">{f.text}</span>
                  <span className="block text-[13px] text-ink-soft">
                    <SourceLink source={f.source} />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.claims.length > 0 && (
        <div className="mt-6">
          <h4 className="text-[14.5px] font-black tracking-[0.1em] text-ink">各方說法</h4>
          <ul className="mt-3 space-y-3">
            {item.claims.map((c) => (
              <li key={c.quote}>
                <figure className="rounded-2xl border-2 border-edge bg-cream/60 px-4 py-3">
                  <ClaimBadge by={c.by} />
                  <blockquote cite={c.source.url} className="mt-2 text-[15px] leading-[1.85] text-ink">
                    「{c.quote}」
                  </blockquote>
                  <figcaption className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                    {c.speaker && c.speaker !== c.source.outlet && <span className="mr-1">{c.speaker}：</span>}
                    <SourceLink source={c.source} />
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.notes && item.notes.length > 0 && (
        <ul className="mt-6 space-y-3">
          {item.notes.map((n) => (
            <li
              key={n.text}
              className="flex items-start gap-3 rounded-2xl border-2 border-teal-deep/15 bg-sun-soft px-4 py-3 text-[14.5px] leading-[1.8] text-ink"
            >
              <span className="mt-1 shrink-0 rounded-md bg-teal-deep px-2 py-0.5 text-[12px] font-black leading-snug tracking-[0.1em] text-paper">
                {noteLabel[n.kind]}
              </span>
              <span>{n.text}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

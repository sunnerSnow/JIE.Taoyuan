import type { Metadata } from "next";
import Link from "next/link";
import { PenguinSays } from "@/components/art/speech";
import { CategoryChip } from "@/components/policy/policy-card";
import { PageHead } from "@/components/site/page-head";
import { ArrowCurve, ArrowRight } from "@/components/ui/decor";
import { SampleTag, StatusBadge } from "@/components/ui/status-badge";
import { categories, categoryColor } from "@/data/categories";
import { formatDate, policies, policiesIn, shortTitle, statusInfo, statusOrder } from "@/data/policies";
import { records } from "@/data/record";
import type { Policy } from "@/data/types";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "政見追蹤",
  description: `${policies.length} 項政見是什麼時候提出的、分布在哪幾座政策島？選舉期間的政見都還在「已提出」階段，當選上任後，每一項會依公開資料更新進度並附上來源。`,
  path: "/progress",
});

/** 依提出日期分月，新的在前；沒有日期的放最後 */
function byMonth(list: Policy[]) {
  const sorted = [...list].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  const groups = new Map<string, Policy[]>();
  for (const p of sorted) {
    const key = p.publishedAt?.slice(0, 7) ?? "";
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  return [...groups.entries()];
}

const monthLabel = (key: string) => {
  if (!key) return "未提供日期";
  const [y, m] = key.split("-");
  return `${y} 年 ${Number(m)} 月`;
};

/** 政見往前走的階段（「暫無可查證進度」不是階段，另外在定義裡說明） */
const stages = statusOrder.filter((s) => s !== "unknown");

export default function ProgressPage() {
  const months = byMonth(policies);
  const newest = months[0]?.[1][0]?.publishedAt;
  const count = (s: Policy["status"]) => policies.filter((p) => p.status === s).length;

  return (
    <>
      <PageHead
        title="政見追蹤"
        eyebrow="Tracker"
        lead="政見是什麼時候提出的、分布在哪幾座政策島？選舉期間的政見都還在「已提出」階段；當選上任後，每一項會依公開資料更新進度，並附上來源。"
      />

      <section aria-label="政見數字" className="mx-auto max-w-[1200px] px-4 pt-14 sm:px-6">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="公開提出的政見" value={policies.length} unit="項" />
          <Stat label="涵蓋的政策島" value={categories.length} unit="座" />
          <Stat label="最近一次提出" value={formatDate(newest)} />
          <Stat label="過去的貢獻" value={records.length} unit="項" href="/record" />
        </ul>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="各島政見數">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/islands/${c.slug}`}
                className="flex items-center gap-2.5 rounded-2xl border-2 border-edge px-4 py-3 text-[14.5px] font-bold transition-transform hover:-translate-y-0.5"
                style={{ background: categoryColor[c.slug].soft }}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full border-[1.5px] border-edge"
                  style={{ background: categoryColor[c.slug].base }}
                  aria-hidden="true"
                />
                <span className="flex-1">{c.short}</span>
                <span className="font-display text-[20px] leading-none text-teal-deep">{policiesIn(c.slug).length}</span>
                <span className="sr-only">項</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="timeline-title" className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <h2 id="timeline-title" className="text-[24px] font-black tracking-[0.08em]">
          政見提出時間軸
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">依候選人公開發表的日期整理，新的在前。點標題可以看政見全文與出處。</p>
        <ol className="mt-8 space-y-10">
          {months.map(([key, list], i) => (
            <li key={key || "none"} className="relative pl-7 sm:pl-9">
              {i < months.length - 1 && (
                <span className="absolute bottom-[-2.5rem] left-[7px] top-3 w-0.5 bg-teal-deep/15 sm:left-[9px]" aria-hidden="true" />
              )}
              <span
                className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-[3px] border-paper bg-teal shadow-[0_0_0_2px_rgba(0,122,116,.25)] sm:h-5 sm:w-5"
                aria-hidden="true"
              />
              <h3 className="flex flex-wrap items-baseline gap-x-3 text-[19px] font-black tracking-[0.06em] text-ink">
                {monthLabel(key)}
                <span className="text-[14px] font-bold text-ink-soft">提出 {list.length} 項</span>
              </h3>
              <ul className="mt-3 overflow-hidden rounded-[22px] border-2 border-edge bg-paper shadow-soft">
                {list.map((p) => (
                  <li key={p.id} className="border-t-2 border-dashed border-teal-deep/15 first:border-t-0">
                    <Link
                      href={`/policies/${p.slug}`}
                      className="group flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-mint/40 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                    >
                      <time dateTime={p.publishedAt} className="w-14 shrink-0 font-display text-[16px] text-teal-deep">
                        {p.publishedAt ? formatDate(p.publishedAt).slice(5) : "—"}
                      </time>
                      <span className="flex-1 text-[16px] font-black tracking-[0.04em] group-hover:underline">{shortTitle(p.title)}</span>
                      <span className="flex flex-wrap items-center gap-2">
                        <CategoryChip slug={p.category} />
                        {p.sample && <SampleTag />}
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="stages-title" className="border-y-2 border-edge bg-paper py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 id="stages-title" className="text-[24px] font-black tracking-[0.08em]">
                政見會怎麼往前走？
              </h2>
              <p className="mt-2 max-w-2xl text-[15px] leading-[1.9] text-ink-soft">
                選舉期間公開提出的政見，都從「已提出」開始。當選上任後，有了正式計畫、預算或公告，才會往下一個階段前進；每一次更新都要有可查證的公開資料。
              </p>
            </div>
            <PenguinSays pose="point" penguinClassName="h-24 w-20" bubbleClassName="max-w-xs text-[14px]">
              政見說要做，不代表已經在做。看狀態，也要看來源。
            </PenguinSays>
          </div>
          <ol className="mt-8 grid gap-3 sm:grid-cols-5">
            {stages.map((s, i) => {
              const n = count(s);
              return (
                <li
                  key={s}
                  className={`relative flex items-center gap-3 rounded-2xl border-2 p-4 sm:flex-col sm:items-start ${
                    n > 0 ? "border-edge bg-cream" : "border-dashed border-teal-deep/25"
                  }`}
                >
                  <span className="font-display text-[13px] text-ink-soft" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <StatusBadge status={s} size="sm" />
                  <span className="ml-auto text-[13.5px] font-bold sm:ml-0">{n > 0 ? `${n} 項` : i === 0 ? "尚無" : "上任後"}</span>
                </li>
              );
            })}
          </ol>
          <details className="mt-6 rounded-2xl border-2 border-edge bg-paper">
            <summary className="cursor-pointer list-none px-5 py-4 text-[15px] font-bold [&::-webkit-details-marker]:hidden">
              <span aria-hidden="true">＋ </span>每個狀態的定義
            </summary>
            <dl className="grid gap-3 border-t-2 border-dashed border-teal-deep/15 px-5 py-4 sm:grid-cols-2">
              {statusOrder.map((s) => (
                <div key={s} className="flex flex-col gap-1.5">
                  <dt>
                    <StatusBadge status={s} size="sm" />
                  </dt>
                  <dd className="text-[14px] leading-relaxed text-ink-soft">{statusInfo[s].desc}</dd>
                </div>
              ))}
            </dl>
          </details>
        </div>
      </section>

      <section aria-labelledby="record-cta-title" className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-6 rounded-[26px] border-2 border-edge bg-sun-soft p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="record-cta-title" className="text-[21px] font-black tracking-[0.08em] text-ink">
              已經做到的事，看「過去的貢獻」
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-[1.9] text-ink-soft">
              政見是對未來的主張；參選以前，他在桃園市政府、立法院和法務部做過的 {records.length} 件事，每一句都附上出處。
            </p>
          </div>
          <Link href="/record" className="btn btn-sun shrink-0 self-start md:self-auto">
            看過去的貢獻
            <ArrowCurve className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, unit, href }: { label: string; value: number | string; unit?: string; href?: string }) {
  const body = (
    <>
      <span className="block text-[14px] font-bold text-ink-soft">{label}</span>
      <span className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-[40px] leading-none text-teal">{value}</span>
        {unit && <span className="text-[15px] font-bold text-ink">{unit}</span>}
        {href && <ArrowRight className="ml-auto h-5 w-5 self-center" />}
      </span>
    </>
  );
  const cls = "block h-full rounded-[22px] border-2 border-edge bg-paper p-5 shadow-soft";
  return (
    <li>
      {href ? (
        <Link href={href} className={`${cls} transition-transform hover:-translate-y-0.5`}>
          {body}
        </Link>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </li>
  );
}

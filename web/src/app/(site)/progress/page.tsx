import type { Metadata } from "next";
import Link from "next/link";
import { PenguinSays } from "@/components/art/speech";
import { CategoryChip } from "@/components/policy/policy-card";
import { PageHead } from "@/components/site/page-head";
import { SampleNotice } from "@/components/site/sample-notice";
import { ArrowRight } from "@/components/ui/decor";
import { SampleTag, StatusBadge } from "@/components/ui/status-badge";
import { categories } from "@/data/categories";
import { formatDate, policies, statusInfo, statusOrder } from "@/data/policies";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "政策進度",
  description: "桃園政策走到哪裡了？依已提出、研議中、規劃中、執行中、已完成與暫無可查證進度分類，每一個狀態都要有公開資料支持。",
  path: "/progress",
});

export default function ProgressPage() {
  return (
    <>
      <PageHead
        title="政策進度"
        eyebrow="Progress"
        lead="每一項政策的狀態，都必須由可查證的公開資料支持。找不到資料時，我們直接寫「暫無可查證進度」，不做推測。"
      />

      <section aria-labelledby="status-def-title" className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 id="status-def-title" className="text-[24px] font-black tracking-[0.08em]">
              六種狀態怎麼看？
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">每個狀態都有自己的圖示與文字，不只靠顏色區分。</p>
          </div>
          <PenguinSays pose="point" penguinClassName="h-24 w-20" bubbleClassName="max-w-xs text-[14px]">
            政見說要做，不代表已經在做。看狀態，也要看來源。
          </PenguinSays>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statusOrder.map((s) => (
            <li key={s} className="rounded-[22px] border-2 border-ink bg-paper p-5 shadow-[0_5px_0_#BFE0CF]">
              <StatusBadge status={s} />
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">{statusInfo[s].desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="matrix-title" className="border-y-2 border-ink bg-paper py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h2 id="matrix-title" className="text-[24px] font-black tracking-[0.08em]">
            各島政策進度一覽
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">點數字可以看該分類、該狀態的政策清單。</p>
          <SampleNotice className="mt-6" />
          <div className="mt-6 overflow-x-auto rounded-[22px] border-2 border-ink">
            <table className="w-full min-w-[720px] border-collapse text-[14px]">
              <caption className="sr-only">各分類政策在不同狀態的項目數</caption>
              <thead>
                <tr className="bg-mist">
                  <th scope="col" className="px-4 py-3 text-left font-black">
                    分類
                  </th>
                  {statusOrder.map((s) => (
                    <th key={s} scope="col" className="px-2 py-3 text-center font-black">
                      {statusInfo[s].label}
                    </th>
                  ))}
                  <th scope="col" className="px-4 py-3 text-center font-black">
                    合計
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => {
                  const list = policies.filter((p) => p.category === c.slug);
                  return (
                    <tr key={c.slug} className="border-t-2 border-dashed border-ink/15">
                      <th scope="row" className="px-4 py-3 text-left">
                        <Link href={`/islands/${c.slug}`} className="hover:underline">
                          <CategoryChip slug={c.slug} />
                        </Link>
                      </th>
                      {statusOrder.map((s) => {
                        const n = list.filter((p) => p.status === s).length;
                        return (
                          <td key={s} className="px-2 py-3 text-center">
                            {n > 0 ? (
                              <Link
                                href={`/policies?category=${c.slug}&status=${s}`}
                                className="inline-grid h-9 min-w-9 place-items-center rounded-full border-2 border-ink px-2 text-[15px] font-black hover:-translate-y-0.5"
                                style={{ background: statusInfo[s].tone }}
                                aria-label={`${c.name}${statusInfo[s].label} ${n} 項`}
                              >
                                {n}
                              </Link>
                            ) : (
                              <span className="text-ink/30" aria-label="0 項">
                                –
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center text-[15px] font-black">{list.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section aria-labelledby="by-status-title" className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
        <h2 id="by-status-title" className="text-[24px] font-black tracking-[0.08em]">
          依狀態看政策
        </h2>
        <div className="mt-8 space-y-10">
          {statusOrder.map((s) => {
            const list = policies.filter((p) => p.status === s).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
            return (
              <section key={s} aria-labelledby={`status-${s}`}>
                <div className="flex flex-wrap items-center gap-3 border-b-2 border-ink pb-3">
                  <h3 id={`status-${s}`} className="flex items-center gap-3">
                    <StatusBadge status={s} />
                    <span className="text-[15px] font-bold">{list.length} 項</span>
                  </h3>
                  {list.length > 0 && (
                    <Link href={`/policies?status=${s}`} className="ml-auto text-[13.5px] font-bold text-teal-deep hover:underline">
                      在政策總覽篩選 →
                    </Link>
                  )}
                </div>
                {list.length > 0 ? (
                  <ul className="divide-y-2 divide-dashed divide-ink/15">
                    {list.map((p) => (
                      <li key={p.id}>
                        <Link href={`/policies/${p.slug}`} className="group flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-4">
                          <span className="flex-1 text-[16px] font-black tracking-[0.04em] group-hover:underline">{p.title}</span>
                          <span className="flex flex-wrap items-center gap-2">
                            <CategoryChip slug={p.category} />
                            {p.sample && <SampleTag />}
                            <span className="text-[13px] text-ink-soft">
                              更新 <time dateTime={p.updatedAt}>{formatDate(p.updatedAt)}</time>
                            </span>
                            <ArrowRight className="h-4 w-4 shrink-0" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-[14.5px] text-ink-soft">目前沒有這個狀態的政策。</p>
                )}
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}

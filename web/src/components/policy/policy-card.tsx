import Link from "next/link";
import { categoryColor, categoryMap } from "@/data/categories";
import { formatDate, sourceTypeLabel } from "@/data/policies";
import type { Policy } from "@/data/types";
import { SampleTag, StatusBadge } from "@/components/ui/status-badge";
import { ArrowCurve } from "@/components/ui/decor";

export function CategoryChip({ slug }: { slug: Policy["category"] }) {
  const c = categoryMap[slug];
  return (
    <span className="chip" style={{ background: categoryColor[slug].soft }}>
      <span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-ink" style={{ background: categoryColor[slug].base }} aria-hidden="true" />
      {c.no} {c.name}
    </span>
  );
}

/** n：分類頁上對應插畫圖釘的編號 */
export function PolicyCard({ policy, headingLevel = 3, n }: { policy: Policy; headingLevel?: 2 | 3; n?: number }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="ink-card group relative flex h-full flex-col p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {n !== undefined && (
          <span
            className="grid h-7 w-7 place-items-center rounded-full border-2 border-ink text-[12px] font-black"
            style={{ background: categoryColor[policy.category].base }}
            aria-hidden="true"
          >
            {n}
          </span>
        )}
        <CategoryChip slug={policy.category} />
        <StatusBadge status={policy.status} size="sm" />
      </div>
      <H className="mt-4 text-[19px] font-black leading-snug tracking-[0.05em]">
        <Link href={`/policies/${policy.slug}`} className="after:absolute after:inset-0 after:rounded-[22px] focus-visible:outline-none">
          {policy.title}
        </Link>
      </H>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{policy.summary}</p>
      <div className="mt-auto pt-5">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t-2 border-dashed border-ink/20 pt-3 text-[12.5px] leading-relaxed">
          <dt className="font-bold">來源</dt>
          <dd className="text-ink-soft">{sourceTypeLabel[policy.sourceType]}</dd>
          <dt className="font-bold">更新</dt>
          <dd className="text-ink-soft">
            <time dateTime={policy.updatedAt}>{formatDate(policy.updatedAt)}</time>
          </dd>
        </dl>
        <div className="mt-3 flex items-center justify-between">
          {policy.sample ? <SampleTag /> : <span />}
          <span className="grid h-9 w-9 place-items-center rounded-lg border-2 border-ink bg-sun transition-transform duration-300 group-hover:rotate-12" aria-hidden="true">
            <ArrowCurve className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}

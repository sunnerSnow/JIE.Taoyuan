import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PenguinSays } from "@/components/art/speech";
import { CategoryChip, PolicyCard } from "@/components/policy/policy-card";
import { RelationEvidence, RelationTypeBadge } from "@/components/policy/relation-badge";
import { ShareButtons } from "@/components/policy/share-buttons";
import { Breadcrumbs } from "@/components/site/page-head";
import { PageSkeleton } from "@/components/site/page-skeleton";
import { SampleNotice } from "@/components/site/sample-notice";
import { ArrowCurve, ArrowRight, PinIcon } from "@/components/ui/decor";
import { SampleTag, StatusBadge } from "@/components/ui/status-badge";
import { categoryColor, categoryMap } from "@/data/categories";
import { formatDate, getPolicy, policies, sourceName, sourceTypeLabel, statusInfo, statusOrder } from "@/data/policies";
import { RELATION_DISCLAIMER, type Relation, relationsOf } from "@/data/relations";
import type { EditorNote, ExtraSource, Policy } from "@/data/types";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const noteLabel: Record<EditorNote["kind"], string> = { supplement: "補充", check: "核對", clarify: "澄清" };

export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const policy = getPolicy((await params).slug);
  if (!policy) return {};
  return pageMetadata({
    title: policy.title,
    description: policy.summary,
    path: `/policies/${policy.slug}`,
    article: { publishedTime: policy.publishedAt, modifiedTime: policy.updatedAt },
    ownImage: true,
  });
}

// 網址參數放進 Suspense：換頁時先顯示骨架，不必等伺服器（直接進站時仍是完整的預先渲染 HTML）
export default function PolicyPage({ params }: PageProps<"/policies/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PolicyContent params={params} />
    </Suspense>
  );
}

async function PolicyContent({ params }: { params: PageProps<"/policies/[slug]">["params"] }) {
  const policy = getPolicy((await params).slug);
  if (!policy) notFound();

  const category = categoryMap[policy.category];
  const color = categoryColor[policy.category];
  const related = relationsOf(policy.slug)
    .map(({ relation, other }) => ({ relation, policy: getPolicy(other) }))
    .filter((r): r is { relation: Relation; policy: Policy } => !!r.policy);

  return (
    <article aria-labelledby="policy-title">
      <header className="relative overflow-hidden border-b-2 border-edge" style={{ background: color.soft }}>
        <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-28 sm:px-6 sm:pt-32">
          <Breadcrumbs
            items={[
              { href: "/", label: "首頁" },
              { href: "/policies", label: "政策總覽" },
              { href: `/islands/${category.slug}`, label: category.name },
            ]}
            current={policy.title}
          />
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <CategoryChip slug={policy.category} />
            <StatusBadge status={policy.status} />
            {policy.sample && <SampleTag />}
          </div>
          <h1 id="policy-title" className="section-title mt-4 max-w-4xl">
            {policy.title}
          </h1>
          <p className="mt-5 max-w-3xl rounded-2xl border-2 border-edge bg-paper px-5 py-4 text-[16.5px] font-bold leading-[1.8] shadow-soft">
            <span className="mr-2 rounded bg-sun px-1.5 py-0.5 text-[12px] font-black tracking-[0.1em]">一句話摘要</span>
            {policy.summary}
          </p>
          <div className="mt-6">
            <ShareButtons title={policy.title} fileName={`JIE.Taoyuan-${policy.slug}`} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_340px] lg:gap-14">
        <div className="min-w-0 space-y-12">
          {policy.sample && <SampleNotice />}

          {policy.problemStatement && (
            <Block id="problem" title="要解決什麼問題？">
              <p>{policy.problemStatement}</p>
            </Block>
          )}

          <Block id="content" title="政策內容與執行方式">
            <p>{policy.description}</p>
            {policy.pillars && policy.pillars.length > 0 && (
              <ol className="mt-6 grid gap-4 md:grid-cols-2">
                {policy.pillars.map((pillar, i) => (
                  <li key={pillar.title} className="rounded-[22px] border-2 border-edge bg-paper p-5 shadow-soft">
                    <div className="flex items-start gap-3">
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-edge text-[14px] font-black text-ink"
                        style={{ background: color.base }}
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="text-[17px] font-black leading-snug tracking-[0.06em] text-ink">{pillar.title}</h3>
                        {pillar.tagline && <p className="text-[13.5px] font-bold text-teal-deep">{pillar.tagline}</p>}
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2 border-t-2 border-dashed border-teal-deep/20 pt-4 text-[14.5px] leading-relaxed">
                      {pillar.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-ink">
                          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-teal-deep" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
            {policy.approach && policy.approach.length > 0 && (
              <ol className="mt-5 space-y-3">
                {policy.approach.map((a, i) => (
                  <li key={a} className="flex items-start gap-3">
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-edge text-[12px] font-black text-ink"
                      style={{ background: color.base }}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-ink">{a}</span>
                  </li>
                ))}
              </ol>
            )}
          </Block>

          {policy.audience && (
            <Block id="audience" title="適用對象">
              <p>{policy.audience}</p>
            </Block>
          )}

          {policy.scenarios && policy.scenarios.length > 0 && (
            <Block id="scenarios" title="如果你是…">
              <PenguinSays pose="point" penguinClassName="h-20 w-[68px]" bubbleClassName="text-[14px] text-ink">
                下面是虛構的生活情境，幫你想像這項政見和日常的關係；實際內容以政見原文為準。
              </PenguinSays>
              <ul className="grid gap-4 md:grid-cols-2">
                {policy.scenarios.map((s) => (
                  <li key={s.persona} className="rounded-[22px] border-2 border-edge bg-paper p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border-2 border-dashed border-teal-deep/45 px-2.5 py-0.5 text-[12px] font-bold">虛構情境</span>
                      {s.district && (
                        <span className="chip !min-h-7 !text-[12px]" style={{ background: color.soft }}>
                          <PinIcon className="h-3.5 w-3" color={color.base} />
                          {s.district}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-[15.5px] font-black text-ink">{s.persona}</p>
                    <p className="mt-2 text-[14.5px] leading-[1.85]">{s.text}</p>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          <Block id="status" title="目前狀態">
            <StatusLadder policy={policy} />
          </Block>

          {/* 時程只在有可靠來源時呈現（規格書第 6 節） */}
          {policy.timeline && policy.timeline.length > 0 && (
            <Block id="timeline" title="相關時程">
              <ol className="relative space-y-4 border-l-2 border-dashed border-teal-deep/30 pl-6">
                {policy.timeline.map((t) => (
                  <li key={t.label} className="relative">
                    <span className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-2 border-edge bg-sun" aria-hidden="true" />
                    <time dateTime={t.date} className="text-[15px] font-black tracking-[0.06em] text-ink">
                      {formatDate(t.date)}
                    </time>
                    <p className="text-ink">{t.label}</p>
                  </li>
                ))}
              </ol>
            </Block>
          )}

          {policy.faqs && policy.faqs.length > 0 && (
            <Block id="faq" title="常見問題">
              <ul className="space-y-3">
                {policy.faqs.map((f) => (
                  <li key={f.q} className="rounded-2xl border-2 border-edge bg-paper">
                    <details className="group">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-black text-ink [&::-webkit-details-marker]:hidden">
                        {f.q}
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-edge transition-transform group-open:rotate-45" aria-hidden="true">
                          <svg viewBox="0 0 16 16" className="h-3 w-3">
                            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
                          </svg>
                        </span>
                      </summary>
                      <p className="border-t-2 border-dashed border-teal-deep/20 px-5 py-4">{f.a}</p>
                    </details>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {!policy.sample && <SourcesBlock policy={policy} />}
        </div>

        <aside aria-labelledby="source-title" className="lg:sticky lg:top-28 lg:self-start">
          <div className="ink-card p-6">
            <h2 id="source-title" className="flex items-center gap-2 text-[17px] font-black tracking-[0.08em]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3h9l4 4v14H6z" />
                <path d="M15 3v4h4M9 12h7M9 16h5" strokeLinecap="round" />
              </svg>
              資料來源與更新
            </h2>
            <dl className="mt-4 space-y-3 text-[14px] leading-relaxed">
              <Row label="來源類型">{sourceTypeLabel[policy.sourceType]}</Row>
              <Row label="原始資料">
                {policy.sourceUrl ? (
                  <a href={policy.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-ink break-words">
                    {sourceName(policy.sourceTitle)}
                    <span className="sr-only">（另開新視窗）</span>
                  </a>
                ) : (
                  sourceName(policy.sourceTitle)
                )}
              </Row>
              <Row label="發布日期">
                {policy.publishedAt ? <time dateTime={policy.publishedAt}>{formatDate(policy.publishedAt)}</time> : "未提供"}
              </Row>
              {policy.retrievedAt && (
                <Row label="擷取日期">
                  <time dateTime={policy.retrievedAt}>{formatDate(policy.retrievedAt)}</time>
                </Row>
              )}
              <Row label="最後更新">
                <time dateTime={policy.updatedAt}>{formatDate(policy.updatedAt)}</time>
              </Row>
              <Row label="目前狀態">{statusInfo[policy.status].label}</Row>
            </dl>
            <p className="mt-5 border-t-2 border-dashed border-teal-deep/20 pt-4 text-[13px] leading-relaxed text-ink-soft">
              發現資料有誤或過期？
              <Link href="/about#contact" className="link-ink font-bold text-ink">
                告訴我們
              </Link>
              ，更正後會標示更新日期。
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link href={`/islands/${category.slug}`} className="btn btn-sm justify-between">
              回到{category.name}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={`/explore?island=${category.slug}`} className="btn btn-sun btn-sm justify-between">
              在政策島地圖上看
              <ArrowCurve className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t-2 border-edge bg-paper py-14">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <h2 id="related-title" className="text-[22px] font-black tracking-[0.08em]">
              相關政策
            </h2>
            <p className="mt-2 text-[13.5px] text-ink-soft">{RELATION_DISCLAIMER}</p>
            <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map(({ relation, policy: p }) => (
                <li key={relation.id} className="flex flex-col gap-3">
                  <div className="rounded-2xl bg-cream px-4 py-3">
                    <RelationTypeBadge type={relation.type} full />
                    <p className="mt-2 text-[14px] font-bold leading-relaxed">{relation.label}</p>
                    <RelationEvidence relation={relation} />
                  </div>
                  <PolicyCard policy={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="flex items-center gap-3 text-[21px] font-black tracking-[0.08em]">
        <span className="h-5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
        {title}
      </h2>
      <div className="mt-4 text-[15.5px] leading-[1.9] text-ink-soft">{children}</div>
    </section>
  );
}

/** 出處與查證：編輯註記（和原文分開）＋全部來源＋查證聲明 */
function SourcesBlock({ policy }: { policy: Policy }) {
  const sources: ExtraSource[] = [
    ...(policy.sourceUrl
      ? [{ type: policy.sourceType, outlet: sourceTypeLabel[policy.sourceType], title: policy.sourceTitle, url: policy.sourceUrl, date: policy.publishedAt }]
      : []),
    ...(policy.extraSources ?? []),
  ];
  return (
    <Block id="sources" title="出處與查證">
      {policy.notes && policy.notes.length > 0 && (
        <ul className="mb-5 space-y-3">
          {policy.notes.map((n) => (
            <li key={n.text} className="flex items-start gap-3 rounded-2xl border-2 border-teal-deep/15 bg-sun-soft px-4 py-3 text-[14.5px] leading-[1.8] text-ink">
              <span className="mt-1 shrink-0 rounded-md bg-teal-deep px-2 py-0.5 text-[12px] font-black leading-snug tracking-[0.1em] text-paper">
                {noteLabel[n.kind]}
              </span>
              <span>{n.text}</span>
            </li>
          ))}
        </ul>
      )}
      <ul className="space-y-2">
        {sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl border-2 border-edge bg-paper px-4 py-3 transition-colors hover:bg-mint"
            >
              <span className="text-[13px] font-bold text-teal-deep">{s.outlet}</span>
              <span className="min-w-0 flex-1 font-bold text-ink">
                {s.title} <span aria-hidden="true">↗</span>
                <span className="sr-only">（另開新視窗）</span>
              </span>
              {s.date && (
                <time dateTime={s.date} className="text-[13px]">
                  {formatDate(s.date)}
                </time>
              )}
            </a>
          </li>
        ))}
      </ul>
      {policy.sourceType === "candidate" && <p className="mt-4 text-[13.5px] leading-relaxed">{site.verifyNote}</p>}
    </Block>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5em_1fr] gap-2">
      <dt className="font-bold">{label}</dt>
      <dd className="text-ink-soft">{children}</dd>
    </div>
  );
}

/** 狀態階梯：每一階都有文字，目前所在位置另外標「目前」，不只靠顏色 */
function StatusLadder({ policy }: { policy: Policy }) {
  if (policy.status === "unknown") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-teal-deep/40 bg-paper p-5 sm:flex-row sm:items-center">
        <StatusBadge status="unknown" />
        <p>{statusInfo.unknown.desc}</p>
      </div>
    );
  }
  const steps = statusOrder.filter((s) => s !== "unknown");
  const at = steps.indexOf(policy.status);
  return (
    <>
      <ol className="grid gap-2 sm:grid-cols-5 sm:gap-0">
        {steps.map((s, i) => {
          const done = i <= at;
          const current = i === at;
          return (
            <li key={s} aria-current={current ? "step" : undefined} className="relative flex items-center gap-3 sm:flex-col sm:gap-2 sm:text-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute top-[17px] hidden h-0.5 sm:right-1/2 sm:block sm:w-full ${done ? "bg-teal-deep" : "border-t-2 border-dashed border-teal-deep/25"}`}
                />
              )}
              <span
                className={`relative z-[1] grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-[13px] font-black ${
                  done ? "border-edge text-ink" : "border-teal-deep/30 bg-paper text-ink/40"
                }`}
                style={done ? { background: current ? statusInfo[s].tone : "#FFFFFF" } : undefined}
              >
                {done && !current ? (
                  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                    <path d="M3.5 8.4l3 3 6-6.4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span className={`text-[14px] font-bold ${done ? "text-ink" : "text-ink/45"}`}>
                {statusInfo[s].label}
                {current && <span className="ml-1.5 rounded bg-teal-deep px-1.5 py-0.5 text-[11px] text-paper sm:mx-auto sm:mt-1 sm:block sm:w-fit">目前</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-5">{statusInfo[policy.status].desc}狀態依公開資料判斷，依據請見本頁的「資料來源與更新」。</p>
    </>
  );
}

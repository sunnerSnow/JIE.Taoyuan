import Link from "next/link";
import { ArrowCurve } from "@/components/ui/decor";
import { SampleTag, StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/data/policies";
import type { ExploreIsland, ExplorePolicy } from "./types";

export const POLICY_HEADING_ID = "policy-panel-title";

/**
 * 選了政策（點圖釘、建築或清單）後的面板：桌機在左側、手機在底部抽屜。
 * 只放「先看懂」需要的欄位；做法、情境、出處與查證在完整政策頁。
 */
export function PolicyPanel({
  island,
  policy,
  onClose,
  onPrev,
  onNext,
}: {
  island: ExploreIsland;
  policy: ExplorePolicy;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const { pin } = island;
  const total = island.policies.length;
  const prev = island.policies.find((p) => p.n === policy.n - 1);
  const next = island.policies.find((p) => p.n === policy.n + 1);

  return (
    <div
      className="flex flex-col"
      onKeyDown={(e) => {
        // 面板內用左右鍵切換同島的上一項、下一項（輸入框裡不攔截）
        if ((e.target as HTMLElement).closest("input, textarea, select")) return;
        if (e.key === "ArrowLeft" && onPrev) {
          e.preventDefault();
          onPrev();
        } else if (e.key === "ArrowRight" && onNext) {
          e.preventDefault();
          onNext();
        }
      }}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-mint pl-2 pr-3.5 text-[13px] font-black tracking-[0.06em] hover:bg-mint-deep"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          回到{pin.name}
        </button>
        <span className="ml-auto text-[12.5px] font-bold text-ink-soft">
          第 {policy.n} 項，共 {total} 項
        </span>
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-edge bg-paper hover:bg-mint"
          aria-label="關閉政策面板"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full text-[13px] font-black" style={{ background: pin.color }} aria-hidden="true">
          {policy.n}
        </span>
        <span className="chip !text-[12px]" style={{ background: island.soft }}>
          {pin.no} {pin.name}
        </span>
        <StatusBadge status={policy.status} size="sm" />
        {policy.sample && <SampleTag />}
      </div>
      <h2 id={POLICY_HEADING_ID} tabIndex={-1} className="mt-3 text-[21px] font-black leading-snug tracking-[0.06em] text-teal-deep focus:outline-none">
        {policy.title}
      </h2>

      <p className="mt-3 rounded-2xl bg-sun-soft px-4 py-3 text-[14.5px] font-bold leading-[1.8]">
        <span className="mr-1.5 rounded bg-sun px-1.5 py-0.5 text-[11.5px] font-black tracking-[0.1em]">一句話看懂</span>
        {policy.summary}
      </p>
      {policy.audience && (
        <p className="mt-3 text-[13.5px] leading-relaxed">
          <span className="font-black">適用對象</span>
          <span className="ml-2 text-ink-soft">{policy.audience}</span>
        </p>
      )}

      <dl className="mt-4 grid grid-cols-[5.2em_1fr] gap-x-3 gap-y-2 rounded-2xl border-2 border-edge px-4 py-3.5 text-[13.5px] leading-relaxed">
        <dt className="font-black">來源類型</dt>
        <dd className="text-ink-soft">{policy.sourceLabel}</dd>
        <dt className="font-black">原始來源</dt>
        <dd className="min-w-0 text-ink-soft">
          {policy.sourceUrl ? (
            <a href={policy.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-ink break-words font-bold text-ink">
              {policy.sourceTitle} <span aria-hidden="true">↗</span>
              <span className="sr-only">（另開新視窗）</span>
            </a>
          ) : (
            <>
              {policy.sourceTitle}
              <span className="block text-[12.5px]">原始連結待補</span>
            </>
          )}
        </dd>
        <dt className="font-black">發布日期</dt>
        <dd className="text-ink-soft">{policy.publishedAt ? <time dateTime={policy.publishedAt}>{formatDate(policy.publishedAt)}</time> : "未提供"}</dd>
        {policy.verifiedAt && (
          <>
            <dt className="font-black">最後查證</dt>
            <dd className="text-ink-soft">
              <time dateTime={policy.verifiedAt}>{formatDate(policy.verifiedAt)}</time>
            </dd>
          </>
        )}
        <dt className="font-black">最後更新</dt>
        <dd className="text-ink-soft">
          <time dateTime={policy.updatedAt}>{formatDate(policy.updatedAt)}</time>
        </dd>
      </dl>
      {policy.extraSources > 0 && <p className="mt-2 text-[12.5px] text-ink-soft">另有 {policy.extraSources} 則佐證來源與編輯註記，請見完整政策頁。</p>}

      <Link href={`/policies/${policy.slug}`} className="btn btn-sun btn-sm mt-5 self-start">
        看完整政策頁
        <ArrowCurve className="h-4 w-4" />
      </Link>

      <nav aria-label={`${pin.name}的其他政策`} className="mt-5 grid grid-cols-2 gap-2 border-t-2 border-dashed border-teal-deep/20 pt-4">
        <SwitchButton dir="prev" label={prev?.title} onClick={onPrev} />
        <SwitchButton dir="next" label={next?.title} onClick={onNext} />
      </nav>
    </div>
  );
}

function SwitchButton({ dir, label, onClick }: { dir: "prev" | "next"; label?: string; onClick?: () => void }) {
  const isPrev = dir === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex min-h-[64px] flex-col justify-center rounded-2xl border-2 border-edge bg-paper px-3 py-2 transition-colors hover:bg-mint disabled:pointer-events-none disabled:opacity-40 ${
        isPrev ? "items-start text-left" : "items-end text-right"
      }`}
    >
      <span className="text-[12px] font-black tracking-[0.1em] text-teal-deep">{isPrev ? "‹ 上一項" : "下一項 ›"}</span>
      <span className="mt-0.5 line-clamp-2 text-[13px] font-bold leading-snug">{label ?? (isPrev ? "已經是第一項" : "已經是最後一項")}</span>
    </button>
  );
}

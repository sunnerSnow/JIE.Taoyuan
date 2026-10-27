"use client";

import { useId, useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, statusInfo, statusOrder } from "@/data/policies";
import type { CategorySlug, PolicyStatus } from "@/data/types";
import { intercept } from "./intercept";
import type { ExploreIsland, ExplorePolicy } from "./types";

export type FilterHit = { island: ExploreIsland; policy: ExplorePolicy };

/** 關鍵字比對：政策名稱、摘要、標籤、各項主張與做法、島名 */
function matches(island: ExploreIsland, p: ExplorePolicy, q: string) {
  return [p.title, p.summary, p.keywords, island.pin.name, ...p.tags].some((t) => t.includes(q));
}

/** 探索頁的搜尋與篩選（右側索引、清單模式共用）：關鍵字 × 分類 × 狀態交叉篩選 */
export function useExploreFilter(islands: ExploreIsland[]) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategorySlug | null>(null);
  const [status, setStatus] = useState<PolicyStatus | null>(null);
  const q = query.trim();
  const active = !!(q || category || status);

  const results = useMemo<FilterHit[]>(
    () =>
      islands
        .filter((i) => !category || i.pin.slug === category)
        .flatMap((island) =>
          island.policies.filter((p) => (!status || p.status === status) && (!q || matches(island, p, q))).map((policy) => ({ island, policy })),
        ),
    [islands, category, status, q],
  );

  // 每個選項套用後會有幾筆（其他條件不變），標在按鈕上
  const categoryCount = (slug: CategorySlug | null) =>
    islands
      .filter((i) => !slug || i.pin.slug === slug)
      .reduce((n, island) => n + island.policies.filter((p) => (!status || p.status === status) && (!q || matches(island, p, q))).length, 0);
  const statusCount = (s: PolicyStatus | null) =>
    islands
      .filter((i) => !category || i.pin.slug === category)
      .reduce((n, island) => n + island.policies.filter((p) => (!s || p.status === s) && (!q || matches(island, p, q))).length, 0);

  const clear = () => {
    setQuery("");
    setCategory(null);
    setStatus(null);
  };

  return { query, setQuery, category, setCategory, status, setStatus, active, results, clear, categoryCount, statusCount };
}

type Filter = ReturnType<typeof useExploreFilter>;

/** 搜尋框＋分類、狀態篩選按鈕 */
export function FilterBar({ islands, filter }: { islands: ExploreIsland[]; filter: Filter }) {
  const inputId = useId();
  const chip = (pressed: boolean) =>
    `inline-flex min-h-8 items-center gap-1.5 rounded-full border-2 px-2.5 text-[12.5px] font-bold transition-colors ${
      pressed ? "border-teal-deep bg-teal-deep text-paper" : "border-edge bg-paper hover:bg-mint"
    }`;
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={inputId} className="sr-only">
          搜尋政策
        </label>
        <div className="relative">
          <input
            id={inputId}
            type="search"
            value={filter.query}
            onChange={(e) => filter.setQuery(e.target.value)}
            placeholder="搜尋政策、關鍵字…（例如：公車、托育、長輩）"
            className="h-12 w-full rounded-xl border-2 border-edge bg-cream pl-11 pr-4 text-[15px] placeholder:text-ink-soft/70 focus:bg-paper focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-deep"
          />
          <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth={2.2} />
            <path d="M13 13l4 4" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div role="group" aria-label="依議題篩選" className="flex flex-wrap gap-1.5">
        <button type="button" aria-pressed={!filter.category} onClick={() => filter.setCategory(null)} className={chip(!filter.category)}>
          全部議題 <span className="opacity-70">{filter.categoryCount(null)}</span>
        </button>
        {islands.map((i) => (
          <button
            key={i.pin.slug}
            type="button"
            aria-pressed={filter.category === i.pin.slug}
            onClick={() => filter.setCategory(filter.category === i.pin.slug ? null : i.pin.slug)}
            className={chip(filter.category === i.pin.slug)}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: i.pin.color }} aria-hidden="true" />
            {i.pin.short} <span className="opacity-70">{filter.categoryCount(i.pin.slug)}</span>
          </button>
        ))}
      </div>
      <div role="group" aria-label="依狀態篩選" className="flex flex-wrap gap-1.5">
        <button type="button" aria-pressed={!filter.status} onClick={() => filter.setStatus(null)} className={chip(!filter.status)}>
          全部狀態
        </button>
        {statusOrder.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={filter.status === s}
            onClick={() => filter.setStatus(filter.status === s ? null : s)}
            className={chip(filter.status === s)}
          >
            {statusInfo[s].label} <span className="opacity-70">{filter.statusCount(s)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** 篩選結果：數量、清除篩選、空結果提示；點結果定位到地圖並打開政策面板 */
export function FilterResults({
  filter,
  activePolicy,
  onOpenPolicy,
}: {
  filter: Filter;
  activePolicy?: string | null;
  onOpenPolicy: (slug: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 px-1 pb-2">
        <p aria-live="polite" className="text-[13px] font-bold text-ink-soft">
          找到 {filter.results.length} 項
        </p>
        <button type="button" onClick={filter.clear} className="text-[13px] font-bold text-teal-deep underline-offset-4 hover:underline">
          清除篩選
        </button>
      </div>
      {filter.results.length ? (
        <ul className="space-y-1.5">
          {filter.results.map(({ island, policy }) => (
            <li key={policy.slug}>
              <a
                href={`/policies/${policy.slug}`}
                onClick={(e) => intercept(e, () => onOpenPolicy(policy.slug))}
                aria-current={activePolicy === policy.slug ? "true" : undefined}
                className="block rounded-2xl border-2 border-transparent px-3 py-2.5 hover:bg-mint/60 aria-[current=true]:border-edge aria-[current=true]:bg-mint"
              >
                <span className="flex items-center gap-1.5 text-[12px] font-bold text-teal-deep">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: island.pin.color }} aria-hidden="true" />
                  {island.pin.no} {island.pin.name}
                </span>
                <span className="mt-0.5 block font-bold leading-snug">{policy.title}</span>
                <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-soft">
                  <StatusBadge status={policy.status} size="sm" />
                  <span>{policy.sourceLabel}</span>
                  <span>
                    更新 <time dateTime={policy.updatedAt}>{formatDate(policy.updatedAt)}</time>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl bg-cream px-4 py-6 text-center text-[14px] leading-relaxed text-ink-soft">
          找不到符合條件的政策。
          <br />
          換個關鍵字，或
          <button type="button" onClick={filter.clear} className="link-ink mx-1 font-bold text-ink">
            清除篩選
          </button>
          再看看。
        </div>
      )}
    </div>
  );
}

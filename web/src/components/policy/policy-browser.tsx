"use client";

import { useSearchParams } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { PenguinSays } from "@/components/art/speech";
import { StatusBadge } from "@/components/ui/status-badge";
import { categories, categoryColor } from "@/data/categories";
import { statusInfo, statusOrder } from "@/data/policies";
import type { CategorySlug, Policy, PolicyStatus } from "@/data/types";
import { PolicyCard } from "./policy-card";

type Sort = "category" | "updated";

const isCategory = (v: string | null): v is CategorySlug => categories.some((c) => c.slug === v);
const isStatus = (v: string | null): v is PolicyStatus => statusOrder.includes(v as PolicyStatus);

/**
 * 政策總覽的搜尋與篩選。
 * 分類、狀態寫在網址（?category=&status=），篩選結果可以直接分享；
 * 狀態只列出目前有政策的（選舉期間全部都是「已提出」時，整組狀態篩選不顯示）；
 * 關鍵字只放在元件裡，避免中文輸入法組字時被網址同步打斷。
 */
export function PolicyBrowser({ policies }: { policies: Policy[] }) {
  const params = useSearchParams();
  const category = isCategory(params.get("category")) ? (params.get("category") as CategorySlug) : null;
  const status = isStatus(params.get("status")) ? (params.get("status") as PolicyStatus) : null;
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("category");
  const searchId = useId();
  const sortId = useId();

  const setParam = (key: "category" | "status", value: string | null) => {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    window.history.replaceState(null, "", url);
  };

  const usedStatuses = statusOrder.filter((s) => s === status || policies.some((p) => p.status === s));

  const q = query.trim();
  const results = useMemo(() => {
    const list = policies.filter((p) => {
      if (category && p.category !== category) return false;
      if (status && p.status !== status) return false;
      if (!q) return true;
      const name = categories.find((c) => c.slug === p.category)?.name ?? "";
      const steps = [...(p.approach ?? []), ...(p.pillars ?? []).flatMap((x) => [x.title, x.tagline ?? "", ...x.items])];
      return [p.title, p.summary, p.description, name, ...steps, ...(p.tags ?? [])].some((t) => t.includes(q));
    });
    return sort === "updated" ? [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : list;
  }, [policies, category, status, q, sort]);

  const filtered = !!(category || status || q);
  const clearAll = () => {
    setQuery("");
    const url = new URL(window.location.href);
    url.searchParams.delete("category");
    url.searchParams.delete("status");
    window.history.replaceState(null, "", url);
  };

  return (
    <div>
      <div role="search" className="ink-card space-y-5 p-5 sm:p-6">
        <div>
          <label htmlFor={searchId} className="text-[14px] font-black tracking-[0.08em]">
            關鍵字搜尋
          </label>
          <div className="relative mt-2">
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例如：公車、托育、長輩、公園…"
              className="h-12 w-full rounded-xl border-2 border-edge bg-cream pl-11 pr-4 text-[15px] placeholder:text-ink-soft/70 focus:bg-paper focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-deep"
            />
            <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth={2.2} />
              <path d="M13 13l4 4" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <FilterGroup label="分類">
          <FilterChip pressed={!category} onClick={() => setParam("category", null)}>
            全部分類
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.slug} pressed={category === c.slug} onClick={() => setParam("category", c.slug)} dot={categoryColor[c.slug].base}>
              {c.no} {c.name}
            </FilterChip>
          ))}
        </FilterGroup>

        {usedStatuses.length > 1 && (
          <FilterGroup label="狀態">
            <FilterChip pressed={!status} onClick={() => setParam("status", null)}>
              全部狀態
            </FilterChip>
            {usedStatuses.map((s) => (
              <FilterChip key={s} pressed={status === s} onClick={() => setParam("status", s)} dot={statusInfo[s].tone}>
                {statusInfo[s].label}
              </FilterChip>
            ))}
          </FilterGroup>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-[15px] font-bold">
          {filtered ? `找到 ${results.length} 項政策` : `全部 ${results.length} 項政策`}
          {status && (
            <span className="ml-2 inline-block align-middle">
              <StatusBadge status={status} size="sm" />
            </span>
          )}
        </p>
        <div className="flex items-center gap-3">
          {filtered && (
            <button type="button" onClick={clearAll} className="text-[14px] font-bold text-teal-deep underline-offset-4 hover:underline">
              清除篩選
            </button>
          )}
          <label htmlFor={sortId} className="sr-only">
            排序方式
          </label>
          <select
            id={sortId}
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-10 rounded-lg border-2 border-edge bg-paper px-3 text-[14px] font-bold"
          >
            <option value="category">依分類排序</option>
            <option value="updated">依最近更新排序</option>
          </select>
        </div>
      </div>

      {results.length > 0 ? (
        <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <li key={p.id}>
              <PolicyCard policy={p} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 flex flex-col items-center gap-6 rounded-[28px] border-2 border-dashed border-teal-deep/30 bg-paper px-6 py-12 text-center">
          <PenguinSays pose="stand" penguinClassName="h-24 w-20" bubbleClassName="text-[14.5px]">
            找不到符合條件的政策。換個關鍵字，或清除篩選再看看？
          </PenguinSays>
          <button type="button" onClick={clearAll} className="btn btn-sm">
            清除全部篩選
          </button>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id}>
      <p id={id} className="text-[14px] font-black tracking-[0.08em]">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({ pressed, onClick, dot, children }: { pressed: boolean; onClick: () => void; dot?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-2 rounded-full border-2 border-edge px-3.5 text-[14px] font-bold transition-colors ${
        pressed ? "bg-teal-deep text-paper" : "bg-paper hover:bg-mint"
      }`}
    >
      {dot && <span className="h-3 w-3 rounded-full border-[1.5px] border-current" style={{ background: dot }} aria-hidden="true" />}
      {children}
      {pressed && (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M3.5 8.4l3 3 6-6.4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

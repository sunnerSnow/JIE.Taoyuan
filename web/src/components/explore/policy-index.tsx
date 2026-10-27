"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ArrowRight } from "@/components/ui/decor";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CategorySlug } from "@/data/types";
import { intercept } from "./intercept";
import type { ExploreIsland } from "./types";

/** 右側的「政策索引」：島嶼清單＋搜尋。沒有 JS 時連結仍可用（地圖失效的文字替代） */
export function PolicyIndex({
  islands,
  selected,
  activePolicy = null,
  onSelect,
  onOpenPolicy,
  listMode = false,
}: {
  islands: ExploreIsland[];
  selected: CategorySlug | null;
  /** 目前開著的政策（標示選取狀態） */
  activePolicy?: string | null;
  onSelect: (slug: CategorySlug | null) => void;
  /** 點政策：定位到所屬的島並打開政策面板 */
  onOpenPolicy: (slug: string) => void;
  listMode?: boolean;
}) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const total = islands.reduce((n, i) => n + i.policies.length, 0);
  const q = query.trim();
  const results = useMemo(() => {
    if (!q) return [];
    return islands.flatMap((i) =>
      i.policies
        .filter((p) => p.title.includes(q) || p.summary.includes(q) || i.pin.name.includes(q))
        .map((p) => ({ island: i, policy: p })),
    );
  }, [islands, q]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b-2 border-edge px-6 pb-5 pt-7">
        <p className="eyebrow">The Policy Index</p>
        <h2 className="mt-2 text-[24px] font-black leading-snug tracking-[0.06em]">選一座島，走進生活場景。</h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          {islands.length} 座政策島／{total} 項政策
        </p>
        <label htmlFor={inputId} className="sr-only">
          搜尋政策
        </label>
        <div className="relative mt-4">
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋政策、關鍵字…"
            className="h-12 w-full rounded-xl border-2 border-edge bg-cream pl-11 pr-4 text-[15px] placeholder:text-ink-soft/70 focus:bg-paper focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-deep"
          />
          <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth={2.2} />
            <path d="M13 13l4 4" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3" aria-live="polite">
        {q ? (
          results.length ? (
            <ul className="space-y-1">
              <li className="px-3 pb-2 text-[13px] text-ink-soft">找到 {results.length} 項</li>
              {results.map(({ island, policy }) => (
                <li key={policy.slug}>
                  <a
                    href={`/policies/${policy.slug}`}
                    onClick={(e) => intercept(e, () => onOpenPolicy(policy.slug))}
                    aria-current={activePolicy === policy.slug ? "true" : undefined}
                    className="block rounded-xl px-3 py-3 hover:bg-mint/60 aria-[current=true]:bg-mint"
                  >
                    <span className="text-[12px] font-bold text-teal-deep">
                      {island.pin.no} {island.pin.name}
                    </span>
                    <span className="mt-0.5 block font-bold">{policy.title}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-2">
                      <StatusBadge status={policy.status} size="sm" />
                      <span className="text-[12px] text-ink-soft">{policy.sourceLabel}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-8 text-center text-[14px] text-ink-soft">
              找不到「{q}」相關的政策。
              <br />
              換個關鍵字，或到
              <Link href="/policies" className="link-ink mx-1 font-bold">
                政策總覽
              </Link>
              用分類篩選。
            </p>
          )
        ) : (
          <ul className="space-y-1">
            {islands.map((island) => {
              const open = listMode || selected === island.pin.slug;
              return (
                <li key={island.pin.slug} className={`rounded-2xl transition-colors ${open && !listMode ? "bg-mint/50" : ""}`}>
                  <a
                    href={`/islands/${island.pin.slug}`}
                    onClick={(e) => {
                      if (listMode) return;
                      e.preventDefault();
                      onSelect(selected === island.pin.slug ? null : island.pin.slug);
                    }}
                    aria-current={selected === island.pin.slug ? "true" : undefined}
                    className={`flex items-center gap-4 rounded-2xl px-3 py-3 ${
                      selected === island.pin.slug && !listMode ? "border-l-4 border-edge" : "hover:bg-mint/40"
                    }`}
                  >
                    <span className="w-10 text-[24px] font-black italic leading-none tracking-tight text-teal" aria-hidden="true">
                      {island.pin.no}
                    </span>
                    <span className="flex-1 text-[16px] font-black tracking-[0.06em]">{island.pin.name}</span>
                    <span className="text-[12px] font-bold text-ink-soft">{island.policies.length} 項 ↗</span>
                  </a>
                  {open && (
                    <div className="pb-3 pl-[68px] pr-3">
                      <Link
                        href={`/islands/${island.pin.slug}`}
                        className="mb-1 inline-flex items-center gap-1 text-[13px] font-bold text-teal-deep hover:underline"
                      >
                        看{island.pin.name}分類頁 <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <ol className="space-y-0.5">
                        {island.policies.map((p) => (
                          <li key={p.slug}>
                            <a
                              href={`/policies/${p.slug}`}
                              onClick={(e) => intercept(e, () => onOpenPolicy(p.slug))}
                              aria-current={activePolicy === p.slug ? "true" : undefined}
                              className="flex items-start gap-2.5 rounded-lg py-1.5 pl-1 pr-1 hover:bg-paper aria-[current=true]:bg-paper aria-[current=true]:shadow-soft"
                            >
                              <span
                                className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-[1.5px] border-edge text-[11px] font-black"
                                style={{ background: island.pin.color }}
                              >
                                {p.n}
                              </span>
                              <span className="flex-1 text-[14px] font-bold leading-snug">{p.title}</span>
                            </a>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

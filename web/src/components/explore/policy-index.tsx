"use client";

import Link from "next/link";
import { ArrowRight } from "@/components/ui/decor";
import type { CategorySlug } from "@/data/types";
import { intercept } from "./intercept";
import { FilterBar, FilterResults, useExploreFilter } from "./policy-filter";
import type { ExploreIsland } from "./types";

/** 右側的「政策索引」：搜尋＋分類／狀態篩選；沒有篩選時列出五座島。沒有 JS 時連結仍可用（地圖失效的文字替代） */
export function PolicyIndex({
  islands,
  selected,
  activePolicy = null,
  onSelect,
  onOpenPolicy,
}: {
  islands: ExploreIsland[];
  selected: CategorySlug | null;
  /** 目前開著的政策（標示選取狀態） */
  activePolicy?: string | null;
  onSelect: (slug: CategorySlug | null) => void;
  /** 點政策：定位到所屬的島並打開政策面板 */
  onOpenPolicy: (slug: string) => void;
}) {
  const filter = useExploreFilter(islands);
  const total = islands.reduce((n, i) => n + i.policies.length, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b-2 border-edge px-6 pb-5 pt-7">
        <p className="eyebrow">The Policy Index</p>
        <h2 className="mt-2 text-[24px] font-black leading-snug tracking-[0.06em]">選一座島，走進生活場景。</h2>
        <p className="mb-4 mt-1 text-[13px] text-ink-soft">
          {islands.length} 座政策島／{total} 項政策
        </p>
        <FilterBar islands={islands} filter={filter} />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
        {filter.active ? (
          <FilterResults filter={filter} activePolicy={activePolicy} onOpenPolicy={onOpenPolicy} />
        ) : (
          <ul className="space-y-1">
            {islands.map((island) => {
              const open = selected === island.pin.slug;
              return (
                <li key={island.pin.slug} className={`rounded-2xl transition-colors ${open ? "bg-mint/50" : ""}`}>
                  <a
                    href={`/islands/${island.pin.slug}`}
                    onClick={(e) => intercept(e, () => onSelect(open ? null : island.pin.slug))}
                    aria-current={open ? "true" : undefined}
                    className={`flex items-center gap-4 rounded-2xl px-3 py-3 ${open ? "border-l-4 border-edge" : "hover:bg-mint/40"}`}
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

"use client";

import { RelationEvidence, RelationLineSample, RelationTypeBadge } from "@/components/policy/relation-badge";
import { shortTitle } from "@/data/policies";
import { RELATION_DISCLAIMER, type Relation, type RelationType, relationTypeInfo } from "@/data/relations";
import type { ExploreIsland, ExplorePolicy } from "./types";

export const RELATIONS_HEADING_ID = "relations-panel-title";

/** 政策在世界圖上的位置（百分比）與所屬的島 */
export type SpotIndex = Record<string, { x: number; y: number; island: ExploreIsland; policy: ExplorePolicy }>;

export function spotIndex(islands: ExploreIsland[]): SpotIndex {
  const out: SpotIndex = {};
  for (const island of islands) {
    island.spots.forEach((spot, i) => {
      out[spot.slug] = { x: spot.x, y: spot.y, island, policy: island.policies[i] };
    });
  }
  return out;
}

type Pt = { x: number; y: number };

/**
 * 兩棟建築之間的弧線（世界圖的像素座標），弧度依距離調整。
 * 總覽往上拱；島內的線往下彎，避開往上長的圖釘。at(t) 是曲線上的點，用來放關聯按鈕。
 */
export function arc(a: Pt, b: Pt, ww: number, wh: number, bendTo: "up" | "down" = "up") {
  const x1 = (a.x / 100) * ww;
  const y1 = (a.y / 100) * wh;
  const x2 = (b.x / 100) * ww;
  const y2 = (b.y / 100) * wh;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  if ((bendTo === "up") === ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const bend = Math.min(len * 0.28, 90);
  const cx = (x1 + x2) / 2 + nx * bend;
  const cy = (y1 + y2) / 2 + ny * bend;
  // 二次貝茲曲線
  const at = (t: number): Pt => ({
    x: (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t ** 2 * x2,
    y: (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t ** 2 * y2,
  });
  return { d: `M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`, from: { x: x1, y: y1 }, to: { x: x2, y: y2 }, at };
}

const MARKER_T = [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74, 0.2, 0.8];

/**
 * 關聯按鈕的位置：先放在弧線中點，跟已經放好的按鈕或線的端點太近，就沿著弧線往兩邊挪。
 * 用鏡頭的目標倍率換算成螢幕距離（按鈕反向縮放後是固定大小）。
 */
export function placeMarkers(arcs: { at: (t: number) => Pt; from: Pt; to: Pt }[], scale: number, gap = 36): Pt[] {
  const placed: Pt[] = [];
  const ends = arcs.flatMap((a) => [a.from, a.to]);
  const clearance = (p: Pt) =>
    Math.min(
      ...placed.map((q) => Math.hypot(p.x - q.x, p.y - q.y) * scale),
      ...ends.map((q) => Math.hypot(p.x - q.x, p.y - q.y) * scale + gap / 2),
      Infinity,
    );
  for (const a of arcs) {
    let best = a.at(0.5);
    let bestGap = -1;
    for (const t of MARKER_T) {
      const p = a.at(t);
      const g = clearance(p);
      if (g >= gap) {
        best = p;
        break;
      }
      if (g > bestGap) {
        best = p;
        bestGap = g;
      }
    }
    placed.push(best);
  }
  return placed;
}

/** 世界圖上的關聯線（放在插畫上、圖釘下）；線寬與虛線間距依鏡頭倍率反向縮放，螢幕上粗細固定 */
export function RelationLines({
  lines,
  ww,
  wh,
  scale,
  activeId = null,
}: {
  lines: { relation: Relation; d: string; from: Pt; to: Pt }[];
  ww: number;
  wh: number;
  scale: number;
  /** 選取中的關聯：加粗，其他淡出 */
  activeId?: string | null;
}) {
  const k = 1 / scale;
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${ww} ${wh}`} aria-hidden="true" style={{ zIndex: 1 }}>
      {lines.map(({ relation, d, from, to }, i) => {
        const info = relationTypeInfo[relation.type];
        const dim = activeId && activeId !== relation.id;
        const on = activeId === relation.id;
        const dash = info.dash ? info.dash.split(" ").map((n) => Number(n) * k * (on ? 1.3 : 1)).join(" ") : undefined;
        return (
          <g
            key={relation.id}
            data-relation={relation.id}
            className="transition-opacity duration-300"
            style={{ opacity: dim ? 0.18 : 1, animation: `link-in .6s ${0.15 + i * 0.04}s backwards ease-out` }}
          >
            {/* 白色外框：讓線在彩色插畫上也看得清楚 */}
            <path d={d} fill="none" stroke="#fff" strokeOpacity={0.9} strokeWidth={(on ? 7.5 : 6) * k} strokeLinecap="round" />
            <path d={d} fill="none" stroke={info.color} strokeWidth={(on ? 4 : 3) * k} strokeLinecap="round" strokeDasharray={dash} />
            {[from, to].map((p, j) => (
              <circle key={j} cx={p.x} cy={p.y} r={(on ? 5 : 4) * k} fill="#fff" stroke={info.color} strokeWidth={2.4 * k} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

const ICON: Record<RelationType, string> = {
  source: "M7 3h7l4 4v14H7zM14 3v4h4",
  scenario: "M12 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM5.5 20c.8-3.6 3.4-5.6 6.5-5.6s5.7 2 6.5 5.6",
  editorial: "M5 19l1-4L15.5 5.5a2 2 0 0 1 3 3L9 18z",
};

/** 弧線中點的按鈕：反向縮放成固定大小，可以用鍵盤聚焦 */
export function RelationMarker({
  relation,
  a,
  b,
  x,
  y,
  active,
  compact = false,
  onClick,
}: {
  relation: Relation;
  a: ExplorePolicy;
  b: ExplorePolicy;
  /** 世界圖的百分比座標 */
  x: number;
  y: number;
  active: boolean;
  /** 手機：小一號 */
  compact?: boolean;
  onClick: () => void;
}) {
  const info = relationTypeInfo[relation.type];
  return (
    <li className="absolute" style={{ left: `${x}%`, top: `${y}%`, zIndex: active ? 6 : 5 }}>
      <div className="absolute left-0 top-0" style={{ transform: "translate(-50%,-50%) scale(var(--inv,1))" }}>
        <button
          type="button"
          onClick={onClick}
          aria-pressed={active}
          aria-label={`${info.label}：${shortTitle(a.title)} 與 ${shortTitle(b.title)}，${relation.label}`}
          className={`grid place-items-center rounded-full border-[2.5px] bg-paper shadow-soft transition-transform duration-200 hover:scale-110 aria-pressed:scale-125 ${compact ? "h-[26px] w-[26px]" : "h-8 w-8"}`}
          style={{ borderColor: info.color, color: active ? "#fff" : info.color, background: active ? info.color : undefined }}
        >
          <svg viewBox="0 0 24 24" className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={ICON[relation.type]} />
          </svg>
        </button>
      </div>
    </li>
  );
}

/** 關聯總覽的面板：圖例＋所有關聯的清單（地圖的文字替代）；選了一條就顯示它的說明卡 */
export function RelationsPanel({
  relations,
  spots,
  activeId,
  onPick,
  onOpenPolicy,
  onClose,
}: {
  relations: Relation[];
  spots: SpotIndex;
  activeId: string | null;
  onPick: (id: string | null) => void;
  onOpenPolicy: (slug: string) => void;
  onClose: () => void;
}) {
  const active = relations.find((r) => r.id === activeId) ?? null;
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        {active ? (
          <button
            type="button"
            onClick={() => onPick(null)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-mint pl-2 pr-3.5 text-[13px] font-black tracking-[0.06em] hover:bg-mint-deep"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            所有關聯
          </button>
        ) : (
          <p className="eyebrow">Policy Links</p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-edge bg-paper hover:bg-mint"
          aria-label="關閉關聯總覽"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {active ? (
        <RelationCard relation={active} spots={spots} onOpenPolicy={onOpenPolicy} />
      ) : (
        <>
          <h2 id={RELATIONS_HEADING_ID} tabIndex={-1} className="mt-3 text-[21px] font-black leading-snug tracking-[0.06em] text-teal-deep focus:outline-none">
            政策之間的關聯
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
            {relations.length} 條關聯。點地圖上的圓形按鈕，或從下面的清單選一條，看它的依據。
          </p>
          <RelationLegend />
          <ul className="mt-4 space-y-1.5">
            {relations.map((r) => {
              const a = spots[r.a];
              const b = spots[r.b];
              if (!a || !b) return null;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => onPick(r.id)}
                    className="flex w-full flex-col items-start gap-1 rounded-2xl border-2 border-transparent px-3 py-2.5 text-left hover:border-edge hover:bg-mint/50"
                  >
                    <RelationTypeBadge type={r.type} />
                    <span className="text-[14px] font-black leading-snug">
                      {shortTitle(a.policy.title)} <span className="text-teal-deep">↔</span> {shortTitle(b.policy.title)}
                    </span>
                    <span className="text-[12.5px] leading-relaxed text-ink-soft">{r.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

/** 圖例：三種關聯的線型、圖示與說明 */
export function RelationLegend() {
  return (
    <div className="mt-4 rounded-2xl border-2 border-edge px-3.5 py-3">
      <p className="text-[12px] font-black tracking-[0.16em] text-teal-deep">圖例</p>
      <ul className="mt-2 space-y-2">
        {(Object.keys(relationTypeInfo) as RelationType[]).map((t) => (
          <li key={t} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed">
            <RelationLineSample type={t} className="mt-1.5 h-2 w-9 shrink-0" />
            <span>
              <span className="font-black" style={{ color: relationTypeInfo[t].color }}>
                {relationTypeInfo[t].label}
              </span>
              <span className="block text-ink-soft">{relationTypeInfo[t].desc}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2.5 border-t-2 border-dashed border-teal-deep/15 pt-2 text-[12px] leading-relaxed text-ink-soft">{RELATION_DISCLAIMER}</p>
    </div>
  );
}

/** 一條關聯的說明卡：類型、兩端政策（可直接打開）、依據與出處 */
function RelationCard({ relation, spots, onOpenPolicy }: { relation: Relation; spots: SpotIndex; onOpenPolicy: (slug: string) => void }) {
  const ends = [spots[relation.a], spots[relation.b]].filter(Boolean);
  return (
    <div className="mt-4">
      <RelationTypeBadge type={relation.type} full />
      <h2 id={RELATIONS_HEADING_ID} tabIndex={-1} className="mt-3 text-[19px] font-black leading-snug tracking-[0.04em] text-teal-deep focus:outline-none">
        {relation.label}
      </h2>
      <ul className="mt-4 space-y-2">
        {ends.map(({ policy, island }) => (
          <li key={policy.slug}>
            <button
              type="button"
              onClick={() => onOpenPolicy(policy.slug)}
              className="group flex w-full items-center gap-2.5 rounded-2xl border-2 border-edge bg-paper px-3 py-2.5 text-left hover:bg-mint"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-black" style={{ background: island.pin.color }} aria-hidden="true">
                {policy.n}
              </span>
              <span className="flex-1">
                <span className="block text-[12px] font-bold text-teal-deep">
                  {island.pin.no} {island.pin.name}
                </span>
                <span className="block text-[14.5px] font-black leading-snug group-hover:underline">{shortTitle(policy.title)}</span>
              </span>
              <span className="text-[12px] font-bold text-teal-deep" aria-hidden="true">
                打開 ›
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12.5px] leading-relaxed text-ink-soft">{relationTypeInfo[relation.type].desc}</p>
      <RelationEvidence relation={relation} open />
      <p className="mt-4 border-t-2 border-dashed border-teal-deep/15 pt-3 text-[12px] leading-relaxed text-ink-soft">{RELATION_DISCLAIMER}</p>
    </div>
  );
}

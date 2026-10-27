"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { CitySim } from "./city-sim";
import { lookOf } from "./citizens";
import type { ExploreCitizen } from "./types";

const noop = () => () => {};

/** 小人在世界圖上的高度（px，縮放前）與視框高度，換算跨一步的距離用 */
const FIGURE_PX = 15;
const VIEW_H = 17;
/** 腿長 5.2、前後各擺 30°：跨一步腳尖移動約 2 × 5.2 × sin30° = 5.2 個視框單位 */
const STEP_UNITS = 5.2;
/** 拉近時小人最多放大到 1.5 倍（約 22px），和 button 上的 scale(min(1, inv × 1.5)) 一致 */
const MAX_ZOOM = 1.5;

/** 衣服顏色調暗，給後面那隻手臂用 */
function shade(hex: string, k = 0.78) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.round(v * k).toString(16).padStart(2, "0");
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
}

/**
 * 地圖上走動的市民（虛構情境）：跟著世界圖一起縮放，全景時是小小的人，拉近島時看得清楚。
 * 位置由 CitySim 每一幀算好、直接改 transform，不經過 React；動畫關掉時停在原地。
 */
export function Walkers({
  sim,
  citizens,
  ww,
  wh,
  scale,
  running,
  tags,
  tagIds,
  activeId,
  tagOf,
  onPick,
}: {
  sim: CitySim;
  citizens: ExploreCitizen[];
  ww: number;
  wh: number;
  /** 世界圖目前的縮放倍率 */
  scale: number;
  running: boolean;
  /** 顯示名牌（正在去哪裡） */
  tags: boolean;
  /** 只有這些市民顯示名牌（選了島時只標那座島的人）；null 表示都不顯示 */
  tagIds: Set<string> | null;
  activeId: string | null;
  tagOf: (id: string) => string;
  onPick: (id: string) => void;
}) {
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  // 名牌的文字要跟著出發、抵達更新；沒開名牌就不訂閱，地圖不會一直重畫
  useSyncExternalStore(tags ? sim.subscribe : noop, sim.getVersion, () => 0);

  // 步頻：跨一步的時間 = 一步的距離 ÷ 移動速度。小人拉近時有放大上限，所以看起來的步幅會比地圖縮放小
  useEffect(() => {
    const cap = Math.min(1, MAX_ZOOM / Math.max(scale, 0.01));
    const step = (STEP_UNITS / VIEW_H) * FIGURE_PX * cap;
    sim.positions().forEach((w, i) => {
      const half = step / ((w.speed * ww) / 100);
      refs.current[i]?.style.setProperty("--half", `${Math.min(0.8, Math.max(0.22, half)).toFixed(3)}s`);
    });
  }, [sim, ww, scale]);

  useEffect(() => {
    const place = () => {
      sim.positions().forEach((w, i) => {
        const el = refs.current[i];
        if (!el) return;
        el.style.transform = `translate(${(w.x / 100) * ww}px, ${(w.y / 100) * wh}px)`;
        const walking = w.status.walking && running ? "1" : "0";
        if (el.dataset.walking !== walking) el.dataset.walking = walking;
        const dir = String(w.dir);
        if (el.dataset.dir !== dir) el.dataset.dir = dir;
      });
    };
    place();
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      // 分頁切走回來時不要一口氣瞬移
      sim.tick(Math.min(0.1, (now - last) / 1000));
      last = now;
      place();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sim, running, ww, wh]);

  return (
    <ul aria-label="在路上的市民（虛構）">
      {citizens.map((c, i) => {
        const look = lookOf(c);
        const active = activeId === c.id;
        return (
          <li
            key={c.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="walker pointer-events-none absolute left-0 top-0"
            style={{ zIndex: active ? 6 : 2 }}
          >
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                onPick(c.id);
              }}
              aria-label={`市民（虛構）：${c.persona}`}
              className="pointer-events-auto absolute bottom-0 left-0 block h-[15px] w-[9px] -translate-x-1/2 cursor-pointer"
              // 跟著地圖縮放，但拉近時最多約 22px 高，才不會把島塞滿
              style={{ transform: "scale(min(1, calc(var(--inv, 1) * 1.5)))", transformOrigin: "50% 100%" }}
            >
              <svg viewBox="0 0 10 17" className="block h-full w-full overflow-visible" aria-hidden="true">
                <ellipse cx="5" cy="16.4" rx="2.8" ry="0.8" fill="rgba(0,70,70,.22)" />
                {active && <ellipse cx="5" cy="16.4" rx="4.6" ry="1.6" fill="none" stroke="#F9DE3A" strokeWidth="1.3" />}
                {/* 側面：面向右邊；後面的手腳顏色深一點，前後交替才看得出在走 */}
                <g className="walker-flip">
                  <g className="walker-body">
                    <rect className="limb leg leg-back" x="4.2" y="11" width="1.6" height="5.4" rx="0.8" fill="#2C3A44" />
                    <rect className="limb arm arm-back" x="4.35" y="7.3" width="1.3" height="4" rx="0.65" fill={shade(look.shirt)} />
                    <rect className="limb leg leg-front" x="4.2" y="11" width="1.6" height="5.4" rx="0.8" fill="#3F5260" />
                    <rect x="3.1" y="6.5" width="3.9" height="5.9" rx="1.9" fill={look.shirt} />
                    <rect className="limb arm arm-front" x="4.35" y="7.3" width="1.3" height="4" rx="0.65" fill={look.shirt} stroke={shade(look.shirt, 0.86)} strokeWidth="0.3" />
                    {look.long && <path d="M2.7 4.2c0-2 1.1-3.2 2.6-3.2 1 0 1.6.4 2 1L4.6 7.6H2.9z" fill={look.hair} />}
                    <circle cx="5.3" cy="4.1" r="2.45" fill={look.skin} />
                    <path d="M2.9 4.3C2.7 2.4 3.9 1.3 5.4 1.3c1.3 0 2.3.8 2.4 1.9-1 .1-2 .1-2.8-.3-.3.7-.4 1.4-.2 2.2-.7.1-1.3-.1-1.9-.8z" fill={look.hair} />
                    <circle cx="6.6" cy="4.2" r="0.38" fill="#234647" />
                  </g>
                </g>
              </svg>
            </button>
            {tags && tagIds?.has(c.id) && tagOf(c.id) && (
              <span
                className="absolute bottom-[17px] left-0 whitespace-nowrap rounded-full border-2 border-edge bg-paper px-2 py-0.5 text-[11px] font-bold leading-tight shadow-soft"
                style={{ transform: "translateX(-50%) scale(var(--inv,1))", transformOrigin: "50% 100%" }}
              >
                {tagOf(c.id)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

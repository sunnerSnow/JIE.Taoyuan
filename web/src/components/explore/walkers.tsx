"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { CitySim } from "./city-sim";
import { lookOf } from "./citizens";
import type { ExploreCitizen } from "./types";

const noop = () => () => {};

/**
 * 地圖上走動的市民（虛構情境）：跟著世界圖一起縮放，全景時是小小的人，拉近島時看得清楚。
 * 位置由 CitySim 每一幀算好、直接改 transform，不經過 React；動畫關掉時停在原地。
 */
export function Walkers({
  sim,
  citizens,
  ww,
  wh,
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
                <ellipse cx="5" cy="16.3" rx="3.2" ry="0.9" fill="rgba(0,70,70,.22)" />
                {active && <ellipse cx="5" cy="16.3" rx="4.8" ry="1.7" fill="none" stroke="#F9DE3A" strokeWidth="1.3" />}
                <g className="walker-flip">
                  <rect className="leg-l" x="3.1" y="11" width="1.6" height="5" rx="0.8" fill="#3D4F5C" />
                  <rect className="leg-r" x="5.3" y="11" width="1.6" height="5" rx="0.8" fill="#3D4F5C" />
                  <rect x="2.2" y="6.4" width="5.6" height="6.2" rx="2.3" fill={look.shirt} />
                  {look.long && <path d="M2.4 4.6c0-2.2 1.2-3.5 2.6-3.5s2.6 1.3 2.6 3.5v3H2.4z" fill={look.hair} />}
                  <circle cx="5" cy="4.2" r="2.6" fill={look.skin} />
                  <path d="M2.4 4c0-1.8 1.1-3 2.6-3s2.6 1.2 2.6 3c-.8-.9-1.7-1.3-2.6-1.3S3.2 3.1 2.4 4z" fill={look.hair} />
                  <circle cx="6.3" cy="4.4" r="0.38" fill="#234647" />
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

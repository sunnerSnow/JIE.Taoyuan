"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import type { SpotPin } from "@/lib/map-data";
import { liftLabels } from "@/lib/pin-layout";

const STEM = 12;
const DOT = 10;

/** 分類頁島嶼插畫上的政策圖釘（編號對應下方卡片）；圖釘靠太近時自動拉長細桿，避免互相蓋住 */
export function IslandPins({ spots, color, label }: { spots: SpotPin[]; color: string; label: string }) {
  const listRef = useRef<HTMLOListElement>(null);
  const pinRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stemRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const layout = () => {
      const { width, height } = list.getBoundingClientRect();
      const boxes = spots.map((s, i) => ({
        x: (s.x / 100) * width,
        y: (s.y / 100) * height - STEM - DOT,
        w: pinRefs.current[i]?.offsetWidth ?? 0,
        h: pinRefs.current[i]?.offsetHeight ?? 0,
      }));
      liftLabels(boxes).forEach((lift, i) => {
        const stem = stemRefs.current[i];
        if (stem) stem.style.height = `${STEM + lift}px`;
      });
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(list);
    return () => ro.disconnect();
  }, [spots]);

  return (
    <ol ref={listRef} className="absolute inset-0" aria-label={label}>
      {spots.map((s, i) => (
        <li key={s.slug} className="absolute hover:z-20 focus-within:z-20" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
          <Link
            href={`/policies/${s.slug}`}
            className="group absolute bottom-0 left-0 flex -translate-x-1/2 flex-col items-center"
            style={{ animation: `pin-drop .5s ${0.2 + i * 0.08}s both var(--ease-out-soft)` }}
            aria-label={`政策 ${s.n}：${s.title}`}
          >
            <span
              ref={(el) => {
                pinRefs.current[i] = el;
              }}
              className="grid h-9 w-9 place-items-center rounded-full border-2 border-edge text-[14px] font-black shadow-soft transition-transform group-hover:-translate-y-0.5"
              style={{ background: color }}
            >
              {s.n}
            </span>
            <span
              ref={(el) => {
                stemRefs.current[i] = el;
              }}
              className="h-3 w-0.5 bg-teal-deep"
              aria-hidden="true"
            />
            <span className="h-2.5 w-2.5 rounded-full border-2 border-edge bg-sun" aria-hidden="true" />
            <span
              role="presentation"
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-max max-w-[220px] -translate-x-1/2 rounded-xl border-2 border-edge bg-paper px-3 py-1.5 text-[13px] font-black opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 lg:block"
            >
              {s.title}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

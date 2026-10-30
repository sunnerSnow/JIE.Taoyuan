"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "@/components/ui/decor";
import { districtShapes, mapViewBox } from "@/data/taoyuan-map";
import type { District, TrailEntry } from "@/data/trail";

/** 給瀏覽器的行程：日期、類型先在伺服器端轉好文字，政見只帶連結需要的欄位 */
export type TrailItem = Omit<TrailEntry, "policies"> & { day: string; kindLabel: string; policies: { slug: string; title: string }[] };

type Place = District | "outside";

/** 企鵝腳丫：三根尖尖的腳趾、中間連著蹼，腳跟朝下（24×24） */
const FOOT = "M12 22.6C10.2 22.6 9.3 21 8.6 19L3.1 7.2C2.6 6 3.9 5.2 4.8 6.1L8.9 10.4L10.6 2.8C10.9 1.6 13.1 1.6 13.4 2.8L15.1 10.4L19.2 6.1C20.1 5.2 21.4 6 20.9 7.2L15.4 19C14.7 21 13.8 22.6 12 22.6Z";
const FOOT_FILL = "#F2A93B";
const S = 44; // 地圖上一隻腳丫的大小（viewBox 單位）

/** 去過越多次顏色越深；沒去過是米色 */
function shade(n: number) {
  if (n >= 10) return "#7FC6BE";
  if (n >= 5) return "#9FD6CF";
  if (n >= 3) return "#BCE4DF";
  return n ? "#D6EFEB" : "#F4F1E8";
}

/** 一對腳丫：左腳低一點、右腳高一點，像正在往前走 */
function Footprints({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true">
      <use href="#penguin-foot" x={x - S * 1.02} y={y - S * 0.42} width={S} height={S} transform={`rotate(-12 ${x - S * 0.52} ${y + S * 0.08})`} />
      <use href="#penguin-foot" x={x + S * 0.02} y={y - S * 0.92} width={S} height={S} transform={`rotate(12 ${x + S * 0.52} ${y - S * 0.42})`} />
    </g>
  );
}

/** 小圖示用的單隻腳丫（清單、圖例） */
export function FootIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={FOOT} fill={FOOT_FILL} stroke="#234647" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 杰伴出發的地圖與行程清單：去過的區塗色、放一對企鵝腳丫（去過幾次標數字）。
 * 點地圖上的區或下面的區名按鈕，清單只列那一區的行程；地圖本身只是視覺，篩選靠按鈕（鍵盤、讀屏器都能用）。
 */
export function TrailExplorer({ items, districts }: { items: TrailItem[]; districts: readonly District[] }) {
  const [selected, setSelected] = useState<Place | null>(null);
  const counts = new Map<Place, number>();
  for (const t of items) if (t.district) counts.set(t.district, (counts.get(t.district) ?? 0) + 1);
  const outside = items.filter((t) => t.district === "outside");
  const visited = districts.filter((d) => counts.get(d));
  const shown = selected ? items.filter((t) => t.district === selected) : items;
  const dates = [...new Set(shown.map((t) => t.date))];
  const toggle = (p: Place) => setSelected((s) => (s === p ? null : p));
  const placeName = (p: Place) => (p === "outside" ? "桃園以外" : p);

  return (
    <>
      <section aria-labelledby="trail-map-title" className="mt-12 grid items-start gap-8 md:grid-cols-[minmax(0,460px)_1fr] md:gap-10">
        <figure className="rounded-[28px] border-2 border-edge bg-paper p-3 shadow-soft sm:p-5">
          <svg viewBox={mapViewBox} className="h-auto w-full" role="img" aria-label={`桃園市 13 區地圖：記錄到 ${visited.length} 區有走訪，${visited.join("、") || "目前沒有"}`}>
            <defs>
              <symbol id="penguin-foot" viewBox="0 0 24 24">
                <path d={FOOT} fill={FOOT_FILL} stroke="#234647" strokeWidth={1.3} strokeLinejoin="round" />
              </symbol>
            </defs>
            {districts.map((d) => {
              const n = counts.get(d) ?? 0;
              return (
                <path
                  key={d}
                  d={districtShapes[d].d}
                  fill={selected === d ? "#F9DE3A" : shade(n)}
                  stroke="#6FA9A5"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  className={n ? "cursor-pointer transition-[fill] hover:brightness-95" : ""}
                  onClick={n ? () => toggle(d) : undefined}
                >
                  <title>{n ? `${d}：記錄到 ${n} 次` : `${d}：還沒有記錄`}</title>
                </path>
              );
            })}
            {districts.map((d) => {
              const [x, y] = districtShapes[d].label;
              const n = counts.get(d) ?? 0;
              return (
                <g key={d} className="pointer-events-none">
                  {n > 0 && <Footprints x={x} y={y} />}
                  <text
                    x={x}
                    y={n ? y + S * 1.3 : y + 10}
                    textAnchor="middle"
                    fontSize={30}
                    fontWeight={900}
                    fill={n ? "#234647" : "#7A8D8E"}
                    stroke="#FFFFFF"
                    strokeWidth={6}
                    paintOrder="stroke"
                  >
                    {d.replace("區", "")}
                    {n > 1 ? ` ×${n}` : ""}
                  </text>
                </g>
              );
            })}
          </svg>
          <figcaption className="mt-2 flex items-center gap-2 px-1 text-[12.5px] font-bold text-ink-soft">
            <FootIcon className="h-4 w-4 shrink-0" />
            有企鵝腳丫的區是記錄到走訪過的地方，顏色越深去得越多次；點一下可以只看那一區。
          </figcaption>
        </figure>

        <div>
          <h2 id="trail-map-title" className="text-[22px] font-black tracking-[0.08em]">
            桃園 13 區
          </h2>
          <p className="mt-1 text-[14px] text-ink-soft">
            記錄到 {visited.length} 區{outside.length > 0 ? `，另有 ${outside.length} 筆在桃園以外` : ""}。數字是記錄到的次數。
          </p>
          <ul className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-3">
            {districts.map((d) => {
              const n = counts.get(d) ?? 0;
              return (
                <li key={d}>
                  {n ? (
                    <button
                      type="button"
                      aria-pressed={selected === d}
                      onClick={() => toggle(d)}
                      className={`flex min-h-[48px] w-full items-center justify-between gap-1.5 rounded-2xl border-2 px-3 text-[15px] font-black transition-colors ${
                        selected === d ? "border-teal-deep bg-sun" : "border-teal-deep bg-mint hover:bg-mint-deep"
                      }`}
                    >
                      {d}
                      <span className="font-display text-[18px] text-teal-deep">{n}</span>
                    </button>
                  ) : (
                    <span className="flex min-h-[48px] items-center rounded-2xl border-2 border-edge bg-paper px-3 text-[15px] font-bold text-ink-soft">
                      {d}
                      <span className="sr-only">：還沒有記錄</span>
                    </span>
                  )}
                </li>
              );
            })}
            {outside.length > 0 && (
              <li className="col-span-full">
                <button
                  type="button"
                  aria-pressed={selected === "outside"}
                  onClick={() => toggle("outside")}
                  className={`flex min-h-[48px] w-full items-center justify-between gap-2 rounded-2xl border-2 border-dashed px-3 text-left text-[15px] font-black ${
                    selected === "outside" ? "border-teal-deep bg-sun" : "border-teal-deep/50 bg-paper hover:bg-mint"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FootIcon className="h-5 w-5 shrink-0" />
                    桃園以外：{[...new Set(outside.map((t) => t.place))].join("、")}
                  </span>
                  <span className="font-display text-[18px] text-teal-deep">{outside.length}</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      </section>

      <section aria-labelledby="trail-log" className="mt-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="trail-log" aria-live="polite" className="text-[22px] font-black tracking-[0.08em]">
            {selected ? `${placeName(selected)}的行程` : "行程紀錄"}
            <span className="ml-2 text-[15px] font-bold tracking-normal text-ink-soft">{shown.length} 筆</span>
          </h2>
          {selected && (
            <button type="button" className="btn btn-sm" onClick={() => setSelected(null)}>
              看全部行程
            </button>
          )}
        </div>
        <ol className="mt-6 space-y-10">
          {dates.map((date) => (
            <li key={date}>
              <h3 className="flex items-center gap-3 text-[18px] font-black text-teal-deep">
                <FootIcon className="h-5 w-5 shrink-0" />
                <time dateTime={date}>{shown.find((t) => t.date === date)!.day}</time>
              </h3>
              <ul className="mt-4 space-y-4 border-l-2 border-dashed border-teal-deep/30 pl-5 sm:pl-7">
                {shown
                  .filter((t) => t.date === date)
                  .map((t) => (
                    <li key={t.id} id={t.id} className="scroll-mt-28">
                      <article aria-labelledby={`${t.id}-title`} className="rounded-[22px] border-2 border-edge bg-paper p-5 shadow-soft sm:p-6">
                        <p className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
                          <span className="rounded-full bg-sun px-2.5 py-0.5 font-black">{t.kindLabel}</span>
                          <span className="text-ink-soft">
                            {t.place ?? "來源沒有寫地點"}
                            {/* 地點已經寫到區名（例如「中壢美豐福德祠」）就不再重複 */}
                            {t.district && t.district !== "outside" && !t.place?.includes(t.district.replace("區", "")) ? `・${t.district}` : ""}
                          </span>
                        </p>
                        <h4 id={`${t.id}-title`} className="mt-3 text-[19px] font-black leading-snug tracking-[0.04em]">
                          {t.title}
                        </h4>
                        <p className="mt-2 text-[15px] leading-[1.85] text-ink-soft">{t.summary}</p>
                        {t.policies.length > 0 && (
                          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] font-bold">
                            <span className="text-ink-soft">相關政見</span>
                            {t.policies.map((p) => (
                              <Link key={p.slug} href={`/policies/${p.slug}`} className="inline-flex items-center gap-1 text-teal-deep hover:underline">
                                {p.title}
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            ))}
                          </p>
                        )}
                        <ul className="mt-3 space-y-1 text-[13.5px] leading-relaxed">
                          {t.sources.map((s) => (
                            <li key={s.url} className="text-ink-soft">
                              <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-ink break-words">
                                {s.title} <span aria-hidden="true">↗</span>
                                <span className="sr-only">（另開新視窗）</span>
                              </a>
                              <span className="ml-1.5 whitespace-nowrap">
                                {s.outlet}・{s.date.slice(5).replace("-", "/")}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </article>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

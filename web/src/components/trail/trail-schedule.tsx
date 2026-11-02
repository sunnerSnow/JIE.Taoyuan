"use client";

import { useMemo, useSyncExternalStore } from "react";
import { type ShareImage, shareFiles, useShareFiles } from "@/components/site/use-share-files";
import type { ScheduleItem } from "@/data/schedule";
import { FootIcon } from "./trail-explorer";

/** 一天的行程預告：日期文字、圖卡網址與大小先在伺服器端算好 */
export type ScheduleCardDay = ShareImage & { date: string; day: string; items: ScheduleItem[]; alt: string; width: number; height: number };

const noop = () => () => {};
const todayTaipei = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(new Date());
const NONE: ScheduleCardDay[] = [];

/**
 * 下一站行程預告：只列今天以後的日子（頁面是靜態產生的，所以在瀏覽器端用台灣時間判斷），一天一張分享圖。
 * 文字清單給人看、給讀屏器讀；圖卡只是方便傳給親友，內容和清單一樣。
 */
export function TrailSchedule({ days, note, lineUrl }: { days: ScheduleCardDay[]; note: string; lineUrl: string }) {
  const today = useSyncExternalStore(noop, todayTaipei, () => null);
  const upcoming = useMemo(() => (today ? days.filter((d) => d.date >= today).sort((a, b) => a.date.localeCompare(b.date)) : NONE), [days, today]);
  const { files } = useShareFiles(upcoming);
  const tomorrow = today && new Date(Date.parse(today) + 86_400_000).toISOString().slice(0, 10);

  return (
    <section aria-labelledby="trail-next" className="rounded-[28px] border-2 border-teal-deep/30 bg-paper p-5 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-[14px] tracking-[0.14em] text-coral">NEXT STOP</p>
          <h2 id="trail-next" className="mt-1 text-[24px] font-black tracking-[0.08em]">
            下一站行程預告
          </h2>
        </div>
        <a href={lineUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
          加 LINE 好友收行程公告
          <span className="sr-only">（另開新視窗）</span>
        </a>
      </div>
      <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">{note}。每天的行程都可以存成圖片，傳給想到現場的親友。</p>

      {today !== null &&
        (upcoming.length === 0 ? (
          <p className="mt-6 rounded-2xl border-2 border-dashed border-edge px-5 py-4 text-[15px] font-bold text-ink-soft">
            目前沒有新的行程預告，最新行程請看候選人 LINE 官方帳號的公告。
          </p>
        ) : (
          <ol className="mt-7 space-y-10">
            {upcoming.map((d) => {
              const when = d.date === today ? "今天" : d.date === tomorrow ? "明天" : null;
              return (
                <li key={d.date} className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_280px] md:gap-8">
                  <div>
                    <h3 className="flex flex-wrap items-center gap-2.5 text-[19px] font-black text-teal-deep">
                      <FootIcon className="h-5 w-5 shrink-0" />
                      {when && <span className="rounded-full bg-sun px-2.5 py-0.5 text-[14px] text-ink">{when}</span>}
                      <time dateTime={d.date}>{d.day}</time>
                    </h3>
                    <ol className="mt-4 space-y-3">
                      {d.items.map((it) => (
                        <li key={`${it.time}-${it.title}`} className="flex gap-4 rounded-[20px] border-2 border-edge bg-cream/60 p-4 sm:gap-5 sm:p-5">
                          <time dateTime={`${d.date}T${it.time}+08:00`} className="w-[62px] shrink-0 font-display text-[22px] leading-tight text-coral">
                            {it.time}
                          </time>
                          <div className="min-w-0">
                            <p className="text-[17px] font-black leading-snug">{it.title}</p>
                            <p className="mt-1.5 text-[15px] font-bold leading-snug text-teal-deep">{it.place}</p>
                            {it.address && <p className="mt-0.5 text-[14px] leading-snug text-ink-soft">{it.address}</p>}
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${it.place} ${it.address ?? ""}`.trim())}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link-ink mt-1.5 inline-block text-[13.5px] font-bold"
                            >
                              在 Google 地圖上看 <span aria-hidden="true">↗</span>
                              <span className="sr-only">（另開新視窗）</span>
                            </a>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="mx-auto w-full max-w-[280px]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- 圖是路由即時產生的，直接用原檔才能和分享、下載共用快取 */}
                    <img src={d.image} width={d.width} height={d.height} alt={d.alt} className="h-auto w-full rounded-[18px] border-2 border-edge bg-[#F6EFE0] shadow-lift" />
                    <div className="mt-3 grid gap-2">
                      {files[d.id] && (
                        <button type="button" className="btn btn-sun w-full justify-center" onClick={() => shareFiles([files[d.id]], `${d.day} 行程預告`)}>
                          分享行程圖
                        </button>
                      )}
                      <a href={d.image} download={`${d.fileName}.png`} className="btn w-full justify-center">
                        下載行程圖
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        ))}
    </section>
  );
}

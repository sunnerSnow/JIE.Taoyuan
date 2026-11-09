"use client";

import { useMemo, useSyncExternalStore } from "react";
import { type ShareImage, shareFiles, useShareFiles } from "@/components/site/use-share-files";
import { type ScheduleItem, type ScheduleSource, finishText, routeText } from "@/data/schedule";
import { FootIcon } from "./trail-explorer";

/** 分享圖：網址、檔名、替代文字與大小先在伺服器端算好 */
type CardImage = ShareImage & { alt: string; width: number; height: number };
/** 車隊掃街的兩張圖卡：路線圖、路線清單 */
type RouteCardImage = CardImage & { label: string };
/** 一天的行程預告；車隊掃街的場次另外帶路線圖卡與路線清單卡 */
export type ScheduleCardDay = CardImage & { date: string; day: string; items: (ScheduleItem & { routeCards?: RouteCardImage[] })[]; sources: ScheduleSource[] };

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
  const images = useMemo(() => upcoming.flatMap((d) => [d, ...d.items.flatMap((it) => it.routeCards ?? [])]), [upcoming]);
  const { files } = useShareFiles(images);
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
                    <p className="mt-1.5 text-[13px] font-bold text-ink-soft">
                      來源：
                      {d.sources.map((src, i) => (
                        <span key={src.outlet}>
                          {i > 0 && "、"}
                          {src.url ? (
                            <a href={src.url} target="_blank" rel="noopener noreferrer" className="link-ink">
                              {src.outlet} <span aria-hidden="true">↗</span>
                              <span className="sr-only">（另開新視窗）</span>
                            </a>
                          ) : (
                            src.outlet
                          )}
                        </span>
                      ))}
                    </p>
                    <ol className="mt-4 space-y-3">
                      {d.items.map((it) => (
                        <li key={`${it.time}-${it.title}`} className="flex gap-4 rounded-[20px] border-2 border-edge bg-cream/60 p-4 sm:gap-5 sm:p-5">
                          <p className="w-[62px] shrink-0 font-display leading-tight text-coral">
                            <time dateTime={`${d.date}T${it.time}+08:00`} className="block text-[22px]">
                              {it.time}
                            </time>
                            {it.end && (
                              <span className="mt-0.5 block text-[15px]">
                                <span className="sr-only">到</span>
                                <span aria-hidden="true">~ </span>
                                <time dateTime={`${d.date}T${it.end}+08:00`}>{it.end}</time>
                              </span>
                            )}
                          </p>
                          <div className="min-w-0">
                            <p className="text-[17px] font-black leading-snug">{it.title}</p>
                            <p className="mt-1.5 text-[15px] font-bold leading-snug text-teal-deep">{it.place}</p>
                            {it.address && <p className="mt-0.5 text-[14px] leading-snug text-ink-soft">{it.address}</p>}
                            {it.finish && <p className="mt-0.5 text-[14px] leading-snug text-ink-soft">{finishText(it)}</p>}
                            {it.route && <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{routeText(it)}</p>}
                            <a
                              href={it.url ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${it.place} ${it.address ?? ""}`.trim())}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link-ink mt-1.5 inline-block text-[13.5px] font-bold"
                            >
                              {it.url ? "觀看直播" : "在 Google 地圖上看"} <span aria-hidden="true">↗</span>
                              <span className="sr-only">（另開新視窗）</span>
                            </a>
                            {it.routeCards && <RouteCards cards={it.routeCards} files={files} title={`${d.day} ${it.title}`} />}
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

/** 車掃的路線圖與路線清單：兩張縮圖並排，點開看大圖，手機可以直接分享，也能下載 */
function RouteCards({ cards, files, title }: { cards: RouteCardImage[]; files: Record<string, File>; title: string }) {
  return (
    <div className="mt-3">
      <ul className="grid max-w-[560px] grid-cols-2 gap-3">
        {cards.map((card) => (
          <li key={card.id}>
            <a href={card.image} target="_blank" rel="noopener noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element -- 圖是路由即時產生的，直接用原檔才能和分享、下載共用快取 */}
              <img src={card.image} width={card.width} height={card.height} alt={card.alt} loading="lazy" className="h-auto w-full rounded-[14px] border-2 border-edge bg-[#F6EFE0]" />
              <span className="sr-only">（在新視窗開啟{card.label}）</span>
            </a>
            <p className="mt-1.5 text-[13.5px] font-black text-ink">{card.label}</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {files[card.id] && (
                <button type="button" className="btn btn-sm btn-sun whitespace-nowrap" onClick={() => shareFiles([files[card.id]], `${title} ${card.label}`)}>
                  分享<span className="sr-only">{card.label}</span>
                </button>
              )}
              <a href={card.image} download={`${card.fileName}.png`} className="btn btn-sm whitespace-nowrap">
                下載<span className="sr-only">{card.label}</span>
              </a>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
        路線示意圖，實際以現場為準。地圖資料 ©{" "}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="link-ink">
          OpenStreetMap 貢獻者
          <span className="sr-only">（另開新視窗）</span>
        </a>
      </p>
    </div>
  );
}

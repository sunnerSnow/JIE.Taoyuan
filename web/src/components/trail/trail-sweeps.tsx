"use client";

import { useMemo, useSyncExternalStore } from "react";

/** 一場車隊掃街（或市場掃街）：行程預告裡的場次，附路線圖與行程紀錄的連結 */
export type SweepItem = {
  key: string;
  date: string;
  /** 例如「11 月 10 日（星期二）」 */
  day: string;
  /** 例如「11/10」 */
  short: string;
  time: string;
  end?: string;
  title: string;
  /** 從活動名稱看得出的行政區；看不出來（例如「南崁市場掃街」）就不填 */
  district: string | null;
  start?: string;
  finish?: string;
  /** 路線圖卡與路線清單卡的網址（有畫路線圖的場次才有） */
  map?: { image: string; list: string; width: number; height: number; alt: string };
  /** 行程紀錄的錨點（/trail#id）：當天或之後有官方貼文、收進行程紀錄的場次才有 */
  record?: string;
};

const noop = () => () => {};
/** 台灣時間，例如「2026-11-10 12:30」（h23：午夜是 00，不會出現 24:xx） */
const nowTaipei = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date());
/** 結束時間過了就算跑過（沒寫結束時間的用開始時間） */
const isDone = (s: SweepItem, now: string) => `${s.date} ${s.end ?? s.time}` <= now;
const timeText = (s: SweepItem) => (s.end ? `${s.time}~${s.end}` : s.time);

/**
 * 杰伴出發的車隊掃街專區：13 區跑過哪些、接下來要去哪裡，以及每一場的路線圖。
 * 頁面是靜態產生的，「跑過／接下來」在瀏覽器端用台灣時間判斷：結束時間過了就算跑過。
 */
export function TrailSweeps({ sweeps, districts }: { sweeps: SweepItem[]; districts: readonly string[] }) {
  const now = useSyncExternalStore(noop, nowTaipei, () => null);
  const today = now?.slice(0, 10) ?? null;
  const { upcoming, past, status } = useMemo(() => {
    const upcoming = now ? sweeps.filter((s) => !isDone(s, now)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)) : [];
    const past = now ? sweeps.filter((s) => isDone(s, now)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)) : [];
    const status = districts.map((name) => {
      const next = upcoming.find((s) => s.district === name);
      const last = past.find((s) => s.district === name);
      return { name, next, last };
    });
    return { upcoming, past, status };
  }, [sweeps, districts, now]);

  return (
    <section aria-labelledby="trail-sweeps" className="mt-12 rounded-[28px] border-2 border-teal-deep/30 bg-paper p-5 shadow-soft sm:p-8">
      <p className="font-display text-[14px] tracking-[0.14em] text-coral">ON THE ROAD</p>
      <h2 id="trail-sweeps" className="mt-1 text-[24px] font-black tracking-[0.08em]">
        車隊掃街
      </h2>
      <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
        一區一區開過去：跑過的、接下來要去的都在這裡。有畫路線圖的場次，點開就能看路線；整理自候選人官方帳號的公告，如有異動以官方公告為準。
      </p>

      {today !== null && (
        <>
          <h3 className="mt-7 text-[17px] font-black tracking-[0.06em]">13 區車掃進度</h3>
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
            {status.map(({ name, next, last }) => (
              <li
                key={name}
                className={`rounded-2xl border-2 px-2 py-2 text-center ${
                  next ? "border-ink/70 bg-sun" : last ? "border-teal-deep bg-teal-deep text-paper" : "border-dashed border-edge bg-cream/60 text-ink-soft"
                }`}
              >
                <span className="block text-[15px] font-black">{name}</span>
                <span className="mt-0.5 block text-[12.5px] font-bold">
                  {next ? (next.date === today ? "今天出發" : `${next.short} 出發`) : last ? (last.date === today ? "今天跑過" : `${last.short} 跑過`) : "還沒排"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
            黃色是接下來要去的區，綠色是已經跑過的區。市場掃街的活動名稱沒寫是哪一區，所以不算進去。
          </p>

          <h3 className="mt-8 text-[17px] font-black tracking-[0.06em]">接下來</h3>
          {upcoming.length === 0 ? (
            <p className="mt-3 rounded-2xl border-2 border-dashed border-edge px-5 py-4 text-[15px] font-bold text-ink-soft">目前沒有已公告的車隊掃街。</p>
          ) : (
            <ol className="mt-3 space-y-3">
              {upcoming.map((s) => (
                <SweepRow key={s.key} sweep={s} today={today} />
              ))}
            </ol>
          )}

          {past.length > 0 && (
            <>
              <h3 className="mt-8 text-[17px] font-black tracking-[0.06em]">跑過的</h3>
              <ol className="mt-3 space-y-3">
                {past.map((s) => (
                  <SweepRow key={s.key} sweep={s} today={today} />
                ))}
              </ol>
            </>
          )}
        </>
      )}
    </section>
  );
}

function SweepRow({ sweep: s, today }: { sweep: SweepItem; today: string }) {
  const link = "link-ink text-[13.5px] font-bold";
  return (
    <li className="flex gap-4 rounded-[20px] border-2 border-edge bg-cream/60 p-4 sm:p-5">
      {s.map && (
        <a href={s.map.image} target="_blank" rel="noopener noreferrer" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- 圖是路由即時產生的，直接用原檔才能和分享、下載共用快取 */}
          <img src={s.map.image} width={s.map.width} height={s.map.height} alt={s.map.alt} loading="lazy" className="h-auto w-16 rounded-[10px] border-2 border-edge bg-[#F6EFE0] sm:w-20" />
          <span className="sr-only">（在新視窗開啟路線圖）</span>
        </a>
      )}
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-[14px] font-black text-teal-deep">
          {s.date === today && <span className="rounded-full bg-sun px-2.5 py-0.5 text-[13px] text-ink">今天</span>}
          <time dateTime={s.date}>{s.day}</time>
          <span className="font-display text-coral">{timeText(s)}</span>
        </p>
        <p className="mt-1 text-[17px] font-black leading-snug">{s.title}</p>
        {(s.start || s.finish) && (
          <p className="mt-1 text-[14px] leading-snug text-ink-soft">
            {s.start && `起點：${s.start}`}
            {s.start && s.finish && "；"}
            {s.finish && `終點：${s.finish}`}
          </p>
        )}
        {(s.map || s.record) && (
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {s.map && (
              <>
                <a href={s.map.image} target="_blank" rel="noopener noreferrer" className={link}>
                  路線圖 <span aria-hidden="true">↗</span>
                  <span className="sr-only">（另開新視窗）</span>
                </a>
                <a href={s.map.list} target="_blank" rel="noopener noreferrer" className={link}>
                  路線清單 <span aria-hidden="true">↗</span>
                  <span className="sr-only">（另開新視窗）</span>
                </a>
              </>
            )}
            {s.record && (
              <a href={`#${s.record}`} className={link}>
                行程紀錄 <span aria-hidden="true">↓</span>
              </a>
            )}
          </p>
        )}
      </div>
    </li>
  );
}

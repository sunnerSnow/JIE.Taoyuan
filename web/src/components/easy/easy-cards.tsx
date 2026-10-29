"use client";

import { useEffect, useState } from "react";

export type EasyCard = { id: string; title: string; alt: string; image: string; fileName: string };

const BIG = "flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-center text-[21px] font-black shadow-soft";

/**
 * 大字版圖卡清單：一張一項政見，每張都能單獨分享或下載，也能一次分享全部。
 * 「分享」用手機的系統分享（LINE、訊息…）直接傳圖片；不支援傳圖片檔的瀏覽器（多半是電腦）只顯示下載。
 * 圖片先在背景抓好：iOS 要求按下按鈕後馬上呼叫 navigator.share，中間不能再等下載。
 */
export function EasyCards({ cards, title, pageUrl }: { cards: EasyCard[]; title: string; pageUrl: string }) {
  const [files, setFiles] = useState<Record<string, File>>({});
  const [shareAll, setShareAll] = useState(false);

  useEffect(() => {
    if (typeof navigator.canShare !== "function") return;
    let alive = true;
    Promise.allSettled(
      cards.map(async (c) => {
        const r = await fetch(c.image);
        if (!r.ok) throw new Error(`圖卡讀取失敗：HTTP ${r.status}`);
        return [c.id, new File([await r.blob()], `${c.fileName}.png`, { type: "image/png" })] as const;
      }),
    ).then((results) => {
      if (!alive) return;
      const ready = results.flatMap((r) => (r.status === "fulfilled" && navigator.canShare({ files: [r.value[1]] }) ? [r.value] : []));
      setFiles(Object.fromEntries(ready));
      setShareAll(ready.length === cards.length && cards.length > 1 && navigator.canShare({ files: ready.map(([, f]) => f) }));
    });
    return () => {
      alive = false;
    };
  }, [cards]);

  const share = (list: File[]) => navigator.share({ files: list, title }).catch(() => {});

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {shareAll && (
          <button type="button" className={`${BIG} bg-sun text-ink`} onClick={() => share(cards.map((c) => files[c.id]))}>
            一次分享全部 {cards.length} 張
          </button>
        )}
        <a
          href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(pageUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${BIG} bg-teal-deep text-paper`}
        >
          用 LINE 傳連結給親友
          <span className="sr-only">（另開新視窗）</span>
        </a>
      </div>

      <ol className="mt-10 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <li key={c.id}>
            <h2 className="text-[23px] font-black leading-snug">
              第 {i + 1} 張：{c.title}
            </h2>
            {/* eslint-disable-next-line @next/next/no-img-element -- 圖是路由即時產生的，直接用原檔才能和分享、下載共用快取 */}
            <img
              src={c.image}
              width={900}
              height={1600}
              alt={c.alt}
              loading={i === 0 ? "eager" : "lazy"}
              className="mt-3 h-auto w-full rounded-[24px] border-2 border-edge bg-[#F6EFE0] shadow-lift"
            />
            <div className="mt-4 grid gap-3">
              {files[c.id] && (
                <button type="button" className={`${BIG} bg-sun text-ink`} onClick={() => share([files[c.id]])}>
                  分享這張
                  <span className="sr-only">：{c.title}</span>
                </button>
              )}
              <a href={c.image} download={`${c.fileName}.png`} className={`${BIG} border-2 border-edge bg-paper text-ink`}>
                下載這張
                <span className="sr-only">：{c.title}</span>
              </a>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

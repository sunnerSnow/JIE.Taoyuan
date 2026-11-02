"use client";

import { useEffect, useState } from "react";

export type ShareImage = { id: string; image: string; fileName: string };

/**
 * 分享圖先在背景抓成檔案：iOS 要求按下按鈕後馬上呼叫 navigator.share，中間不能再等下載。
 * 用手機的系統分享（LINE、訊息…）直接傳圖片；不支援傳圖片檔的瀏覽器（多半是電腦）files 是空的，畫面上只顯示下載。
 * canShareAll：兩張以上、而且可以一次傳全部。大字版圖卡與行程預告共用。
 */
export function useShareFiles(images: ShareImage[]) {
  const [files, setFiles] = useState<Record<string, File>>({});
  const [canShareAll, setCanShareAll] = useState(false);

  useEffect(() => {
    if (typeof navigator.canShare !== "function") return;
    let alive = true;
    Promise.allSettled(
      images.map(async (c) => {
        const r = await fetch(c.image);
        if (!r.ok) throw new Error(`圖卡讀取失敗：HTTP ${r.status}`);
        return [c.id, new File([await r.blob()], `${c.fileName}.png`, { type: "image/png" })] as const;
      }),
    ).then((results) => {
      if (!alive) return;
      const ready = results.flatMap((r) => (r.status === "fulfilled" && navigator.canShare({ files: [r.value[1]] }) ? [r.value] : []));
      setFiles(Object.fromEntries(ready));
      setCanShareAll(ready.length === images.length && images.length > 1 && navigator.canShare({ files: ready.map(([, f]) => f) }));
    });
    return () => {
      alive = false;
    };
  }, [images]);

  return { files, canShareAll };
}

/** 用系統分享傳圖片；使用者取消分享不算錯誤 */
export const shareFiles = (files: File[], title: string) => navigator.share({ files, title }).catch(() => {});

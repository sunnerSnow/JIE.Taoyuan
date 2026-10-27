"use client";

import { useState, useSyncExternalStore } from "react";

const noop = () => () => {};
const canNativeShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

/** 分享這項政見：系統分享（手機）、複製連結、LINE、Facebook、Threads，以及下載分享圖 */
export function ShareButtons({ title, fileName }: { title: string; fileName: string }) {
  const native = useSyncExternalStore(noop, canNativeShare, () => false);
  const [copied, setCopied] = useState(false);

  // 網址在點擊當下才取，部署網域還沒設定 NEXT_PUBLIC_SITE_URL 時也正確
  const here = () => window.location.href.split("#")[0];
  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  // 分享圖網址帶雜湊（opengraph-image-xxxx），從頁面的 og:image 讀，再換成目前網域
  const downloadImage = async () => {
    const meta = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content;
    if (!meta) return;
    const u = new URL(meta, window.location.origin);
    const src = new URL(u.pathname + u.search, window.location.origin).toString();
    try {
      const blob = await (await fetch(src)).blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${fileName}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(src, "_blank", "noopener");
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(here());
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      window.prompt("複製這個連結：", here());
    }
  };

  const btn =
    "inline-flex h-10 items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-3.5 text-[13.5px] font-bold transition-colors hover:bg-mint";

  return (
    <div role="group" aria-label="分享這項政見" className="flex flex-wrap items-center gap-2">
      {native && (
        <button type="button" className={`${btn} !bg-sun hover:!bg-[#f8dc76]`} onClick={() => navigator.share({ title, url: here() }).catch(() => {})}>
          <Icon d="M12 3v12M7 8l5-5 5 5M5 14v5h14v-5" />
          分享
        </button>
      )}
      <button type="button" className={btn} onClick={copy}>
        <Icon d={copied ? "M5 12.5l4.5 4.5L19 7.5" : "M9 9h10v10H9zM5 15V5h10"} />
        {copied ? "已複製" : "複製連結"}
      </button>
      <button type="button" className={btn} onClick={() => open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(here())}`)}>
        LINE
      </button>
      <button type="button" className={btn} onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(here())}`)}>
        Facebook
      </button>
      <button type="button" className={btn} onClick={() => open(`https://www.threads.net/intent/post?text=${encodeURIComponent(`${title} ${here()}`)}`)}>
        Threads
      </button>
      <button type="button" className={btn} onClick={downloadImage}>
        <Icon d="M12 4v11M7 10l5 5 5-5M5 20h14" />
        下載分享圖
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "已複製連結" : ""}
      </span>
    </div>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/lib/site";

const noop = () => () => {};

/** 以台灣時間算到投票日還有幾天（頁面是靜態產生的，所以在瀏覽器端算） */
function daysLeft() {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(new Date());
  return Math.round((Date.parse(site.electionDate) - Date.parse(today)) / 86_400_000);
}

/** 投票日倒數：投票日當天只寫日期，過了就不顯示 */
export function ElectionCountdown({ className = "" }: { className?: string }) {
  const days = useSyncExternalStore(noop, daysLeft, () => null);
  if (days === null || days < 0) return null;
  const [, m, d] = site.electionDate.split("-");
  const date = `${Number(m)}/${Number(d)}`;
  return (
    <p className={`inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-sun px-3.5 text-[13px] font-black tracking-[0.04em] text-ink ${className}`}>
      {days === 0 ? (
        `今天 ${date} 是投票日`
      ) : (
        <>
          距離 {date} 投票日還有
          <span className="font-display text-[19px] leading-none text-coral">{days}</span>天
        </>
      )}
    </p>
  );
}

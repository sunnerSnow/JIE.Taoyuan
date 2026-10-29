import { site } from "@/lib/site";

/**
 * 候選人號次徽章：圓圈號碼＋同樣大小的姓名（兩者置中對齊），「桃園市長候選人」放在姓名上方。
 * 號碼只出現一次：圓圈裡的數字直接給螢幕閱讀器與爬蟲讀，「號」字藏在 sr-only，
 * 純文字讀起來是「桃園市長候選人 1 號 黃世杰」（以前圓圈與 sr-only 各一個號碼，會被讀成「11 號」）
 */
/** large：大字版用的大尺寸 */
export function BallotBadge({ className = "", large = false }: { className?: string; large?: boolean }) {
  const c = site.candidate;
  return (
    <p className={`inline-grid grid-cols-[auto_auto] items-center gap-x-3 gap-y-1 ${className}`}>
      <span className={`col-start-2 font-bold leading-tight tracking-[0.08em] ${large ? "text-[20px] text-ink" : "text-[13.5px] text-ink-soft sm:text-[14.5px]"}`}>{c.office}</span>{" "}
      <span
        className={`col-start-1 row-start-2 grid shrink-0 place-items-center rounded-full border-[3.5px] border-coral bg-paper font-black leading-none text-coral ${
          large ? "h-[72px] w-[72px] text-[42px]" : "h-14 w-14 text-[32px] sm:h-16 sm:w-16 sm:text-[36px]"
        }`}
      >
        {c.ballotNo}
      </span>
      <span className={`col-start-2 row-start-2 font-black leading-none tracking-[0.08em] ${large ? "text-[42px]" : "text-[32px] sm:text-[36px]"}`}>
        <span className="sr-only">{" 號 "}</span>
        {c.name}
      </span>
    </p>
  );
}

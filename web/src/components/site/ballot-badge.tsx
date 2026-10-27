import { site } from "@/lib/site";

/** 候選人號次徽章：圓圈號碼＋同樣大小的姓名（兩者置中對齊），「桃園市長候選人」放在姓名上方 */
export function BallotBadge({ className = "" }: { className?: string }) {
  const c = site.candidate;
  return (
    <p className={`inline-grid grid-cols-[auto_auto] items-center gap-x-3 gap-y-1 ${className}`}>
      <span className="col-start-2 text-[13.5px] font-bold leading-tight tracking-[0.08em] text-ink-soft sm:text-[14.5px]">{c.office}</span>
      <span
        className="col-start-1 row-start-2 grid h-14 w-14 shrink-0 place-items-center rounded-full border-[3.5px] border-coral bg-paper text-[32px] font-black leading-none text-coral sm:h-16 sm:w-16 sm:text-[36px]"
        aria-hidden="true"
      >
        {c.ballotNo}
      </span>
      <span className="col-start-2 row-start-2 text-[32px] font-black leading-none tracking-[0.08em] sm:text-[36px]">
        <span className="sr-only">{c.ballotNo} 號 </span>
        {c.name}
      </span>
    </p>
  );
}

import { site } from "@/lib/site";

/** 候選人號次徽章：圓圈號碼＋「桃園市長候選人／1 號 黃世杰」 */
export function BallotBadge({ className = "" }: { className?: string }) {
  const c = site.candidate;
  return (
    <p className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-[3px] border-coral bg-paper text-[24px] font-black leading-none text-coral"
        aria-hidden="true"
      >
        {c.ballotNo}
      </span>
      <span className="leading-tight">
        <span className="block text-[12px] font-bold tracking-[0.08em] text-ink-soft">{c.office}</span>
        <span className="block text-[17px] font-black tracking-[0.08em]">
          <span className="text-coral">{c.ballotNo} 號</span> {c.name}
        </span>
      </span>
    </p>
  );
}

import { site } from "@/lib/site";

/** 追蹤候選人本人的 Threads（另開新視窗）；compact 用在探索頁這類空間小的地方 */
export function ThreadsFollow({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <a
      href={site.candidate.threads}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-ink font-black tracking-[0.06em] text-paper transition-transform hover:-translate-y-0.5 ${
        compact ? "h-9 px-3 text-[12.5px]" : "h-11 px-4 text-[14px]"
      } ${className}`}
    >
      <span aria-hidden="true" className={`grid place-items-center rounded-full bg-paper font-black leading-none text-ink ${compact ? "h-5 w-5 text-[12px]" : "h-6 w-6 text-[14px]"}`}>
        @
      </span>
      {compact ? "追蹤 Threads" : `追蹤${site.candidate.name}的 Threads`}
      <span aria-hidden="true">↗</span>
      <span className="sr-only">{compact ? `（${site.candidate.name}的帳號，另開新視窗）` : "（另開新視窗）"}</span>
    </a>
  );
}

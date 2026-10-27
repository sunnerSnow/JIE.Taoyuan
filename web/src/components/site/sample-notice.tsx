import { site } from "@/lib/site";

export function SampleNotice({ className = "" }: { className?: string }) {
  if (!site.sampleContent) return null;
  return (
    <p
      role="note"
      className={`flex items-start gap-2 rounded-2xl border-2 border-dashed border-coral bg-paper px-4 py-3 text-[13.5px] leading-relaxed ${className}`}
    >
      <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-coral" aria-hidden="true">
        <path d="M10 2l8.5 15h-17z" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
        <path d="M10 8v4M10 14.6v.1" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      </svg>
      <span>
        <strong className="text-coral">示範內容：</strong>
        標示「示範資料」的政策條目、狀態與來源只是版型示意，不代表真實政見或進度，正式上線前會逐條換成可查證的資料。
      </span>
    </p>
  );
}

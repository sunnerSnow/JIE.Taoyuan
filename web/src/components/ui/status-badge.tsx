import { statusInfo } from "@/data/policies";
import type { PolicyStatus } from "@/data/types";

// 狀態不只靠顏色：每個狀態都有自己的圖形＋文字

function StatusGlyph({ status }: { status: PolicyStatus }) {
  const common = { fill: "none", stroke: "#193A42", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (status) {
    case "proposed":
      return <path d="M6 3v10M6 3h7l-1.5 2.5L13 8H6" {...common} />;
    case "researching":
      return (
        <>
          <circle cx="7.5" cy="7.5" r="4" {...common} />
          <path d="M10.5 10.5L14 14" {...common} />
        </>
      );
    case "planned":
      return (
        <>
          <rect x="2.5" y="3.5" width="11" height="10" rx="2" {...common} />
          <path d="M2.5 7h11M5.5 2v3M10.5 2v3" {...common} />
        </>
      );
    case "in_progress":
      return (
        <>
          <circle cx="8" cy="8" r="5.5" {...common} />
          <path d="M8 2.5a5.5 5.5 0 0 1 0 11z" fill="#193A42" />
        </>
      );
    case "completed":
      return (
        <>
          <circle cx="8" cy="8" r="5.5" {...common} />
          <path d="M5.4 8.2l1.8 1.8 3.5-3.6" {...common} />
        </>
      );
    default:
      return (
        <>
          <circle cx="8" cy="8" r="5.5" {...common} strokeDasharray="2.4 2.2" />
          <path d="M5.5 8h5" {...common} />
        </>
      );
  }
}

export function StatusBadge({ status, size = "md" }: { status: PolicyStatus; size?: "sm" | "md" }) {
  const info = statusInfo[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink font-bold leading-none tracking-wide ${
        size === "sm" ? "h-7 px-2.5 text-[12px]" : "h-8 px-3 text-[13px]"
      }`}
      style={{ background: info.tone }}
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
        <StatusGlyph status={status} />
      </svg>
      <span>
        <span className="sr-only">目前狀態：</span>
        {info.label}
      </span>
    </span>
  );
}

export function SampleTag() {
  return (
    <span className="inline-flex h-7 shrink-0 items-center rounded-full border-2 border-dashed border-coral px-2.5 text-[12px] font-bold leading-none tracking-wide text-coral">
      示範資料
    </span>
  );
}

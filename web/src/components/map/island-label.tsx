import type { IslandPin } from "@/lib/map-data";

/** 地圖上的島嶼名牌：編號圓點＋名稱，下方小尖角指向島 */
export function IslandLabel({ pin, active = false, size = "md" }: { pin: IslandPin; active?: boolean; size?: "sm" | "md" }) {
  const sm = size === "sm";
  return (
    <span className="relative flex flex-col items-center">
      <span
        className={`flex items-center rounded-full border-2 border-ink font-black tracking-[0.06em] shadow-[0_3px_0_#193A42] transition-colors ${
          active ? "bg-ink text-paper" : "bg-paper text-ink group-hover:bg-sun"
        } ${sm ? "h-7 gap-1 pl-0.5 pr-2 text-[12px]" : "h-9 gap-1.5 pl-1 pr-3 text-[14px]"}`}
      >
        <span
          className={`grid place-items-center rounded-full border-2 border-ink font-sans font-black tracking-normal text-ink ${sm ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[11px]"}`}
          style={{ background: pin.color }}
        >
          {pin.no}
        </span>
        <span className="whitespace-nowrap">{sm ? pin.short : pin.name}</span>
      </span>
      <svg viewBox="0 0 14 10" className={sm ? "-mt-[2px] h-2 w-3" : "-mt-[2px] h-2.5 w-3.5"} aria-hidden="true">
        <path d="M1 0l6 9 6-9" fill={active ? "#193A42" : "#FFFDF7"} stroke="#193A42" strokeWidth={2} strokeLinejoin="round" />
      </svg>
    </span>
  );
}

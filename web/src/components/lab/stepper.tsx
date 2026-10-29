const STEPS = ["選主題", "挑 3 塊積木", "拿桃園卡"];

/** 活動進度：目前這一步另外標「目前」給螢幕閱讀器，不只靠顏色 */
export function Stepper({ at }: { at: number }) {
  return (
    <ol aria-label="活動步驟" className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
      {STEPS.map((s, i) => (
        <li
          key={s}
          aria-current={i === at ? "step" : undefined}
          className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1 ${
            i === at ? "border-teal-deep bg-teal-deep text-paper" : i < at ? "border-edge bg-mint text-ink" : "border-edge bg-paper text-ink-soft"
          }`}
        >
          <span aria-hidden="true">{i < at ? "✓" : i + 1}</span>
          {s}
          {i === at && <span className="sr-only">（目前）</span>}
        </li>
      ))}
    </ol>
  );
}

import { formatDate } from "@/data/policies";
import { type Relation, type RelationType, relationTypeInfo } from "@/data/relations";

const ICONS: Record<RelationType, string> = {
  // 文件：原始來源
  source: "M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h4",
  // 人：生活情境
  scenario: "M12 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM5.5 20c.8-3.6 3.4-5.6 6.5-5.6s5.7 2 6.5 5.6",
  // 筆：編輯分析
  editorial: "M5 19l1-4L15.5 5.5a2 2 0 0 1 3 3L9 18zM13.5 7.5l3 3",
};

/** 關聯線的線型示意（實線／虛線／點線），跟地圖上的線一致 */
export function RelationLineSample({ type, className = "h-2 w-7" }: { type: RelationType; className?: string }) {
  const info = relationTypeInfo[type];
  return (
    <svg viewBox="0 0 28 8" className={className} aria-hidden="true">
      <path d="M2 4h24" stroke={info.color} strokeWidth={2.6} strokeLinecap="round" strokeDasharray={info.dash || undefined} />
    </svg>
  );
}

/** 關聯類型標籤：圖示＋線型＋文字，不只靠顏色區分 */
export function RelationTypeBadge({ type, full = false }: { type: RelationType; full?: boolean }) {
  const info = relationTypeInfo[type];
  return (
    <span
      className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border-2 bg-paper pl-2 pr-2.5 text-[12px] font-black leading-none"
      style={{ borderColor: info.color, color: info.color }}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={ICONS[type]} />
      </svg>
      {full ? info.label : info.short}
      <RelationLineSample type={type} className="h-2 w-5" />
    </span>
  );
}

/** 可展開的關聯依據：引用原文或兩邊的具體做法，公開資料類附原始來源 */
export function RelationEvidence({ relation, open = false }: { relation: Relation; open?: boolean }) {
  return (
    <details open={open} className="group mt-2 text-[13px] leading-relaxed">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-bold text-teal-deep hover:underline [&::-webkit-details-marker]:hidden">
        <svg viewBox="0 0 16 16" className="h-3 w-3 transition-transform group-open:rotate-90" aria-hidden="true">
          <path d="M5 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        關聯依據
      </summary>
      <p className="mt-1.5 rounded-xl bg-cream px-3 py-2 text-ink-soft">{relation.evidence}</p>
      {relation.sourceUrl && (
        <p className="mt-1.5 text-ink-soft">
          出處：
          <a href={relation.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-ink font-bold text-ink">
            {relation.sourceTitle} <span aria-hidden="true">↗</span>
            <span className="sr-only">（另開新視窗）</span>
          </a>
          {relation.sourceDate && <span>・{formatDate(relation.sourceDate)}</span>}
        </p>
      )}
    </details>
  );
}

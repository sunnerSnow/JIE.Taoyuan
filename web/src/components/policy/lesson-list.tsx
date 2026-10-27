import type { Lesson } from "@/data/learn";

/** 小教室：先看「一句話看懂」，想深入再展開「詳細內容」（原生 details，不需要 JS） */
export function LessonList({ lessons }: { lessons: Lesson[] }) {
  return (
    <ul className="space-y-4">
      {lessons.map((l, i) => (
        <li key={l.term} className="rounded-[22px] border-2 border-ink bg-paper shadow-[0_5px_0_#BFE0CF]">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-start gap-4 p-5 [&::-webkit-details-marker]:hidden">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-sun text-[13px] font-black tracking-normal" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1">
                <span className="block text-[17px] font-black tracking-[0.06em]">{l.term}</span>
                <span className="mt-1 block text-[14.5px] leading-relaxed">
                  <span className="mr-1.5 rounded bg-mint px-1.5 py-0.5 text-[12px] font-bold">一句話看懂</span>
                  {l.oneLine}
                </span>
              </span>
              <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink transition-transform group-open:rotate-45" aria-hidden="true">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
                  <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
                </svg>
              </span>
              <span className="sr-only">展開詳細內容</span>
            </summary>
            <div className="mx-5 mb-5 border-t-2 border-dashed border-ink/20 pt-4 text-[14.5px] leading-[1.9] text-ink-soft">
              <p className="mb-1 text-[12px] font-bold tracking-[0.2em] text-teal-deep">詳細內容</p>
              {l.detail}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

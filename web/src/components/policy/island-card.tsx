import Link from "next/link";
import { IsoSvg } from "@/components/art/iso-svg";
import { ArrowCurve, Scallop } from "@/components/ui/decor";
import { categoryColor } from "@/data/categories";
import { policiesIn } from "@/data/policies";
import type { Category } from "@/data/types";
import { buildIsland } from "@/lib/scene";

/** 分類卡片：拱形頂的奶油色卡（sunbousai 事業紹介卡片的語彙）＋島嶼插畫 */
export function IslandCard({ category, className = "" }: { category: Category; className?: string }) {
  const art = buildIsland(category.slug);
  const color = categoryColor[category.slug];
  const count = policiesIn(category.slug).length;
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-t-[140px] rounded-b-[28px] border-2 border-ink bg-paper shadow-[0_8px_0_#BFE0CF] transition-transform duration-300 hover:-translate-y-1.5 ${className}`}
    >
      <div className="relative px-6 pb-2 pt-10" style={{ background: color.soft }}>
        <Scallop color={color.base} size={58} className="absolute left-5 top-5 z-10 text-[15px]">
          {category.no}
        </Scallop>
        <IsoSvg shapes={art.shapes} viewBox={art.viewBox} className="mx-auto max-h-56 transition-transform duration-500 group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-1 flex-col border-t-2 border-ink p-6">
        <h3 className="text-[22px] font-black tracking-[0.08em]">
          <Link href={`/islands/${category.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {category.name}
          </Link>
        </h3>
        <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-soft">{category.tagline}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="可能涵蓋">
          {category.topics.slice(0, 3).map((t) => (
            <li key={t} className="chip !min-h-6 !text-[12px]" style={{ background: color.soft }}>
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-[13px] font-bold">{count} 項政策</span>
          <span className="inline-flex h-10 items-center gap-2 rounded-lg border-2 border-ink bg-sun px-3 text-[13px] font-black tracking-[0.08em] transition-transform group-hover:-translate-y-0.5">
            進入島嶼
            <ArrowCurve className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}

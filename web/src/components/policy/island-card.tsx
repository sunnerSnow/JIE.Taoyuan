import Link from "next/link";
import { IsoSvg } from "@/components/art/iso-svg";
import { ArrowRight, Scallop } from "@/components/ui/decor";
import { categoryColor } from "@/data/categories";
import { policiesIn } from "@/data/policies";
import type { Category } from "@/data/types";
import { buildIsland } from "@/lib/scene";

/** 分類卡片：圓形縮圖＋右下圓形箭頭鈕（unouplus「会社のこと」卡片的語彙） */
export function IslandCard({ category, className = "" }: { category: Category; className?: string }) {
  const art = buildIsland(category.slug);
  const color = categoryColor[category.slug];
  const count = policiesIn(category.slug).length;
  return (
    <article className={`group relative flex h-full flex-col items-center text-center ${className}`}>
      <div className="relative aspect-square w-full max-w-[240px] transition-transform duration-500 ease-[cubic-bezier(.25,1,.5,1)] group-hover:-translate-y-1.5">
        <div className="absolute inset-0 rounded-full shadow-soft" style={{ background: color.soft }} />
        <div className="absolute inset-[13%] grid place-items-center">
          <IsoSvg shapes={art.shapes} viewBox={art.viewBox} className="transition-transform duration-500 group-hover:scale-[1.05]" />
        </div>
        <Scallop color={color.base} size={52} className="absolute left-[2%] top-[4%] text-[14px] text-ink">
          {category.no}
        </Scallop>
        <span
          className="absolute bottom-[3%] right-[3%] grid h-12 w-12 place-items-center rounded-full bg-teal-deep text-paper shadow-soft transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        >
          <ArrowRight className="h-5 w-5" />
        </span>
      </div>
      <h3 className="mt-5 text-[21px] font-black tracking-[0.12em] text-teal-deep">
        <Link href={`/islands/${category.slug}`} className="after:absolute after:inset-0 after:rounded-[32px] focus-visible:outline-none">
          {category.name}
        </Link>
      </h3>
      <p className="mt-1.5 max-w-[16em] text-[14px] leading-relaxed text-ink-soft">{category.tagline}</p>
      <p className="mt-2 text-[13px] font-bold text-teal-deep">{count} 項政策</p>
    </article>
  );
}

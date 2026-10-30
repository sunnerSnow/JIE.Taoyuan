import Image from "next/image";
import Link from "next/link";
import { categoryColor } from "@/data/categories";
import { cardCode, labThemes } from "@/data/lab";
import { shortTitle, sourceTypeLabel } from "@/data/policies";
import type { CategorySlug, Policy } from "@/data/types";
import { pickArt, portraitSrc } from "@/lib/card-art";
import { site } from "@/lib/site";
import { Brick } from "./brick";

// 桃園卡（2:3 直式）：底圖是兩張插畫之一（依組合固定，見 lib/card-art.ts），上方留白放主題與三塊積木，下方放站名與非官方聲明。
// 字級用 cqw（卡片寬的百分比），卡片放大縮小時排版不變，和「下載分享圖」的直式圖（lib/card-image.tsx）同一個比例。

/** preview：首頁的範例卡，純裝飾（不進無障礙樹、沒有連結） */
export function TaoyuanCard({ theme, picks, preview = false, className = "" }: { theme: CategorySlug; picks: Policy[]; preview?: boolean; className?: string }) {
  const Title = preview ? "p" : "h2";
  return (
    <figure
      aria-labelledby={preview ? undefined : "taoyuan-card-title"}
      aria-hidden={preview || undefined}
      className={`@container relative aspect-[2/3] w-full overflow-hidden rounded-[28px] border-2 border-edge bg-[#F6EFE0] shadow-lift ${className}`}
    >
      <Image src={portraitSrc[pickArt(cardCode(picks.map((p) => p.id)))]} alt="" fill priority={!preview} sizes="(min-width: 768px) 420px, 100vw" className="object-cover" />
      <div className="absolute inset-x-0 top-0 px-[8cqw] pt-[7.5cqw]">
        <p className="text-[3.4cqw] font-black tracking-[0.1em] text-[#B5573E]">3 分鐘探索・{labThemes[theme].label}</p>
        <Title id={preview ? undefined : "taoyuan-card-title"} className="mt-[1.5cqw] text-[9cqw] font-black leading-none tracking-[0.08em] text-[#3A4A72]">
          我探索的桃園
        </Title>
        <ol className="mt-[5cqw] space-y-[3cqw]">
          {picks.map((p) => (
            <li key={p.id} className="flex items-center gap-[3cqw]">
              <Brick color={categoryColor[p.category].base} className="h-[8cqw] w-[11cqw] shrink-0" />
              <span className="min-w-0">
                {preview ? (
                  <span className="block text-[5.2cqw] font-black leading-[1.25] tracking-[0.04em] text-[#2E3A48]">{shortTitle(p.title)}</span>
                ) : (
                  <Link href={`/policies/${p.slug}`} className="block text-[5.2cqw] font-black leading-[1.25] tracking-[0.04em] text-[#2E3A48] hover:underline">
                    {shortTitle(p.title)}
                  </Link>
                )}
                <span className="block text-[2.8cqw] font-bold leading-[1.4] text-[#5E6570]">{sourceTypeLabel[p.sourceType]}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="absolute inset-x-0 bottom-0 px-[8cqw] pb-[6cqw] text-[2.5cqw] font-bold text-[#5E6570]">
        <span className="flex items-baseline gap-[1.6cqw]">
          <span className="font-display text-[4cqw] tracking-normal text-teal">JIE.Taoyuan</span>
          <span className="whitespace-nowrap text-[2.7cqw] font-black text-teal-deep">杰伴桃園・{new URL(site.url).host}</span>
        </span>
        <span className="mt-[0.3cqw] block">{site.stance}</span>
      </figcaption>
    </figure>
  );
}

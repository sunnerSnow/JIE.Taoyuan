import Link from "next/link";
import { IsoSvg } from "@/components/art/iso-svg";
import { ArrowRight } from "@/components/ui/decor";
import { worldPins } from "@/lib/map-data";
import { IslandLabel } from "./island-label";

/**
 * 首頁的政策島地圖：每座島的名牌就是連結（沒有 JS 也能用）。
 * 桌機滑過或用鍵盤聚焦時，顯示名稱與一句話簡介。
 * contain：放進 container-type: size 的容器時，等比縮放塞滿容器。
 */
export function HomeMap({ className = "", contain = false }: { className?: string; contain?: boolean }) {
  const { world, islands, ratio } = worldPins();
  return (
    <div
      className={`relative ${className}`}
      style={{ aspectRatio: ratio, width: contain ? `min(100cqw, calc(100cqh * ${ratio.toFixed(4)}))` : undefined }}
    >
      <IsoSvg
        shapes={world.shapes}
        viewBox={world.viewBox}
        className="absolute inset-0 h-full"
        label="桃園政策島插畫：交通、育兒家庭、健康共好、宜居環境、未來發展五座島，以航線連到中央廣場。"
      />
      <ul className="absolute inset-0" aria-label="五座政策島">
        {islands.map((pin, i) => (
          <li key={pin.slug} className="absolute" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
            <Link
              href={`/islands/${pin.slug}`}
              className="group absolute bottom-0 left-0 block -translate-x-1/2 rounded-full outline-offset-4"
              style={{ animation: `pin-drop .6s ${0.15 * i}s both var(--ease-out-soft)` }}
              aria-label={`${pin.no} ${pin.name}：${pin.tagline}（${pin.count} 項政策）`}
            >
              <span className="sm:hidden">
                <IslandLabel pin={pin} size="sm" />
              </span>
              <span className="hidden sm:block">
                <IslandLabel pin={pin} />
              </span>
              <span
                role="presentation"
                className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden w-60 -translate-x-1/2 translate-y-1 rounded-2xl border-2 border-edge bg-paper p-3.5 text-left opacity-0 shadow-soft transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 lg:block"
              >
                <span className="block text-[15px] font-black tracking-[0.06em]">{pin.name}</span>
                <span className="mt-1 block text-[13px] leading-relaxed text-ink-soft">{pin.tagline}</span>
                <span className="mt-2 flex items-center justify-between text-[12px] font-bold">
                  <span>{pin.count} 項政策</span>
                  <span className="inline-flex items-center gap-1 text-teal-deep">
                    點擊進入 <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

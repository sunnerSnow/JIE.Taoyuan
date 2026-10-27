import Link from "next/link";
import { PenguinSays } from "@/components/art/speech";
import { ArrowCurve, Scallop } from "@/components/ui/decor";
import { SampleTag } from "@/components/ui/status-badge";
import { shortTitle } from "@/data/policies";
import { CitizenList } from "./citizens";
import { intercept } from "./intercept";
import type { ExploreIsland } from "./types";

/** 選了島之後的說明面板：桌機在左側浮出、手機是底部抽屜 */
export function IslandPanel({
  island,
  onClose,
  onOpenPolicy,
  onOpenCitizen,
  headingId,
}: {
  island: ExploreIsland;
  onClose: () => void;
  /** 點政策：在地圖內打開政策面板 */
  onOpenPolicy: (slug: string) => void;
  /** 點市民：在地圖內打開市民面板 */
  onOpenCitizen: (id: string) => void;
  headingId: string;
}) {
  const { pin } = island;
  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-3">
        <Scallop color={pin.color} size={52} className="text-[13px]">
          {pin.no}
        </Scallop>
        <div className="flex-1 pt-1">
          <p className="eyebrow">Policy Island {pin.no}</p>
          <h2 id={headingId} tabIndex={-1} className="mt-1 text-[24px] font-black leading-tight tracking-[0.08em] focus:outline-none">
            {pin.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-edge bg-paper hover:bg-mint"
          aria-label="關閉島嶼說明，回到全景"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <p className="mt-4 text-[16px] font-bold leading-relaxed">{island.tagline}</p>
      <p className="mt-1.5 text-[14px] leading-[1.85] text-ink-soft">{island.intro}</p>

      <PenguinSays className="mt-4" pose="point" penguinClassName="h-16 w-14" bubbleClassName="!mb-4 !text-[13px] !shadow-none">
        {island.penguinTip}
      </PenguinSays>

      <h3 className="mt-2 text-[13px] font-black tracking-[0.2em] text-teal-deep">
        政策一覽・{island.policies.length} 項政策、{island.policies.reduce((n, p) => n + p.actions, 0)} 項做法
      </h3>
      <ol className="mt-2 space-y-2.5">
        {island.policies.map((p) => {
          // 一眼看完：有分主張的列主張標題，沒有的列前幾項做法
          const points = p.pillars.length ? p.pillars.map((x) => x.title) : p.approach.slice(0, 4);
          return (
            <li key={p.slug}>
              <a
                href={`/policies/${p.slug}`}
                onClick={(e) => intercept(e, () => onOpenPolicy(p.slug))}
                className="group block rounded-2xl border-2 border-edge bg-paper px-3.5 py-3 transition-transform hover:-translate-y-0.5 hover:bg-mint/40"
              >
                <span className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-edge text-[12px] font-black"
                    style={{ background: pin.color }}
                  >
                    {p.n}
                  </span>
                  <span className="flex-1 text-[15px] font-black leading-snug tracking-[0.04em]">{shortTitle(p.title)}</span>
                  {p.sample && <SampleTag />}
                  <span className="mt-0.5 shrink-0 text-[12px] font-bold text-teal-deep transition-transform group-hover:translate-x-0.5">
                    {p.actions} 項做法 ›
                  </span>
                </span>
                <span className="mt-1.5 block text-[13px] leading-relaxed text-ink-soft">{p.summary}</span>
                {points.length > 0 && (
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {points.map((t, k) => (
                      <span key={t} className="inline-flex max-w-full items-start gap-1 rounded-lg px-2 py-1 text-[12.5px] font-bold leading-snug" style={{ background: island.soft }}>
                        <span className="shrink-0 text-teal-deep">{k + 1}</span>
                        <span className="line-clamp-2">{t}</span>
                      </span>
                    ))}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ol>

      {island.citizens.length > 0 && (
        <>
          <h3 className="mt-5 text-[13px] font-black tracking-[0.2em] text-teal-deep">島上的市民（虛構）</h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">地圖上的小人頭也可以點。他們是虛構角色，說說政見和自己生活的關係。</p>
          <CitizenList citizens={island.citizens} onOpen={onOpenCitizen} className="mt-2" />
        </>
      )}

      <h3 className="mt-5 text-[13px] font-black tracking-[0.2em] text-teal-deep">可能涵蓋</h3>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {island.topics.map((t) => (
          <li key={t} className="chip !text-[12px]" style={{ background: island.soft }}>
            {t}
          </li>
        ))}
      </ul>

      <Link href={`/islands/${pin.slug}`} className="btn btn-sun btn-sm mt-6 self-start">
        看{pin.name}完整分類頁
        <ArrowCurve className="h-4 w-4" />
      </Link>
    </div>
  );
}

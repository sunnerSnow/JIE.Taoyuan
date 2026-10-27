import Link from "next/link";
import { PenguinSays } from "@/components/art/speech";
import { ArrowCurve, Scallop } from "@/components/ui/decor";
import { SampleTag, StatusBadge } from "@/components/ui/status-badge";
import type { ExploreIsland } from "./types";

/** 選了島之後的說明面板：桌機在左側浮出、手機是底部抽屜 */
export function IslandPanel({ island, onClose, headingId }: { island: ExploreIsland; onClose: () => void; headingId: string }) {
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
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-paper hover:bg-mint"
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

      <h3 className="mt-2 text-[13px] font-black tracking-[0.2em] text-teal-deep">政策細項</h3>
      <ol className="mt-2 space-y-2">
        {island.policies.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/policies/${p.slug}`}
              className="group flex items-start gap-3 rounded-2xl border-2 border-ink bg-paper px-3.5 py-3 transition-transform hover:-translate-y-0.5"
            >
              <span
                className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-ink text-[12px] font-black"
                style={{ background: pin.color }}
              >
                {p.n}
              </span>
              <span className="flex-1">
                <span className="block text-[15px] font-black leading-snug tracking-[0.04em]">{p.title}</span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  <StatusBadge status={p.status} size="sm" />
                  {p.sample && <SampleTag />}
                </span>
              </span>
              <span className="mt-1 text-ink-soft transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ol>

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

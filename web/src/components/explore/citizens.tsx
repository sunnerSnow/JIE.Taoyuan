import { useId } from "react";
import type { ExploreCitizen, ExploreIsland } from "./types";

export const CITIZEN_HEADING_ID = "citizen-panel-title";

const SHIRTS = ["#5B9BD5", "#E38B2C", "#E1678F", "#7FA650", "#8A6A4F", "#00A6A1", "#C9604A", "#8D74B8", "#E0B33A", "#4F7CAC"];
const SKINS = ["#F6D5BC", "#EBC1A0", "#D9A27B"];
const HAIRS = ["#2E2A27", "#5A3A22", "#3B2A1A"];
const ELDER = /阿嬤|阿公|長輩|退休|年邁/;
const LONG_HAIR = /媽媽|阿嬤|女兒|護理師|夫妻/;

/** 用 id 算出固定的外型，同一位市民在地圖、清單、面板長得都一樣 */
function seedOf(id: string) {
  let h = 7;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** 市民的外型：衣服、膚色、髮色、長短髮 */
export function lookOf(citizen: ExploreCitizen) {
  const h = seedOf(citizen.id);
  return {
    shirt: SHIRTS[h % SHIRTS.length],
    skin: SKINS[(h >>> 4) % SKINS.length],
    hair: ELDER.test(citizen.persona) ? "#B9B4AC" : HAIRS[(h >>> 7) % HAIRS.length],
    long: LONG_HAIR.test(citizen.persona) || (h >>> 9) % 4 === 0,
  };
}

/** 市民頭像：圓框裡的半身像（扁平、無描邊，和島上插畫的小人同一種畫法） */
export function CitizenAvatar({ citizen, className = "" }: { citizen: ExploreCitizen; className?: string }) {
  const clip = useId();
  const { shirt, skin, hair, long } = lookOf(citizen);
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <clipPath id={clip}>
        <circle cx="20" cy="20" r="19" />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect width="40" height="40" fill="#E8F5F4" />
        <path d="M6 41c1.2-8.4 6.8-12.6 14-12.6S32.8 32.6 34 41z" fill={shirt} />
        <rect x="17" y="23" width="6" height="6" rx="2.5" fill={skin} />
        {long && <path d="M11.6 18c0-6.4 3.8-10 8.4-10s8.4 3.6 8.4 10v9.5H11.6z" fill={hair} />}
        <circle cx="20" cy="18" r="7.2" fill={skin} />
        <path d="M12.8 17.4c0-4.9 3.1-8.1 7.2-8.1s7.2 3.2 7.2 8.1c-2.3-2.7-4.7-3.8-7.2-3.8s-4.9 1.1-7.2 3.8z" fill={hair} />
        <circle cx="17.3" cy="19" r="0.95" fill="#234647" />
        <circle cx="22.7" cy="19" r="0.95" fill="#234647" />
        <path d="M18.2 21.8c1 .8 2.6.8 3.6 0" fill="none" stroke="#234647" strokeWidth="1.1" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** 島嶼面板、政策面板裡的市民清單 */
export function CitizenList({ citizens, onOpen, className = "" }: { citizens: ExploreCitizen[]; onOpen: (id: string) => void; className?: string }) {
  return (
    <ul className={`space-y-2 ${className}`}>
      {citizens.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onOpen(c.id)}
            className="group flex w-full items-center gap-3 rounded-2xl border-2 border-edge bg-paper px-3 py-2.5 text-left transition-transform hover:-translate-y-0.5 hover:bg-mint/40"
          >
            <CitizenAvatar citizen={c} className="h-9 w-9 shrink-0" />
            <span className="flex-1">
              <span className="block text-[14px] font-black leading-snug">{c.persona}</span>
              <span className="mt-0.5 block text-[12px] text-ink-soft">
                {c.district ? `${c.district}・` : ""}跟第 {c.policyN} 項政策有關
              </span>
            </span>
            <span className="text-ink-soft transition-transform group-hover:translate-x-0.5" aria-hidden="true">
              ›
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** 點了市民之後的面板：他的生活情境，以及跟哪一項政策有關 */
export function CitizenPanel({
  island,
  citizen,
  onClose,
  onOpenCitizen,
  onOpenPolicy,
  live,
}: {
  island: ExploreIsland;
  citizen: ExploreCitizen;
  onClose: () => void;
  onOpenCitizen: (id: string) => void;
  onOpenPolicy: (slug: string) => void;
  /** 地圖上的即時狀態（正在前往哪裡） */
  live?: React.ReactNode;
}) {
  const { pin } = island;
  const list = island.citizens;
  const i = list.findIndex((c) => c.id === citizen.id);
  const prev = i > 0 ? list[i - 1] : null;
  const next = i < list.length - 1 ? list[i + 1] : null;
  const policy = island.policies.find((p) => p.slug === citizen.policySlug);

  return (
    <div
      className="flex flex-col"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" && prev) {
          e.preventDefault();
          onOpenCitizen(prev.id);
        } else if (e.key === "ArrowRight" && next) {
          e.preventDefault();
          onOpenCitizen(next.id);
        }
      }}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-mint pl-2 pr-3.5 text-[13px] font-black tracking-[0.06em] hover:bg-mint-deep"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          回到{pin.name}
        </button>
        <span className="ml-auto text-[12.5px] font-bold text-ink-soft">
          第 {i + 1} 位，共 {list.length} 位
        </span>
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-edge bg-paper hover:bg-mint"
          aria-label="關閉市民說明"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span className="rounded-full border-2 border-edge bg-paper p-[3px]">
          <CitizenAvatar citizen={citizen} className="h-14 w-14" />
        </span>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full border-2 border-dashed border-teal-deep/40 px-2.5 py-0.5 text-[12px] font-black tracking-[0.06em] text-teal-deep">虛構市民</span>
          {citizen.district && (
            <span className="chip !text-[12px]" style={{ background: island.soft }}>
              {citizen.district}
            </span>
          )}
        </div>
      </div>
      <h2 id={CITIZEN_HEADING_ID} tabIndex={-1} className="mt-3 text-[20px] font-black leading-snug tracking-[0.06em] text-teal-deep focus:outline-none">
        {citizen.persona}
      </h2>
      {live}

      <blockquote className="relative mt-4 rounded-[20px] border-2 border-edge bg-cream px-4 py-3.5 text-[15px] leading-[1.9]">
        <svg viewBox="0 0 20 14" className="absolute -top-[12px] left-6 h-3.5 w-5" aria-hidden="true">
          <path d="M2 14C6 9 7 4 6 0c4 4 9 9 13 14z" fill="#E8F5F4" />
        </svg>
        「{citizen.text}」
      </blockquote>

      {policy && (
        <>
          <h3 className="mt-5 text-[13px] font-black tracking-[0.2em] text-teal-deep">跟這項政策有關</h3>
          <button
            type="button"
            onClick={() => onOpenPolicy(policy.slug)}
            className="group mt-2 flex items-start gap-3 rounded-2xl border-2 border-edge bg-paper px-3.5 py-3 text-left transition-transform hover:-translate-y-0.5 hover:bg-mint/40"
          >
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-edge text-[12px] font-black" style={{ background: pin.color }}>
              {policy.n}
            </span>
            <span className="flex-1">
              <span className="block text-[15px] font-black leading-snug tracking-[0.04em]">{policy.title}</span>
              <span className="mt-1 block text-[13px] leading-relaxed text-ink-soft">{policy.summary}</span>
            </span>
            <span className="mt-1 text-ink-soft transition-transform group-hover:translate-x-0.5" aria-hidden="true">
              ›
            </span>
          </button>
        </>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!prev}
          onClick={() => prev && onOpenCitizen(prev.id)}
          className="h-10 rounded-full border-2 border-edge bg-paper text-[13px] font-black hover:bg-mint disabled:opacity-40"
        >
          ← 上一位
        </button>
        <button
          type="button"
          disabled={!next}
          onClick={() => next && onOpenCitizen(next.id)}
          className="h-10 rounded-full border-2 border-edge bg-paper text-[13px] font-black hover:bg-mint disabled:opacity-40"
        >
          下一位 →
        </button>
      </div>

      <p className="mt-4 text-[12.5px] leading-relaxed text-ink-soft">市民是虛構角色，用來想像政見和日常生活的關係；台詞依政見內容改寫，不是真實人物的說法。</p>
    </div>
  );
}

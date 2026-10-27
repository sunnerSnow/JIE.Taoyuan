"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { shortTitle } from "@/data/policies";
import type { CitySim } from "./city-sim";
import { CitizenAvatar } from "./citizens";
import type { ExploreCitizen, ExploreIsland } from "./types";

export const LOG_HEADING_ID = "city-log-title";

/**
 * 城市日誌（參考 puma 的 CITY LOG）：「概況」是政見、做法、關聯與市民的數字；
 * 「即時動態」記錄市民沿著政策關聯跨島出發、抵達的時間（台灣時間）。
 */
export function CityLog({
  sim,
  islands,
  relationCount,
  running,
  onOpenCitizen,
  onClose,
}: {
  sim: CitySim;
  islands: ExploreIsland[];
  relationCount: number;
  running: boolean;
  onOpenCitizen: (id: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"live" | "overview">("live");
  useSyncExternalStore(sim.subscribe, sim.getVersion, () => 0);
  const log = sim.getLog();
  const walking = sim.walkingCount();

  const { citizens, policies } = useMemo(() => {
    const citizens = new Map<string, ExploreCitizen>();
    const policies = new Map<string, { title: string; island: ExploreIsland }>();
    for (const island of islands) {
      for (const c of island.citizens) citizens.set(c.id, c);
      for (const p of island.policies) policies.set(p.slug, { title: shortTitle(p.title), island });
    }
    return { citizens, policies };
  }, [islands]);
  const total = islands.reduce((n, i) => n + i.policies.length, 0);
  const actions = islands.reduce((n, i) => n + i.policies.reduce((m, p) => m + p.actions, 0), 0);
  const people = islands.reduce((n, i) => n + i.citizens.length, 0);
  const most = Math.max(...islands.map((i) => i.policies.length));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 px-6 pt-7">
        <div>
          <p className="eyebrow">City Log</p>
          <h2 id={LOG_HEADING_ID} tabIndex={-1} className="mt-1 text-[22px] font-black tracking-[0.08em] focus:outline-none">
            城市日誌
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-edge bg-paper hover:bg-mint"
          aria-label="關閉城市日誌"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="mx-6 mt-4 grid grid-cols-2 rounded-full bg-mist p-1" role="group" aria-label="日誌內容">
        {(
          [
            ["live", "即時動態"],
            ["overview", "城市概況"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={tab === key}
            onClick={() => setTab(key)}
            className={`h-9 rounded-full text-[13.5px] font-black tracking-[0.06em] ${tab === key ? "bg-paper shadow-soft" : "text-ink-soft"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex-1 overflow-y-auto overscroll-contain px-6 pb-6">
        {tab === "overview" ? (
          <>
            <dl className="grid grid-cols-2 gap-2.5">
              <Stat label="項政見" value={total} />
              <Stat label="項具體做法" value={actions} />
              <Stat label="條政策關聯" value={relationCount} />
              <Stat label={`位市民在路上（共 ${people} 位）`} value={running ? walking : 0} live={running} />
            </dl>
            <h3 className="mt-6 text-[13px] font-black tracking-[0.2em] text-teal-deep">各島政見</h3>
            <ul className="mt-2 space-y-2">
              {islands.map((i) => (
                <li key={i.pin.slug} className="grid grid-cols-[5.5em_1fr_auto] items-center gap-3 text-[13.5px] font-bold">
                  <span>{i.pin.short}</span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-mist" aria-hidden="true">
                    <span className="block h-full rounded-full" style={{ width: `${(i.policies.length / most) * 100}%`, background: i.pin.color }} />
                  </span>
                  <span className="text-[12.5px] text-ink-soft">
                    {i.policies.length} 項・{i.citizens.length} 位市民
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[12.5px] leading-relaxed text-ink-soft">市民是虛構角色：每一位來自一項政策的生活情境，會沿著政策之間的關聯，走到相關的政策去看看。</p>
          </>
        ) : (
          <>
            <p className="flex items-center gap-2 text-[12.5px] font-bold text-ink-soft">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-black ${running ? "bg-mint text-teal-deep" : "bg-mist"}`}>
                <span className={`h-2 w-2 rounded-full ${running ? "bg-teal" : "bg-ink-soft/50"}`} aria-hidden="true" />
                {running ? "LIVE" : "暫停中"}
              </span>
              台灣時間・市民沿著政策關聯跨島出發、抵達
            </p>
            {!running && <p className="mt-3 rounded-2xl bg-sun-soft px-3 py-2 text-[13px] leading-relaxed">動畫已關閉，市民停在原地。打開右上角的「動畫」，日誌才會繼續更新。</p>}
            {log.length === 0 ? (
              <p className="mt-4 text-[13.5px] leading-relaxed text-ink-soft">市民正在出門，稍等一下就會出現第一筆動態。</p>
            ) : (
              <ol className="mt-3 divide-y-2 divide-dashed divide-teal-deep/15" aria-live="off">
                {log.map((e) => {
                  const c = citizens.get(e.citizenId);
                  const to = policies.get(e.to);
                  if (!c || !to) return null;
                  return (
                    <li key={e.id}>
                      <button type="button" onClick={() => onOpenCitizen(c.id)} className="group flex w-full items-start gap-2.5 py-2.5 text-left">
                        <span
                          className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-black tracking-[0.08em] ${e.kind === "depart" ? "bg-mint text-teal-deep" : "bg-sun text-ink"}`}
                        >
                          {e.kind === "depart" ? "出發" : "抵達"}
                        </span>
                        <CitizenAvatar citizen={c} className="h-7 w-7 shrink-0" />
                        <span className="min-w-0 flex-1 text-[13px] leading-snug">
                          <span className="font-display text-[12px] text-ink-soft">{e.time}</span>
                          <span className="block font-bold group-hover:underline">{c.persona}</span>
                          <span className="block text-ink-soft">
                            {e.kind === "depart" ? "前往" : "抵達"}「{to.title}」・{to.island.pin.short}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, live = false }: { label: string; value: number; live?: boolean }) {
  return (
    <div className="flex flex-col-reverse rounded-2xl border-2 border-edge bg-paper px-3 py-2.5">
      <dt className="mt-1 text-[12px] font-bold leading-snug text-ink-soft">{label}</dt>
      <dd className="flex items-center gap-1.5 font-display text-[26px] leading-none text-teal">
        {value}
        {live && <span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" />}
      </dd>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/site/logo";
import { ArrowRight } from "@/components/ui/decor";
import { SampleTag, StatusBadge } from "@/components/ui/status-badge";
import { IslandLabel } from "@/components/map/island-label";
import { shortTitle } from "@/data/policies";
import type { CategorySlug } from "@/data/types";
import { liftLabels } from "@/lib/pin-layout";
import { intercept } from "./intercept";
import { IntroDialog } from "./intro-dialog";
import { IslandPanel } from "./island-panel";
import { POLICY_HEADING_ID, PolicyPanel } from "./policy-panel";
import { PolicyIndex } from "./policy-index";
import type { ExploreIsland } from "./types";

export type { ExploreIsland } from "./types";

const INTRO_KEY = "jt-intro-v1";
const MOTION_KEY = "jt-motion";
const PANEL_W = 400;
/** 圖釘細桿與底部圓點的預設高度（px） */
const STEM = 12;
const DOT = 10;
const ISLAND_HEADING_ID = "island-panel-title";

type Box = { w: number; h: number };

/** 把島與政策寫進網址（?island=&policy=），可以分享、重新整理後還原 */
function writeUrl(island: string | null, policy: string | null, mode: "push" | "replace") {
  const url = new URL(window.location.href);
  if (island) url.searchParams.set("island", island);
  else url.searchParams.delete("island");
  if (policy) url.searchParams.set("policy", policy);
  else url.searchParams.delete("policy");
  if (mode === "push") window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
}

/**
 * 探索政策島（參考 puma.taipei/heart-island 的互動）：
 * 全景地圖 → 點島拉近鏡頭、顯示每項政策的圖釘 → 點圖釘或建築，在地圖內打開政策面板（手機是底部抽屜）。
 * 選取的島與政策寫在網址，開政策面板會記一筆瀏覽紀錄，按「返回」先關面板。
 */
export function ExploreApp({ islands, ratio, map }: { islands: ExploreIsland[]; ratio: number; map: React.ReactNode }) {
  const [selected, setSelected] = useState<CategorySlug | null>(null);
  const [policySlug, setPolicySlug] = useState<string | null>(null);
  const [view, setView] = useState<"map" | "list">("map");
  const [introOpen, setIntroOpen] = useState(false);
  const [motion, setMotion] = useState(true);
  const [stage, setStage] = useState<Box>({ w: 0, h: 0 });
  const [desktop, setDesktop] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const pinLabelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pinStemRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pinLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  /** 最近一次用 pushState 開了政策面板（關閉時用「返回」退回去，瀏覽紀錄才不會越堆越多） */
  const pushedRef = useRef(false);
  /** 關閉政策面板後要把焦點還給哪一個圖釘 */
  const restoreFocusRef = useRef<string | null>(null);
  const policyRef = useRef<string | null>(null);
  const selectedRef = useRef<CategorySlug | null>(null);

  const current = islands.find((i) => i.pin.slug === selected) ?? null;
  const currentPolicy = current?.policies.find((p) => p.slug === policySlug) ?? null;

  useEffect(() => {
    policyRef.current = policySlug;
    selectedRef.current = selected;
  }, [policySlug, selected]);

  const ownerOf = useCallback((slug: string) => islands.find((i) => i.policies.some((p) => p.slug === slug)) ?? null, [islands]);

  /** 從網址還原島與政策（掛載時與按「上一頁／下一頁」時） */
  const syncFromUrl = useCallback(() => {
    const sp = new URLSearchParams(window.location.search);
    const pol = sp.get("policy");
    const owner = pol ? ownerOf(pol) : null;
    const isl = sp.get("island");
    const island = owner?.pin.slug ?? (isl && islands.some((i) => i.pin.slug === isl) ? (isl as CategorySlug) : null);
    setSelected(island);
    setPolicySlug(owner ? pol : null);
  }, [islands, ownerOf]);

  useEffect(() => {
    let seen = false;
    let motionOn = true;
    try {
      seen = localStorage.getItem(INTRO_KEY) === "seen";
      const saved = localStorage.getItem(MOTION_KEY);
      motionOn = saved ? saved === "on" : !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {}
    // 只在掛載時同步一次網址與 localStorage（伺服器端拿不到這兩者）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncFromUrl();
    setMotion(motionOn);
    if (!seen && !new URLSearchParams(window.location.search).get("policy")) setIntroOpen(true);
  }, [syncFromUrl]);

  useEffect(() => {
    const onPop = () => {
      pushedRef.current = false;
      syncFromUrl();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [syncFromUrl]);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setStage({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => setDesktop(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, []);

  const focusLater = (id: string) => requestAnimationFrame(() => document.getElementById(id)?.focus());

  const select = useCallback((slug: CategorySlug | null) => {
    setSelected(slug);
    setPolicySlug(null);
    setView("map");
    pushedRef.current = false;
    writeUrl(slug, null, "replace");
    if (slug) focusLater(ISLAND_HEADING_ID);
  }, []);

  const openPolicy = useCallback(
    (slug: string) => {
      const owner = ownerOf(slug);
      if (!owner) return;
      const mode = policyRef.current ? "replace" : "push";
      if (mode === "push") pushedRef.current = true;
      setView("map");
      setSelected(owner.pin.slug);
      setPolicySlug(slug);
      writeUrl(owner.pin.slug, slug, mode);
      focusLater(POLICY_HEADING_ID);
    },
    [ownerOf],
  );

  const closePolicy = useCallback(() => {
    restoreFocusRef.current = policyRef.current;
    if (pushedRef.current) {
      window.history.back(); // popstate 會把狀態同步回「只選了島」
      return;
    }
    setPolicySlug(null);
    writeUrl(selectedRef.current, null, "replace");
  }, []);

  // 政策面板關閉後，把焦點還給原本的圖釘（沒有圖釘時給島嶼面板標題）
  useEffect(() => {
    if (policySlug || !restoreFocusRef.current) return;
    const slug = restoreFocusRef.current;
    restoreFocusRef.current = null;
    requestAnimationFrame(() => (pinLinkRefs.current[slug] ?? document.getElementById(ISLAND_HEADING_ID))?.focus());
  }, [policySlug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || introOpen) return;
      if (policyRef.current) closePolicy();
      else if (selectedRef.current) select(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [introOpen, closePolicy, select]);

  const closeIntro = () => {
    setIntroOpen(false);
    try {
      localStorage.setItem(INTRO_KEY, "seen");
    } catch {}
  };

  const toggleMotion = () => {
    setMotion((m) => {
      try {
        localStorage.setItem(MOTION_KEY, m ? "off" : "on");
      } catch {}
      return !m;
    });
  };

  // 點插畫：全景時點島就選島；選了島之後點有政策的建築就開政策面板，點別座島就換島
  const onWorldClick = (e: React.MouseEvent) => {
    const target = e.target as Element;
    const isl = target.closest("[data-island]")?.getAttribute("data-island");
    if (!isl || !islands.some((i) => i.pin.slug === isl)) return;
    if (isl !== selected) {
      select(isl as CategorySlug);
      return;
    }
    const spot = target.closest("[data-spot]")?.getAttribute("data-spot");
    const hit = spot === null || spot === undefined ? null : current?.policies.find((p) => p.spot === Number(spot));
    if (hit) openPolicy(hit.slug);
  };

  // 插畫上的 hover／選取效果：依目前狀態產生 CSS（建築是 <g data-spot>，沒辦法用固定 class 表達）
  const worldCss = useMemo(() => {
    const W = ".explore-world";
    const rules = [`${W} [data-island],${W} [data-spot]{transition:opacity .45s,filter .35s}`];
    if (!current) {
      rules.push(`${W} [data-island]{cursor:pointer}`, `${W} [data-island]:hover{filter:brightness(1.05) saturate(1.12)}`);
      return rules.join("");
    }
    const sel = `${W} [data-island="${current.pin.slug}"]`;
    rules.push(`${W} [data-island]:not([data-island="${current.pin.slug}"]){opacity:.55;cursor:pointer}`);
    const glow = "filter:brightness(1.06) drop-shadow(0 0 .6px #fff) drop-shadow(0 0 1.6px rgba(249,222,58,.95))";
    for (const p of current.policies) {
      const b = `${sel} [data-spot="${p.spot}"]`;
      rules.push(`${b}{cursor:pointer}`);
      // 滑過建築、或滑過／聚焦它的圖釘，建築都會亮起來
      rules.push(`${b}:hover,${W}:has([data-pin-spot="${p.spot}"]:hover) ${b},${W}:has([data-pin-spot="${p.spot}"]:focus-visible) ${b}{${glow}}`);
    }
    if (currentPolicy) {
      rules.push(`${sel} [data-spot]:not([data-spot="${currentPolicy.spot}"]){opacity:.5}`);
      rules.push(`${sel} [data-spot="${currentPolicy.spot}"]{opacity:1;${glow}}`);
    }
    return rules.join("");
  }, [current, currentPolicy]);

  // 鏡頭：算出世界圖要放大多少、移到哪裡，讓選到的島落在「沒被面板擋住」的區域中央
  const measured = stage.w > 0;
  const ww = Math.min(stage.w, stage.h * ratio);
  const wh = ww / ratio;
  const left0 = (stage.w - ww) / 2;
  const top0 = (stage.h - wh) / 2;
  const inset = desktop
    ? { l: current ? PANEL_W + 24 : 0, t: 96, r: 0, b: 16 }
    : { l: 0, t: stage.w < 640 ? 124 : 76, r: 0, b: current ? stage.h * (currentPolicy ? 0.6 : 0.52) : 150 };
  const visW = stage.w - inset.l - inset.r;
  const visH = stage.h - inset.t - inset.b;
  const vx = inset.l + visW / 2;
  const vy = inset.t + visH / 2;
  let s = Math.max(0.5, Math.min(1.25, visW / ww, visH / wh));
  let cx = 0.5;
  let cy = 0.5;
  if (current && measured) {
    const f = current.pin.frame;
    s = Math.max(1, Math.min(3.4, (visW * 0.8) / ((f.w / 100) * ww), (visH * 0.8) / ((f.h / 100) * wh)));
    cx = (f.x + f.w / 2) / 100;
    cy = (f.y + f.h / 2) / 100;
  }
  const tx = vx - left0 - s * cx * ww;
  const ty = vy - top0 - s * cy * wh;

  // 圖釘標籤反向縮放後是固定螢幕尺寸；用鏡頭的目標倍率算出位置，靠太近的就拉長細桿往上推
  useLayoutEffect(() => {
    if (!current || !measured) return;
    const boxes = current.spots.map((spot, i) => ({
      x: s * (spot.x / 100) * ww,
      y: s * (spot.y / 100) * wh - STEM - DOT,
      w: pinLabelRefs.current[i]?.offsetWidth ?? 0,
      h: pinLabelRefs.current[i]?.offsetHeight ?? 0,
    }));
    liftLabels(boxes).forEach((lift, i) => {
      const stem = pinStemRefs.current[i];
      if (stem) stem.style.height = `${STEM + lift}px`;
    });
  }, [current, measured, s, ww, wh]);

  const policyIndex = currentPolicy ? current!.policies.indexOf(currentPolicy) : -1;
  const prevPolicy = policyIndex > 0 ? current!.policies[policyIndex - 1] : null;
  const nextPolicy = policyIndex >= 0 && policyIndex < current!.policies.length - 1 ? current!.policies[policyIndex + 1] : null;
  const policyPanel =
    current && currentPolicy ? (
      <PolicyPanel
        island={current}
        policy={currentPolicy}
        onClose={closePolicy}
        onPrev={prevPolicy ? () => openPolicy(prevPolicy.slug) : undefined}
        onNext={nextPolicy ? () => openPolicy(nextPolicy.slug) : undefined}
      />
    ) : null;

  return (
    <div
      data-motion={motion ? "on" : "off"}
      className="fixed inset-0 flex bg-sea"
      style={{ background: "linear-gradient(180deg,#F1FAF9 0%,#E2F4F2 45%,#D3EEEC 100%)" }}
    >
      <style>{worldCss}</style>
      <div ref={stageRef} className="relative flex-1 overflow-hidden">
        {/* 世界圖 */}
        <div
          onClick={onWorldClick}
          className={`explore-world absolute left-0 top-0 transition-transform duration-[900ms] ease-[cubic-bezier(.25,1,.5,1)] ${view === "list" ? "invisible" : ""}`}
          style={
            measured
              ? ({
                  width: ww,
                  height: wh,
                  left: left0,
                  top: top0,
                  transformOrigin: "0 0",
                  transform: `translate(${tx}px, ${ty}px) scale(${s})`,
                  "--inv": 1 / s,
                } as React.CSSProperties)
              : { width: "100%", aspectRatio: ratio, top: "50%", transform: "translateY(-50%)" }
          }
        >
          {map}
          <ul aria-label="政策島">
            {islands.map((island) => {
              const active = selected === island.pin.slug;
              return (
                <li
                  key={island.pin.slug}
                  // 選取中的島：名牌會被圖釘壓住，名稱已顯示在面板上，所以先隱藏
                  className={`absolute transition-opacity duration-500 ${active ? "invisible" : current ? "opacity-60" : ""}`}
                  style={{ left: `${island.pin.x}%`, top: `${island.pin.y}%`, zIndex: active ? 2 : 1 }}
                >
                  <div className="absolute left-0 top-0" style={{ transform: "translate(-50%,-100%) scale(var(--inv,1))", transformOrigin: "50% 100%" }}>
                    <a
                      href={`/islands/${island.pin.slug}`}
                      onClick={(e) => intercept(e, () => select(active ? null : island.pin.slug))}
                      aria-current={active ? "true" : undefined}
                      aria-label={`${island.pin.no} ${island.pin.name}，${island.policies.length} 項政策${active ? "（已選取）" : ""}`}
                      className="group relative block rounded-full"
                    >
                      <span className="sm:hidden">
                        <IslandLabel pin={island.pin} active={active} size="sm" />
                      </span>
                      <span className="hidden sm:block">
                        <IslandLabel pin={island.pin} active={active} />
                      </span>
                      {!active && (
                        <span
                          role="presentation"
                          className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden w-56 -translate-x-1/2 translate-y-1 rounded-2xl border-2 border-edge bg-paper p-3 text-left opacity-0 shadow-soft transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 lg:block"
                        >
                          <span className="block text-[14px] font-black">{island.pin.name}</span>
                          <span className="mt-1 block text-[12.5px] leading-relaxed text-ink-soft">{island.tagline}</span>
                          <span className="mt-1.5 block text-[12px] font-bold text-teal-deep">點擊走進這座島 →</span>
                        </span>
                      )}
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>

          {current && (
            <ol aria-label={`${current.pin.name}的政策圖釘`}>
              {current.spots.map((spot, i) => {
                const policy = current.policies[i];
                const on = currentPolicy?.slug === spot.slug;
                return (
                  <li key={spot.slug} className="absolute" style={{ left: `${spot.x}%`, top: `${spot.y}%`, zIndex: on ? 4 : 3 }}>
                    <div className="absolute left-0 top-0" style={{ transform: "translate(-50%,-100%) scale(var(--inv,1))", transformOrigin: "50% 100%" }}>
                      {/* 動畫放在內層，避免 keyframes 的 transform 蓋掉外層的反向縮放 */}
                      <a
                        ref={(el) => {
                          pinLinkRefs.current[spot.slug] = el;
                        }}
                        href={`/policies/${spot.slug}`}
                        data-pin-spot={policy?.spot}
                        onClick={(e) => intercept(e, () => (on ? closePolicy() : openPolicy(spot.slug)))}
                        aria-current={on ? "true" : undefined}
                        // 連結框和標籤一樣寬，細桿兩旁的透明區不能擋到別的圖釘，所以只讓標籤與圓點可點
                        className="group pointer-events-none flex flex-col items-center"
                        style={{ animation: `pin-drop .5s ${0.35 + i * 0.08}s both var(--ease-out-soft)` }}
                        aria-label={`政策 ${spot.n}：${spot.title}${on ? "（已開啟）" : ""}`}
                      >
                        <span
                          ref={(el) => {
                            pinLabelRefs.current[i] = el;
                          }}
                          className={`pointer-events-auto flex h-8 max-w-[190px] items-center gap-1.5 rounded-full border-2 p-0.5 text-[12.5px] font-black shadow-soft transition-[background-color,color,transform] duration-200 sm:pr-3 ${
                            on ? "scale-110 border-teal-deep bg-teal-deep text-paper" : "border-edge bg-paper group-hover:bg-sun"
                          }`}
                        >
                          <span
                            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[11px] text-ink ${on ? "border-paper" : "border-edge"}`}
                            style={{ background: current.pin.color }}
                          >
                            {spot.n}
                          </span>
                          {/* 手機只顯示編號，完整名稱在底部抽屜 */}
                          <span className="hidden truncate sm:block">{shortTitle(spot.title)}</span>
                        </span>
                        <span
                          ref={(el) => {
                            pinStemRefs.current[i] = el;
                          }}
                          className="h-3 w-0.5 bg-teal-deep"
                          aria-hidden="true"
                        />
                        <span
                          className={`pointer-events-auto h-2.5 w-2.5 rounded-full border-2 ${on ? "border-teal-deep bg-teal-deep" : "border-edge bg-sun"}`}
                          aria-hidden="true"
                        />
                      </a>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {view === "list" && <ListView islands={islands} onPick={select} onOpenPolicy={openPolicy} />}

        {/* 左上：品牌名牌 */}
        <Link
          href="/"
          className="absolute left-3 top-3 z-20 flex items-center gap-3 rounded-2xl border-2 border-edge bg-paper px-3 py-1.5 shadow-soft sm:left-5 sm:top-4"
          aria-label="回到 JIE.Taoyuan 首頁"
        >
          <Logo compact />
          <span className="hidden border-l-2 border-teal-deep/20 pl-3 text-[13px] font-black tracking-[0.12em] sm:block">桃園政策島</span>
        </Link>

        {/* 工具列：全景／地圖・清單／動畫／導覽 */}
        <div
          className="absolute right-3 top-[72px] z-20 flex items-center gap-1.5 sm:right-5 sm:top-4 lg:gap-1 lg:rounded-full lg:border-2 lg:border-edge lg:bg-paper lg:p-1.5 lg:shadow-soft"
          role="toolbar"
          aria-label="地圖工具"
        >
          <ToolButton onClick={() => select(null)} label="全景" disabled={!current && view === "map"}>
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </ToolButton>
          <div className="flex rounded-full border-2 border-edge bg-paper p-0.5 lg:border-0 lg:p-0" role="group" aria-label="檢視方式">
            {(["map", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`h-9 rounded-full px-3.5 text-[13px] font-black tracking-[0.08em] ${view === v ? "bg-teal-deep text-paper" : "hover:bg-mint"}`}
              >
                {v === "map" ? "地圖" : "清單"}
              </button>
            ))}
          </div>
          <ToolButton onClick={toggleMotion} label="動畫" pressed={motion} hideLabelOnMobile>
            {motion ? <path d="M5 12c2-4 5-4 7 0s5 4 7 0" /> : <path d="M5 12h14" />}
          </ToolButton>
          <ToolButton onClick={() => setIntroOpen(true)} label="導覽" hideLabelOnMobile>
            <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4V14M12 17.5v.1" />
          </ToolButton>
        </div>

        {/* 桌機：左側面板（島嶼說明 ⇄ 政策詳情） */}
        {desktop && current && view === "map" && (
          <section
            aria-labelledby={currentPolicy ? POLICY_HEADING_ID : ISLAND_HEADING_ID}
            key={currentPolicy ? currentPolicy.slug : current.pin.slug}
            className="absolute bottom-4 left-5 top-[92px] z-10 overflow-y-auto overscroll-contain rounded-[28px] border-2 border-edge bg-paper/95 p-6 shadow-lift backdrop-blur [animation:pin-drop_.45s_both_var(--ease-out-soft)]"
            style={{ width: PANEL_W - 20 }}
          >
            {policyPanel ?? <IslandPanel island={current} onClose={() => select(null)} onOpenPolicy={openPolicy} headingId={ISLAND_HEADING_ID} />}
          </section>
        )}

        {/* 手機：底部抽屜 */}
        {!desktop && view === "map" && (
          <section
            aria-labelledby={current ? (currentPolicy ? POLICY_HEADING_ID : ISLAND_HEADING_ID) : "sheet-title"}
            key={currentPolicy?.slug ?? current?.pin.slug ?? "none"}
            className={`absolute inset-x-0 bottom-0 z-10 overflow-y-auto overscroll-contain rounded-t-[28px] border-t-2 border-edge bg-paper px-5 pb-8 pt-3 shadow-[0_-12px_30px_-18px_rgb(0_90_85/0.45)] ${
              currentPolicy ? "max-h-[60%]" : current ? "max-h-[52%]" : ""
            } ${current ? "[animation:pin-drop_.4s_both_var(--ease-out-soft)]" : ""}`}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-teal-deep/20" aria-hidden="true" />
            {current ? (
              (policyPanel ?? <IslandPanel island={current} onClose={() => select(null)} onOpenPolicy={openPolicy} headingId={ISLAND_HEADING_ID} />)
            ) : (
              <>
                <h2 id="sheet-title" className="text-[16px] font-black tracking-[0.08em]">
                  選一座島開始探索
                </h2>
                <ul className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
                  {islands.map((i) => (
                    <li key={i.pin.slug} className="shrink-0">
                      <a
                        href={`/islands/${i.pin.slug}`}
                        onClick={(e) => intercept(e, () => select(i.pin.slug))}
                        className="flex h-11 items-center gap-2 rounded-full border-2 border-edge bg-paper pl-1 pr-4 text-[14px] font-black"
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-edge text-[12px]" style={{ background: i.pin.color }}>
                          {i.pin.no}
                        </span>
                        {i.pin.short}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}
      </div>

      {/* 桌機：右側政策索引 */}
      <aside aria-label="政策索引" className="hidden w-[380px] shrink-0 border-l-2 border-edge bg-paper lg:block">
        <PolicyIndex islands={islands} selected={selected} activePolicy={policySlug} onSelect={select} onOpenPolicy={openPolicy} />
      </aside>

      <IntroDialog open={introOpen} onClose={closeIntro} />
    </div>
  );
}

function ToolButton({
  children,
  label,
  onClick,
  disabled,
  pressed,
  hideLabelOnMobile = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  hideLabelOnMobile?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={hideLabelOnMobile ? label : undefined}
      className="flex h-10 items-center gap-1.5 rounded-full border-2 border-edge bg-paper px-3 text-[13px] font-black tracking-[0.08em] shadow-soft hover:bg-mint disabled:opacity-45 aria-pressed:bg-mint lg:h-9 lg:border-0 lg:shadow-none"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
      <span className={hideLabelOnMobile ? "hidden sm:inline" : undefined}>{label}</span>
    </button>
  );
}

/** 清單模式：地圖的文字替代版；點政策會回到地圖並打開政策面板 */
function ListView({
  islands,
  onPick,
  onOpenPolicy,
}: {
  islands: ExploreIsland[];
  onPick: (slug: CategorySlug) => void;
  onOpenPolicy: (slug: string) => void;
}) {
  return (
    <div className="absolute inset-0 z-[5] overflow-y-auto bg-cream/95 px-4 pb-16 pt-32 backdrop-blur-sm sm:px-8 sm:pt-24 lg:pt-28">
      <div className="mx-auto max-w-3xl">
        <h2 className="section-title !text-[28px]">政策清單</h2>
        <p className="mt-2 text-[14.5px] text-ink-soft">與地圖相同的內容，用文字一次看完。點政策會回到地圖並打開說明。</p>
        <div className="mt-8 space-y-10">
          {islands.map((island) => (
            <section key={island.pin.slug} aria-labelledby={`list-${island.pin.slug}`}>
              <div className="flex items-center justify-between gap-3 border-b-2 border-edge pb-2">
                <h3 id={`list-${island.pin.slug}`} className="flex items-center gap-2 text-[20px] font-black tracking-[0.08em]">
                  <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-edge text-[12px]" style={{ background: island.pin.color }}>
                    {island.pin.no}
                  </span>
                  {island.pin.name}
                </h3>
                <button type="button" onClick={() => onPick(island.pin.slug)} className="text-[13px] font-bold text-teal-deep hover:underline">
                  在地圖上看 →
                </button>
              </div>
              <ul className="mt-3 divide-y-2 divide-dashed divide-teal-deep/15">
                {island.policies.map((p) => (
                  <li key={p.slug}>
                    <a href={`/policies/${p.slug}`} onClick={(e) => intercept(e, () => onOpenPolicy(p.slug))} className="group flex items-start gap-3 py-4">
                      <span className="flex-1">
                        <span className="block text-[16px] font-black group-hover:underline">{p.title}</span>
                        <span className="mt-1 block text-[14px] leading-relaxed text-ink-soft">{p.summary}</span>
                        <span className="mt-2 flex flex-wrap items-center gap-1.5">
                          <StatusBadge status={p.status} size="sm" />
                          {p.sample && <SampleTag />}
                          <span className="text-[12.5px] text-ink-soft">{p.sourceLabel}</span>
                        </span>
                      </span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

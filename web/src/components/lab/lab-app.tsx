"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PenguinSays } from "@/components/art/speech";
import { intercept } from "@/components/explore/intercept";
import { ArrowCurve, ArrowRight } from "@/components/ui/decor";
import type { CategorySlug } from "@/data/types";
import { Brick, BrickSlot } from "./brick";
import { Stepper } from "./stepper";

export type LabPolicy = {
  id: string;
  slug: string;
  title: string;
  /** 積木板上的短名稱（標題冒號前） */
  short: string;
  summary: string;
  /** 資訊性質：候選人公開政見、媒體報導… */
  sourceLabel: string;
  sourceName: string;
  sourceUrl?: string;
  /** 最近確認日期（擷取日期），ISO 與顯示用兩種格式 */
  checkedAt?: string;
  checked?: string;
  points: { title: string; items: string[] }[];
};

export type LabTheme = {
  slug: CategorySlug;
  island: string;
  label: string;
  question: string;
  color: { base: string; soft: string };
  /** 依提出日期由新到舊 */
  policies: LabPolicy[];
};

/**
 * 網址就是活動狀態：?t=主題&c=已收下的政見 id（依收下的順序，用「.」分隔）。
 * 上一頁、重新整理、把網址傳給別人，都會回到同一步；瀏覽器不必另外儲存任何東西。
 */
function setUrl(next: { t?: string | null; c?: string[] | null }, mode: "push" | "replace") {
  const url = new URL(window.location.href);
  for (const [key, v] of Object.entries(next)) {
    const s = Array.isArray(v) ? v.join(".") : (v ?? "");
    if (s) url.searchParams.set(key, s);
    else url.searchParams.delete(key);
  }
  window.history[mode === "push" ? "pushState" : "replaceState"](null, "", url);
}

/** 「3 分鐘，拼出你心中的桃園」：選主題 → 從主題的政見挑 3 塊積木 → 成果卡（成果卡是獨立頁面 /lab/card/…） */
export function LabApp({ themes, picks }: { themes: LabTheme[]; picks: number }) {
  const params = useSearchParams();
  const theme = themes.find((t) => t.slug === params.get("t")) ?? null;
  const topRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shownTheme = useRef(theme?.slug ?? null);

  // 換步驟時捲回活動頂端、焦點移到這一步的標題（第一次載入不搶焦點）
  useEffect(() => {
    const now = theme?.slug ?? null;
    if (shownTheme.current === now) return;
    shownTheme.current = now;
    topRef.current?.scrollIntoView({ block: "start" });
    headingRef.current?.focus({ preventScroll: true });
  }, [theme?.slug]);

  return (
    <div ref={topRef} className="scroll-mt-24">
      {theme ? (
        <PickStep key={theme.slug} theme={theme} picks={picks} params={params} headingRef={headingRef} />
      ) : (
        <ThemeStep themes={themes} picks={picks} headingRef={headingRef} />
      )}
    </div>
  );
}

type HeadingRef = React.RefObject<HTMLHeadingElement | null>;

/** 第 1 步：選生活主題。沒有 JS 時也是一般連結 */
export function ThemeStep({ themes, picks, headingRef }: { themes: LabTheme[]; picks: number; headingRef?: HeadingRef }) {
  return (
    <>
      <Stepper at={0} />
      <PenguinSays className="mt-8" penguinClassName="h-24 w-20" bubbleClassName="max-w-xl text-[15px]">
        嗨！我是企鵝阿爸。選一個你最想了解的生活主題，主題裡的政見會全部列給你看；挑 {picks} 項收下積木，就能拼出你的桃園卡。不用登入，也不用填任何資料。
      </PenguinSays>
      <h2 ref={headingRef} tabIndex={-1} className="mt-10 text-[22px] font-black tracking-[0.06em] outline-none sm:text-[24px]">
        第 1 步：選一個生活主題
      </h2>
      <ul className="mt-5 grid gap-3">
        {themes.map((t) => (
          <li key={t.slug}>
            <a
              href={`/lab?t=${t.slug}`}
              onClick={(e) => intercept(e, () => setUrl({ t: t.slug, c: null }, "push"))}
              className="group flex items-center gap-4 rounded-[22px] border-2 border-edge bg-paper p-4 shadow-soft transition-transform hover:-translate-y-0.5 sm:gap-5 sm:p-5"
            >
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl sm:h-20 sm:w-20" style={{ background: t.color.soft }}>
                <Brick color={t.color.base} className="h-10 w-12 sm:h-12 sm:w-14" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[18px] font-black leading-snug tracking-[0.05em] sm:text-[20px]">{t.label}</span>
                <span className="mt-1 block text-[14.5px] font-bold leading-relaxed text-ink-soft">{t.question}</span>
                <span className="mt-1 block text-[12.5px] font-bold text-teal-deep">
                  對應{t.island}・{t.policies.length} 項政見，挑 {picks} 項
                </span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-teal-deep transition-transform group-hover:translate-x-1" />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-[14px] leading-relaxed text-ink-soft">
        想自己逛？
        <Link href="/explore" className="link-ink mx-1 font-bold text-ink">
          直接進入政策島
        </Link>
        ，或看
        <Link href="/policies" className="link-ink mx-1 font-bold text-ink">
          全部政策
        </Link>
        。
      </p>
    </>
  );
}

/** 第 2 步：主題裡的政見全部列出，挑 3 項收下積木；選滿後其他項目鎖住，要換就先放回一塊 */
function PickStep({ theme, picks, params, headingRef }: { theme: LabTheme; picks: number; params: URLSearchParams; headingRef: HeadingRef }) {
  // 選滿之後又按了別塊：在托盤提示先放回一塊
  const [full, setFull] = useState(false);
  const chosen = [...new Set((params.get("c") ?? "").split("."))].filter((id) => theme.policies.some((p) => p.id === id)).slice(0, picks);
  const done = chosen.length === picks;
  const code = [...chosen].sort().join("-");
  const save = (ids: string[]) => setUrl({ c: ids }, "replace");

  const toggle = (id: string) => {
    if (chosen.includes(id)) {
      setFull(false);
      save(chosen.filter((x) => x !== id));
    } else if (!done) save([...chosen, id]);
    else setFull(true);
  };
  const clear = () => {
    setFull(false);
    save([]);
  };

  return (
    <>
      <Stepper at={1} />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <a href="/lab" onClick={(e) => intercept(e, () => setUrl({ t: null, c: null }, "push"))} className="btn btn-sm">
          <span aria-hidden="true">←</span> 換主題
        </a>
        <Link href="/explore" className="text-[14px] font-bold text-ink-soft hover:text-ink hover:underline">
          離開活動，去政策島
        </Link>
      </div>

      <h2 ref={headingRef} tabIndex={-1} className="mt-8 text-[22px] font-black leading-snug tracking-[0.06em] outline-none sm:text-[26px]">
        第 2 步：從{theme.label}挑 {picks} 塊積木
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
        {theme.question}這個主題對應{theme.island}，島上的 {theme.policies.length} 項政見都在這裡，挑你最想了解的 {picks} 項收下。
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">依提出日期由新到舊排列。主題和島的對應是本站整理，不是候選人的分類。</p>

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {theme.policies.map((p) => (
          <PickCard key={p.id} policy={p} theme={theme} order={chosen.indexOf(p.id)} locked={done && !chosen.includes(p.id)} onToggle={() => toggle(p.id)} />
        ))}
      </ul>

      {/* 積木托盤：手機上一直看得到已收下哪幾塊與下一步；按積木可以放回 */}
      <div className="sticky bottom-[max(12px,env(safe-area-inset-bottom))] z-10 mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[22px] border-2 border-edge bg-paper py-2.5 pl-3 pr-3 shadow-lift sm:pl-4">
        <ol aria-label="我的桃園積木" className="flex gap-1">
          {Array.from({ length: picks }, (_, i) => {
            const p = theme.policies.find((x) => x.id === chosen[i]);
            return (
              <li key={i}>
                {p ? (
                  <button type="button" onClick={() => toggle(p.id)} className="flex items-center gap-1.5 rounded-xl px-1.5 py-1 hover:bg-cream" title={`放回「${p.short}」`}>
                    <Brick color={theme.color.base} className="h-8 w-11 [animation:pin-drop_.35s_both_var(--ease-out-soft)]" />
                    <span className="hidden max-w-[7.5em] truncate text-[13px] font-bold lg:block">{p.short}</span>
                    <span className="sr-only lg:hidden">放回「{p.short}」</span>
                  </button>
                ) : (
                  <span className="block px-1.5 py-1">
                    <BrickSlot className="h-8 w-11" />
                    <span className="sr-only">第 {i + 1} 塊還沒收下</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        <p aria-live="polite" className={`min-w-[9em] flex-1 text-[14px] font-bold leading-snug ${full ? "text-coral" : ""}`}>
          {full ? `已經選滿 ${picks} 塊了，先放回一塊再換。` : done ? "拼好了！來看你的桃園卡。" : `已收下 ${chosen.length}／${picks} 塊，再選 ${picks - chosen.length} 塊`}
        </p>
        <div className="flex items-center gap-3">
          {chosen.length > 0 && (
            <button type="button" onClick={clear} className="text-[13.5px] font-bold text-ink-soft hover:text-ink hover:underline">
              全部放回
            </button>
          )}
          {done && (
            <Link href={`/lab/card/${code}`} className="btn btn-sm btn-sun">
              看我的桃園卡
              <ArrowCurve className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

function PickCard({
  policy: p,
  theme: g,
  order,
  locked,
  onToggle,
}: {
  policy: LabPolicy;
  theme: LabTheme;
  /** 第幾塊收下的（0 起算）；還沒收下是 -1 */
  order: number;
  /** 已經選滿、這塊又沒收下 */
  locked: boolean;
  onToggle: () => void;
}) {
  const got = order >= 0;
  return (
    <li>
      <article
        className={`flex h-full flex-col rounded-[22px] border-2 p-4 shadow-soft transition-colors sm:p-5 ${got ? "border-teal-deep" : "border-edge bg-paper"}`}
        style={got ? { background: g.color.soft } : undefined}
      >
        {/* 標題就是收下／放回的開關：狀態用 aria-pressed，名稱維持政見標題 */}
        <h3 className="text-[17px] font-black leading-snug tracking-[0.04em] sm:text-[18px]">
          <button
            type="button"
            aria-pressed={got}
            aria-disabled={locked || undefined}
            onClick={onToggle}
            className={`group flex w-full items-start gap-3 rounded-xl text-left ${locked ? "cursor-not-allowed" : ""}`}
          >
            <span className="mt-0.5 shrink-0" aria-hidden="true">
              {got ? (
                <Brick color={g.color.base} className="h-8 w-11 [animation:pin-drop_.35s_both_var(--ease-out-soft)]" />
              ) : (
                <BrickSlot className={`h-8 w-11 ${locked ? "opacity-50" : ""}`} />
              )}
            </span>
            <span className={`min-w-0 flex-1 ${locked ? "text-ink-soft" : "group-hover:underline"}`}>{p.title}</span>
            <span
              aria-hidden="true"
              className={`mt-0.5 shrink-0 whitespace-nowrap rounded-full border-2 px-2.5 py-0.5 text-[12.5px] font-black tracking-normal ${
                got ? "border-teal-deep bg-teal-deep text-paper" : locked ? "border-edge text-ink-soft" : "border-edge bg-sun"
              }`}
            >
              {got ? `✓ 第 ${order + 1} 塊` : locked ? "已選滿" : "＋ 收下"}
            </span>
          </button>
        </h3>
        <p className="mt-2 line-clamp-3 text-[14px] leading-[1.8] text-ink-soft">{p.summary}</p>
        <p className="mt-2 text-[12.5px] font-bold text-ink-soft">
          {p.sourceLabel}・最近確認 {p.checkedAt ? <time dateTime={p.checkedAt}>{p.checked}</time> : "未提供"}
        </p>

        {/* 推到卡片底部：同一列的卡片「看主張」對齊 */}
        <div className="mt-auto pt-3">
          <details className="group/more rounded-2xl bg-paper/70 px-3.5 py-2.5">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[13.5px] font-black text-teal-deep [&::-webkit-details-marker]:hidden">
              <span
                className="grid h-5 w-5 place-items-center rounded-full border-2 border-edge bg-paper text-[12px] leading-none transition-transform group-open/more:rotate-45"
                aria-hidden="true"
              >
                +
              </span>
              看主張、做法與來源
            </summary>
            {p.points.length > 0 && (
              <ul className="mt-3 space-y-3 text-[13.5px] leading-relaxed">
                {p.points.map((pt) => (
                  <li key={pt.title || pt.items[0]}>
                    {pt.title && <p className="font-black text-ink">{pt.title}</p>}
                    <ul className="mt-1 space-y-1">
                      {pt.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-ink-soft">
                          <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-teal-deep" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
              <span className="font-bold text-ink">來源：</span>
              {p.sourceUrl ? (
                <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-ink break-words">
                  {p.sourceName} <span aria-hidden="true">↗</span>
                  <span className="sr-only">（另開新視窗）</span>
                </a>
              ) : (
                <span className="font-bold text-coral">來源待補</span>
              )}
            </p>
            <Link href={`/policies/${p.slug}`} className="mt-2 inline-flex items-center gap-1 text-[13.5px] font-bold text-teal-deep hover:underline">
              看完整政見頁
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </details>
        </div>
      </article>
    </li>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
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
 * 網址就是活動狀態：?t=主題&k=第幾組&c=已收下的政見 id（用「.」分隔）。
 * 上一頁、重新整理、把網址傳給別人，都會回到同一步；瀏覽器不必另外儲存任何東西。
 */
function setUrl(next: { t?: string | null; k?: number | null; c?: string[] | null }, mode: "push" | "replace") {
  const url = new URL(window.location.href);
  for (const [key, v] of Object.entries(next)) {
    const s = Array.isArray(v) ? v.join(".") : v == null || v === 0 ? "" : String(v);
    if (s) url.searchParams.set(key, s);
    else url.searchParams.delete(key);
  }
  window.history[mode === "push" ? "pushState" : "replaceState"](null, "", url);
}

/** 「3 分鐘，拼出你心中的桃園」：選主題 → 收積木 → 成果卡（成果卡是獨立頁面 /lab/card/…） */
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
        <BrickStep theme={theme} picks={picks} params={params} headingRef={headingRef} />
      ) : (
        <ThemeStep themes={themes} headingRef={headingRef} />
      )}
    </div>
  );
}

type HeadingRef = React.RefObject<HTMLHeadingElement | null>;

/** 第 1 步：選生活主題。沒有 JS 時也是一般連結 */
export function ThemeStep({ themes, headingRef }: { themes: LabTheme[]; headingRef?: HeadingRef }) {
  return (
    <>
      <Stepper at={0} />
      <PenguinSays className="mt-8" penguinClassName="h-24 w-20" bubbleClassName="max-w-xl text-[15px]">
        嗨！我是企鵝阿爸。選一個你最想了解的生活主題，我挑 3 項相關政見給你看；看完收下積木，就能拼出你的桃園卡。不用登入，也不用填任何資料。
      </PenguinSays>
      <h2 ref={headingRef} tabIndex={-1} className="mt-10 text-[22px] font-black tracking-[0.06em] outline-none sm:text-[24px]">
        第 1 步：選一個生活主題
      </h2>
      <ul className="mt-5 grid gap-3">
        {themes.map((t) => (
          <li key={t.slug}>
            <a
              href={`/lab?t=${t.slug}`}
              onClick={(e) => intercept(e, () => setUrl({ t: t.slug, k: null, c: null }, "push"))}
              className="group flex items-center gap-4 rounded-[22px] border-2 border-edge bg-paper p-4 shadow-soft transition-transform hover:-translate-y-0.5 sm:gap-5 sm:p-5"
            >
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl sm:h-20 sm:w-20" style={{ background: t.color.soft }}>
                <Brick color={t.color.base} className="h-10 w-12 sm:h-12 sm:w-14" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[18px] font-black leading-snug tracking-[0.05em] sm:text-[20px]">{t.label}</span>
                <span className="mt-1 block text-[14.5px] font-bold leading-relaxed text-ink-soft">{t.question}</span>
                <span className="mt-1 block text-[12.5px] font-bold text-teal-deep">
                  對應{t.island}・{t.policies.length} 項政見
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

/** 第 2 步：看 3 項政見、收下積木 */
function BrickStep({ theme, picks, params, headingRef }: { theme: LabTheme; picks: number; params: URLSearchParams; headingRef: HeadingRef }) {
  const n = theme.policies.length;
  const k = (((Number(params.get("k")) || 0) % n) + n) % n;
  // 依提出日期由新到舊，每組 3 項；「換一組」往後挪一項
  const shown = Array.from({ length: picks }, (_, i) => theme.policies[(k + i) % n]);
  const got = new Set((params.get("c") ?? "").split(".").filter((id) => shown.some((p) => p.id === id)));
  const done = got.size === shown.length;
  const code = shown
    .map((p) => p.id)
    .sort()
    .join("-");

  const toggle = (id: string) => {
    const next = new Set(got);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setUrl({ c: shown.filter((p) => next.has(p.id)).map((p) => p.id) }, "replace");
  };

  return (
    <>
      <Stepper at={1} />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <a href="/lab" onClick={(e) => intercept(e, () => setUrl({ t: null, k: null, c: null }, "push"))} className="btn btn-sm">
          <span aria-hidden="true">←</span> 換主題
        </a>
        <Link href="/explore" className="text-[14px] font-bold text-ink-soft hover:text-ink hover:underline">
          離開活動，去政策島
        </Link>
      </div>

      <h2 ref={headingRef} tabIndex={-1} className="mt-8 text-[22px] font-black leading-snug tracking-[0.06em] outline-none sm:text-[26px]">
        第 2 步：{theme.label}的 3 塊積木
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{theme.question}看看這 3 項政見，看完就收下積木。</p>

      <section aria-label="我的桃園積木" className="mt-6 rounded-[24px] p-4 sm:p-5" style={{ background: theme.color.soft }}>
        <p className="text-[13px] font-black tracking-[0.12em] text-teal-deep">我的桃園積木</p>
        <ol className="mt-3 grid grid-cols-3 gap-2 sm:gap-4">
          {shown.map((p, i) => {
            const has = got.has(p.id);
            return (
              <li key={p.id} className="flex flex-col items-center gap-1.5 text-center">
                {has ? (
                  <Brick color={theme.color.base} className="h-11 w-16 [animation:pin-drop_.35s_both_var(--ease-out-soft)] sm:h-14 sm:w-20" />
                ) : (
                  <BrickSlot className="h-11 w-16 sm:h-14 sm:w-20" />
                )}
                <span className={`line-clamp-2 text-[12.5px] font-bold leading-snug ${has ? "text-ink" : "text-ink-soft"}`}>{has ? p.short : `第 ${i + 1} 塊`}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border-2 border-dashed border-teal-deep/30 px-4 py-3 text-[13.5px] leading-relaxed text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <p>
          <strong className="text-ink">為什麼是這 3 項？</strong>「{theme.label}」對應本站的{theme.island}，依提出日期由新到舊推薦 3 項。主題和島的對應是本站整理，不是候選人的分類。
        </p>
        {n > picks && (
          <button type="button" className="btn btn-sm shrink-0" onClick={() => setUrl({ k: (k + 1) % n, c: null }, "replace")}>
            換一組（共 {n} 項）
          </button>
        )}
      </div>

      <ol className="mt-6 space-y-5">
        {shown.map((p, i) => (
          <BrickCard key={p.id} policy={p} n={i + 1} got={got.has(p.id)} onToggle={() => toggle(p.id)} theme={theme} />
        ))}
      </ol>

      {done && (
        <PenguinSays pose="wave" className="mt-8" penguinClassName="h-24 w-20" bubbleClassName="text-[15px]">
          拼好了！這 3 塊積木就是你這次探索的桃園。下一步看看你的桃園卡，也可以分享給朋友。
        </PenguinSays>
      )}

      {/* 手機上一直看得到進度與下一步 */}
      <div className="sticky bottom-[max(12px,env(safe-area-inset-bottom))] z-10 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border-2 border-edge bg-paper py-3 pl-5 pr-3 shadow-lift">
        <p aria-live="polite" className="text-[14.5px] font-bold">
          已收下 {got.size}／{shown.length} 塊積木
        </p>
        <Link href={`/lab/card/${code}`} className={`btn btn-sm ${done ? "btn-sun" : ""}`}>
          {done ? "拼好了，看我的桃園卡" : "略過，直接看桃園卡"}
          <ArrowCurve className="h-4 w-4" />
        </Link>
      </div>
    </>
  );
}

function BrickCard({ policy: p, n, got, onToggle, theme }: { policy: LabPolicy; n: number; got: boolean; onToggle: () => void; theme: LabTheme }) {
  const id = `lab-${p.id}`;
  return (
    <li>
      <article aria-labelledby={id} className={`rounded-[24px] border-2 bg-paper p-5 shadow-soft sm:p-6 ${got ? "border-teal-deep/45" : "border-edge"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip" style={{ background: theme.color.soft }}>
            <span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-edge" style={{ background: theme.color.base }} aria-hidden="true" />
            {theme.island}
          </span>
          <span className="rounded-full border-2 border-edge px-2.5 py-0.5 text-[12.5px] font-bold">{p.sourceLabel}</span>
          {got && <span className="rounded-full bg-mint px-2.5 py-0.5 text-[12.5px] font-black text-teal-deep">✓ 已收下</span>}
        </div>
        <h3 id={id} className="mt-3 text-[19px] font-black leading-snug tracking-[0.05em]">
          <span className="sr-only">第 {n} 塊積木：</span>
          {p.title}
        </h3>
        <p className="mt-2 text-[15px] leading-[1.85] text-ink-soft">{p.summary}</p>

        {p.points.length > 0 && (
          <details className="group mt-4 rounded-2xl bg-cream px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[14px] font-black text-teal-deep [&::-webkit-details-marker]:hidden">
              <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-edge bg-paper text-[12px] leading-none transition-transform group-open:rotate-45" aria-hidden="true">
                +
              </span>
              看主張與做法
            </summary>
            <ul className="mt-3 space-y-3 text-[14px] leading-relaxed">
              {p.points.map((pt) => (
                <li key={pt.title || pt.items[0]}>
                  {pt.title && <p className="font-black text-ink">{pt.title}</p>}
                  <ul className="mt-1 space-y-1">
                    {pt.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-ink-soft">
                        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-teal-deep" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </details>
        )}

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13.5px] leading-relaxed">
          <dt className="font-bold">來源</dt>
          <dd className="min-w-0 text-ink-soft">
            {p.sourceUrl ? (
              <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-ink break-words">
                {p.sourceName} <span aria-hidden="true">↗</span>
                <span className="sr-only">（另開新視窗）</span>
              </a>
            ) : (
              <span className="font-bold text-coral">來源待補</span>
            )}
          </dd>
          <dt className="font-bold">最近確認</dt>
          <dd className="text-ink-soft">{p.checkedAt ? <time dateTime={p.checkedAt}>{p.checked}</time> : "未提供"}</dd>
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="button" className={`btn btn-sm ${got ? "" : "btn-sun"}`} onClick={onToggle}>
            {got ? "放回這塊積木" : "收下這塊積木"}
          </button>
          <Link href={`/policies/${p.slug}`} className="inline-flex items-center gap-1 text-[14px] font-bold text-teal-deep hover:underline">
            看完整政見頁
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    </li>
  );
}

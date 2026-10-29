"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PenguinSays } from "@/components/art/speech";
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

export type LabGroup = {
  slug: CategorySlug;
  island: string;
  label: string;
  question: string;
  color: { base: string; soft: string };
  /** 依提出日期由新到舊 */
  policies: LabPolicy[];
};

/**
 * 網址就是活動狀態：?c=已收下的政見 id（依收下的順序，用「.」分隔）。
 * 重新整理、把網址傳給別人，都會看到同樣的積木；瀏覽器不必另外儲存任何東西。
 */
function saveChosen(ids: string[]) {
  const url = new URL(window.location.href);
  if (ids.length) url.searchParams.set("c", ids.join("."));
  else url.searchParams.delete("c");
  window.history.replaceState(null, "", url);
}

/** 「3 分鐘，拼出你心中的桃園」：全部政見一次攤開，挑 3 項收下積木 → 桃園卡（獨立頁面 /lab/card/…） */
export function LabApp({ groups, picks }: { groups: LabGroup[]; picks: number }) {
  const params = useSearchParams();
  const known = new Set(groups.flatMap((g) => g.policies.map((p) => p.id)));
  const chosen = [...new Set((params.get("c") ?? "").split("."))].filter((id) => known.has(id)).slice(0, picks);
  return <LabBoard groups={groups} picks={picks} chosen={chosen} onChange={saveChosen} />;
}

/** 政見板＋積木托盤。沒有 onChange 時（還沒載入完成的預先產生頁面）只顯示、不能選 */
export function LabBoard({ groups, picks, chosen, onChange }: { groups: LabGroup[]; picks: number; chosen: string[]; onChange?: (ids: string[]) => void }) {
  // 選滿之後又按了別塊：在托盤提示先放回一塊
  const [full, setFull] = useState(false);
  const all = groups.flatMap((g) => g.policies.map((policy) => ({ policy, group: g })));
  const byId = new Map(all.map((x) => [x.policy.id, x]));
  const done = chosen.length === picks;
  const code = [...chosen].sort().join("-");

  const toggle = (id: string) => {
    if (chosen.includes(id)) {
      setFull(false);
      onChange?.(chosen.filter((x) => x !== id));
    } else if (!done) onChange?.([...chosen, id]);
    else setFull(true);
  };
  const clear = () => {
    setFull(false);
    onChange?.([]);
  };

  return (
    <>
      <Stepper at={0} />
      <PenguinSays className="mt-8" penguinClassName="h-24 w-20" bubbleClassName="max-w-xl text-[15px]">
        嗨！我是企鵝阿爸。{all.length} 項政見都在下面，依政策島分好了。挑你最想了解的 {picks} 項收下積木，就能拼出你的桃園卡。不用登入，也不用填任何資料。
      </PenguinSays>

      <nav aria-label="跳到政策島" className="mt-8 flex flex-wrap gap-2">
        {groups.map((g) => {
          const n = g.policies.filter((p) => chosen.includes(p.id)).length;
          return (
            <a key={g.slug} href={`#lab-${g.slug}`} className="chip transition-transform hover:-translate-y-0.5" style={{ background: g.color.soft }}>
              <span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-edge" style={{ background: g.color.base }} aria-hidden="true" />
              {g.island}
              <span className="font-bold text-ink-soft">{g.policies.length} 項</span>
              {n > 0 && <span className="rounded-full bg-paper px-1.5 text-[12px] font-black text-teal-deep">已收下 {n}</span>}
            </a>
          );
        })}
      </nav>

      {groups.map((g) => (
        <section key={g.slug} id={`lab-${g.slug}`} aria-labelledby={`lab-${g.slug}-title`} className="mt-12 scroll-mt-28">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl" style={{ background: g.color.soft }}>
              <Brick color={g.color.base} className="h-8 w-11" />
            </span>
            <div className="min-w-0">
              <h2 id={`lab-${g.slug}-title`} className="text-[21px] font-black leading-snug tracking-[0.06em] sm:text-[23px]">
                {g.label}
              </h2>
              <p className="text-[14px] font-bold leading-relaxed text-ink-soft">
                {g.question}
                <span className="ml-1.5 whitespace-nowrap text-teal-deep">
                  {g.island}・{g.policies.length} 項
                </span>
              </p>
            </div>
          </div>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {g.policies.map((p) => (
              <PickCard
                key={p.id}
                policy={p}
                group={g}
                order={chosen.indexOf(p.id)}
                locked={done && !chosen.includes(p.id)}
                onToggle={() => toggle(p.id)}
              />
            ))}
          </ul>
        </section>
      ))}

      <p className="mt-12 text-[13.5px] leading-relaxed text-ink-soft">
        政見依政策島分組，島內依提出日期由新到舊排列。生活主題和島的對應是本站整理，不是候選人的分類。想自己逛？
        <Link href="/explore" className="link-ink mx-1 font-bold text-ink">
          直接進入政策島
        </Link>
        。
      </p>

      {/* 積木托盤：手機上一直看得到已收下哪幾塊與下一步；按積木可以放回 */}
      <div className="sticky bottom-[max(12px,env(safe-area-inset-bottom))] z-10 mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[22px] border-2 border-edge bg-paper py-2.5 pl-3 pr-3 shadow-lift sm:pl-4">
        <ol aria-label="我的桃園積木" className="flex gap-1">
          {Array.from({ length: picks }, (_, i) => {
            const x = byId.get(chosen[i] ?? "");
            return (
              <li key={i}>
                {x ? (
                  <button type="button" onClick={() => toggle(x.policy.id)} className="flex items-center gap-1.5 rounded-xl px-1.5 py-1 hover:bg-cream" title={`放回「${x.policy.short}」`}>
                    <Brick color={x.group.color.base} className="h-8 w-11 [animation:pin-drop_.35s_both_var(--ease-out-soft)]" />
                    <span className="hidden max-w-[7.5em] truncate text-[13px] font-bold lg:block">{x.policy.short}</span>
                    <span className="sr-only lg:hidden">放回「{x.policy.short}」</span>
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
  group: g,
  order,
  locked,
  onToggle,
}: {
  policy: LabPolicy;
  group: LabGroup;
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

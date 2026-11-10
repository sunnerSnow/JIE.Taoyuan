"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { submitWish } from "@/app/(site)/wish/actions";
import { ArrowCurve } from "@/components/ui/decor";
import {
  ANONYMOUS_NAME,
  charCount,
  LIMITS,
  parseWishInput,
  STICKERS,
  stickerIsSvg,
  stickerSrc,
  WISH_DISTRICTS,
  WISH_TOPICS,
  WISH_TYPES,
  type FieldErrors,
  type StickerKey,
  type WishType,
} from "@/lib/wish/options";
import { NOTE_STYLE, TypeIcon, WishBox } from "./wish-art";

type Draft = {
  type: WishType | "";
  title: string;
  content: string;
  topic: string;
  district: string;
  displayName: string;
  visibility: "public" | "team_only";
  agree: boolean;
  sticker: StickerKey | "";
};

const EMPTY: Draft = { type: "", title: "", content: "", topic: "", district: "", displayName: "", visibility: "public", agree: false, sticker: "" };

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

/** Cloudflare Turnstile 人機驗證；token 只能用一次，送出後要 reset */
function Turnstile({ siteKey, onToken, resetSignal }: { siteKey: string; onToken: (t: string) => void; resetSignal: number }) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const tokenRef = useRef(onToken);
  useEffect(() => {
    tokenRef.current = onToken;
  }, [onToken]);

  const render = useCallback(() => {
    if (!box.current || !window.turnstile || widget.current) return;
    widget.current = window.turnstile.render(box.current, {
      sitekey: siteKey,
      language: "zh-tw",
      size: "flexible",
      callback: (t: string) => tokenRef.current(t),
      "expired-callback": () => tokenRef.current(""),
      "error-callback": () => tokenRef.current(""),
    });
  }, [siteKey]);

  useEffect(() => {
    render();
    return () => {
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, [render]);

  useEffect(() => {
    if (resetSignal && widget.current) window.turnstile?.reset(widget.current);
  }, [resetSignal]);

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={render} />
      <div ref={box} className="min-h-[65px]" />
    </>
  );
}

const field = "mt-2 w-full rounded-2xl border-2 border-edge bg-paper px-4 py-3 text-[16px] leading-relaxed outline-none transition-colors focus:border-teal-deep";
const labelText = "text-[15px] font-black tracking-[0.06em]";

function ErrorText({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} className="mt-1.5 text-[13.5px] font-bold text-coral">
      {text}
    </p>
  );
}

export function WishForm({ siteKey, open }: { siteKey: string; open: boolean }) {
  const [d, setD] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const [done, setDone] = useState<{ id: string; visibility: "public" | "team_only"; sticker: StickerKey | "" } | null>(null);
  const [pending, start] = useTransition();
  const honeypot = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  // 入口卡片連到 #write-類型：帶入那個類型
  useEffect(() => {
    const pick = () => {
      const m = window.location.hash.match(/^#write-([a-z]+)$/);
      const t = WISH_TYPES.find((x) => x.key === m?.[1]);
      if (!t) return;
      // 送出成功後再點入口卡片：回到空白表單
      setDone(null);
      setD((x) => ({ ...x, type: t.key }));
    };
    // 網址的 # 只有瀏覽器拿得到，掛載時同步一次
    pick();
    window.addEventListener("hashchange", pick);
    return () => window.removeEventListener("hashchange", pick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = { ...d };
    const { errors: errs } = parseWishInput(raw);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setMessage("有欄位需要修改，請看紅字說明。");
      messageRef.current?.focus();
      return;
    }
    if (!token) {
      setMessage("請先完成下方的人機驗證。");
      messageRef.current?.focus();
      return;
    }
    start(async () => {
      setMessage("");
      let r: Awaited<ReturnType<typeof submitWish>>;
      try {
        r = await submitWish(raw, token, honeypot.current?.value ?? "");
      } catch {
        r = { ok: false, error: "網路好像不太穩，內容還在，請再送一次。" };
      }
      // token 已經用掉了，不管成功失敗都換一個
      setToken("");
      setResetSignal((n) => n + 1);
      if (r.ok) {
        setDone({ id: r.id, visibility: r.visibility, sticker: raw.sticker });
        setD(EMPTY);
        setErrors({});
      } else {
        setErrors(r.fields ?? {});
        setMessage(r.error);
        messageRef.current?.focus();
      }
    });
  };

  if (done) {
    return (
      <div className="rounded-[28px] border-2 border-edge bg-paper p-6 text-center shadow-soft sm:p-10" role="status">
        <div className="relative mx-auto h-44 w-52">
          <span className="wish-drop absolute left-1/2 top-0 block h-14 w-14 rounded-[6px] shadow-soft" style={{ background: "#FFF5C4" }} aria-hidden="true">
            {done.sticker && (
              <Image src={stickerSrc(done.sticker)} alt="" width={40} height={40} unoptimized={stickerIsSvg(done.sticker)} className="absolute -right-4 -top-4 h-10 w-10 object-contain" />
            )}
          </span>
          <WishBox className="absolute bottom-0 left-0 w-full" />
        </div>
        <h3 className="mt-4 text-[26px] font-black tracking-[0.08em]">願望已送出！</h3>
        <p className="mx-auto mt-3 max-w-md text-[15.5px] leading-[1.9] text-ink-soft">
          {done.visibility === "public"
            ? "謝謝你把想法告訴我們。你的願望已經貼上願望牆，大家都看得到。"
            : "謝謝你把想法告訴我們。這則留言只給杰伴桃園志工團隊參考，不會出現在願望牆上。"}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {done.visibility === "public" && (
            <Link href={`/wish/${done.id}`} className="btn btn-sun">
              看我的願望
              <ArrowCurve className="h-4 w-4" />
            </Link>
          )}
          <button type="button" className="btn" onClick={() => setDone(null)}>
            再寫一則
          </button>
        </div>
      </div>
    );
  }

  const type = WISH_TYPES.find((t) => t.key === d.type);
  const contentLen = charCount(d.content);
  const titleLen = charCount(d.title);

  return (
    <form onSubmit={submit} noValidate className="relative rounded-[28px] border-2 border-edge bg-paper p-5 shadow-soft sm:p-8">
      {!open && (
        <p className="mb-6 rounded-2xl bg-sun-soft px-4 py-3 text-[15px] font-bold leading-relaxed">杰個願望還在準備中，很快就可以留言了。</p>
      )}
      <fieldset disabled={!open || pending} className="space-y-7 disabled:opacity-70">
        <fieldset>
          <legend className={labelText}>
            想說哪一種？<span className="text-coral">（必選）</span>
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {WISH_TYPES.map((t) => {
              const s = NOTE_STYLE[t.key];
              const on = d.type === t.key;
              return (
                <label key={t.key} className="relative block cursor-pointer">
                  <input
                    id={`write-${t.key}`}
                    type="radio"
                    name="type"
                    value={t.key}
                    checked={on}
                    onChange={() => set("type", t.key)}
                    className="peer sr-only scroll-mt-40"
                    aria-describedby={errors.type ? "err-type" : undefined}
                  />
                  <span
                    className={`flex h-full flex-col gap-1 rounded-2xl border-2 px-3.5 py-3 transition-[border-color,transform] peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-deep ${
                      on ? "-translate-y-0.5 border-ink" : "border-edge hover:border-teal-deep/50"
                    }`}
                    style={{ background: s.paper }}
                  >
                    <span className="flex items-center gap-1.5 text-[15.5px] font-black">
                      <TypeIcon type={t.key} />
                      {t.label}
                    </span>
                    <span className="text-[12.5px] font-bold leading-snug text-ink-soft">{t.lead}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <ErrorText id="err-type" text={errors.type} />
        </fieldset>

        <div>
          <label htmlFor="wish-title" className={labelText}>
            標題<span className="ml-1 text-[13px] font-bold text-ink-soft">（選填）</span>
          </label>
          <input
            id="wish-title"
            value={d.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={LIMITS.title + 10}
            className={field}
            placeholder="一句話說重點，例如：希望通勤時間更順暢"
            aria-describedby="hint-title err-title"
            aria-invalid={Boolean(errors.title)}
          />
          <p id="hint-title" className={`mt-1 text-right text-[12.5px] font-bold ${titleLen > LIMITS.title ? "text-coral" : "text-ink-soft"}`}>
            {titleLen} / {LIMITS.title}
          </p>
          <ErrorText id="err-title" text={errors.title} />
        </div>

        <div>
          <label htmlFor="wish-content" className={labelText}>
            內容<span className="text-coral">（必填，{LIMITS.contentMin}～{LIMITS.contentMax} 字）</span>
          </label>
          <textarea
            id="wish-content"
            value={d.content}
            onChange={(e) => set("content", e.target.value)}
            rows={6}
            className={`${field} resize-y`}
            placeholder={type?.placeholder ?? "先在上面選一種，再寫下你想說的話。"}
            aria-describedby="hint-content err-content"
            aria-invalid={Boolean(errors.content)}
          />
          <p id="hint-content" className={`mt-1 text-right text-[12.5px] font-bold ${contentLen > LIMITS.contentMax ? "text-coral" : "text-ink-soft"}`}>
            {contentLen} / {LIMITS.contentMax}
          </p>
          <ErrorText id="err-content" text={errors.content} />
        </div>

        <fieldset>
          <legend className={labelText}>
            貼一張小企鵝<span className="ml-1 text-[13px] font-bold text-ink-soft">（選填）</span>
          </legend>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {[{ key: "" as const, label: "不貼" }, ...STICKERS].map((o) => {
              const on = d.sticker === o.key;
              return (
                <label key={o.key || "none"} className="relative block cursor-pointer">
                  <input type="radio" name="sticker" value={o.key} checked={on} onChange={() => set("sticker", o.key)} className="peer sr-only" />
                  <span
                    className={`flex h-full flex-col items-center gap-1 rounded-2xl border-2 px-1 pb-2 pt-1.5 transition-[border-color,background-color] peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-deep ${
                      on ? "border-ink bg-sun-soft" : "border-edge bg-paper hover:border-teal-deep/50"
                    }`}
                  >
                    {o.key ? (
                      <Image src={stickerSrc(o.key)} alt="" width={56} height={56} unoptimized={stickerIsSvg(o.key)} className="h-14 w-14 object-contain" />
                    ) : (
                      <span className="grid h-14 w-14 place-items-center text-[22px] text-ink-soft" aria-hidden="true">
                        ✕
                      </span>
                    )}
                    <span className="text-[13px] font-black">{o.label}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          {d.type !== "encouragement" && (
            <div>
              <label htmlFor="wish-topic" className={labelText}>
                議題<span className="ml-1 text-[13px] font-bold text-ink-soft">（選填）</span>
              </label>
              <select id="wish-topic" value={d.topic} onChange={(e) => set("topic", e.target.value)} className={field}>
                <option value="">不選</option>
                {WISH_TOPICS.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="wish-district" className={labelText}>
              行政區<span className="ml-1 text-[13px] font-bold text-ink-soft">（選填）</span>
            </label>
            <select id="wish-district" value={d.district} onChange={(e) => set("district", e.target.value)} className={field} aria-describedby="err-district">
              <option value="">不選</option>
              {WISH_DISTRICTS.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
            <ErrorText id="err-district" text={errors.district} />
          </div>
        </div>

        <div>
          <label htmlFor="wish-name" className={labelText}>
            顯示名稱<span className="ml-1 text-[13px] font-bold text-ink-soft">（選填）</span>
          </label>
          <input
            id="wish-name"
            value={d.displayName}
            onChange={(e) => set("displayName", e.target.value)}
            maxLength={LIMITS.name + 10}
            className={field}
            placeholder={`沒填就顯示「${ANONYMOUS_NAME}」`}
            autoComplete="off"
            aria-describedby="err-name"
            aria-invalid={Boolean(errors.displayName)}
          />
          <ErrorText id="err-name" text={errors.displayName} />
        </div>

        <fieldset>
          <legend className={labelText}>公開方式</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              { v: "public" as const, title: "公開在願望牆", desc: "大家都看得到，也可以按「認同」" },
              { v: "team_only" as const, title: "只給團隊參考", desc: "不公開，只有杰伴桃園志工團隊看得到" },
            ].map((o) => (
              <label key={o.v} className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-edge px-4 py-3 has-[:checked]:border-ink has-[:checked]:bg-mist/50">
                <input type="radio" name="visibility" value={o.v} checked={d.visibility === o.v} onChange={() => set("visibility", o.v)} className="mt-1.5 h-4 w-4 accent-teal-deep" />
                <span>
                  <span className="block text-[15px] font-black">{o.title}</span>
                  <span className="block text-[13px] font-bold text-ink-soft">{o.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="rounded-2xl bg-mist/60 px-4 py-3 text-[14px] font-bold leading-relaxed text-ink-soft">
          不需要留下電話、身分證字號或住址。請不要在留言中公開自己或他人的個人資料。
        </p>

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={d.agree}
              onChange={(e) => set("agree", e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-teal-deep"
              aria-describedby="err-agree"
              aria-invalid={Boolean(errors.agree)}
            />
            <span className="text-[15px] font-bold leading-relaxed">
              我看過
              <a href="#rules" className="link-ink mx-1 text-teal-deep">
                留言規範
              </a>
              ，也知道選擇公開的留言會顯示在願望牆上。
            </span>
          </label>
          <ErrorText id="err-agree" text={errors.agree} />
        </div>

        {/* 隱藏欄位：真人看不到也不會填，機器人常常會 */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            網站
            <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        {open && siteKey && <Turnstile siteKey={siteKey} onToken={setToken} resetSignal={resetSignal} />}

        <p ref={messageRef} tabIndex={-1} role="alert" className={`text-[15px] font-bold leading-relaxed text-coral outline-none ${message ? "" : "sr-only"}`}>
          {message}
        </p>

        <button type="submit" className="btn btn-sun w-full sm:w-auto" disabled={!open || pending}>
          {pending ? "送出中…" : "送出願望"}
          {!pending && <ArrowCurve className="h-4 w-4" />}
        </button>
      </fieldset>
    </form>
  );
}

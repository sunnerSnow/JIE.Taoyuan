"use client";

import { useState, useTransition } from "react";
import { reportWish } from "@/app/(site)/wish/actions";
import { REPORT_HIDE_AT, REPORT_REASONS, type ReportReason } from "@/lib/wish/options";

/** 檢舉：選原因送出；被不同來源檢舉滿 REPORT_HIDE_AT 次會先下架，等團隊確認 */
export function ReportButton({ id, disabled = false }: { id: string; disabled?: boolean }) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setState({ ok: false, text: "請選一個原因" });
      return;
    }
    start(async () => {
      const r = await reportWish(id, reason).catch(() => ({ ok: false, error: "網路好像不太穩，請再試一次" }));
      setState(r.ok ? { ok: true, text: "收到了，謝謝你。團隊會盡快確認。" } : { ok: false, text: r.error ?? "送出失敗" });
    });
  };

  if (state?.ok) {
    return (
      <p role="status" className="text-[14px] font-bold text-teal-deep">
        {state.text}
      </p>
    );
  }

  return (
    <details className="group text-[14px]">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 font-bold text-ink-soft hover:text-ink [&::-webkit-details-marker]:hidden">
        <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
          <path d="M3.5 14V2.5M3.5 3h8l-1.6 2.6L11.5 8.2h-8" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        檢舉這則留言
      </summary>
      <form onSubmit={send} className="mt-3 rounded-2xl border-2 border-edge bg-paper p-4">
        <fieldset disabled={disabled || pending}>
          <legend className="font-black">為什麼要檢舉？</legend>
          <div className="mt-2 space-y-2">
            {REPORT_REASONS.map((r) => (
              <label key={r.key} className="flex cursor-pointer items-center gap-2.5 font-bold">
                <input type="radio" name="reason" value={r.key} checked={reason === r.key} onChange={() => setReason(r.key)} className="h-4 w-4 accent-teal-deep" />
                {r.label}
              </label>
            ))}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">被 {REPORT_HIDE_AT} 個以上的人檢舉，留言會先下架，由志工團隊確認。</p>
          {state && !state.ok && (
            <p role="alert" className="mt-2 font-bold text-coral">
              {state.text}
            </p>
          )}
          <button type="submit" className="btn btn-sm mt-3">
            {pending ? "送出中…" : "送出檢舉"}
          </button>
        </fieldset>
      </form>
    </details>
  );
}

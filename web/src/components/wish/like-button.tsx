"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { likeWish } from "@/app/(site)/wish/actions";

// 認同（按讚）：伺服器用 cookie 擋重複，瀏覽器另外在 localStorage 記住按過哪些，讓愛心保持實心
const KEY = "jw-liked";
const EVENT = "jw-liked-change";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

const snapshot = () => {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};

function remember(id: string, liked: boolean) {
  try {
    const ids = new Set(snapshot().split(",").filter(Boolean));
    if (liked) ids.add(id);
    else ids.delete(id);
    localStorage.setItem(KEY, [...ids].slice(-500).join(","));
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

export function LikeButton({ id, count, disabled = false, large = false }: { id: string; count: number; disabled?: boolean; large?: boolean }) {
  const stored = useSyncExternalStore(subscribe, snapshot, () => "");
  const [result, setResult] = useState<{ liked: boolean; count: number } | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const liked = result?.liked ?? stored.split(",").includes(id);
  const shown = result?.count ?? count;

  const toggle = () =>
    start(async () => {
      setError("");
      const r = await likeWish(id, !liked);
      if (r.ok) {
        setResult({ liked: r.liked, count: r.count });
        remember(id, r.liked);
      } else setError(r.error);
    });

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled || pending}
        aria-pressed={liked}
        className={`inline-flex items-center gap-1.5 rounded-full border-2 font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          large ? "px-5 py-2.5 text-[16px]" : "px-3 py-1.5 text-[14px]"
        } ${liked ? "border-coral bg-coral text-paper" : "border-coral/40 bg-paper text-coral hover:bg-peach"}`}
      >
        <svg viewBox="0 0 24 24" className={large ? "h-5 w-5" : "h-4 w-4"} aria-hidden="true">
          <path
            d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinejoin="round"
          />
        </svg>
        {liked ? "已認同" : "認同"}
        <span className="font-display">{shown}</span>
        <span className="sr-only">人認同</span>
      </button>
      {error && (
        <span role="status" className="text-[12.5px] font-bold text-coral">
          {error}
        </span>
      )}
    </span>
  );
}

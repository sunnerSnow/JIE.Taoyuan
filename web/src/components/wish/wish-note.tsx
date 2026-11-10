import Link from "next/link";
import { ANONYMOUS_NAME, RESPONSE_STATUS, topicLabel, typeLabel, type ResponseStatus } from "@/lib/wish/options";
import type { PublicWish } from "@/lib/wish/store";
import { LikeButton } from "./like-button";
import { NOTE_STYLE, NOTE_TILT, TypeIcon } from "./wish-art";

const dateFmt = new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" });
export const wishDate = (iso: string) => dateFmt.format(new Date(iso));

export function TypeTag({ type }: { type: PublicWish["type"] }) {
  const s = NOTE_STYLE[type];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-black tracking-[0.06em]" style={{ background: s.tag, color: s.tagText }}>
      <TypeIcon type={type} />
      {typeLabel(type)}
    </span>
  );
}

export function ResponseBadge({ status }: { status: ResponseStatus }) {
  if (status === "none") return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-teal-deep/30 bg-paper px-2.5 py-0.5 text-[12.5px] font-black text-teal-deep">
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {RESPONSE_STATUS[status]}
    </span>
  );
}

/** 願望牆上的一張便利貼 */
export function WishNote({ wish: w, index, open }: { wish: PublicWish; index: number; open: boolean }) {
  const s = NOTE_STYLE[w.type];
  return (
    <article
      className="relative flex h-full flex-col rounded-[10px] border-2 border-edge px-5 pb-4 pt-6 shadow-soft transition-transform duration-300 motion-safe:hover:!rotate-0"
      style={{ background: s.paper, rotate: `${NOTE_TILT[index % NOTE_TILT.length]}deg` }}
    >
      <span aria-hidden="true" className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-2 rounded-[3px] bg-white/75 shadow-[0_1px_3px_rgb(0_90_85/0.15)]" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TypeTag type={w.type} />
        {w.district && <span className="text-[13px] font-black text-ink-soft">{w.district}</span>}
      </div>
      {w.title && <h3 className="mt-3 text-[18px] font-black leading-snug tracking-[0.03em]">{w.title}</h3>}
      <p className={`whitespace-pre-line text-[15px] leading-[1.85] text-ink-soft line-clamp-6 ${w.title ? "mt-2" : "mt-3"}`}>{w.content}</p>
      <div className="mt-auto pt-4">
        {w.topic && <p className="text-[12.5px] font-bold text-teal-deep">#{topicLabel(w.topic)}</p>}
        <p className="mt-1 text-[13px] font-bold text-ink-soft">
          {w.displayName ?? ANONYMOUS_NAME} · <time dateTime={w.createdAt}>{wishDate(w.createdAt)}</time>
        </p>
        {w.responseStatus !== "none" && (
          <div className="mt-2">
            <ResponseBadge status={w.responseStatus} />
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-3 border-t-2 border-dashed border-ink/10 pt-3">
          <LikeButton id={w.id} count={w.likeCount} disabled={!open} />
          <Link href={`/wish/${w.id}`} className="link-ink shrink-0 text-[14px] font-black text-ink">
            查看內容 <span aria-hidden="true">→</span>
            <span className="sr-only">：{w.title ?? w.content.slice(0, 20)}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

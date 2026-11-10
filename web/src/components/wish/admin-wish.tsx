import Link from "next/link";
import { removeWish, setModeration, setResponse } from "@/app/admin/wishes/actions";
import { BLOCK_REASON_LABEL, type BlockReason } from "@/lib/wish/filter";
import { ANONYMOUS_NAME, MODERATION_STATUS, RESPONSE_STATUS, topicLabel, typeLabel } from "@/lib/wish/options";
import type { AdminWish } from "@/lib/wish/store";
import { ConfirmButton } from "./admin-client";

const timeFmt = new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", dateStyle: "short", timeStyle: "short", hour12: false });
export const adminTime = (iso: string) => timeFmt.format(new Date(iso));

export const reasonLabel = (r: string | null) => (r === "reports" ? "多人檢舉" : r ? (BLOCK_REASON_LABEL[r as BlockReason] ?? r) : "");

const STATUS_COLOR = { approved: "bg-mint text-teal-dark", rejected: "bg-peach text-coral", hidden: "bg-ink/10 text-ink" } as const;

/** 後台的一則留言：完整內容＋下架／恢復、回應狀態、刪除 */
export function AdminWishCard({ wish: w, detail = false }: { wish: AdminWish; detail?: boolean }) {
  return (
    <article className="rounded-[20px] border-2 border-edge bg-paper p-5">
      <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
        <span className={`rounded-full px-2.5 py-0.5 font-black ${STATUS_COLOR[w.moderationStatus]}`}>{MODERATION_STATUS[w.moderationStatus]}</span>
        {w.moderationReason && <span className="text-coral">原因：{reasonLabel(w.moderationReason)}</span>}
        {w.visibility === "team_only" && <span className="rounded-full bg-sun-soft px-2.5 py-0.5 font-black">只給團隊</span>}
        <span>{typeLabel(w.type)}</span>
        {w.topic && <span>#{topicLabel(w.topic)}</span>}
        {w.district && <span>{w.district}</span>}
        <span className="text-ink-soft">{w.displayName ?? ANONYMOUS_NAME}</span>
        <span className="text-ink-soft">{adminTime(w.createdAt)}</span>
        <span className="text-ink-soft">讚 {w.likeCount}</span>
        {w.reportCount > 0 && <span className="font-black text-coral">檢舉 {w.reportCount}</span>}
        <span className="text-ink-soft">回覆 {w.replyCount}</span>
        <code className="text-[12px] text-ink-soft">{w.id}</code>
      </div>
      {w.title && <h3 className="mt-3 text-[17px] font-black">{w.title}</h3>}
      <p className="mt-2 whitespace-pre-line break-words text-[15px] leading-[1.8]">{w.content}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t-2 border-dashed border-ink/10 pt-4">
        <form action={setModeration}>
          <input type="hidden" name="id" value={w.id} />
          {w.moderationStatus === "approved" ? (
            <ConfirmButton name="status" value="hidden" message="確定要下架這則留言嗎？之後可以再恢復。" className="btn btn-sm">
              下架
            </ConfirmButton>
          ) : w.moderationReason === "pii" ? (
            <span className="text-[13px] font-bold text-ink-soft">含個資，原文沒有保存，不能恢復</span>
          ) : (
            <button type="submit" name="status" value="approved" className="btn btn-sm btn-ink">
              {w.visibility === "public" ? "恢復公開" : "恢復（只給團隊）"}
            </button>
          )}
        </form>
        <form action={setResponse} className="flex items-center gap-2">
          <input type="hidden" name="id" value={w.id} />
          <label className="sr-only" htmlFor={`rs-${w.id}`}>
            回應狀態
          </label>
          <select id={`rs-${w.id}`} name="status" defaultValue={w.responseStatus} className="rounded-full border-2 border-edge bg-paper px-3 py-2 text-[14px] font-bold">
            {Object.entries(RESPONSE_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-sm">
            更新狀態
          </button>
        </form>
        {!detail && (
          <Link href={`/admin/wishes/${w.id}`} className="btn btn-sm">
            回覆與紀錄
          </Link>
        )}
        {w.moderationStatus === "approved" && w.visibility === "public" && (
          <Link href={`/wish/${w.id}`} className="link-ink text-[14px] font-bold text-ink" target="_blank">
            前台
          </Link>
        )}
        <form action={removeWish} className="ml-auto">
          <input type="hidden" name="id" value={w.id} />
          <ConfirmButton message="永久刪除這則留言（連同讚、檢舉、回覆）？刪除後無法復原。" className="btn btn-sm !text-coral">
            刪除
          </ConfirmButton>
        </form>
      </div>
    </article>
  );
}

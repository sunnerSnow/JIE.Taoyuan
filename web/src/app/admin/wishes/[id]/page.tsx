import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminLogin, ConfirmButton } from "@/components/wish/admin-client";
import { AdminWishCard, adminTime, reasonLabel } from "@/components/wish/admin-wish";
import { wishConfig } from "@/lib/wish/config";
import { isWishId, REPLY_NAME, REPORT_REASONS, RESPONSE_STATUS, type ResponseStatus } from "@/lib/wish/options";
import { isAdmin } from "@/lib/wish/security";
import { adminGet } from "@/lib/wish/store";
import { removeReply, saveReply } from "../actions";

const ACTION_LABEL: Record<string, string> = {
  auto_reject: "自動擋下",
  auto_hide: "檢舉自動下架",
  approve: "恢復公開",
  hide: "下架",
  reject: "退回",
  delete: "刪除",
  response: "回應狀態",
  reply: "新增回覆",
  reply_delete: "刪除回覆",
};

export default function AdminWishPage({ params }: PageProps<"/admin/wishes/[id]">) {
  return (
    <Suspense fallback={<p className="font-bold">載入中…</p>}>
      <AdminWish params={params} />
    </Suspense>
  );
}

async function AdminWish({ params }: { params: PageProps<"/admin/wishes/[id]">["params"] }) {
  if (!wishConfig().admin || !(await isAdmin())) return <AdminLogin />;
  const { id } = await params;
  if (!isWishId(id)) notFound();
  const data = await adminGet(id);
  if (!data) notFound();
  const { wish, replies, logs, reports } = data;

  return (
    <>
      <Link href="/admin/wishes" className="link-ink text-[14px] font-bold text-ink">
        <span aria-hidden="true">←</span> 回到留言管理
      </Link>
      <div className="mt-4">
        <AdminWishCard wish={wish} detail />
      </div>

      <section aria-labelledby="replies-title" className="mt-8">
        <h2 id="replies-title" className="text-[20px] font-black tracking-[0.06em]">
          回覆（以「{REPLY_NAME}」名義顯示）
        </h2>
        {replies.length > 0 && (
          <ul className="mt-4 space-y-3">
            {replies.map((r) => (
              <li key={r.id} className="rounded-2xl border-2 border-edge bg-paper p-4">
                <p className="text-[13px] font-bold text-ink-soft">{adminTime(r.createdAt)}</p>
                <p className="mt-1 whitespace-pre-line text-[15px] leading-[1.8]">{r.content}</p>
                {r.linkUrl && (
                  <p className="mt-1 break-all text-[13px] text-ink-soft">
                    連結：{r.linkLabel ? `${r.linkLabel}｜` : ""}
                    {r.linkUrl}
                  </p>
                )}
                <form action={removeReply} className="mt-2">
                  <input type="hidden" name="id" value={wish.id} />
                  <input type="hidden" name="replyId" value={r.id} />
                  <ConfirmButton message="撤下這則回覆？" className="btn btn-sm !text-coral">
                    撤下回覆
                  </ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
        )}
        <form action={saveReply} className="mt-4 space-y-3 rounded-2xl border-2 border-edge bg-paper p-4">
          <input type="hidden" name="id" value={wish.id} />
          <label className="block">
            <span className="text-[14px] font-black">回覆內容（最多 1000 字）</span>
            <textarea name="content" required rows={4} maxLength={1000} className="mt-1 w-full rounded-2xl border-2 border-edge px-4 py-3 text-[15px] leading-relaxed" />
          </label>
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <label className="block">
              <span className="text-[14px] font-black">相關連結（選填，http/https）</span>
              <input name="linkUrl" type="url" className="mt-1 w-full rounded-2xl border-2 border-edge px-4 py-2 text-[15px]" />
            </label>
            <label className="block">
              <span className="text-[14px] font-black">連結文字（選填）</span>
              <input name="linkLabel" maxLength={40} className="mt-1 w-full rounded-2xl border-2 border-edge px-4 py-2 text-[15px]" />
            </label>
          </div>
          <p className="text-[13px] text-ink-soft">
            回覆會公開在這則願望下面。不要以候選人本人的名義回覆，也不要承諾候選人或競選團隊沒有說過的事。第一次回覆時，回應狀態會自動改成「{RESPONSE_STATUS.replied}」。
          </p>
          <button type="submit" className="btn btn-sm btn-ink">
            新增回覆
          </button>
        </form>
      </section>

      <section aria-labelledby="reports-title" className="mt-8">
        <h2 id="reports-title" className="text-[20px] font-black tracking-[0.06em]">
          檢舉
        </h2>
        {reports.length ? (
          <ul className="mt-2 space-y-1 text-[15px]">
            {reports.map((r) => (
              <li key={r.key}>
                {REPORT_REASONS.find((x) => x.key === r.key)?.label ?? r.key}：{r.n}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[15px] text-ink-soft">沒有檢舉</p>
        )}
      </section>

      <section aria-labelledby="logs-title" className="mt-8">
        <h2 id="logs-title" className="text-[20px] font-black tracking-[0.06em]">
          處理紀錄
        </h2>
        {logs.length ? (
          <ul className="mt-2 space-y-1 text-[14px]">
            {logs.map((l, i) => (
              <li key={i}>
                <span className="text-ink-soft">{adminTime(l.createdAt)}</span> {ACTION_LABEL[l.action] ?? l.action}
                {l.note && `：${l.action === "response" ? RESPONSE_STATUS[l.note as ResponseStatus] ?? l.note : l.action === "auto_reject" ? reasonLabel(l.note) : l.note}`}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[14px] text-ink-soft">沒有紀錄</p>
        )}
      </section>
    </>
  );
}

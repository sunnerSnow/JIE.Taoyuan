"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { wishConfig } from "@/lib/wish/config";
import { charCount, isWishId, RESPONSE_STATUS, type ModerationStatus, type ResponseStatus } from "@/lib/wish/options";
import { allow, endAdminSession, ipHash, isAdmin, passwordMatches, startAdminSession } from "@/lib/wish/security";
import { addReply, deleteReply, deleteWish, moderate, setResponseStatus, WISHES_TAG, wishTag } from "@/lib/wish/store";

// 後台的每個動作都要在伺服器端重新確認登入，不能只靠畫面上藏按鈕

export async function login(_: string | null, form: FormData): Promise<string | null> {
  if (!wishConfig().admin) return "後台還沒有設定（需要 ADMIN_PASSWORD、WISH_SECRET 與資料庫）。";
  if (!(await allow("login", await ipHash(), [[900, 10]]))) return "嘗試太多次了，請 15 分鐘後再試。";
  const password = form.get("password");
  if (typeof password !== "string" || !passwordMatches(password)) return "密碼不對。";
  await startAdminSession();
  redirect("/admin/wishes");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/wishes");
}

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/wishes");
}

const wishIdFrom = (form: FormData) => {
  const id = form.get("id");
  return typeof id === "string" && isWishId(id) ? id : null;
};

/** 公開狀態有變：願望牆和這則的快取都要更新 */
const refresh = (id: string) => {
  updateTag(WISHES_TAG);
  updateTag(wishTag(id));
};

export async function setModeration(form: FormData) {
  await requireAdmin();
  const id = wishIdFrom(form);
  const status = form.get("status");
  if (!id || (status !== "approved" && status !== "hidden" && status !== "rejected")) return;
  const note = form.get("note");
  await moderate(id, status as ModerationStatus, typeof note === "string" && note.trim() ? note.trim().slice(0, 200) : "後台操作");
  refresh(id);
}

export async function setResponse(form: FormData) {
  await requireAdmin();
  const id = wishIdFrom(form);
  const status = form.get("status");
  if (!id || typeof status !== "string" || !Object.hasOwn(RESPONSE_STATUS, status)) return;
  await setResponseStatus(id, status as ResponseStatus);
  refresh(id);
}

/** 回覆的連結只收 http(s) 網址 */
function safeUrl(v: FormDataEntryValue | null) {
  if (typeof v !== "string" || !v.trim()) return null;
  try {
    const u = new URL(v.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export async function saveReply(form: FormData) {
  await requireAdmin();
  const id = wishIdFrom(form);
  const content = form.get("content");
  if (!id || typeof content !== "string" || !content.trim() || charCount(content) > 1000) return;
  const label = form.get("linkLabel");
  await addReply(id, content.trim().replace(/\r\n?/g, "\n"), safeUrl(form.get("linkUrl")), typeof label === "string" && label.trim() ? label.trim().slice(0, 40) : null);
  refresh(id);
}

export async function removeReply(form: FormData) {
  await requireAdmin();
  const id = wishIdFrom(form);
  const replyId = form.get("replyId");
  if (!id || typeof replyId !== "string" || !isWishId(replyId)) return;
  await deleteReply(id, replyId);
  refresh(id);
}

export async function removeWish(form: FormData) {
  await requireAdmin();
  const id = wishIdFrom(form);
  if (!id) return;
  await deleteWish(id);
  refresh(id);
  redirect("/admin/wishes");
}

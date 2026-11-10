"use server";

import { updateTag } from "next/cache";
import { wishConfig } from "@/lib/wish/config";
import { checkWish, type BlockReason } from "@/lib/wish/filter";
import { isWishId, parseWishInput, REPORT_REASONS, type FieldErrors, type ReportReason } from "@/lib/wish/options";
import { allow, ipHash, verifyTurnstile, visitorId } from "@/lib/wish/security";
import { addReport, insertWish, isDuplicate, setLike, WISHES_TAG, wishTag } from "@/lib/wish/store";

export type SubmitResult =
  | { ok: true; id: string; visibility: "public" | "team_only" }
  | { ok: false; error: string; fields?: FieldErrors; blocked?: boolean };

const BLOCKED_MESSAGE: Record<BlockReason, string> = {
  pii: "請不要留下電話、身分證字號、email 或 LINE ID 等個人資料。拿掉之後就可以送出。",
  spam: "留言不能放網址或廣告。拿掉之後就可以送出。",
  impersonation: "顯示名稱不能使用候選人、官方或團隊的名義，換一個名稱，或留空用匿名。",
  gibberish: "內容看起來像重複的字或亂碼，請寫下完整的句子。",
  profanity: "這則留言含有不適合公開的用語，所以沒有送出公開。換個說法再試一次吧。",
  hate: "這則留言含有不適合公開的用語，所以沒有送出公開。換個說法再試一次吧。",
  attack: "杰個願望是加油、許願和提出好點子的地方，攻擊、負評或比較其他候選人的內容不會公開。",
};

/** 投稿：驗證 → 人機驗證 → 頻率限制 → 重複檢查 → 關鍵字過濾。通過就直接公開（不做人工審核） */
export async function submitWish(raw: unknown, token: unknown, website: unknown): Promise<SubmitResult> {
  const cfg = wishConfig();
  if (!cfg.open) return { ok: false, error: "杰個願望還在準備中，暫時不能留言。" };
  // 隱藏欄位：真人看不到，有填的是機器人
  if (typeof website === "string" && website !== "") return { ok: false, error: "送出失敗，請重新整理頁面再試一次。" };

  const { input, errors } = parseWishInput(raw);
  if (Object.keys(errors).length) return { ok: false, error: "有欄位需要修改，請看紅字說明。", fields: errors };

  if (!(await verifyTurnstile(typeof token === "string" ? token : ""))) {
    return { ok: false, error: "人機驗證沒有通過或已經過期，請重新勾選驗證再送出。" };
  }
  if (!(await allow("post", await ipHash(), [[600, 3], [86400, 10]]))) {
    return { ok: false, error: "送出得太頻繁了，請過一段時間再試。" };
  }
  if (await isDuplicate(input.content)) return { ok: false, error: "這段內容已經送出過了，不用再送一次。" };

  const reason = checkWish(input);
  if (reason) {
    // 被擋下的也存起來（不公開），後台可以看到原因，誤擋的能手動恢復；因個資被擋的不存原文
    await insertWish(reason === "pii" ? { ...input, title: "", content: "（含個人資料，原文未保存）", displayName: "" } : input, "rejected", reason);
    return { ok: false, error: BLOCKED_MESSAGE[reason], blocked: true, fields: reason === "impersonation" ? { displayName: "請換一個名稱" } : undefined };
  }

  const id = await insertWish(input, "approved", null);
  if (input.visibility === "public") updateTag(WISHES_TAG);
  return { ok: true, id, visibility: input.visibility };
}

export type LikeResult = { ok: true; liked: boolean; count: number } | { ok: false; error: string };

export async function likeWish(id: unknown, want: unknown): Promise<LikeResult> {
  const cfg = wishConfig();
  if (!cfg.open || typeof id !== "string" || !isWishId(id) || typeof want !== "boolean") return { ok: false, error: "現在不能按讚" };
  const ip = await ipHash();
  if (!(await allow("like", ip, [[600, 60]]))) return { ok: false, error: "按得太快了，休息一下再試" };
  const result = await setLike(id, await visitorId(), ip, want);
  if (!result) return { ok: false, error: "找不到這則願望" };
  // 讚數馬上更新：重新整理後才不會看到「已認同」卻是舊的數字
  updateTag(WISHES_TAG);
  updateTag(wishTag(id));
  return { ok: true, ...result };
}

export async function reportWish(id: unknown, reason: unknown): Promise<{ ok: boolean; error?: string }> {
  const cfg = wishConfig();
  if (!cfg.open || typeof id !== "string" || !isWishId(id)) return { ok: false, error: "現在不能檢舉" };
  if (!REPORT_REASONS.some((r) => r.key === reason)) return { ok: false, error: "請選一個原因" };
  const ip = await ipHash();
  if (!(await allow("report", ip, [[3600, 10]]))) return { ok: false, error: "檢舉得太頻繁了，請過一段時間再試" };
  const { hidden } = await addReport(id, await visitorId(), ip, reason as ReportReason);
  if (hidden) {
    updateTag(WISHES_TAG);
    updateTag(wishTag(id));
  }
  return { ok: true };
}

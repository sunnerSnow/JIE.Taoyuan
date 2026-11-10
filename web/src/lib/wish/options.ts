// 杰個願望 JIE WISH 的選項與文字：前台表單、願望牆、後台共用（瀏覽器端也會用到，不要在這裡讀環境變數或資料庫）

export const WISH_TYPES = [
  { key: "encouragement", label: "加油打氣", lead: "給世杰一份鼓勵", placeholder: "例如：世杰加油！我們一起讓桃園更好。" },
  { key: "wish", label: "許下心願", lead: "我希望桃園……", placeholder: "我希望桃園……" },
  { key: "message", label: "有話想說", lead: "有想法、有問題，都可以說出來", placeholder: "想說的話、生活裡遇到的問題，都可以寫在這裡。" },
  { key: "proposal", label: "桃園提案", lead: "讓生活更好的點子", placeholder: "哪裡可以更好？說說你的具體做法，例如在哪裡、改什麼、對誰有幫助。" },
] as const;

export type WishType = (typeof WISH_TYPES)[number]["key"];

/** 議題分類：和留言類型分開存 */
export const WISH_TOPICS = [
  { key: "transport", label: "交通與通勤" },
  { key: "family", label: "育兒與家庭" },
  { key: "education", label: "教育與青年" },
  { key: "health", label: "長照與健康" },
  { key: "housing", label: "居住與住宅" },
  { key: "environment", label: "公園與環境" },
  { key: "industry", label: "產業與就業" },
  { key: "culture", label: "文化與觀光" },
  { key: "other", label: "其他" },
] as const;

export type WishTopic = (typeof WISH_TOPICS)[number]["key"];

export const WISH_DISTRICTS = [
  "桃園區",
  "中壢區",
  "大溪區",
  "楊梅區",
  "蘆竹區",
  "大園區",
  "龜山區",
  "八德區",
  "龍潭區",
  "平鎮區",
  "新屋區",
  "觀音區",
  "復興區",
] as const;

export type ModerationStatus = "approved" | "rejected" | "hidden";
export type ResponseStatus = "none" | "received" | "replied" | "tracking" | "updated";

/** 回應狀態：依團隊實際處理情形在後台設定，預設「尚無回覆」，前台不顯示 */
export const RESPONSE_STATUS: Record<ResponseStatus, string> = {
  none: "尚無回覆",
  received: "已收到",
  replied: "團隊已回覆",
  tracking: "持續追蹤",
  updated: "有新進展",
};

export const MODERATION_STATUS: Record<ModerationStatus, string> = {
  approved: "公開中",
  rejected: "自動擋下",
  hidden: "已下架",
};

export const REPORT_REASONS = [
  { key: "abuse", label: "攻擊、謾罵或惡意負評" },
  { key: "pii", label: "含有個人資料" },
  { key: "spam", label: "廣告或洗版" },
  { key: "author", label: "這是我寫的，想刪除" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["key"];

/** 回覆一律以這個名義顯示：本站是支持者自發經營，回覆不代表候選人或競選團隊 */
export const REPLY_NAME = "杰伴桃園志工團隊";
export const ANONYMOUS_NAME = "匿名桃園市民";

/**
 * 小企鵝貼圖（public/wish/stickers/）：
 * 吉普車三張是使用者提供的插畫去背（tools/wish-stickers/cutout.py），其餘由 tools/wish-stickers/build.py 產生。
 */
export const STICKERS = [
  { key: "jeep-go", label: "出發！", file: "jeep-go.png" },
  { key: "jeep-one", label: "一號", file: "jeep-one.png" },
  { key: "jeep-wave", label: "嗨！", file: "jeep-wave.png" },
  { key: "cheer", label: "加油", file: "cheer.svg" },
  { key: "love", label: "比心", file: "love.svg" },
  { key: "wish", label: "許願", file: "wish.svg" },
  { key: "good", label: "讚", file: "good.svg" },
  { key: "thanks", label: "謝謝", file: "thanks.svg" },
  { key: "happy", label: "開心", file: "happy.svg" },
  { key: "idea", label: "好點子", file: "idea.svg" },
  { key: "vote", label: "凍蒜", file: "vote.svg" },
] as const;

export type StickerKey = (typeof STICKERS)[number]["key"];
const stickerFile = (k: StickerKey) => STICKERS.find((s) => s.key === k)?.file ?? "cheer.svg";
export const stickerSrc = (k: StickerKey) => `/wish/stickers/${stickerFile(k)}`;
/** SVG 直接用原檔；PNG 交給 next/image 縮成需要的大小 */
export const stickerIsSvg = (k: StickerKey) => stickerFile(k).endsWith(".svg");
export const stickerLabel = (k: string | null) => STICKERS.find((s) => s.key === k)?.label ?? "";

export const LIMITS = { title: 40, contentMin: 10, contentMax: 500, name: 20 };

/** 被不同來源檢舉幾次就先下架，等團隊確認 */
export const REPORT_HIDE_AT = 3;

export const typeLabel = (k: string) => WISH_TYPES.find((t) => t.key === k)?.label ?? "";
export const topicLabel = (k: string | null) => WISH_TOPICS.find((t) => t.key === k)?.label ?? "";

/** 字數：emoji 算一個字 */
export const charCount = (s: string) => Array.from(s).length;

/** 留言的網址代碼：英數字、底線、連字號 */
export const isWishId = (id: string) => /^[A-Za-z0-9_-]{12}$/.test(id);

export type WishInput = {
  type: WishType;
  title: string;
  content: string;
  topic: WishTopic | null;
  district: string | null;
  displayName: string;
  visibility: "public" | "team_only";
  sticker: StickerKey | null;
};

export type FieldErrors = Partial<Record<"type" | "title" | "content" | "district" | "displayName" | "visibility" | "agree", string>>;

/** 表單驗證：瀏覽器先檢查一次，伺服器收到後再檢查一次（以伺服器為準） */
export function parseWishInput(raw: unknown): { input: WishInput; errors: FieldErrors } {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const errors: FieldErrors = {};

  const type = str(r.type) as WishType;
  if (!WISH_TYPES.some((t) => t.key === type)) errors.type = "請選一種留言類型";

  const title = str(r.title).replace(/\s+/g, " ");
  if (charCount(title) > LIMITS.title) errors.title = `標題最多 ${LIMITS.title} 個字`;

  // 內容保留換行，但最多連續兩個空行
  const content = str(r.content).replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n");
  const n = charCount(content.replace(/\s/g, ""));
  if (n < LIMITS.contentMin) errors.content = `內容至少要 ${LIMITS.contentMin} 個字`;
  else if (charCount(content) > LIMITS.contentMax) errors.content = `內容最多 ${LIMITS.contentMax} 個字`;

  const topicRaw = str(r.topic);
  const topic = type !== "encouragement" && WISH_TOPICS.some((t) => t.key === topicRaw) ? (topicRaw as WishTopic) : null;

  const districtRaw = str(r.district);
  const district = (WISH_DISTRICTS as readonly string[]).includes(districtRaw) ? districtRaw : null;
  if (districtRaw && !district) errors.district = "請從選單選擇行政區";

  const displayName = str(r.displayName).replace(/\s+/g, " ");
  if (charCount(displayName) > LIMITS.name) errors.displayName = `顯示名稱最多 ${LIMITS.name} 個字`;

  const visibility = r.visibility === "team_only" ? "team_only" : r.visibility === "public" ? "public" : null;
  if (!visibility) errors.visibility = "請選擇公開方式";

  if (r.agree !== true) errors.agree = "請先確認留言規範";

  const sticker = STICKERS.find((s) => s.key === r.sticker)?.key ?? null;

  return { input: { type, title, content, topic, district, displayName, visibility: visibility ?? "public", sticker }, errors };
}

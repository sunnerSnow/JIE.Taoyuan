// 杰個願望的資料存取（只在伺服器端用）。
// 前台只讀「公開且沒被擋下」的留言；僅供團隊參考、被擋下、已下架的內容只有後台讀得到。
import { cacheLife, cacheTag } from "next/cache";
import { db, type Row } from "./db";
import { newId } from "./security";
import { REPORT_HIDE_AT, type ModerationStatus, type ReportReason, type ResponseStatus, type WishInput, type WishTopic, type WishType } from "./options";

/** 願望牆的快取標籤：有新的公開留言、下架、回覆時更新 */
export const WISHES_TAG = "wishes";
export const wishTag = (id: string) => `wish:${id}`;
/** 願望牆快取一分鐘；投稿、按讚、下架、回覆時會立刻失效 */
const WALL_LIFE = { stale: 30, revalidate: 60, expire: 600 };

const PUBLIC = "moderation_status = 'approved' and visibility = 'public'";

export type PublicWish = {
  id: string;
  type: WishType;
  title: string | null;
  content: string;
  topic: WishTopic | null;
  district: string | null;
  displayName: string | null;
  likeCount: number;
  responseStatus: ResponseStatus;
  createdAt: string;
};

export type WishReply = { id: string; content: string; linkUrl: string | null; linkLabel: string | null; createdAt: string };

const iso = (v: unknown) => (v instanceof Date ? v : new Date(String(v))).toISOString();
const text = (v: unknown) => (v == null ? null : String(v));

function toWish(r: Row): PublicWish {
  return {
    id: String(r.id),
    type: r.type as WishType,
    title: text(r.title),
    content: String(r.content),
    topic: text(r.topic) as WishTopic | null,
    district: text(r.district),
    displayName: text(r.display_name),
    likeCount: Number(r.like_count),
    responseStatus: r.response_status as ResponseStatus,
    createdAt: iso(r.created_at),
  };
}

const toReply = (r: Row): WishReply => ({
  id: String(r.id),
  content: String(r.content),
  linkUrl: text(r.link_url),
  linkLabel: text(r.link_label),
  createdAt: iso(r.created_at),
});

const WISH_COLUMNS = "id, type, title, content, topic, district, display_name, like_count, response_status, created_at";

/* ---------- 前台（有快取） ---------- */

export type WallQuery = { sort: "new" | "hot"; type: WishType | null; district: string | null; q: string; limit: number };

/** 願望牆；關鍵字可以任意輸入，有關鍵字時不進快取，避免產生數不完的快取項目 */
export async function getWall(w: WallQuery) {
  return w.q ? queryWall(w) : getCachedWall(w);
}

async function getCachedWall(w: WallQuery) {
  "use cache";
  cacheTag(WISHES_TAG);
  cacheLife(WALL_LIFE);
  return queryWall(w);
}

async function queryWall(w: WallQuery) {
  const q = await db();
  const where = [PUBLIC];
  const params: unknown[] = [];
  const add = (v: unknown) => `$${params.push(v)}`;
  if (w.type) where.push(`type = ${add(w.type)}`);
  if (w.district) where.push(`district = ${add(w.district)}`);
  if (w.q) {
    const p = add(w.q);
    where.push(`(strpos(content, ${p}) > 0 or strpos(coalesce(title, ''), ${p}) > 0 or strpos(coalesce(display_name, ''), ${p}) > 0)`);
  }
  const order = w.sort === "hot" ? "like_count desc, created_at desc" : "created_at desc";
  const rows = await q(
    `select ${WISH_COLUMNS}, count(*) over ()::int as total from wishes where ${where.join(" and ")} order by ${order} limit ${Math.min(Math.max(1, Math.floor(w.limit)), 240)}`,
    params,
  );
  return { items: rows.map(toWish), total: Number(rows[0]?.total ?? 0) };
}

/** 各類型的公開留言數（真實資料，沒有就是 0） */
export async function getWallStats() {
  "use cache";
  cacheTag(WISHES_TAG);
  cacheLife(WALL_LIFE);
  const q = await db();
  const rows = await q(`select type, count(*)::int as n from wishes where ${PUBLIC} group by type`);
  const byType = Object.fromEntries(rows.map((r) => [String(r.type), Number(r.n)])) as Partial<Record<WishType, number>>;
  return { total: rows.reduce((s, r) => s + Number(r.n), 0), byType };
}

export async function getPublicWish(id: string) {
  "use cache";
  cacheTag(WISHES_TAG, wishTag(id));
  cacheLife(WALL_LIFE);
  const q = await db();
  const [row] = await q(`select ${WISH_COLUMNS} from wishes where id = $1 and ${PUBLIC}`, [id]);
  if (!row) return null;
  const replies = await q(`select id, content, link_url, link_label, created_at from wish_replies where wish_id = $1 order by created_at`, [id]);
  return { wish: toWish(row), replies: replies.map(toReply) };
}

/* ---------- 前台寫入 ---------- */

/** 24 小時內有一模一樣的內容就不再收（被擋下的不算：改了名稱或用語再送一次是正常的） */
export async function isDuplicate(content: string) {
  const q = await db();
  const rows = await q(`select 1 from wishes where content = $1 and moderation_status <> 'rejected' and created_at > now() - interval '1 day' limit 1`, [content]);
  return rows.length > 0;
}

export async function insertWish(input: WishInput, status: Extract<ModerationStatus, "approved" | "rejected">, reason: string | null) {
  const q = await db();
  const id = newId();
  await q(
    `insert into wishes (id, type, title, content, topic, district, display_name, visibility, moderation_status, moderation_reason)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [id, input.type, input.title || null, input.content, input.topic, input.district, input.displayName || null, input.visibility, status, reason],
  );
  if (status === "rejected") await log(id, "auto_reject", reason);
  return id;
}

/**
 * 按讚／收回讚：同一個瀏覽器一則只算一次；同一個來源 IP 對同一則最多算 20 次（家裡、公司、行動網路會共用 IP）。
 * 回傳最新讚數；留言不存在或不公開時回傳 null。
 */
export async function setLike(id: string, visitor: string, ip: string, want: boolean) {
  const q = await db();
  if (want) {
    await q(
      `with ins as (
         insert into wish_likes (wish_id, visitor_id, ip_hash)
         select id, $2, $3 from wishes
         where id = $1 and ${PUBLIC} and (select count(*) from wish_likes where wish_id = $1 and ip_hash = $3) < 20
         on conflict do nothing
         returning wish_id
       )
       update wishes set like_count = like_count + 1 where id in (select wish_id from ins)`,
      [id, visitor, ip],
    );
  } else {
    await q(
      `with del as (delete from wish_likes where wish_id = $1 and visitor_id = $2 returning wish_id)
       update wishes set like_count = greatest(like_count - 1, 0) where id in (select wish_id from del)`,
      [id, visitor],
    );
  }
  const [row] = await q(
    `select like_count, exists (select 1 from wish_likes where wish_id = $1 and visitor_id = $2) as liked from wishes where id = $1 and ${PUBLIC}`,
    [id, visitor],
  );
  return row ? { count: Number(row.like_count), liked: Boolean(row.liked) } : null;
}

/**
 * 檢舉：同一個瀏覽器一則只算一次；不同來源檢舉滿 REPORT_HIDE_AT 次就先下架。
 * 後台恢復公開時會記下時間（reports_cleared_at），之後只算新的檢舉，管理員的判斷不會被下一次檢舉推翻。
 */
export async function addReport(id: string, visitor: string, ip: string, reason: ReportReason) {
  const q = await db();
  const [row] = await q(
    `with ins as (
       insert into wish_reports (wish_id, visitor_id, ip_hash, reason)
       select id, $2, $3, $4 from wishes where id = $1 and ${PUBLIC}
       on conflict do nothing
       returning wish_id
     )
     update wishes set report_count = report_count + 1 where id in (select wish_id from ins)
     returning id`,
    [id, visitor, ip, reason],
  );
  if (!row) return { hidden: false };
  const [count] = await q(
    `select count(distinct r.ip_hash)::int as sources from wish_reports r join wishes w on w.id = r.wish_id
     where r.wish_id = $1 and r.created_at > coalesce(w.reports_cleared_at, '-infinity'::timestamptz)`,
    [id],
  );
  if (Number(count?.sources) >= REPORT_HIDE_AT) {
    const hidden = await q(
      `update wishes set moderation_status = 'hidden', moderation_reason = 'reports', updated_at = now() where id = $1 and moderation_status = 'approved' returning id`,
      [id],
    );
    if (hidden.length) await log(id, "auto_hide", `被 ${REPORT_HIDE_AT} 個以上的來源檢舉`);
    return { hidden: hidden.length > 0 };
  }
  return { hidden: false };
}

async function log(wishId: string, action: string, note: string | null) {
  const q = await db();
  await q(`insert into wish_moderation_logs (wish_id, action, note) values ($1, $2, $3)`, [wishId, action, note]);
}

/* ---------- 後台（不快取，呼叫前一定要先確認已登入） ---------- */

export type AdminWish = PublicWish & {
  visibility: "public" | "team_only";
  moderationStatus: ModerationStatus;
  moderationReason: string | null;
  reportCount: number;
  replyCount: number;
  updatedAt: string;
};

const toAdminWish = (r: Row): AdminWish => ({
  ...toWish(r),
  visibility: r.visibility as AdminWish["visibility"],
  moderationStatus: r.moderation_status as ModerationStatus,
  moderationReason: text(r.moderation_reason),
  reportCount: Number(r.report_count),
  replyCount: Number(r.reply_count ?? 0),
  updatedAt: iso(r.updated_at),
});

export type AdminQuery = {
  status: ModerationStatus | null;
  visibility: "public" | "team_only" | null;
  type: WishType | null;
  reported: boolean;
  q: string;
  page: number;
};

export const ADMIN_PAGE_SIZE = 50;

export async function adminList(a: AdminQuery) {
  const q = await db();
  const where: string[] = ["true"];
  const params: unknown[] = [];
  const add = (v: unknown) => `$${params.push(v)}`;
  if (a.status) where.push(`moderation_status = ${add(a.status)}`);
  if (a.visibility) where.push(`visibility = ${add(a.visibility)}`);
  if (a.type) where.push(`type = ${add(a.type)}`);
  if (a.reported) where.push("report_count > 0");
  if (a.q) {
    const p = add(a.q);
    where.push(`(strpos(content, ${p}) > 0 or strpos(coalesce(title, ''), ${p}) > 0 or strpos(coalesce(display_name, ''), ${p}) > 0 or id = ${p})`);
  }
  const rows = await q(
    `select w.*, (select count(*)::int from wish_replies r where r.wish_id = w.id) as reply_count, count(*) over ()::int as total
     from wishes w where ${where.join(" and ")}
     order by ${a.reported ? "report_count desc, " : ""}created_at desc
     limit ${ADMIN_PAGE_SIZE} offset ${Math.max(0, a.page - 1) * ADMIN_PAGE_SIZE}`,
    params,
  );
  return { items: rows.map(toAdminWish), total: Number(rows[0]?.total ?? 0) };
}

export async function adminStats() {
  const q = await db();
  const [totals] = await q(
    `select count(*)::int as total,
       count(*) filter (where ${PUBLIC})::int as public,
       count(*) filter (where visibility = 'team_only' and moderation_status = 'approved')::int as team_only,
       count(*) filter (where moderation_status = 'rejected')::int as rejected,
       count(*) filter (where moderation_status = 'hidden')::int as hidden,
       count(*) filter (where report_count > 0 and moderation_status = 'approved')::int as reported
     from wishes`,
  );
  const byType = await q(`select type as k, count(*)::int as n from wishes where moderation_status = 'approved' group by type order by n desc`);
  const byTopic = await q(`select coalesce(topic, '') as k, count(*)::int as n from wishes where moderation_status = 'approved' group by topic order by n desc`);
  const byDistrict = await q(`select coalesce(district, '') as k, count(*)::int as n from wishes where moderation_status = 'approved' group by district order by n desc`);
  const byReason = await q(`select coalesce(moderation_reason, '') as k, count(*)::int as n from wishes where moderation_status = 'rejected' group by moderation_reason order by n desc`);
  const top = await q(`select ${WISH_COLUMNS} from wishes where ${PUBLIC} and like_count > 0 order by like_count desc, created_at desc limit 5`);
  const pairs = (rows: Row[]) => rows.map((r) => ({ key: String(r.k), n: Number(r.n) }));
  return {
    totals: Object.fromEntries(Object.entries(totals ?? {}).map(([k, v]) => [k, Number(v)])) as Record<"total" | "public" | "team_only" | "rejected" | "hidden" | "reported", number>,
    byType: pairs(byType),
    byTopic: pairs(byTopic),
    byDistrict: pairs(byDistrict),
    byReason: pairs(byReason),
    top: top.map(toWish),
  };
}

export async function adminGet(id: string) {
  const q = await db();
  const [row] = await q(`select w.*, (select count(*)::int from wish_replies r where r.wish_id = w.id) as reply_count from wishes w where id = $1`, [id]);
  if (!row) return null;
  const replies = await q(`select id, content, link_url, link_label, created_at from wish_replies where wish_id = $1 order by created_at`, [id]);
  const logs = await q(`select action, note, created_at from wish_moderation_logs where wish_id = $1 order by created_at desc limit 50`, [id]);
  const reports = await q(`select reason as k, count(*)::int as n from wish_reports where wish_id = $1 group by reason order by n desc`, [id]);
  return {
    wish: toAdminWish(row),
    replies: replies.map(toReply),
    logs: logs.map((l) => ({ action: String(l.action), note: text(l.note), createdAt: iso(l.created_at) })),
    reports: reports.map((r) => ({ key: String(r.k), n: Number(r.n) })),
  };
}

/**
 * 恢復公開時清掉擋下原因、檢舉數歸零，之後的自動下架只算新的檢舉（檢舉紀錄本身留著）。
 * 因個資被擋的留言沒有保存原文，不能恢復。
 */
export async function moderate(id: string, status: ModerationStatus, note: string | null) {
  const q = await db();
  const rows = await q(
    status === "approved"
      ? `update wishes set moderation_status = 'approved', moderation_reason = null, report_count = 0, reports_cleared_at = now(), updated_at = now()
         where id = $1 and coalesce(moderation_reason, '') <> 'pii' returning id`
      : `update wishes set moderation_status = $2, updated_at = now() where id = $1 returning id`,
    status === "approved" ? [id] : [id, status],
  );
  if (rows.length) await log(id, status === "approved" ? "approve" : status === "hidden" ? "hide" : "reject", note);
  return rows.length > 0;
}

export async function setResponseStatus(id: string, status: ResponseStatus) {
  const q = await db();
  const rows = await q(`update wishes set response_status = $2, updated_at = now() where id = $1 returning id`, [id, status]);
  if (rows.length) await log(id, "response", status);
  return rows.length > 0;
}

export async function addReply(id: string, content: string, linkUrl: string | null, linkLabel: string | null) {
  const q = await db();
  const rows = await q(
    `insert into wish_replies (id, wish_id, content, link_url, link_label) select $2, id, $3, $4, $5 from wishes where id = $1 returning id`,
    [id, newId(), content, linkUrl, linkLabel],
  );
  if (!rows.length) return false;
  // 第一次回覆時，回應狀態從「尚無回覆／已收到」改成「團隊已回覆」
  await q(`update wishes set response_status = 'replied', updated_at = now() where id = $1 and response_status in ('none', 'received')`, [id]);
  await log(id, "reply", null);
  return true;
}

export async function deleteReply(wishId: string, replyId: string) {
  const q = await db();
  const rows = await q(`delete from wish_replies where id = $1 and wish_id = $2 returning id`, [replyId, wishId]);
  if (rows.length) await log(wishId, "reply_delete", null);
  return rows.length > 0;
}

/** 永久刪除（連同讚、檢舉、回覆）；處理紀錄留著 */
export async function deleteWish(id: string) {
  const q = await db();
  const rows = await q(`delete from wishes where id = $1 returning id`, [id]);
  if (rows.length) await log(id, "delete", null);
  return rows.length > 0;
}

// 杰個願望的防濫用與後台登入（只在伺服器端用）：
// - IP 只存加鹽雜湊，用來限制頻率、防止灌讚，無法還原成原本的 IP
// - 訪客代碼存在 HttpOnly cookie，只用來讓同一個瀏覽器不能重複按讚、檢舉
// - 後台登入是一組密碼，登入後發 HMAC 簽章的 HttpOnly cookie
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { wishConfig } from "./config";
import { db } from "./db";

const VISITOR_COOKIE = "jw_visitor";
const ADMIN_COOKIE = "jw_admin";
const ADMIN_HOURS = 12;

const hmac = (key: string, data: string) => createHmac("sha256", key).update(data).digest("base64url");

export const newId = () => randomBytes(9).toString("base64url"); // 12 字

/** 連線來源 IP 的加鹽雜湊（Vercel 會把真正的來源放在 x-forwarded-for 第一個） */
export async function ipHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return hmac(wishConfig().secret, `ip:${ip}`).slice(0, 22);
}

/** 這個瀏覽器的訪客代碼；沒有就發一個 */
export async function visitorId() {
  const jar = await cookies();
  const current = jar.get(VISITOR_COOKIE)?.value;
  if (current && /^[A-Za-z0-9_-]{22}$/.test(current)) return current;
  const id = randomBytes(16).toString("base64url");
  jar.set(VISITOR_COOKIE, id, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return id;
}

/**
 * 頻率限制：rules 是 [秒數, 次數]，每個時間窗都還沒到上限才算一次並放行。
 * 紀錄只留兩天。
 */
export async function allow(bucket: string, ip: string, rules: [number, number][]) {
  const q = await db();
  const longest = Math.max(...rules.map(([s]) => s));
  const [row] = await q(
    `select ${rules.map((_, i) => `count(*) filter (where created_at > now() - make_interval(secs => $${3 + i}))::int as c${i}`).join(", ")}
     from wish_rate where bucket = $1 and ip_hash = $2 and created_at > now() - make_interval(secs => ${Math.ceil(longest)})`,
    [bucket, ip, ...rules.map(([s]) => s)],
  );
  if (rules.some((r, i) => Number(row?.[`c${i}`] ?? 0) >= r[1])) return false;
  await q(`insert into wish_rate (bucket, ip_hash) values ($1, $2)`, [bucket, ip]);
  if (Math.random() < 0.05) await q(`delete from wish_rate where created_at < now() - interval '2 days'`);
  return true;
}

/** Cloudflare Turnstile 人機驗證（token 只能用一次） */
export async function verifyTurnstile(token: string) {
  const cfg = wishConfig();
  if (!token || token.length > 2048 || !cfg.turnstileSecret) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: cfg.turnstileSecret, response: token }),
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/* ---------- 後台登入 ---------- */

/** 簽章金鑰綁定密碼：改密碼後舊的登入全部失效 */
const adminKey = () => {
  const cfg = wishConfig();
  return hmac(cfg.secret, `admin:${createHash("sha256").update(cfg.adminPassword).digest("base64url")}`);
};

export function passwordMatches(input: string) {
  const cfg = wishConfig();
  if (!cfg.admin) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(cfg.adminPassword).digest();
  return timingSafeEqual(a, b);
}

export async function startAdminSession() {
  const exp = Date.now() + ADMIN_HOURS * 3600 * 1000;
  const value = `${exp}.${hmac(adminKey(), `session:${exp}`)}`;
  (await cookies()).set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: ADMIN_HOURS * 3600,
  });
}

export async function endAdminSession() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" });
}

export async function isAdmin() {
  if (!wishConfig().admin) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value ?? "";
  const [exp, sig] = value.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const expected = Buffer.from(hmac(adminKey(), `session:${exp}`));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

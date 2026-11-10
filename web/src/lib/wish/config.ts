// 杰個願望的環境設定（只在伺服器端用）。密鑰只放在 Vercel 的環境變數，不寫進程式。
//
// 正式站需要：
//   DATABASE_URL                     Neon Postgres（Vercel 的 Neon 整合會自動填入）
//   WISH_SECRET                      32 字以上的隨機字串：IP 雜湊與後台登入簽章用
//   ADMIN_PASSWORD                   後台密碼，12 字以上
//   NEXT_PUBLIC_TURNSTILE_SITE_KEY   Cloudflare Turnstile 的 site key
//   TURNSTILE_SECRET_KEY             Cloudflare Turnstile 的 secret key
// 本機測試：WISH_DEV_DB=pglite 會改用記憶體裡的 Postgres（PGlite），Turnstile 也改用 Cloudflare 的測試金鑰；在 Vercel 上無效。

/** Cloudflare 公開的測試金鑰：一律通過 */
const TEST_SITE_KEY = "1x00000000000000000000AA";
const TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

export function wishConfig() {
  const dev = process.env.WISH_DEV_DB === "pglite" && !process.env.VERCEL;
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  const db: "neon" | "pglite" | null = databaseUrl ? "neon" : dev ? "pglite" : null;
  const secret = process.env.WISH_SECRET ?? (dev ? "local-test-only-secret-0123456789abcdef" : "");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? (dev ? TEST_SITE_KEY : "");
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY ?? (dev ? TEST_SECRET_KEY : "");
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  const hasSecret = secret.length >= 32;
  return {
    db,
    databaseUrl,
    secret,
    siteKey,
    turnstileSecret,
    adminPassword,
    /** 可以讀願望牆 */
    readable: db !== null,
    /** 可以投稿、按讚、檢舉 */
    open: db !== null && hasSecret && Boolean(siteKey && turnstileSecret),
    /** 後台可以登入 */
    admin: db !== null && hasSecret && adminPassword.length >= 12,
  };
}

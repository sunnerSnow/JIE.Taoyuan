// IndexNow：把有更新的網址通知 Bing 等搜尋引擎（api.indexnow.org 會轉給所有參與的引擎；Google 不參與）。
// 用法（在 repo 任何位置都可以執行，不需要安裝套件）：
//   node tools/indexnow/submit.mjs          只送 sitemap 裡 lastmod 是今天或昨天（台灣時間）的網址
//   node tools/indexnow/submit.mjs --all    送 sitemap 的全部網址（第一次、大改版或漏送好幾天時用）
//   node tools/indexnow/submit.mjs --dry    只列出會送哪些網址，不送出
// 平常由 .github/workflows/indexnow.yml 在 Vercel 部署完成後自動執行，另有每天一次的補送。
// lastmod 來自政見資料的更新日期（web/src/app/sitemap.ts），所以只改程式或版面、沒動資料時不會送任何網址。
// 金鑰是 web/public/<金鑰>.txt（檔名＝內容），部署後會在網站根目錄，IndexNow 用它確認網址是本站送的。
// 金鑰依規格本來就公開，不是機密。換自訂網域時，用 SITE_URL 指定新網址（要和 sitemap 裡的網址同一個主機）。

import { readdirSync, readFileSync } from "node:fs";

const SITE = (process.env.SITE_URL ?? "https://jie-taoyuan.vercel.app").replace(/\/$/, "");
const HOST = new URL(SITE).host;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const TIMEOUT = 30_000;
const args = new Set(process.argv.slice(2));
const all = args.has("--all");
const dry = args.has("--dry");

function readKey() {
  const dir = new URL("../../web/public/", import.meta.url);
  const files = readdirSync(dir).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (files.length !== 1) throw new Error(`web/public 裡應該剛好有一個 IndexNow 金鑰檔，找到 ${files.length} 個`);
  const key = files[0].slice(0, -4);
  if (readFileSync(new URL(files[0], dir), "utf8").trim() !== key) throw new Error(`${files[0]} 的內容要和檔名相同`);
  return key;
}

/** 台灣時間的日期（YYYY-MM-DD），往前推 daysAgo 天 */
function taipeiDate(daysAgo = 0) {
  return new Date(Date.now() + 8 * 3600_000 - daysAgo * 86400_000).toISOString().slice(0, 10);
}

const get = (url) => fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });

/** 正式網域可能比部署狀態晚一點切換：金鑰檔最多等 2 分鐘 */
async function waitForKeyFile(keyLocation, key) {
  for (let i = 0; i < 5; i++) {
    const res = await get(keyLocation).catch(() => null);
    if (res?.ok && (await res.text()).trim() === key) return;
    await new Promise((r) => setTimeout(r, 30_000));
  }
  throw new Error(`網站上的金鑰檔不對（${keyLocation}），可能還沒部署完成`);
}

async function main() {
  const key = readKey();
  const res = await get(`${SITE}/sitemap.xml`);
  if (!res.ok) throw new Error(`讀不到 sitemap：HTTP ${res.status}`);
  const entries = [...(await res.text()).matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .map(([, body]) => ({ loc: body.match(/<loc>([^<]+)<\/loc>/)?.[1], lastmod: body.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.slice(0, 10) }))
    .filter((e) => e.loc);

  // IndexNow 只收和 host 同一個主機的網址（不同會回 422）
  const otherHost = entries.filter((e) => new URL(e.loc).host !== HOST);
  if (otherHost.length) {
    console.warn(`sitemap 有 ${otherHost.length} 個網址不在 ${HOST}（例如 ${otherHost[0].loc}），不送出；換網域時請設定 SITE_URL`);
    if (otherHost.length === entries.length) process.exit(1);
  }

  const since = taipeiDate(1);
  const urls = entries
    .filter((e) => new URL(e.loc).host === HOST && (all || (e.lastmod && e.lastmod >= since)))
    .map((e) => e.loc);
  console.log(all ? `全部 ${urls.length} 個網址` : `lastmod ≥ ${since} 的網址 ${urls.length} 個（sitemap 共 ${entries.length} 個）`);
  for (const u of urls) console.log(`  ${u}`);
  if (!urls.length || dry) return;

  const keyLocation = `${SITE}/${key}.txt`;
  await waitForKeyFile(keyLocation, key);

  const submit = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key, keyLocation, urlList: urls }),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  console.log(`IndexNow 回應：HTTP ${submit.status} ${(await submit.text()).slice(0, 200)}`);
  // 200 已收到；202 已收到、金鑰還在驗證中
  if (submit.status !== 200 && submit.status !== 202) process.exit(1);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

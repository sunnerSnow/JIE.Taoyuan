// 官方貼文偵測的共用工具：設定、本站已收錄的貼文、GitHub Issue、讀 YouTube 與 Threads 的公開頁面。
// 瀏覽器用 Playwright 預設的身分開公開頁面，不登入、不偽裝成其他程式。

import { readFileSync, readdirSync } from "node:fs";
import { chromium } from "playwright";

export const config = JSON.parse(readFileSync(new URL("./config.json", import.meta.url), "utf8"));

const YT_ID = /(?:youtube\.com\/(?:shorts\/|watch\?v=|live\/)|youtu\.be\/)([\w-]{11})/g;
const TH_CODE = /threads\.(?:com|net)\/@[\w.]+\/post\/([\w-]+)/g;

/** 一段文字裡出現的貼文（yt:影片 id、th:貼文代碼） */
export function postKeys(text) {
  const keys = new Set();
  for (const m of text.matchAll(YT_ID)) keys.add(`yt:${m[1]}`);
  for (const m of text.matchAll(TH_CODE)) keys.add(`th:${m[1]}`);
  return keys;
}

/** 本站資料（web/src/data）已經引用的貼文 */
export function knownKeys() {
  const dir = new URL(`${config.dataDir}/`, import.meta.url);
  const keys = new Set();
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".ts")) continue;
    for (const k of postKeys(readFileSync(new URL(f, dir), "utf8"))) keys.add(k);
  }
  return keys;
}

const repo = process.env.GITHUB_REPOSITORY ?? config.repo;
const token = process.env.GITHUB_TOKEN;
export const hasToken = Boolean(token);

/** GitHub REST API（公開 repo 沒有 token 也能讀；寫入要 token） */
export async function gh(path, init = {}) {
  const res = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub ${init.method ?? "GET"} ${path}：HTTP ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

/** 收件匣 Issue（最近 100 則，含留言）；state 可以是 open、closed、all */
export async function inboxIssues(state = "all") {
  const issues = (await gh(`/issues?labels=${encodeURIComponent(config.label)}&state=${state}&per_page=100`)).filter((i) => !i.pull_request);
  for (const i of issues) i.commentList = i.comments > 0 ? await gh(`/issues/${i.number}/comments?per_page=100`) : [];
  return issues;
}

/** 台灣時間，例如 2026/10/28 09:43 */
export const twTime = (iso) =>
  new Date(iso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });

export async function withBrowser(fn) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ locale: "zh-TW" });
    return await fn(page);
  } finally {
    await browser.close();
  }
}

const ytKey = process.env.YOUTUBE_API_KEY;
/** 有 YOUTUBE_API_KEY 時用官方 YouTube Data API（有說明欄與發布時間）；沒有時只能讀頻道清單 */
export const hasYoutubeKey = Boolean(ytKey);

async function youtubeApi(path, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [k, v] of Object.entries({ ...params, key: ytKey })) url.searchParams.set(k, v);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube Data API ${path}：HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

/** 官方 API：頻道「上傳的影片」由新到舊，含標題、說明欄與發布時間 */
export async function youtubeUploads(max = 25) {
  const playlistId = `UU${config.youtube.channelId.slice(2)}`;
  const data = await youtubeApi("playlistItems", { part: "snippet,contentDetails", playlistId, maxResults: String(max) });
  return data.items.map((i) => ({
    id: i.contentDetails.videoId,
    title: i.snippet.title,
    text: i.snippet.description ?? "",
    publishedAt: i.contentDetails.videoPublishedAt ?? i.snippet.publishedAt,
  }));
}

/** 官方 API：單支影片 */
export async function youtubeVideo(id) {
  if (!hasYoutubeKey) throw new Error("沒有設定 YOUTUBE_API_KEY，讀不到說明欄；請用瀏覽器開啟網址查看");
  const v = (await youtubeApi("videos", { part: "snippet", id })).items?.[0];
  if (!v) throw new Error(`找不到影片 ${id}`);
  return { channelId: v.snippet.channelId, title: v.snippet.title, text: v.snippet.description ?? "", publishedAt: v.snippet.publishedAt };
}

/**
 * 沒有 API key 時：讀頻道分頁（shorts、videos）的公開清單，由新到舊列出影片 id 與標題。
 * 單支影片頁會被 YouTube 要求登入，所以這個模式拿不到說明欄與發布時間。
 */
export async function youtubeTabList(tab) {
  const res = await fetch(`${config.youtube.channel}/${tab}`, { headers: { "Accept-Language": "zh-TW" } });
  const html = await res.text();
  const json = html.match(/ytInitialData\s*=\s*(\{.+?\});<\/script>/s)?.[1];
  if (!res.ok || !json) throw new Error(`讀不到 ${tab} 分頁的影片清單（HTTP ${res.status}）`);
  const list = [];
  const add = (id, title) => id && !list.some((v) => v.id === id) && list.push({ id, title: title ?? "" });
  (function walk(o) {
    if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) return o.forEach(walk);
    if (o.shortsLockupViewModel) {
      const v = o.shortsLockupViewModel;
      return add(v.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId, v.overlayMetadata?.primaryText?.content);
    }
    if (o.lockupViewModel?.contentId) return add(o.lockupViewModel.contentId, o.lockupViewModel.metadata?.lockupMetadataViewModel?.title?.content);
    if (o.videoRenderer?.videoId) return add(o.videoRenderer.videoId, o.videoRenderer.title?.runs?.[0]?.text ?? o.videoRenderer.title?.simpleText);
    if (o.reelItemRenderer?.videoId) return add(o.reelItemRenderer.videoId, o.reelItemRenderer.headline?.simpleText);
    Object.values(o).forEach(walk);
  })(JSON.parse(json));
  return list.slice(0, config.youtube.perTab);
}

/** 頁面上看得到的 Threads 貼文卡片（沒登入時，個人頁只有置頂與最近幾篇） */
async function threadsCards(page) {
  return page.evaluate(() => {
    const cards = new Map();
    for (const c of document.querySelectorAll('div[data-pressable-container="true"]')) {
      const a = c.querySelector('a[href*="/post/"]');
      const t = c.querySelector("time[datetime]");
      if (!a || !t) continue;
      const code = a.getAttribute("href").split("/post/")[1]?.split(/[/?]/)[0];
      if (!code || cards.has(code)) continue;
      const texts = [...c.querySelectorAll('span[dir="auto"]')].map((s) => s.innerText.trim()).filter(Boolean);
      cards.set(code, { code, publishedAt: t.getAttribute("datetime"), pinned: texts.includes("已釘選"), texts });
    }
    return [...cards.values()];
  });
}

export async function threadsProfilePosts(page) {
  await page.goto(config.threads, { waitUntil: "networkidle", timeout: 60_000 });
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(1200);
  }
  return threadsCards(page);
}

export async function threadsPost(page, code) {
  await page.goto(`${config.threads}/post/${code}`, { waitUntil: "networkidle", timeout: 60_000 });
  return (await threadsCards(page)).find((c) => c.code === code) ?? null;
}

/** 從貼文卡片的文字裡挑出內文：去掉帳號、置頂、時間、地點與按讚數 */
export function threadsText(texts) {
  const handle = config.threads.split("@")[1];
  // 「翻譯」按鈕的文字在不同環境可能夾著看不見的字元，比對前先拿掉
  const bare = (t) => t.replace(/[\s\u200b-\u200f\u2060\ufeff]/g, "");
  return texts
    .filter(
      (t) =>
        t !== handle &&
        t !== "已釘選" &&
        !/^(查看)?翻譯$/.test(bare(t)) &&
        t.length > 2 &&
        !/^[\d,.]+\s*[萬千KkMm]?$/.test(t) &&
        !/^\d+\s*(秒|分鐘|小時|天|週)$/.test(t) &&
        !/^\d{4}-\d{1,2}-\d{1,2}$/.test(t) &&
        !t.startsWith("很抱歉，播放此影片"),
    )
    .join("\n");
}

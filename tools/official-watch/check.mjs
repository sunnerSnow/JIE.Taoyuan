// 官方貼文偵測（GitHub Actions 每天跑兩次）：找出候選人 YouTube 與 Threads 上，本站還沒收錄、也還沒回報過的貼文，
// 寫到「官方新貼文待整理」Issue（已經有開著的就留言）。只回報，不改網站；整理與更新由人呼叫 Claude（/sync-official）處理。
// 本機試跑：npm run dry（只印出結果，不寫 GitHub；沒有 GITHUB_TOKEN 時也一律只印出）

import { config, gh, hasToken, hasYoutubeKey, inboxIssues, knownKeys, lastRunTime, postKeys, threadsProfilePosts, threadsText, twTime, withBrowser, youtubeTabList, youtubeUploads } from "./lib.mjs";

const dry = process.argv.includes("--dry") || !hasToken;
const since = new Date(`${config.since}T00:00:00+08:00`);
const now = new Date();

const known = knownKeys();
const lastRun = (await lastRunTime()) ?? new Date(now - config.intervalHours * 3600_000);
const issues = await inboxIssues();
const reported = new Set();
for (const i of issues) for (const text of [i.body ?? "", ...i.commentList.map((c) => c.body ?? "")]) for (const k of postKeys(text)) reported.add(k);
const seen = (key) => known.has(key) || reported.has(key);

const items = [];
const warnings = [];
let failed = 0;

/** 第一次偵測時，整個分頁都沒有看過的影片：列為基準線（記在回報裡，之後就算看過），不當成新貼文 */
const baseline = [];

// YouTube：有 API key 時依發布時間判斷；沒有時只能看頻道清單的順序，比已看過的影片還前面的才算新
try {
  if (hasYoutubeKey) {
    for (const v of await youtubeUploads()) {
      const key = `yt:${v.id}`;
      if (seen(key)) continue;
      if (new Date(v.publishedAt) < since) break;
      items.push({ key, platform: "YouTube", url: `https://www.youtube.com/watch?v=${v.id}`, publishedAt: v.publishedAt, title: v.title, text: v.text });
    }
  } else {
    for (const tab of config.youtube.tabs) {
      const list = await youtubeTabList(tab);
      const firstSeen = list.findIndex((v) => seen(`yt:${v.id}`));
      const url = (id) => (tab === "shorts" ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`);
      if (firstSeen === -1) {
        baseline.push(...list.map((v) => ({ ...v, url: url(v.id) })));
        continue;
      }
      for (const v of list.slice(0, firstSeen)) items.push({ key: `yt:${v.id}`, platform: "YouTube", url: url(v.id), publishedAt: null, title: v.title, text: "" });
    }
  }
} catch (err) {
  failed++;
  warnings.push(`YouTube 讀取失敗：${err.message}。請手動到 ${config.youtube.channel} 確認。`);
}

await withBrowser(async (page) => {
  // Threads：沒登入只看得到最近幾篇
  try {
    const posts = (await threadsProfilePosts(page)).filter((p) => !p.pinned);
    if (posts.length === 0) throw new Error("頁面上沒有貼文（可能被要求登入）");
    for (const p of posts) {
      const key = `th:${p.code}`;
      if (seen(key) || new Date(p.publishedAt) < since) continue;
      items.push({ key, platform: "Threads", url: `${config.threads}/post/${p.code}`, publishedAt: p.publishedAt, text: threadsText(p.texts) });
    }
    // 看得到的全是新貼文、最舊一篇又比上次偵測還新：上次和這次之間可能有貼文沒看到
    const oldest = new Date(Math.min(...posts.map((p) => Date.parse(p.publishedAt))));
    const overlaps = posts.some((p) => seen(`th:${p.code}`) || new Date(p.publishedAt) < since);
    if (!overlaps && oldest > lastRun) {
      warnings.push(
        `Threads 可能有漏抓：沒登入只看得到最近 ${posts.length} 篇，最舊一篇是 ${twTime(oldest.toISOString())}，比上次偵測（${twTime(lastRun.toISOString())}）還新，中間可能還有貼文。請到 ${config.threads} 往下捲確認。`,
      );
    }
  } catch (err) {
    failed++;
    warnings.push(`Threads 讀取失敗：${err.message}。請手動到 ${config.threads} 確認。`);
  }
});

const stamp = twTime(now.toISOString());
if (!items.length && !warnings.length && !baseline.length) {
  console.log(`${stamp} 沒有新貼文`);
  process.exit(0);
}

/** 摘要裡的網址換掉：避免說明欄提到的其他影片被當成「已回報」 */
const excerpt = (text) => {
  const flat = text.replace(/https?:\/\/\S+/g, "（連結）").replace(/\s+/g, " ").trim();
  return flat.length > 140 ? `${flat.slice(0, 140)}…` : flat;
};

// 沒有發布時間的（YouTube 清單模式）維持頻道上的順序，排在最前面
items.sort((a, b) => (b.publishedAt ? Date.parse(b.publishedAt) : Infinity) - (a.publishedAt ? Date.parse(a.publishedAt) : Infinity));
const lines = [`偵測時間：${stamp}（台灣時間）`, ""];
for (const platform of ["YouTube", "Threads"]) {
  const list = items.filter((i) => i.platform === platform);
  if (!list.length) continue;
  lines.push(`### ${platform}（${list.length} 則）`, "");
  if (platform === "YouTube" && !hasYoutubeKey) lines.push("沒有設定 YouTube API key：只比對頻道清單，沒有發布時間與說明欄。", "");
  for (const i of list) {
    const title = i.title?.replace(/[[\]]/g, "");
    lines.push(`- ${i.publishedAt ? twTime(i.publishedAt) : "（發布時間未知）"}　${title ? `[${title}](${i.url})` : i.url}`);
    if (excerpt(i.text)) lines.push(`  > ${excerpt(i.text)}`);
  }
  lines.push("");
}
for (const w of warnings) lines.push("> [!WARNING]", `> ${w}`, "");
if (baseline.length) {
  lines.push(`<details><summary>YouTube 基準線：第一次偵測，以下 ${baseline.length} 支影片視為已看過，不列入待整理</summary>`, "");
  for (const v of baseline) lines.push(`- ${v.url} ${v.title.replace(/[[\]]/g, "")}`);
  lines.push("", "</details>", "");
}
const report = lines.join("\n");

if (dry) {
  console.log(report);
} else {
  const open = issues.find((i) => i.state === "open");
  const prior = open ? [open.body ?? "", ...open.commentList.map((c) => c.body ?? "")].join("\n") : "";
  // 沒有新貼文、警告也跟之前一樣時不再重複留言
  const repeat = !items.length && !baseline.length && warnings.every((w) => prior.includes(w.split("：")[0] + "："));
  if (repeat) console.log(`${stamp} 只有重複的警告，不留言`);
  else if (open) {
    await gh(`/issues/${open.number}/comments`, { method: "POST", body: JSON.stringify({ body: report }) });
    console.log(`已留言到 #${open.number}：${items.length} 則新貼文、${warnings.length} 則警告`);
  } else {
    const howto = [
      "---",
      "處理方式：在這個專案的 Claude Code 輸入 `/sync-official`。Claude 會讀取這則 Issue（含留言）的貼文，依本站的來源規則整理後更新網站，commit 前會先給你確認；處理完的 commit 會關閉這則 Issue。",
    ].join("\n");
    const issue = await gh("/issues", {
      method: "POST",
      body: JSON.stringify({ title: `${config.issueTitle}（${stamp.slice(0, 10)} 起）`, labels: [config.label], body: `${report}\n${howto}` }),
    });
    console.log(`已開 Issue #${issue.number}：${items.length} 則新貼文、${warnings.length} 則警告`);
  }
}
// 兩個平台都讀不到時讓 Actions 顯示失敗（GitHub 會寄信通知）
if (failed === 2) process.exitCode = 1;

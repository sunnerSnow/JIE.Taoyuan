// 讀官方貼文的完整內容（YouTube 說明欄、Threads 內文），整理政見時用來核對原文。
// 用法：npm run read -- <網址> [<網址> …]

import { postKeys, threadsPost, threadsText, twTime, withBrowser, youtubeVideo } from "./lib.mjs";

const urls = process.argv.slice(2);
if (!urls.length) {
  console.error("用法：npm run read -- <YouTube 或 Threads 網址> …");
  process.exit(1);
}

await withBrowser(async (page) => {
  for (const url of urls) {
    const [key] = postKeys(url);
    console.log(`=== ${url}`);
    try {
      if (key?.startsWith("yt:")) {
        const v = await youtubeVideo(key.slice(3));
        console.log(`發布：${twTime(v.publishedAt)}（${v.publishedAt}）\n標題：${v.title}\n說明欄：\n${v.text}`);
      } else if (key?.startsWith("th:")) {
        const p = await threadsPost(page, key.slice(3));
        if (!p) throw new Error("頁面上找不到這篇貼文（可能被要求登入）");
        console.log(`發布：${twTime(p.publishedAt)}（${p.publishedAt}）\n內文：\n${threadsText(p.texts)}`);
      } else console.log("不是 YouTube 或 Threads 的貼文網址");
    } catch (err) {
      console.log(`讀取失敗：${err.message}`);
    }
    console.log("");
  }
});

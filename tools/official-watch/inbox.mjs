// 列出還沒處理的「官方新貼文待整理」Issue（內文與留言），給 /sync-official 讀取用。公開 repo 不需要 token。
// 用法：npm run inbox

import { config, inboxIssues } from "./lib.mjs";

const open = await inboxIssues("open");
if (!open.length) {
  console.log(`沒有開著的「${config.issueTitle}」Issue。`);
} else {
  for (const i of open) {
    console.log(`# #${i.number} ${i.title}\n${i.html_url}\n`);
    console.log(i.body ?? "");
    for (const c of i.commentList) console.log(`\n--- 留言 ${c.created_at} ---\n${c.body ?? ""}`);
    console.log("\n");
  }
}

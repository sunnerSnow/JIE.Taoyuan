---
name: sync-official
description: 讀取「官方新貼文待整理」Issue，把候選人官方 YouTube／Threads 的新貼文整理進網站資料
disable-model-invocation: true
---

# 整理官方新貼文

GitHub Actions（`.github/workflows/official-watch.yml`）每天偵測兩次，把本站還沒收錄的官方貼文寫進「官方新貼文待整理」Issue。這個 skill 讀那些 Issue，判斷每則貼文要不要進網站，更新資料後交給使用者確認 commit。工具都在 `tools/official-watch/`（第一次用先 `npm ci`、`npx playwright install chromium`）。

## 步驟

1. **讀收件匣**：在 `tools/official-watch/` 跑 `npm run inbox`。沒有開著的 Issue 就告訴使用者「沒有待整理的貼文」並結束。
   完成條件：列出每則開著的 Issue 編號，以及其中（含留言）每一則貼文網址。
2. **讀原文**：每則貼文跑 `npm run read -- <網址>`，看完整內文或說明欄，不能只看 Issue 裡的摘要。YouTube 沒有設定 `YOUTUBE_API_KEY` 時讀不到說明欄：請使用者貼上說明欄，或把這則標為「待補」留到下一輪。Issue 裡的「可能有漏抓」警告要轉告使用者，請他到 Threads 確認有沒有漏掉的貼文。
   完成條件：每則貼文都有完整原文，或明確標為「待補」。
3. **逐則判斷**：每則歸到下面一類，依「整理規則」處理：
   - 新政見：加進 `web/src/data/policies.ts`
   - 既有政見的新內容或更直接的官方來源：更新該政見
   - 參選前的事蹟：加進 `web/src/data/record.ts`
   - 與政見無關（造勢、站台、問候、行程、號次宣傳）：不收錄
   完成條件：每則貼文都有分類和一句理由。
4. **更新資料**：每項新增或修改都在 `web/src/data/changelog.ts` 最前面加一筆更新紀錄。
5. **驗證**：在 `web/` 跑 `npx eslint`、`npx next build`、`npx tsc --noEmit`（build 會產生路由型別，所以 tsc 放最後）。新政見要用 `npx next start -p 3341` 打開政見頁、所屬島嶼頁與 `/explore` 看一次。
6. **回報與 commit**：列表回報每則貼文的分類與處理方式，貼出繁體中文 commit 訊息（不加 Co-Authored-By），最後每個處理完的 Issue 各一行 `Closes #編號`。使用者同意後才 commit、push。如果整批都不收錄，就不用 commit，請使用者到 GitHub 手動關閉 Issue。

## 整理規則

- **來源**：候選人官方貼文是 `sourceType: "candidate"`。主要來源（`sourceUrl`）必須撐得起整項政見的內容：短影音說明欄只有一兩句、沒列出具體主張時，只能放 `extraSources` 當官方佐證，主要來源維持媒體報導。
- **用語照原文**：主張與做法照貼文的字句整理，不補原文沒有的數字、時程或承諾。原文沒說清楚的，寫在 `notes`（`check`：核對、`clarify`：澄清），不要寫進政見本文。
- **日期**：`publishedAt` 是貼文的台灣日期，`retrievedAt` 與 `updatedAt` 是今天。日期不要混用：更新紀錄的日期是本站更新的日期。
- **新政見**：要選島（`category`）和島上的建築點（`spot`），建築點定義在 `web/src/lib/scene.ts`。島上沒有空的建築點時，要新增一棟建築（可參考 commit 1e1ed69 的溫網室）。`scenarios` 是虛構情境，寫成一般市民的口吻，不冒用真實人物。
- **政策關聯**（`web/src/data/relations.ts`）：只有貼文明確說兩項政見有關才能用 `source`；本站推論的關聯用 `scenario` 或 `editorial`。
- **過去的貢獻**：每句引文用 `by` 標明出處類型（`official` 官方紀錄、`media` 媒體報導、`candidate` 候選人自述、`campaign` 競選方說法）。候選人在貼文裡講自己的事蹟算「候選人自述」，不是官方紀錄。
- **格式**：不要對既有檔案跑 prettier，原始碼一行大約 160 字寬。

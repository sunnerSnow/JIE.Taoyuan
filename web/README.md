# 杰伴桃園 JIE.Taoyuan（網站程式）

這個資料夾是網站本體（Next.js 16）。網站介紹與畫面見 repo 根目錄的 [README.md](../README.md)，每天的更新流程與驗證方式見 [MAINTENANCE.md](../MAINTENANCE.md)。

```bash
npm ci
npm run dev            # 開發模式：http://localhost:3000
npx eslint             # 程式風格檢查
npx next build         # 建置（產生所有頁面與分享圖）
npx tsc --noEmit       # 型別檢查（放在 build 之後）
npx next start -p 3351 # 用建置結果在本機檢查
```

內容資料都在 `src/data/`，分享圖的排版在 `src/lib/`。

杰個願望（`/wish`）需要資料庫與 Turnstile 的環境變數，見維護手冊第 5 節。本機測試在指令前加 `WISH_DEV_DB=pglite ADMIN_PASSWORD=<12 字以上>`，改用記憶體裡的資料庫與 Cloudflare 的測試金鑰。

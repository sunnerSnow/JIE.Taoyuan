# 杰伴桃園 JIE.Taoyuan 維護手冊

給接手維護網站的人看：網站怎麼運作、每天怎麼更新、資料要照什麼規則整理、改完怎麼驗證和上線。
規則的細節寫在 `.claude/skills/` 的兩份 SKILL.md（給 Claude Code 照著做），這份手冊是給人看的總覽，兩邊有出入時以 SKILL.md 為準。

---

## 1. 網站概要

| 項目 | 內容 |
|---|---|
| 網站 | 2026 桃園市長候選人黃世杰的政見探索網站（**支持者自發整理，非官方**） |
| 正式網址 | https://jie-taoyuan.vercel.app |
| 原始碼 | GitHub `sunnerSnow/JIE.Taoyuan`（公開） |
| 技術 | Next.js 16（`web/` 資料夾），靜態產生頁面與分享圖 |
| 部署 | Vercel：推到 `main` 後自動部署，約 1～2 分鐘上線 |
| 立場標示 | 全站都要有「非官方・支持者依公開資料整理」；不放聯絡信箱、聯絡表單 |

### 主要頁面

| 網址 | 內容 | 資料檔（`web/src/data/`） |
|---|---|---|
| `/` | 首頁：政策島、3 分鐘探索介紹、最新更新 | `policies.ts`、`categories.ts`、`lab.ts`、`learn.ts`、`record.ts`、`changelog.ts` |
| `/explore` | 探索政策島（互動地圖） | `policies.ts`、`relations.ts` |
| `/policies` | 政見總覽 | `policies.ts` |
| `/policies/[slug]` | 單一政見頁 | `policies.ts` |
| `/islands/[島]` | 五座島（交通、育兒家庭、健康照顧、宜居環境、未來發展） | `categories.ts` |
| `/lab` | 3 分鐘探索、桃園卡 | `lab.ts` |
| `/easy` | 大字版（長輩友善）與大字版圖卡 | `easy.ts` |
| `/record` | 過去的貢獻 | `record.ts` |
| `/progress` | 政見追蹤 | `policies.ts`、`record.ts` |
| `/trail` | 杰伴出發：行程預告、車掃路線圖、桃園 13 區行程地圖 | `schedule.ts`、`route-maps.ts`、`trail.ts` |
| `/wish`、`/wish/[代碼]` | 杰個願望：留言專區與單則留言（見第 5 節） | 資料庫（Neon Postgres） |
| `/admin/wishes` | 杰個願望後台（要登入，不讓搜尋引擎收錄） | 資料庫 |
| `/updates` | 更新紀錄 | `changelog.ts` |
| `/about`、`/faq`、`/privacy` | 關於本站、常見問題、隱私說明 | 文字寫在頁面本身 |

### 分享圖（圖片網址）

| 網址 | 內容 |
|---|---|
| `/trail/schedule/2026-11-10` | 某一天的行程預告圖卡 |
| `/trail/schedule/2026-11-10/route/0900` | 某一場車隊掃街的路線圖卡（時間去掉冒號） |
| `/trail/schedule/2026-11-10/route/0900/list` | 同一場的路線清單卡（號碼和路線圖卡一致） |
| `/easy/card/[類別]/[政見 id]` | 大字版圖卡（一張一項政見） |
| `/lab/card/[組合]/story` | 桃園卡直式分享圖 |

---

## 2. 資料夾與自動化

```
web/                      Next.js 網站
  src/data/               所有內容資料（改內容幾乎都在這裡）
  src/lib/                分享圖排版、地圖繪製、SEO 等
  src/lib/wish/           杰個願望：資料庫、關鍵字過濾、防濫用、後台登入
  public/                 插畫、圖示
tools/
  official-watch/         偵測候選人官方 Threads、YouTube 新貼文（GitHub Actions 用）
  route-map/build.py      產生車隊掃街路線圖（web/src/data/route-maps.ts）
  taoyuan-map/build.py    產生桃園 13 區地圖（web/src/data/taoyuan-map.ts，平常不用動）
  indexnow/submit.mjs     部署後通知搜尋引擎
  wish-filter/check.ts    杰個願望關鍵字過濾的範例檢查
  wish-stickers/build.py  產生杰個願望的小企鵝貼圖（web/public/wish/stickers/）
.claude/skills/
  sync-official/SKILL.md  整理官方新貼文的規則
  line-schedule/SKILL.md  整理行程預告與車掃路線圖的規則
.github/workflows/
  official-watch.yml      每 3 小時偵測官方新貼文（UTC 每 3 小時的第 17 分）
  indexnow.yml            部署成功後、每天台灣 09:23 通知搜尋引擎
```

---

## 3. 每天的更新流程

最常做的是三件事：整理官方新貼文、加行程預告、做車掃路線圖。用 Claude Code 維護時，在專案裡輸入 `/sync-official`（整理官方新貼文，見 3.1），收到行程公告時輸入 `/line-schedule` 並貼上公告（見 3.2、3.3）；也可以直接用一般說法請它「更新」，它會依這兩份 SKILL.md 的步驟做。

### 3.1 官方新貼文（Threads、YouTube）

1. GitHub Actions 每 3 小時偵測一次，把網站還沒收錄的貼文寫進標籤 `official-inbox`、標題「官方新貼文待整理」的 Issue。
2. 讀收件匣並讀每則貼文全文（在 `tools/official-watch/`）：
   ```bash
   npm ci                        # 第一次使用
   npx playwright install chromium
   npm run inbox                 # 列出待整理的 Issue 與貼文
   npm run read -- <貼文網址>     # 讀完整內文（不能只看 Issue 裡的摘要）
   npm run dry                   # 不開 Issue，直接看上次偵測後的新貼文
   ```
   貼文附圖（政見圖卡、路線圖卡）常有內文沒寫的細節，要打開原圖讀。
3. 逐則分類：

   | 貼文內容 | 放到哪裡 |
   |---|---|
   | 新政見 | `policies.ts`＋`easy.ts`（大字版重點）＋`changelog.ts` |
   | 既有政見的新內容、更直接的官方來源 | 更新該政見＋`changelog.ts` |
   | 參選前的事蹟 | `record.ts`＋`changelog.ts` |
   | 已經發生的行程（走訪、活動、上節目、車掃） | `trail.ts` |
   | 寫明日期、時間、地點的行程預告 | `schedule.ts`（見 3.2） |
   | 拉票、站台推薦、問候、號次宣傳、周邊商品 | 不收錄 |

4. Issue 裡如果有「**Threads 可能有漏抓**」的警告：沒登入只看得到最近幾篇，要請人到 https://www.threads.com/@schuanglawyer 往下捲，確認那段時間有沒有漏掉的貼文。
5. 處理完的 commit 訊息最後加 `Closes #編號`，推上去後 Issue 會自動關閉。

### 3.2 行程預告（`/trail` 最上面）

資料在 `web/src/data/schedule.ts`，一天一筆、新的在前；頁面只顯示今天以後的日子，每天自動產生一張分享圖。

- **LINE 官方帳號（@589cjotf）的行程公告**：是聊天推播，網站外抓不到。收到後把文字或截圖貼給 Claude（或照格式手動加）。
- **Threads 的行程預告**：有寫日期、時間、地點的才收，例如車隊掃街的時段與路線。
- 每一場（`ScheduleItem`）的欄位：`time`（24 小時制）、`end`（結束時間，有寫才填）、`title`（活動）、`place`／`address`（地點）、`finish`（終點，和起點不同時才填）、`route`（車掃路線）、`url`（線上節目的觀看網址）。
- 每一天（`ScheduleDay`）另有 `sources`：列出用到的公告來源（LINE 公告沒有網址，Threads 要附網址）。
- 時間、活動、地點照公告原文。公告沒寫時間時不要自己猜：先請負責人提供；真的要用別的貼文推得的時間（例如「出發囉」貼文的發文時間），要在資料旁註明時間怎麼來的，並告訴負責人。
- 行程結束後，等有官方貼文或報導再收進 `trail.ts`。**LINE 公告不能當 `trail.ts` 的來源**，Threads 的預告貼文可以，和當天貼文合成一筆。

### 3.3 車隊掃街路線圖

`schedule.ts` 有 `route` 的場次會產生兩張圖卡：路線圖卡（扁平風格地圖、順序號碼、地標、起點終點）與路線清單卡（照同樣的號碼列出完整路線）。地圖和文字分開，免得一張圖太長。新增或修改路線後，在 repo 根目錄執行：

```bash
python tools/route-map/build.py --cache ~/.cache/jie-route-map
```

- 工具從 OpenStreetMap（Overpass API）下載起點、終點附近的路網，依公告的路名順序沿道路畫出路線，寫進 `web/src/data/route-maps.ts`。`--cache` 會把下載的路網存起來，同一區再跑不用重抓；快取放在 repo 外面，免得被誤加進 commit。
- 執行時會印出每一段的長度和「※」警告，**每條都要看**：
  - `OSM 找不到「某路」`：多半是沒有名字的小巷，路線圖會略過那段。
  - `A 和 B 沒有相交，沿一般道路接 N 公尺`：公告的兩條路實際沒有交會，中間用最短的路接。N 很大（超過 1 公里）時，通常是路名對不上，要查。
  - `某路在 OSM 斷成幾段`：同一條路被別的路名（例如便橋）隔開。
- 路名對不上時，在 `build.py` 補對照：
  - `ALIASES`：公告寫法和 OSM 不同（例：「民族路橋」→「民族陸橋」）。**推測的對照要在註解寫明是推測**，並告訴使用者。
  - `EXTENSIONS`：同一條路在 OSM 分成不同名字（例：民光東路接民光路、民光橋）。
  - `PLACES`：新的起點、終點座標（用 OSM 的地址點或建物）。
  - `STATIONS`：查得到官方地址的打氣站（例：議員服務處，以市議會議員介紹頁為準），會在圖上標星號。
  - `LANDMARKS`：看圖認路用的地標（車站、區公所、公園等）。
- 候選人常會貼官方的路線規劃圖，拿來和產生的圖對照，整體走向要一致。
- 圖上標示「路線示意，實際以現場為準」和「© OpenStreetMap 貢獻者」，不要拿掉。

### 3.4 新增政見時要一起改的地方

1. `policies.ts`：選島（`category`）和島上的建築點（`spot`）；島上沒有空的建築點時，要在 `web/src/lib/scene.ts` 新增一棟建築。
2. `easy.ts`：大字版 2～4 個短重點（只刪不補，「研議」「逐步」這類限定詞要留）。漏了 build 會失敗。
3. `changelog.ts`：最前面加一筆更新紀錄。
4. 情境（`scenarios`）是虛構的市民口吻，不冒用真實人物。

---

## 4. 資料整理規則（重點）

- **來源**：先找候選人官方帳號（Threads、YouTube、Facebook），找不到再用主流媒體報導。網友貼文不當出處。
- **用語照原文**：主張、做法、行程摘要都用原文的字句，不補原文沒有的數字、時程、承諾或地點。原文沒說清楚的寫進政見的 `notes`，不要寫進本文。
- **推測要說清楚**：例如路名對照、沒寫時間的行程，資料裡要註明，回報時也要講。
- **行程紀錄**（`trail.ts`）：`date` 是行程發生的台灣日期；`district` 只在地點明確屬於某一區時填；貼文明確提到某項政見才放 `policies`。
- **日期**：政見的 `publishedAt` 是主要來源的日期；`changelog` 的日期是網站更新的日期，不要混用。
- **個資**：不放維護者或使用者的 email、電話；只收公開的競選活動資訊。

---

## 5. 杰個願望（留言專區）

`/wish` 讓訪客留下加油、心願、想說的話和城市提案，`/admin/wishes` 是後台。這是全站唯一用到資料庫的功能（Neon Postgres），程式在 `web/src/lib/wish/`。

### 怎麼運作

- **不做人工審核**：送出時跑關鍵字過濾（`web/src/lib/wish/filter.ts`），通過就直接貼上願望牆；沒通過的存成「自動擋下」，不公開，後台看得到原因，誤擋的可以恢復。
- **擋下的內容**：髒話辱罵、攻擊與負評（也包含提到其他候選人）、仇恨歧視用語、網址與廣告、個人資料（電話、身分證字號、email、LINE ID）、冒用候選人／官方／團隊名義的顯示名稱、洗版。
- **防灌水**：Cloudflare Turnstile 人機驗證；同一來源 10 分鐘最多 3 則、一天最多 10 則；24 小時內一模一樣的內容不收；「認同」同一個瀏覽器一則只算一次。
- **檢舉**：被 3 個不同來源檢舉會自動下架，等後台確認。有心人換 3 個網路也能下架正常留言，所以後台要看檢舉原因判斷；恢復公開後只算之後的新檢舉。「這是我寫的，想刪除」無法確認真的是作者，請看內容再決定。
- **回覆**：一律以「杰伴桃園志工團隊」名義顯示。不能用候選人本人的名義，也不能承諾候選人或競選團隊沒說過的事。
- 「只給團隊參考」的留言不會出現在願望牆，只有後台看得到。
- **小企鵝貼圖**：留言時可以選一張貼在便利貼右下角。圖檔在 `web/public/wish/stickers/`，由 `python tools/wish-stickers/build.py` 產生（造型參考分享卡與吉普車插畫上的小企鵝）；要加新貼圖，在 build.py 加一張、再到 `web/src/lib/wish/options.ts` 的 `STICKERS` 加名稱。
- **願望牆**：便利貼依留言代碼固定歪斜、錯開，越新的疊在越上面（`web/src/components/wish/wish-art.tsx` 的 `pileLayout`）。

### 後台（`/admin/wishes`）

- 用 `ADMIN_PASSWORD` 登入，12 小時後要重新登入。
- 公開中的留言可以「下架」；自動擋下或已下架的可以「恢復」；「刪除」是永久刪除（連同認同、檢舉、回覆）。
- 「回覆與紀錄」可以新增、撤下回覆，看檢舉原因和處理紀錄。回應狀態（已收到、團隊已回覆、持續追蹤、有新進展）照實際處理情形設定，不要為了好看全部設成有進度。
- 上方統計都是資料庫裡的真實數字。

### 調整過濾規則

- 在 `filter.ts` 加詞。單字很容易誤擋正常的句子（例如「垃圾分類」「能幹」「狗大便」），要寫成具體的罵人句型。
- 改完執行 `node --experimental-strip-types tools/wish-filter/check.ts`，該擋的和不該擋的範例都要通過。遇到誤擋或漏擋，把那句加進這支檔案。

### 第一次設定（Vercel）

1. **資料庫**：Vercel 專案 → Storage → 建立 Neon Postgres 並連到這個專案（會自動加入 `DATABASE_URL`）。資料表在第一次使用時自動建立。
2. **人機驗證**：Cloudflare 後台 → Turnstile → 新增 widget，網域填 `jie-taoyuan.vercel.app`（之後有自訂網域也要加），取得 site key 與 secret key。
3. **環境變數**：Vercel 專案 → Settings → Environment Variables，加到 Production：

   | 變數 | 內容 |
   |---|---|
   | `DATABASE_URL` | Neon 整合自動加入 |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile 的 site key |
   | `TURNSTILE_SECRET_KEY` | Turnstile 的 secret key |
   | `WISH_SECRET` | 32 字以上的隨機字串，例如 `openssl rand -base64 48` 的結果 |
   | `ADMIN_PASSWORD` | 後台密碼，12 字以上 |

4. **重新部署**：環境變數在建置時讀入，加完要重新部署。沒設好時 `/wish` 會顯示「準備中」，表單不能送出。

- 密鑰只放在 Vercel，不要寫進程式、貼到 Issue 或對話裡。
- 換 `ADMIN_PASSWORD` 會讓所有後台登入失效；換 `WISH_SECRET` 會讓後台登入與舊的 IP 雜湊失效（留言不受影響）。

### 本機測試

```bash
WISH_DEV_DB=pglite ADMIN_PASSWORD=local-admin-pass-123 npx next build
WISH_DEV_DB=pglite ADMIN_PASSWORD=local-admin-pass-123 npx next start -p 3351
```

- `WISH_DEV_DB=pglite` 改用記憶體裡的 Postgres（PGlite），伺服器關掉資料就清空；Turnstile 改用 Cloudflare 的測試金鑰（一律通過）。這個設定在 Vercel 上無效。
- 測試留言要寫明「測試資料」，不要寫得像真實市民的留言。

---

## 6. 本機驗證

在 `web/` 執行：

```bash
npm ci                 # 第一次使用
npx eslint             # 程式風格檢查
npx next build         # 建置（會產生所有頁面與分享圖）
npx tsc --noEmit       # 型別檢查（放在 build 之後，build 會產生路由型別）
npx next start -p 3351 # 啟動，打開 http://localhost:3351 檢查
```

- 改了政見：看政見頁、所屬島嶼頁、`/explore`、大字版圖卡。
- 改了行程：看 `/trail` 的預告區塊與行程紀錄，打開 `/trail/schedule/<日期>` 和路線圖卡，確認字沒有壓到頁尾、標籤沒有疊在一起。
- 檢查完記得關掉本機伺服器。
- 不要對既有檔案跑 prettier（專案原始碼一行約 160 字寬，預設設定會把整份檔案重排）。

---

## 7. 上線流程

1. commit 訊息用**繁體中文**，先列給負責人確認，同意後才 commit。
2. 用 Claude Code 維護時，commit／push 前要過審查關卡 `/review-gate`（這是維護者電腦上的 Claude Code 全域設定，不在 repo 裡；接手的人要另外設定，或照下面的順序人工把關）：
   1. `git add` 明確的檔案（不要 `git add -A`）。
   2. 安全自查（`/security-review`）。
   3. Sonnet 獨立審查；FAIL 就修正後重跑整個關卡。
   4. 通過後登記放行，才能 commit、push（沒登記時 hook 會擋下）。
3. 推到 `main` 後 Vercel 自動部署，約 1～2 分鐘；上線後打開正式網址確認，處理的 Issue 會因 `Closes #編號` 自動關閉。

---

## 8. 已知限制

| 限制 | 影響與因應 |
|---|---|
| Threads 沒登入只看得到最近幾篇 | 偵測可能漏抓，Issue 會出現警告，要人工往下捲確認 |
| 沒有 YouTube API key | 讀不到 YouTube 短影音的說明欄與發布時間，這類貼文先標「待補」，需要時請人貼上說明欄 |
| LINE 推播網站外讀不到 | 行程公告只能由人貼上 |
| GitHub 排程常延遲、偶爾跳過 | 偵測不一定準時，可以手動 `npm run dry` 補看 |
| OpenStreetMap 路名不完整 | 車掃路線圖是示意，小巷、對不上的路名會略過或改走附近道路 |
| Overpass API 偶爾忙碌 | `build.py` 會自動退避重試；一直失敗就晚點再跑 |
| build 偶爾因 Google Fonts 逾時失敗 | 分享圖的字型從 Google Fonts 下載，網路不穩時重跑 build 即可 |
| 杰個願望的關鍵字過濾 | 換句話說的負評擋不到，少數正常句子也可能被誤擋；靠檢舉、後台下架與恢復處理 |
| Neon 免費方案有用量上限 | 流量大時資料庫可能變慢或暫停，到 Neon 後台看用量，需要時升級方案 |

---

## 9. 相關文件

- `.claude/skills/sync-official/SKILL.md`：整理官方新貼文的完整步驟與規則
- `.claude/skills/line-schedule/SKILL.md`：行程預告與車掃路線圖的完整步驟與規則
- `JIE.Taoyuan_MVP_Spec.md`：網站最初的規格書
- `tools/route-map/build.py`、`tools/taoyuan-map/build.py`、`tools/indexnow/submit.mjs`：檔案開頭有用法說明

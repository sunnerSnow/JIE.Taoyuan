// 杰伴情報站的更新紀錄：本站實際做過的內容更新，新的在前。
// 日期是本站更新的日期，不是政見的發布日期（政見的發布日期在各政見頁）。
// 只記錄真的發生過的變更；改了政見、來源或過去的貢獻，就在最前面加一筆。

export type ChangeType = "added" | "corrected" | "source" | "reverified";

export type ChangeEntry = {
  /** 網址錨點（/updates#id） */
  id: string;
  date: string;
  type: ChangeType;
  title: string;
  summary: string;
  /** 相關政見的 slug，頁面會連到政見頁；slug 打錯時 build 會失敗 */
  policies?: string[];
  /** 其他相關頁面 */
  links?: { href: string; label: string }[];
};

export const changeTypeInfo: Record<ChangeType, { label: string; desc: string }> = {
  added: { label: "新增", desc: "收錄新的政見、事蹟或關聯。" },
  corrected: { label: "修正", desc: "更正或移除不正確、不恰當的內容。" },
  source: { label: "來源更新", desc: "換上更直接的來源，或補上佐證來源。" },
  reverified: { label: "重新確認", desc: "重新核對原始來源，內容沒有變動。" },
};

export const changelog: ChangeEntry[] = [
  {
    id: "2026-10-30-trail",
    date: "2026-10-30",
    type: "added",
    title: "新增「杰伴出發」行程地圖與紀錄",
    summary:
      "整理候選人已經發生的行程：走訪、活動與上節目，畫在桃園 13 區地圖上（去過的區放企鵝腳丫），並依日期排列。第一批收錄 2026 年 5 月 30 日到 10 月 30 日共 56 筆，13 區都有記錄；10 月 28 日以後依候選人官方貼文，更早的依主流媒體報導，每一筆都附來源。",
    links: [{ href: "/trail", label: "杰伴出發" }],
  },
  {
    id: "2026-10-29-matsu",
    date: "2026-10-29",
    type: "added",
    title: "新增政見「馬祖交流四大主張」",
    summary:
      "收錄候選人 10 月 28 日提出的「心桃園新故鄉」4 大主張：提升馬祖交流小組層級、成立桃園市駐馬祖聯絡處、推動閩東語言文化教育、舉辦桃園－馬祖雙城藝術季。具體做法依媒體報導整理，並附候選人 Threads 貼文。未來發展島多了一座藝術季小舞台。",
    policies: ["matsu-exchange"],
  },
  {
    id: "2026-10-29-traffic-threads",
    date: "2026-10-29",
    type: "source",
    title: "科技執法合理化補上候選人 Threads 貼文",
    summary:
      "候選人 10 月 28 日到龍岡地下道會勘後發文，重申「設置標準公開透明」「宣導勸導完整到位」兩組做法。貼文沒有列出具體細節，主要來源維持媒體報導，貼文列為官方佐證。",
    policies: ["fair-traffic-enforcement"],
  },
  {
    id: "2026-10-28-shorts-check",
    date: "2026-10-28",
    type: "reverified",
    title: "核對 4 項政見的候選人短影音",
    summary:
      "逐一核對候選人 YouTube 短影音的說明欄。說明欄只有簡短介紹，沒有列出政見的具體條目，所以這 4 項的主要來源維持媒體報導，短影音繼續列為官方佐證。",
    policies: ["ten-minute-playgrounds", "industry-four", "youth-five", "sports-city"],
  },
  {
    id: "2026-10-27-record-more",
    date: "2026-10-27",
    type: "added",
    title: "過去的貢獻新增 5 項",
    summary:
      "新增 18 歲成年施行條文、主持數位發展部組織法初審、主持犯保法修法審查、領銜提出的司法法案、說明依托咪酯升級二級毒品，每一項都附立法院議案資料或媒體出處。",
    links: [{ href: "/record", label: "過去的貢獻" }],
  },
  {
    id: "2026-10-27-remove-status-faq",
    date: "2026-10-27",
    type: "corrected",
    title: "移除各政見頁共用的執行狀態問答",
    summary: "刪除 23 項政見頁都一樣的「這些主張已經開始執行了嗎？」問答。政見目前的階段改在「政見追蹤」頁統一說明。",
    links: [{ href: "/progress", label: "政見追蹤" }],
  },
  {
    id: "2026-10-27-record",
    date: "2026-10-27",
    type: "added",
    title: "新增「過去的貢獻」6 項事蹟",
    summary: "整理參選前在市府、立法院與法務部三個時期的 6 項事蹟。每一句引文都標明是官方紀錄、媒體報導、候選人自述或競選方說法，並附原始連結與日期。",
    links: [{ href: "/record", label: "過去的貢獻" }],
  },
  {
    id: "2026-10-27-farmer-heat-relief",
    date: "2026-10-27",
    type: "added",
    title: "新增政見「農民降溫設備補助」",
    summary: "收錄第 23 項政見，以候選人 YouTube 短影音為主要來源，附聯合報報導。",
    policies: ["farmer-heat-relief"],
  },
  {
    id: "2026-10-27-relations",
    date: "2026-10-27",
    type: "added",
    title: "新增 15 條政策關聯",
    summary: "標示政見之間的關聯，分成「來源明確指出」「生活情境」「本站整理」三種，本站整理的關聯不代表候選人的說法。",
    links: [{ href: "/explore", label: "在政策島上看關聯" }],
  },
  {
    id: "2026-10-27-youtube-sources",
    date: "2026-10-27",
    type: "source",
    title: "加入候選人 YouTube 官方短影音作為來源",
    summary:
      "「敬老愛心卡升級」改以官方短影音為主要來源（說明欄完整列出三項主張），媒體報導改列佐證；另外 5 項政見補上相關的官方短影音作為佐證。",
    policies: ["senior-card-plus", "sports-city", "youth-five", "industry-four", "ten-minute-playgrounds", "bus-network-reform"],
  },
  {
    id: "2026-10-27-first-22",
    date: "2026-10-27",
    type: "added",
    title: "首批收錄 22 項政見",
    summary: "依候選人公開貼文與媒體報導整理，分布在五座政策島。",
    links: [{ href: "/policies", label: "政策總覽" }],
  },
];

/** 最近一次更新的日期 */
export const lastChangeDate = changelog[0]?.date;

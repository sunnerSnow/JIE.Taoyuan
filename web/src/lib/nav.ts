export const mainNav = [
  { href: "/", label: "首頁", en: "Home" },
  { href: "/explore", label: "探索政策島", en: "Explore" },
  { href: "/policies", label: "政策總覽", en: "Policies" },
  { href: "/progress", label: "政見追蹤", en: "Tracker" },
  { href: "/record", label: "過去貢獻", en: "Record" },
  { href: "/trail", label: "杰伴出發", en: "JIE GO!" },
  { href: "/faq", label: "常見問題", en: "FAQ" },
] as const;

/** 「3 分鐘，拼出你心中的桃園」：首頁與頁首的主按鈕、手機選單最上方、頁尾 */
export const labNav = { href: "/lab", label: "3 分鐘探索", en: "Lab", title: "3 分鐘，拼出你心中的桃園" } as const;

/** 大字版：給長輩看的精簡版，頁首、手機選單、首頁首屏與頁尾都有入口 */
export const easyNav = { href: "/easy", label: "大字版", title: "字大好讀，長輩友善" } as const;

export const footerNav = [
  { href: easyNav.href, label: easyNav.label },
  { href: "/about", label: "關於本站" },
  { href: "/about#sources", label: "資料來源與更新說明" },
  { href: "/updates", label: "更新紀錄" },
  { href: "/privacy", label: "隱私權政策" },
] as const;

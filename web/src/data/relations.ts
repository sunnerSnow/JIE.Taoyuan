// 政策關聯：每一條都要有依據，並清楚區分是公開資料本身寫的、虛構的生活情境，還是本站的編輯分析。
// 關聯是閱讀輔助，不代表官方合作關係或政策承諾；不得把推論寫成 source。

export type RelationType = "source" | "scenario" | "editorial";

export type Relation = {
  id: string;
  /** 兩筆政策的 slug（雙向，不分先後） */
  a: string;
  b: string;
  type: RelationType;
  /** 一句話說明兩者的關係 */
  label: string;
  /** 依據：引用原文，或兩邊各自的具體做法 */
  evidence: string;
  /** type 為 source 時必填：把兩者放在一起講的原始來源 */
  sourceTitle?: string;
  sourceUrl?: string;
  sourceDate?: string;
};

/** 三種關聯的呈現：線型＋圖示＋文字，不只靠顏色區分 */
export const relationTypeInfo: Record<RelationType, { label: string; short: string; desc: string; color: string; dash: string }> = {
  source: { label: "公開資料明確支持", short: "公開資料", desc: "原始來源本身就把兩者放在一起講。", color: "#007A74", dash: "" },
  scenario: { label: "生活情境（虛構）", short: "生活情境", desc: "同一位虛構市民的日常會同時用到，幫助想像，不代表官方規劃。", color: "#B5452D", dash: "7 5" },
  editorial: { label: "編輯分析", short: "編輯分析", desc: "本站分析兩者處理相近的議題，不代表官方規劃或合作。", color: "#5B5FA8", dash: "1.5 4.5" },
};

export const RELATION_DISCLAIMER = "關聯是本站依公開資料整理的閱讀輔助，不代表官方合作關係或政策承諾。";

const HUBS_POST = {
  sourceTitle: "黃世杰 Threads 貼文〈桃園人期待捷運，卻還得繼續等〉",
  sourceUrl: "https://www.threads.com/@schuanglawyer/post/DehBeovCXic",
  sourceDate: "2026-10-15",
};

export const relations: Relation[] = [
  // ── 公開資料明確支持 ──
  {
    id: "r-hubs-bus",
    a: "three-hubs-six-lines",
    b: "bus-network-reform",
    type: "source",
    label: "同一則交通貼文把公車主張與軌道推動放在一起談",
    evidence: "三心六線貼文原文：「從先前提出的公車服務與科技執法主張，到這次的『加速推動三心六線』，世杰要逐項回應桃園人的交通需求」；三心六線也主張「規劃公車、YouBike 與人行轉乘環境」。",
    ...HUBS_POST,
  },
  {
    id: "r-hubs-enforcement",
    a: "three-hubs-six-lines",
    b: "fair-traffic-enforcement",
    type: "source",
    label: "同一則交通貼文提到先前的科技執法主張",
    evidence: "三心六線貼文原文：「從先前提出的公車服務與科技執法主張，到這次的『加速推動三心六線』，世杰要逐項回應桃園人的交通需求」。",
    ...HUBS_POST,
  },
  {
    id: "r-health-childcare",
    a: "better-healthcare",
    b: "friendly-childcare",
    type: "source",
    label: "醫療政見裡有一項托育措施",
    evidence: "醫療政見圖卡的「推動醫護安居專案」列出「醫護子女享有幼兒園優先序位」，與育兒政見同樣處理孩子的托育與入園。",
    sourceTitle: "黃世杰 Threads 貼文〈讓好醫療留在桃園〉",
    sourceUrl: "https://www.threads.com/@schuanglawyer/post/DdQrQX7E0BO",
    sourceDate: "2026-09-14",
  },
  {
    id: "r-market-garbage",
    a: "traditional-markets",
    b: "garbage-fee-consensus",
    type: "source",
    label: "同一場市場掃街同時談到市場改善與隨袋徵收",
    evidence: "聯合報與壹蘋新聞網 9 月 17 日報導同一場市場掃街：候選人提出研擬設置市場服務員、寬列市場改善經費，也表示垃圾費隨袋徵收在未達成共識前暫緩推動、不會貿然執行。",
    sourceTitle: "聯合報〈改善桃園傳統市場環境 綠營黃世杰允研議市場服務員〉",
    sourceUrl: "https://udn.com/news/story/124652/9761759",
    sourceDate: "2026-09-17",
  },
  {
    id: "r-senior-nhi",
    a: "senior-card-plus",
    b: "nhi-premium-subsidy",
    type: "source",
    label: "同屬首波六大政見，都照顧 65 歲以上長者",
    evidence: "中央社 7 月 27 日報導的首波六大政見，同時包含敬老愛心卡加碼，以及補助 0 至 12 歲與 65 歲以上市民的健保費。",
    sourceTitle: "中央社〈黃世杰公布首波政見 六大面向盼更貼近人民需求〉",
    sourceUrl: "https://www.cna.com.tw/news/aloc/202607270113.aspx",
    sourceDate: "2026-07-27",
  },

  // ── 生活情境（虛構） ──
  {
    id: "r-childcare-playground",
    a: "friendly-childcare",
    b: "ten-minute-playgrounds",
    type: "scenario",
    label: "雙薪家長的一天：白天送托，下班去附近的遊戲場",
    evidence: "虛構情境：白天把孩子送到住家附近的托育據點（育兒政見：優先補足資源不足地區，增加鄰近生活圈、可負擔的托育選擇），下班後帶孩子到步行十分鐘內的遊戲場（十分鐘遊戲圈：以「步行十分鐘可及」為目標盤點遊戲空間）。",
  },
  {
    id: "r-bus-streets",
    a: "bus-network-reform",
    b: "people-first-streets",
    type: "scenario",
    label: "搭公車上學的學生：車要等得到，下車後的路要安全",
    evidence: "虛構情境：高中生搭公車上學（公車政見：依需求調整班次、讓轉乘更順暢），下車後走到校門口（人本交通承諾：於各級學校四周 150 公尺劃設通學區）。",
  },
  {
    id: "r-senior-bus",
    a: "senior-card-plus",
    b: "bus-network-reform",
    type: "scenario",
    label: "長輩用敬老卡搭公車去看病",
    evidence: "虛構情境：長輩用敬老愛心卡搭公車去看病（現行敬老卡可搭乘公車；政見主張點數提高到每月 1200 點），希望公車準時、等得到（公車政見：整合公車定位與查詢系統、依需求調整班次）。",
  },

  // ── 編輯分析 ──
  {
    id: "r-bullying-safety",
    a: "anti-bullying",
    b: "public-safety-four",
    type: "editorial",
    label: "都在處理校園安全",
    evidence: "治安四大主張的「校園守護：整合警政、校安與社政，避免孩子被幫派吸收」，與校園反霸凌四大作為同樣處理校園安全；兩者是分開提出的政見。",
  },
  {
    id: "r-education-streets",
    a: "education-five",
    b: "people-first-streets",
    type: "editorial",
    label: "都在處理學童通學安全",
    evidence: "教育五大主張的「全面盤點、一校一改善，打造安全通學路網」，與人本交通承諾的「於各級學校四周 150 公尺劃設通學區」，都在處理孩子上下學的安全。",
  },
  {
    id: "r-indigenous-health",
    a: "indigenous-four",
    b: "better-healthcare",
    type: "editorial",
    label: "都在縮短城鄉醫療落差",
    evidence: "原民四大政見的「推動原鄉長照巡迴醫療隊，把醫療照護送進部落」，與醫療政見「縮短城鄉的醫療資源落差」的方向一致。",
  },
  {
    id: "r-youth-industry",
    a: "youth-five",
    b: "industry-four",
    type: "editorial",
    label: "青年就業與在地產業、AI 發展相關",
    evidence: "青年五大政策的「實習接軌在地產業」「AI 算力共享平台」，與產業四大方向的「改善產業園區環境並導入 AI 智慧製程」都和在地產業、AI 發展有關。",
  },
  {
    id: "r-arts-hakka",
    a: "arts-culture-wave",
    b: "hakka-language",
    type: "editorial",
    label: "都在推動文化發展",
    evidence: "客家四大政見的「厚植客家藝文能量」，與藝文四大主張同屬文化發展；兩者是分開提出的政見。",
  },
  {
    id: "r-enforcement-streets",
    a: "fair-traffic-enforcement",
    b: "people-first-streets",
    type: "editorial",
    label: "都從道路設計處理交通安全",
    evidence: "科技執法合理化主張「由交通、警政等跨局處共同檢視道路設計、車流、事故及違規數據」，人本交通承諾「優先改善高人流、學校、醫療院所與大眾運輸站點周邊」的人行空間，兩者都從道路設計處理交通安全。",
  },
  {
    id: "r-playground-sports",
    a: "ten-minute-playgrounds",
    b: "sports-city",
    type: "editorial",
    label: "都在增加市民日常的活動空間",
    evidence: "十分鐘遊戲圈的「青少年遊憩空間」與運動城市的「推動全民運動」，都在增加市民日常活動、運動的空間。",
  },
];

/** 某一筆政策的所有關聯（附上另一端的 slug） */
export function relationsOf(slug: string) {
  return relations.filter((r) => r.a === slug || r.b === slug).map((r) => ({ relation: r, other: r.a === slug ? r.b : r.a }));
}

import type { EditorNote, ExtraSource } from "./types";

// 「過去的貢獻」：參選前在市府、立法院、法務部做過的事。
// 政績多半出自候選人或競選方，所以每一句引文都標明是誰說的（官方紀錄、媒體報導、候選人自述、競選方說法），
// 引文照原文；本站整理的段落只寫來源支持的內容，查不到第一手紀錄的部分寫在「核對」註記。

/** 說法的出處：評價性的說法要讓讀者知道是誰說的 */
export type ClaimBy = "official" | "media" | "candidate" | "campaign";

export const claimByInfo: Record<ClaimBy, { label: string; desc: string; className: string }> = {
  official: {
    label: "官方紀錄",
    desc: "立法院、行政院、司法院、衛福部等政府機關公開的資料。",
    className: "bg-teal-deep text-paper",
  },
  media: {
    label: "媒體報導",
    desc: "新聞媒體的報導，或報導中引述的話。",
    className: "bg-mint text-ink",
  },
  candidate: {
    label: "候選人自述",
    desc: "黃世杰本人在貼文或受訪時的說法。",
    className: "bg-sun text-ink",
  },
  campaign: {
    label: "競選方說法",
    desc: "政黨新聞稿或造勢場合的致詞，屬於支持方的評價，本站未另行查證。",
    className: "bg-peach text-ink",
  },
};

export const claimByOrder: ClaimBy[] = ["official", "media", "candidate", "campaign"];

export type Claim = {
  by: ClaimBy;
  quote: string;
  speaker?: string;
  source: ExtraSource;
};

export type RoleSlug = "city" | "legislator" | "moj";

export const roles: Record<RoleSlug, { label: string; period: string }> = {
  city: { label: "桃園市政府參議、顧問", period: "2014 年起" },
  legislator: { label: "立法委員", period: "2020–2024" },
  moj: { label: "法務部政務次長", period: "2024–2026" },
};

export type RecordItem = {
  id: string;
  role: RoleSlug;
  /** 這件事發生的時間（顯示用） */
  when: string;
  title: string;
  /** 本站整理：只寫來源支持的內容 */
  summary: string;
  /** 本站查到的背景事實，每一條都附出處 */
  facts?: { text: string; source: ExtraSource }[];
  claims: Claim[];
  notes?: EditorNote[];
  /** 放在首頁「說了什麼、做過什麼」的重點事蹟 */
  featured?: boolean;
};

// ── 常用出處 ──
const ly: ExtraSource = {
  type: "government",
  outlet: "立法院",
  title: "第 10 屆立法委員黃世杰委員資料",
  url: "https://www.ly.gov.tw/Pages/List.aspx?nodeid=38607",
};
const dpp2023: ExtraSource = {
  type: "candidate",
  outlet: "民主進步黨新聞稿",
  title: "賴清德以四點大讚黃世杰　懇請鄉親堅定支持黃世杰高票連任",
  url: "https://www.dpp.org.tw/media/contents/10492",
  date: "2023-11-19",
};
const udnNomination: ExtraSource = {
  type: "media",
  outlet: "聯合報",
  title: "獲民進黨提名選桃園市長 黃世杰臉書千字文吐心聲",
  url: "https://udn.com/news/story/124652/9443747",
  date: "2026-04-15",
};

/** 立法院議事暨公報資訊網的議案頁 */
const bill = (id: string, title: string, date?: string): ExtraSource => ({
  type: "government",
  outlet: "立法院議案資料",
  title,
  url: `https://ppg.ly.gov.tw/ppg/bills/${id}/details`,
  date,
});

/** 議案系統的「三讀」是草案的處理狀態，併案審查時最後的條文可能不同 */
const BILL_NOTE: EditorNote = {
  kind: "check",
  text: "「審查完畢（三讀）」是立法院議案系統對這份草案的處理狀態。委員會常把多份草案併案審查，最後通過的條文可能和原提案文字不同。",
};

export const recordUpdatedAt = "2026-10-27";

/** 經歷一覽：只列有出處的職務 */
export const career: {
  when: string;
  title: string;
  detail?: string;
  source: ExtraSource;
}[] = [
  {
    when: "2001",
    title: "律師高考第一名、司法官特考及格",
    detail: "曾任國際通商法律事務所律師",
    source: ly,
  },
  {
    when: "2014",
    title: "桃園市政府參議、顧問",
    detail: "受時任市長鄭文燦延攬",
    source: {
      type: "media",
      outlet: "鏡週刊",
      title: "獨家／王義川婉拒　賴清德鎖定蔣萬安同學出戰桃園市長",
      url: "https://www.mirrormedia.mg/story/20260315inv005",
      date: "2026-03-15",
    },
  },
  {
    when: "2020–2024",
    title: "立法委員",
    detail: "桃園市第 2 選舉區",
    source: ly,
  },
  {
    when: "2024–2026",
    title: "法務部政務次長",
    detail: "2024 年 5 月上任，2026 年 4 月為參選市長辭職",
    source: {
      type: "media",
      outlet: "聯合報",
      title: "遭疑身為法務部政次上班時間跑選舉 黃世杰：有請假",
      url: "https://udn.com/news/story/6656/9387154",
      date: "2026-03-18",
    },
  },
];

export const records: RecordItem[] = [
  {
    id: "city-regulations",
    featured: true,
    role: "city",
    when: "2014 年起",
    title: "協助翻新縣府時期的自治法規",
    summary: "桃園改制直轄市後，黃世杰受時任市長鄭文燦延攬，在市府擔任參議與顧問，用法律專業協助整理縣府時期留下來的自治法規。",
    claims: [
      {
        by: "candidate",
        speaker: "聯合報轉述黃世杰臉書貼文",
        quote: "2014年他在桃園市政府擔任參議，用法律的專業，協助翻新了縣府時期的1500項自治法規，為桃園市政發展打下基礎",
        source: udnNomination,
      },
      {
        by: "campaign",
        speaker: "民進黨新聞稿轉述賴清德致詞",
        quote: "被延攬進入市府的黃世杰，除了協助處理法律相關事務外，在當時也提出要將市政資源挹注到新屋、大園、觀音、楊梅等地的建議。",
        source: dpp2023,
      },
    ],
    notes: [
      {
        kind: "check",
        text: "「1500 項」是候選人自述的數字，本站沒有逐項核對市府法規資料。",
      },
    ],
  },
  {
    id: "judiciary-committee",
    role: "legislator",
    when: "2020–2024",
    title: "三個會期擔任司法及法制委員會召集委員",
    summary: "2020 年當選桃園市第 2 選舉區立委。依立法院委員資料，他在第 10 屆第 3 到第 5 會期擔任司法及法制委員會召集委員，其他會期多在內政委員會。",
    facts: [
      {
        text: "第 10 屆第 3、4、5 會期：司法及法制委員會召集委員；第 1、2、7、8 會期：內政委員會。",
        source: ly,
      },
      {
        text: "公民監督國會聯盟評鑑第 10 屆第 2 會期，黃世杰列在內政委員會的優秀立委名單。",
        source: {
          type: "media",
          outlet: "鏡週刊",
          title: "公督盟最新評鑑公布　42人獲選優秀立委綠營最多、1人待觀察",
          url: "https://www.mirrormedia.mg/story/20210413edi022",
          date: "2021-04-13",
        },
      },
    ],
    claims: [
      {
        by: "campaign",
        speaker: "民進黨新聞稿轉述賴清德致詞",
        quote: "他同時擔任司法法制委員會召委，憑藉法律專長以及優秀的協調能力，在他任內排審、三讀通過的法案超過350案之多。",
        source: dpp2023,
      },
    ],
    notes: [
      {
        kind: "check",
        text: "「超過 350 案」出自 2023 年造勢場合的致詞，本站沒有找到逐案清單。",
      },
      {
        kind: "check",
        text: "同一篇新聞稿說他「多次獲得公督盟等公民團體評鑑為第一名委員」；本站目前只查到上面這一次「優秀立委」的報導。",
      },
    ],
  },
  {
    id: "adult-age-18",
    role: "legislator",
    when: "2020",
    title: "提出 18 歲成年的施行條文",
    summary:
      "2020 年 12 月，立法院三讀把民法的成年年齡從 20 歲降到 18 歲。黃世杰同年領銜提出《民法總則施行法》第 3 條之 1、《民法親屬編施行法》第 4 條之 2 的增訂草案，立法院議案資料顯示兩案都已「審查完畢（三讀）」。",
    facts: [
      {
        text: "2020 年 12 月 25 日，立法院三讀通過民法修正，成年年齡從 20 歲降到 18 歲，112 年 1 月 1 日施行。",
        source: {
          type: "media",
          outlet: "鏡週刊",
          title: "民法成年下修「滿18歲可自主結婚」　呂秋遠：敬佩，這麼勇敢",
          url: "https://www.mirrormedia.mg/story/20201226web004",
          date: "2020-12-26",
        },
      },
      {
        text: "《民法總則施行法》增訂第三條之一條文草案：提案人黃世杰（黃世杰等 18 人），狀態「審查完畢（三讀）」。",
        source: bill("1090918070201500", "「民法總則施行法增訂第三條之一條文草案」，請審議案", "2020-09-25"),
      },
      {
        text: "《民法親屬編施行法》增訂第四條之二條文草案：提案人黃世杰（黃世杰等 18 人），狀態「審查完畢（三讀）」。",
        source: bill("1090918070201600", "「民法親屬編施行法增訂第四條之二條文草案」，請審議案", "2020-09-25"),
      },
      {
        text: "《民法總則施行法》第 3 條之 1 規定：109 年 12 月 25 日修正的民法第 12、13 條自 112 年 1 月 1 日施行；當天已滿 18 歲、未滿 20 歲的人，自同日起成年。",
        source: {
          type: "government",
          outlet: "臺北市政府函",
          title: "府都企字第1123029034號函（說明引用民法總則施行法第3條之1）",
          url: "https://laws.gov.taipei/Law/Interpretation/Content/FE368792",
          date: "2023-05-11",
        },
      },
    ],
    claims: [],
    notes: [BILL_NOTE],
  },
  {
    id: "digital-ministry",
    role: "legislator",
    when: "2021 年 5 月",
    title: "主持數位發展部組織法的初審",
    summary: "2021 年 5 月，立法院聯席會議初審通過數位發展部組織法草案等案，會議主席是黃世杰；沒有共識的條文保留，交由黨團協商。",
    claims: [
      {
        by: "media",
        quote: "由於在場立委與官員討論後無法取得共識，因此該條文保留；聯席會議主席、民進黨立委黃世杰說，請行政單位好好面對這個問題，待日後協商時提出說明。",
        source: {
          type: "media",
          outlet: "中央社",
          title: "立院初審新設數位發展部 掌數位經濟輔導10事項",
          url: "https://www.cna.com.tw/news/aipl/202105050286.aspx",
          date: "2021-05-05",
        },
      },
    ],
  },
  {
    id: "crime-victims-act",
    role: "legislator",
    when: "2022–2023",
    title: "主持犯保法修法的委員會審查",
    summary:
      "2022 年 5 月，黃世杰以召集委員身分主持司法及法制委員會，完成《犯罪被害人保護法》修正草案的初審；2023 年 1 月三讀通過，更名為《犯罪被害人權益保障法》。",
    facts: [
      {
        text: "第 10 屆第 5 會期司法及法制委員會第 18 次全體委員會議（111 年 5 月 12 日），主席「黃召集委員世杰」，犯罪被害人保護法修正草案審查完竣，交由黨團協商。",
        source: {
          type: "government",
          outlet: "立法院",
          title: "第10屆第5會期司法及法制委員會會議概況表",
          url: "https://www.ly.gov.tw/Pages/Detail.aspx?nodeid=43616&pid=217514",
          date: "2022-08-25",
        },
      },
      {
        text: "立法院於 112 年 1 月 7 日三讀通過犯罪被害人保護法全案修正，更名為《犯罪被害人權益保障法》，112 年 2 月 8 日總統公布。",
        source: {
          type: "government",
          outlet: "犯罪被害人保護協會電子報",
          title: "馨希望電子報第 26 期〈立法院三讀通過「犯罪被害人權益保障法」〉（法務部彰化地檢署網站）",
          url: "https://www.chc.moj.gov.tw/media/314699/犯罪被害人保護協會_馨希望電子報_第26期_11201.pdf",
          date: "2023-01",
        },
      },
    ],
    claims: [
      {
        by: "media",
        speaker: "中央社引述黃世杰在委員會的發言",
        quote: "要保護被害人的隱私及尊嚴，但大家要思考，新聞自由跟報導創作自由的這條線在哪、怎樣做才能最符合公益。",
        source: {
          type: "media",
          outlet: "中央社",
          title: "立院初審犯保法 被害人保護命令等無共識待協商",
          url: "https://www.cna.com.tw/news/aipl/202205120412.aspx",
          date: "2022-05-12",
        },
      },
    ],
  },
  {
    id: "bills-passed",
    role: "legislator",
    when: "2020–2023",
    title: "領銜提出的司法法案",
    summary:
      "依立法院議案資料，黃世杰領銜提出的法官法、司法人員人事條例、公設辯護人條例、少年矯正學校設置及教育實施通則修正草案，狀態都是「審查完畢（三讀）」。他也是《糾纏行為防制法草案》的提案人之一。",
    facts: [
      {
        text: "《法官法》部分條文修正草案（黃世杰等 16 人）：審查完畢（三讀）。",
        source: bill("1110331070201400", "「法官法部分條文修正草案」，請審議案", "2022-04-08"),
      },
      {
        text: "《司法人員人事條例》部分條文修正草案（提案人黃世杰）：審查完畢（三讀）。",
        source: bill("1110331070201900", "「司法人員人事條例部分條文修正草案」，請審議案"),
      },
      {
        text: "《公設辯護人條例》第七條條文修正草案（黃世杰等 21 人）：審查完畢（三讀）。",
        source: bill("1111026070200300", "「公設辯護人條例第七條條文修正草案」，請審議案", "2022-11-04"),
      },
      {
        text: "《少年矯正學校設置及教育實施通則》第四十六條條文修正草案（黃世杰等 20 人）：審查完畢（三讀）。",
        source: bill("1111026070200100", "「少年矯正學校設置及教育實施通則第四十六條條文修正草案」，請審議案"),
      },
      {
        text: "《糾纏行為防制法草案》（提案人江永昌、蔡易餘、黃世杰、賴瑞隆）：審查完畢。",
        source: bill("1090303070200100", "「糾纏行為防制法草案」，請審議案", "2020-03-06"),
      },
    ],
    claims: [],
    notes: [
      BILL_NOTE,
      {
        kind: "clarify",
        text: "2021 年通過的《跟蹤騷擾防制法》由內政委員會審查，本站沒有找到資料顯示他參與那次審查；這裡只列他共同提出的《糾纏行為防制法草案》。",
      },
    ],
  },
  {
    id: "sexual-image-laws",
    featured: true,
    role: "legislator",
    when: "2022–2023",
    title: "推動「性影像四法聯防」修法",
    summary:
      "2023 年 1 月，立法院三讀通過刑法增訂「妨害性隱私及不實性影像罪」章，以及《兒童及少年性剝削防制條例》、《性侵害犯罪防治法》的修正，建立性影像移除下架機制。黃世杰說，他當時一邊跟朝野立委、行政機關協商推動修法，一邊迎接孩子出生。",
    facts: [
      {
        text: "2023 年 1 月 7 日，立法院三讀通過《刑法》防制性暴力的部分條文，增訂性影像定義。",
        source: {
          type: "media",
          outlet: "台灣英文新聞",
          title: "台灣三讀通過 未經同意散布「性影像」最高判5年、製作換臉謎片判7年",
          url: "https://www.taiwannews.com.tw/zh/news/4773593",
          date: "2023-01-07",
        },
      },
      {
        text: "衛福部：三讀通過《兒童及少年性剝削防制條例》、《性侵害犯罪防治法》修正，創設性影像移除下架機制。",
        source: {
          type: "government",
          outlet: "衛生福利部新聞稿",
          title: "立法院今日三讀通過「兒童及少年性剝削防制條例」、「性侵害犯罪防治法」修正草案",
          url: "https://mohw.gov.tw/cp-16-73177-1.html",
          date: "2023-01-10",
        },
      },
      {
        text: "刑法增訂第 28 章之 1「妨害性隱私及不實性影像罪章」，2023 年 2 月 8 日總統修正公布。",
        source: {
          type: "government",
          outlet: "司法院司法周刊",
          title: "刑法增訂妨害性隱私及不實性影像罪章 加重罪責、建立防護網絡",
          url: "https://www.judicial.gov.tw/tw/cp-1429-810493-b0755-1.html",
          date: "2023-02-10",
        },
      },
    ],
    claims: [
      {
        by: "candidate",
        quote: "我一邊跟朝野立委、行政機關協商，希望透過修法杜絕數位跟網路性暴力，讓社會更好。",
        source: {
          type: "candidate",
          outlet: "黃世杰 Threads",
          title: "這幾天，許多人提到我過去在立法院推動「性影像四法聯防」修法",
          url: "https://www.threads.com/@schuanglawyer/post/De9ghFzCcRD",
          date: "2026-10-26",
        },
      },
      {
        by: "media",
        speaker: "自由時報引述胡采蘋的留言",
        quote: "她老公整合了幾十個版本幾百個條文，主導通過了能把創意私房那些垃圾逮起來的系列法規",
        source: {
          type: "media",
          outlet: "自由時報",
          title: "妻待產夫竟奔立院忙修法！ 胡采蘋證實主角就是黃世杰 默默做事網狂讚",
          url: "https://news.ltn.com.tw/news/politics/breakingnews/5617406",
          date: "2026-10-24",
        },
      },
    ],
    notes: [
      {
        kind: "check",
        text: "本站沒有取得這次修法各場審查與協商的會議紀錄，無法確認他主持了哪幾場；他在修法中的角色，採用候選人本人與媒體報導的說法。",
      },
      {
        kind: "clarify",
        text: "網路上流傳的「把創意私房抓起來的法規」說法出自上面這則留言；「創意私房」案實際適用哪些條文，本站沒有查證。",
      },
    ],
  },
  {
    id: "airport-roads",
    featured: true,
    role: "legislator",
    when: "2020–2024",
    title: "爭取大園、觀音的快速道路：台66線高架化、國2甲",
    summary:
      "行政院在台66線高架化工程動土時說明，台66線全線高架化是黃世杰擔任立委時積極爭取的工程。民進黨 2023 年的新聞稿，也把國道2號甲線（國2甲）列為他爭取的建設。",
    facts: [
      {
        text: "2023 年 1 月，「國道2號大園交流道至台15線新闢高速公路工程」通車，國2甲未來將延伸至台61線。",
        source: {
          type: "government",
          outlet: "行政院新聞稿",
          title: "出席國2甲新闢高速公路通車典禮 蘇揆：「雙拓寬、接斷橋、再延長、加1條」完善桃園航空城聯外高快速路網",
          url: "https://www.ey.gov.tw/Page/9277F759E41CCD91/e86f37a5-b055-440b-bf5d-9ba1d4762fe2",
          date: "2023-01-09",
        },
      },
    ],
    claims: [
      {
        by: "official",
        speaker: "行政院新聞稿",
        quote: "台66線全線高架化是在場法務部黃世杰次長擔任立委時所積極爭取的工程",
        source: {
          type: "government",
          outlet: "行政院新聞稿",
          title: "台66線部分路段平交路口高架化改善工程動土 卓揆：打造現代化快速道路 串聯「三橫三縱」區域路網",
          url: "https://www.ey.gov.tw/Page/9277F759E41CCD91/340c9a5d-c482-47b3-a315-10810f839480",
          date: "2026-02-10",
        },
      },
      {
        by: "campaign",
        speaker: "民進黨新聞稿轉述賴清德致詞",
        quote:
          "包括「國道二號大園交流道至台15線」今年初已經完工通車，第二段「國2甲由台15線延伸至台61線」、「台66線全線高架化」，則分別成功爭取79億元、80億元經費，終結大園天空斷橋",
        source: dpp2023,
      },
    ],
    notes: [
      {
        kind: "check",
        text: "行政院 2023 年的國2甲通車新聞稿沒有提到黃世杰；他在國2甲的角色是競選方的說法。",
      },
      {
        kind: "check",
        text: "經費數字口徑不同：民進黨新聞稿寫台66線高架化「80億元」，行政院 2026 年新聞稿寫約 91.77 億元投入 0K～9K 段平交路口高架化改善工程。本站照錄，不換算。",
      },
    ],
  },
  {
    id: "airport-city-relocation",
    role: "legislator",
    when: "2023 年 10 月",
    title: "陪航空城拆遷戶到行政院陳情",
    summary:
      "2023 年 10 月，黃世杰和民眾黨立委賴香伶陪同桃園航空城「先建後拆」的拆遷戶，到行政院、立法院、監察院陳情，訴求補足徵收補償金、調整第 3 階段自願搬遷規劃。",
    claims: [
      {
        by: "media",
        speaker: "中央社",
        quote:
          "民進黨立委黃世杰、民眾黨立委賴香伶與桃園航空城「先建後拆」開發案拆遷戶等人今天至行政院、立法院、監察院陳情，高喊「依法補足徵收補償金、重建家園不能債留子孫」，以及調整第3階段自願搬遷規劃等訴求。",
        source: {
          type: "media",
          outlet: "中央社",
          title: "行政院：桃園航空城拆遷安置方案 市府應重新檢討",
          url: "https://www.cna.com.tw/news/aipl/202310130169.aspx",
          date: "2023-10-13",
        },
      },
      {
        by: "campaign",
        speaker: "民進黨新聞稿轉述賴清德致詞",
        quote: "黃世杰也協助受影響的地方居民，與桃園市府溝通，並向行政院提出應儘速修正現行補償方案的建議，以減輕徵收戶肩上重擔。",
        source: dpp2023,
      },
    ],
    notes: [
      {
        kind: "check",
        text: "同一篇中央社報導寫，行政院表示會透過航空城核心計畫專案小組，督請交通部、桃市府研議這些訴求。後續各項訴求的處理結果，本站沒有找到逐項對照的公開資料，所以不寫成「已經爭取到」。",
      },
    ],
  },
  {
    id: "moj-deputy",
    role: "moj",
    when: "2024–2026",
    title: "督導矯正署、法制司、法律事務司",
    summary: "2024 年 5 月起擔任法務部政務次長，任職近兩年，主要督導矯正署、法制司、法律事務司的業務；2026 年 4 月為參選桃園市長辭職。",
    claims: [
      {
        by: "media",
        speaker: "聯合報",
        quote: "黃世杰於法務部內任服務近2年，主要督導矯正署、法制司、法律事務司業務，對矯正業務著力深",
        source: {
          type: "media",
          outlet: "聯合報",
          title: "黃世杰參選桃園市長辭呈今生效 本周三民進黨提名？他這樣回...",
          url: "https://udn.com/news/story/124652/9437971",
          date: "2026-04-13",
        },
      },
      {
        by: "candidate",
        speaker: "聯合報引述黃世杰臉書貼文，談法務部任內推動犯罪被害人保護",
        quote: "我們要加強對犯罪被害人的照顧，這是國家的義務，司法也有溫暖的一面",
        source: udnNomination,
      },
    ],
    notes: [
      {
        kind: "check",
        text: "本站沒有找到他任內個別政策的官方成果清單，這裡只整理媒體報導與候選人自述。",
      },
    ],
  },
  {
    id: "etomidate",
    role: "moj",
    when: "2024 年 11 月",
    title: "說明依托咪酯升級為二級毒品",
    summary:
      "2024 年 11 月，黃世杰以法務部次長身分在行政院會後記者會說明：毒品審議委員會已將俗稱「喪屍煙彈」的依托咪酯，從三級毒品升級為二級毒品，單純持有與施用也會構成犯罪。",
    claims: [
      {
        by: "media",
        quote:
          "法務部次長黃世杰今天表示，毒品審議委員會已經確定將依托咪酯從三級毒品升級為二級毒品，未來製造、販賣、運輸依托咪酯等刑度都會比三級毒品高，且單純持有與施用也會構成犯罪行為。",
        source: {
          type: "media",
          outlet: "中央社",
          title: "依托咪酯「喪屍煙彈」改列二級毒品 法務部：持有、施用構成犯罪",
          url: "https://www.cna.com.tw/news/aipl/202411140146.aspx",
          date: "2024-11-14",
        },
      },
    ],
    notes: [{ kind: "clarify", text: "毒品分級由毒品審議委員會審議、行政院公告；這裡記錄的是他代表法務部對外說明。" }],
  },
];

export const recordsIn = (role: RoleSlug) => records.filter((r) => r.role === role);
export const featuredRecords = () => records.filter((r) => r.featured);

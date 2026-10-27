import type { Category, CategorySlug, Policy, PolicyStatus, SourceType } from "./types";

// ⚠ 標示 sample: true 的是「示範資料」，只用來呈現版型與互動；沒有 sample 的才是依公開來源整理的正式內容。
// 正式上線前必須逐條換成可追溯來源的內容（規格書第 11 節），並把 sample 拿掉、site.sampleContent 改成 false。
// 不在示範資料中放任何具體數字或日期承諾，避免被誤認為真實政見。

const SAMPLE_SOURCE = "示範來源（待補：原始政見、官方公告或新聞稿）";

/** 候選人政見的共同問答：狀態只在有正式計畫、預算或公告時才更新 */
const CANDIDATE_FAQ = {
  q: "這些主張已經開始執行了嗎？",
  a: "還沒有。這是候選人公開提出的政見，目前狀態為「已提出」。若日後有正式計畫、預算或公告，會更新狀態並附上來源。",
};

export const policies: Policy[] = [
  // 01 交通島
  // ✅ 可查證內容（依候選人公開貼文與附圖整理，用語照原文）
  {
    id: "t1",
    slug: "three-hubs-six-lines",
    title: "加速推動三心六線：三項軌道推動重點",
    category: "transport",
    summary: "由市長親自盯軌道進度、建置重大軌道建設公開儀表板，並排好順序分期完成三心六線路網。",
    problemStatement:
      "桃園人期待捷運，卻還得繼續等。建設卡在哪裡？什麼時候能通車？進度有沒有跟上？政見認為市民應該得到清楚的交代：軌道建設需要時間，但行政協調可以更有效率，工程障礙應該及早處理。",
    description:
      "政見主張把責任、進度與優先順序訂清楚，讓路網一步步到位，逐步串聯桃園、中壢與航空城，讓市民從家門到車站都更方便。",
    pillars: [
      {
        title: "加速推進軌道建設",
        tagline: "市長親自盯，進度不鬆手",
        items: [
          "建立由市長主持的軌道推動會報",
          "逐案追蹤工程、經費、發包、用地與中央審查",
          "跨局處與中央協調，及早排除工程障礙",
          "優先加速捷運綠線、棕線、綠線延伸中壢及鐵路地下化等重大建設",
        ],
      },
      {
        title: "工程進度公開透明",
        tagline: "蓋到哪、錢花到哪，都看得到",
        items: [
          "建置「重大軌道建設公開儀表板」",
          "定期更新工程進度、經費執行、中央審查結果、招標發包狀況及預定通車時程",
          "及早發現問題、追蹤改善，降低工程延宕風險",
        ],
      },
      {
        title: "三心六線分期到位",
        tagline: "排好順序，逐步完成路網",
        items: [
          "優先完成已核定、已編列預算的第一階段路網",
          "推動綠線分段通車及各項延伸工程",
          "規劃公車、YouBike 與人行轉乘環境",
          "公開評估第二階段軌道路網可行性",
        ],
      },
    ],
    audience: "桃園通勤、通學的市民",
    status: "proposed",
    sourceTitle: "黃世杰 Threads 貼文〈桃園人期待捷運，卻還得繼續等〉",
    sourceUrl: "https://www.threads.com/@schuanglawyer/post/DehBeovCXic",
    sourceType: "candidate",
    publishedAt: "2026-10-15",
    retrievedAt: "2026-10-27",
    updatedAt: "2026-10-27",
    notes: [
      { kind: "check", text: "貼文承諾公開「預定通車時程」，但貼文本身沒有提出任何路線的通車日期，所以本頁不列時程。" },
      { kind: "supplement", text: "貼文提到先前另有公車服務與科技執法主張，本站尚未收錄，查證後會另外上架。" },
    ],
    scenarios: [
      {
        persona: "每天從中壢到桃園上班的上班族",
        district: "中壢區",
        text: "我常在想捷運到底什麼時候會通。如果「重大軌道建設公開儀表板」真的做出來，我可以自己查工程進度、經費執行和預定通車時程，不用只靠新聞片段猜。",
      },
      {
        persona: "住在平鎮、搭公車上學的高中生",
        district: "平鎮區",
        text: "我家離車站還有一段路。政見提到要規劃公車、YouBike 與人行轉乘環境；如果做到，從家門到車站這一段可能會比較好走。",
      },
    ],
    faqs: [CANDIDATE_FAQ],
    spot: 0,
  },
  {
    id: "t2",
    slug: "bus-network-transfer",
    title: "公車路網與轉乘更好接",
    category: "transport",
    summary: "檢視公車路線、班次與轉乘點，讓從家裡到車站的「最後一哩路」更好接。",
    problemStatement: "部分地區公車班距長、轉乘點不清楚，讓大眾運輸不容易成為日常選擇。",
    description:
      "盤點主要生活圈的公車服務，優先改善與軌道車站的接駁，並把即時到站與轉乘資訊整合在同一處，減少等車與走錯站的情況。",
    approach: ["盤點路線與班距", "強化車站接駁與轉乘指標", "整合即時到站資訊"],
    audience: "公車通勤族、學生、長者",
    status: "researching",
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "candidate",
    publishedAt: "2026-08-12",
    updatedAt: "2026-10-09",
    related: ["school-route-safety"],
    spot: 1,
    sample: true,
  },
  {
    id: "t3",
    slug: "school-route-safety",
    title: "通學與通勤路口安全改善",
    category: "transport",
    summary: "從事故熱點與通學路線出發，逐一改善行人與自行車最常經過的路口。",
    problemStatement: "上下學與上下班時段，學校周邊與主要路口的人車交織最容易出事。",
    description:
      "以公開的事故資料與學校周邊路線為依據，排定改善順序。常見做法包含標線與號誌調整、人行空間退縮與照明改善，並在完成後追蹤成效。",
    approach: ["依公開事故資料排定優先順序", "標線、號誌與人行空間改善", "完成後追蹤成效並公開"],
    audience: "學生、家長、行人與自行車使用者",
    status: "planned",
    timeline: [
      { label: "盤點學校周邊路口（示範）", date: "2026-11" },
      { label: "第一批改善完成（示範）", date: "2027-06" },
    ],
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "candidate",
    publishedAt: "2026-09-01",
    updatedAt: "2026-10-20",
    faqs: [{ q: "我家附近的路口可以提報嗎？", a: "第二階段會開放市民提問表單；在那之前可透過「關於與聯絡」頁的信箱告訴我們。" }],
    related: ["tech-traffic-management", "women-children-safety"],
    spot: 2,
    sample: true,
  },
  {
    id: "t4",
    slug: "tech-traffic-management",
    title: "科技輔助交通治理",
    category: "transport",
    summary: "用感測與號誌系統協助疏導車流，並公開設置原則，兼顧安全與隱私。",
    problemStatement: "尖峰車流與違規熱點靠人力難以全面處理。",
    description:
      "評估在車流瓶頸與違規熱點導入智慧號誌與科技執法設備，並事先公開設置地點的評估原則與資料保存方式。",
    approach: ["公開設置評估原則", "優先處理事故與壅塞熱點", "說明資料保存與隱私保護方式"],
    status: "unknown",
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "media",
    updatedAt: "2026-09-26",
    related: ["school-route-safety"],
    spot: 3,
    sample: true,
  },

  // 02 育兒家庭島
  // ✅ 可查證內容（依候選人公開貼文與附圖整理，用語照原文）
  {
    id: "f1",
    slug: "friendly-childcare",
    title: "育兒四大主張：打造桃園友善育兒新聚落",
    category: "family",
    summary: "增加公托據點、托育資訊全公開、加碼育兒補助、支持彈性托育，讓托育更便利、資訊更透明、照顧更安心。",
    problemStatement:
      "找合適的托育服務，要一家家詢問名額、比較費用、查詢評鑑結果；好不容易找到，接送時間卻未必能配合工作。輪班、加班的家庭更難兼顧工作與照顧孩子，許多家長不得不在工作與育兒之間艱難取捨。",
    description:
      "政見主張市政府應成為每個家庭的後盾，提供更完善的托育支持，讓孩子安心長大、爸媽放心工作，共同打造友善育兒城市。具體分成四大主張。",
    pillars: [
      {
        title: "增加據點安心托育",
        tagline: "孩子就近托，爸媽少奔波",
        items: [
          "優先補足資源不足地區，增加鄰近生活圈、可負擔的托育選擇",
          "盤點活化社宅及公有閒置空間，增加公托據點",
          "提高托育人員留任獎勵、加碼偏鄉津貼、強化專業培訓",
          "建立跨局處安全預警機制，加強查核輔導",
        ],
      },
      {
        title: "托育資訊全公開",
        tagline: "費用、評鑑、候補一次查",
        items: ["建置合法機構與保母的「透明托育地圖」", "公開收費、評鑑、空缺及候補資訊", "提供線上申請與進度追蹤"],
      },
      {
        title: "加碼育兒補助",
        tagline: "疫苗、第二胎托育都支持",
        items: ["0–6 歲幼兒免費接種腸病毒疫苗", "第二胎送托公托、準公共托嬰中心或找準公共保母，補助托育費用"],
      },
      {
        title: "支持彈性托育",
        tagline: "輪班有支援，育兒有後盾",
        items: [
          "成立企業托育技術輔導團，主動協助企業克服困難、媒合營運單位",
          "產業園區及就業熱點周邊增設公共托育據點",
          "推動符合輪班與高工時需求的彈性托育服務",
        ],
      },
    ],
    audience: "有托育需求的家長，特別是輪班、加班的家庭",
    status: "proposed",
    sourceTitle: "黃世杰 Threads 貼文〈孩子交給誰照顧，才能安心去上班？〉",
    sourceUrl: "https://www.threads.com/@schuanglawyer/post/Dexzk4uE8L5",
    sourceType: "candidate",
    publishedAt: "2026-10-22",
    retrievedAt: "2026-10-27",
    updatedAt: "2026-10-27",
    notes: [
      { kind: "clarify", text: "「第二胎補助托育費用」依附圖原文，適用於送托公托、準公共托嬰中心或找準公共保母，不是所有托育方式全面補助。" },
      {
        kind: "check",
        text: "腸病毒疫苗：貼文內文寫「推動腸病毒疫苗補助」，附圖寫「0–6 歲幼兒免費接種」。本頁採附圖較具體的寫法，實際對象與方式以日後正式方案為準。",
      },
    ],
    scenarios: [
      {
        persona: "排三班的護理師媽媽",
        district: "龜山區",
        text: "孩子兩歲，我的班表常常變。政見提到要推動符合輪班與高工時需求的彈性托育服務；如果真的有，我就不用每次換班都到處拜託人接送。醫療政見裡的「醫護子女享有幼兒園優先序位」也和我有關。",
      },
      {
        persona: "正在找托嬰中心的新手爸爸",
        district: "八德區",
        text: "現在只能一家家打電話問名額和收費。如果「透明托育地圖」上線，我可以一次查到合法機構與保母的收費、評鑑、空缺和候補資訊，也能線上申請、追蹤進度。",
      },
    ],
    faqs: [CANDIDATE_FAQ],
    related: ["better-healthcare"],
    spot: 0,
  },
  {
    id: "f2",
    slug: "inclusive-parks",
    title: "親子共融遊戲場",
    category: "family",
    summary: "讓不同年齡、不同能力的孩子，都能在家附近的公園一起玩。",
    problemStatement: "部分遊戲場設施老舊或缺乏遮蔭，也不一定適合行動不便的孩子使用。",
    description: "在設計階段邀請家長與孩子參與，優先改善遮蔭、地坪安全與無障礙動線，並公開各場址的規劃進度。",
    approach: ["設計前的參與式工作坊", "遮蔭、地坪與無障礙動線改善", "公開各場址進度"],
    audience: "兒童與家長",
    status: "planned",
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "candidate",
    publishedAt: "2026-08-30",
    updatedAt: "2026-10-02",
    related: ["park-green-space"],
    spot: 1,
    sample: true,
  },
  {
    id: "f3",
    slug: "family-care-support",
    title: "家庭照顧者支持",
    category: "family",
    summary: "照顧孩子也照顧長輩的「三明治家庭」，需要喘息與諮詢的管道。",
    problemStatement: "同時照顧孩子與長輩的家庭，常獨自承擔照顧壓力。",
    description: "盤點現有的喘息服務、臨時托育與諮詢窗口，整理成清楚的申請指引，並研議擴大服務時段。",
    approach: ["盤點既有照顧支持服務", "整理申請指引與窗口", "研議延長服務時段"],
    audience: "家庭照顧者",
    status: "researching",
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "candidate",
    publishedAt: "2026-09-05",
    updatedAt: "2026-09-30",
    related: ["community-care-stations"],
    spot: 2,
    sample: true,
  },
  {
    id: "f4",
    slug: "women-children-safety",
    title: "婦幼安全回家路",
    category: "family",
    summary: "改善夜間照明與人行環境，讓帶孩子、晚下班的人走回家更安心。",
    description: "依據市民回報與公開資料，盤點照明不足的路段與地下道，優先改善，並公開改善清單。",
    approach: ["盤點照明不足路段", "優先改善地下道與通學路線", "公開改善清單"],
    status: "proposed",
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "citizen",
    updatedAt: "2026-09-18",
    related: ["school-route-safety"],
    spot: 3,
    sample: true,
  },

  // 03 健康共好島
  // ✅ 可查證內容（依候選人公開貼文與附圖整理，用語照原文）
  {
    id: "h1",
    slug: "better-healthcare",
    title: "讓好醫療留在桃園：三大醫療主張",
    category: "health",
    summary: "打造特色醫療中心網絡、推動醫護安居專案、建立全齡身心照護支持網，縮短城鄉醫療落差並留住醫護人才。",
    problemStatement:
      "有些長輩明明身體不舒服，卻因為醫院太遠、交通不方便而選擇忍耐；對長者、行動不便或需要家人陪同就醫的市民來說，光是出門看病就是一大障礙。桃園人口急遽成長，醫療資源分布卻嚴重不均。",
    description:
      "政見主張縮短城鄉的醫療資源落差，用實際支持留住優秀的醫護人才，打造更完整、更均衡的桃園醫療體系，同時積極為桃園第二座醫學中心布局。具體分成三大主張。",
    pillars: [
      {
        title: "打造桃園特色醫療中心網絡",
        items: ["成立癌症、兒童、高齡等特色醫療院所", "市府補助專業設備與人才，強化醫療量能", "結合醫學中心輔導，快速到位"],
      },
      {
        title: "推動醫護安居專案",
        tagline: "以行動力挺醫護，為桃園留住人才",
        items: ["社宅專案保留額、租屋加碼補貼", "推動大眾運輸通勤補助", "醫護子女享有幼兒園優先序位"],
      },
      {
        title: "建立全齡身心照護支持網",
        tagline: "全民守護，照護不斷線",
        items: ["設置兒童早療快速通道", "將心理健康服務帶進社區", "推動醫養合一，家庭照顧有喘息"],
      },
    ],
    audience: "長者、行動不便或需要陪同就醫的市民，以及醫護人員",
    status: "proposed",
    sourceTitle: "黃世杰 Threads 貼文〈讓好醫療留在桃園〉",
    sourceUrl: "https://www.threads.com/@schuanglawyer/post/DdQrQX7E0BO",
    sourceType: "candidate",
    publishedAt: "2026-09-14",
    retrievedAt: "2026-10-27",
    updatedAt: "2026-10-27",
    notes: [
      { kind: "supplement", text: "「積極為桃園第二座醫學中心布局」出自貼文內文；貼文與附圖都沒有列出具體地點、做法或時程。" },
    ],
    scenarios: [
      {
        persona: "陪爸媽看病的女兒",
        district: "觀音區",
        text: "爸媽年紀大了，每次看病都要開很久的車。政見提到要縮短城鄉醫療落差、成立高齡等特色醫療院所；如果做到，或許不必每次都跑那麼遠。",
      },
      {
        persona: "剛到桃園工作的年輕護理師",
        district: "蘆竹區",
        text: "租屋是我最大的開銷。「醫護安居專案」提到社宅專案保留額、租屋加碼補貼和大眾運輸通勤補助；如果實施，會是我考慮留在桃園的理由之一。",
      },
    ],
    faqs: [CANDIDATE_FAQ],
    related: ["friendly-childcare"],
    spot: 0,
  },
  {
    id: "h2",
    slug: "community-care-stations",
    title: "社區照顧據點走路就到",
    category: "health",
    summary: "讓長輩在熟悉的社區裡共餐、運動、交朋友。",
    problemStatement: "長輩需要離家近、能持續參與的照顧與社交空間。",
    description: "盤點各里照顧據點的分布與服務內容，優先在缺乏據點的地區增設，並整理開放時間與活動資訊。",
    approach: ["盤點據點分布", "優先補足空白區域", "整理開放時間與活動資訊"],
    audience: "長者與家屬",
    status: "in_progress",
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "government",
    publishedAt: "2026-07-15",
    updatedAt: "2026-10-19",
    faqs: [{ q: "怎麼知道離我最近的據點？", a: "正式版會提供地圖查詢；目前請以市府公告的據點清單為準。" }],
    related: ["family-care-support", "senior-card-info"],
    spot: 1,
    sample: true,
  },
  {
    id: "h3",
    slug: "accessible-walkways",
    title: "無障礙步行環境",
    category: "health",
    summary: "從醫院、車站到社區的路，輪椅、推車和長輩都能順順走。",
    description: "以就醫與通勤路線為優先，改善人行道高低差、斜坡與騎樓通行，並請使用者參與驗收。",
    approach: ["優先改善就醫與通勤路線", "處理高低差與斜坡", "邀請使用者參與驗收"],
    audience: "行動不便者、長者、推嬰兒車的家長",
    status: "proposed",
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "candidate",
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-29",
    related: ["school-route-safety"],
    spot: 2,
    sample: true,
  },
  {
    id: "h4",
    slug: "senior-card-info",
    title: "敬老福利資訊更好懂",
    category: "health",
    summary: "把敬老愛心卡等長者福利的使用方式，整理成長輩看得懂的說明。",
    problemStatement: "福利規則調整時，長輩與家屬不容易即時得知。",
    description: "以大字、圖解與問答整理現行福利的使用方式，規則調整時同步標示變更內容與生效日期。",
    approach: ["大字與圖解說明", "規則變更時標示生效日期", "提供電話與臨櫃諮詢資訊"],
    audience: "長者與家屬",
    status: "completed",
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "government",
    publishedAt: "2026-06-30",
    updatedAt: "2026-09-21",
    related: ["community-care-stations"],
    spot: 3,
    sample: true,
  },

  // 04 宜居環境島
  {
    id: "e1",
    slug: "recycling-convenience",
    title: "資源回收更方便",
    category: "environment",
    summary: "增加回收點與彈性時段，讓分類回收不再配合不上作息。",
    problemStatement: "上班族常因時間不合，難以配合固定的回收時段。",
    description: "評估在社區、車站周邊設置定點回收設施，並研議延長收運時段的可行性。",
    approach: ["評估定點回收設施", "研議彈性收運時段", "公開試辦地點與成效"],
    status: "planned",
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "candidate",
    publishedAt: "2026-08-25",
    updatedAt: "2026-10-08",
    related: ["garbage-collection-info"],
    spot: 0,
    sample: true,
  },
  {
    id: "e2",
    slug: "ponds-resilience",
    title: "埤塘與城市韌性",
    category: "environment",
    summary: "善用桃園的埤塘，作為滯洪、生態與休憩的城市綠色基盤。",
    problemStatement: "極端降雨更頻繁，城市需要更多能「接住雨水」的空間。",
    description: "盤點埤塘的現況與功能，評估兼顧滯洪、生態與休憩的活化方式，並公開評估結果。",
    approach: ["盤點埤塘現況", "評估滯洪與生態功能", "公開評估結果"],
    status: "researching",
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "candidate",
    publishedAt: "2026-09-02",
    updatedAt: "2026-10-16",
    faqs: [{ q: "什麼是城市韌性？", a: "指城市面對災害或衝擊時，能撐住、恢復並調整的能力。可以到「政策小教室」看更多說明。" }],
    related: ["park-green-space"],
    spot: 1,
    sample: true,
  },
  {
    id: "e3",
    slug: "garbage-collection-info",
    title: "垃圾清運資訊即時查",
    category: "environment",
    summary: "垃圾車到哪裡、幾點到，用手機就能查。",
    description: "整合清運路線與即時位置資訊，並提供路線異動通知。",
    approach: ["整合清運路線與即時位置", "路線異動通知"],
    status: "unknown",
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "media",
    updatedAt: "2026-09-12",
    related: ["recycling-convenience"],
    spot: 2,
    sample: true,
  },
  {
    id: "e4",
    slug: "park-green-space",
    title: "公園綠地與遮蔭",
    category: "environment",
    summary: "多種樹、多一點遮蔭，讓走路和待在公園都舒服一點。",
    description: "以步行可達為原則檢視綠地分布，優先在缺乏綠地的地區增加小型公園與行道樹遮蔭。",
    approach: ["檢視步行可達的綠地分布", "增加小型公園與行道樹", "公開植栽與維護計畫"],
    status: "proposed",
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "candidate",
    publishedAt: "2026-09-08",
    updatedAt: "2026-10-05",
    related: ["inclusive-parks", "ponds-resilience"],
    spot: 3,
    sample: true,
  },

  // 05 未來發展島
  {
    id: "u1",
    slug: "local-business-districts",
    title: "在地商圈活化",
    category: "future",
    summary: "陪在地商圈一起經營，讓逛街、吃飯都有更多理由留在桃園。",
    description: "盤點各商圈的需求，從環境改善、活動行銷到數位工具，提供分階段的輔導。",
    approach: ["商圈需求盤點", "環境改善與活動行銷", "數位工具輔導"],
    status: "planned",
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "candidate",
    publishedAt: "2026-08-18",
    updatedAt: "2026-10-11",
    related: ["youth-startup-support"],
    spot: 0,
    sample: true,
  },
  {
    id: "u2",
    slug: "youth-startup-support",
    title: "青年就業與創業支持",
    category: "future",
    summary: "從找工作、轉職到創業，讓年輕人在桃園有地方問、有資源用。",
    problemStatement: "青年面對就業與創業資訊分散，不知道從哪裡開始。",
    description: "整合就業媒合、職訓課程與創業諮詢資源，設置單一窗口，並定期公開服務成果。",
    approach: ["整合就業與創業資源", "設置單一諮詢窗口", "定期公開服務成果"],
    audience: "青年、轉職者、創業者",
    status: "proposed",
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "candidate",
    publishedAt: "2026-09-15",
    updatedAt: "2026-10-17",
    related: ["local-business-districts"],
    spot: 1,
    sample: true,
  },
  // ✅ 可查證內容（依候選人公開貼文與附圖整理，用語照原文）
  {
    id: "u3",
    slug: "arts-culture-wave",
    title: "藝文四大主張：文化造浪，桃園新動能",
    category: "future",
    summary: "發展演唱會經濟、完善各級展演空間、打造有故事的桃園、讓影視生態全面進化，讓文化成為城市發展的新動能。",
    problemStatement:
      "桃園有 13 個行政區，有山、有海、有城市與鄉村，也有多元族群文化，累積出獨特的地方記憶與文化底蘊，是發展城市文化品牌的重要基礎。政見希望讓市民有更豐富的藝文生活、創作者能盡情發揮才華，並以更多演唱會及藝文活動吸引人潮，帶動觀光與商圈發展。",
    description:
      "這份藝文政見從音樂、劇場、文學到電影與影視製作，分成四大主張，目標是支持在地人才與團隊發展，讓好的作品在桃園誕生，也有機會走向全台灣、走向國際。",
    pillars: [
      {
        title: "發展演唱會經濟",
        tagline: "桃園邁向展演城市",
        items: ["建立專案服務機制", "單一窗口協調場地、交通與宣傳", "串聯商圈、餐飲、旅宿，引導民眾停留消費"],
      },
      {
        title: "完善各級展演空間",
        tagline: "打造多元藝文舞台",
        items: ["推動大型展演建設，接軌國際舞台", "完善中小型展演場館，健全藝文展演生態", "發展 Live House、小型劇場等多元空間，培育在地文化量能"],
      },
      {
        title: "打造有故事的桃園",
        tagline: "文化扎根地方共好",
        items: ["升級桃園文學季，建立年度文化品牌", "創作者駐桃計畫：透過駐地、交流，讓創作深入地方", "完善圖書館及社區閱讀資源，規劃藝文參與回饋機制"],
      },
      {
        title: "影視生態全面進化",
        tagline: "讓人才與作品在桃園扎根",
        items: ["研議成立桃園電影委員會，整合協拍、招商與影視產業服務", "串聯院校、業者與劇組，提供培訓、實作及工作媒合", "推動「影視×景點」，研議場景保存、主題遊程與後續行銷"],
      },
    ],
    audience: "市民、創作者，以及在地藝文與影視人才、團隊",
    status: "proposed",
    sourceTitle: "黃世杰 Threads 貼文〈文化造浪 桃園新動能！〉",
    sourceUrl: "https://www.threads.com/@schuanglawyer/post/De-hc4bEwKK",
    sourceType: "candidate",
    publishedAt: "2026-10-27",
    retrievedAt: "2026-10-27",
    updatedAt: "2026-10-27",
    notes: [
      { kind: "check", text: "「研議成立桃園電影委員會」「研議場景保存」原文用「研議」，表示仍在評估，不代表確定成立。" },
    ],
    scenarios: [
      {
        persona: "在大學念影視的學生",
        district: "中壢區",
        text: "畢業後想留在家鄉拍片。政見提到要串聯院校、業者與劇組，提供培訓、實作及工作媒合；如果做到，我在桃園也有機會進劇組累積經驗。",
      },
      {
        persona: "經營小餐廳的老闆",
        district: "桃園區",
        text: "演唱會那幾天人潮很多，但散場後大家就直接回家了。政見說要串聯商圈、餐飲、旅宿，引導民眾停留消費；如果真的做，週末的生意可能會不一樣。",
      },
    ],
    faqs: [CANDIDATE_FAQ],
    spot: 2,
  },
  {
    id: "u4",
    slug: "sports-city",
    title: "運動城市與全民運動",
    category: "future",
    summary: "從職業球賽到社區運動，讓運動成為桃園的日常風景。",
    description: "盤點運動場館的使用情況，改善社區運動空間，並結合賽事帶動周邊活動。",
    approach: ["盤點場館使用情況", "改善社區運動空間", "結合賽事帶動周邊活動"],
    status: "researching",
    sourceTitle: SAMPLE_SOURCE,
    sourceType: "candidate",
    publishedAt: "2026-09-20",
    updatedAt: "2026-10-14",
    related: ["local-business-districts"],
    spot: 3,
    sample: true,
  },
];

export const statusInfo: Record<PolicyStatus, { label: string; desc: string; tone: string }> = {
  proposed: { label: "已提出", desc: "已公開提出，尚未進入規劃或執行。", tone: "#F9E3D8" },
  researching: { label: "研議中", desc: "正在評估可行性、預算或做法。", tone: "#FBF0C8" },
  planned: { label: "規劃中", desc: "已有具體規劃，等待執行。", tone: "#DCEBF0" },
  in_progress: { label: "執行中", desc: "已開始執行，有公開資料可查。", tone: "#CFE6DA" },
  completed: { label: "已完成", desc: "依公開資料，已完成主要項目。", tone: "#B9DC9A" },
  unknown: { label: "暫無可查證進度", desc: "目前找不到可查證的進度資料，不做推測。", tone: "#ECE8DD" },
};

export const statusOrder: PolicyStatus[] = ["proposed", "researching", "planned", "in_progress", "completed", "unknown"];

export const sourceTypeLabel: Record<SourceType, string> = {
  candidate: "候選人公開政見",
  government: "政府已核定政策",
  media: "媒體報導",
  citizen: "市民提案",
};

export function getPolicy(slug: string) {
  return policies.find((p) => p.slug === slug);
}

export function policiesIn(category: CategorySlug | Category) {
  const slug = typeof category === "string" ? category : category.slug;
  return policies.filter((p) => p.category === slug).sort((a, b) => a.spot - b.spot);
}

export function latestPolicies(n: number) {
  return [...policies].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, n);
}

export function formatDate(iso?: string) {
  if (!iso) return "未提供";
  const [y, m, d] = iso.split("-");
  return d ? `${y}.${Number(m)}.${Number(d)}` : `${y}.${Number(m)}`;
}

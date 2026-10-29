export const site = {
  name: "JIE.Taoyuan 杰伴桃園",
  brand: "JIE.Taoyuan",
  brandZh: "杰伴桃園",
  tagline: "讓每一個桃園人的生活，都更有感。",
  /** 正式網址：優先用 NEXT_PUBLIC_SITE_URL（自訂網域），其次是 Vercel 自動提供的正式網域 */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  /** 有示範資料（sample: true）時改成 true，頁面會顯示示範內容提示 */
  sampleContent: false,
  /** 支持的候選人與號次（號次依據：候選人 2026-10-27 公布的 Threads 貼文） */
  candidate: {
    name: "黃世杰",
    office: "桃園市長候選人",
    ballotNo: 1,
    ballotSource: { title: "黃世杰 Threads 貼文", url: "https://www.threads.com/@schuanglawyer/post/De-oyFao2Sj", date: "2026-10-27" },
    /** 維基百科條目「黃世杰 (政治人物)」與對應的 Wikidata（2026-10-29 確認）；結構化資料用來指明是哪一位黃世杰 */
    wikipedia: "https://zh.wikipedia.org/wiki/%E9%BB%83%E4%B8%96%E6%9D%B0_(%E6%94%BF%E6%B2%BB%E4%BA%BA%E7%89%A9)",
    wikidata: "https://www.wikidata.org/wiki/Q85885461",
    /** 候選人本人的社群帳號（依候選人的連結頁 portaly.cc/schuanglawyer，2026-10-29 確認） */
    socials: [
      { key: "threads", name: "Threads", url: "https://www.threads.com/@schuanglawyer" },
      { key: "instagram", name: "Instagram", url: "https://www.instagram.com/schuanglawyer" },
      { key: "facebook", name: "Facebook", url: "https://www.facebook.com/SCHuangLawyer" },
      { key: "youtube", name: "YouTube", url: "https://www.youtube.com/@schuanglawyer" },
      { key: "line", name: "LINE 官方帳號", url: "https://line.me/R/ti/p/@589cjotf" },
    ],
  },
  /** 投票日（2026 地方公職人員選舉） */
  electionDate: "2026-11-28",
  /** 網站立場：支持者自發整理，非候選人或競選團隊經營 */
  stance: "非官方・支持者依公開資料整理",
  stanceLong: "本站是支持者自發整理的非官方網站，並非候選人或競選團隊經營。政見內容依候選人公開文宣與媒體報導整理，正確內容以原始來源為準。",
  /** 每一筆政見頁都會附上的查證聲明 */
  verifyNote: "依候選人公開文宣與媒體報導整理；未加引號者為本站轉述，政見中的數字由競選方提出，本站未另行查證。",
  /** 網站維護者 */
  organizer: "支持者志工團隊",
};

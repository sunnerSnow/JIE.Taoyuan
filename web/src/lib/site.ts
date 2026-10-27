export const site = {
  name: "JIE.Taoyuan 杰伴桃園",
  brand: "JIE.Taoyuan",
  brandZh: "杰伴桃園",
  tagline: "讓每一個桃園人的生活，都更有感。",
  description: "從每天的生活出發，一起探索桃園的政策與城市未來。用一座「桃園政策島」看懂交通、育兒、健康照顧、宜居環境與城市發展政策，每一項都附上來源、狀態與更新日期。",
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
  },
  /** 網站立場：支持者自發整理，非候選人或競選團隊經營 */
  stance: "非官方・支持者依公開資料整理",
  stanceLong: "本站是支持者自發整理的非官方網站，並非候選人或競選團隊經營。政見內容依候選人公開文宣與媒體報導整理，正確內容以原始來源為準。",
  /** 每一筆政見頁都會附上的查證聲明 */
  verifyNote: "依候選人公開文宣與媒體報導整理；未加引號者為本站轉述，政見中的數字由競選方提出，本站未另行查證。",
  /** 上線前待確認：維護者、聯絡信箱（規格書第 16 節） */
  organizer: "（待確認）支持者志工團隊",
  contactEmail: "contact@example.com",
};

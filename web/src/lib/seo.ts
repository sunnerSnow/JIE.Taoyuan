import { categories } from "@/data/categories";
import { actionCount, policies, sourceName } from "@/data/policies";
import type { Policy } from "@/data/types";
import { site } from "./site";

// 給搜尋引擎與 AI 摘要用的句子：一段被單獨擷取時，仍看得出「誰、何時、在哪裡提出」。
// 數字與名稱都從資料組出來，不手寫，政見增減時自動跟著變。

const c = site.candidate;
const year = site.electionDate.slice(0, 4);

/** 黃世杰（桃園市長候選人 1 號） */
export const candidateFull = `${c.name}（${c.office} ${c.ballotNo} 號）`;

const categoryList = categories.map((x) => x.short).join("、");
const totalActions = policies.reduce((n, p) => n + actionCount(p), 0);

/** 首頁 title：網站講的是誰、是什麼，並標明非官方 */
export const homeTitle = `${c.name}政見整理（非官方）｜${site.name}`;

/** 首頁與分享預覽的 description */
export const siteDescription = `支持者整理的非官方網站：${year} 年${c.office}${c.name}（${c.ballotNo} 號）公開提出的 ${policies.length} 項政見，分成${categoryList} ${categories.length} 類，每項附原始出處、狀態與更新日期。`;

/** 首頁的定義段落：AI 回答「這個網站是什麼」「他有哪些政見」時最可能引用的一段 */
export const siteSummary = `${site.name}是支持者自發整理的非官方網站，彙整 ${year} 年${c.office}${c.name}（${c.ballotNo} 號）公開提出的 ${policies.length} 項政見、${totalActions} 項具體做法，分成${categoryList} ${categories.length} 類。每一項都附上候選人原始貼文或媒體報導的出處、發布日期與更新日期。`;

/** 2026-10-15 → 2026 年 10 月 15 日；只有年月時省略日 */
function zhDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return d ? `${y} 年 ${Number(m)} 月 ${Number(d)} 日` : `${y} 年 ${Number(m)} 月`;
}

/**
 * 政見頁開頭的一句話：誰、何時、在哪裡提出（不加句號，呼叫端自己接）。
 * 用完整標題而不是 shortTitle，避免「垃圾費隨袋徵收」被讀成要推動隨袋徵收。
 */
export function policyLead(p: Policy) {
  const outlet = sourceName(p.sourceTitle);
  const date = p.publishedAt ? zhDate(p.publishedAt) : "";
  const what = `政見「${p.title}」`;
  if (p.sourceType === "candidate") {
    const channel = outlet.replace(c.name, "").trim();
    return `${candidateFull}在${date ? ` ${date}的 ` : " "}${channel}提出${what}`;
  }
  if (p.sourceType === "media") return `據${outlet}${date ? ` ${date}` : ""}報導，${candidateFull}提出${what}`;
  return `${candidateFull}提出${what}（出處：${outlet}）`;
}

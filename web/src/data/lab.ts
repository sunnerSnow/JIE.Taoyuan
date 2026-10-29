import { categories } from "./categories";
import { policies } from "./policies";
import type { CategorySlug, Policy } from "./types";

// 企鵝阿爸研究所「3 分鐘，拼出你心中的桃園」：全部政見一次攤開，挑最想了解的 3 項收下積木，拼出一張可以分享的桃園卡。
// 政見依政策島分組；每座島的生活主題文字是本站的整理，不是候選人的分類。列出的內容一律取自正式政見資料。

export const PICKS = 3;

export const labThemes: Record<CategorySlug, { label: string; question: string }> = {
  transport: { label: "通勤與交通", question: "每天通勤，最在意什麼？" },
  family: { label: "育兒與家庭", question: "家中有小孩，想了解哪些公共服務？" },
  health: { label: "健康與照顧", question: "關心長輩健康與照顧，有哪些議題？" },
  environment: { label: "居住與環境", question: "希望居住環境更舒服，可以看哪些內容？" },
  future: { label: "工作、產業與未來發展", question: "想知道桃園未來的工作與產業方向？" },
};

/** 活動列出的政見：排除示範資料，依政策島分組，島內依提出日期由新到舊（同一天依島上的位置） */
export function labGroups() {
  return categories
    .map((c) => ({
      category: c,
      policies: policies
        .filter((p) => p.category === c.slug && !p.sample)
        .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") || a.spot - b.spot),
    }))
    .filter((g) => g.policies.length > 0);
}

/** 成果卡網址：三項政見的 id 排序後用「-」串起來，例如 f1-t2-u3（同一組政見只有一個網址） */
export const cardCode = (ids: string[]) => [...ids].sort().join("-");

/** 解析成果卡網址，回傳卡上的三項政見（依活動列出的順序）；不是三項不同的正式政見就回傳 null（頁面顯示找不到） */
export function parseCardCode(code: string): Policy[] | null {
  const ids = code.split("-");
  if (ids.length !== PICKS || new Set(ids).size !== PICKS || cardCode(ids) !== code) return null;
  const picks = labGroups()
    .flatMap((g) => g.policies)
    .filter((p) => ids.includes(p.id));
  return picks.length === PICKS ? picks : null;
}

/** build 時預先產生的桃園卡：每座島最新的 3 項。其他組合有兩千多種，第一次有人打開時才產生，之後走快取 */
export function sampleCardCodes() {
  return labGroups()
    .filter((g) => g.policies.length >= PICKS)
    .map((g) => cardCode(g.policies.slice(0, PICKS).map((p) => p.id)));
}

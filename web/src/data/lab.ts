import { categories } from "./categories";
import { policies } from "./policies";
import type { CategorySlug, Policy } from "./types";

// 企鵝阿爸研究所「3 分鐘，拼出你心中的桃園」：選一個生活主題，主題裡的政見全部列出，挑 3 項收下積木，拼出一張可以分享的桃園卡。
// 五個生活主題各對應一座政策島；主題文字與對應關係是本站的整理，不是候選人的分類。列出的內容一律取自正式政見資料。

export const PICKS = 3;

export const labThemes: Record<CategorySlug, { label: string; question: string }> = {
  transport: { label: "通勤與交通", question: "每天通勤，最在意什麼？" },
  family: { label: "育兒與家庭", question: "家中有小孩，想了解哪些公共服務？" },
  health: { label: "健康與照顧", question: "關心長輩健康與照顧，有哪些議題？" },
  environment: { label: "居住與環境", question: "希望居住環境更舒服，可以看哪些內容？" },
  future: { label: "工作、產業與未來發展", question: "想知道桃園未來的工作與產業方向？" },
};

/** 主題底下的政見：排除示範資料，依提出日期由新到舊（同一天依島上的位置） */
export function themePolicies(slug: CategorySlug) {
  return policies
    .filter((p) => p.category === slug && !p.sample)
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") || a.spot - b.spot);
}

/** 成果卡網址：三項政見的 id 排序後用「-」串起來，例如 t1-t2-t4（同一組政見只有一個網址） */
export const cardCode = (ids: string[]) => [...ids].sort().join("-");

/** 解析成果卡網址；不是同一個主題的三項正式政見就回傳 null（頁面顯示找不到） */
export function parseCardCode(code: string): { theme: CategorySlug; picks: Policy[] } | null {
  const ids = code.split("-");
  if (ids.length !== PICKS || new Set(ids).size !== PICKS || cardCode(ids) !== code) return null;
  const found = ids.map((id) => policies.find((p) => p.id === id));
  if (found.some((p) => !p || p.sample)) return null;
  const theme = found[0]!.category;
  if (found.some((p) => p!.category !== theme)) return null;
  return { theme, picks: themePolicies(theme).filter((p) => ids.includes(p.id)) };
}

/** 所有可能的成果卡（每個主題任選 3 項），頁面在 build 時全部預先產生 */
export function allCardCodes() {
  return categories.flatMap((c) => {
    const ids = themePolicies(c.slug).map((p) => p.id);
    const codes: string[] = [];
    for (let i = 0; i < ids.length; i++)
      for (let j = i + 1; j < ids.length; j++) for (let k = j + 1; k < ids.length; k++) codes.push(cardCode([ids[i], ids[j], ids[k]]));
    return codes;
  });
}

/** 分享圖只預先產生每個主題最新的 3 項（帶紙紋的圖一張約 1MB），其他組合第一次有人打開時才產生，之後走快取 */
export function sampleCardCodes() {
  return categories
    .map((c) => themePolicies(c.slug).slice(0, PICKS))
    .filter((ps) => ps.length === PICKS)
    .map((ps) => cardCode(ps.map((p) => p.id)));
}

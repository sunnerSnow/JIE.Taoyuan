import { categoryMap } from "@/data/categories";
import type { Category, Policy } from "@/data/types";
import { site } from "./site";

// 結構化資料（schema.org JSON-LD）。本站是非官方網站：發布者一律是支持者志工團隊，
// 候選人只出現在 about（這些頁面在講誰），不能被標成發布者。不放聯絡信箱。
// 每一份 JSON-LD 都自成一份：用 @id 指到的網站、維護者、候選人節點也放進同一份，
// 因為有些解析器不會跨 <script> 對應 @id；同一個 @id 出現在多份裡，支援的解析器會合併成同一個節點。

const c = site.candidate;
const abs = (path: string) => new URL(path, site.url).toString();

export const ldIds = {
  website: abs("/#website"),
  org: abs("/#org"),
  candidate: abs("/#candidate"),
};

/** 用到網站節點的圖，也要放 orgNode 與 candidateNode（publisher、about 指到它們） */
const websiteNode = {
  "@type": "WebSite",
  "@id": ldIds.website,
  url: abs("/"),
  name: site.name,
  inLanguage: "zh-Hant-TW",
  publisher: { "@id": ldIds.org },
  about: { "@id": ldIds.candidate },
};

const orgNode = { "@type": "Organization", "@id": ldIds.org, name: site.organizer, url: abs("/about"), description: site.stanceLong };

/** sameAs 讓 AI 確認是哪一位黃世杰 */
const candidateNode = {
  "@type": "Person",
  "@id": ldIds.candidate,
  name: c.name,
  description: `${site.electionDate.slice(0, 4)} 年${c.office}（${c.ballotNo} 號）`,
  sameAs: [c.wikipedia, c.wikidata, ...c.socials.filter((s) => s.key !== "line").map((s) => s.url)],
};

/** 全站共用：網站、維護者、候選人 */
export function siteGraph(description: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [{ ...websiteNode, description }, orgNode, candidateNode],
  };
}

/** 麵包屑：和頁面上看得到的麵包屑一致；最後一項是目前頁面，不給網址 */
export function breadcrumbList(items: { name: string; path?: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.path ? { item: abs(it.path) } : {}),
    })),
  };
}

/** 政見詳情頁：本站整理的文章，講的是候選人，依據是原始來源 */
export function policyGraph(p: Policy) {
  const url = abs(`/policies/${p.slug}`);
  const category = categoryMap[p.category];
  const sources = [p.sourceUrl, ...(p.extraSources ?? []).map((s) => s.url)].filter((u): u is string => !!u);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        url,
        mainEntityOfPage: url,
        headline: p.title,
        description: p.summary,
        inLanguage: "zh-Hant-TW",
        // 和 og 的 article:published_time 一致：用政見的發布日期
        datePublished: p.publishedAt ?? p.retrievedAt ?? p.updatedAt,
        dateModified: p.updatedAt,
        articleSection: category.name,
        ...(p.tags?.length ? { keywords: p.tags.join("、") } : {}),
        about: { "@id": ldIds.candidate },
        author: { "@id": ldIds.org },
        publisher: { "@id": ldIds.org },
        isPartOf: { "@id": ldIds.website },
        ...(sources.length ? { isBasedOn: sources } : {}),
      },
      breadcrumbList([
        { name: "首頁", path: "/" },
        { name: "政策總覽", path: "/policies" },
        { name: category.name, path: `/islands/${category.slug}` },
        { name: p.title },
      ]),
      websiteNode,
      orgNode,
      candidateNode,
    ],
  };
}

function policyItemList(name: string, list: Policy[]) {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: list.length,
    itemListElement: list.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/policies/${p.slug}`), name: p.title })),
  };
}

/** 政策總覽：全部政見的清單 */
export function policyListGraph(list: Policy[]) {
  return { "@context": "https://schema.org", ...policyItemList(`${c.name}政見總覽`, list) };
}

/** 島嶼頁：麵包屑＋這座島上的政見 */
export function islandGraph(category: Category, list: Policy[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbList([{ name: "首頁", path: "/" }, { name: "探索政策島", path: "/explore" }, { name: category.name }]),
      policyItemList(`${c.name}的${category.short}政見`, list),
    ],
  };
}

/** 過去的貢獻：以候選人為主體的介紹頁 */
export function profileGraph(dateModified: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        url: abs("/record"),
        name: `${c.name}過去的貢獻`,
        inLanguage: "zh-Hant-TW",
        dateModified,
        mainEntity: { "@id": ldIds.candidate },
        isPartOf: { "@id": ldIds.website },
      },
      websiteNode,
      orgNode,
      candidateNode,
    ],
  };
}

import type { Category, CategorySlug } from "./types";

export const categories: Category[] = [
  {
    slug: "transport",
    no: "01",
    name: "交通島",
    short: "交通",
    tagline: "每天出門的路，可以更順、更安全。",
    intro: "從捷運軌道、公車轉乘到上學通勤的路口，看看交通政策怎麼改變桃園人每天的移動。",
    topics: ["捷運與軌道建設", "公車路網、班次與轉乘", "通勤與道路安全", "交通治理與科技執法"],
    scenes: ["捷運", "道路", "公車站", "轉運節點"],
    penguinTip: "看交通政策時，可以先問：它讓哪一段路變好走？要多久才看得到？",
  },
  {
    slug: "family",
    no: "02",
    name: "育兒家庭島",
    short: "育兒家庭",
    tagline: "讓帶孩子這件事，不再只靠家裡撐。",
    intro: "托育資源、親子空間、婦幼安全與家庭照顧支持，把一個家需要的幫手找出來。",
    topics: ["公共托育與托育資源資訊", "親子友善空間", "婦幼安全", "家庭照顧支持"],
    scenes: ["托育中心", "親子公園", "住宅社區"],
    penguinTip: "育兒政策常有申請資格與名額，記得看「適用對象」那一欄。",
  },
  {
    slug: "health",
    no: "03",
    name: "健康共好島",
    short: "健康照顧",
    tagline: "從小孩到長輩，每個世代都有人顧。",
    intro: "醫療與健康服務、長者照顧、敬老相關福利，以及不同世代的照顧需求。",
    topics: ["醫療與健康服務", "長者照顧", "敬老愛心卡相關政策", "不同世代的照顧需求"],
    scenes: ["醫療院所", "社區照顧據點", "無障礙步道"],
    penguinTip: "福利類政策的細節常會調整，請以官方公告的最新版本為準。",
  },
  {
    slug: "environment",
    no: "04",
    name: "宜居環境島",
    short: "宜居環境",
    tagline: "乾淨的街道、更多綠地，住得更舒服。",
    intro: "垃圾清運、環境品質、公共空間與綠地，以及面對極端氣候的城市韌性。",
    topics: ["垃圾清運與相關制度", "環境品質", "公共空間與綠地", "城市韌性與生活環境"],
    scenes: ["公園", "街道", "回收設施", "綠色空間"],
    penguinTip: "桃園有很多埤塘，它們也是城市調節雨水的好幫手。",
  },
  {
    slug: "future",
    no: "05",
    name: "未來發展島",
    short: "未來發展",
    tagline: "讓年輕人留下來，也讓城市長出新機會。",
    intro: "青年就業與創業、產業發展、教育與文化，以及體育、創新與城市發展。",
    topics: ["青年就業與創業", "產業發展", "教育與文化", "體育、創新與城市發展"],
    scenes: ["學校", "創新園區", "商圈", "文化場館"],
    penguinTip: "發展型政策時間比較長，可以留意它有沒有分階段的目標。",
  },
];

export const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c])) as Record<CategorySlug, Category>;

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

/** 每座島的識別色（一定搭配文字標籤，不單靠顏色） */
export const categoryColor: Record<CategorySlug, { base: string; soft: string }> = {
  transport: { base: "#8EC3D5", soft: "#DCEBF0" },
  family: { base: "#F2B39B", soft: "#F9E3D8" },
  health: { base: "#93D0B4", soft: "#DCEFE4" },
  environment: { base: "#A8CF7E", soft: "#E3F0D2" },
  future: { base: "#F5D45E", soft: "#FBF0C8" },
};

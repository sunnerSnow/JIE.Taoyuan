export type PolicyStatus = "proposed" | "researching" | "planned" | "in_progress" | "completed" | "unknown";

export type CategorySlug = "transport" | "family" | "health" | "environment" | "future";

/** 來源類型：候選人政見、政府已核定政策、媒體報導、民眾提案不能混在一起 */
export type SourceType = "candidate" | "government" | "media" | "citizen";

/** 主要來源以外的佐證來源，例如媒體報導或其他平台的同一份文宣 */
export type ExtraSource = { type: SourceType; outlet: string; title: string; url: string; date?: string };

/** 編輯註記：與政見原文分開呈現（規格書第 11 節「區分政策原文、網站摘要與編輯補充」） */
export type EditorNote = { kind: "supplement" | "check" | "clarify"; text: string };

/** 虛構的生活情境：幫讀者想像政見與日常的關係，一定標示「虛構」 */
export type Scenario = { persona: string; district?: string; text: string };

export type Policy = {
  id: string;
  slug: string;
  title: string;
  category: CategorySlug;
  summary: string;
  problemStatement?: string;
  description: string;
  approach?: string[];
  /** 一則政見拆成數個主張、每個主張各有具體做法時使用（例如「藝文四大主張」） */
  pillars?: { title: string; tagline?: string; items: string[] }[];
  audience?: string;
  status: PolicyStatus;
  /** 只有在有可靠來源時才填 */
  timeline?: { label: string; date: string }[];
  sourceTitle: string;
  sourceUrl?: string;
  sourceType: SourceType;
  publishedAt?: string;
  /** 擷取日期：編輯實際查看原始資料的日期（規格書第 11 節） */
  retrievedAt?: string;
  updatedAt: string;
  extraSources?: ExtraSource[];
  notes?: EditorNote[];
  scenarios?: Scenario[];
  faqs?: { q: string; a: string }[];
  related?: string[];
  /** 在島上插畫的第幾個地點（0 起算） */
  spot: number;
  /** 示範資料：正式上線前必須換成可查證的內容 */
  sample?: boolean;
};

export type Category = {
  slug: CategorySlug;
  no: string;
  name: string;
  short: string;
  tagline: string;
  intro: string;
  topics: string[];
  scenes: string[];
  penguinTip: string;
};

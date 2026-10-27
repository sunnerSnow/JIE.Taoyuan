import type { PolicyStatus } from "@/data/types";
import type { IslandPin, SpotPin } from "@/lib/map-data";

export type ExplorePolicy = {
  slug: string;
  title: string;
  summary: string;
  status: PolicyStatus;
  /** 島上的編號（同圖釘） */
  n: number;
  /** 插畫裡對應的建築（圖釘位置） */
  spot: number;
  sample: boolean;
  /** 來源類型的文字（候選人公開政見、媒體報導…） */
  sourceLabel: string;
  sourceTitle: string;
  sourceUrl?: string;
  publishedAt?: string;
  /** 最後查證日期（資料裡的 retrievedAt） */
  verifiedAt?: string;
  updatedAt: string;
  audience?: string;
  /** 主要來源以外的佐證來源數 */
  extraSources: number;
};

export type ExploreIsland = {
  pin: IslandPin;
  tagline: string;
  intro: string;
  topics: string[];
  penguinTip: string;
  soft: string;
  policies: ExplorePolicy[];
  spots: SpotPin[];
};

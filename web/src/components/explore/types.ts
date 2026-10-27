import type { PolicyStatus } from "@/data/types";
import type { IslandPin, SpotPin } from "@/lib/map-data";

export type ExplorePolicy = {
  slug: string;
  title: string;
  summary: string;
  status: PolicyStatus;
  n: number;
  sample: boolean;
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

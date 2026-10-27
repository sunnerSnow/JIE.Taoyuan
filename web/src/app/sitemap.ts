import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { latestPolicies, policies } from "@/data/policies";
import { mainNav, footerNav } from "@/lib/nav";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const latest = latestPolicies(1)[0]?.updatedAt;
  const pages = [...mainNav, ...footerNav].map((n) => n.href).filter((href) => !href.includes("#"));
  return [
    ...pages.map((href) => ({ url: new URL(href, site.url).toString(), lastModified: latest })),
    ...categories.map((c) => ({ url: new URL(`/islands/${c.slug}`, site.url).toString(), lastModified: latest })),
    ...policies.map((p) => ({ url: new URL(`/policies/${p.slug}`, site.url).toString(), lastModified: p.updatedAt })),
  ];
}

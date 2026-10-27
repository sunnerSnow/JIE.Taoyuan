import { NotFoundContent } from "@/components/site/not-found-content";

// 分類或政策 slug 不存在時（notFound()）：已在 (site) 版型裡，頁首頁尾由版型提供
export default function SiteNotFound() {
  return <NotFoundContent />;
}

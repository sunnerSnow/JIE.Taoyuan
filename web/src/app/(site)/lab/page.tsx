import type { Metadata } from "next";
import { Suspense } from "react";
import { type LabGroup, LabApp, LabBoard } from "@/components/lab/lab-app";
import { PageHead } from "@/components/site/page-head";
import { categoryColor } from "@/data/categories";
import { PICKS, labGroups, labThemes } from "@/data/lab";
import { formatDate, shortTitle, sourceName, sourceTypeLabel } from "@/data/policies";
import { pageMetadata } from "@/lib/metadata";

/** 只把活動用得到的欄位傳給瀏覽器 */
const groups: LabGroup[] = labGroups().map(({ category: c, policies }) => ({
  slug: c.slug,
  island: c.name,
  ...labThemes[c.slug],
  color: categoryColor[c.slug],
  policies: policies.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    short: shortTitle(p.title),
    summary: p.summary,
    sourceLabel: sourceTypeLabel[p.sourceType],
    sourceName: sourceName(p.sourceTitle),
    sourceUrl: p.sourceUrl,
    checkedAt: p.retrievedAt,
    checked: p.retrievedAt ? formatDate(p.retrievedAt) : undefined,
    points: [...(p.pillars ?? []).map((x) => ({ title: x.title, items: x.items })), ...(p.approach?.length ? [{ title: "", items: p.approach }] : [])],
  })),
}));
const total = groups.reduce((n, g) => n + g.policies.length, 0);

export const metadata: Metadata = pageMetadata({
  title: "3 分鐘，拼出你心中的桃園",
  description: `企鵝阿爸研究所：${total} 項政見一次攤開，挑你最想了解的 ${PICKS} 項收下積木，拼出一張可以分享的桃園卡。每項政見都附來源與最近確認日期。`,
  path: "/lab",
});

export default function LabPage() {
  return (
    <>
      <PageHead
        title="3 分鐘，拼出你心中的桃園"
        eyebrow="Penguin Lab"
        lead={`企鵝阿爸研究所：${total} 項政見一次攤開，挑你最想了解的 ${PICKS} 項收下積木，拼出一張可以分享的桃園卡。隨時可以放回、重選或離開。`}
      />
      <div className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 sm:py-16">
        {/* 已收下哪幾塊記在網址參數，只有瀏覽器知道：預先產生的頁面先放還沒選的狀態 */}
        <Suspense fallback={<LabBoard groups={groups} picks={PICKS} chosen={[]} />}>
          <LabApp groups={groups} picks={PICKS} />
        </Suspense>
      </div>
    </>
  );
}

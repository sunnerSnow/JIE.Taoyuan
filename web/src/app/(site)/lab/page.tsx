import type { Metadata } from "next";
import { Suspense } from "react";
import { type LabTheme, LabApp, ThemeStep } from "@/components/lab/lab-app";
import { PageHead } from "@/components/site/page-head";
import { categories, categoryColor } from "@/data/categories";
import { PICKS, labThemes, themePolicies } from "@/data/lab";
import { formatDate, shortTitle, sourceName, sourceTypeLabel } from "@/data/policies";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "3 分鐘，拼出你心中的桃園",
  description: "企鵝阿爸研究所：選一個生活主題，看 3 項相關政見、收下桃園積木，拼出一張可以分享的桃園卡。每項政見都附來源與最近確認日期。",
  path: "/lab",
});

/** 只把活動用得到的欄位傳給瀏覽器（政見不足 3 項的主題不列出） */
const themes: LabTheme[] = categories
  .map((c) => ({
    slug: c.slug,
    island: c.name,
    ...labThemes[c.slug],
    color: categoryColor[c.slug],
    policies: themePolicies(c.slug).map((p) => ({
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
  }))
  .filter((t) => t.policies.length >= PICKS);

export default function LabPage() {
  return (
    <>
      <PageHead
        title="3 分鐘，拼出你心中的桃園"
        eyebrow="Penguin Lab"
        lead="企鵝阿爸研究所：選一個生活主題，看 3 項相關政見，收下積木，拼出一張可以分享的桃園卡。隨時可以換主題或離開。"
      />
      <div className="mx-auto max-w-[860px] px-4 py-12 sm:px-6 sm:py-16">
        {/* 網址參數（目前在哪一步）只有瀏覽器知道：預先產生的頁面先放第 1 步 */}
        <Suspense fallback={<ThemeStep themes={themes} />}>
          <LabApp themes={themes} picks={PICKS} />
        </Suspense>
      </div>
    </>
  );
}

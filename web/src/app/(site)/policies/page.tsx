import type { Metadata } from "next";
import { Suspense } from "react";
import { PolicyBrowser } from "@/components/policy/policy-browser";
import { PolicyCard } from "@/components/policy/policy-card";
import { PageHead } from "@/components/site/page-head";
import { SampleNotice } from "@/components/site/sample-notice";
import { policies } from "@/data/policies";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "政策總覽",
  description: "用關鍵字、分類與狀態找桃園政策。每一項都標示來源類型、目前狀態與更新日期。",
  path: "/policies",
});

export default function PoliciesPage() {
  return (
    <>
      <PageHead
        title="政策總覽"
        eyebrow="All Policies"
        lead="不想逛地圖？這裡把所有政策攤開來。用關鍵字、分類或狀態篩選，每一項都附上來源與更新日期。"
      />
      <section aria-label="政策清單" className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16">
        <SampleNotice className="mb-8" />
        {/* 篩選器讀網址參數，在瀏覽器端渲染；載入前（或沒有 JS 時）先給完整清單 */}
        <Suspense fallback={<AllPolicies />}>
          <PolicyBrowser policies={policies} />
        </Suspense>
      </section>
    </>
  );
}

function AllPolicies() {
  return (
    <>
      <p className="text-[15px] font-bold">全部 {policies.length} 項政策</p>
      <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {policies.map((p) => (
          <li key={p.id}>
            <PolicyCard policy={p} />
          </li>
        ))}
      </ul>
    </>
  );
}

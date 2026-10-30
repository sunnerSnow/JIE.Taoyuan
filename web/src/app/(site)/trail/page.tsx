import type { Metadata } from "next";
import Image from "next/image";
import { PageHead } from "@/components/site/page-head";
import { type TrailItem, TrailExplorer } from "@/components/trail/trail-explorer";
import { formatDay, policies, shortTitle } from "@/data/policies";
import { districts, trail, trailKindLabel } from "@/data/trail";
import { pageMetadata } from "@/lib/metadata";
import { candidateFull } from "@/lib/seo";

// 杰伴出發（JIE GO!）：已經發生的行程，畫在桃園 13 區地圖上（去過的區放企鵝腳丫）。資料在 data/trail.ts，整理規則見 /sync-official。

export const metadata: Metadata = pageMetadata({
  title: "杰伴出發：行程地圖與紀錄",
  description: `${candidateFull}走訪過的地方與參加過的活動，畫在桃園 13 區地圖上並依日期整理，每一筆都附候選人官方貼文或媒體報導。`,
  path: "/trail",
});

/** 只把清單與地圖用得到的欄位傳給瀏覽器 */
const items: TrailItem[] = trail.map((t) => ({
  ...t,
  day: formatDay(t.date),
  kindLabel: trailKindLabel[t.kind],
  policies: (t.policies ?? []).map((slug) => ({ slug, title: shortTitle(policies.find((p) => p.slug === slug)!.title) })),
}));

export default function TrailPage() {
  return (
    <>
      <PageHead
        title="杰伴出發"
        eyebrow="JIE GO!"
        lead={
          <>
            <strong className="block text-[19px] font-black tracking-[0.06em] text-ink">下一站，和世杰一起！</strong>
            <span className="mt-2 block">走訪過的地方與參加過的活動，畫在桃園 13 區地圖上，有企鵝腳丫的區就是去過的地方。每一筆都附原始貼文或報導。</span>
          </>
        }
      >
        {/* 插畫「桃園動起來！」（已去背）：寬螢幕放在標題右邊的空位，窄螢幕接在導言下面 */}
        <Image
          src="/lab/trail-hero.png"
          alt=""
          width={640}
          height={641}
          loading="eager"
          sizes="(min-width: 1024px) 340px, 240px"
          className="pointer-events-none ml-auto mt-6 block w-60 sm:w-64 lg:absolute lg:bottom-0 lg:right-6 lg:mt-0 lg:w-[340px]"
        />
      </PageHead>
      <div className="mx-auto max-w-[1080px] px-4 py-12 sm:px-6 sm:py-16">
        <p className="rounded-2xl border-2 border-dashed border-teal-deep/40 px-5 py-4 text-[14.5px] font-bold leading-relaxed text-ink-soft">
          整理自候選人官方帳號與主流媒體報導中、已經發生的行程，不代表全部行程，也不預告接下來的行程。地點後面的區名是本站依地點歸類。
        </p>
        <TrailExplorer items={items} districts={districts} />
        <p className="mt-14 text-[12.5px] leading-relaxed text-ink-soft">地圖行政區界：內政部國土測繪中心鄉鎮市區界線（政府資料開放授權條款），經 taiwan-atlas 轉換、本站簡化。</p>
      </div>
    </>
  );
}

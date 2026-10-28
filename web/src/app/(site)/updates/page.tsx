import type { Metadata } from "next";
import Link from "next/link";
import { PenguinSays } from "@/components/art/speech";
import { PageHead } from "@/components/site/page-head";
import { ArrowRight } from "@/components/ui/decor";
import { categoryColor } from "@/data/categories";
import { type ChangeEntry, type ChangeType, changeTypeInfo, changelog } from "@/data/changelog";
import { formatDate, getPolicy, shortTitle } from "@/data/policies";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "更新紀錄",
  description: "杰伴情報站：本站新增、修正、更新來源與重新確認過的內容，依日期列出，並連到相關政見。",
  path: "/updates",
});

/** 類型標籤的底色；類型名稱一律寫出來，不只靠顏色區分 */
const typeTone: Record<ChangeType, string> = {
  added: "bg-mint",
  corrected: "bg-peach",
  source: "bg-sun-soft",
  reverified: "bg-mist",
};

function byDate(list: ChangeEntry[]) {
  const groups = new Map<string, ChangeEntry[]>();
  for (const c of list) groups.set(c.date, [...(groups.get(c.date) ?? []), c]);
  return [...groups.entries()];
}

/** slug 打錯時直接讓 build 失敗，不默默少一個連結 */
function policyOf(slug: string) {
  const p = getPolicy(slug);
  if (!p) throw new Error(`changelog 找不到政見：${slug}`);
  return p;
}

export default function UpdatesPage() {
  const days = byDate(changelog);
  return (
    <>
      <PageHead
        title="更新紀錄"
        eyebrow="Updates"
        lead="杰伴情報站：本站新增、修正、更新來源或重新確認過的內容，都記在這裡。這裡的日期是本站更新的日期；政見本身是什麼時候提出的，請看各政見頁的「發布日期」。"
      >
        <dl className="mt-8 grid max-w-3xl gap-2 sm:grid-cols-2">
          {(Object.keys(changeTypeInfo) as ChangeType[]).map((t) => (
            <div key={t} className="flex items-start gap-3 rounded-2xl border-2 border-edge bg-paper px-4 py-3">
              <dt className={`shrink-0 rounded-full px-2.5 py-0.5 text-[12.5px] font-black tracking-[0.08em] text-ink ${typeTone[t]}`}>{changeTypeInfo[t].label}</dt>
              <dd className="text-[13.5px] leading-relaxed text-ink-soft">{changeTypeInfo[t].desc}</dd>
            </div>
          ))}
        </dl>
      </PageHead>

      <div className="mx-auto max-w-[900px] space-y-14 px-4 py-14 sm:px-6 sm:py-20">
        {days.map(([date, entries]) => (
          <section key={date} aria-labelledby={`day-${date}`}>
            <h2 id={`day-${date}`} className="flex items-baseline gap-3">
              <time dateTime={date} className="font-display text-[28px] leading-none text-teal-deep">
                {formatDate(date)}
              </time>
              <span className="text-[13.5px] font-bold text-ink-soft">{entries.length} 筆更新</span>
            </h2>
            <ol className="mt-5 space-y-4 border-l-2 border-dashed border-teal-deep/25 pl-5 sm:pl-7">
              {entries.map((c) => (
                <li key={c.id} id={c.id} className="relative scroll-mt-28 rounded-[22px] border-2 border-edge bg-paper p-5 shadow-soft sm:p-6">
                  <span className="absolute -left-[29px] top-7 h-3.5 w-3.5 rounded-full border-2 border-edge bg-sun sm:-left-[37px]" aria-hidden="true" />
                  <p className={`w-fit rounded-full px-2.5 py-0.5 text-[12.5px] font-black tracking-[0.08em] text-ink ${typeTone[c.type]}`}>{changeTypeInfo[c.type].label}</p>
                  <h3 className="mt-3 text-[18px] font-black leading-snug tracking-[0.05em]">{c.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.85] text-ink-soft">{c.summary}</p>
                  {c.policies && c.policies.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2" aria-label="相關政見">
                      {c.policies.map(policyOf).map((p) => (
                        <li key={p.slug}>
                          <Link
                            href={`/policies/${p.slug}`}
                            className="inline-flex min-h-10 items-center gap-2 rounded-full border-2 border-edge bg-paper px-3.5 py-1 text-[13.5px] font-bold hover:bg-mint"
                          >
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full border-[1.5px] border-edge" style={{ background: categoryColor[p.category].base }} aria-hidden="true" />
                            {shortTitle(p.title)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {c.links && c.links.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                      {c.links.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} className="inline-flex items-center gap-1 text-[14px] font-bold text-teal-deep hover:underline">
                            {l.label}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ))}

        <PenguinSays pose="point" penguinClassName="h-24 w-20" bubbleClassName="text-[14px]">
          每一項政策都附上原始來源。內容和原文對不上時，請以原始來源為準。
        </PenguinSays>
      </div>
    </>
  );
}

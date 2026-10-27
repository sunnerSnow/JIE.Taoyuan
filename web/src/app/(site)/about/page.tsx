import type { Metadata } from "next";
import Link from "next/link";
import { PenguinSays } from "@/components/art/speech";
import { PageHead } from "@/components/site/page-head";
import { Scallop } from "@/components/ui/decor";
import { formatDate, sourceTypeLabel } from "@/data/policies";
import type { SourceType } from "@/data/types";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "關於本站",
  description: "JIE.Taoyuan 杰伴桃園的理念、網站立場與維護、政策資料來源與更新說明，以及資料更正方式。",
  path: "/about",
});

const brandIdeas = [
  { char: "杰", text: "與「世杰」形成文字連結。" },
  { char: "伴", text: "陪伴市民探索城市議題，讓政策更貼近日常生活。" },
  { char: "桃", text: "明確指出這是一個以桃園為核心的城市專案。" },
  { char: "島", text: "把政策分類變成可點擊、可理解的城市場景。" },
];

const sourceTypeDesc: Record<SourceType, string> = {
  candidate: "候選人在競選期間公開提出的主張與承諾，代表方向，不等於政府已經決定要做。",
  government: "經市府核定、公告或編列預算的政策與計畫。",
  media: "新聞媒體的報導內容，會註明媒體名稱與報導日期。",
  citizen: "市民提出的建議或提案（第二階段開放），不代表已被採納。",
};

const process = [
  "蒐集官方公告、候選人公開政見或其他可追溯來源。",
  "記錄原始網址、發布日期與擷取日期。",
  "區分政策原文、網站摘要與編輯補充。",
  "核對政策狀態與具體數字。",
  "發布後保留更新紀錄。",
  "發現錯誤時更正內容，並標示更新時間。",
];

export default function AboutPage() {
  return (
    <>
      <PageHead title="關於本站" eyebrow="About" lead={site.tagline}>
        <nav aria-label="本頁目錄" className="mt-8">
          <ul className="flex flex-wrap gap-2 text-[14px] font-bold">
            {[
              ["#vision", "網站理念"],
              ["#organizer", "網站立場與維護"],
              ["#sources", "資料來源與更新說明"],
              ["#assets", "素材與授權"],
              ["#corrections", "資料更正"],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="inline-flex min-h-10 items-center rounded-full border-2 border-edge bg-paper px-4 hover:bg-mint">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHead>

      <div className="mx-auto max-w-[900px] space-y-16 px-4 py-14 sm:px-6 sm:py-20">
        <Section id="vision" title="網站理念">
          <p>
            JIE.Taoyuan 把桃園想像成一座可以探索的「政策島」。你不必先讀完大量政見文字，而是從交通、育兒、健康照顧、宜居環境、青年與城市發展等生活場景進入，理解政策要解決什麼問題、提出哪些做法，以及目前有什麼公開資料可以查證。
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {brandIdeas.map((b) => (
              <li key={b.char} className="flex items-center gap-4 rounded-2xl border-2 border-edge bg-paper p-4">
                <Scallop size={52} className="text-[20px] !font-sans">
                  <span className="font-black">{b.char}</span>
                </Scallop>
                <span className="text-[14.5px] leading-relaxed">{b.text}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="organizer" title="網站立場與維護">
          <dl className="grid grid-cols-[6em_1fr] gap-x-4 gap-y-2 rounded-2xl border-2 border-edge bg-paper p-5">
            <dt className="font-bold text-ink">支持候選人</dt>
            <dd>
              {site.candidate.office} {site.candidate.ballotNo} 號 {site.candidate.name}
              <span className="block text-[13.5px]">
                號次依據：
                <a href={site.candidate.ballotSource.url} target="_blank" rel="noopener noreferrer" className="link-ink text-ink">
                  {site.candidate.ballotSource.title}
                  <span className="sr-only">（另開新視窗）</span>
                </a>
                ・<time dateTime={site.candidate.ballotSource.date}>{formatDate(site.candidate.ballotSource.date)}</time>
              </span>
            </dd>
            <dt className="font-bold text-ink">維護者</dt>
            <dd>{site.organizer}</dd>
          </dl>
          <p className="mt-4">{site.stanceLong}</p>
        </Section>

        <Section id="sources" title="資料來源與更新說明">
          <p>不同來源會清楚標示，不混為一談。每一項政策的詳情頁都會列出來源類型、原始資料、發布日期與最後更新日期。</p>
          <dl className="mt-6 space-y-3">
            {(Object.keys(sourceTypeLabel) as SourceType[]).map((t) => (
              <div key={t} className="rounded-2xl border-2 border-edge bg-paper p-4">
                <dt className="font-black text-ink">{sourceTypeLabel[t]}</dt>
                <dd className="mt-1 text-[14.5px]">{sourceTypeDesc[t]}</dd>
              </div>
            ))}
          </dl>
          <h3 className="mt-10 text-[17px] font-black tracking-[0.06em] text-ink">每一筆內容的編輯流程</h3>
          <ol className="mt-4 space-y-3">
            {process.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-edge bg-sun text-[13px] font-black text-ink" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6">
            政策狀態必須由可查證的公開資料支持；找不到時一律標示「暫無可查證進度」。狀態定義請見
            <Link href="/progress" className="link-ink mx-1 font-bold text-ink">
              政見追蹤
            </Link>
            。
          </p>
        </Section>

        <Section id="assets" title="素材與授權">
          <p>
            網站上的企鵝阿爸與島嶼插畫目前是原創的暫代圖，用來呈現版型與互動。正式上線前，角色、照片、標誌與文字素材都會先確認使用授權，再替換成正式版本。
          </p>
        </Section>

        <Section id="corrections" title="資料更正">
          <p>資料有誤或原始來源失效時，我們會更正內容，並在政策頁面標示新的更新日期。</p>
          <PenguinSays pose="wave" className="mt-6" penguinClassName="h-24 w-20" bubbleClassName="text-[14px]">
            市民提問表單會在第二階段開放，敬請期待！
          </PenguinSays>
        </Section>
      </div>
    </>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="flex items-center gap-3 text-[24px] font-black tracking-[0.08em]">
        <span className="h-6 w-1.5 rounded-full bg-teal" aria-hidden="true" />
        {title}
      </h2>
      <div className="mt-5 text-[15.5px] leading-[1.9] text-ink-soft">{children}</div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/site/page-head";
import { formatDate } from "@/data/policies";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "隱私權政策",
  description: "JIE.Taoyuan 如何處理你的資料：不需註冊、不使用追蹤廣告；在「杰個願望」留言時存哪些資料、怎麼防止濫用。",
  path: "/privacy",
});

const UPDATED = "2026-11-09";

/** 瀏覽器本機儲存的項目：新增 localStorage 時要同步補在這裡 */
const storageKeys = [
  { name: "jt-intro-v1", use: "是否看過企鵝阿爸的導覽，看過就不再自動跳出。" },
  { name: "jt-motion", use: "你在地圖上選擇開或關動畫。" },
  { name: "jw-liked", use: "你在「杰個願望」按過「認同」的留言，讓愛心保持實心。" },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHead title="隱私權政策" eyebrow="Privacy" lead="我們盡量少蒐集資料。下面說明本站會記錄什麼、為什麼，以及你可以怎麼做。">
        <p className="mt-6 text-[13.5px] font-bold">
          最後更新：<time dateTime={UPDATED}>{formatDate(UPDATED)}</time>
        </p>
      </PageHead>

      <div className="mx-auto max-w-[820px] space-y-12 px-4 py-14 text-[15.5px] leading-[1.9] text-ink-soft sm:px-6 sm:py-20">
        <Item title="不需註冊，不使用追蹤廣告">
          <p>瀏覽本站不需要建立帳號，也沒有任何表單會要求你填寫姓名、電話或身分證字號。本站不使用追蹤型廣告。唯一會存下你輸入內容的地方是「杰個願望」，說明在下面。</p>
        </Item>

        <Item title="杰個願望的留言" id="wish">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink">存下的內容：</strong>
              你選的留言類型、標題、內容、議題、行政區、顯示名稱、公開方式，以及送出時間和認同數。行政區、顯示名稱可以不填，不填就顯示「匿名桃園市民」。
            </li>
            <li>
              <strong className="text-ink">誰看得到：</strong>
              選「公開在願望牆」的留言所有人都看得到；選「只給團隊參考」、沒通過自動檢查或被下架的留言，只有杰伴桃園志工團隊在管理頁面看得到。
            </li>
            <li>
              <strong className="text-ink">IP 位址：</strong>
              送出、認同、檢舉時，會把連線的 IP 位址加上密鑰轉成無法還原的代碼（雜湊），用來限制送出頻率、防止灌讚；不會存原本的 IP。頻率紀錄兩天後刪除；認同與檢舉的紀錄（含這個代碼）跟著留言保存，留言刪除時一起刪除。
            </li>
            <li>
              <strong className="text-ink">Cookie：</strong>
              第一次按「認同」或檢舉時，瀏覽器會存一個隨機代碼 <code className="rounded bg-mist px-1.5 py-0.5 text-[13px] text-ink">jw_visitor</code>
              （一年），只用來確認同一個瀏覽器不會重複認同、重複檢舉，不用來追蹤你在其他網站的活動。
            </li>
            <li>
              <strong className="text-ink">人機驗證：</strong>
              送出留言前會經過 Cloudflare Turnstile 驗證是不是真人，Cloudflare 會依
              <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="link-ink mx-1 font-bold text-ink">
                它的隱私權政策
                <span className="sr-only">（在新視窗開啟）</span>
              </a>
              處理驗證需要的瀏覽器資訊。
            </li>
            <li>
              <strong className="text-ink">存放與刪除：</strong>
              留言存放在 Neon 提供的雲端資料庫，直到被刪除或本站停止運作。沒通過自動檢查的留言不公開，但會保存，讓志工團隊檢查有沒有誤擋；因為含個人資料而被擋下的，不保存原文。想刪除自己公開的留言，請在那則留言的頁面按「檢舉這則留言」，選「這是我寫的，想刪除」，志工團隊會處理。
            </li>
          </ul>
          <p className="mt-3">
            請不要在留言裡寫自己或他人的電話、身分證字號、email、住址；系統會自動擋下看起來像個人資料的內容。留言規範見
            <Link href="/wish#rules" className="link-ink mx-1 font-bold text-ink">
              杰個願望
            </Link>
            。
          </p>
        </Item>

        <Item title="瀏覽器本機儲存">
          <p>本站會在你的瀏覽器記住下面這些設定，下次進來不用重新選：</p>
          <ul className="mt-3 space-y-2">
            {storageKeys.map((k) => (
              <li key={k.name} className="flex items-start gap-3">
                <code className="mt-0.5 shrink-0 rounded bg-mist px-1.5 py-0.5 text-[13px] text-ink">{k.name}</code>
                <span>{k.use}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3">這些設定只存在你的瀏覽器，不會傳送給我們；清除瀏覽器的網站資料就會刪除。</p>
        </Item>

        <Item title="伺服器紀錄">
          <p>本站架設在 Vercel。和大多數網站一樣，主機服務商可能會為了安全與維運，自動記錄連線時間、IP 位址與瀏覽器類型等技術資料。本站不會用這些紀錄辨識個人身分，保存期間依主機服務商的規範。</p>
        </Item>

        <Item title="網站分析">
          <p>本站目前沒有使用網站分析工具。若日後為了改善網站而導入，會先更新本頁，說明蒐集的項目、用途與退出方式，並採用符合隱私要求的做法。</p>
        </Item>

        <Item title="外部連結">
          <p>政策詳情頁會連到原始資料來源，例如政府公告或媒體報導。離開本站後，請參考該網站自己的隱私權政策。</p>
        </Item>

      </div>
    </>
  );
}

function Item({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-[20px] font-black tracking-[0.08em] text-ink">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

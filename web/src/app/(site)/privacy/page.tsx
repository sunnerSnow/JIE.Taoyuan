import type { Metadata } from "next";
import { PageHead } from "@/components/site/page-head";
import { formatDate } from "@/data/policies";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "隱私權政策",
  description: "JIE.Taoyuan 如何處理你的瀏覽資料：不需註冊、不使用追蹤廣告，只在你的瀏覽器記住是否看過導覽。",
  path: "/privacy",
});

const UPDATED = "2026-10-27";

export default function PrivacyPage() {
  return (
    <>
      <PageHead title="隱私權政策" eyebrow="Privacy" lead="我們盡量少蒐集資料。下面說明本站會記錄什麼、為什麼，以及你可以怎麼做。">
        <p className="mt-6 text-[13.5px] font-bold">
          最後更新：<time dateTime={UPDATED}>{formatDate(UPDATED)}</time>
        </p>
      </PageHead>

      <div className="mx-auto max-w-[820px] space-y-12 px-4 py-14 text-[15.5px] leading-[1.9] text-ink-soft sm:px-6 sm:py-20">
        <p role="note" className="rounded-2xl border-2 border-dashed border-coral bg-paper px-4 py-3 text-[14px]">
          <strong className="text-coral">草稿：</strong>
          本頁內容需在正式上線前，由網站主辦單位依《個人資料保護法》與實際使用的主機、分析服務確認後定稿。
        </p>

        <Item title="不需註冊，不蒐集個人資料">
          <p>瀏覽本站不需要建立帳號，也沒有任何表單會要求你填寫姓名、電話或身分證字號。本站不使用追蹤型廣告。</p>
        </Item>

        <Item title="瀏覽器本機儲存">
          <p>
            第一次進入「探索政策島」時，企鵝阿爸會跳出導覽說明。看完後，瀏覽器會在你的裝置上記住一個標記（名稱為 <code className="rounded bg-mist px-1.5 py-0.5 text-[13px] text-ink">jt-intro-v1</code>），下次就不再自動跳出。這個標記只存在你的瀏覽器，不會傳送給我們；清除瀏覽器網站資料即可刪除。
          </p>
        </Item>

        <Item title="伺服器紀錄">
          <p>和大多數網站一樣，網站主機服務商可能會為了安全與維運，自動記錄連線時間、IP 位址與瀏覽器類型等技術資料。這些紀錄不會用於辨識個人身分，保存期間依主機服務商的規範。</p>
        </Item>

        <Item title="網站分析">
          <p>本站目前沒有使用網站分析工具。若日後為了改善網站而導入，會先更新本頁，說明蒐集的項目、用途與退出方式，並採用符合隱私要求的做法。</p>
        </Item>

        <Item title="外部連結">
          <p>政策詳情頁會連到原始資料來源，例如政府公告或媒體報導。離開本站後，請參考該網站自己的隱私權政策。</p>
        </Item>

        <Item title="聯絡我們">
          <p>
            對本政策有任何疑問，請寫信到
            <a href={`mailto:${site.contactEmail}`} className="link-ink mx-1 font-bold text-ink">
              {site.contactEmail}
            </a>
            。
          </p>
        </Item>
      </div>
    </>
  );
}

function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[20px] font-black tracking-[0.08em] text-ink">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

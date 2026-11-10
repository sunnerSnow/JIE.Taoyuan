import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Penguin } from "@/components/art/penguin";
import { PenguinSays } from "@/components/art/speech";
import { PageHead } from "@/components/site/page-head";
import { LikeButton } from "@/components/wish/like-button";
import { ReportButton } from "@/components/wish/report-button";
import { NOTE_STYLE } from "@/components/wish/wish-art";
import { ResponseBadge, TypeTag, WishSticker, wishDate } from "@/components/wish/wish-note";
import { wishConfig } from "@/lib/wish/config";
import { ANONYMOUS_NAME, isWishId, REPLY_NAME, topicLabel } from "@/lib/wish/options";
import { getPublicWish } from "@/lib/wish/store";

// 單則願望是使用者寫的內容：不讓搜尋引擎收錄，避免被拿來洗內容
export const metadata: Metadata = {
  title: "一則杰個願望",
  description: "杰個願望 JIE WISH：每個願望，都值得被聽見。",
  robots: { index: false, follow: true },
};

// 留言代碼建置時不知道，網址（頁首的 usePathname）要到請求時才有：整頁在請求時產生
export const instant = false;

export default function WishDetailPage({ params }: PageProps<"/wish/[id]">) {
  const cfg = wishConfig();
  return (
    <>
      <PageHead title="願望內容" eyebrow="JIE WISH" crumbs={[{ href: "/wish", label: "杰個願望" }]} />
      <div className="mx-auto max-w-[820px] px-4 py-12 sm:px-6 sm:py-16">
        <Suspense fallback={<div className="h-72 rounded-[14px] bg-mist/50" aria-hidden="true" />}>
          <WishDetail params={params} open={cfg.open} readable={cfg.readable} />
        </Suspense>
        <Link href="/wish#wall" className="link-ink mt-12 inline-block text-[15px] font-black text-ink">
          <span aria-hidden="true">←</span> 回到願望牆
        </Link>
      </div>
    </>
  );
}

async function WishDetail({ params, open, readable }: { params: PageProps<"/wish/[id]">["params"]; open: boolean; readable: boolean }) {
  const { id } = await params;
  if (!readable || !isWishId(id)) notFound();
  const data = await getPublicWish(id);
  if (!data) notFound();
  const { wish: w, replies } = data;

  return (
    <>
      <article className="relative rounded-[14px] border-2 border-edge px-6 pb-6 pt-8 shadow-soft sm:px-9" style={{ background: NOTE_STYLE[w.type].paper }}>
        <span aria-hidden="true" className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 rounded-[3px] bg-white/75 shadow-[0_1px_3px_rgb(0_90_85/0.15)]" />
        {w.sticker && <WishSticker sticker={w.sticker} size={104} tilt={10} className="-right-5 -top-12 h-[104px] w-[104px]" />}
        <div className="flex flex-wrap items-center gap-2">
          <TypeTag type={w.type} />
        </div>
        {w.title && <h2 className="mt-4 text-[clamp(22px,3vw,28px)] font-black leading-snug tracking-[0.04em]">{w.title}</h2>}
        <p className="mt-4 whitespace-pre-line text-[17px] leading-[2] text-ink">{w.content}</p>
        {w.topic && <p className="mt-4 text-[14px] font-bold text-teal-deep">#{topicLabel(w.topic)}</p>}
        <p className="mt-2 text-[14px] font-bold text-ink-soft">
          {w.displayName ?? ANONYMOUS_NAME} · <time dateTime={w.createdAt}>{wishDate(w.createdAt)}</time>
          {w.district && ` · ${w.district}`}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-ink/10 pt-4">
          <LikeButton id={w.id} count={w.likeCount} disabled={!open} large />
          <ResponseBadge status={w.responseStatus} />
        </div>
      </article>

      <section aria-labelledby="reply-title" className="mt-12">
        <h2 id="reply-title" className="text-[22px] font-black tracking-[0.08em]">
          志工團隊回覆
        </h2>
        {replies.length ? (
          <ul className="mt-6 space-y-6">
            {replies.map((r) => (
              <li key={r.id} className="flex items-start gap-3">
                <Penguin pose="stand" className="h-20 w-16 shrink-0" />
                <div className="min-w-0 flex-1 rounded-[20px] border-2 border-edge bg-paper px-5 py-4 shadow-soft">
                  <p className="text-[14px] font-black text-teal-deep">
                    {REPLY_NAME}回覆 · <time dateTime={r.createdAt}>{wishDate(r.createdAt)}</time>
                  </p>
                  <p className="mt-2 whitespace-pre-line text-[15.5px] leading-[1.9]">{r.content}</p>
                  {r.linkUrl && (
                    <a href={r.linkUrl} target="_blank" rel="noopener noreferrer nofollow" className="link-ink mt-3 inline-block text-[14.5px] font-black text-ink">
                      {r.linkLabel || "相關資訊"}
                      <span className="sr-only">（在新視窗開啟）</span>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <PenguinSays pose="stand" className="mt-4" penguinClassName="h-24 w-20" bubbleClassName="max-w-md">
            目前還沒有回覆。有回覆的話，會寫在這裡。
          </PenguinSays>
        )}
        <p className="mt-6 text-[13.5px] leading-[1.8] text-ink-soft">回覆由{REPLY_NAME}撰寫。本站是支持者自發經營的非官方網站，回覆不代表候選人或競選團隊。</p>
      </section>

      <div className="mt-10">
        <ReportButton id={w.id} disabled={!open} />
      </div>
    </>
  );
}

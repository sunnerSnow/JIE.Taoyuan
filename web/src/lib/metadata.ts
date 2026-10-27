import type { Metadata } from "next";
import { site } from "./site";

/** 與 app/opengraph-image.png 同一張分享圖（alt 文字同 opengraph-image.alt.txt） */
const SHARE_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "JIE.Taoyuan 杰伴桃園：桃園的未來，一起來探索。五座政策島插畫與導覽角色企鵝阿爸。",
};

/**
 * 內頁的 metadata。openGraph／twitter 是「淺層合併」：頁面一定義就會整個蓋掉根版型的設定，
 * 所以站名、語系、網址與分享圖統一在這裡補齊，讓每一頁分享出去都有自己的標題和圖。
 */
export function pageMetadata({
  title,
  description,
  path,
  article,
  ownImage = false,
}: {
  title: string;
  description: string;
  path: string;
  article?: { publishedTime?: string; modifiedTime?: string };
  /** 這個路由有自己的 opengraph-image／twitter-image 檔案：不指定 images，讓檔案慣例填入（明寫的 images 會蓋過它） */
  ownImage?: boolean;
}): Metadata {
  // 有自己的分享圖時連 images 這個鍵都不能出現（images: undefined 也會蓋掉檔案慣例）
  const images = ownImage ? {} : { images: [SHARE_IMAGE] };
  const shareTitle = `${title}｜${site.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...(article ? { type: "article", ...article } : { type: "website" }),
      locale: "zh_TW",
      siteName: site.name,
      url: path,
      title: shareTitle,
      description,
      ...images,
    },
    twitter: { card: "summary_large_image", title: shareTitle, description, ...images },
  };
}

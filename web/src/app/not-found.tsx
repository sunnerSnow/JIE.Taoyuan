import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { NotFoundContent } from "@/components/site/not-found-content";

// 對不到任何路由的網址：不在 (site) 版型裡，自己帶頁首頁尾
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </>
  );
}

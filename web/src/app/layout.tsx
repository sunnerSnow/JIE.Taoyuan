import type { Metadata, Viewport } from "next";
import "@fontsource-variable/chiron-goround-tc/wght.css";
import "@fontsource-variable/fredoka/wght.css";
import "./globals.css";
import { JsonLd } from "@/components/site/json-ld";
import { siteGraph } from "@/lib/jsonld";
import { homeTitle, siteDescription } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: homeTitle,
    template: `%s｜${site.name}`,
  },
  description: siteDescription,
  applicationName: site.name,
  // Google Search Console「網址前置字元」資源 https://jie-taoyuan.vercel.app/ 的 HTML 標記驗證
  verification: { google: "eRiWH3LL8GIF0jPNvX3Gwr_eqsd9n4C0URspJ8YIER8" },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: site.name,
    title: homeTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#E8F5F4",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant-TW">
      <body>
        <JsonLd data={siteGraph(siteDescription)} />
        <a href="#main" className="skip-link">
          跳到主要內容
        </a>
        {children}
      </body>
    </html>
  );
}

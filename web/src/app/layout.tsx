import type { Metadata, Viewport } from "next";
import "@fontsource-variable/chiron-goround-tc/wght.css";
import "@fontsource-variable/fredoka/wght.css";
import "./globals.css";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}｜${site.tagline}`,
    template: `%s｜${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: site.name,
    title: `${site.name}｜${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name}｜${site.tagline}`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#E8F5F4",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant-TW">
      <body>
        <a href="#main" className="skip-link">
          跳到主要內容
        </a>
        {children}
      </body>
    </html>
  );
}

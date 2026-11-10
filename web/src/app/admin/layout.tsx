import type { Metadata } from "next";
import Link from "next/link";

// 後台：不放網站頁首頁尾，不讓搜尋引擎收錄。
// 登入檢查不放在這裡：每一頁都要自己呼叫 isAdmin()，每個後台動作也要（新增頁面時別漏）
export const metadata: Metadata = {
  title: "杰個願望後台",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b-2 border-edge bg-paper">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin/wishes" className="text-[17px] font-black tracking-[0.08em]">
            杰個願望後台
          </Link>
          <Link href="/wish" className="link-ink text-[14px] font-bold text-ink">
            看前台願望牆
          </Link>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}

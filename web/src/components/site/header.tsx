"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { mainNav } from "@/lib/nav";
import { Penguin } from "@/components/art/penguin";
import { ArrowCurve } from "@/components/ui/decor";
import { ElectionCountdown } from "./election-countdown";
import { Logo } from "./logo";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // 換頁時頁面會被 Activity 保留，選單要在隱藏時關掉
  useLayoutEffect(() => () => setOpen(false), []);

  // 往下捲後給頁首一條底色，內容才不會從名牌與選單之間的縫隙被切掉
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    document.documentElement.dataset.menuOpen = "true";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      delete document.documentElement.dataset.menuOpen;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    // 不用 backdrop-filter：它會讓手機選單的 position: fixed 改以頁首為基準
    <header
      className={`fixed inset-x-0 top-0 z-40 px-3 pb-3 pt-3 transition-[background-color,box-shadow] duration-300 sm:px-5 sm:pt-4 ${
        scrolled ? "bg-cream/95 shadow-soft" : "pointer-events-none"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
        <Link
          href="/"
          className="pointer-events-auto rounded-2xl border-2 border-edge bg-paper px-2.5 py-1.5 sm:px-3 shadow-soft transition-transform hover:-translate-y-0.5"
          aria-label="JIE.Taoyuan 杰伴桃園 首頁"
        >
          <Logo />
        </Link>

        <nav aria-label="主選單" className="pointer-events-auto hidden items-center rounded-full border-2 border-edge bg-paper px-2 py-1.5 lg:flex">
          {mainNav.slice(1).map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-[15px] font-bold tracking-[0.08em] transition-colors ${
                  active ? "bg-teal-deep text-paper" : "hover:bg-mint"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pointer-events-auto flex items-center gap-2">
          <span className="hidden xl:block">
            <ElectionCountdown />
          </span>
          <Link href="/explore" className="btn btn-sun btn-sm hidden sm:inline-flex">
            開始探索
            <ArrowCurve className="h-4 w-4" />
          </Link>
          <button
            ref={menuBtnRef}
            type="button"
            className="btn btn-sm whitespace-nowrap !px-2.5 sm:!px-3 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
            </svg>
            選單
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="網站選單"
          className="pointer-events-auto fixed inset-0 z-50 overflow-y-auto bg-mist lg:hidden"
        >
          <div className="flex items-center justify-between px-3 pt-3 sm:px-5 sm:pt-4">
            <Logo />
            <button ref={closeRef} type="button" className="btn btn-sm" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
              </svg>
              關閉
            </button>
          </div>
          <nav aria-label="主選單" className="px-5 pb-10 pt-8">
            <ul className="space-y-3">
              {mainNav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onNavigate={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between rounded-2xl border-2 border-edge px-5 py-4 shadow-soft ${
                        active ? "bg-sun" : "bg-paper"
                      }`}
                    >
                      <span className="text-[20px] font-black tracking-[0.08em]">{item.label}</span>
                      <span className="eyebrow">{item.en}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-10 flex items-end gap-3">
              <Penguin pose="wave" className="h-28 w-24 shrink-0" />
              <p className="relative mb-10 rounded-2xl border-2 border-edge bg-paper px-4 py-3 text-[15px] font-bold leading-relaxed">
                想從哪座島開始逛？選不出來就先去「探索政策島」吧！
              </p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

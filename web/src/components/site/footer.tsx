import Link from "next/link";
import { categories } from "@/data/categories";
import { footerNav, mainNav } from "@/lib/nav";
import { site } from "@/lib/site";
import { ArrowCurve, Cloud, PinIcon } from "@/components/ui/decor";
import { BallotBadge } from "./ballot-badge";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t-2 border-edge bg-mist">
      <Cloud className="anim-bob absolute left-[8%] top-10 hidden w-32 md:block" />
      <Cloud className="anim-bob absolute right-[3%] top-8 hidden w-20 [animation-delay:-2s] md:block" />

      <div className="relative mx-auto grid max-w-[1200px] gap-12 px-4 pb-10 pt-20 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-24">
        <div>
          <Logo />
          <p className="mt-6 max-w-sm text-[15px] font-bold leading-relaxed">{site.tagline}</p>
          <BallotBadge className="mt-5" />
          <dl className="mt-6 space-y-1 text-[14px] leading-relaxed text-ink-soft">
            <div className="flex gap-2">
              <dt className="shrink-0 font-bold text-ink">維護者</dt>
              <dd>{site.organizer}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 font-bold text-ink">聯絡信箱</dt>
              <dd>
                <a className="link-ink" href={`mailto:${site.contactEmail}`}>
                  {site.contactEmail}
                </a>
              </dd>
            </div>
          </dl>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            <Link href="/explore" className="group inline-flex items-end gap-3 border-b-2 border-edge pb-1">
              <span className="font-display text-[34px] leading-none">Explore</span>
              <span className="pb-0.5 text-[13px] font-bold">探索政策島</span>
              <span className="mb-0.5 grid h-7 w-7 place-items-center rounded-md bg-sun transition-transform group-hover:rotate-12">
                <ArrowCurve className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/about" className="group inline-flex items-end gap-3 border-b-2 border-edge pb-1">
              <span className="font-display text-[34px] leading-none">Contact</span>
              <span className="pb-0.5 text-[13px] font-bold">關於與聯絡</span>
              <span className="mb-0.5 grid h-7 w-7 place-items-center rounded-md bg-sun transition-transform group-hover:rotate-12">
                <ArrowCurve className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 text-[14px] sm:grid-cols-3">
          <nav aria-label="網站導覽">
            <p className="eyebrow mb-3">Menu</p>
            <ul className="space-y-2.5">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex items-center gap-1.5 font-bold hover:underline">
                    <PinIcon className="h-4 w-3.5" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="五座政策島">
            <p className="eyebrow mb-3">Islands</p>
            <ul className="space-y-2.5">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/islands/${c.slug}`} className="inline-flex items-center gap-1.5 font-bold hover:underline">
                    <PinIcon className="h-4 w-3.5" color="#7FD3CE" />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="網站資訊">
            <p className="eyebrow mb-3">About</p>
            <ul className="space-y-2.5">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex items-center gap-1.5 font-bold hover:underline">
                    <PinIcon className="h-4 w-3.5" color="#F9E3D8" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
        <p className="rounded-2xl border-2 border-dashed border-teal-deep/40 bg-paper/70 px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
          {site.sampleContent && <strong className="text-coral">本站目前為示範版本，標示「示範資料」的政策條目、狀態與來源皆為版型示意。</strong>}
          {site.stanceLong}網站內容區分候選人公開政見、政府已核定政策、媒體報導與市民提案。
        </p>
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none relative mt-10 select-none whitespace-nowrap text-center font-display text-[7.6vw] leading-[0.8] text-teal"
      >
        JIE.TAOYUAN
      </p>
      <div className="relative border-t-2 border-edge bg-teal-deep py-4 text-center text-[12px] tracking-[0.12em] text-paper">
        © 2026 {site.name}・{site.stance}
      </div>
    </footer>
  );
}

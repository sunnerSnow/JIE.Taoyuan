import Link from "next/link";
import { Cloud, Squiggle } from "@/components/ui/decor";

export type Crumb = { href: string; label: string };

/** 麵包屑：最後一項是目前頁面，不加連結 */
export function Breadcrumbs({ items, current }: { items: Crumb[]; current: string }) {
  return (
    <nav aria-label="麵包屑">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-bold">
        {items.map((c) => (
          <li key={c.href} className="flex items-center gap-2">
            <Link href={c.href} className="text-ink-soft hover:text-ink hover:underline">
              {c.label}
            </Link>
            <span aria-hidden="true" className="text-ink/30">
              /
            </span>
          </li>
        ))}
        <li aria-current="page" className="truncate">
          {current}
        </li>
      </ol>
    </nav>
  );
}

/** 內頁標題區：麵包屑＋大標＋英文眉標＋導言，底色延續首頁的海面漸層 */
export function PageHead({
  title,
  eyebrow,
  lead,
  crumbs = [],
  children,
}: {
  title: string;
  eyebrow: string;
  lead?: React.ReactNode;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden border-b-2 border-edge" style={{ background: "linear-gradient(180deg, #F1FAF9 0%, #DDF1EF 100%)" }}>
      <Cloud className="anim-bob absolute right-[8%] top-24 hidden w-32 md:block" />
      <Cloud className="anim-bob absolute right-[26%] top-40 hidden w-16 [animation-delay:-2s] lg:block" />
      <div className="relative mx-auto max-w-[1200px] px-4 pb-14 pt-28 sm:px-6 sm:pt-32">
        <Breadcrumbs items={[{ href: "/", label: "首頁" }, ...crumbs]} current={title} />
        <h1 className="section-title mt-6">{title}</h1>
        <p className="eyebrow mt-2 flex items-center gap-3">
          {eyebrow}
          <Squiggle className="h-2.5 w-12" color="#00A6A1" />
        </p>
        {lead && <p className="mt-5 max-w-2xl text-[15.5px] leading-[1.9] text-ink-soft">{lead}</p>}
        {children}
      </div>
    </div>
  );
}

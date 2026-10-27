// 品牌標誌：等距小島 + JIE.Taoyuan 字標

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 44" className={className} aria-hidden="true">
      <g stroke="#193A42" strokeWidth={2.2} strokeLinejoin="round">
        <path d="M24 16L44 27.5 24 39 4 27.5z" fill="#F7E3C8" />
        <path d="M4 27.5v4L24 43v-4zM44 27.5v4L24 43v-4z" fill="#E7D8B6" />
        <path d="M24 16L44 27.5 24 39 4 27.5z" fill="#CFE6DA" />
        <path d="M17 18.5l8 4.6v-10l-8-4.6z" fill="#FFFDF7" />
        <path d="M25 23.1l6-3.4v-10l-6 3.4z" fill="#E9E1CF" />
        <path d="M17 8.5l8 4.6 6-3.4-8-4.6z" fill="#F5D45E" />
        <path d="M33 28.5v-7" fill="none" strokeLinecap="round" />
        <path d="M33 16.5a4 4 0 1 1 0 .1z" fill="#9CCB86" />
      </g>
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 sm:gap-2.5">
      <LogoMark className="h-9 w-10 shrink-0 sm:h-10 sm:w-11" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[14px] tracking-[0.02em] sm:text-[19px]">JIE.Taoyuan</span>
        {!compact && <span className="mt-1 text-[12px] font-bold tracking-[0.2em] text-teal-deep sm:tracking-[0.28em]">杰伴桃園</span>}
      </span>
    </span>
  );
}

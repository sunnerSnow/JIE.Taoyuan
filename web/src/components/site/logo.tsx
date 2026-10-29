import Image from "next/image";

// 品牌標誌：小企鵝（取自插畫「企鵝不捨 桃園第①」）+ JIE.Taoyuan 字標；網址列的小圖示是同一隻（app/icon.png）

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 sm:gap-2.5">
      <Image src="/brand/penguin.png" alt="" width={137} height={114} priority className="h-9 w-auto shrink-0 sm:h-10" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[14px] tracking-[0.02em] sm:text-[19px]">JIE.Taoyuan</span>
        {!compact && <span className="mt-1 text-[12px] font-bold tracking-[0.2em] text-teal-deep sm:tracking-[0.28em]">杰伴桃園</span>}
      </span>
    </span>
  );
}

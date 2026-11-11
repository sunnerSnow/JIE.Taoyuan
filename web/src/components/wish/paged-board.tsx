"use client";

import Link from "next/link";
import { useRef, useState } from "react";

/** 手機一面放幾張（桌機一面是伺服器端的 WALL_PAGE 張，手機把它拆成前後兩半） */
const MOBILE_PAGE = 6;

const btn = "btn btn-sm min-w-[96px] justify-center";
const off = "btn btn-sm min-w-[96px] justify-center pointer-events-none opacity-40";

/**
 * 願望牆的一面＋翻頁。桌機一面就是伺服器給的這一頁；手機一面只放一半，
 * 翻到後半在瀏覽器裡切換，翻過頭才換下一頁（網址的 p 是第幾頁、h=2 表示從後半開始看）。
 */
export function PagedBoard({
  children,
  page,
  pages,
  total,
  count,
  initialHalf,
  prevHref,
  prevHalfHref,
  nextHref,
}: {
  children: React.ReactNode;
  page: number;
  pages: number;
  total: number;
  /** 這一頁有幾張 */
  count: number;
  initialHalf: 0 | 1;
  prevHref: string | null;
  prevHalfHref: string | null;
  nextHref: string | null;
}) {
  const [half, setHalf] = useState<0 | 1>(count > MOBILE_PAGE ? initialHalf : 0);
  const board = useRef<HTMLUListElement>(null);
  const mobilePages = Math.max(1, Math.ceil(total / MOBILE_PAGE));
  const mobilePage = (page - 1) * 2 + half + 1;
  const flip = (h: 0 | 1) => {
    setHalf(h);
    board.current?.scrollIntoView({ block: "start" });
  };

  return (
    <>
      <ul
        ref={board}
        data-half={half}
        className="wish-board mt-8 flex scroll-mt-28 flex-wrap items-start justify-center rounded-[28px] border-2 border-edge px-3 pb-14 pt-10 sm:px-6"
      >
        {children}
      </ul>

      {pages > 1 && (
        <nav aria-label="願望牆翻頁" className="mt-8 hidden items-center justify-center gap-4 sm:flex">
          {prevHref ? (
            <Link href={`${prevHref}#wall`} className={btn}>
              <span aria-hidden="true">‹</span> 上一面
            </Link>
          ) : (
            <span className={off} aria-hidden="true">
              ‹ 上一面
            </span>
          )}
          <span className="text-[15px] font-black" aria-current="page">
            第 {page} 面／共 {pages} 面
          </span>
          {nextHref ? (
            <Link href={`${nextHref}#wall`} className={btn}>
              下一面 <span aria-hidden="true">›</span>
            </Link>
          ) : (
            <span className={off} aria-hidden="true">
              下一面 ›
            </span>
          )}
        </nav>
      )}

      {mobilePages > 1 && (
        <nav aria-label="願望牆翻頁" className="mt-8 flex items-center justify-center gap-3 sm:hidden">
          {half === 1 ? (
            <button type="button" className={btn} onClick={() => flip(0)}>
              <span aria-hidden="true">‹</span> 上一面
            </button>
          ) : prevHalfHref ? (
            <Link href={`${prevHalfHref}#wall`} className={btn}>
              <span aria-hidden="true">‹</span> 上一面
            </Link>
          ) : (
            <span className={off} aria-hidden="true">
              ‹ 上一面
            </span>
          )}
          <span className="text-[14px] font-black" aria-current="page">
            第 {mobilePage} 面／共 {mobilePages} 面
          </span>
          {half === 0 && count > MOBILE_PAGE ? (
            <button type="button" className={btn} onClick={() => flip(1)}>
              下一面 <span aria-hidden="true">›</span>
            </button>
          ) : nextHref ? (
            <Link href={`${nextHref}#wall`} className={btn}>
              下一面 <span aria-hidden="true">›</span>
            </Link>
          ) : (
            <span className={off} aria-hidden="true">
              下一面 ›
            </span>
          )}
        </nav>
      )}
    </>
  );
}

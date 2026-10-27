/** 動態頁（分類、政策詳情）在換頁時先顯示的骨架；版面對齊 PageHead，避免內容跳動 */
export function PageSkeleton() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">
        載入中…
      </p>
      <div className="border-b-2 border-edge bg-mist">
        <div className="mx-auto max-w-[1200px] px-4 pb-14 pt-28 sm:px-6 sm:pt-32">
          <div className="h-4 w-48 animate-pulse rounded-full bg-teal-deep/10" />
          <div className="mt-8 h-11 w-2/3 max-w-xl animate-pulse rounded-2xl bg-teal-deep/10" />
          <div className="mt-6 h-5 w-full max-w-2xl animate-pulse rounded-full bg-teal-deep/10" />
          <div className="mt-3 h-5 w-4/5 max-w-xl animate-pulse rounded-full bg-teal-deep/10" />
        </div>
      </div>
      <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-14 sm:px-6 md:grid-cols-2">
        <div className="h-56 animate-pulse rounded-[24px] bg-teal-deep/5" />
        <div className="h-56 animate-pulse rounded-[24px] bg-teal-deep/5" />
      </div>
    </div>
  );
}

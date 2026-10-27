import Link from "next/link";
import { PenguinSays } from "@/components/art/speech";
import { ArrowCurve, Cloud } from "@/components/ui/decor";

export function NotFoundContent() {
  return (
    <div className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #EEF6F8 0%, #CFE4EB 100%)" }}>
      <Cloud className="anim-bob absolute left-[8%] top-28 w-32" />
      <Cloud className="anim-bob absolute right-[10%] top-44 w-20 [animation-delay:-2s]" />
      <div className="relative mx-auto flex min-h-[80svh] max-w-[720px] flex-col items-center justify-center px-4 pb-20 pt-32 text-center">
        <p className="font-display text-[clamp(72px,16vw,140px)] leading-none">404</p>
        <h1 className="mt-4 text-[26px] font-black tracking-[0.08em]">這座島還不在地圖上</h1>
        <p className="mt-3 text-[15.5px] leading-[1.9] text-ink-soft">你要找的頁面可能已經搬家，或網址打錯了。</p>
        <PenguinSays pose="stand" className="mt-8" penguinClassName="h-28 w-24" bubbleClassName="text-[14.5px]">
          別擔心，我帶你回到熟悉的地方。
        </PenguinSays>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/explore" className="btn btn-sun">
            回到政策島
            <ArrowCurve className="h-5 w-5" />
          </Link>
          <Link href="/policies" className="btn">
            查看全部政策
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Penguin } from "@/components/art/penguin";

const STEPS = [
  {
    title: "嗨！我是企鵝阿爸",
    body: "這裡是桃園政策島。五座島代表五個生活議題，我帶你看懂跟生活有關的政策。",
  },
  {
    title: "點一座島，走進生活場景",
    body: "點地圖上的島或島名，也可以用政策索引。島上的每一棟建築、每一根小圖釘都是一項政策，點下去就會打開說明。不想操作地圖，可以切換到「清單」。",
  },
  {
    title: "每一項都附上來源",
    body: "政策會標示狀態、來源類型、原始來源與更新日期。找不到可查證的資料時，我們會直接寫「暫無可查證進度」，不做推測。覺得畫面動來動去不舒服，可以按右上角的「動畫」關掉。",
  },
];

/** 第一次進站的導覽（像 puma 的 HELLO, TAIPEI）：原生 dialog，焦點與 Esc 由瀏覽器處理 */
export function IntroDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const close = () => ref.current?.close();
  const last = step === STEPS.length - 1;
  const s = STEPS[step];

  return (
    <dialog
      ref={ref}
      onClose={() => {
        setStep(0);
        onClose();
      }}
      aria-labelledby="intro-title"
      className="m-auto w-[min(92vw,460px)] overflow-visible rounded-[28px] border-2 border-edge bg-paper p-0 text-ink shadow-lift backdrop:bg-teal-deep/40 backdrop:backdrop-blur-[3px]"
    >
      <div className="relative p-7 pt-8 sm:p-8">
        <Penguin pose={step === 1 ? "point" : "wave"} className="absolute -top-[88px] right-6 h-24 w-20" />
        <p className="text-[12px] font-black tracking-[0.24em] text-coral">HELLO, TAOYUAN / {String(step + 1).padStart(2, "0")}</p>
        <h2 id="intro-title" className="mt-3 text-[26px] font-black leading-snug tracking-[0.06em]">
          {s.title}
        </h2>
        <p className="mt-3 text-[15px] leading-[1.9] text-ink-soft">{s.body}</p>
        <div className="mt-5 flex gap-1.5" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className={`h-2 rounded-full border-[1.5px] border-edge transition-all ${i === step ? "w-7 bg-sun" : "w-2 bg-paper"}`} />
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          第 {step + 1} 步，共 {STEPS.length} 步
        </p>
        <div className="mt-6 flex items-center justify-between gap-3">
          <button type="button" className="btn btn-sm" onClick={close}>
            略過
          </button>
          <button type="button" className="btn btn-ink btn-sm" autoFocus onClick={() => (last ? close() : setStep(step + 1))}>
            {last ? "走進政策島 →" : "下一步 →"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

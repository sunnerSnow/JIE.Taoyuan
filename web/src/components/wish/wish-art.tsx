import type { WishType } from "@/lib/wish/options";

// 杰個願望的插圖與配色：每種留言一個便利貼顏色、一個小圖示（顏色之外還有圖示和文字，不只靠顏色分辨）

export const NOTE_STYLE: Record<WishType, { paper: string; tag: string; tagText: string }> = {
  encouragement: { paper: "#FBE4D8", tag: "#B5452D", tagText: "#FFFFFF" },
  wish: { paper: "#FFF5C4", tag: "#F9DE3A", tagText: "#234647" },
  message: { paper: "#D3EEEC", tag: "#FFFFFF", tagText: "#005E59" },
  proposal: { paper: "#FFFFFF", tag: "#007A74", tagText: "#FFFFFF" },
};

/** 便利貼輕微歪斜，排起來像貼在牆上 */
export const NOTE_TILT = [-1.2, 0.9, -0.5, 1.3, -0.9, 0.4];

export function TypeIcon({ type, className = "h-4 w-4" }: { type: WishType; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {type === "encouragement" && <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" {...common} />}
      {type === "wish" && <path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4 5.7-.8z" {...common} />}
      {type === "message" && (
        <>
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z" {...common} />
          <path d="M8.5 10h.01M12 10h.01M15.5 10h.01" {...common} strokeWidth={3} />
        </>
      )}
      {type === "proposal" && (
        <>
          <path d="M9 17.5h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V17h5.2v-1.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" {...common} />
        </>
      )}
    </svg>
  );
}

/** 願望箱：主視覺與送出動畫用 */
export function WishBox({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 170" className={className} aria-hidden="true">
      <ellipse cx="100" cy="160" rx="86" ry="8" fill="#007A74" opacity="0.14" />
      <path d="M22 62h156l-10 92a8 8 0 0 1-8 7H40a8 8 0 0 1-8-7z" fill="#00A6A1" />
      <path d="M22 62h156l-2 18H24z" fill="#007A74" />
      <rect x="14" y="44" width="172" height="24" rx="12" fill="#F9DE3A" />
      <rect x="62" y="52" width="76" height="8" rx="4" fill="#234647" />
      <path d="M100 92l5.6 11.4 12.6 1.8-9.1 8.9 2.2 12.5L100 120.7l-11.3 5.9 2.2-12.5-9.1-8.9 12.6-1.8z" fill="#FFF5C4" />
      <text x="100" y="146" textAnchor="middle" fontFamily="Fredoka Variable, sans-serif" fontWeight="700" fontSize="15" letterSpacing="2" fill="#FFFFFF">
        JIE WISH
      </text>
    </svg>
  );
}

/** 漂浮的小便利貼（裝飾） */
export function FloatingNote({ color, className = "", style }: { color: string; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`absolute block rounded-[6px] shadow-soft ${className}`} style={{ background: color, ...style }} aria-hidden="true">
      <span className="absolute -top-1.5 left-1/2 h-3 w-8 -translate-x-1/2 rounded-sm bg-white/70" />
      <span className="absolute left-[18%] right-[18%] top-[40%] h-[3px] rounded-full bg-ink/15" />
      <span className="absolute left-[18%] right-[34%] top-[58%] h-[3px] rounded-full bg-ink/15" />
    </span>
  );
}

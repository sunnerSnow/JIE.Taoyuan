// sunbousai 風格的小裝飾：波浪線、轉角弧形箭頭、齒輪狀圓章

function scallopPath(cx: number, cy: number, r: number, bumps: number, amp: number) {
  const pts: string[] = [];
  const steps = bumps * 10;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const rr = r + amp * Math.cos(bumps * t);
    pts.push(`${(cx + rr * Math.cos(t)).toFixed(2)} ${(cy + rr * Math.sin(t)).toFixed(2)}`);
  }
  return "M" + pts.join("L") + "Z";
}

const SCALLOP = scallopPath(50, 50, 44, 12, 4);

/** 島嶼編號圓章（像 sunbousai 的「防災設備業」標籤） */
export function Scallop({
  children,
  color = "#F9DE3A",
  className = "",
  size = 64,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
  size?: number;
}) {
  return (
    <span className={`relative inline-grid shrink-0 place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d={SCALLOP} fill={color} />
      </svg>
      <span className="relative font-display leading-none">{children}</span>
    </span>
  );
}

export function Squiggle({ className = "", color = "#00A6A1" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 54 10" className={className} aria-hidden="true" fill="none">
      <path d="M2 6c4-5 8-5 12 0s8 5 12 0 8-5 12 0 8 5 12 0" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </svg>
  );
}

/** 按鈕右下角的弧形箭頭（sunbousai 的 CTA 記號） */
export function ArrowCurve({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <path d="M4 15a10 10 0 0 1 15-9" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M13 4.5l6.2 1.3-1.4 6.1" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 地圖圖釘 */
export function PinIcon({ className = "", color = "#F9DE3A" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 30" className={className} aria-hidden="true">
      <path
        d="M12 28.5s-9.5-9.6-9.5-16.5a9.5 9.5 0 0 1 19 0c0 6.9-9.5 16.5-9.5 16.5z"
        fill={color}
        stroke="#007A74"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11.6" r="3.6" fill="#FFFFFF" />
    </svg>
  );
}

export function Cloud({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 40" className={className} aria-hidden="true">
      <path
        d="M14 34a10 10 0 0 1 2-19 14 14 0 0 1 26-6 12 12 0 0 1 20 4 11 11 0 0 1 14 11 9 9 0 0 1-2 10z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

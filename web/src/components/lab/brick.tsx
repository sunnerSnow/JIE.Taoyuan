// 桃園積木：扁平、無描邊（沿用 unouplus 插畫語彙），顏色用政策島的識別色

export function Brick({ color, className = "" }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 64 46" className={className} aria-hidden="true">
      <rect x="10" y="2" width="15" height="10" rx="3.5" fill={color} />
      <rect x="39" y="2" width="15" height="10" rx="3.5" fill={color} />
      <rect x="2" y="9" width="60" height="35" rx="9" fill={color} />
      {/* 下緣的陰影與凸點的亮面，讓積木有一點厚度 */}
      <path d="M2 31h60v4a9 9 0 0 1-9 9H11a9 9 0 0 1-9-9z" fill="#234647" opacity="0.1" />
      <rect x="12.5" y="4" width="10" height="3" rx="1.5" fill="#FFFFFF" opacity="0.45" />
      <rect x="41.5" y="4" width="10" height="3" rx="1.5" fill="#FFFFFF" opacity="0.45" />
    </svg>
  );
}

/** 還沒收下的積木位置：虛線外框 */
export function BrickSlot({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 46" className={className} aria-hidden="true">
      <rect x="3" y="10" width="58" height="33" rx="8.5" fill="none" stroke="#007A74" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="5 4" />
    </svg>
  );
}

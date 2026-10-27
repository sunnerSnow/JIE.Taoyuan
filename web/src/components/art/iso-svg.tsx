import { flatStroke, type IsoBounds, type Shape } from "@/lib/iso";

type Props = {
  shapes: Shape[];
  viewBox: IsoBounds;
  className?: string;
  /** 有意義的插畫要給替代文字；純裝飾就留空 */
  label?: string;
};

// 線條用 non-scaling-stroke，不論插畫縮放多少，線寬都維持同樣粗細。
// 所以 sw 與虛線長度是「螢幕像素」的倍數，不是世界座標。
const LINE = 1.4;
const DASH = 3;

export function IsoSvg({ shapes, viewBox, className, label }: Props) {
  const vb = [viewBox.x, viewBox.y, viewBox.w, viewBox.h].map((n) => Math.round(n * 10) / 10).join(" ");
  return (
    <svg
      viewBox={vb}
      className={`iso-art ${className ?? ""}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {shapes.map((s, i) => {
        const line = flatStroke(s, LINE);
        return (
          <path
            key={i}
            d={s.d}
            fill={s.fill}
            stroke={line.stroke}
            strokeWidth={line.width}
            strokeDasharray={line.dash?.split(" ").map((n) => Number(n) * DASH).join(" ")}
            strokeLinecap={s.cap}
            opacity={s.opacity}
          />
        );
      })}
    </svg>
  );
}

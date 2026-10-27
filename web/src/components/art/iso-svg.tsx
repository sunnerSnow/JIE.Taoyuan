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

/** 把連續、同一個 key 的圖形分成一段（維持原本的前後繪製順序） */
function runs<T>(items: T[], key: (t: T) => string | number | undefined) {
  const out: { key: string | number | undefined; items: T[] }[] = [];
  for (const it of items) {
    const k = key(it);
    const last = out[out.length - 1];
    if (last && last.key === k) last.items.push(it);
    else out.push({ key: k, items: [it] });
  }
  return out;
}

/**
 * 等距插畫。圖形依「島 → 建築」包成 <g data-island> / <g data-spot>，
 * 探索地圖用它們點島、點建築與高亮選取的政策；其他頁面只是多了屬性，不影響外觀。
 */
export function IsoSvg({ shapes, viewBox, className, label }: Props) {
  const vb = [viewBox.x, viewBox.y, viewBox.w, viewBox.h].map((n) => Math.round(n * 10) / 10).join(" ");
  const indexed = shapes.map((s, i) => ({ s, i }));
  const path = ({ s, i }: { s: Shape; i: number }) => {
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
  };
  return (
    <svg
      viewBox={vb}
      className={`iso-art ${className ?? ""}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {runs(indexed, (x) => x.s.island).map((isl) =>
        isl.key === undefined ? (
          isl.items.map(path)
        ) : (
          <g key={`i${isl.items[0].i}`} data-island={isl.key}>
            {runs(isl.items, (x) => x.s.spot).map((b) =>
              b.key === undefined ? (
                b.items.map(path)
              ) : (
                <g key={`s${b.items[0].i}`} data-spot={b.key}>
                  {b.items.map(path)}
                </g>
              ),
            )}
          </g>
        ),
      )}
    </svg>
  );
}

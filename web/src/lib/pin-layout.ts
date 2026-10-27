/** 一個圖釘標籤：x 是錨點水平位置（標籤置中），y 是標籤預設的底緣，w／h 是標籤尺寸，單位都是螢幕 px */
export type PinBox = { x: number; y: number; w: number; h: number };

/**
 * 圖釘標籤避讓：標籤畫在錨點正上方，中間一根細桿。
 * 從最下面的錨點開始擺，撞到已擺好的標籤就把這個標籤往上推（細桿拉長），直到不重疊。
 * 回傳每個標籤要額外抬高幾 px（順序同輸入）。
 */
export function liftLabels(pins: PinBox[], gap = 4, maxLift = 160): number[] {
  const order = pins.map((_, i) => i).sort((a, b) => pins[b].y - pins[a].y);
  const placed: { l: number; r: number; t: number; b: number }[] = [];
  const lifts = pins.map(() => 0);
  for (const i of order) {
    const p = pins[i];
    const l = p.x - p.w / 2;
    const r = p.x + p.w / 2;
    let lift = 0;
    for (let guard = 0; guard < pins.length; guard++) {
      const b = p.y - lift;
      const t = b - p.h;
      const hit = placed.find((q) => l < q.r + gap && r > q.l - gap && t < q.b + gap && b > q.t - gap);
      if (!hit) break;
      lift = Math.min(maxLift, p.y - (hit.t - gap));
      if (lift === maxLift) break;
    }
    lifts[i] = lift;
    placed.push({ l, r, t: p.y - lift - p.h, b: p.y - lift });
  }
  return lifts;
}

/** 估計一段字在分享圖上占幾行：中文字算一個字寬，英數字與空白算半個多一點；size、width 用同一個單位（通常是 u） */
export function lineCount(text: string, size: number, width: number) {
  let w = 0;
  for (const ch of text) w += /[ -~]/.test(ch) ? 0.55 : 1;
  return Math.max(1, Math.ceil((w * size) / width));
}

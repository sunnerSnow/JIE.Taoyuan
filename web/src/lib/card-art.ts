// 分享卡的兩張插畫：「企鵝不捨 桃園第①」（penguin）與「桃園動起來！」（go）。
// 每張卡依內容固定用其中一張，同一張卡在頁面預覽、下載的圖與連結預覽都一樣；不同卡之間平均分到兩張，看起來像隨機。

export const cardArts = ["penguin", "go"] as const;
export type CardArt = (typeof cardArts)[number];

/** key 是卡片的內容代碼（桃園卡的組合、大字版的政見 id 或類別） */
export function pickArt(key: string): CardArt {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return cardArts[h % cardArts.length];
}

/** 網頁上桃園卡的直式底圖 */
export const portraitSrc: Record<CardArt, string> = { penguin: "/lab/taoyuan-card.jpg", go: "/lab/taoyuan-card-go.jpg" };

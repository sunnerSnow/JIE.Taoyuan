import { site } from "@/lib/site";

// 杰伴出發的行程預告：候選人 LINE 官方帳號（@589cjotf）推播給好友的行程公告，放在 /trail 最上面，一天做成一張分享圖（/trail/schedule/日期）。
// LINE 推播沒有公開網址、網站外讀不到，由維護者把收到的公告原文貼上來整理（見 /line-schedule）。
// 時間、活動、地點、地址照公告原文，不加詮釋。新的在前；過去的日子留著，頁面只顯示今天以後的。
// 預告不算行程紀錄的來源：行程結束後有官方貼文或報導，再另外收進 trail.ts。

export type ScheduleItem = {
  /** 24 小時制，例如 07:00 */
  time: string;
  /** 公告的「活動」 */
  title: string;
  /** 公告的「地點」括號前的部分 */
  place: string;
  /** 公告「地點」括號裡的地址 */
  address?: string;
};

export type ScheduleDay = {
  /** 行程的台灣日期 */
  date: string;
  /** 照公告的順序（時間先後） */
  items: ScheduleItem[];
};

export const schedule: ScheduleDay[] = [
  {
    date: "2026-11-02",
    items: [
      { time: "07:00", title: "相約上班路！楊梅路口拜票", place: "星巴克楊梅埔心門市前", address: "楊梅區中山北路二段287號" },
      { time: "18:50", title: "劉仁照議員說明會", place: "北富里集會所", address: "平鎮區金陵路三段197巷1弄50號" },
    ],
  },
];

/** 頁面和圖卡上都要寫的出處說明 */
export const scheduleNote = `行程依${site.candidate.name} LINE 官方帳號公告整理，如有異動以官方公告為準`;

/** 圖卡上的日期：大字「11月2日」＋小字「星期一」 */
export function scheduleDate(iso: string) {
  const d = new Date(iso);
  return { day: `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`, weekday: `星期${"日一二三四五六"[d.getUTCDay()]}` };
}

/** 一場行程的地點全文，例如「北富里集會所（平鎮區金陵路三段197巷1弄50號）」 */
export const placeText = (it: ScheduleItem) => (it.address ? `${it.place}（${it.address}）` : it.place);

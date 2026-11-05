import { type ScheduleDay, type ScheduleItem, placeText, routeText } from "@/data/schedule";
import { lineCount } from "./text-fit";

// 行程預告圖卡的版面（純計算：圖卡和網頁上的預覽大小都用這一份）。數字單位都是 u（1% 卡片寬）。
// 寬 900，高度跟著行程多寡變：最矮 4:5，一般不超過 9:16；場次太多時字縮到 0.8 倍還放不下，就讓圖變長。

export const SCHEDULE_CARD_WIDTH = 900;

/** 上方：號次姓名、眉標、日期（左欄），插畫在右上角 */
export const HEAD = { top: 7, candidate: 7, eyebrow: 3.4, date: 9, weekday: 4.6, art: 34 };
/** 行程清單從哪裡開始：日期下方和插畫下方，取低的那個再留一點空 */
export const ITEMS_TOP = Math.max(HEAD.top + HEAD.candidate * 1.25 + 3 + HEAD.eyebrow * 1.25 + 2 + HEAD.date * 1.15 + 4.5, 6 + HEAD.art + 2.5);
/** 一場行程一張白卡：字級與間距（會乘上縮放比例 s） */
export const ITEM = { padY: 3, padX: 3.6, border: 0.3, time: 6.4, title: 5.8, place: 4.4, address: 3.6, route: 3.4, pin: 2.4, gap: 2.4 };
/** 清單下方到卡片底：留白＋頁尾四行 */
const FOOTER = 27.4;
const MIN_H = 125; // 4:5
const MAX_H = (100 * 16) / 9; // 9:16

/** 一張白卡的高度；寧可估高，圖片長一點也不要字壓到頁尾 */
function itemHeight(it: ScheduleDay["items"][number], s: number) {
  const inner = 86 - 2 * ITEM.padX * s - 2 * ITEM.border;
  const placeWidth = inner - ITEM.pin * s - 1.6 * s;
  const title = lineCount(it.title, ITEM.title * s, inner) * ITEM.title * s * 1.3;
  const place = lineCount(it.place, ITEM.place * s, placeWidth) * ITEM.place * s * 1.35;
  const address = it.address ? 0.4 * s + lineCount(it.address, ITEM.address * s, placeWidth) * ITEM.address * s * 1.4 : 0;
  const route = it.route ? 1.6 * s + lineCount(routeText(it), ITEM.route * s, inner) * ITEM.route * s * 1.5 : 0;
  return 2 * ITEM.padY * s + 2 * ITEM.border + ITEM.time * s + 1 * s + title + 1.4 * s + place + address + route;
}

const listHeight = (day: ScheduleDay, s: number) => day.items.reduce((n, it) => n + itemHeight(it, s), 0) + (day.items.length - 1) * ITEM.gap * s;

/** 縮放比例與卡片高度（u）：場次少就放大到剛好填滿 4:5（最多 1.4 倍）；場次多就縮小到放進 9:16，但最小 0.8 倍，字太小手機上看不清楚 */
export function scheduleLayout(day: ScheduleDay) {
  const fits = (s: number, h: number) => ITEMS_TOP + listHeight(day, s) + FOOTER <= h;
  const step = (s: number) => Math.round((s - 0.05) * 100) / 100;
  let s = 1.4;
  while (s > 1 && !fits(s, MIN_H)) s = step(s);
  while (s > 0.8 && !fits(s, MAX_H)) s = step(s);
  return { s, height: Math.max(MIN_H, ITEMS_TOP + listHeight(day, s) + FOOTER) };
}

/** 圖卡的像素大小 */
export function scheduleCardSize(day: ScheduleDay) {
  const u = SCHEDULE_CARD_WIDTH / 100;
  return { width: SCHEDULE_CARD_WIDTH, height: Math.round(scheduleLayout(day).height * u) };
}

/** 車隊掃街路線圖卡（/trail/schedule/日期/route/時間）：上方和行程預告圖卡相同，下面是時間、活動、起終點、地圖、路線文字 */
export const ROUTE = { time: 6.4, title: 5.8, place: 3.8, map: 86, route: 3.2, note: 2.6 };
export const ROUTE_NOTE = "路線示意：依公告的路名順序沿道路畫出，實際行經路段以現場為準。地圖資料 © OpenStreetMap 貢獻者";
export const routePlaceLine = (it: ScheduleItem) => `起點・終點：${placeText(it)}`;

export function routeCardLayout(it: ScheduleItem, map: { width: number; height: number }) {
  const mapH = (ROUTE.map * map.height) / map.width;
  const head = ROUTE.time + 1 + lineCount(it.title, ROUTE.title, 86) * ROUTE.title * 1.3 + 1.4 + lineCount(routePlaceLine(it), ROUTE.place, 82) * ROUTE.place * 1.4;
  const body = 3 + mapH + 0.6 + 2.4 + lineCount(routeText(it), ROUTE.route, 86) * ROUTE.route * 1.5 + 1.4 + lineCount(ROUTE_NOTE, ROUTE.note, 86) * ROUTE.note * 1.45;
  return { mapH, height: ITEMS_TOP + head + body + FOOTER };
}

export function routeCardSize(it: ScheduleItem, map: { width: number; height: number }) {
  const u = SCHEDULE_CARD_WIDTH / 100;
  return { width: SCHEDULE_CARD_WIDTH, height: Math.round(routeCardLayout(it, map).height * u) };
}

import type { RouteMap } from "@/data/route-maps";
import { type ScheduleDay, type ScheduleItem, finishText, placeText, routeText } from "@/data/schedule";
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
  const finish = it.finish ? 0.4 * s + lineCount(finishText(it), ITEM.address * s, placeWidth) * ITEM.address * s * 1.4 : 0;
  const route = it.route ? 1.6 * s + lineCount(routeText(it), ITEM.route * s, inner) * ITEM.route * s * 1.5 : 0;
  return 2 * ITEM.padY * s + 2 * ITEM.border + ITEM.time * s + 1 * s + title + 1.4 * s + place + address + finish + route;
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

/**
 * 車隊掃街分成兩張圖卡（地圖和文字放在同一張太長）：
 * 路線圖卡（/trail/schedule/日期/route/時間）是地圖；路線清單卡（…/route/時間/list）照號碼列出完整路線，號碼和地圖一致。
 * 兩張的上方都和行程預告圖卡相同，接著是時間、活動、起終點。
 */
export const ROUTE = { time: 6.4, title: 5.8, place: 3.8, map: 86, step: 3.4, legend: 2.8, note: 2.6, chip: 3.8, num: 4.2, rowGap: 1.6 };
export const ROUTE_LEGEND = "照號碼順序前進，白色箭頭是行進方向；完整路線見路線清單";
export const LIST_LEGEND = "號碼和路線圖上的號碼一樣，照號碼順序前進";
export const ROUTE_NOTE = "路線示意：依公告的路名順序沿道路畫出，實際行經路段以現場為準。地圖資料 © OpenStreetMap 貢獻者";
export const routePlaceLine = (it: ScheduleItem) => (it.finish ? `起點：${placeText(it)}；終點：${it.finish}` : `起點・終點：${placeText(it)}`);

/** 時間、活動、起終點的高度 */
const routeHead = (it: ScheduleItem) =>
  ROUTE.time + 1 + lineCount(it.title, ROUTE.title, 86) * ROUTE.title * 1.3 + 1.4 + lineCount(routePlaceLine(it), ROUTE.place, 86) * ROUTE.place * 1.4;

/** 路線清單一列一列排下去會排成幾列（和 RouteListCard 的寬度算法一致；寧可估多） */
export function chipRows(chips: RouteMap["chips"]) {
  let rows = 1;
  let x = 0;
  chips.forEach((c, i) => {
    const w = (c.n ? ROUTE.num + 0.6 : 0) + (c.mapped ? ROUTE.chip + 0.3 : 0) + c.text.length * ROUTE.chip + 0.4 + (i < chips.length - 1 ? 0.8 + ROUTE.chip + 0.8 : 0);
    if (x > 0 && x + w > 86) {
      rows += 1;
      x = 0;
    }
    x += w;
  });
  return rows;
}

const pixels = (h: number) => ({ width: SCHEDULE_CARD_WIDTH, height: Math.round((h * SCHEDULE_CARD_WIDTH) / 100) });

export function routeMapLayout(it: ScheduleItem, map: RouteMap) {
  const mapH = (ROUTE.map * map.height) / map.width;
  const body = 3 + mapH + 0.6 + 1.6 + lineCount(ROUTE_LEGEND, ROUTE.legend, 82) * ROUTE.legend * 1.4 + 1.8 + lineCount(ROUTE_NOTE, ROUTE.note, 86) * ROUTE.note * 1.45;
  return { mapH, height: ITEMS_TOP + routeHead(it) + body + FOOTER };
}

export function routeListLayout(it: ScheduleItem, map: RouteMap) {
  const rows = chipRows(map.chips);
  const body = 3 + ROUTE.legend * 1.4 + 2.4 + rows * (ROUTE.num + 0.4) + (rows - 1) * ROUTE.rowGap;
  return { height: Math.max(MIN_H, ITEMS_TOP + routeHead(it) + body + FOOTER) };
}

export const routeMapCardSize = (it: ScheduleItem, map: RouteMap) => pixels(routeMapLayout(it, map).height);
export const routeListCardSize = (it: ScheduleItem, map: RouteMap) => pixels(routeListLayout(it, map).height);

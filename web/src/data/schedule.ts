import { site } from "@/lib/site";

// 杰伴出發的行程預告：候選人官方帳號公告的接下來行程，放在 /trail 最上面，一天做成一張分享圖（/trail/schedule/日期）。
// 來源有兩種：LINE 官方帳號（@589cjotf）推播給好友的行程公告（沒有公開網址、網站外讀不到，由維護者貼上原文），
// 以及官方 Threads 有寫明時間、地點的行程預告貼文。整理規則見 /line-schedule。
// 時間、活動、地點、地址、路線照公告原文，不加詮釋。新的在前；過去的日子留著，頁面只顯示今天以後的。
// 預告不算行程紀錄的來源：行程結束後有官方貼文或報導，再另外收進 trail.ts。

export type ScheduleItem = {
  /** 24 小時制，例如 07:00 */
  time: string;
  /** 結束時間：公告有寫才填（例如車隊掃街 09:00-11:30） */
  end?: string;
  /** 公告的「活動」 */
  title: string;
  /** 公告的「地點」括號前的部分；車隊掃街是起點（也是終點時只寫一次） */
  place: string;
  /** 公告「地點」括號裡的地址 */
  address?: string;
  /** 車隊掃街的路線：照公告順序列出經過的路段與加油打氣站 */
  route?: string[];
};

/** LINE 推播沒有網址 */
export type ScheduleSource = { outlet: string; url?: string };

export type ScheduleDay = {
  /** 行程的台灣日期 */
  date: string;
  /** 照公告的順序（時間先後） */
  items: ScheduleItem[];
  sources: ScheduleSource[];
};

const line: ScheduleSource = { outlet: "LINE 官方帳號公告" };

export const schedule: ScheduleDay[] = [
  {
    date: "2026-11-05",
    items: [
      {
        time: "09:00",
        end: "11:30",
        title: "桃園區車隊掃街 ft. 李正皓",
        place: "北桃園競選總部",
        address: "桃園區三民路二段300號",
        route: [
          "永安路",
          "力行路",
          "中正路",
          "中山路",
          "黃瓊慧 加油打氣站",
          "李光達 加油打氣站",
          "余信憲 加油打氣站",
          "正光路",
          "黃家齊競總 加油打氣站",
          "慈文路",
          "經國路",
          "春日路",
          "民光東路",
          "中正路",
          "莊敬路一段",
          "同安街",
          "大興西路一段",
          "寶慶路",
          "南平路",
          "健行路",
          "大有路",
          "民光東路",
          "民生路",
          "慈文路",
          "李柏瑟 加油打氣站",
          "春日路",
          "大興路",
          "大業路",
          "三元街",
          "三民路",
        ],
      },
      {
        time: "19:00",
        end: "20:30",
        title: "桃園區車隊掃街 ft. 鄭運鵬",
        place: "北桃園競選總部",
        address: "桃園區三民路二段300號",
        route: [
          "三民路",
          "中山路",
          "春日路",
          "三民路",
          "自強路",
          "成功路",
          "春日路",
          "春日路橋",
          "桃鶯路",
          "樹仁二街",
          "建新街",
          "建國路",
          "延平路",
          "金門二路",
          "保羅街",
          "民族路橋",
          "復興路",
          "春日路",
          "三民路",
        ],
      },
    ],
    sources: [{ outlet: "Threads 貼文", url: "https://www.threads.com/@schuanglawyer/post/DfTlYUKIwfm" }],
  },
  {
    date: "2026-11-04",
    items: [
      { time: "09:30", title: "陳治文&黃世杰 聯合競選總部成立大會", place: "大溪三角公園", address: "大溪區中央路和中正路交叉路" },
      { time: "11:25", title: "大園後援會成立大會", place: "大園區中正一街50號" },
    ],
    sources: [line],
  },
  {
    date: "2026-11-02",
    items: [
      { time: "07:00", title: "相約上班路！楊梅路口拜票", place: "星巴克楊梅埔心門市前", address: "楊梅區中山北路二段287號" },
      { time: "18:50", title: "劉仁照議員說明會", place: "北富里集會所", address: "平鎮區金陵路三段197巷1弄50號" },
    ],
    sources: [line],
  },
];

/** 頁面和圖卡上都要寫的出處說明 */
export const scheduleNote = `行程依${site.candidate.name}官方帳號公告整理，如有異動以官方公告為準`;

/** 圖卡上的日期：大字「11月2日」＋小字「星期一」 */
export function scheduleDate(iso: string) {
  const d = new Date(iso);
  return { day: `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`, weekday: `星期${"日一二三四五六"[d.getUTCDay()]}` };
}

/** 時間：有結束時間就寫成「09:00~11:30」（半形波浪號，Fredoka 字型才有這個字） */
export const timeText = (it: ScheduleItem) => (it.end ? `${it.time}~${it.end}` : it.time);

/** 一場行程的地點全文，例如「北富里集會所（平鎮區金陵路三段197巷1弄50號）」 */
export const placeText = (it: ScheduleItem) => (it.address ? `${it.place}（${it.address}）` : it.place);

/** 車隊掃街的路線全文 */
export const routeText = (it: ScheduleItem) => (it.route ? `路線：${it.route.join("→")}` : "");

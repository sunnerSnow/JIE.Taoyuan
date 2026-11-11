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
  /** 公告的「地點」括號前的部分；車隊掃街是起點（也是終點時只寫一次）。只有時間和活動的公告（例如「杰伴週報」）不填 */
  place?: string;
  /** 公告「地點」括號裡的地址 */
  address?: string;
  /** 終點：和起點不同時才填（例如「蘆竹德林寺（龍安街二段985號）」） */
  finish?: string;
  /** 車隊掃街的路線：照公告順序列出經過的路段與加油打氣站，不含起點、終點 */
  route?: string[];
  /** 線上節目的觀看網址（例如 YouTube 直播）；有網址的場次，頁面放觀看連結、不放地圖連結 */
  url?: string;
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
    date: "2026-11-15",
    items: [
      { time: "08:30", end: "10:30", title: "龜山市場掃街" },
      { time: "14:00", end: "16:30", title: "龜山區車隊掃街" },
    ],
    sources: [{ outlet: "官方「杰伴週報」圖卡" }],
  },
  {
    date: "2026-11-14",
    items: [
      { time: "09:00", end: "11:00", title: "中壢區車隊掃街" },
      { time: "17:00", end: "19:00", title: "龍潭區車隊掃街" },
    ],
    sources: [{ outlet: "官方「杰伴週報」圖卡" }],
  },
  {
    date: "2026-11-13",
    items: [
      { time: "16:30", end: "17:30", title: "中壢區車隊掃街" },
      { time: "17:30", end: "20:30", title: "中壢區車隊掃街" },
    ],
    sources: [{ outlet: "官方「杰伴週報」圖卡" }],
  },
  {
    date: "2026-11-12",
    items: [
      { time: "09:00", end: "11:30", title: "南崁市場掃街" },
    ],
    sources: [{ outlet: "官方「杰伴週報」圖卡" }],
  },
  {
    date: "2026-11-11",
    items: [
      {
        time: "16:00",
        end: "18:00",
        title: "中壢區車隊掃街",
        place: "南競辦公室",
        address: "中壢區中華路二段128號",
        finish: "南方莊園飯店（中壢區樹籽路8號）",
        route: [
          "南園路口",
          "中華路二段",
          "中華路一段",
          "興仁路一段",
          "榮民路",
          "環中東路",
          "張曉昀競總 打氣站",
          "環中東路二段",
          "環南路三段",
          "金陵路二段",
          "和平路",
          "德育路二段",
          "環南路三段",
          "環南路二段",
          "環南路",
          "民族路二段",
          "民族路三段",
          "民族路雙連一段",
          "雙福路",
          "樹籽路",
        ],
      },
    ],
    sources: [
      { outlet: "官方「杰伴週報」圖卡" },
      { outlet: "Threads 貼文", url: "https://www.threads.com/@schuanglawyer/post/DfjFLaYj05c" },
      { outlet: "Threads 路線", url: "https://www.threads.com/@schuanglawyer/post/DfjFMHxD80p" },
    ],
  },
  {
    date: "2026-11-10",
    items: [
      {
        time: "09:00",
        end: "11:30",
        title: "楊梅區車隊掃街",
        place: "平鎮南天宮",
        address: "楊梅區雙榮路226號",
        finish: "奉天宮",
        route: [
          "民族路五段",
          "電研路",
          "快速路五段",
          "高榮路",
          "梅高路",
          "高上路一段",
          "幼獅路二段",
          "幼獅路一段",
          "永美路",
          "埔心火車站",
          "中興路",
          "中興路166巷",
          "文化街",
          "五守街",
          "五福路",
          "文化街295巷",
          "瑞溪路二段",
          "萬大路",
          "打氣站 鄭淑方服務處",
          "中山北路二段",
          "三民北路",
          "頭重溪三元宮",
          "三民北路",
          "新農街二段",
          "自立街",
          "中山北路一段",
          "打氣站 項柏翰競總",
          "環東路",
          "楊新北路",
          "楊新路",
          "楊梅火車站",
          "大成路",
          "中山路125巷",
          "校前路",
          "環南路",
          "打氣站 謝卓儒競總",
          "環南路309巷",
          "秀才路173巷",
          "秀才路",
          "中山路",
          "中山路161巷",
          "大華街",
          "楊湖路一段",
          "楊湖路二段",
          "楊湖路三段",
          "三湖三元宮",
          "楊湖路四段",
          "富民街",
          "新明街",
          "中正路",
          "大井頭福德宮",
          "富岡火車站",
          "成功路",
          "信義街",
          "民富路三段",
          "民富路二段",
          "民富路一段",
          "楊新路二段",
          "白蛇廟",
          "楊新路二段",
          "楊新路三段",
          "楊新路四段",
          "中華南路二段",
          "中華南路二段480巷",
        ],
      },
    ],
    sources: [
      { outlet: "Threads 貼文", url: "https://www.threads.com/@schuanglawyer/post/DfgBDudo97y" },
      { outlet: "Threads 路線", url: "https://www.threads.com/@schuanglawyer/post/DfgBDNDo4Te" },
    ],
  },
  {
    date: "2026-11-09",
    items: [
      {
        time: "09:00",
        end: "11:30",
        title: "平鎮區車隊掃街",
        place: "平鎮區民族路二段219號前",
        finish: "平鎮區中豐路山頂段469巷",
        route: [
          "民族路",
          "廣明路",
          "廣平街",
          "復興街",
          "文化街",
          "復旦路",
          "振興西路",
          "新德街",
          "富貴街",
          "王珮毓競總",
          "安平街",
          "新德街",
          "振興西路",
          "新榮路",
          "中壢區康樂路",
          "龍岡地下道",
          "龍岡路",
          "龍岡圓環",
          "龍南路",
          "平等路",
          "平東路",
          "金陵路",
          "振興路",
          "劉仁照競總 打氣站",
          "中豐路",
          "中庸路",
          "上海路",
          "南京路",
          "中豐路",
          "湧東路",
          "湧光路",
          "自由街",
          "工業十路",
          "工業七路",
          "南豐路",
          "中豐路",
        ],
      },
    ],
    sources: [{ outlet: "Threads 貼文", url: "https://www.threads.com/@schuanglawyer/post/DfdeS6jko_8" }],
  },
  {
    date: "2026-11-06",
    items: [
      {
        time: "09:25", // 貼文沒寫時間；09:25 是「蘆竹車掃出發囉！」貼文的時間
        title: "蘆竹區車隊掃街",
        place: "南崁五福宮",
        address: "蘆竹區五福路1號",
        finish: "蘆竹德林寺（龍安街二段985號）",
        route: [
          "五福一路",
          "許清順競總打氣站",
          "六福路",
          "中山路",
          "仁愛路一段",
          "胡家智競總打氣站",
          "南山路一段、二段、三段",
          "山外路",
          "山林路二段434巷",
          "山林路二段、一段",
          "南山路三段",
          "南山北路一段、二段",
          "海湖東路",
          "海山路一段",
          "大有街",
          "坑菓路",
          "三民路二段",
          "菓林路",
          "三民路二段",
          "南崁路二段、一段",
          "南崁路",
          "忠孝東路",
          "忠孝西路",
          "南昌路",
          "南福街",
          "奉化路",
          "南竹路二段、三段",
          "南崁路四段、五段",
          "大竹路",
          "上興路",
          "大興路",
          "大新路",
          "龍安街三段、二段",
        ],
      },
    ],
    sources: [{ outlet: "Threads 貼文", url: "https://www.threads.com/@schuanglawyer/post/DfYbGQjCQ9E" }],
  },
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
          "民族路橋", // 原圖卡寫「民族路橋」；11/4 路線更新貼文寫「民族陸橋」（OSM 也是），路線圖靠 tools/route-map 的 ALIASES 對照
          "復興路",
          "三民路",
        ],
      },
    ],
    sources: [
      { outlet: "Threads 貼文", url: "https://www.threads.com/@schuanglawyer/post/DfTlYUKIwfm" },
      // 11/4 晚上更新晚場路線：民族陸橋→復興路→三民路→北競總（改為不左轉春日路）
      { outlet: "Threads 路線更新", url: "https://www.threads.com/@schuanglawyer/post/DfUTGn_iTaV" },
    ],
  },
  {
    date: "2026-11-04",
    items: [
      { time: "09:30", title: "陳治文&黃世杰 聯合競選總部成立大會", place: "大溪三角公園", address: "大溪區中央路和中正路交叉路" },
      { time: "11:25", title: "大園後援會成立大會", place: "大園區中正一街50號" },
      { time: "18:30", title: "一琪晚餐", place: "YouTube 直播", url: "https://www.youtube.com/live/4C7fueQRnQ8" },
    ],
    sources: [line, { outlet: "Threads 貼文", url: "https://www.threads.com/@schuanglawyer/post/DfT4Hfzie65" }],
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
export const placeText = (it: ScheduleItem) => (it.place ? (it.address ? `${it.place}（${it.address}）` : it.place) : "");

/** 終點：和起點不同時才有 */
export const finishText = (it: ScheduleItem) => (it.finish ? `終點：${it.finish}` : "");

/** 車隊掃街的路線全文 */
export const routeText = (it: ScheduleItem) => (it.route ? `路線：${it.route.join("→")}` : "");

/** 路線圖卡網址裡的時間不放冒號：09:00 → 0900 */
export const routeSlug = (time: string) => time.replace(":", "");

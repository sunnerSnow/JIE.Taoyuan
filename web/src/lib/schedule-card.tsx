import { voteDay } from "@/data/easy";
import type { RouteMap } from "@/data/route-maps";
import { type ScheduleDay, type ScheduleItem, routeText, schedule, scheduleDate, scheduleNote, timeText } from "@/data/schedule";
import { CARD } from "./card-image";
import { Candidate, GO_RATIO, goCutout } from "./easy-card";
import { loadGoogleFont } from "./og";
import { ROUTE_COLORS, routeMapDataUri } from "./route-map-svg";
import { HEAD, ITEM, ITEMS_TOP, ROUTE, ROUTE_NOTE, SCHEDULE_CARD_WIDTH, routeCardLayout, routePlaceLine, scheduleLayout } from "./schedule-layout";
import { site } from "./site";

// 行程預告的分享圖（只在伺服器端用）：一天一張，寬 900、高度跟著行程多寡變（見 lib/schedule-layout.ts）。
// 左上是號次姓名與日期，右上角放「桃園動起來！」去背插畫，下面一場行程一張白卡（時間、活動、地點、地址；車隊掃街另列路線），字級和大字版圖卡差不多大。
// 車隊掃街另外有一張路線圖卡（RouteCard），地圖資料由 tools/route-map/build.py 產生。

const LABEL = "行程預告";
const ROUTE_LABEL = "車掃路線圖";
const START_LABEL = "起點・終點";
const EYEBROW = "杰伴出發・下一站，和世杰一起！";
const voteDayText = () => `投票日：${voteDay()}`;
const footerLink = `杰伴桃園・${CARD.host}/trail`;

/** 地點前面的小圖釘 */
const PIN = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 1.5a8 8 0 0 0-8 8c0 5.6 8 13 8 13s8-7.4 8-13a8 8 0 0 0-8-8z" fill="${CARD.teal}"/><circle cx="12" cy="9.5" r="3.2" fill="#FFFFFF"/></svg>`,
).toString("base64")}`;

const GLYPHS = [
  site.candidate.name,
  LABEL,
  EYEBROW,
  scheduleNote,
  voteDayText(),
  footerLink,
  site.stance,
  ROUTE_LABEL,
  START_LABEL,
  ROUTE_NOTE,
  ...schedule.flatMap((d) => [...Object.values(scheduleDate(d.date)), ...d.items.flatMap((it) => [it.title, routePlaceLine(it), routeText(it)])]),
].join("");

export async function scheduleCardFonts() {
  const [black, bolder, display] = await Promise.all([
    loadGoogleFont("Chiron GoRound TC", 900, GLYPHS),
    loadGoogleFont("Chiron GoRound TC", 700, GLYPHS),
    loadGoogleFont("Fredoka", 600, "JIE.Taoyuan0123456789:~"),
  ]);
  return [
    { name: "Chiron GoRound TC", data: black, weight: 900 as const, style: "normal" as const },
    { name: "Chiron GoRound TC", data: bolder, weight: 700 as const, style: "normal" as const },
    { name: "Fredoka", data: display, weight: 600 as const, style: "normal" as const },
  ];
}

const U = SCHEDULE_CARD_WIDTH / 100;

/** 上方：插畫（右上角）、號次姓名與標籤、眉標、日期 */
function CardHead({ date: iso, label }: { date: string; label: string }) {
  const u = U;
  const date = scheduleDate(iso);
  const art = HEAD.art * u;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- next/og 只支援 img */}
      <img src={goCutout} width={art} height={art * GO_RATIO} alt="" style={{ position: "absolute", right: 3 * u, top: 6 * u }} />
      <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 7 * u, top: HEAD.top * u }}>
        <Candidate h={HEAD.candidate * u} label={label} />
        <div style={{ display: "flex", marginTop: 3 * u, fontSize: HEAD.eyebrow * u, lineHeight: 1.25, fontWeight: 900, letterSpacing: 0.1 * u, color: CARD.red }}>{EYEBROW}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 1.4 * u, marginTop: 2 * u, color: CARD.navy }}>
          <div style={{ display: "flex", fontSize: HEAD.date * u, lineHeight: 1.15, fontWeight: 900, letterSpacing: 0.15 * u }}>{date.day}</div>
          <div style={{ display: "flex", fontSize: HEAD.weekday * u, fontWeight: 900 }}>{date.weekday}</div>
        </div>
      </div>
    </>
  );
}

/** 最下面：出處說明、投票日、網站、非官方標示 */
function CardFooter() {
  const u = U;
  return (
    <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 7 * u, right: 7 * u, bottom: 4.5 * u, gap: 0.6 * u }}>
      <div style={{ display: "flex", fontSize: 2.7 * u, fontWeight: 700, color: CARD.soft }}>{scheduleNote}</div>
      <div style={{ display: "flex", fontSize: 3.6 * u, fontWeight: 900, color: CARD.red }}>{voteDayText()}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 1.6 * u }}>
        <div style={{ display: "flex", fontFamily: "Fredoka", fontSize: 3.4 * u, fontWeight: 600, color: "#00A6A1" }}>JIE.Taoyuan</div>
        <div style={{ display: "flex", fontSize: 2.8 * u, fontWeight: 900, color: CARD.teal }}>{footerLink}</div>
      </div>
      <div style={{ display: "flex", fontSize: 2.6 * u, fontWeight: 700, color: CARD.soft }}>{site.stance}</div>
    </div>
  );
}

const frame = { display: "flex", position: "relative", width: "100%", height: "100%", fontFamily: "Chiron GoRound TC", background: "#F6EFE0", color: CARD.ink } as const;

export function ScheduleCard({ day }: { day: ScheduleDay }) {
  const u = U;
  const { s } = scheduleLayout(day);
  return (
    <div style={frame}>
      <CardHead date={day.date} label={LABEL} />
      <div style={{ display: "flex", flexDirection: "column", gap: ITEM.gap * s * u, position: "absolute", left: 7 * u, right: 7 * u, top: ITEMS_TOP * u }}>
        {day.items.map((it) => (
          <div
            key={`${it.time}-${it.title}`}
            style={{
              display: "flex",
              flexDirection: "column",
              padding: `${ITEM.padY * s * u}px ${ITEM.padX * s * u}px`,
              border: `${ITEM.border * u}px solid #E3D7BF`,
              borderRadius: 3.2 * s * u,
              background: "#FFFDF7",
            }}
          >
            <div style={{ display: "flex", fontFamily: "Fredoka", fontSize: ITEM.time * s * u, lineHeight: 1, fontWeight: 600, color: CARD.red }}>{timeText(it)}</div>
            <div style={{ display: "flex", marginTop: 1 * s * u, fontSize: ITEM.title * s * u, lineHeight: 1.3, fontWeight: 900, color: CARD.ink }}>{it.title}</div>
            <div style={{ display: "flex", gap: 1.6 * s * u, marginTop: 1.4 * s * u }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- next/og 只支援 img */}
              <img src={PIN} width={ITEM.pin * s * u} height={ITEM.pin * s * u} alt="" style={{ marginTop: ITEM.place * s * u * 0.2 }} />
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", fontSize: ITEM.place * s * u, lineHeight: 1.35, fontWeight: 900, color: CARD.teal }}>{it.place}</div>
                {it.address && (
                  <div style={{ display: "flex", marginTop: 0.4 * s * u, fontSize: ITEM.address * s * u, lineHeight: 1.4, fontWeight: 700, color: CARD.soft }}>{it.address}</div>
                )}
              </div>
            </div>
            {it.route && (
              <div style={{ display: "flex", marginTop: 1.6 * s * u, fontSize: ITEM.route * s * u, lineHeight: 1.5, fontWeight: 700, color: CARD.soft }}>{routeText(it)}</div>
            )}
          </div>
        ))}
      </div>
      <CardFooter />
    </div>
  );
}

/** 標籤的寬度：一個中文字約一個字寬，左右各留一點 */
const pillWidth = (text: string, fs: number) => text.length * fs + 2.4 * U;

/** 車隊掃街路線圖卡：時間、活動、起終點，下面是路線圖（路名標籤與起點疊在 SVG 底圖上）和完整路線文字 */
export function RouteCard({ date, item: it, map }: { date: string; item: ScheduleItem; map: RouteMap }) {
  const u = U;
  const { mapH } = routeCardLayout(it, map);
  const k = (ROUTE.map * u) / map.width; // 地圖座標 → 圖卡像素
  const [sx, sy] = map.start;
  return (
    <div style={frame}>
      <CardHead date={date} label={ROUTE_LABEL} />
      <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 7 * u, right: 7 * u, top: ITEMS_TOP * u }}>
        <div style={{ display: "flex", fontFamily: "Fredoka", fontSize: ROUTE.time * u, lineHeight: 1, fontWeight: 600, color: CARD.red }}>{timeText(it)}</div>
        <div style={{ display: "flex", marginTop: 1 * u, fontSize: ROUTE.title * u, lineHeight: 1.3, fontWeight: 900 }}>{it.title}</div>
        <div style={{ display: "flex", marginTop: 1.4 * u, fontSize: ROUTE.place * u, lineHeight: 1.4, fontWeight: 900, color: CARD.teal }}>{routePlaceLine(it)}</div>
        <div
          style={{
            display: "flex",
            position: "relative",
            marginTop: 3 * u,
            width: ROUTE.map * u,
            height: mapH * u,
            borderRadius: 3 * u,
            border: `${0.3 * u}px solid #E3D7BF`,
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og 只支援 img */}
          <img src={routeMapDataUri(map)} width={ROUTE.map * u} height={mapH * u} alt="" style={{ position: "absolute", left: 0, top: 0 }} />
          {map.labels.map((l) => (
            <div
              key={l.text}
              style={{
                display: "flex",
                justifyContent: "center",
                position: "absolute",
                left: l.x * k - pillWidth(l.text, 2.6 * u) / 2,
                top: l.y * k - 1.9 * u,
                width: pillWidth(l.text, 2.6 * u),
                padding: `${0.4 * u}px 0`,
                borderRadius: 999,
                background: "rgba(255, 253, 247, 0.92)",
                fontSize: 2.6 * u,
                lineHeight: 1.2,
                fontWeight: 900,
                color: CARD.ink,
              }}
            >
              {l.text}
            </div>
          ))}
          <div
            style={{
              display: "flex",
              position: "absolute",
              left: sx * k - 2 * u,
              top: sy * k - 2 * u,
              width: 4 * u,
              height: 4 * u,
              borderRadius: 999,
              border: `${0.8 * u}px solid #FFFFFF`,
              background: ROUTE_COLORS.start,
            }}
          />
          <div
            style={{
              display: "flex",
              position: "absolute",
              left: Math.min(sx * k + 2.6 * u, ROUTE.map * u - pillWidth(START_LABEL, 2.8 * u) - u),
              top: sy * k - 2.2 * u,
              padding: `${0.5 * u}px ${1.2 * u}px`,
              borderRadius: 999,
              background: ROUTE_COLORS.start,
              fontSize: 2.8 * u,
              lineHeight: 1.2,
              fontWeight: 900,
              color: "#FFFFFF",
            }}
          >
            {START_LABEL}
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 2.4 * u, fontSize: ROUTE.route * u, lineHeight: 1.5, fontWeight: 700, color: CARD.soft }}>{routeText(it)}</div>
        <div style={{ display: "flex", marginTop: 1.4 * u, fontSize: ROUTE.note * u, lineHeight: 1.45, fontWeight: 700, color: CARD.soft }}>{ROUTE_NOTE}</div>
      </div>
      <CardFooter />
    </div>
  );
}

import { voteDay } from "@/data/easy";
import { type ScheduleDay, routeText, schedule, scheduleDate, scheduleNote, timeText } from "@/data/schedule";
import { CARD } from "./card-image";
import { Candidate, GO_RATIO, goCutout } from "./easy-card";
import { loadGoogleFont } from "./og";
import { HEAD, ITEM, ITEMS_TOP, SCHEDULE_CARD_WIDTH, scheduleLayout } from "./schedule-layout";
import { site } from "./site";

// 行程預告的分享圖（只在伺服器端用）：一天一張，寬 900、高度跟著行程多寡變（見 lib/schedule-layout.ts）。
// 左上是號次姓名與日期，右上角放「桃園動起來！」去背插畫，下面一場行程一張白卡（時間、活動、地點、地址；車隊掃街另列路線），字級和大字版圖卡差不多大。

const LABEL = "行程預告";
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
  ...schedule.flatMap((d) => [...Object.values(scheduleDate(d.date)), ...d.items.flatMap((it) => [it.title, it.place, it.address ?? "", routeText(it)])]),
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

export function ScheduleCard({ day }: { day: ScheduleDay }) {
  const u = SCHEDULE_CARD_WIDTH / 100;
  const { s } = scheduleLayout(day);
  const date = scheduleDate(day.date);
  const art = HEAD.art * u;
  return (
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", fontFamily: "Chiron GoRound TC", background: "#F6EFE0", color: CARD.ink }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- next/og 只支援 img */}
      <img src={goCutout} width={art} height={art * GO_RATIO} alt="" style={{ position: "absolute", right: 3 * u, top: 6 * u }} />
      <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 7 * u, top: HEAD.top * u }}>
        <Candidate h={HEAD.candidate * u} label={LABEL} />
        <div style={{ display: "flex", marginTop: 3 * u, fontSize: HEAD.eyebrow * u, lineHeight: 1.25, fontWeight: 900, letterSpacing: 0.1 * u, color: CARD.red }}>{EYEBROW}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 1.4 * u, marginTop: 2 * u, color: CARD.navy }}>
          <div style={{ display: "flex", fontSize: HEAD.date * u, lineHeight: 1.15, fontWeight: 900, letterSpacing: 0.15 * u }}>{date.day}</div>
          <div style={{ display: "flex", fontSize: HEAD.weekday * u, fontWeight: 900 }}>{date.weekday}</div>
        </div>
      </div>

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

      <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 7 * u, right: 7 * u, bottom: 4.5 * u, gap: 0.6 * u }}>
        <div style={{ display: "flex", fontSize: 2.7 * u, fontWeight: 700, color: CARD.soft }}>{scheduleNote}</div>
        <div style={{ display: "flex", fontSize: 3.6 * u, fontWeight: 900, color: CARD.red }}>{voteDayText()}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 1.6 * u }}>
          <div style={{ display: "flex", fontFamily: "Fredoka", fontSize: 3.4 * u, fontWeight: 600, color: "#00A6A1" }}>JIE.Taoyuan</div>
          <div style={{ display: "flex", fontSize: 2.8 * u, fontWeight: 900, color: CARD.teal }}>{footerLink}</div>
        </div>
        <div style={{ display: "flex", fontSize: 2.6 * u, fontWeight: 700, color: CARD.soft }}>{site.stance}</div>
      </div>
    </div>
  );
}

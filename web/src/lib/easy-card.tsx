import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { categories, categoryColor, categoryMap } from "@/data/categories";
import { easyPoints, voteDay } from "@/data/easy";
import { themePolicies } from "@/data/lab";
import { policies, shortTitle } from "@/data/policies";
import type { CategorySlug, Policy } from "@/data/types";
import { pickArt } from "./card-art";
import { CARD, wideArts } from "./card-image";
import { loadGoogleFont } from "./og";
import { site } from "./site";

// 大字版的分享圖卡（只在伺服器端用）。長輩主要用手機看，所以一張只放一項政見：大字短標題＋這項的全部重點（2～4 句），
// 一類有幾項就有幾張，卡上標「第幾張／共幾張」，一次傳好幾張也看得出順序。
// 直式 900×1600（手機全螢幕看剛好），底圖是兩張插畫之一（依政見 id 固定，見 lib/card-art.ts）放在下方、上方留素色給文字；橫式是連結預覽用。

const LABEL = "政見重點";

/** 卡片最上面：號次圓圈＋候選人姓名（大字），旁邊小字「政見重點」；h 是姓名字級（px） */
function Candidate({ h }: { h: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: h * 0.3 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: h * 1.25,
          height: h * 1.25,
          borderRadius: 999,
          border: `${h * 0.1}px solid ${CARD.red}`,
          background: "#FFFFFF",
          fontSize: h * 0.82,
          fontWeight: 900,
          color: CARD.red,
        }}
      >
        {site.candidate.ballotNo}
      </div>
      <div style={{ display: "flex", fontSize: h, lineHeight: 1.1, fontWeight: 900, letterSpacing: h * 0.06, color: CARD.ink }}>{site.candidate.name}</div>
      <div style={{ display: "flex", marginLeft: h * 0.1, fontSize: h * 0.5, fontWeight: 700, color: CARD.soft }}>{LABEL}</div>
    </div>
  );
}

const voteDayText = () => `投票日：${voteDay()}`;

// 每張圖卡依政見 id 固定用其中一張插畫：「企鵝不捨」是烤好的直式底圖（素色紙＋插畫在下方）；
// 「桃園動起來！」用去背插畫，依文字占的高度放到最大（重點少的卡，插畫就大，中間不會空一大塊）
const [penguinStory, goArt] = await Promise.all([
  readFile(join(process.cwd(), "public/lab/easy-card.png"), "base64"),
  readFile(join(process.cwd(), "public/lab/card-go-art.png"), "base64"),
]);
const penguinBg = `data:image/png;base64,${penguinStory}`;
const goCutout = `data:image/png;base64,${goArt}`;
const GO_RATIO = 761 / 760; // 去背插畫的高寬比

/** 估計一段字占幾行：中文字算一個字寬，英數字與空白算半個多一點；size、width 都是 u */
function lineCount(text: string, size: number, width: number) {
  let w = 0;
  for (const ch of text) w += /[ -~]/.test(ch) ? 0.55 : 1;
  return Math.max(1, Math.ceil((w * size) / width));
}

/** 文字區最底下大約在哪（u），數字和 EasyStoryCard 的排版一致；寧可估多，插畫小一點也不要壓到字 */
function textBottom(p: Policy) {
  const points = easyPoints[p.id];
  const title = lineCount(shortTitle(p.title), 9.35, 86) * 9.2 * 1.2;
  const body = points.reduce((n, t) => n + lineCount(t, 6.6, 81.2) * 6.6 * 1.4, 0) + (points.length - 1) * 2.6;
  return 7 + 7.4 * 1.25 + 3 + 7.6 + 3 + title + 4.5 + body;
}

/** 去背插畫的大小：從文字下方 4u 到頁尾上緣（160u），最小 40u、最大 80u */
function goArtBox(p: Policy) {
  const h = Math.min(80, Math.max(40, 160 - (textBottom(p) + 4)));
  return { h, w: h / GO_RATIO, top: 160 - h };
}

const GLYPHS = [
  site.candidate.name,
  LABEL,
  voteDayText(),
  "第0123456789張／共",
  ...categories.map((c) => c.short),
  ...policies.map((p) => shortTitle(p.title)),
  ...Object.values(easyPoints).flat(),
  site.stance,
  `杰伴桃園・${CARD.host}/easy`,
].join("");

export async function easyCardFonts() {
  const [black, bolder, display] = await Promise.all([
    loadGoogleFont("Chiron GoRound TC", 900, GLYPHS),
    loadGoogleFont("Chiron GoRound TC", 700, GLYPHS),
    loadGoogleFont("Fredoka", 600, "JIE.Taoyuan"),
  ]);
  return [
    { name: "Chiron GoRound TC", data: black, weight: 900 as const, style: "normal" as const },
    { name: "Chiron GoRound TC", data: bolder, weight: 700 as const, style: "normal" as const },
    { name: "Fredoka", data: display, weight: 600 as const, style: "normal" as const },
  ];
}

/**
 * 直式圖卡（900×1600），一張一項政見；u 是 1% 卡片寬。
 * 字級以手機全螢幕（約 390px 寬）換算：標題約 36px、重點約 26px。最長的情況（重點共 6 行，例如毛孩友善、敬老愛心卡）文字也停在插畫上方。
 * 「桃園動起來！」那張的插畫大小跟著文字長度變（goArtBox）。
 */
export function EasyStoryCard({ policy: p, index, total, width }: { policy: Policy; index: number; total: number; width: number }) {
  const u = width / 100;
  const color = categoryColor[p.category];
  const art = pickArt(p.id);
  const go = goArtBox(p);
  return (
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", fontFamily: "Chiron GoRound TC", background: "#F6EFE0", color: CARD.ink }}>
      {art === "penguin" ? (
        // eslint-disable-next-line @next/next/no-img-element -- next/og 只支援 img
        <img src={penguinBg} width={width} height={width * (16 / 9)} alt="" style={{ position: "absolute", left: 0, top: 0 }} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- next/og 只支援 img
        <img src={goCutout} width={go.w * u} height={go.h * u} alt="" style={{ position: "absolute", left: ((100 - go.w) / 2 + 1) * u, top: go.top * u }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 7 * u, right: 7 * u, top: 7 * u }}>
        <Candidate h={7.4 * u} />
        <div style={{ display: "flex", alignItems: "center", gap: 2 * u, marginTop: 3 * u }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 1.4 * u,
              height: 7.6 * u,
              padding: `0 ${2.6 * u}px`,
              borderRadius: 999,
              background: color.soft,
              fontSize: 4.6 * u,
              fontWeight: 900,
            }}
          >
            <div style={{ display: "flex", width: 2.6 * u, height: 2.6 * u, borderRadius: 999, background: color.base }} />
            {categoryMap[p.category].short}
          </div>
          <div style={{ display: "flex", fontSize: 4.2 * u, fontWeight: 700, color: CARD.soft }}>
            第 {index + 1} 張／共 {total} 張
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 3 * u, fontSize: 9.2 * u, lineHeight: 1.2, fontWeight: 900, letterSpacing: 0.15 * u, color: CARD.navy }}>
          {shortTitle(p.title)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2.6 * u, marginTop: 4.5 * u }}>
          {easyPoints[p.id].map((t) => (
            <div key={t} style={{ display: "flex", gap: 2.4 * u }}>
              <div style={{ display: "flex", flexShrink: 0, width: 2.4 * u, height: 2.4 * u, marginTop: 3.4 * u, borderRadius: 0.5 * u, background: color.base }} />
              <div style={{ display: "flex", flex: 1, fontSize: 6.6 * u, lineHeight: 1.4, fontWeight: 700 }}>{t}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 7 * u, right: 7 * u, bottom: 4 * u, gap: 0.6 * u }}>
        <div style={{ display: "flex", fontSize: 3.9 * u, fontWeight: 900, color: CARD.red }}>{voteDayText()}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 1.6 * u }}>
          <div style={{ display: "flex", fontFamily: "Fredoka", fontSize: 3.6 * u, fontWeight: 600, color: "#00A6A1" }}>JIE.Taoyuan</div>
          <div style={{ display: "flex", fontSize: 2.9 * u, fontWeight: 900, color: CARD.teal }}>杰伴桃園・{CARD.host}/easy</div>
        </div>
        <div style={{ display: "flex", fontSize: 2.7 * u, fontWeight: 700, color: CARD.soft }}>{site.stance}</div>
      </div>
    </div>
  );
}

/** 橫式連結預覽（1200×630）：左邊是這一類的政見短標題，右邊是插畫 */
export function EasyWideCard({ theme }: { theme: CategorySlug }) {
  const list = themePolicies(theme);
  const color = categoryColor[theme].base;
  const fs = list.length >= 6 ? 30 : 33;
  return (
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", fontFamily: "Chiron GoRound TC", background: "#F6EFE0", color: CARD.ink }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- next/og 只支援 img */}
      <img src={wideArts[pickArt(theme)]} width={1200} height={630} alt="" style={{ position: "absolute", left: 0, top: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 64, top: 44, bottom: 36, width: 500 }}>
        <Candidate h={40} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}>
          <div style={{ display: "flex", width: 30, height: 30, borderRadius: 999, background: color }} />
          <div style={{ display: "flex", fontSize: 72, lineHeight: 1.15, fontWeight: 900, letterSpacing: 5, color: CARD.navy }}>{categoryMap[theme].short}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
          {list.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", width: 14, height: 14, borderRadius: 4, background: color }} />
              <div style={{ display: "flex", fontSize: fs, lineHeight: 1.3, fontWeight: 900 }}>{shortTitle(p.title)}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <div style={{ display: "flex", fontFamily: "Fredoka", fontSize: 26, fontWeight: 600, color: "#00A6A1" }}>JIE.Taoyuan</div>
            <div style={{ display: "flex", fontSize: 19, fontWeight: 900, color: CARD.teal }}>杰伴桃園・{CARD.host}/easy</div>
          </div>
          <div style={{ display: "flex", fontSize: 17, fontWeight: 700, color: CARD.soft }}>{site.stance}</div>
        </div>
      </div>
    </div>
  );
}

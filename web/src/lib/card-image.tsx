import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { categories, categoryColor, categoryMap } from "@/data/categories";
import { policies, shortTitle, sourceTypeLabel } from "@/data/policies";
import type { Policy } from "@/data/types";
import { loadGoogleFont } from "./og";
import { site } from "./site";

// 桃園卡的圖片（只在伺服器端用）：分享預覽的橫式圖（opengraph-image）與「下載分享圖」的直式圖（story）共用。
// 底圖是插畫「企鵝不捨 桃園第①」，上方留白放卡片內容；直式版和頁面上的桃園卡同一個版型（components/lab/taoyuan-card.tsx）。

export const CARD = {
  eyebrow: "3 分鐘，拼出你心中的桃園",
  title: "我探索的桃園",
  host: new URL(site.url).host,
  /** 取自插畫的口號與號次顏色，在米色紙張上維持足夠對比 */
  navy: "#3A4A72",
  ink: "#2E3A48",
  soft: "#5E6570",
  red: "#B5573E",
  teal: "#007A74",
};

// 底圖在 build 與執行時都一樣，讀一次就好（next/og 的 img 只吃 data URI 或網址）
const [portrait, wide] = await Promise.all([
  readFile(join(process.cwd(), "public/lab/taoyuan-card.jpg"), "base64"),
  readFile(join(process.cwd(), "public/lab/taoyuan-card-wide.jpg"), "base64"),
]);
export const portraitArt = `data:image/jpeg;base64,${portrait}`;
export const wideArt = `data:image/jpeg;base64,${wide}`;

/** 所有桃園卡共用一份字型子集（同一份參數才能命中快取） */
const GLYPHS = [
  ...policies.map((p) => shortTitle(p.title)),
  ...categories.map((c) => c.name),
  ...Object.values(sourceTypeLabel),
  CARD.eyebrow,
  CARD.title,
  site.stance,
  `杰伴桃園・${CARD.host}`,
].join("");

export async function cardFonts() {
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

function brickImage(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 46"><rect x="10" y="2" width="15" height="10" rx="3.5" fill="${color}"/><rect x="39" y="2" width="15" height="10" rx="3.5" fill="${color}"/><rect x="2" y="9" width="60" height="35" rx="9" fill="${color}"/><path d="M2 31h60v4a9 9 0 0 1-9 9H11a9 9 0 0 1-9-9z" fill="#234647" opacity="0.1"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const rows = (picks: Policy[]) =>
  picks.map((p) => ({ id: p.id, short: shortTitle(p.title), meta: `${categoryMap[p.category].name}・${sourceTypeLabel[p.sourceType]}`, brick: brickImage(categoryColor[p.category].base) }));

/** 卡片內容；u 是 1% 卡片寬（對應網頁版的 cqw），直式與橫式共用同一套比例 */
function CardBody({ picks, u }: { picks: Policy[]; u: number }) {
  return (
    <>
      <div style={{ display: "flex", fontSize: 3.4 * u, fontWeight: 900, letterSpacing: 0.35 * u, color: CARD.red }}>{CARD.eyebrow}</div>
      <div style={{ display: "flex", marginTop: 1.5 * u, fontSize: 9 * u, lineHeight: 1, fontWeight: 900, letterSpacing: 0.7 * u, color: CARD.navy }}>{CARD.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 * u, marginTop: 5 * u }}>
        {rows(picks).map((r) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 3 * u }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- next/og 只支援 img */}
            <img src={r.brick} width={11 * u} height={8 * u} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 5.2 * u, lineHeight: 1.25, fontWeight: 900, letterSpacing: 0.2 * u, color: CARD.ink }}>{r.short}</div>
              <div style={{ display: "flex", fontSize: 2.8 * u, lineHeight: 1.4, fontWeight: 700, color: CARD.soft }}>{r.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function CardFooter({ u }: { u: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0.3 * u }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 1.6 * u }}>
        <div style={{ display: "flex", fontFamily: "Fredoka", fontSize: 4 * u, fontWeight: 600, color: "#00A6A1" }}>JIE.Taoyuan</div>
        <div style={{ display: "flex", fontSize: 2.7 * u, fontWeight: 900, color: CARD.teal, whiteSpace: "nowrap" }}>杰伴桃園・{CARD.host}</div>
      </div>
      <div style={{ display: "flex", fontSize: 2.5 * u, fontWeight: 700, color: CARD.soft }}>{site.stance}</div>
    </div>
  );
}

/** 直式桃園卡（2:3）：和網頁上的卡片同一個版型，適合存到手機、發限時動態 */
export function StoryCard({ picks, width }: { picks: Policy[]; width: number }) {
  const u = width / 100;
  return (
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", fontFamily: "Chiron GoRound TC", background: "#F6EFE0" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- next/og 只支援 img */}
      <img src={portraitArt} width={width} height={width * 1.5} alt="" style={{ position: "absolute", left: 0, top: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 8 * u, right: 8 * u, top: 7.5 * u }}>
        <CardBody picks={picks} u={u} />
      </div>
      <div style={{ display: "flex", position: "absolute", left: 8 * u, right: 8 * u, bottom: 6 * u }}>
        <CardFooter u={u} />
      </div>
    </div>
  );
}

/** 橫式分享預覽（1200×630）：左邊是卡片內容（約 500px 寬），右邊是插畫 */
export function WideCard({ picks }: { picks: Policy[] }) {
  const u = 7.6;
  return (
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", fontFamily: "Chiron GoRound TC", background: "#F6EFE0" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- next/og 只支援 img */}
      <img src={wideArt} width={1200} height={630} alt="" style={{ position: "absolute", left: 0, top: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 64, top: 50, bottom: 40, width: 500 }}>
        <CardBody picks={picks} u={u} />
        <div style={{ display: "flex", marginTop: "auto" }}>
          <CardFooter u={u} />
        </div>
      </div>
    </div>
  );
}

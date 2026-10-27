import { ImageResponse } from "next/og";
import { categories, categoryColor, categoryMap } from "@/data/categories";
import { getPolicy, policies, statusInfo, statusOrder } from "@/data/policies";
import { islandImage, loadGoogleFont } from "@/lib/og";
import { site } from "@/lib/site";

// 每項政見自己的分享圖（unouplus 風）：白色圓角卡片，左側分類、狀態、標題與摘要，右側是島嶼主題色的大圓與島嶼插畫

export const alt = "JIE.Taoyuan 杰伴桃園政見分享圖";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}

const INK = "#234647";
const TEAL = "#007A74";

const c = site.candidate;
const BALLOT = `${c.office} ${c.ballotNo} 號 ${c.name}`;
/** 所有分享圖共用一份字型子集（同一份參數才能命中快取，build 時只向 Google Fonts 要一次） */
const GLYPHS = [
  ...policies.flatMap((p) => [p.title, p.summary]),
  ...categories.flatMap((x) => [x.no, x.name]),
  ...statusOrder.map((s) => statusInfo[s].label),
  site.stance,
  BALLOT,
  "杰伴桃園示範資料 0123456789",
].join("");

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const policy = getPolicy((await params).slug) ?? policies[0];
  const category = categoryMap[policy.category];
  const color = categoryColor[policy.category];
  const status = statusInfo[policy.status];
  const art = islandImage(policy.category, 400);
  const [black, bolder, display] = await Promise.all([
    loadGoogleFont("Chiron GoRound TC", 900, GLYPHS),
    loadGoogleFont("Chiron GoRound TC", 700, GLYPHS),
    loadGoogleFont("Fredoka", 600, "JIE.Taoyuan"),
  ]);

  const pill = { display: "flex", alignItems: "center", height: 50, padding: "0 24px", borderRadius: 999, fontSize: 25, fontWeight: 900 };

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#E8F5F4", padding: 30, fontFamily: "Chiron GoRound TC", color: INK }}>
        <div style={{ display: "flex", flex: 1, borderRadius: 44, background: "#FFFFFF", boxShadow: "0 18px 40px -20px rgba(0,90,85,0.45)", overflow: "hidden" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "50px 10px 40px 56px" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ ...pill, background: color.soft }}>
                {category.no} {category.name}
              </div>
              <div style={{ ...pill, background: status.tone }}>{status.label}</div>
              {policy.sample && <div style={{ ...pill, background: "#FFFFFF", color: "#B5452D", border: "3px dashed #B5452D" }}>示範資料</div>}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: policy.title.length > 16 ? 52 : 62,
                fontWeight: 900,
                lineHeight: 1.32,
                letterSpacing: 3,
                color: TEAL,
              }}
            >
              {policy.title}
            </div>
            <div style={{ display: "flex", marginTop: 20, fontSize: 26, fontWeight: 700, lineHeight: 1.7, color: "#4A6768", maxHeight: 132, overflow: "hidden" }}>
              {policy.summary}
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <div style={{ display: "flex", fontFamily: "Fredoka", fontSize: 36, fontWeight: 600, color: "#00A6A1" }}>JIE.Taoyuan</div>
                <div style={{ display: "flex", fontSize: 24, fontWeight: 900, color: TEAL, whiteSpace: "nowrap" }}>杰伴桃園</div>
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 18, fontWeight: 700, color: "#4A6768", whiteSpace: "nowrap" }}>
                <span>{BALLOT}</span>
                <span>{site.stance}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 470, position: "relative" }}>
            <div style={{ display: "flex", position: "absolute", width: 440, height: 440, borderRadius: 999, background: color.soft }} />
            <div style={{ display: "flex", position: "absolute", top: 46, right: 36, width: 110, height: 110, borderRadius: 999, background: "#F9DE3A" }} />
            {/* eslint-disable-next-line @next/next/no-img-element -- next/og 只支援 img */}
            <img src={art.src} width={400} height={art.height} alt="" style={{ position: "relative" }} />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Chiron GoRound TC", data: black, weight: 900, style: "normal" },
        { name: "Chiron GoRound TC", data: bolder, weight: 700, style: "normal" },
        { name: "Fredoka", data: display, weight: 600, style: "normal" },
      ],
    },
  );
}

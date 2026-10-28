import { ImageResponse } from "next/og";
import { Penguin } from "@/components/art/penguin";
import { categories, categoryColor, categoryMap } from "@/data/categories";
import { allCardCodes, labThemes, parseCardCode } from "@/data/lab";
import { policies, shortTitle, sourceTypeLabel } from "@/data/policies";
import { islandImage, loadGoogleFont } from "@/lib/og";
import { site } from "@/lib/site";

// 桃園卡的分享圖：和政見分享圖同一套版型（白色圓角卡片＋右側島嶼與企鵝阿爸），左側是主題與三塊積木，字級放大到手機上也讀得清楚

export const alt = "JIE.Taoyuan 杰伴桃園：我探索的桃園";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return allCardCodes().map((code) => ({ code }));
}

const INK = "#234647";
const TEAL = "#007A74";
const HOST = new URL(site.url).host;
const EYEBROW = "3 分鐘，拼出你心中的桃園";
const TITLE = "我探索的桃園";

/** 所有桃園卡共用一份字型子集（同一份參數才能命中快取） */
const GLYPHS = [
  ...policies.map((p) => shortTitle(p.title)),
  ...Object.values(labThemes).map((t) => t.label),
  ...categories.map((c) => c.name),
  ...Object.values(sourceTypeLabel),
  EYEBROW,
  TITLE,
  site.stance,
  `杰伴桃園・${HOST}`,
].join("");

function brickImage(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 46"><rect x="10" y="2" width="15" height="10" rx="3.5" fill="${color}"/><rect x="39" y="2" width="15" height="10" rx="3.5" fill="${color}"/><rect x="2" y="9" width="60" height="35" rx="9" fill="${color}"/><path d="M2 31h60v4a9 9 0 0 1-9 9H11a9 9 0 0 1-9-9z" fill="${INK}" opacity="0.1"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const card = parseCardCode((await params).code) ?? parseCardCode(allCardCodes()[0])!;
  const island = categoryMap[card.theme];
  const color = categoryColor[card.theme];
  const theme = labThemes[card.theme];
  const art = islandImage(card.theme, 380);
  const brick = brickImage(color.base);
  const [black, bolder, display] = await Promise.all([
    loadGoogleFont("Chiron GoRound TC", 900, GLYPHS),
    loadGoogleFont("Chiron GoRound TC", 700, GLYPHS),
    loadGoogleFont("Fredoka", 600, "JIE.Taoyuan"),
  ]);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#E8F5F4", padding: 30, fontFamily: "Chiron GoRound TC", color: INK }}>
        <div style={{ display: "flex", flex: 1, borderRadius: 44, background: "#FFFFFF", boxShadow: "0 18px 40px -20px rgba(0,90,85,0.45)", overflow: "hidden" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "44px 10px 36px 56px" }}>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 900, letterSpacing: 3, color: TEAL }}>{EYEBROW}</div>
            <div style={{ display: "flex", marginTop: 8, fontSize: 60, fontWeight: 900, letterSpacing: 5, color: TEAL }}>{TITLE}</div>
            <div style={{ display: "flex", marginTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", height: 46, padding: "0 22px", borderRadius: 999, background: color.soft, fontSize: 24, fontWeight: 900 }}>
                {theme.label}・{island.name}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 26 }}>
              {card.picks.map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- next/og 只支援 img */}
                  <img src={brick} width={64} height={46} alt="" />
                  <div style={{ display: "flex", fontSize: 34, fontWeight: 900, letterSpacing: 2 }}>{shortTitle(p.title)}</div>
                  <div style={{ display: "flex", fontSize: 18, fontWeight: 700, color: "#4A6768" }}>{sourceTypeLabel[p.sourceType]}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <div style={{ display: "flex", fontFamily: "Fredoka", fontSize: 32, fontWeight: 600, color: "#00A6A1" }}>JIE.Taoyuan</div>
                <div style={{ display: "flex", fontSize: 20, fontWeight: 900, color: TEAL, whiteSpace: "nowrap" }}>杰伴桃園・{HOST}</div>
              </div>
              <div style={{ display: "flex", fontSize: 18, fontWeight: 700, color: "#4A6768" }}>{site.stance}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 430, position: "relative" }}>
            <div style={{ display: "flex", position: "absolute", width: 410, height: 410, borderRadius: 999, background: color.soft }} />
            <div style={{ display: "flex", position: "absolute", top: 50, right: 34, width: 100, height: 100, borderRadius: 999, background: "#F9DE3A" }} />
            {/* eslint-disable-next-line @next/next/no-img-element -- next/og 只支援 img */}
            <img src={art.src} width={380} height={art.height} alt="" style={{ position: "relative" }} />
            <div style={{ display: "flex", position: "absolute", left: 4, bottom: 22, width: 124, height: 146 }}>
              <Penguin pose="wave" />
            </div>
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

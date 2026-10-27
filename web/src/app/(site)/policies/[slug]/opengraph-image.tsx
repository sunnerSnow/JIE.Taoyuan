import { ImageResponse } from "next/og";
import { categoryColor, categoryMap } from "@/data/categories";
import { getPolicy, policies, statusInfo } from "@/data/policies";
import { islandImage, loadNotoSansTC } from "@/lib/og";
import { site } from "@/lib/site";

// 每項政見自己的分享圖：分類、狀態、標題、一句話摘要，右側是所屬的島

export const alt = "JIE.Taoyuan 杰伴桃園政見分享圖";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}

const INK = "#193A42";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const policy = getPolicy((await params).slug) ?? policies[0];
  const category = categoryMap[policy.category];
  const color = categoryColor[policy.category];
  const status = statusInfo[policy.status];
  const art = islandImage(policy.category, 430);
  const brand = "JIE.Taoyuan 杰伴桃園";
  const heavy = `${category.no} ${category.name}${status.label}${policy.title}${brand}`;
  const bold = `${policy.summary}${site.stance}${policy.sample ? "示範資料" : ""}`;
  const [black, bolder] = await Promise.all([loadNotoSansTC(heavy, 900), loadNotoSansTC(bold, 700)]);

  const pill = { display: "flex", alignItems: "center", height: 52, padding: "0 22px", borderRadius: 999, border: `3px solid ${INK}`, fontSize: 26, fontWeight: 900 };

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#F7F4EB", padding: 28, fontFamily: "Noto Sans TC", color: INK }}>
        <div
          style={{
            display: "flex",
            flex: 1,
            borderRadius: 36,
            border: `4px solid ${INK}`,
            background: color.soft,
            boxShadow: `0 12px 0 ${INK}`,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "48px 0 40px 52px" }}>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ ...pill, background: "#FFFDF7" }}>
                {category.no} {category.name}
              </div>
              <div style={{ ...pill, background: status.tone }}>{status.label}</div>
              {policy.sample && <div style={{ ...pill, background: "#FFFDF7", color: "#B14A2F", border: "3px dashed #B14A2F" }}>示範資料</div>}
            </div>
            <div style={{ display: "flex", marginTop: 30, fontSize: policy.title.length > 16 ? 54 : 64, fontWeight: 900, lineHeight: 1.3, letterSpacing: 2 }}>
              {policy.title}
            </div>
            <div style={{ display: "flex", marginTop: 22, fontSize: 27, fontWeight: 700, lineHeight: 1.65, color: "#3E5E66", maxHeight: 136, overflow: "hidden" }}>
              {policy.summary}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: "auto" }}>
              <div style={{ display: "flex", flexShrink: 0, whiteSpace: "nowrap", fontSize: 30, fontWeight: 900 }}>{brand}</div>
              <div style={{ display: "flex", flexShrink: 0, whiteSpace: "nowrap", fontSize: 18, fontWeight: 700, color: "#3E5E66" }}>{site.stance}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 470 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- next/og 只支援 img */}
            <img src={art.src} width={430} height={art.height} alt="" />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans TC", data: black, weight: 900, style: "normal" },
        { name: "Noto Sans TC", data: bolder, weight: 700, style: "normal" },
      ],
    },
  );
}

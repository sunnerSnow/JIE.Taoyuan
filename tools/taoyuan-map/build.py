"""產生桃園市 13 區的 SVG 地圖資料（web/src/data/taoyuan-map.ts）。

資料：內政部國土測繪中心「鄉鎮市區界線」，由 taiwan-atlas（MIT 授權，https://github.com/dkaoster/taiwan-atlas）轉成 TopoJSON。
用法：python build.py <towns-10t.json 的路徑>
  先下載 https://cdn.jsdelivr.net/npm/taiwan-atlas@2021.9.20/towns-10t.json
步驟：解出桃園市的區界 → 等距圓柱投影（以桃園中心緯度校正）→ 共用的邊界只簡化一次（相鄰兩區不會出現縫隙）
→ 每區找一個離邊界最遠的內部點（放區名與企鵝腳丫）→ 輸出 TypeScript。
"""

import json
import math
import sys
from pathlib import Path

WIDTH = 1000  # viewBox 寬度；高度依比例
PAD = 24
TOLERANCE = 1.2  # 簡化容許誤差（viewBox 單位）

ORDER = ["桃園區", "中壢區", "平鎮區", "八德區", "楊梅區", "蘆竹區", "大溪區", "龍潭區", "龜山區", "大園區", "觀音區", "新屋區", "復興區"]


def decode_arcs(topo):
    sx, sy = topo["transform"]["scale"]
    tx, ty = topo["transform"]["translate"]
    arcs = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx
            y += dy
            pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)
    return arcs


def simplify(points, tol):
    """Douglas–Peucker，保留頭尾（頭尾是和其他區共用的節點）"""
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        a, b = stack.pop()
        (x1, y1), (x2, y2) = points[a], points[b]
        dx, dy = x2 - x1, y2 - y1
        norm = math.hypot(dx, dy) or 1e-12
        far, idx = 0.0, -1
        for i in range(a + 1, b):
            px, py = points[i]
            d = abs(dy * (px - x1) - dx * (py - y1)) / norm
            if d > far:
                far, idx = d, i
        if far > tol and idx > 0:
            keep[idx] = True
            stack += [(a, idx), (idx, b)]
    return [p for p, k in zip(points, keep) if k]


def inside(pt, ring):
    x, y = pt
    c = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


def seg_dist(p, a, b):
    (px, py), (ax, ay), (bx, by) = p, a, b
    dx, dy = bx - ax, by - ay
    t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / ((dx * dx + dy * dy) or 1e-12)))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)


def label_point(rings):
    """最大的那塊多邊形裡，離邊界最遠的格點（簡化版 polylabel）"""
    ring = max(rings, key=lambda r: abs(sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(r, r[1:] + r[:1]))))
    xs, ys = [p[0] for p in ring], [p[1] for p in ring]
    best, best_d = None, -1
    steps = 60
    for i in range(steps + 1):
        for j in range(steps + 1):
            p = (min(xs) + (max(xs) - min(xs)) * i / steps, min(ys) + (max(ys) - min(ys)) * j / steps)
            if not inside(p, ring):
                continue
            d = min(seg_dist(p, a, b) for a, b in zip(ring, ring[1:] + ring[:1]))
            if d > best_d:
                best, best_d = p, d
    return best


def main(src):
    topo = json.loads(Path(src).read_text(encoding="utf-8"))
    arcs = decode_arcs(topo)
    towns = [g for g in topo["objects"]["towns"]["geometries"] if g["properties"].get("COUNTYNAME") == "桃園市"]
    assert sorted(g["properties"]["TOWNNAME"] for g in towns) == sorted(ORDER), "桃園市的區和預期的 13 區不一樣"

    # 用到的 arc 才投影；投影中心取桃園的經緯度中點
    used = {i if i >= 0 else ~i for g in towns for poly in (g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]]) for ring in poly for i in ring}
    lons = [x for i in used for x, _ in arcs[i]]
    lats = [y for i in used for _, y in arcs[i]]
    lat0 = (min(lats) + max(lats)) / 2
    k = math.cos(math.radians(lat0))
    w0 = (max(lons) - min(lons)) * k
    h0 = max(lats) - min(lats)
    scale = (WIDTH - 2 * PAD) / w0
    height = round(h0 * scale + 2 * PAD)

    def project(lon, lat):
        return ((lon - min(lons)) * k * scale + PAD, (max(lats) - lat) * scale + PAD)

    proj = {i: simplify([project(*p) for p in arcs[i]], TOLERANCE) for i in used}

    def arc_pts(i):
        return proj[i] if i >= 0 else list(reversed(proj[~i]))

    shapes = {}
    for g in towns:
        name = g["properties"]["TOWNNAME"]
        polys = g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]]
        d, rings = [], []
        for poly in polys:
            for ring in poly:
                pts = []
                for i in ring:
                    a = arc_pts(i)
                    pts.extend(a if not pts else a[1:])
                rings.append(pts[:-1] if pts[0] == pts[-1] else pts)
                d.append("M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in rings[-1]) + "Z")
        lx, ly = label_point(rings)
        shapes[name] = {"d": "".join(d), "label": [round(lx, 1), round(ly, 1)]}

    out = Path(__file__).resolve().parents[2] / "web/src/data/taoyuan-map.ts"
    lines = [
        "// 桃園市 13 區的簡化行政區界（SVG 路徑），由 tools/taoyuan-map/build.py 產生，不要手改。",
        "// 資料：內政部國土測繪中心「鄉鎮市區界線」（政府資料開放授權），經 taiwan-atlas（MIT）轉成 TopoJSON。",
        'import type { District } from "./trail";',
        "",
        f'export const mapViewBox = "0 0 {WIDTH} {height}";',
        "",
        "/** 每區的輪廓與標籤位置（離邊界最遠的內部點，區名與企鵝腳丫放這裡） */",
        "export const districtShapes: Record<District, { d: string; label: [number, number] }> = {",
    ]
    for name in ORDER:
        s = shapes[name]
        lines.append(f'  {name}: {{ label: [{s["label"][0]}, {s["label"][1]}], d: "{s["d"]}" }},')
    lines += ["};", ""]
    out.write_text("\n".join(lines), encoding="utf-8", newline="\n")
    print(f"寫入 {out}（{out.stat().st_size / 1024:.1f} KB，viewBox 0 0 {WIDTH} {height}）")


if __name__ == "__main__":
    main(sys.argv[1])

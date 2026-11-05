"""產生車隊掃街的路線圖資料（web/src/data/route-maps.ts）。

資料：OpenStreetMap 的道路（© OpenStreetMap 貢獻者，ODbL），經 Overpass API 下載。
用法：python build.py [--cache 目錄]
  讀 web/src/data/schedule.ts 裡有 route 的場次，依公告的路名順序沿著道路走：
  從起點所在的路出發 → 每條路走到和下一條路交會的路口（取沿路最近的那個）→ 最後回到起點。
  「加油打氣站」不是路名，畫路線時略過（只寫在路線文字裡）。
  公告的路名和 OSM 寫法不同時，在 ALIASES 對照；起點座標寫在 PLACES。
輸出：每場一張圖的 SVG 路徑（背景道路分三級、鐵路、路線、行進方向的箭頭）、起點位置與路名標籤位置。
"""

import heapq
import json
import math
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCHEDULE = ROOT / "web/src/data/schedule.ts"
OUT = ROOT / "web/src/data/route-maps.ts"

# 桃園區附近（南、西、北、東）
BBOX = (24.955, 121.270, 25.030, 121.345)
WIDTH = 1000  # viewBox 寬度
UA = "JIE.Taoyuan-route-map/1.0 (https://github.com/sunnerSnow/JIE.Taoyuan)"

# 公告路名 → OSM 路名
ALIASES = {
    "春日路橋": "春日路",  # OSM 沒有獨立的橋名，跨鐵路那段就是春日路
    "民族路橋": "民族陸橋",  # 11/4 路線更新貼文也寫「民族陸橋」
    "金門二路": "金門二街",  # 延平路與保羅街之間只有金門二街
}
# 公告當成同一條路、OSM 分成不同路名的延續段
EXTENSIONS = {
    "民光東路": ["民光路", "民光橋"],  # 民光東路西端接民光橋、民光路，才到中正路
}
# 起點（OSM 地址點）：場次的 place → (緯度, 經度, 起點所在的路)
PLACES = {
    "北桃園競選總部": (24.9995472, 121.3092859, "三民路"),  # 桃園區三民路二段300號
}

MAJOR = {"motorway", "trunk", "primary", "secondary", "motorway_link", "trunk_link", "primary_link", "secondary_link"}
MID = {"tertiary", "tertiary_link", "unclassified"}
MINOR = {"residential", "living_street"}


def overpass(cache: Path | None):
    if cache and (cache / "osm.json").exists():
        return json.loads((cache / "osm.json").read_text(encoding="utf-8"))
    s, w, n, e = BBOX
    kinds = "|".join(sorted(MAJOR | MID | MINOR))
    query = f'[out:json][timeout:90];(way["highway"~"^({kinds})$"]({s},{w},{n},{e});way["railway"="rail"]({s},{w},{n},{e}););out tags geom;'
    data = urllib.parse.urlencode({"data": query}).encode()
    for i in range(6):
        try:
            req = urllib.request.Request("https://overpass-api.de/api/interpreter", data=data, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=180) as r:
                osm = json.loads(r.read().decode("utf-8"))
            break
        except (urllib.error.URLError, TimeoutError) as err:
            # 只有伺服器忙碌（429、5xx）、逾時或連線失敗才退避重試；查詢寫錯（其他 4xx）直接停
            if isinstance(err, urllib.error.HTTPError) and err.code != 429 and err.code < 500:
                sys.exit(f"Overpass 回應 {err.code}：{err.read().decode('utf-8', 'replace')[:300]}")
            print(f"Overpass 失敗（{err}），{10 * 2**i} 秒後重試", file=sys.stderr)
            time.sleep(10 * 2**i)
    else:
        sys.exit("Overpass 一直失敗，稍後再試")
    if cache:
        cache.mkdir(parents=True, exist_ok=True)
        (cache / "osm.json").write_text(json.dumps(osm, ensure_ascii=False), encoding="utf-8")
    return osm


def read_routes():
    """從 schedule.ts 讀出有路線的場次：日期、時間、地點、路名清單"""
    src = SCHEDULE.read_text(encoding="utf-8")
    routes = []
    for day in re.finditer(r'date: "(\d{4}-\d\d-\d\d)",\s*items: \[(.*?)\n    \],\n    sources', src, re.S):
        date, body = day.group(1), day.group(2)
        starts = [m.start() for m in re.finditer(r'time: "', body)] + [len(body)]
        for a, b in zip(starts, starts[1:]):
            item = body[a:b]
            route = re.search(r"route: \[(.*?)\]", item, re.S)
            if not route:
                continue
            time_ = re.match(r'time: "(\d\d:\d\d)"', item).group(1)
            place = re.search(r'place: "([^"]+)"', item).group(1)
            routes.append({"key": f"{date} {time_}", "place": place, "stops": re.findall(r'"([^"]+)"', route.group(1))})
    return routes


LAT0 = math.radians((BBOX[0] + BBOX[2]) / 2)


def meters(a, b):
    dx = (b[1] - a[1]) * math.cos(LAT0) * 111320
    dy = (b[0] - a[0]) * 110540
    return math.hypot(dx, dy)


def road_matcher(name):
    # 公告寫「大興西路一段」，實際會接著走到二段：同一條路的各段都算
    target = re.sub(r"[一二三四五六七八九]段$", "", ALIASES.get(name, name))
    # 過河的那段常另外叫「X橋」（例如南平路的南平橋），也算同一條路
    bridge = [re.sub(r"[路街]$", "橋", target)] if re.search(r"[路街]$", target) else []
    names = "|".join(re.escape(t) for t in [target, *bridge, *EXTENSIONS.get(target, [])])
    pat = re.compile(rf"(?:{names})([一二三四五六七八九]段)?$")
    return lambda n: bool(n) and bool(pat.match(n))


def components(graph):
    seen, out = set(), []
    for s in graph:
        if s in seen:
            continue
        comp, stack = {s}, [s]
        seen.add(s)
        while stack:
            for v, _ in graph[stack.pop()]:
                if v not in seen:
                    seen.add(v)
                    comp.add(v)
                    stack.append(v)
        out.append(comp)
    return out


def build_graph(ways, match, bridge=True):
    graph = {}
    for w in ways:
        if not match(w["tags"].get("name", "")):
            continue
        pts = [(p["lat"], p["lon"]) for p in w["geometry"]]
        for a, b in zip(pts, pts[1:]):
            d = meters(a, b)
            graph.setdefault(a, []).append((b, d))
            graph.setdefault(b, []).append((a, d))
    if not bridge:
        return graph
    # 雙向分隔的路在路口常由別的路名的短線段接起來，同一條路會斷成幾段：相距 90 公尺內的兩段補一條連線（橋另有名字時，例如民光東路的天助橋）
    comps = components(graph)
    for i, a in enumerate(comps):
        for b in comps[i + 1 :]:
            d, p, q = min((meters(p, q), p, q) for p in a for q in b)
            if d < 90:
                graph[p].append((q, d))
                graph[q].append((p, d))
    return graph


def shortest(graph, start, targets):
    """沿同一條路走到最近的目標點，回傳 (距離, 路徑)"""
    dist = {start: 0.0}
    prev = {}
    heap = [(0.0, start)]
    while heap:
        d, u = heapq.heappop(heap)
        if u in targets:
            path = [u]
            while path[-1] != start:
                path.append(prev[path[-1]])
            return d, path[::-1]
        if d > dist.get(u, math.inf):
            continue
        for v, w in graph.get(u, []):
            nd = d + w
            if nd < dist.get(v, math.inf):
                dist[v] = nd
                prev[v] = u
                heapq.heappush(heap, (nd, v))
    return None


def trace(ways, network, route):
    lat, lon, start_road = PLACES[route["place"]]
    # 起點所在的路 → 公告的路名（略過加油打氣站，連續同名的合併）→ 回到起點所在的路
    seq = [start_road] + [s for s in route["stops"] if "加油打氣站" not in s] + [start_road]
    names = [n for i, n in enumerate(seq) if i == 0 or ALIASES.get(n, n) != ALIASES.get(seq[i - 1], seq[i - 1])]
    graphs = [build_graph(ways, road_matcher(n)) for n in names]
    for n, g in zip(names, graphs):
        if not g:
            sys.exit(f"{route['key']}：OSM 找不到「{n}」")
    here = min(graphs[0], key=lambda p: meters(p, (lat, lon)))
    path = [here]
    legs = []
    for i, (name, g) in enumerate(zip(names, graphs)):
        jump = {}
        if i + 1 < len(names):
            nxt = graphs[i + 1]
            targets = set(g) & set(nxt)
            if not targets:
                # 路口的節點沒有共用（例如路口由別的路名的短線段接起來）：80 公尺內最近的點當作轉彎處
                for p in g:
                    q = min(nxt, key=lambda q: meters(p, q))
                    if meters(p, q) < 80:
                        jump[p] = q
                targets = set(jump)
            if not targets:
                # 公告的兩條路沒有相交（例如慈文路只接到民生路、沒接到春日路）：沿一般道路走最短的路接過去
                found = shortest(network, here, set(nxt))
                if not found:
                    sys.exit(f"{route['key']}：「{name}」和「{names[i + 1]}」之間找不到可以接的路")
                d, seg = found
                print(f"  ※ {name} 和 {names[i + 1]} 沒有相交，沿一般道路接 {d:.0f} 公尺", file=sys.stderr)
                legs.append((name, d, seg))
                path += seg[1:]
                here = seg[-1]
                continue
        else:
            targets = {min(g, key=lambda p: meters(p, (lat, lon)))}
        found = shortest(g, here, targets)
        if not found:
            sys.exit(f"{route['key']}：沿「{name}」走不到「{names[i + 1] if i + 1 < len(names) else '終點'}」")
        d, seg = found
        if seg[-1] in jump:
            seg = seg + [jump[seg[-1]]]
        legs.append((name, d, seg))
        path += seg[1:]
        here = seg[-1]
    return (lat, lon), path, legs


def simplify(points, tol):
    if len(points) < 3:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy)
    if norm < 1e-6:  # 頭尾同一點（繞一圈回到起點）：先在離起點最遠的地方切成兩半
        idx = max(range(len(points)), key=lambda i: math.hypot(points[i][0] - x1, points[i][1] - y1))
        if idx in (0, len(points) - 1):
            return [points[0], points[-1]]
        return simplify(points[: idx + 1], tol)[:-1] + simplify(points[idx:], tol)
    far, idx = 0.0, 0
    for i, (x, y) in enumerate(points[1:-1], 1):
        dist = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / norm
        if dist > far:
            far, idx = dist, i
    if far <= tol:
        return [points[0], points[-1]]
    return simplify(points[: idx + 1], tol)[:-1] + simplify(points[idx:], tol)


def svg_path(lines):
    out = []
    for pts in lines:
        if len(pts) >= 2:
            out.append("M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts))
    return "".join(out)


def arrows(points, every, size):
    """沿路線每隔一段距離放一個指向前進方向的小箭頭（V 字）"""
    out, acc = [], every / 2
    for (x1, y1), (x2, y2) in zip(points, points[1:]):
        seg = math.hypot(x2 - x1, y2 - y1)
        while seg and acc <= seg:
            t = acc / seg
            cx, cy = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
            ux, uy = (x2 - x1) / seg, (y2 - y1) / seg
            bx, by = cx - ux * size, cy - uy * size
            out.append(f"M{bx - uy * size * 0.8:.1f} {by + ux * size * 0.8:.1f}L{cx:.1f} {cy:.1f}L{bx + uy * size * 0.8:.1f} {by - ux * size * 0.8:.1f}")
            acc += every
        acc -= seg
    return "".join(out)


def render(osm, network, route):
    ways = [e for e in osm["elements"] if e["type"] == "way"]
    roads = [w for w in ways if "highway" in w["tags"]]
    start, path, legs = trace(roads, network, route)
    total = sum(d for _, d, _ in legs)
    print(f"{route['key']}：{len(legs)} 段，共 {total / 1000:.1f} 公里", file=sys.stderr)
    for name, d, _ in legs:
        print(f"  {name} {d:.0f} 公尺", file=sys.stderr)

    # 範圍：路線外框加 12% 邊界，長寬比限制在 3:4～4:3
    lats = [p[0] for p in path]
    lons = [p[1] for p in path]
    cx = (min(lons) + max(lons)) / 2
    cy = (min(lats) + max(lats)) / 2
    w = (max(lons) - min(lons)) * math.cos(LAT0) * 1.24
    h = (max(lats) - min(lats)) * 1.24
    w, h = max(w, h * 0.75), max(h, w * 0.75)
    scale = WIDTH / w
    height = round(h * scale)

    def xy(p):
        return ((p[1] - cx) * math.cos(LAT0) * scale + WIDTH / 2, (cy - p[0]) * scale + height / 2)

    def inside(pts):
        return any(-50 <= x <= WIDTH + 50 and -50 <= y <= height + 50 for x, y in pts)

    layers = {"major": [], "mid": [], "minor": [], "rail": []}
    for wy in ways:
        pts = [xy((p["lat"], p["lon"])) for p in wy["geometry"]]
        if not inside(pts):
            continue
        hw = wy["tags"].get("highway")
        layer = "rail" if wy["tags"].get("railway") == "rail" else "major" if hw in MAJOR else "mid" if hw in MID else "minor" if hw in MINOR else None
        if layer:
            layers[layer].append(simplify(pts, 1.2))
    line = simplify([xy(p) for p in path], 0.6)

    # 路名標籤：每條路取走最長的那段，放在中點；和已放的標籤重疊就跳過。起點的圓點和右邊的「起點・終點」標籤先佔位
    sx, sy = xy(start)
    labels, boxes = [], [(sx - 40, sy - 40, sx + 240, sy + 40)]
    shown = {ALIASES.get(n, n): n for n in route["stops"] if "加油打氣站" not in n}
    best = {}
    for name, d, seg in legs:
        key = ALIASES.get(name, name)
        if d > best.get(key, (0, None))[0]:
            best[key] = (d, seg)
    for key, (d, seg) in sorted(best.items(), key=lambda kv: -kv[1][0]):
        if d < 250:
            continue
        x, y = xy(seg[len(seg) // 2])
        text = shown.get(key, key)
        bw, bh = len(text) * 30 + 24, 44
        box = (x - bw / 2, y - bh / 2, x + bw / 2, y + bh / 2)
        if box[0] < 0 or box[2] > WIDTH or box[1] < 0 or box[3] > height:
            continue
        if any(not (box[2] < b[0] or box[0] > b[2] or box[3] < b[1] or box[1] > b[3]) for b in boxes):
            continue
        boxes.append(box)
        labels.append({"x": round(x, 1), "y": round(y, 1), "text": text})

    return {
        "width": WIDTH,
        "height": height,
        "km": round(total / 1000, 1),
        "major": svg_path(layers["major"]),
        "mid": svg_path(layers["mid"]),
        "minor": svg_path(layers["minor"]),
        "rail": svg_path(layers["rail"]),
        "route": svg_path([line]),
        "arrows": arrows(line, 70, 9),
        "start": [round(sx, 1), round(sy, 1)],
        "labels": labels,
    }


def main():
    cache = None
    if "--cache" in sys.argv:
        cache = Path(sys.argv[sys.argv.index("--cache") + 1])
    routes = read_routes()
    if not routes:
        sys.exit("schedule.ts 裡沒有路線")
    osm = overpass(cache)
    # 所有道路（不分路名、不補連線），用來接公告裡沒有相交的兩條路
    network = build_graph([e for e in osm["elements"] if e["type"] == "way" and "highway" in e["tags"]], lambda n: True, bridge=False)
    maps = {r["key"]: render(osm, network, r) for r in routes}
    body = json.dumps(maps, ensure_ascii=False, indent=2)
    OUT.write_text(
        "// 由 tools/route-map/build.py 產生，請勿手動修改（改了路線就重跑：python tools/route-map/build.py）。\n"
        "// 車隊掃街的路線圖：鍵是「日期 時間」；座標是 viewBox 單位（寬 1000）。路網：© OpenStreetMap 貢獻者（ODbL）。\n\n"
        "export type RouteMap = {\n  width: number;\n  height: number;\n  /** 沿路線量出的總長（公里） */\n  km: number;\n"
        "  major: string;\n  mid: string;\n  minor: string;\n  rail: string;\n  route: string;\n  arrows: string;\n"
        "  start: [number, number];\n  labels: { x: number; y: number; text: string }[];\n};\n\n"
        f"export const routeMaps: Record<string, RouteMap> = {body};\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"已寫入 {OUT.relative_to(ROOT)}（{OUT.stat().st_size // 1024} KB）", file=sys.stderr)


if __name__ == "__main__":
    main()

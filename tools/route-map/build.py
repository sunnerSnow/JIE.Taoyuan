"""產生車隊掃街的路線圖資料（web/src/data/route-maps.ts）。

資料：OpenStreetMap 的道路（© OpenStreetMap 貢獻者，ODbL），經 Overpass API 下載。
用法：python build.py [--cache 目錄]
  讀 web/src/data/schedule.ts 裡有 route 的場次，依公告的路名順序沿著道路走：
  從起點所在的路出發 → 每條路走到和下一條路交會的路口（取沿路最近的那個）→ 最後到終點（有 finish 時），沒有就回到起點。
  公告把同一條路的幾段寫在一起（「南山路一段、二段、三段」）時，取第一段的路名、各段都算。
  路線裡不是路名的點（打氣站、競總、火車站、宮廟）畫路線時略過；有查到地點的（STATIONS）在圖上另外標出來。
  每場只下載起點、終點附近的路網（各往外約 6 公里），快取依範圍分檔。
  公告的路名和 OSM 寫法不同時，在 ALIASES 對照；起點座標寫在 PLACES；看圖認路用的地標寫在 LANDMARKS。
輸出：每場一張圖的 SVG 路徑（背景道路分三級、鐵路、路線、行進方向的箭頭），以及要疊在圖上的東西：
  起點、每條路的順序號碼（和路線清單的號碼一致）、加油打氣站、地標、路名標籤；路線清單（chips）。
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

# 每場的路網範圍：起點、終點各往外這麼多度（約 6～7 公里）
MARGIN = (0.06, 0.07)
LAT0 = math.radians(24.95)  # 桃園的緯度，用來把經度換算成公尺
WIDTH = 1000  # viewBox 寬度
UA = "JIE.Taoyuan-route-map/1.0 (https://github.com/sunnerSnow/JIE.Taoyuan)"

# 公告路名 → OSM 路名
ALIASES = {
    "春日路橋": "春日路",  # OSM 沒有獨立的橋名，跨鐵路那段就是春日路
    "民族路橋": "民族陸橋",  # 11/4 路線更新貼文也寫「民族陸橋」
    "金門二路": "金門二街",  # 延平路與保羅街之間只有金門二街
    "南崁路四段": "南竹路四段",  # 11/6 路線寫「南崁路四段、五段」，OSM 的南崁路只有一、二段；接在南竹路三段後、通往大竹路的是南竹路四、五段（推測）
}
# 公告當成同一條路、OSM 分成不同路名的延續段
EXTENSIONS = {
    "民光東路": ["民光路", "民光橋"],  # 民光東路西端接民光橋、民光路，才到中正路
}
# 起點、終點（座標取自 OSM）：場次的 place 或 finish 的名稱 → (緯度, 經度, 所在的路)
PLACES = {
    "北桃園競選總部": (24.9995472, 121.3092859, "三民路"),  # 桃園區三民路二段300號
    "南崁五福宮": (25.053736, 121.295393, "五福路"),  # 蘆竹區五福路1號
    "蘆竹德林寺": (25.005815, 121.258602, "龍安街"),  # 龍安街二段985號
    "平鎮區民族路二段219號前": (24.956843, 121.202636, "民族路"),
    "平鎮區中豐路山頂段469巷": (24.8944, 121.2120, "中豐路"),
    "平鎮南天宮": (24.953444, 121.177344, "雙榮路"),  # 楊梅區雙榮路226號
    "奉天宮": (24.948736, 121.117093, "中華南路二段480巷"),  # 楊梅奉天宮（官方路線圖寫「楊梅奉天宮（終點）」）
    "南競辦公室": (24.9660243, 121.240583, "中華路二段"),  # 中壢區中華路二段128號（OSM 地址點）
    "南方莊園飯店": (24.9678279, 121.1780223, "樹籽路"),  # 中壢區樹籽路8號（OSM 地址點）
}

# 加油打氣站：公告的站名 → (圖上的名字, 緯度, 經度)。有查到地點的才畫，其他只寫在路線清單裡
STATIONS = {
    # 桃園市議會議員介紹頁：黃瓊慧議員服務處在桃園區中山路129號（座標是 OSM 的地址點）
    "黃瓊慧 加油打氣站": ("黃瓊慧服務處", 24.99372, 121.30996),
}
# 看圖認路用的地標（座標取自 OSM；公園、展演中心取鄰近的站點位置，畫在圖上只是示意）
LANDMARKS = [
    ("桃園車站", 24.98873, 121.31378),
    ("桃園市政府", 24.99325, 121.30098),
    ("景福宮", 24.99407, 121.31025),
    ("南門市場", 24.99281, 121.30711),
    ("桃園巨蛋", 24.99364, 121.32497),
    ("三民運動公園", 25.00058, 121.31969),
    ("大有梯田生態公園", 25.0126, 121.32149),
    ("中正公園", 25.02304, 121.29838),
    ("陽明運動公園", 24.98229, 121.30813),
    ("桃園展演中心", 25.0173, 121.2992),
    ("台茂購物中心", 25.05341, 121.2884),
    ("蘆竹區公所", 25.04694, 121.29519),
    ("光明河濱公園", 25.04596, 121.2872),
    ("山腳國小", 25.0888, 121.28817),
    ("大竹國小", 25.02513, 121.25887),
    ("高鐵桃園站", 25.0128, 121.2148),
    ("楊梅車站", 24.914352, 121.146507),
    ("埔心車站", 24.919609, 121.18353),
    ("富岡車站", 24.93409, 121.082822),
    ("中壢車站", 24.95332, 121.22616),
    ("平鎮區公所", 24.94573, 121.21836),
    ("新勢公園", 24.95181, 121.21667),
    ("平鎮褒忠祠", 24.94744, 121.205),
    ("忠貞市場", 24.9289, 121.25296),
    ("平鎮高中", 24.93904, 121.21906),
    ("南勢國小", 24.91387, 121.21145),
    ("內壢車站", 24.97256, 121.25835),
]

MAJOR = {"motorway", "trunk", "primary", "secondary", "motorway_link", "trunk_link", "primary_link", "secondary_link"}
MID = {"tertiary", "tertiary_link", "unclassified"}
MINOR = {"residential", "living_street"}


def overpass(cache: Path | None, bbox):
    s, w, n, e = bbox
    name = f"osm-{s:.2f}-{w:.2f}-{n:.2f}-{e:.2f}.json"
    if cache and (cache / name).exists():
        return json.loads((cache / name).read_text(encoding="utf-8"))
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
        (cache / name).write_text(json.dumps(osm, ensure_ascii=False), encoding="utf-8")
    return osm


def route_bbox(route):
    """起點、終點各往外 MARGIN，取兩者的外框；小數點後兩位，同一區的場次共用快取"""
    pts = [PLACES[route["place"]]] + ([PLACES[route["finish"]]] if route["finish"] else [])
    dl, dw = MARGIN
    return (
        math.floor((min(p[0] for p in pts) - dl) * 100) / 100,
        math.floor((min(p[1] for p in pts) - dw) * 100) / 100,
        math.ceil((max(p[0] for p in pts) + dl) * 100) / 100,
        math.ceil((max(p[1] for p in pts) + dw) * 100) / 100,
    )


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
            finish = re.search(r'finish: "([^"（(]+)', item)
            routes.append(
                {"key": f"{date} {time_}", "place": place, "finish": finish and finish.group(1), "stops": re.findall(r'"([^"]+)"', route.group(1))}
            )
    return routes



def meters(a, b):
    dx = (b[1] - a[1]) * math.cos(LAT0) * 111320
    dy = (b[0] - a[0]) * 110540
    return math.hypot(dx, dy)


def is_road(stop):
    """路線裡的一站是不是路名（路、街、段、巷、弄、道、橋結尾）；不是的就是打氣站、競總、火車站、宮廟這類地點"""
    return bool(re.search(r"(路|街|段|巷|弄|道|橋)$", stop.split("、")[0]))


def road_key(name):
    """公告的路名 → 比對用的路名：去掉開頭的區名（「中壢區康樂路」），多段寫在一起取第一段（「南山路一段、二段」→「南山路一段」），再查 ALIASES"""
    name = re.sub(r"^\S{2}區", "", name.split("、")[0])
    return ALIASES.get(name, name)


def road_matcher(name):
    # 公告寫「大興西路一段」，實際會接著走到二段：同一條路的各段都算
    target = re.sub(r"[一二三四五六七八九]段$", "", road_key(name))
    # 過河的那段常另外叫「X橋」（例如南平路的南平橋），也算同一條路
    bridge = [re.sub(r"[路街]$", "橋", target)] if re.search(r"[路街]$", target) else []
    names = "|".join(re.escape(t) for t in [target, *bridge, *EXTENSIONS.get(target, [])])
    pat = re.compile(rf"(?:{names})([一二三四五六七八九]段|[^路街巷、]{{1,3}}段)?$")  # 也接受「中豐路山頂段」這種路段名
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


def same_road(a, b):
    return re.sub(r"[一二三四五六七八九]段$", "", road_key(a)) == re.sub(r"[一二三四五六七八九]段$", "", road_key(b))


def trace(ways, network, route, missing):
    if route["place"] not in PLACES or (route["finish"] and route["finish"] not in PLACES):
        sys.exit(f"{route['key']}：PLACES 沒有「{route['place']}」或「{route['finish']}」的座標")
    slat, slon, start_road = PLACES[route["place"]]
    lat, lon, end_road = PLACES[route["finish"]] if route["finish"] else (slat, slon, start_road)
    # 起點所在的路 → 公告的路名（略過打氣站，連續同一條路的合併）→ 終點所在的路（沒有終點就回到起點）
    seq = [start_road] + [s for s in route["stops"] if is_road(s) and s not in missing] + [end_road]
    names = [n for i, n in enumerate(seq) if i == 0 or not same_road(n, seq[i - 1])]
    graphs = [build_graph(ways, road_matcher(n)) for n in names]
    for n, g in zip(names, graphs):
        if not g:
            sys.exit(f"{route['key']}：OSM 找不到「{n}」")
    here = min(graphs[0], key=lambda p: meters(p, (slat, slon)))
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
            # 同一條路在 OSM 斷成相距較遠的幾段（例如坑菓路中間是另外命名的便橋）：沿一般道路接過去
            found = shortest(network, here, targets)
            if not found:
                sys.exit(f"{route['key']}：沿「{name}」走不到「{names[i + 1] if i + 1 < len(names) else '終點'}」")
            print(f"  ※ {name} 在 OSM 斷成幾段，中間沿一般道路接 {found[0]:.0f} 公尺", file=sys.stderr)
        d, seg = found
        if seg[-1] in jump:
            seg = seg + [jump[seg[-1]]]
        legs.append((name, d, seg))
        path += seg[1:]
        here = seg[-1]
    return (slat, slon), (lat, lon), path, legs


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
    # OSM 沒有名字的小巷（例如環南路309巷）畫不出來：略過，路線清單照列但不編號
    missing = {st for st in route["stops"] if is_road(st) and not any(road_matcher(st)(w["tags"].get("name", "")) for w in roads)}
    for st in sorted(missing):
        print(f"  ※ OSM 找不到「{st}」，路線圖略過這段", file=sys.stderr)
    start, end, path, legs = trace(roads, network, route, missing)
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

    sx, sy = xy(start)
    ex, ey = xy(end)
    loop = route["finish"] is None
    boxes = [(sx - 40, sy - 40, sx + (240 if loop else 140), sy + 40)]  # 起點的圓點和右邊的「起點・終點」（或「起點」）標籤先佔位
    if not loop:
        boxes.append((ex - 40, ey - 40, ex + 140, ey + 40))

    def overlaps(box):
        return sum(not (box[2] < b[0] or box[0] > b[2] or box[3] < b[1] or box[1] > b[3]) for b in boxes)

    def free(box):
        return 0 <= box[0] and box[2] <= WIDTH and 0 <= box[1] and box[3] <= height and not overlaps(box)

    def on_route(box):
        return any(box[0] <= x <= box[2] and box[1] <= y <= box[3] for x, y in line)

    def along(seg, t):
        """沿一段路走到 t（0～1）的位置"""
        d = [0.0]
        for a, b in zip(seg, seg[1:]):
            d.append(d[-1] + meters(a, b))
        goal = d[-1] * t
        for i in range(1, len(seg)):
            if d[i] >= goal:
                r = (goal - d[i - 1]) / ((d[i] - d[i - 1]) or 1)
                return xy((seg[i - 1][0] + (seg[i][0] - seg[i - 1][0]) * r, seg[i - 1][1] + (seg[i][1] - seg[i - 1][1]) * r))
        return xy(seg[-1])

    # 路線清單與順序號碼：每換一條路加一號（連續同一條路、加油打氣站不加號）；第 0 段是從起點出發的那條路，不編號
    chips, k, prev = [], 0, PLACES[route["place"]][2]
    for stop in route["stops"]:
        if not is_road(stop) or stop in missing:
            chips.append({"text": stop, "station": True, "mapped": stop in STATIONS})
            continue
        if not same_road(stop, prev):
            k += 1
            chips.append({"n": k, "text": stop})
        else:
            chips.append({"text": stop})
        prev = stop

    # 加油打氣站：有地點的才畫；離路線太遠代表地點或路線有問題
    stations = []
    for stop in route["stops"]:
        if stop not in STATIONS:
            continue
        text, slat, slon = STATIONS[stop]
        gap = min(meters((slat, slon), q) for q in path)
        if gap > 120:
            print(f"  ※ {text} 離路線 {gap:.0f} 公尺，請確認", file=sys.stderr)
        x, y = xy((slat, slon))
        boxes.append((x - 30, y - 30, x + 30 + len(text) * 34 + 30, y + 30))
        stations.append({"x": round(x, 1), "y": round(y, 1), "text": text})

    # 地標：點在原位，名字放右邊或左邊（優先選不會蓋到路線的那邊；都放不下就不放）。地標比號碼先放，號碼再避開地標
    landmarks, landmark_boxes = [], []
    for text, llat, llon in LANDMARKS:
        x, y = xy((llat, llon))
        bw = len(text) * 28 + 36
        sides = [("right", (x - 14, y - 22, x + bw, y + 22)), ("left", (x - bw, y - 22, x + 14, y + 22))]
        sides = [sd for sd in sides if free(sd[1])]
        if sides:
            side, box = min(sides, key=lambda sd: on_route(sd[1]))
            boxes.append(box)
            landmarks.append({"x": round(x, 1), "y": round(y, 1), "text": text, "side": side})
            landmark_boxes.append((landmarks[-1], box))

    # 號碼圓圈放在那條路的中間；和已放的東西重疊就往前或往後挪。都會重疊時：600 公尺以上的路取重疊最少的位置照放，
    # 更短的路（市區連續轉彎）就不畫在圖上，只留在路線清單，免得號碼疊成一團
    steps = []
    for n in range(1, k + 1):
        _, dist, seg = legs[n]
        spots = [along(seg, t) for t in (0.5, 0.35, 0.65, 0.2, 0.8, 0.1, 0.9)]
        x, y = min(spots, key=lambda q: overlaps((q[0] - 26, q[1] - 26, q[0] + 26, q[1] + 26)))
        box = (x - 26, y - 26, x + 26, y + 26)
        if overlaps(box) and dist < 600:
            continue
        boxes.append(box)
        steps.append({"n": n, "x": round(x, 1), "y": round(y, 1)})

    # 長路段的號碼一定要畫，還是蓋到地標名字時，把名字換到另一邊；另一邊也放不下就照舊（不拿掉地標）
    step_boxes = [(st["x"] - 26, st["y"] - 26, st["x"] + 26, st["y"] + 26) for st in steps]
    hit = lambda a, b: not (a[2] < b[0] or a[0] > b[2] or a[3] < b[1] or a[1] > b[3])  # noqa: E731
    for lm, box in landmark_boxes:
        if not any(hit(box, sb) for sb in step_boxes):
            continue
        boxes.remove(box)
        x, bw = lm["x"], len(lm["text"]) * 28 + 36
        flipped = (x - bw, box[1], x + 14, box[3]) if lm["side"] == "right" else (x - 14, box[1], x + bw, box[3])
        if free(flipped) and not any(hit(flipped, sb) for sb in step_boxes):
            lm["side"] = "left" if lm["side"] == "right" else "right"
            boxes.append(flipped)
        else:
            boxes.append(box)

    # 路名標籤：每條路取走最長的那段，放在四分之一處（中間留給號碼）；放不下就跳過
    labels = []
    shown = {road_key(n): n.split("、")[0] for n in route["stops"] if is_road(n)}
    best = {}
    for name, d, seg in legs:
        key = road_key(name)
        if d > best.get(key, (0, None))[0]:
            best[key] = (d, seg)
    for key, (d, seg) in sorted(best.items(), key=lambda kv: -kv[1][0]):
        if d < 250:
            continue
        text = shown.get(key, key)
        bw, bh = len(text) * 34 + 30, 50
        for t in (0.25, 0.75, 0.15, 0.85):
            x, y = along(seg, t)
            box = (x - bw / 2, y - bh / 2, x + bw / 2, y + bh / 2)
            if free(box):
                boxes.append(box)
                labels.append({"x": round(x, 1), "y": round(y, 1), "text": text})
                break

    return {
        "width": WIDTH,
        "height": height,
        "km": round(total / 1000, 1),
        "major": svg_path(layers["major"]),
        "mid": svg_path(layers["mid"]),
        "minor": svg_path(layers["minor"]),
        "rail": svg_path(layers["rail"]),
        "route": svg_path([line]),
        "arrows": arrows(line, 80, 13),
        "start": [round(sx, 1), round(sy, 1)],
        **({} if loop else {"finish": [round(ex, 1), round(ey, 1)]}),
        "steps": steps,
        "stations": stations,
        "landmarks": landmarks,
        "labels": labels,
        "chips": chips,
    }


def main():
    cache = None
    if "--cache" in sys.argv:
        cache = Path(sys.argv[sys.argv.index("--cache") + 1])
    routes = read_routes()
    if not routes:
        sys.exit("schedule.ts 裡沒有路線")
    maps, loaded = {}, {}
    for r in routes:
        for name in (r["place"], r["finish"]):
            if name and name not in PLACES:
                sys.exit(f"{r['key']}：PLACES 沒有「{name}」的座標")
        bbox = route_bbox(r)
        if bbox not in loaded:
            osm = overpass(cache, bbox)
            # 所有道路（不分路名、不補連線），用來接公告裡沒有相交的兩條路
            network = build_graph([e for e in osm["elements"] if e["type"] == "way" and "highway" in e["tags"]], lambda n: True, bridge=False)
            loaded[bbox] = (osm, network)
        maps[r["key"]] = render(*loaded[bbox], r)
    body = json.dumps(maps, ensure_ascii=False, indent=2)
    OUT.write_text(
        "// 由 tools/route-map/build.py 產生，請勿手動修改（改了路線就重跑：python tools/route-map/build.py）。\n"
        "// 車隊掃街的路線圖：鍵是「日期 時間」；座標是 viewBox 單位（寬 1000）。路網：© OpenStreetMap 貢獻者（ODbL）。\n\n"
        "export type RouteMap = {\n  width: number;\n  height: number;\n  /** 沿路線量出的總長（公里） */\n  km: number;\n"
        "  major: string;\n  mid: string;\n  minor: string;\n  rail: string;\n  route: string;\n  arrows: string;\n"
        "  start: [number, number];\n  /** 終點：和起點不同時才有 */\n  finish?: [number, number];\n"
        "  /** 每條路的順序號碼，和 chips 的 n 一致 */\n  steps: { n: number; x: number; y: number }[];\n"
        "  /** 有查到地點的加油打氣站 */\n  stations: { x: number; y: number; text: string }[];\n"
        "  /** 地標：side 是名字放在點的哪一邊 */\n  landmarks: { x: number; y: number; text: string; side: \"left\" | \"right\" }[];\n"
        "  labels: { x: number; y: number; text: string }[];\n"
        "  /** 路線清單：照公告順序，換一條路加一號；station 是加油打氣站，mapped 表示圖上有畫 */\n"
        "  chips: { n?: number; text: string; station?: boolean; mapped?: boolean }[];\n};\n\n"
        f"export const routeMaps: Record<string, RouteMap> = {body};\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"已寫入 {OUT.relative_to(ROOT)}（{OUT.stat().st_size // 1024} KB）", file=sys.stderr)


if __name__ == "__main__":
    main()

"""
杰個願望的小企鵝貼圖：產生 web/public/wish/stickers/<key>.svg。
造型參考分享卡與吉普車插畫上的小企鵝（黑色圓頭、頭頂一撮捲髮、圓眼鏡、橘色嘴、粉紅腮紅、綠領巾、薄荷綠上衣），貼紙白邊＋手繪感的邊緣。
貼圖裡不放中文字（<img> 載入的 SVG 讀不到網站字型），名稱寫在 web/src/lib/wish/options.ts 的 STICKERS。

用法：python tools/wish-stickers/build.py
"""

from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "web" / "public" / "wish" / "stickers"

INK = "#2E2B2A"
WHITE = "#FFFDF7"
BEAK = "#F4A43C"
BEAK_DARK = "#D9742B"
BLUSH = "#F4A0A0"
GLASS = "#3B3634"
SUN = "#F9D53A"
CORAL = "#E0573E"
TEAL = "#1FA39B"
RED = "#D2472F"
LINE = "#F2B705"
SHIRT = "#9FD6C4"
SCARF = "#3E9B5F"

DEFS = f"""<defs>
  <filter id="rough" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.5" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="sticker" x="-15%" y="-15%" width="130%" height="130%">
    <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="fat"/>
    <feGaussianBlur in="fat" stdDeviation="2.4" result="blur"/>
    <feOffset in="blur" dy="2.5" result="drop"/>
    <feFlood flood-color="#0B3D3A" flood-opacity="0.22"/>
    <feComposite in2="drop" operator="in" result="shadow"/>
    <feFlood flood-color="#FFFFFF"/>
    <feComposite in2="fat" operator="in" result="outline"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>"""


def svg(body: str, title: str) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">'
        f"<title>{title}</title>{DEFS}"
        f'<g filter="url(#sticker)"><g filter="url(#rough)">{body}</g></g></svg>\n'
    )


# ---------- 零件 ----------


def hair(cx=80, top=37):
    return (
        f'<circle cx="{cx - 17}" cy="{top + 7}" r="9.5" fill="{INK}"/>'
        f'<circle cx="{cx - 4}" cy="{top + 1}" r="11" fill="{INK}"/>'
        f'<circle cx="{cx + 10}" cy="{top + 3}" r="9.5" fill="{INK}"/>'
        f'<circle cx="{cx + 20}" cy="{top + 10}" r="7" fill="{INK}"/>'
        f'<path d="M{cx - 12} {top + 2} q6 -7 13 -1 M{cx + 4} {top} q6 -6 12 1" fill="none" stroke="#6A625E" stroke-width="2" stroke-linecap="round"/>'
    )


def head(cx=80, cy=72):
    return hair(cx, cy - 35) + f'<circle cx="{cx}" cy="{cy}" r="36" fill="{INK}"/>' + f'<ellipse cx="{cx}" cy="{cy + 8}" rx="28.5" ry="24" fill="{WHITE}"/>'


def glasses(cx=80, cy=74):
    l, r = cx - 11, cx + 11
    return (
        f'<circle cx="{l}" cy="{cy}" r="9.5" fill="#FFFFFF" stroke="{GLASS}" stroke-width="2.4"/>'
        f'<circle cx="{r}" cy="{cy}" r="9.5" fill="#FFFFFF" stroke="{GLASS}" stroke-width="2.4"/>'
        f'<path d="M{l + 9.5} {cy} q1.5 -2.2 3 0" fill="none" stroke="{GLASS}" stroke-width="2.2"/>'
    )


def eyes(kind="dot", cx=80, cy=75):
    l, r = cx - 11, cx + 11
    if kind == "dot":
        return "".join(f'<circle cx="{x}" cy="{cy}" r="3.2" fill="{INK}"/><circle cx="{x + 1.2}" cy="{cy - 1.2}" r="1.1" fill="#FFF"/>' for x in (l, r))
    if kind == "happy":  # ^ ^
        return "".join(f'<path d="M{x - 4.5} {cy + 1.5} q4.5 -6 9 0" fill="none" stroke="{INK}" stroke-width="2.6" stroke-linecap="round"/>' for x in (l, r))
    if kind == "closed":  # 閉眼許願
        return "".join(f'<path d="M{x - 4.5} {cy - 1} q4.5 4.5 9 0" fill="none" stroke="{INK}" stroke-width="2.6" stroke-linecap="round"/>' for x in (l, r))
    if kind == "wink":
        return (
            f'<path d="M{l - 4.5} {cy + 1.5} q4.5 -6 9 0" fill="none" stroke="{INK}" stroke-width="2.6" stroke-linecap="round"/>'
            f'<circle cx="{r}" cy="{cy}" r="3.2" fill="{INK}"/><circle cx="{r + 1.2}" cy="{cy - 1.2}" r="1.1" fill="#FFF"/>'
        )
    if kind == "star":
        return "".join(star(x, cy, 5.2, SUN, stroke=INK) for x in (l, r))
    raise ValueError(kind)


def beak(kind="closed", cx=80, cy=88):
    if kind == "closed":
        return f'<path d="M{cx - 9} {cy - 3} Q{cx} {cy - 9} {cx + 9} {cy - 3} Q{cx + 4} {cy + 5} {cx} {cy + 5} Q{cx - 4} {cy + 5} {cx - 9} {cy - 3}Z" fill="{BEAK}"/>'
    if kind == "open":
        return (
            f'<path d="M{cx - 8} {cy} Q{cx} {cy + 4} {cx + 8} {cy} Q{cx + 6} {cy + 9} {cx} {cy + 10} Q{cx - 6} {cy + 9} {cx - 8} {cy}Z" fill="{BEAK_DARK}"/>'
            f'<path d="M{cx - 10} {cy - 3} Q{cx} {cy - 10} {cx + 10} {cy - 3} Q{cx} {cy + 2} {cx - 10} {cy - 3}Z" fill="{BEAK}"/>'
        )
    if kind == "o":
        return f'<path d="M{cx - 9} {cy - 3} Q{cx} {cy - 9} {cx + 9} {cy - 3} Q{cx + 4} {cy + 5} {cx} {cy + 5} Q{cx - 4} {cy + 5} {cx - 9} {cy - 3}Z" fill="{BEAK}"/><ellipse cx="{cx}" cy="{cy + 1}" rx="3" ry="2.4" fill="{BEAK_DARK}"/>'
    raise ValueError(kind)


def blush(cx=80, cy=88, strong=False):
    o = 1 if strong else 0.85
    return f'<ellipse cx="{cx - 21}" cy="{cy}" rx="6" ry="3.6" fill="{BLUSH}" opacity="{o}"/><ellipse cx="{cx + 21}" cy="{cy}" rx="6" ry="3.6" fill="{BLUSH}" opacity="{o}"/>'


def face(eye="dot", mouth="closed", cx=80, cy=72, strong_blush=False):
    return head(cx, cy) + glasses(cx, cy + 2) + eyes(eye, cx, cy + 3) + blush(cx, cy + 16, strong_blush) + beak(mouth, cx, cy + 16)


def body(cx=80, top=96):
    return (
        f'<ellipse cx="{cx}" cy="{top + 18}" rx="30" ry="27" fill="{INK}"/>'
        f'<ellipse cx="{cx}" cy="{top + 23}" rx="21" ry="19" fill="{SHIRT}"/>'
        f'<ellipse cx="{cx - 12}" cy="{top + 45}" rx="9.5" ry="5" fill="{BEAK}"/>'
        f'<ellipse cx="{cx + 12}" cy="{top + 45}" rx="9.5" ry="5" fill="{BEAK}"/>'
    )


def scarf(cx=80, y=104):
    """綠領巾：圍在脖子，前面垂一個三角"""
    return (
        f'<path d="M{cx - 25} {y - 2} Q{cx} {y + 9} {cx + 25} {y - 2} L{cx + 24} {y + 5} Q{cx} {y + 16} {cx - 24} {y + 5}Z" fill="{SCARF}"/>'
        f'<path d="M{cx - 9} {y + 9} L{cx + 1} {y + 24} L{cx + 8} {y + 9}Z" fill="{SCARF}"/>'
    )


def flipper(side, pose):
    """side: -1 左、1 右；pose: down / up / front / out"""
    s = side
    x = lambda v: 80 + s * v  # noqa: E731
    paths = {
        "down": f"M{x(26)} 104 Q{x(40)} 116 {x(36)} 132 Q{x(28)} 128 {x(23)} 114Z",
        "up": f"M{x(25)} 104 Q{x(44)} 92 {x(48)} 72 Q{x(37)} 74 {x(21)} 96Z",
        "front": f"M{x(27)} 104 Q{x(20)} 120 {x(6)} 120 Q{x(10)} 110 {x(22)} 100Z",
        "out": f"M{x(27)} 104 Q{x(46)} 104 {x(54)} 94 Q{x(44)} 90 {x(25)} 98Z",
    }
    return f'<path d="{paths[pose]}" fill="{INK}"/>'


def star(cx, cy, r, fill, stroke=None, points=5):
    import math

    pts = []
    for i in range(points * 2):
        rr = r if i % 2 == 0 else r * 0.45
        a = -math.pi / 2 + i * math.pi / points
        pts.append(f"{cx + rr * math.cos(a):.1f},{cy + rr * math.sin(a):.1f}")
    st = f' stroke="{stroke}" stroke-width="1.2" stroke-linejoin="round"' if stroke else ""
    return f'<polygon points="{" ".join(pts)}" fill="{fill}"{st}/>'


def sparkle(cx, cy, r, fill=SUN):
    return f'<path d="M{cx} {cy - r} Q{cx + r * 0.18} {cy - r * 0.18} {cx + r} {cy} Q{cx + r * 0.18} {cy + r * 0.18} {cx} {cy + r} Q{cx - r * 0.18} {cy + r * 0.18} {cx - r} {cy} Q{cx - r * 0.18} {cy - r * 0.18} {cx} {cy - r}Z" fill="{fill}"/>'


def heart(cx, cy, s, fill=CORAL):
    return f'<path d="M{cx} {cy + 9 * s} C{cx - 15 * s} {cy - 1 * s} {cx - 10 * s} {cy - 12 * s} {cx} {cy - 5 * s} C{cx + 10 * s} {cy - 12 * s} {cx + 15 * s} {cy - 1 * s} {cx} {cy + 9 * s}Z" fill="{fill}"/>'


def rays(cx, cy, r, angles, color=LINE, w=3):
    import math

    out = []
    for a in angles:
        t = math.radians(a)
        x1, y1 = cx + r * math.cos(t), cy + r * math.sin(t)
        x2, y2 = cx + (r + 9) * math.cos(t), cy + (r + 9) * math.sin(t)
        out.append(f'<path d="M{x1:.1f} {y1:.1f} L{x2:.1f} {y2:.1f}" stroke="{color}" stroke-width="{w}" stroke-linecap="round"/>')
    return "".join(out)


def word(text, x, y, size=15, color=INK, rotate=-8):
    return (
        f'<text x="{x}" y="{y}" transform="rotate({rotate} {x} {y})" font-family="Fredoka, \'Arial Rounded MT Bold\', \'Comic Sans MS\', sans-serif" '
        f'font-size="{size}" font-weight="700" fill="{color}" text-anchor="middle">{text}</text>'
    )


def tilt(deg, inner):
    return f'<g transform="rotate({deg} 80 96)">{inner}</g>'


# ---------- 八張貼圖 ----------

STICKERS = {
    # 加油：雙手舉高、張嘴、旁邊有 GO!
    "cheer": (
        "加油",
        tilt(-4, flipper(-1, "up") + flipper(1, "up") + body() + face("happy", "open") + scarf())
        + rays(80, 70, 50, [-150, -130, -50, -30])
        + word("GO!", 130, 34, 18, RED, -12),
    ),
    # 比心：抱著一顆大愛心
    "love": (
        "比心",
        tilt(3, body() + face("happy", "closed", strong_blush=True) + scarf() + heart(80, 114, 1.75) + flipper(-1, "front") + flipper(1, "front"))
        + heart(130, 44, 0.55)
        + heart(28, 58, 0.4),
    ),
    # 許願：閉眼、雙手合十，頭上有星星
    "wish": (
        "許願",
        body() + face("closed", "closed") + scarf() + flipper(-1, "front") + flipper(1, "front")
        + star(126, 32, 10, SUN, stroke=INK)
        + sparkle(34, 40, 6)
        + sparkle(140, 62, 4.5),
    ),
    # 讚：眨眼、一手舉起
    "good": (
        "讚",
        tilt(-3, flipper(-1, "down") + flipper(1, "up") + body() + face("wink", "open") + scarf())
        + sparkle(34, 46, 6)
        + word("GOOD!", 124, 30, 15, TEAL, -10),
    ),
    # 謝謝：低頭鞠躬
    "thanks": (
        "謝謝",
        body() + flipper(-1, "front") + flipper(1, "front") + f'<g transform="rotate(14 80 96)">{face("closed", "closed", strong_blush=True)}</g>' + scarf()
        + heart(130, 40, 0.5)
        + word("THANKS", 40, 30, 13, CORAL, -12),
    ),
    # 開心：跳起來、眼睛變星星
    "happy": (
        "開心",
        f'<g transform="translate(0 -6)">{tilt(5, flipper(-1, "out") + flipper(1, "out") + body() + face("star", "open") + scarf())}</g>'
        + '<path d="M58 152 q22 6 44 0" fill="none" stroke="#B9C9C7" stroke-width="3" stroke-linecap="round"/>'
        + sparkle(30, 36, 6)
        + sparkle(132, 34, 7),
    ),
    # 好點子：頭上一顆亮燈泡
    "idea": (
        "好點子",
        tilt(-2, flipper(-1, "down") + flipper(1, "up") + body(top=100) + face("dot", "o", cy=78) + scarf(y=108))
        + '<g transform="translate(124 26)">'
        + f'<circle cx="0" cy="0" r="12" fill="{SUN}" stroke="{INK}" stroke-width="2"/>'
        + f'<rect x="-6" y="11" width="12" height="7" rx="2" fill="#B9C9C7" stroke="{INK}" stroke-width="2"/>'
        + f'<path d="M-4 1 q4 -6 8 0" fill="none" stroke="{INK}" stroke-width="1.8" stroke-linecap="round"/>'
        + "</g>"
        + rays(124, 26, 15, [-160, -115, -65, -20]),
    ),
    # 凍蒜：舉著號次 ① 的牌子
    "vote": (
        "凍蒜",
        tilt(-3, body() + face("happy", "open") + scarf() + flipper(-1, "up") + flipper(1, "up"))
        + f'<g transform="rotate(8 128 34)"><rect x="106" y="12" width="44" height="44" rx="8" fill="#FFFFFF" stroke="{INK}" stroke-width="2.4"/>'
        + f'<circle cx="128" cy="34" r="15" fill="none" stroke="{RED}" stroke-width="3.6"/>'
        + f'<text x="128" y="41.5" font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-size="21" font-weight="700" fill="{RED}" text-anchor="middle">1</text></g>'
        + rays(128, 34, 26, [150, 200]),
    ),
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for key, (title, body_svg) in STICKERS.items():
        (OUT / f"{key}.svg").write_text(svg(body_svg, f"小企鵝貼圖：{title}"), encoding="utf-8", newline="\n")
    print(f"寫入 {len(STICKERS)} 張貼圖到 {OUT}")


if __name__ == "__main__":
    main()

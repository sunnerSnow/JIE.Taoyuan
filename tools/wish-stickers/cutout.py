"""
把畫在米白紙張上的插畫（例如吉普車小企鵝）去背，輸出頁首用的透明 PNG 與貼圖。

做法：
1. 紙張顏色取四個角落的中位數。
2. 和紙張顏色差很多的點算主體。
3. 和邊框相連的紙張區域是背景。
4. 被主體圍住的紙張區域（臉、車窗）保留；字裡的小洞（「發」的口）挖掉。
5. 貼圖再加白色外框與淡陰影。

用法：
  python tools/wish-stickers/cutout.py hero  <插畫.png> <輸出.png> [寬度]
  python tools/wish-stickers/cutout.py sticker <插畫.png> <輸出.png> [寬度]
原始插畫在 docs/design/（使用者提供，未放進 repo）。
"""

import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage


def cutout(path: str):
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(np.int16)
    h, w, _ = a.shape
    k = max(8, min(h, w) // 40)
    corners = np.concatenate([a[:k, :k].reshape(-1, 3), a[:k, -k:].reshape(-1, 3), a[-k:, :k].reshape(-1, 3), a[-k:, -k:].reshape(-1, 3)])
    paper = np.median(corners, axis=0)
    diff = np.abs(a - paper).sum(axis=2)
    subject = diff > 46
    # 去掉紙紋造成的零星雜點，再把線條稍微接起來
    subject = ndimage.binary_opening(subject, iterations=1)
    subject = ndimage.binary_closing(subject, iterations=2)
    # 和邊框相連的紙張區域是背景
    paperish = ~subject
    labels, _ = ndimage.label(paperish)
    border = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    background = np.isin(labels, list(border))
    # 被圍住的紙張小洞（字的內部）也當背景；大的（臉、車窗）保留
    sizes = ndimage.sum(paperish, labels, index=np.arange(labels.max() + 1))
    small_holes = (sizes < (h * w) * 0.0009) & ~np.isin(np.arange(labels.max() + 1), list(border))
    small_holes[0] = False
    background |= small_holes[labels]
    mask = ~background
    # 拿掉和主體分開、很小的碎片（紙紋斑點）
    mlabels, _ = ndimage.label(mask)
    msizes = ndimage.sum(mask, mlabels, index=np.arange(mlabels.max() + 1))
    keep = msizes > (h * w) * 0.00015
    keep[0] = False
    mask = keep[mlabels]
    alpha = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert("RGBA")
    out.putalpha(alpha)
    bbox = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
    return out.crop(bbox)


def resize(im: Image.Image, width: int):
    return im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)


def sticker(im: Image.Image, width: int, border: int):
    im = resize(im, width - border * 2 - 8)
    pad = border + 6
    canvas = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    canvas.paste(im, (pad, pad), im)
    alpha = canvas.getchannel("A").point(lambda v: 255 if v > 20 else 0)
    outline = alpha.filter(ImageFilter.MaxFilter(border * 2 + 1)).filter(ImageFilter.GaussianBlur(0.8))
    shadow = outline.filter(ImageFilter.GaussianBlur(3)).point(lambda v: v * 0.22)
    out = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    out.paste(Image.new("RGBA", canvas.size, (11, 61, 58, 255)), (0, 3), shadow)
    out.paste(Image.new("RGBA", canvas.size, (255, 255, 255, 255)), (0, 0), outline)
    out.alpha_composite(canvas)
    return out


def main():
    mode, src, dst = sys.argv[1:4]
    width = int(sys.argv[4]) if len(sys.argv) > 4 else (720 if mode == "hero" else 280)
    im = cutout(src)
    out = resize(im, width) if mode == "hero" else sticker(im, width, 9)
    out.save(dst, optimize=True)
    print(dst, out.size)


if __name__ == "__main__":
    main()

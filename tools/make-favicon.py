#!/usr/bin/env python3
"""本店ロゴ（assets/images/福朗本店ロゴ.png）からファビコンを書き出す。

    python3 tools/make-favicon.py

生成物
    assets/images/favicon-32.png    タブ用
    assets/images/favicon-180.png   ホーム画面・ブックマーク用

元のロゴは白抜き・背景透過で、明るいタブバーでは見えなくなる。
そのため色を黒（INK）に置き換えたものを書き出している。背景は透過のまま。
元ファイル（福朗本店ロゴ.png）はヘッダー・フッター・予約モーダルで
白のまま使っているので、絶対に上書きしないこと。

ロゴを差し替えたら実行し直してください。

必要なもの: Pillow（pip install Pillow）
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/images/福朗本店ロゴ.png"
OUT = ROOT / "assets/images"

INK = (0, 0, 0)     # ロゴの塗り
PAD_RATIO = 0.06    # 正方形キャンバスの余白（辺に対する比率）


def blacken(img: Image.Image) -> Image.Image:
    """アルファ（形）はそのままに、色だけ INK に置き換える。"""
    ink = Image.new("RGBA", img.size, INK + (255,))
    ink.putalpha(img.split()[3])
    return ink


def render(art: Image.Image, size: int, name: str) -> None:
    pad = round(size * PAD_RATIO)
    box = size - pad * 2
    w, h = art.size
    scale = min(box / w, box / h)
    fit = art.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(fit, ((size - fit.width) // 2, (size - fit.height) // 2))
    canvas.save(OUT / name, optimize=True)
    print(f"{name}: {size}x{size} (art {art.size})")


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    logo = blacken(src.crop(src.split()[3].getbbox()))   # 透明な余白を落として黒く
    print(f"trimmed logo: {logo.size}")

    render(logo, 32, "favicon-32.png")
    render(logo, 180, "favicon-180.png")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""ヒーローのキャッチを、書体をアウトライン化した SVG にして index.html に埋め込む。

Ro篠 Std のように Web フォントとしての配信ライセンスが無い書体でも、必要な
10 文字だけを図形に落としてしまえば見出しに使える（本店ロゴ自体も同じ作り方）。
おまけに CJK サブセットのダウンロードも FOUT も無くなる。

    pip install fonttools
    python3 tools/make-hero-title-svg.py /path/to/KouzanMouhituFontOTF.otf

いま入っているのは衡山毛筆フォント（書家・青柳衡山氏の揮毫／武蔵システム）。
https://opentype.jp/kouzanmouhitufont.htm から無料で入手でき、
「商用利用可能で制限はありません。ロゴ等へも自由にご利用いただけます」と
明示されているのでアウトライン化して使える。書体を差し替えるときは
新しいフォントを引数に渡して実行し直すだけでよい。
縦組み・列送り・字送りは SVG の座標に焼き込むので、CSS 側は
.hero__title-svg の height（＝ viewBox の高さ何 em ぶんか）だけを見ている。
書体を変えると viewBox の高さが変わるため、出力される em 数を
assets/css/style.css の .hero__title-svg の height に反映すること。
"""
import re
import sys
from pathlib import Path

from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT    = Path(__file__).resolve().parent.parent
HTML    = ROOT / "index.html"
COLUMNS = ["レトロが香る", "現代焼肉"]   # 縦組みなので先頭が右の列
STEP    = 1.20   # 字送り（em）。旧 CSS の line-height:1 + letter-spacing:.2em と同じ
PITCH   = 2.20   # 列送り（em）。旧 CSS の実測値 2.19em に合わせた
PAD     = 0.06   # 毛筆は em ボックスから筆が出るので viewBox に余白

# 輪郭を stroke で太らせる量（em）。衡山毛筆フォントは書家の手本をそのまま
# 起こした書体なので線が細く、ロゴの看板文字と並べると軽い。0.02em 足すと
# ロゴの筆圧と釣り合う。これ以上足すと「香」「焼」の中の空きが埋まり、
# この書体の身上である穂先の抜けも鈍るので上げない。
# 本物の Ro篠 に差し替えるときは 0 に戻すこと（書体が持つ太さで足りる）。
BOLDEN  = 0.020


def build(font_path):
    font = TTFont(font_path)
    upem = font["head"].unitsPerEm
    asc  = font["OS/2"].sTypoAscender        # em ボックス上端からベースラインまで
    gs   = font.getGlyphSet()
    cmap = font.getBestCmap()
    step, pitch = STEP * upem, PITCH * upem

    def ink_height(col):
        return len(col) * step - (step - upem)

    # 一番長い列に合わせて、短い列は上下中央に置く
    tallest = max(ink_height(c) for c in COLUMNS)

    paths, bounds = [], []
    for ci, col in enumerate(COLUMNS):
        cx  = -ci * pitch
        top = (tallest - ink_height(col)) / 2
        for i, ch in enumerate(col):
            if ord(ch) not in cmap:
                sys.exit(f"{font_path} に「{ch}」が入っていません")
            # フォント座標は y 上向き・原点はベースライン左端。SVG は y 下向き。
            t = Transform(1, 0, 0, -1, cx - upem / 2, top + i * step + asc)
            glyph = gs[cmap[ord(ch)]]
            pen = SVGPathPen(gs, ntos=lambda v: f"{v:.0f}")
            glyph.draw(TransformPen(pen, t))
            paths.append((ch, pen.getCommands()))
            bp = BoundsPen(gs)
            glyph.draw(TransformPen(bp, t))
            if bp.bounds:
                bounds.append(bp.bounds)

    # 太らせは輪郭の外側へ半分ずつ広がるので、はみ出す分を余白に足す
    pad = PAD * upem + BOLDEN * upem / 2
    x0 = min(b[0] for b in bounds) - pad
    y0 = min(b[1] for b in bounds) - pad
    x1 = max(b[2] for b in bounds) + pad
    y1 = max(b[3] for b in bounds) + pad

    bold = ""
    if BOLDEN:
        bold = (f' stroke="currentColor" stroke-width="{BOLDEN * upem:.0f}"'
                ' stroke-linejoin="round" stroke-linecap="round"')
    out = [f'<svg class="hero__title-svg" xmlns="http://www.w3.org/2000/svg" '
           f'viewBox="{x0:.0f} {y0:.0f} {x1 - x0:.0f} {y1 - y0:.0f}" '
           f'fill="currentColor"{bold} aria-hidden="true" focusable="false">']
    out += [f'<path d="{d}"/><!--{ch}-->' for ch, d in paths]
    out.append("</svg>")
    return "\n".join(out), (y1 - y0) / upem


def main():
    font_path = sys.argv[1] if len(sys.argv) > 1 else "KouzanMouhituFontOTF.otf"
    svg, height_em = build(font_path)

    html = HTML.read_text()
    pattern = re.compile(r'\n *<svg class="hero__title-svg".*?</svg>', re.S)
    if not pattern.search(html):
        sys.exit("index.html に .hero__title-svg が見つかりません")
    indented = "\n" + "\n".join("    " + line for line in svg.splitlines())
    HTML.write_text(pattern.sub(lambda _: indented, html, count=1))

    print(f"{font_path} → index.html を更新（{len(svg):,} bytes）")
    print(f"viewBox の高さ = {height_em:.2f}em  "
          f"→ style.css の .hero__title-svg の height の係数をこの値に合わせる")


if __name__ == "__main__":
    main()

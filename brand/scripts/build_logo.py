"""Build the Nunayon Foundation logo set as outlined SVGs.

Text is converted to vector paths (Montserrat, SIL OFL) so the files render
identically everywhere, with no font dependency.

Usage:  python3 brand/scripts/build_logo.py
Needs:  pip install fonttools uharfbuzz
"""
import math
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
FONT = ROOT / "fonts" / "Montserrat[wght].ttf"
OUT = ROOT / "logo" / "svg"

# Brand palette (sampled from the original logo artwork)
TEAL = "#00343F"         # Nunayon Teal - wordmark, primary
LEAF = "#4A8F62"         # Leaf Green - leaf light side
LEAF_SHADOW = "#00393E"  # Leaf Shadow - leaf dark side and stem
FOREST = "#2E6A55"       # Forest - tagline
MINT = "#7CC495"         # Mint - leaf light side on dark backgrounds
MINT_PALE = "#BFE3CB"    # Pale Mint - tagline on dark backgrounds
CREAM = "#FDF7EC"        # Cream - backgrounds
WHITE = "#FFFFFF"


class Face:
    def __init__(self, weight):
        font = instantiateVariableFont(TTFont(FONT), {"wght": weight})
        self.glyphs = font.getGlyphSet()
        self.order = font.getGlyphOrder()
        blob = hb.Blob.from_file_path(str(FONT))
        self.hbfont = hb.Font(hb.Face(blob))
        self.hbfont.set_variations({"wght": weight})

    def path(self, text, size, x, y, tracking=0.0):
        """Return (svg path d, advance width) for text with baseline at y."""
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.hbfont, buf, {"kern": True, "liga": False})
        scale = size / 1000
        d, pen_x = [], x
        self.last_box = None  # ink bounds of the final glyph
        infos, positions = buf.glyph_infos, buf.glyph_positions
        for i, (info, pos) in enumerate(zip(infos, positions)):
            name = self.order[info.codepoint]
            svg = SVGPathPen(self.glyphs)
            pen = TransformPen(svg, (scale, 0, 0, -scale, pen_x + pos.x_offset * scale, y))
            self.glyphs[name].draw(pen)
            d.append(svg.getCommands())
            bounds = BoundsPen(self.glyphs)
            self.glyphs[name].draw(TransformPen(bounds, (scale, 0, 0, -scale, pen_x, y)))
            self.last_box = bounds.bounds
            pen_x += pos.x_advance * scale
            if i < len(infos) - 1:
                pen_x += tracking * size
        return " ".join(d), pen_x - x



# ---------------------------------------------------------------------------
# Sprout, traced from the original artwork.
# Units are pixels of the reference screenshot (reference/original-logo-2.png,
# where "FOUNDATION" has a 26.5px cap height). Origin is the outer right edge
# of the final N of FOUNDATION on its baseline; y is negative upwards.
# Each edge is a list of traced points; one smooth cubic is fitted to each.
# The leaf tips are where two edges meet, so they stay sharp.
# ---------------------------------------------------------------------------
REF_CAP = 26.5

BIG_TIP = (47.5, -117)
BIG_LEFT = [BIG_TIP, (37, -112), (29, -108.5), (21, -105), (16, -102), (12, -99), (9, -96),
            (6, -93), (4, -90), (1, -84), (-2, -78), (-4, -72), (-4.3, -66),
            (-4, -60), (-3, -54), (-2, -48), (0, -42), (2, -36), (4.5, -31)]
BIG_TAIL = [(4.5, -31), (5.6, -36), (5.6, -39), (5, -42)]
BIG_RIGHT = [BIG_TIP, (45, -106), (43, -96), (40.5, -84), (37, -72),
             (32, -63), (27, -54), (21, -48), (14, -44.5), (5, -42)]
BIG_SPLIT = [(5, -42), (6, -48), (7, -54), (8.5, -60), (10, -66), (12, -72),
             (15, -78), (18, -84), (22, -90), (26, -96), (31, -102),
             (39, -109), BIG_TIP]

SMALL_TIP = (43, -43)
SMALL_TOP = [SMALL_TIP, (36, -43.6), (29, -42.6), (25, -41), (21, -39),
             (17, -36), (14, -33), (12.3, -30), (11, -27), (10.3, -24),
             (9.6, -21), (9, -18), (8.5, -15)]
STEM_LEFT = [(8.5, -15), (8, -10), (8, -5), (8.5, -2), (9.6, -0.5)]
STEM_RIGHT = [(9.6, -0.5), (10.6, -2), (10.9, -6), (11.4, -11), (12.4, -15)]
SMALL_RIGHT = [SMALL_TIP, (41.6, -39), (40.2, -36), (38.7, -33), (37, -30),
               (35, -27), (32.5, -24), (29, -21), (24, -18), (12.4, -15)]
SMALL_SPLIT = [(12.4, -15), (14, -18), (15.3, -21), (17, -24), (20, -27),
               (23, -30), (26, -33), (29.5, -36), (34.5, -39.5), SMALL_TIP]

ALL_POINTS = BIG_LEFT + BIG_RIGHT + SMALL_TOP + STEM_LEFT + STEM_RIGHT + SMALL_RIGHT
BB = (min(p[0] for p in ALL_POINTS), min(p[1] for p in ALL_POINTS),
      max(p[0] for p in ALL_POINTS), max(p[1] for p in ALL_POINTS))


def _rev(pts):
    return list(reversed(pts))


def _fit_cubic(pts):
    """Least-squares cubic Bezier through the traced points, endpoints fixed
    (Schneider's method with chord-length parameters). Turns a noisy pixel
    trace into one smooth curve."""
    p0, p3 = pts[0], pts[-1]
    if len(pts) < 4:
        return p0, p0, p3, p3
    dist = [0.0]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        dist.append(dist[-1] + math.hypot(x1 - x0, y1 - y0))
    ts = [d / dist[-1] for d in dist]
    # Solve for C1, C2 per axis: minimise sum |B(t) - P|^2
    a11 = a12 = a22 = 0.0
    bx1 = bx2 = by1 = by2 = 0.0
    for t, (px, py) in zip(ts, pts):
        b0, b1, b2, b3 = (1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3
        rx = px - (b0 * p0[0] + b3 * p3[0])
        ry = py - (b0 * p0[1] + b3 * p3[1])
        a11 += b1 * b1; a12 += b1 * b2; a22 += b2 * b2
        bx1 += b1 * rx; bx2 += b2 * rx; by1 += b1 * ry; by2 += b2 * ry
    det = a11 * a22 - a12 * a12
    c1 = ((a22 * bx1 - a12 * bx2) / det, (a22 * by1 - a12 * by2) / det)
    c2 = ((a11 * bx2 - a12 * bx1) / det, (a11 * by2 - a12 * by1) / det)
    return p0, c1, c2, p3


def _smooth(pts, ox, oy, k):
    """One cubic segment (no leading M) fitted to the traced edge pts."""
    p = [(ox + x * k, oy + y * k) for x, y in pts]
    p0, c1, c2, p3 = _fit_cubic(p)
    return p0, f"C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p3[0]:.1f} {p3[1]:.1f}"


def _shape(edges, ox, oy, k):
    """Closed path from consecutive edges (each starts where the last ended)."""
    start, _ = _smooth(edges[0], ox, oy, k)
    segs = [_smooth(e, ox, oy, k)[1] for e in edges]
    return f"M{start[0]:.1f} {start[1]:.1f} " + " ".join(segs) + " Z"


def sprout(ox, oy, k, stem, light, dark):
    """The sprout. (ox, oy) is the N's outer right edge on the baseline;
    k scales reference pixels to output units."""
    big = _shape([BIG_LEFT, BIG_TAIL, _rev(BIG_RIGHT)], ox, oy, k)
    small = _shape([SMALL_TOP, STEM_LEFT, STEM_RIGHT, _rev(SMALL_RIGHT)], ox, oy, k)
    parts = [f'<path fill="{dark}" d="{big}"/>', f'<path fill="{dark}" d="{small}"/>']
    if stem != dark:
        stem_d = _shape([[(8.5, -15), (8.5, -15)], STEM_LEFT, STEM_RIGHT,
                         [(12.4, -15), (8.5, -15)]], ox, oy, k)
        parts.append(f'<path fill="{stem}" d="{stem_d}"/>')
    if light != dark:  # two-tone: light body laid over the dark silhouette
        big_l = _shape([BIG_RIGHT, BIG_SPLIT], ox, oy, k)
        small_l = _shape([SMALL_RIGHT, SMALL_SPLIT], ox, oy, k)
        parts += [f'<path fill="{light}" d="{big_l}"/>',
                  f'<path fill="{light}" d="{small_l}"/>']
    return "".join(parts)


bold, medium, semi = Face(700), Face(500), Face(600)

# Layout, matched to the reference artwork. R(x, y) maps reference pixels to
# output units: "nunayon" (x 20..317 in the reference) becomes 600 wide.
K = 600 / 297
WORD_SIZE = 600 / (bold.path("nunayon", 1000, 0, 0)[1] / 1000)
T_TRACK = 0.03                     # tagline letter-spacing in em


def R(y):
    return (y - 12) * K


def size_for(face, text, tracking, width):
    """Font size at which text with the given tracking spans width."""
    _, w = face.path(text, 1000, 0, 0)
    return width / (w / 1000 + tracking * (len(text) - 1))


def fit_tracking(face, text, size, width):
    _, w = face.path(text, size, 0, 0)
    return (width - w) / (size * (len(text) - 1))


WORD_BASE = R(79.5)
F_BASE = R(124.5)
F_SIZE = REF_CAP * K / 0.700
F_TRACK = fit_tracking(medium, "FOUNDATION", F_SIZE, 311 * K)
T_BASE = R(157.5)
TAGLINE = "EMPOWERING LIVES. BUILDING COMMUNITIES."
T_WIDTH = 372 * K


def wordmark(text_color, x=0.0, y=0.0, k=1.0):
    """nunayon / FOUNDATION; returns (svg parts, N right edge x, F baseline y)."""
    word_d, _ = bold.path("nunayon", WORD_SIZE * k, x, y + WORD_BASE * k)
    f_d, _ = medium.path("FOUNDATION", F_SIZE * k, x + K * k, y + F_BASE * k, F_TRACK)
    n_right = medium.last_box[2]
    return ([f'<path fill="{text_color}" d="{word_d}"/>',
             f'<path fill="{text_color}" d="{f_d}"/>'], n_right, y + F_BASE * k)


def build_lockup(text_color, tagline_color, leaf_light, leaf_dark, stem_color,
                 tagline=True, bg=None):
    body, n_right, f_base = wordmark(text_color)
    body.append(sprout(n_right, f_base, K, stem_color, leaf_light, leaf_dark))
    top = f_base + BB[1] * K
    right = n_right + BB[2] * K
    height = f_base + 2
    if tagline:
        t_size = size_for(semi, TAGLINE, T_TRACK, T_WIDTH)
        t_d, _ = semi.path(TAGLINE, t_size, -K, T_BASE, T_TRACK)
        body.append(f'<path fill="{tagline_color}" d="{t_d}"/>')
        right = max(right, semi.last_box[2])
        height = T_BASE + 2
    return svg_doc(right + 2, height, body, bg, pad=0 if bg is None else 48,
                   top=top - 2, left=-K - 2)


def svg_doc(w, h, body, bg=None, pad=0, top=0, left=0):
    x, y = left - pad, top - pad
    vw, vh = w - left + 2 * pad, h - top + 2 * pad
    vb = f"{x:.0f} {y:.0f} {vw:.0f} {vh:.0f}"
    rect = (f'<rect x="{x:.0f}" y="{y:.0f}" width="{vw:.0f}" '
            f'height="{vh:.0f}" fill="{bg}"/>') if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" '
            f'role="img" aria-label="Nunayon Foundation">'
            f'<title>Nunayon Foundation</title>{rect}{"".join(body)}</svg>\n')


def build_mark(bg=None, stem=LEAF_SHADOW, light=LEAF, dark=LEAF_SHADOW, rounded=True):
    """Square sprout icon for favicons, avatars and app icons."""
    body = []
    if bg:
        r = 112 if rounded else 0
        body.append(f'<rect width="512" height="512" rx="{r}" fill="{bg}"/>')
    w, h = BB[2] - BB[0], BB[3] - BB[1]
    k = (512 * (0.72 if bg else 0.92)) / max(w, h)
    ox = 256 - (BB[0] + w / 2) * k
    oy = 256 - (BB[1] + h / 2) * k
    body.append(sprout(ox, oy, k, stem, light, dark))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" '
            f'role="img" aria-label="Nunayon Foundation">'
            f'<title>Nunayon Foundation</title>{"".join(body)}</svg>\n')


def build_horizontal(text_color, leaf_light, leaf_dark, stem_color):
    """One-line lockup for site headers: sprout mark, then nunayon / FOUNDATION."""
    k = (F_BASE - R(43)) / (BB[3] - BB[1])     # mark spans x-height top to baseline
    mark_w = (BB[2] - BB[0]) * k
    tx = mark_w + 18 * K
    body, _, _ = wordmark(text_color, x=tx, y=-R(43))
    body.insert(0, sprout(-BB[0] * k, F_BASE - R(43), k, stem_color, leaf_light, leaf_dark))
    return svg_doc(tx + 312 * K + 2, F_BASE - R(43) + 2, body, top=-2, left=-2)


FILES = {
    # Primary stacked lockup with tagline
    "nunayon-logo-primary.svg": build_lockup(TEAL, FOREST, LEAF, LEAF_SHADOW, LEAF_SHADOW),
    "nunayon-logo-primary-on-cream.svg": build_lockup(TEAL, FOREST, LEAF, LEAF_SHADOW, LEAF_SHADOW, bg=CREAM),
    "nunayon-logo-no-tagline.svg": build_lockup(TEAL, FOREST, LEAF, LEAF_SHADOW, LEAF_SHADOW, tagline=False),
    # Reversed for teal / dark photo backgrounds
    "nunayon-logo-reversed.svg": build_lockup(WHITE, MINT_PALE, MINT, LEAF, WHITE),
    "nunayon-logo-reversed-on-teal.svg": build_lockup(WHITE, MINT_PALE, MINT, LEAF, WHITE, bg=TEAL),
    # Single-colour versions (print, embroidery, stamps)
    "nunayon-logo-mono-teal.svg": build_lockup(TEAL, TEAL, TEAL, TEAL, TEAL),
    "nunayon-logo-mono-white.svg": build_lockup(WHITE, WHITE, WHITE, WHITE, WHITE),
    # Horizontal header lockup
    "nunayon-logo-horizontal.svg": build_horizontal(TEAL, LEAF, LEAF_SHADOW, LEAF_SHADOW),
    "nunayon-logo-horizontal-reversed.svg": build_horizontal(WHITE, MINT, LEAF, WHITE),
    # Icon / mark
    "nunayon-mark.svg": build_mark(),
    "nunayon-mark-badge-teal.svg": build_mark(bg=TEAL, stem=WHITE, light=MINT, dark=LEAF),
    "nunayon-mark-badge-cream.svg": build_mark(bg=CREAM),
    # Full-bleed square (iOS rounds the corners itself)
    "nunayon-mark-square-teal.svg": build_mark(bg=TEAL, stem=WHITE, light=MINT, dark=LEAF, rounded=False),
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, svg in FILES.items():
        (OUT / name).write_text(svg)
        print("wrote", OUT / name)

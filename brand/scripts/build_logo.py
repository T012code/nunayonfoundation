"""Build the Nunayon Foundation logo set as outlined SVGs.

Text is converted to vector paths (Montserrat, SIL OFL) so the files render
identically everywhere, with no font dependency.

Usage:  python3 brand/scripts/build_logo.py
Needs:  pip install fonttools uharfbuzz
"""
import math
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
FONT = ROOT / "fonts" / "Montserrat[wght].ttf"
OUT = ROOT / "logo" / "svg"

# Brand palette (sampled from the original logo artwork)
TEAL = "#00343F"      # Nunayon Teal - wordmark, primary
LEAF = "#4A8F62"      # Leaf Green - leaf light side
LEAF_DARK = "#2F6E4A" # Deep Leaf - leaf shaded side
FOREST = "#2E6A55"    # Forest - tagline
CREAM = "#FDF7EC"     # Cream - backgrounds
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
        infos, positions = buf.glyph_infos, buf.glyph_positions
        for i, (info, pos) in enumerate(zip(infos, positions)):
            name = self.order[info.codepoint]
            svg = SVGPathPen(self.glyphs)
            pen = TransformPen(svg, (scale, 0, 0, -scale, pen_x + pos.x_offset * scale, y))
            self.glyphs[name].draw(pen)
            d.append(svg.getCommands())
            pen_x += pos.x_advance * scale
            if i < len(infos) - 1:
                pen_x += tracking * size
        return " ".join(d), pen_x - x


# Leaf: pointed teardrop, base at origin, tip pointing up (-y), length 100.
LEAF_L = "M0 0 C-30 -12 -44 -55 0 -100 C-6 -62 -4 -30 0 0 Z"
LEAF_R = "M0 0 C-4 -30 -6 -62 0 -100 C38 -62 36 -20 0 0 Z"
LEAF_FULL = "M0 0 C-30 -12 -44 -55 0 -100 C38 -62 36 -20 0 0 Z"
LEAF_OUTLINE = [(0, 0), (-30, -12), (-44, -55), (0, -100), (38, -62), (36, -20)]

# Sprout geometry in mark units, stem base at origin.
STEM = [(0, 0), (0, -40), (6, -78), (24, -104)]
BRANCH = [(2, -46), (12, -60), (30, -70), (52, -74)]
BIG_LEAF = (22, -100, 1.55, 30)    # x, y, scale, angle
SMALL_LEAF = (50, -73, 0.82, 64)
STEM_W = 11


def _leaf_points(x, y, scale, angle):
    a = math.radians(angle)
    for px, py in LEAF_OUTLINE:
        px, py = px * scale, py * scale
        yield (x + px * math.cos(a) - py * math.sin(a),
               y + px * math.sin(a) + py * math.cos(a))


def sprout_bbox():
    pts = list(_leaf_points(*BIG_LEAF)) + list(_leaf_points(*SMALL_LEAF))
    pts += [(x + dx, y) for x, y in STEM + BRANCH for dx in (-STEM_W / 2, STEM_W / 2)]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    return min(xs), min(ys), max(xs), max(ys)


def leaf(x, y, scale, angle, light, dark):
    t = f'translate({x:.1f} {y:.1f}) rotate({angle}) scale({scale})'
    if light == dark:  # single colour: one shape, no seam at the midrib
        return f'<path transform="{t}" fill="{light}" d="{LEAF_FULL}"/>'
    return (f'<g transform="{t}"><path fill="{dark}" d="{LEAF_L}"/>'
            f'<path fill="{light}" d="{LEAF_R}"/></g>')


def sprout(ox, oy, s, stem, light, dark):
    """The sprout mark. (ox, oy) is the stem base; s is overall scale."""
    def curve(pts):
        (x0, y0), *rest = pts
        c = " ".join(f"{ox + x * s:.1f} {oy + y * s:.1f}" for x, y in rest)
        return f"M{ox + x0 * s:.1f} {oy + y0 * s:.1f} C{c}"
    def lf(x, y, sc, ang):
        return leaf(ox + x * s, oy + y * s, sc * s, ang, light, dark)
    sw = STEM_W * s
    return "".join([
        f'<path d="{curve(STEM)}" fill="none" stroke="{stem}" '
        f'stroke-width="{sw:.1f}" stroke-linecap="round"/>',
        f'<path d="{curve(BRANCH)}" fill="none" stroke="{stem}" '
        f'stroke-width="{sw * 0.8:.1f}" stroke-linecap="round"/>',
        lf(*BIG_LEAF), lf(*SMALL_LEAF),
    ])


bold, medium, semi = Face(750), Face(500), Face(600)

# Layout units: wordmark "nunayon" is 600 wide.
WORD_SIZE = 600 / (bold.path("nunayon", 1000, 0, 0)[1] / 1000)
X_HEIGHT = WORD_SIZE * 0.517
F_TRACK, T_TRACK = 0.16, 0.035     # letter-spacing in em
F_WIDTH = 612                      # "FOUNDATION" spans the wordmark
BB = sprout_bbox()
LEAF_RISE = 22                     # leaf tip sits just above the x-height
WORD_BASE = X_HEIGHT + LEAF_RISE


def size_for(face, text, tracking, width):
    """Font size at which text with the given tracking spans width."""
    _, w = face.path(text, 1000, 0, 0)
    return width / (w / 1000 + tracking * (len(text) - 1))


F_SIZE = size_for(medium, "FOUNDATION", F_TRACK, F_WIDTH)
DESCENDER_GAP = 0.25 * WORD_SIZE   # clears the "y" descender
F_BASE = WORD_BASE + DESCENDER_GAP + F_SIZE * 0.700
# Sprout spans from just above the wordmark down to the FOUNDATION baseline
SPROUT_S = F_BASE / (BB[3] - BB[1])


def build_lockup(text_color, tagline_color, leaf_light, leaf_dark, stem_color,
                 tagline=True, bg=None):
    word_d, _ = bold.path("nunayon", WORD_SIZE, 0, WORD_BASE)
    f_d, _ = medium.path("FOUNDATION", F_SIZE, 3, F_BASE, F_TRACK)
    # Sprout grows beside the final N of FOUNDATION; top of its leaf is y=0.
    stem_y = -BB[1] * SPROUT_S
    stem_x = F_WIDTH + 22 - BB[0] * SPROUT_S
    mark = sprout(stem_x, stem_y, SPROUT_S, stem_color, leaf_light, leaf_dark)
    right = stem_x + BB[2] * SPROUT_S
    body = [f'<path fill="{text_color}" d="{word_d}"/>',
            f'<path fill="{text_color}" d="{f_d}"/>', mark]
    height = max(F_BASE, stem_y + STEM_W * SPROUT_S / 2)
    if tagline:
        tag = "EMPOWERING LIVES. BUILDING COMMUNITIES."
        t_size = size_for(semi, tag, T_TRACK, right - 4)
        t_base = height + 26 + t_size * 0.700
        t_d, _ = semi.path(tag, t_size, 2, t_base, T_TRACK)
        body.append(f'<path fill="{tagline_color}" d="{t_d}"/>')
        height = t_base
    return svg_doc(right, height, body, bg, pad=0 if bg is None else 48)


def svg_doc(w, h, body, bg=None, pad=0, top=0):
    vb = f"{-pad} {top - pad} {w + 2 * pad:.0f} {h - top + 2 * pad:.0f}"
    rect = (f'<rect x="{-pad}" y="{top - pad}" width="{w + 2 * pad:.0f}" '
            f'height="{h - top + 2 * pad:.0f}" fill="{bg}"/>') if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" '
            f'role="img" aria-label="Nunayon Foundation">'
            f'<title>Nunayon Foundation</title>{rect}{"".join(body)}</svg>\n')


def build_mark(bg=None, stem=TEAL, light=LEAF, dark=LEAF_DARK, rounded=True):
    """Square sprout icon for favicons, avatars and app icons."""
    body = []
    if bg:
        r = 112 if rounded else 0
        body.append(f'<rect width="512" height="512" rx="{r}" fill="{bg}"/>')
    w, h = BB[2] - BB[0], BB[3] - BB[1]
    s = (512 * (0.74 if bg else 0.92)) / max(w, h)
    ox = 256 - (BB[0] + w / 2) * s
    oy = 256 - (BB[1] + h / 2) * s
    body.append(sprout(ox, oy, s, stem, light, dark))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" '
            f'role="img" aria-label="Nunayon Foundation">'
            f'<title>Nunayon Foundation</title>{"".join(body)}</svg>\n')


def build_horizontal(text_color, leaf_light, leaf_dark, stem_color):
    """Compact one-line lockup for site headers: sprout + nunayon / FOUNDATION."""
    k = 0.6
    word_w = 600 * k
    f_size = size_for(medium, "FOUNDATION", F_TRACK, word_w)
    word_base = X_HEIGHT * k
    f_base = word_base + 16 + f_size * 0.7
    s = (f_base + 6) / (BB[3] - BB[1])
    ox, oy = -BB[0] * s, -BB[1] * s
    mark = sprout(ox, oy, s, stem_color, leaf_light, leaf_dark)
    tx = (BB[2] - BB[0]) * s + 24
    word_d, _ = bold.path("nunayon", WORD_SIZE * k, tx, word_base)
    f_d, _ = medium.path("FOUNDATION", f_size, tx + 2, f_base, F_TRACK)
    return svg_doc(tx + word_w + 4, f_base + 6,
                   [mark, f'<path fill="{text_color}" d="{word_d}"/>',
                    f'<path fill="{text_color}" d="{f_d}"/>'], top=-2)


FILES = {
    # Primary stacked lockup with tagline
    "nunayon-logo-primary.svg": build_lockup(TEAL, FOREST, LEAF, LEAF_DARK, TEAL),
    "nunayon-logo-primary-on-cream.svg": build_lockup(TEAL, FOREST, LEAF, LEAF_DARK, TEAL, bg=CREAM),
    "nunayon-logo-no-tagline.svg": build_lockup(TEAL, FOREST, LEAF, LEAF_DARK, TEAL, tagline=False),
    # Reversed for teal / dark photo backgrounds
    "nunayon-logo-reversed.svg": build_lockup(WHITE, "#BFE3CB", "#7CC495", LEAF, WHITE),
    "nunayon-logo-reversed-on-teal.svg": build_lockup(WHITE, "#BFE3CB", "#7CC495", LEAF, WHITE, bg=TEAL),
    # Single-colour versions (print, embroidery, stamps)
    "nunayon-logo-mono-teal.svg": build_lockup(TEAL, TEAL, TEAL, TEAL, TEAL),
    "nunayon-logo-mono-white.svg": build_lockup(WHITE, WHITE, WHITE, WHITE, WHITE),
    # Horizontal header lockup
    "nunayon-logo-horizontal.svg": build_horizontal(TEAL, LEAF, LEAF_DARK, TEAL),
    "nunayon-logo-horizontal-reversed.svg": build_horizontal(WHITE, "#7CC495", LEAF, WHITE),
    # Icon / mark
    "nunayon-mark.svg": build_mark(),
    "nunayon-mark-badge-teal.svg": build_mark(bg=TEAL, stem=WHITE, light="#7CC495", dark=LEAF),
    "nunayon-mark-badge-cream.svg": build_mark(bg=CREAM),
    # Full-bleed square (iOS rounds the corners itself)
    "nunayon-mark-square-teal.svg": build_mark(bg=TEAL, stem=WHITE, light="#7CC495", dark=LEAF, rounded=False),
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, svg in FILES.items():
        (OUT / name).write_text(svg)
        print("wrote", OUT / name)

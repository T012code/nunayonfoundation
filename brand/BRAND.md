# Nunayon Foundation — Brand Guidelines

> **Empowering lives. Building communities.**

This folder holds the logo, colours, type and tokens for nunayonfoundation.org.
Open `brand/index.html` in a browser for the visual guide.

The logo here is a clean vector rebuild of the original artwork
(`reference/`). The sprout was traced from the original and fitted with smooth curves. All text in the logo files is
converted to outlines, so they need no fonts installed.

---

## 1. Logo

The logo has three parts:

- **Wordmark:** "nunayon", lowercase, Montserrat Bold
- **Descriptor:** "FOUNDATION", Montserrat Medium, widely letter-spaced
- **Sprout:** grows out of the final "N" of FOUNDATION. A slim stem rises just after the N and curls into a small leaf. Above it, a large leaf floats with its tail pointing down at the stem. Each leaf has a dark Leaf Shadow crescent on one side and a Leaf Green body. The sprout stands for growth and the communities the foundation supports.

### Versions (`logo/svg`, PNGs in `logo/png`)

| File | Use |
|---|---|
| `nunayon-logo-primary.svg` | **Default.** Full lockup with tagline on white or cream |
| `nunayon-logo-primary-on-cream.svg` | Same, with cream background built in (social posts, docs) |
| `nunayon-logo-no-tagline.svg` | When the tagline would be too small to read (under ~240px wide) |
| `nunayon-logo-horizontal.svg` | Website header / navbar, email signatures |
| `nunayon-logo-reversed.svg` | On Nunayon Teal or dark photos (transparent background) |
| `nunayon-logo-reversed-on-teal.svg` | Reversed with teal background built in |
| `nunayon-logo-horizontal-reversed.svg` | Header on dark backgrounds / footer |
| `nunayon-logo-mono-teal.svg` | One-colour print, stamps, embroidery |
| `nunayon-logo-mono-white.svg` | One-colour white on any dark background |
| `nunayon-mark.svg` | Sprout icon on its own |
| `nunayon-mark-badge-teal.svg` | Social avatars, app icon, favicon |
| `nunayon-mark-badge-cream.svg` | Light avatar alternative |

### Clear space and minimum size

- Keep clear space around the logo equal to the height of the **"n"** in "nunayon".
- Minimum width: primary lockup **160px / 35mm**. Horizontal lockup **120px / 25mm**. Mark **16px**.
- Under 240px wide, drop the tagline (`no-tagline` or `horizontal`).

### Don'ts

- Don't recolour, stretch, rotate or add effects (shadows, outlines, gradients).
- Don't move or resize the sprout relative to the wordmark.
- Don't place the full-colour logo on busy photos. Use the reversed or mono-white version on a dark overlay.
- Don't retype the wordmark in a live font. Always use the supplied files.

---

## 2. Colour

| Name | HEX | RGB | Role |
|---|---|---|---|
| **Nunayon Teal** | `#00343F` | 0, 52, 63 | Primary. Wordmark, headings, nav, footer |
| Teal 700 | `#0B4A57` | 11, 74, 87 | Hover/pressed on teal |
| **Leaf Green** | `#4A8F62` | 74, 143, 98 | Logo leaf, icons, illustrations, large accents |
| Leaf Shadow | `#00393E` | 0, 57, 62 | Dark side of the leaves and the stem (logo only) |
| Deep Leaf | `#2F6E4A` | 47, 110, 74 | Green buttons, links |
| Forest | `#2E6A55` | 46, 106, 85 | Tagline, green text |
| Mint | `#7CC495` | 124, 196, 149 | Leaf on dark backgrounds |
| Pale Mint | `#BFE3CB` | 191, 227, 203 | Tints, tagline on teal |
| **Cream** | `#FDF7EC` | 253, 247, 236 | Page background |
| Sand | `#F6E3CC` | 246, 227, 204 | Warm section backgrounds (from the original artwork) |
| Sunrise Amber | `#E8A33D` | 232, 163, 61 | **Donate** call to action only |
| Slate | `#4A6268` | 74, 98, 104 | Secondary body text |

**Proportion guide:** about 60% Cream/White, 25% Teal, 10% greens, 5% Amber.

The Teal, Leaf Green, Leaf Shadow, Forest and Sand values were sampled from the original logo
artwork. Teal 700, Deep Leaf, Mint, Pale Mint, Amber and Slate are added to complete the
web palette. Amber gives the Donate button a warm colour that stands out.

### Accessibility (WCAG 2.1 contrast)

| Pair | Ratio | Passes |
|---|---|---|
| Teal on White / Cream | 13.4 / 12.6 | AAA, all text |
| White on Teal | 13.4 | AAA |
| Forest on White / Cream | 6.4 / 6.0 | AA, all text |
| Deep Leaf on White (or White on Deep Leaf) | 6.1 | AA, all text |
| Slate on White / Cream | 6.5 / 6.1 | AA, all text |
| Teal on Amber (Donate button) | 6.2 | AA, all text |
| Mint on Teal | 6.5 | AA, all text |
| Leaf Green on White | 3.9 | **Large text / graphics only.** Not body text |

Never put white text on Amber (2.2) or on Leaf Green buttons. Use Teal on Amber, and White on Deep Leaf.

---

## 3. Typography

**Montserrat** (free, Google Fonts, SIL Open Font License; a copy is in `fonts/`).

| Style | Weight | Size (desktop / mobile) | Notes |
|---|---|---|---|
| Display / H1 | 800 ExtraBold | 56 / 36px | Teal, tight leading 1.1 |
| H2 | 700 Bold | 40 / 28px | |
| H3 | 700 Bold | 24 / 20px | |
| Eyebrow / label | 600 SemiBold | 13px | UPPERCASE, letter-spacing 0.16em, Forest |
| Body | 400 Regular | 17 / 16px | line-height 1.65, Teal or Slate |
| Button | 700 Bold | 16px | |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

---

## 4. Graphic elements

- **The leaf:** a single leaf from the sprout can be a bullet, divider or section accent in Leaf Green. Use it sparingly.
- **Shapes:** soft rounded corners (12px cards, pill buttons) to keep things warm and friendly.
- **Photography:** real people and communities, warm natural light, faces visible. Avoid staged stock photos. On dark overlays use `rgba(0,52,63,0.65)` (Teal).
- **Tone of voice:** warm, hopeful, direct. Speak with communities, not about them.

---

## 5. Website files

- `tokens/tokens.css`: CSS custom properties (`--nf-teal`, …)
- `tokens/tokens.json`: same values for a Tailwind `theme.extend`
- `favicon/`: `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`

```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#00343F">
```

## 6. Regenerating the assets

```bash
pip install fonttools uharfbuzz
python3 brand/scripts/build_logo.py   # writes logo/svg/*.svg
node brand/scripts/export_png.js      # writes logo/png + favicon PNGs (needs playwright)
```

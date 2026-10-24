// Rasterise the SVG logo set to PNGs and favicons using Playwright/Chromium.
// Usage: node brand/scripts/export_png.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SVG = path.join(ROOT, 'logo', 'svg');

// [source svg, output file, width px, height px (square icons only)]
const JOBS = [
  ['nunayon-logo-primary.svg', 'logo/png/nunayon-logo-primary-1200.png', 1200],
  ['nunayon-logo-primary.svg', 'logo/png/nunayon-logo-primary-600.png', 600],
  ['nunayon-logo-primary-on-cream.svg', 'logo/png/nunayon-logo-primary-on-cream-1200.png', 1200],
  ['nunayon-logo-no-tagline.svg', 'logo/png/nunayon-logo-no-tagline-1200.png', 1200],
  ['nunayon-logo-reversed.svg', 'logo/png/nunayon-logo-reversed-1200.png', 1200],
  ['nunayon-logo-reversed-on-teal.svg', 'logo/png/nunayon-logo-reversed-on-teal-1200.png', 1200],
  ['nunayon-logo-mono-teal.svg', 'logo/png/nunayon-logo-mono-teal-1200.png', 1200],
  ['nunayon-logo-mono-white.svg', 'logo/png/nunayon-logo-mono-white-1200.png', 1200],
  ['nunayon-logo-horizontal.svg', 'logo/png/nunayon-logo-horizontal-800.png', 800],
  ['nunayon-logo-horizontal-reversed.svg', 'logo/png/nunayon-logo-horizontal-reversed-800.png', 800],
  ['nunayon-mark.svg', 'logo/png/nunayon-mark-512.png', 512, 512],
  ['nunayon-mark-badge-teal.svg', 'logo/png/nunayon-mark-badge-teal-1024.png', 1024, 1024],
  ['nunayon-mark-badge-cream.svg', 'logo/png/nunayon-mark-badge-cream-1024.png', 1024, 1024],
  // Favicons / app icons
  ['nunayon-mark-badge-teal.svg', 'favicon/favicon-16.png', 16, 16],
  ['nunayon-mark-badge-teal.svg', 'favicon/favicon-32.png', 32, 32],
  ['nunayon-mark-badge-teal.svg', 'favicon/favicon-48.png', 48, 48],
  ['nunayon-mark-badge-teal.svg', 'favicon/icon-192.png', 192, 192],
  ['nunayon-mark-badge-teal.svg', 'favicon/icon-512.png', 512, 512],
  ['nunayon-mark-square-teal.svg', 'favicon/apple-touch-icon.png', 180, 180],
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [src, out, w, h] of JOBS) {
    const svg = fs.readFileSync(path.join(SVG, src), 'utf8');
    let height = h;
    if (!height) {
      const vb = svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
      height = Math.round((w * vb[3]) / vb[2]);
    }
    await page.setViewportSize({ width: w, height });
    await page.setContent(
      '<style>html,body{margin:0;background:transparent}svg{width:100vw;height:100vh;display:block}</style>' + svg);
    const target = path.join(ROOT, out);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    await page.screenshot({ path: target, omitBackground: true });
    console.log('wrote', out);
  }
  await browser.close();
})();

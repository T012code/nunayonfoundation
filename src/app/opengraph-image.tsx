import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { LOGO_STACKED } from "@/components/brand/logo-paths";
import { site } from "@/content/site";

// The picture shown when the site is shared on WhatsApp, Facebook, X, LinkedIn and Slack.
// News stories and programmes use their own photo instead.
export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Email-safe hex versions of the brand colours (the image renderer can't read OKLCH).
const C = { teal: "#00393e", leaf: "#2f8a57", mint: "#8fd3a8", cream: "#f7f1e6", white: "#ffffff" };
const REVERSED = { ink: C.white, shadow: C.leaf, leaf: C.mint, tagline: C.mint } as const;

export default async function OpengraphImage() {
  const dir = join(process.cwd(), "src/assets");
  const [heavy, semi, photo] = await Promise.all([
    readFile(join(dir, "fonts/Montserrat-ExtraBold.ttf")),
    readFile(join(dir, "fonts/Montserrat-SemiBold.ttf")),
    readFile(join(dir, "og-photo.jpg")),
  ]);
  const [, , vw, vh] = LOGO_STACKED.viewBox.split(" ").map(Number);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: C.teal, fontFamily: "Montserrat" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700, padding: "64px 64px 56px" }}>
          <svg width={240} height={(240 * vh) / vw} viewBox={LOGO_STACKED.viewBox}>
            {LOGO_STACKED.paths.map((p, i) => (
              <path key={i} d={p.d} fill={REVERSED[p.role]} />
            ))}
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.06, letterSpacing: -1.5, color: C.cream }}>Empowering lives.</div>
            <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.06, letterSpacing: -1.5, color: C.mint }}>Building communities.</div>
            <div style={{ marginTop: 28, fontSize: 26, fontWeight: 600, lineHeight: 1.4, color: "#c9ddd9" }}>
              Education, health, livelihood and relief outreaches for families across Nigeria.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 22, fontWeight: 600, color: C.cream }}>
            <div style={{ width: 36, height: 4, marginRight: 14, background: C.leaf }} />
            nunayonfoundation.org
          </div>
        </div>
        <img src={`data:image/jpeg;base64,${photo.toString("base64")}`} width={500} height={630} alt="" style={{ objectFit: "cover" }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Montserrat", data: heavy, weight: 800, style: "normal" },
        { name: "Montserrat", data: semi, weight: 600, style: "normal" },
      ],
    },
  );
}

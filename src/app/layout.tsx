import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { SiteAnalytics } from "@/components/site/SiteAnalytics";
import { site } from "@/content/site";
import { SITE_URL } from "@/lib/env";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${site.name} · ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: site.name,
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    // The picture itself is app/opengraph-image.tsx.
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#FDF7EC",
  // Edge to edge on notched phones; page gutters keep text clear of the notch and home bar.
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `js` is added before first paint so scroll animations can start hidden; without
    // JavaScript the page shows everything (and, in maintenance mode, the status page).
    <html lang="en-NG" className={montserrat.variable} suppressHydrationWarning>
      <head>
        {/* `team-view`: signed in to the admin (its sign-in cookie is present), so the real site
            shows through maintenance / coming soon mode. Only changes what's displayed. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "var d=document.documentElement;d.classList.add('js');if(/(^|;\\s*)sb-[^=]+-auth-token(\\.0)?=/.test(document.cookie))d.classList.add('team-view')",
          }}
        />
      </head>
      <body>
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}

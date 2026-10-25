import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
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
    images: [{ url: "/placeholder/children-waving-1600.webp", width: 1600, height: 1067, alt: "Children smiling and waving" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#FDF7EC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `js` is added before first paint so scroll animations can start hidden; without
    // JavaScript the page shows everything.
    <html lang="en-NG" className={montserrat.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

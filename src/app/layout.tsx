import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://omerta-rp.fr"),
  title: { default: `${site.name} — Serveur RP`, template: `%s — ${site.name}` },
  description: site.description,
  icons: { icon: "/assets/logo.png" },
  openGraph: {
    title: `${site.name} — Serveur RP`,
    description: site.description,
    images: ["/assets/logo.png"],
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${barlow.variable} ${barlowCondensed.variable} ${jetbrains.variable}`}
    >
      <body>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-void"
        >
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans_Arabic, Reem_Kufi } from "next/font/google";
import "@/styles/globals.css";
import { SyncStoresAuthCookie } from "@/components/store/SyncStoresAuthCookie";
import {
  SITE,
  buildTitle,
  canonicalUrl,
  jsonLdString,
  organizationSchema,
  websiteSchema,
} from "@/lib/seo";

const reemKufi = Reem_Kufi({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-display-loaded",
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body-loaded",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: buildTitle(),
  description: SITE.defaultDescription,
  alternates: { canonical: canonicalUrl("/") },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
    url: SITE.url,
    images: [{ url: SITE.defaultOgImage }],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
    images: [SITE.defaultOgImage],
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: SITE.themeColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* No-flash theme: apply saved/system theme before first paint.
            Shares the "stores_theme" key with the seller dashboard. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("stores_theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${reemKufi.variable} ${ibmPlexSansArabic.variable} min-h-screen antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(websiteSchema()) }}
        />
        <SyncStoresAuthCookie />
        {children}
      </body>
    </html>
  );
}

import { Html, Head, Main, NextScript } from "next/document";

/**
 * Global HTML shell.
 *
 * Page-specific meta (title, description, canonical, OG, JSON-LD) belongs in
 * each page's <Head>, not here. This file is for assets and directives that
 * apply to every route: charset, theme color, font preload, PWA hints.
 */
export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <meta charSet="utf-8" />

        {/* PWA / browser chrome */}
        <meta name="theme-color" content="#0A4B8C" />
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Arabic font — preconnect first so the stylesheet request is cheap */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Discoverability */}
        <link rel="alternate" type="application/xml" title="Sitemap" href="/sitemap.xml" />
      </Head>
      <body
        className="antialiased bg-gray-50"
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <Main />
        <NextScript />

        {/* DASM Talk widget — unified conversations layer (talk.dasm.com.sa) */}
        <script src="https://talk.dasm.com.sa/widget.js" async></script>
      </body>
    </Html>
  );
}

import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { shouldHideFloatingWidgets } from "@/lib/hideFloatingWidgets";
import { SITE, canonicalUrl, organizationSchema, websiteSchema, jsonLdString } from "@/lib/seo";

/**
 * Global defaults: title, description, Open Graph, Twitter Card, canonical,
 * and sitewide Organization + WebSite JSON-LD. Pages override title/description
 * via their own <Head>; Next.js resolves the last <Head> for each tag so
 * page-level content wins without duplication.
 */
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // asPath includes query string; strip it for canonical stability.
  const canonical = canonicalUrl(router.asPath.split(/[?#]/)[0] || "/");
  const ogImage = `${SITE.url}${SITE.defaultOgImage}`;

  useEffect(() => {
    const path = router.pathname || "/";
    const hide = shouldHideFloatingWidgets(path);
    document.body.classList.toggle("dasm-no-floating-widgets", hide);

    const scriptId = "dasm-talk-widget";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (hide) {
      existing?.remove();
    } else if (!existing) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://talk.dasm.com.sa/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      document.body.classList.remove("dasm-no-floating-widgets");
    };
  }, [router.pathname]);

  return (
    <>
      <Head>
        {/* Core */}
        <title>{SITE.defaultTitle}</title>
        <meta name="description" content={SITE.defaultDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="application-name" content={SITE.name} />
        <meta name="author" content={SITE.name} />

        {/* Canonical — per-page override allowed */}
        <link rel="canonical" href={canonical} />

        {/* Open Graph (defaults — pages override) */}
        <meta property="og:site_name" content={SITE.name} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={SITE.locale} />
        <meta property="og:title" content={SITE.defaultTitle} />
        <meta property="og:description" content={SITE.defaultDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={SITE.name} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={SITE.twitter} />
        <meta name="twitter:title" content={SITE.defaultTitle} />
        <meta name="twitter:description" content={SITE.defaultDescription} />
        <meta name="twitter:image" content={ogImage} />

        {/* Sitewide JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(websiteSchema()) }}
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

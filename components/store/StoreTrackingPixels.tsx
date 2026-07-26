"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  getMarketingConsent,
  revokeLoadedMarketingConsent,
  subscribeToMarketingConsent,
  type MarketingConsentState,
} from "@/lib/marketing-consent";
import {
  hasActivePixels,
  normalizeTrackingId,
  type MarketingTrackingConfig,
} from "@/lib/marketing-tracking";

export function StoreTrackingPixels({
  storeSlug,
  config,
}: {
  storeSlug: string;
  config?: MarketingTrackingConfig | null;
}) {
  const [consent, setConsent] =
    useState<MarketingConsentState>("unknown");

  useEffect(() => {
    let active = true;
    const syncConsent = () => {
      if (!active) return;

      const trackingWindow = window as typeof window & {
        __dasmTrackingStoreSlug?: string;
      };
      if (
        trackingWindow.__dasmTrackingStoreSlug &&
        trackingWindow.__dasmTrackingStoreSlug !== storeSlug
      ) {
        window.location.reload();
        return;
      }

      trackingWindow.__dasmTrackingStoreSlug = storeSlug;
      setConsent(getMarketingConsent(storeSlug));
    };
    const unsubscribe = subscribeToMarketingConsent(storeSlug, syncConsent);
    queueMicrotask(syncConsent);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [storeSlug]);

  useEffect(() => {
    if (consent !== "granted") {
      revokeLoadedMarketingConsent();
    }
  }, [consent]);

  if (consent !== "granted" || !hasActivePixels(config)) {
    return null;
  }

  const tiktokId = normalizeTrackingId(config?.tiktok_pixel_id);
  const snapId = normalizeTrackingId(config?.snap_pixel_id);
  const metaId = normalizeTrackingId(config?.meta_pixel_id);
  const googleAdsId = normalizeTrackingId(config?.google_ads_id);
  const scriptSuffix = storeSlug.replace(/[^A-Za-z0-9_-]/g, "-");

  return (
    <>
      {tiktokId ? (
        <Script id={`dasm-tiktok-pixel-${scriptSuffix}`} strategy="afterInteractive">
          {`
!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript";o.async=!0;
o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
ttq.load("${tiktokId}");ttq.instance("${tiktokId}").page();}(window,document,"ttq");
          `}
        </Script>
      ) : null}

      {snapId ? (
        <>
          <Script
            id={`dasm-snap-pixel-${scriptSuffix}`}
            src="https://sc-static.net/scevent.min.js"
            strategy="afterInteractive"
          />
          <Script id={`dasm-snap-init-${scriptSuffix}`} strategy="afterInteractive">
            {`window.snaptr=window.snaptr||function(){window.snaptr.queue.push(arguments)};window.snaptr.queue=[];
snaptr("init","${snapId}",{});snaptr("track","PAGE_VIEW");`}
          </Script>
        </>
      ) : null}

      {metaId ? (
        <Script id={`dasm-meta-pixel-${scriptSuffix}`} strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script",
"https://connect.facebook.net/en_US/fbevents.js");
fbq("init","${metaId}");fbq("trackSingle","${metaId}","PageView");`}
        </Script>
      ) : null}

      {googleAdsId ? (
        <>
          <Script
            id={`dasm-gtag-js-${scriptSuffix}`}
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
            strategy="afterInteractive"
          />
          <Script id={`dasm-gtag-init-${scriptSuffix}`} strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag("consent","default",{ad_storage:"granted",analytics_storage:"granted",ad_user_data:"granted",ad_personalization:"granted"});
gtag("js",new Date());gtag("config","${googleAdsId}");`}
          </Script>
        </>
      ) : null}
    </>
  );
}

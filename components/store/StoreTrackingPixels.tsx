"use client";

import Script from "next/script";
import type { MarketingTrackingConfig } from "@/lib/marketing-tracking";
import { hasActivePixels } from "@/lib/marketing-tracking";

export function StoreTrackingPixels({
  config,
}: {
  config?: MarketingTrackingConfig | null;
}) {
  if (!hasActivePixels(config)) {
    return null;
  }

  const tiktokId = config?.tiktok_pixel_id;
  const snapId = config?.snap_pixel_id;
  const metaId = config?.meta_pixel_id;
  const googleAdsId = config?.google_ads_id;

  return (
    <>
      {tiktokId ? (
        <Script id="dasm-tiktok-pixel" strategy="afterInteractive">
          {`
!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript";o.async=!0;
o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
ttq.load("${tiktokId}");ttq.page();}(window,document,"ttq");
          `}
        </Script>
      ) : null}

      {snapId ? (
        <>
          <Script id="dasm-snap-pixel" src="https://sc-static.net/scevent.min.js" strategy="afterInteractive" />
          <Script id="dasm-snap-init" strategy="afterInteractive">
            {`window.snaptr=window.snaptr||function(){window.snaptr.queue.push(arguments)};window.snaptr.queue=[];
snaptr("init","${snapId}",{});snaptr("track","PAGE_VIEW");`}
          </Script>
        </>
      ) : null}

      {metaId ? (
        <>
          <Script id="dasm-meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script",
"https://connect.facebook.net/en_US/fbevents.js");
fbq("init","${metaId}");fbq("track","PageView");`}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      ) : null}

      {googleAdsId ? (
        <>
          <Script
            id="dasm-gtag-js"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
            strategy="afterInteractive"
          />
          <Script id="dasm-gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag("js",new Date());gtag("config","${googleAdsId}");`}
          </Script>
        </>
      ) : null}
    </>
  );
}

import { useEffect, useState, useCallback } from "react";
import { ExternalLink, Megaphone, ChevronLeft, ChevronRight, Sparkles, TrendingUp, Zap } from "lucide-react";
import { platformApi } from "@/lib/api";

interface Ad {
  id: string | number;
  title: string;
  description?: string;
  image_url?: string;
  cta_text?: string;
  cta_url?: string;
  advertiser_name?: string;
}

const FALLBACK_ADS: Ad[] = [
  {
    id: "promo-1",
    title: "عروض الصيف — خصم 30% على أول حملة إعلانية",
    description: "اعرض منتجاتك لآلاف المتسوقين واحصل على مبيعات أكثر",
    cta_text: "ابدأ حملتك",
    cta_url: "https://ads.dasm.com.sa",
    advertiser_name: "داسم أدز",
  },
  {
    id: "promo-2",
    title: "ضاعف مبيعاتك مع الإعلانات المستهدفة",
    description: "باقات تبدأ من ٥٠ ر.س — وصول مباشر لعملائك المحتملين",
    cta_text: "اكتشف الباقات",
    cta_url: "https://ads.dasm.com.sa",
    advertiser_name: "داسم أدز",
  },
  {
    id: "promo-3",
    title: "متجرك يستحق الظهور — أطلق إعلانك الأول مجاناً",
    description: "جرّب بدون مخاطرة: أول ١٠٠٠ مشاهدة مجانية لمتجرك الجديد",
    cta_text: "جرّب مجاناً",
    cta_url: "https://ads.dasm.com.sa",
    advertiser_name: "داسم أدز",
  },
];

const PROMO_ICONS = [Sparkles, TrendingUp, Zap];

export function AdBanner({
  placement = "stores_dashboard",
  variant = "card",
}: {
  placement?: string;
  variant?: "card" | "header";
}) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    platformApi
      .get("/ads/serve", { params: { placement } })
      .then(({ data }) => {
        const items = data?.data;
        if (Array.isArray(items) && items.length > 0) {
          setAds(items);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [placement]);

  const trackClick = useCallback((ad: Ad) => {
    if (String(ad.id).startsWith("promo")) return;
    platformApi.post("/ads/track", { ad_id: ad.id, event: "click", placement }).catch(() => {});
  }, [placement]);

  const displayed = ads.length > 0 ? ads : FALLBACK_ADS;
  const ad = displayed[current % displayed.length];
  const hasMultiple = displayed.length > 1;

  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % displayed.length), 5000);
    return () => clearInterval(timer);
  }, [hasMultiple, displayed.length]);

  if (variant === "header") {
    const PromoIcon = PROMO_ICONS[current % PROMO_ICONS.length];

    if (!loaded) {
      return (
        <div className="h-44 md:h-52 bg-gradient-to-l from-emerald-100 to-teal-50 dark:from-zinc-800 dark:to-zinc-800 animate-pulse" />
      );
    }

    return (
      <div className="relative overflow-hidden bg-gradient-to-l from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-900 dark:via-teal-900 dark:to-emerald-950 shadow-lg shadow-emerald-600/15 dark:shadow-emerald-900/30">
        {ad.image_url && (
          <img src={ad.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        )}

        <div className="relative flex items-center gap-6 px-8 py-12 md:px-10 md:py-16">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
            <PromoIcon className="h-10 w-10" />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-lg md:text-2xl font-bold text-white truncate">{ad.title}</p>
            {ad.description && (
              <p className="text-sm md:text-base text-emerald-100/80 truncate">{ad.description}</p>
            )}
            {ad.advertiser_name && (
              <span className="inline-block text-xs text-emerald-200/60">{ad.advertiser_name}</span>
            )}
          </div>

          {ad.cta_url && (
            <a
              href={ad.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick(ad)}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition shadow-sm"
            >
              {ad.cta_text || "اعرف أكثر"}
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          {hasMultiple && (
            <div className="hidden sm:flex items-center gap-2 mr-1">
              {displayed.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === current % displayed.length
                      ? "w-5 bg-white"
                      : "w-2 bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}

          {ads.length > 0 && (
            <span className="absolute top-3 left-3 rounded-full bg-black/20 px-2.5 py-1 text-[10px] text-white/60">
              إعلان
            </span>
          )}
        </div>
      </div>
    );
  }

  // ─── Card variant (original) ───
  if (!loaded) {
    return (
      <div className="h-36 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 animate-pulse" />
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-900 dark:to-teal-950">
      {ad.image_url && (
        <img
          src={ad.image_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      )}

      <div className="relative flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
          <Megaphone className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-sm font-bold text-white truncate">{ad.title}</h3>
          {ad.description && (
            <p className="text-xs text-emerald-100 line-clamp-2">{ad.description}</p>
          )}
          {ad.advertiser_name && (
            <span className="inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-emerald-200">
              إعلان بواسطة {ad.advertiser_name}
            </span>
          )}
        </div>

        {ad.cta_url && (
          <a
            href={ad.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick(ad)}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm hover:bg-emerald-50 transition"
          >
            {ad.cta_text || "اعرف أكثر"}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => setCurrent((c) => (c - 1 + displayed.length) % displayed.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-1 text-white hover:bg-white/30 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrent((c) => (c + 1) % displayed.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-1 text-white hover:bg-white/30 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {displayed.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current % displayed.length
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {ads.length > 0 && (
        <div className="absolute top-2 left-2">
          <span className="rounded-full bg-black/30 px-2 py-0.5 text-[9px] text-white/70">
            إعلان
          </span>
        </div>
      )}
    </div>
  );
}

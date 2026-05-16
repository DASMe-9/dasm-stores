import Link from "next/link";
import type { CSSProperties } from "react";
import {
  Grid2X2,
  Headphones,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store as StoreIcon,
  Truck,
  Watch,
} from "lucide-react";
import { CartBadge } from "./CartBadge";
import { ShareButton } from "@/components/shared/ShareButton";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { canonicalUrl } from "@/lib/seo";
import type { StorePublic } from "@/lib/api-server";

type HeroTemplateConfig = {
  hero_video_url?: string | null;
  heroVideoUrl?: string | null;
  hero_motion?: string | null;
  heroMotion?: string | null;
};

function cssColor(vars: Record<string, string> | undefined, key: string, fallback: string): string {
  return vars?.[`--${key}`] ?? vars?.[key] ?? fallback;
}

function heroMotion(value: string | null | undefined): string {
  const allowed = new Set(["aurora", "spotlight", "mesh", "silk", "neon"]);
  return value && allowed.has(value) ? value : "aurora";
}

export function StoreHeader({
  store,
  slug,
}: {
  store: StorePublic;
  slug: string;
}) {
  const areaName = store.area?.name_ar;
  const vars = store.theme?.css_variables ?? undefined;
  const templateConfig = (store.theme?.template_config ?? null) as HeroTemplateConfig | null;
  const heroVideoUrl = templateConfig?.hero_video_url ?? templateConfig?.heroVideoUrl ?? null;
  const motion = heroMotion(templateConfig?.hero_motion ?? templateConfig?.heroMotion);
  const primary = cssColor(vars, "primary", "#0f766e");
  const accent = cssColor(vars, "accent", "#14b8a6");

  return (
    <>
      <div
        className={`store-hero-motion store-hero-${motion} relative h-72 overflow-hidden bg-[var(--muted)] md:h-[360px]`}
        style={{ "--primary": primary, "--accent": accent } as CSSProperties}
      >
        {heroVideoUrl ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={heroVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            poster={store.banner_url ?? undefined}
          />
        ) : store.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.banner_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />
        ) : (
          <div className="store-hero-commerce-scene" aria-hidden>
            <div className="store-hero-light-trail store-hero-light-trail-a" />
            <div className="store-hero-light-trail store-hero-light-trail-b" />
            <div className="store-hero-cart-pulse">
              <ShoppingCart className="h-16 w-16" />
            </div>
            <div className="store-hero-product store-hero-product-bag">
              <ShoppingBag className="h-11 w-11" />
            </div>
            <div className="store-hero-product store-hero-product-watch">
              <Watch className="h-11 w-11" />
            </div>
            <div className="store-hero-product store-hero-product-audio">
              <Headphones className="h-11 w-11" />
            </div>
            <span className="store-hero-particle store-hero-particle-a" />
            <span className="store-hero-particle store-hero-particle-b" />
            <span className="store-hero-particle store-hero-particle-c" />
          </div>
        )}
        <div className="store-hero-orb store-hero-orb-a" style={{ backgroundColor: primary }} />
        <div className="store-hero-orb store-hero-orb-b" style={{ backgroundColor: accent }} />
        <div className="store-hero-scanline" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent opacity-70" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-4 pt-0">
        <div className="-mt-20 flex flex-col gap-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-5 shadow-xl shadow-black/5 backdrop-blur md:-mt-24 md:flex-row md:items-center md:p-6">
          <div className="order-1 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-[var(--card)] bg-[var(--muted)] shadow md:order-none">
            {store.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <StoreIcon className="h-11 w-11" style={{ color: "var(--primary)" }} />
            )}
          </div>

          <div className="order-2 min-w-0 flex-1 md:order-none">
            <h1 className="text-2xl font-extrabold text-[var(--foreground)] md:text-3xl">{store.name}</h1>
            {store.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-[var(--muted-foreground)]">
                {store.description}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--muted-foreground)]">
              {areaName ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {areaName}
                </span>
              ) : null}
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                واجهة متجر على داسم
              </span>
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" />
                خيارات التوصيل حسب المتجر
              </span>
              {store.contact_phone ? (
                <a
                  href={`tel:${store.contact_phone}`}
                  className="flex items-center gap-1 hover:underline"
                  style={{ color: "var(--primary)" }}
                >
                  <Phone className="h-3.5 w-3.5" />
                  {store.contact_phone}
                </a>
              ) : null}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Link
                href={`/store/${slug}/products`}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-bold text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                <Grid2X2 className="h-4 w-4" />
                تصفح المنتجات
              </Link>
              <ShareButton title={store.name} url={canonicalUrl(`/store/${slug}`)} />
              <WhatsAppButton phone={store.contact_whatsapp} />
            </div>
          </div>

          <div className="order-3 flex shrink-0 flex-col gap-2 self-stretch md:order-none md:items-end">
            <CartBadge slug={slug} />
            <div className="hidden items-center gap-1 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)] md:flex">
              <Sparkles className="h-3.5 w-3.5" />
              واجهة دعائية متحركة
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

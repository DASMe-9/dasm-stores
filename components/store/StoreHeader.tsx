import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  Headphones,
  MapPin,
  Phone,
  ShoppingBag,
  ShoppingCart,
  Store as StoreIcon,
  Watch,
} from "lucide-react";
import { StoreAuthActions } from "./StoreAuthActions";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { ShareButton } from "@/components/shared/ShareButton";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { ProfileFollowButton } from "@/components/social/ProfileFollowButton";
import { canonicalUrl } from "@/lib/seo";
import type { OwnerPublicProfile, ProfileViewerState, SocialSummary, StorePublic } from "@/lib/api-server";
import { getStoreDisplayName } from "@/lib/store-display";
import { resolveStoreCssVariables, resolveStoreTemplateConfig } from "@/lib/themes";

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
  const allowed = new Set(["aurora", "spotlight", "mesh", "silk", "neon", "showroom-banner"]);
  return value && allowed.has(value) ? value : "aurora";
}

export function StoreHeader({
  store,
  slug,
  ownerPublicProfile,
  socialSummary,
  viewerState,
}: {
  store: StorePublic;
  slug: string;
  ownerPublicProfile?: OwnerPublicProfile | null;
  socialSummary?: SocialSummary | null;
  viewerState?: ProfileViewerState | null;
}) {
  const areaName = store.area?.name_ar;
  const storeName = getStoreDisplayName(store);
  const vars = resolveStoreCssVariables(store);
  const templateConfig = (resolveStoreTemplateConfig(store) ?? null) as HeroTemplateConfig | null;
  const heroVideoUrl = templateConfig?.hero_video_url ?? templateConfig?.heroVideoUrl ?? null;
  const motion = heroMotion(templateConfig?.hero_motion ?? templateConfig?.heroMotion);
  const primary = cssColor(vars, "primary", "#0f766e");
  const accent = cssColor(vars, "accent", "#14b8a6");

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--card)]/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-[var(--card)]/82">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-4 px-4 text-sm sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={`/${slug}`} className="flex min-w-0 items-center gap-2.5" aria-label={storeName}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]">
                {store.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <StoreIcon className="h-5 w-5" style={{ color: "var(--primary-text,var(--primary))" }} />
                )}
              </span>
              <span className="block truncate text-base font-extrabold text-[var(--foreground)]">{storeName}</span>
            </Link>
          </div>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex" aria-label="تنقل المتجر">
            <Link href={`/${slug}`} className="rounded-full px-3 py-2 font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)]">
              الرئيسية
            </Link>
            <Link href="/" className="flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
              <ArrowRight className="h-3.5 w-3.5" />
              متاجر داسم
            </Link>
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <StoreAuthActions slug={slug} />
            <ThemeToggle className="h-10 w-10" />
          </div>
        </div>
      </div>

      <div className="bg-[var(--background)] px-4 pt-4 sm:px-6 lg:px-8">
        <div
          className={`store-hero-motion store-hero-${motion} relative mx-auto h-36 w-full max-w-[1600px] overflow-hidden rounded-3xl bg-[var(--muted)] md:h-52`}
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
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-4 pt-0 sm:px-6 lg:px-8">
        <div className="-mt-12 flex flex-col gap-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-5 shadow-xl shadow-black/5 backdrop-blur md:-mt-16 md:flex-row md:items-center md:p-6">
          <div className="order-1 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-[var(--card)] bg-[var(--muted)] shadow md:order-none">
            {store.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <StoreIcon className="h-11 w-11" style={{ color: "var(--primary-text,var(--primary))" }} />
            )}
          </div>

          <div className="order-2 min-w-0 flex-1 md:order-none">
            <h1 className="text-2xl font-extrabold text-[var(--foreground)] md:text-3xl">{storeName}</h1>
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
              {store.contact_phone ? (
                <a
                  href={`tel:${store.contact_phone}`}
                  className="flex items-center gap-1 hover:underline"
                  style={{ color: "var(--primary-text,var(--primary))" }}
                >
                  <Phone className="h-3.5 w-3.5" />
                  {store.contact_phone}
                </a>
              ) : null}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <ShareButton title={storeName} url={canonicalUrl(`/${slug}`)} />
              <WhatsAppButton phone={store.contact_whatsapp} />
              <ProfileFollowButton
                owner={ownerPublicProfile ?? null}
                socialSummary={socialSummary ?? null}
                viewerState={viewerState ?? null}
                layout="inline"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

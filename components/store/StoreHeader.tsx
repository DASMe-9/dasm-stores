import Link from "next/link";
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
import { resolveStoreTemplateConfig } from "@/lib/themes";

type HeroTemplateConfig = {
  hero_video_url?: string | null;
  heroVideoUrl?: string | null;
  hero_motion?: string | null;
  heroMotion?: string | null;
};

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
  compact = false,
}: {
  store: StorePublic;
  slug: string;
  ownerPublicProfile?: OwnerPublicProfile | null;
  socialSummary?: SocialSummary | null;
  viewerState?: ProfileViewerState | null;
  /** Builder stores own the hero via their landing blocks — drop the chrome
   * banner + overlapping profile card and show a slim identity strip instead. */
  compact?: boolean;
}) {
  const areaName = store.area?.name_ar;
  const storeName = getStoreDisplayName(store);
  const templateConfig = (resolveStoreTemplateConfig(store) ?? null) as HeroTemplateConfig | null;
  const heroVideoUrl = templateConfig?.hero_video_url ?? templateConfig?.heroVideoUrl ?? null;
  const motion = heroMotion(templateConfig?.hero_motion ?? templateConfig?.heroMotion);

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_94%,transparent)] shadow-[var(--shadow-sm)] backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--c-surface)_86%,transparent)]">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-[var(--space-4)] px-[var(--space-4)] text-sm sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
          <div className="flex min-w-0 items-center gap-[var(--space-3)]">
            <Link href={`/${slug}`} className="flex min-w-0 items-center gap-[var(--space-3)]" aria-label={storeName}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--r)] border border-[var(--c-line)] bg-[var(--c-surface-2)]">
                {store.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <StoreIcon className="h-5 w-5 text-[var(--c-brand)]" />
                )}
              </span>
              <span className="block truncate text-base font-extrabold text-[var(--c-text)]">{storeName}</span>
            </Link>
          </div>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex" aria-label="تنقل المتجر">
            <Link href={`/${slug}`} className="rounded-[var(--r-pill)] px-[var(--space-3)] py-[var(--space-2)] font-semibold text-[var(--c-text)] transition hover:bg-[var(--c-surface-2)]">
              الرئيسية
            </Link>
            <Link href={`/${slug}/products`} className="rounded-[var(--r-pill)] px-[var(--space-3)] py-[var(--space-2)] font-semibold text-[var(--c-text)] transition hover:bg-[var(--c-surface-2)]">
              المنتجات
            </Link>
            <Link href="/" className="flex items-center gap-1 rounded-[var(--r-pill)] px-[var(--space-3)] py-[var(--space-2)] text-xs font-semibold text-[var(--c-muted)] transition hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]">
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

      {compact ? (
        <div className="mx-auto w-full max-w-[1280px] px-[var(--space-4)] pt-[var(--space-3)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
          <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-2)] rounded-[var(--r)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_72%,transparent)] px-[var(--space-4)] py-[var(--space-3)] text-xs text-[var(--c-muted)]">
            {store.description ? (
              <span className="line-clamp-1 max-w-md">{store.description}</span>
            ) : null}
            {areaName ? (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {areaName}
              </span>
            ) : null}
            {store.contact_phone ? (
              <a
                href={`tel:${store.contact_phone}`}
                className="flex items-center gap-1 text-[var(--c-brand)] hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {store.contact_phone}
              </a>
            ) : null}
            <div className="ms-auto flex items-center gap-2">
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
      ) : (
        <>
      <div className="bg-[var(--c-bg)] px-[var(--space-4)] pt-[var(--space-4)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
        <div
          className={`store-hero-motion store-hero-${motion} relative mx-auto h-36 w-full max-w-[1600px] overflow-hidden rounded-[var(--r-lg)] bg-[var(--c-surface-2)] md:h-52`}
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
          <div className="store-hero-orb store-hero-orb-a bg-[var(--c-brand)]" />
          <div className="store-hero-orb store-hero-orb-b bg-[var(--c-accent)]" />
          <div className="store-hero-scanline" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--c-text)_55%,transparent),color-mix(in_srgb,var(--c-text)_15%,transparent),transparent)] opacity-70" />
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-[var(--space-4)] pb-[var(--space-3)] pt-0 sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
        <div className="-mt-8 flex flex-col gap-[var(--space-3)] rounded-[var(--r-lg)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_95%,transparent)] p-[var(--space-3)] shadow-[var(--shadow)] backdrop-blur md:-mt-10 md:flex-row md:items-center md:p-[var(--space-4)]">
          <div className="order-1 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--r)] border-2 border-[var(--c-surface)] bg-[var(--c-surface-2)] shadow-[var(--shadow-sm)] md:order-none md:h-20 md:w-20">
            {store.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <StoreIcon className="h-8 w-8 text-[var(--c-brand)]" />
            )}
          </div>

          <div className="order-2 min-w-0 flex-1 md:order-none">
            <h1 className="text-xl font-extrabold text-[var(--c-text)] md:text-2xl">{storeName}</h1>
            {store.description ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-[var(--c-muted)] md:text-sm">
                {store.description}
              </p>
            ) : null}
            <div className="mt-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-3)] text-xs text-[var(--c-muted)]">
              {areaName ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {areaName}
                </span>
              ) : null}
              {store.contact_phone ? (
                <a
                  href={`tel:${store.contact_phone}`}
                  className="flex items-center gap-1 text-[var(--c-brand)] hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {store.contact_phone}
                </a>
              ) : null}
            </div>
            <div className="mt-[var(--space-3)] flex flex-wrap items-center gap-[var(--space-2)]">
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
      )}
    </>
  );
}

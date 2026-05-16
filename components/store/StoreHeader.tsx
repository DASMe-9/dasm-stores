import Link from "next/link";
import { MapPin, Phone, Store as StoreIcon } from "lucide-react";
import { CartBadge } from "./CartBadge";
import { ShareButton } from "@/components/shared/ShareButton";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { canonicalUrl } from "@/lib/seo";
import type { StorePublic } from "@/lib/api-server";
import { getHeroMotion, getHeroVideoUrl, getStoreTheme, getThemeSlug } from "@/lib/store-themes";

export function StoreHeader({
  store,
  slug,
}: {
  store: StorePublic;
  slug: string;
}) {
  const areaName = store.area?.name_ar;
  const theme = getStoreTheme(getThemeSlug(store.theme_config));
  const heroVideoUrl = getHeroVideoUrl(store.theme_config);
  const heroMotion = getHeroMotion(store.theme_config);

  return (
    <>
      <div className={`store-hero-motion store-hero-${heroMotion} relative h-56 overflow-hidden bg-[var(--muted)] md:h-72`}>
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
        ) : null}
        <div className="store-hero-orb store-hero-orb-a" style={{ backgroundColor: theme.primary }} />
        <div className="store-hero-orb store-hero-orb-b" style={{ backgroundColor: theme.accent }} />
        <div className="store-hero-scanline" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,.12), transparent)`,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-0 pb-4">
        <div className="-mt-16 flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm md:-mt-20 md:flex-row md:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-[var(--card)] bg-[var(--muted)] shadow">
            {store.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <StoreIcon className="h-9 w-9" style={{ color: "var(--primary)" }} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-[var(--foreground)]">{store.name}</h1>
            {store.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-[var(--muted-foreground)]">
                {store.description}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
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
                  style={{ color: "var(--primary)" }}
                >
                  <Phone className="h-3.5 w-3.5" />
                  {store.contact_phone}
                </a>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <WhatsAppButton phone={store.contact_whatsapp} />
              <ShareButton title={store.name} url={canonicalUrl(`/store/${slug}`)} />
              <Link
                href={`/store/${slug}/products`}
                className="inline-flex items-center rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                تصفّح المنتجات
              </Link>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 self-stretch md:items-end">
            <CartBadge slug={slug} />
          </div>
        </div>
      </div>
    </>
  );
}

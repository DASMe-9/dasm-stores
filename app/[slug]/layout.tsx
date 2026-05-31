import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoreChrome } from "@/components/store/StoreChrome";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreTabsNav } from "@/components/store/StoreTabsNav";
import { StoreThemeApplier } from "@/components/store/StoreThemeApplier";
import { StoreTrackingPixels } from "@/components/store/StoreTrackingPixels";
import { OwnerPreviewRecovery } from "@/components/store/OwnerPreviewRecovery";
import { SyncStoresAuthCookie } from "@/components/store/SyncStoresAuthCookie";
import { getStore } from "@/lib/api-server";
import { getStorefrontRequestContext } from "@/lib/storefront-preview-server";
import { clip } from "@/lib/seo";
import { getStoreDisplayName } from "@/lib/store-display";
import { resolveStoreCssVariables, resolveStoreTemplateConfig } from "@/lib/themes";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const requestContext = await getStorefrontRequestContext();
  const data = await getStore(slug, requestContext);
  if (!data) return { title: "متجر غير موجود" };

  const s = data.store;
  const storeName = getStoreDisplayName(s);
  const title = `${s.meta_title || storeName} — متاجر داسم`;
  const description = clip(s.meta_description || s.description || "", 160);

  return {
    title: clip(title, 65),
    description,
    openGraph: {
      title: storeName,
      description,
      images: s.banner_url ? [s.banner_url] : s.logo_url ? [s.logo_url] : undefined,
    },
  };
}

export default async function StoreLayout({ children, params }: Props) {
  const { slug } = await params;
  const requestContext = await getStorefrontRequestContext();
  const data = await getStore(slug, requestContext);
  if (!data) {
    if (requestContext.preview) {
      return (
        <>
          <SyncStoresAuthCookie />
          <OwnerPreviewRecovery slug={slug} />
        </>
      );
    }
    notFound();
  }

  const store = data.store;
  const storeName = getStoreDisplayName(store);
  const vars = resolveStoreCssVariables(store);
  const templateConfig = resolveStoreTemplateConfig(store);
  const productCardStyle =
    vars?.["product-card-style"] ??
    vars?.["--product-card-style"] ??
    (typeof templateConfig?.product_card_style === "string" ? templateConfig.product_card_style : null) ??
    "rounded-shadow";

  return (
    <>
      <StoreTrackingPixels config={data.marketing_tracking} />
      <StoreThemeApplier vars={vars} />
      <div data-product-card-style={productCardStyle} className="store-front-root">
        <StoreChrome slug={slug} whatsapp={store.contact_whatsapp} />
        <StoreHeader
          store={store}
          slug={slug}
          ownerPublicProfile={data.owner_public_profile ?? null}
          socialSummary={data.social_summary ?? null}
          viewerState={data.viewer_state ?? null}
        />
        <StoreTabsNav slug={slug} tabs={store.tabs ?? []} />
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
        <footer className="border-t border-[var(--border)] bg-[var(--card)] py-8 text-center text-xs text-[var(--muted-foreground)]">
        {storeName} — مدعوم بواسطة{" "}
        <a
          href="https://dasm.com.sa"
          className="hover:underline"
          style={{ color: "var(--primary-text,var(--primary))" }}
        >
          متاجر داسم
        </a>
        </footer>
      </div>
    </>
  );
}

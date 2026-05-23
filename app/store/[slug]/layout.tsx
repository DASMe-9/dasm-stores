import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoreChrome } from "@/components/store/StoreChrome";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreTabsNav } from "@/components/store/StoreTabsNav";
import { StoreThemeApplier } from "@/components/store/StoreThemeApplier";
import { getStore } from "@/lib/api-server";
import { clip } from "@/lib/seo";
import { getStoreDisplayName } from "@/lib/store-display";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getStore(slug);
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
  const data = await getStore(slug);
  if (!data) notFound();

  const store = data.store;
  const storeName = getStoreDisplayName(store);
  const vars = store.theme?.css_variables ?? undefined;
  const productCardStyle =
    vars?.["product-card-style"] ?? vars?.["--product-card-style"] ?? "rounded-shadow";

  return (
    <>
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
          style={{ color: "var(--primary)" }}
        >
          متاجر داسم
        </a>
        </footer>
      </div>
    </>
  );
}

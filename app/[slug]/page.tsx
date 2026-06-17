import Link from "next/link";
import { PackageCheck, Search, ShoppingCart, Tags } from "lucide-react";
import { StoreAdSlot } from "@/components/ads/StoreAdSlot";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductsPagination } from "@/components/product/ProductsPagination";
import { StorefrontBlocks } from "@/components/storefront/StorefrontBlocks";
import { getCategories, getProducts, getStore } from "@/lib/api-server";
import { getStorefrontRequestContext } from "@/lib/storefront-preview-server";
import { ensurePublicStore } from "@/lib/storefront-guards";
import { getStoreDisplayName } from "@/lib/store-display";
import { hasBuilderLayout, readBuilderSurface } from "@/lib/storefront-builder";

export const revalidate = 60;

export default async function StoreHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const requestContext = await getStorefrontRequestContext();
  const data = await getStore(slug, requestContext);
  if (!ensurePublicStore(data, requestContext)) return null;

  const page = typeof sp.page === "string" ? sp.page : "1";
  const qs = new URLSearchParams({ sort: "newest", page, per_page: "50" });

  const [products, categories] = await Promise.all([
    getProducts(slug, qs, requestContext),
    getCategories(slug, requestContext),
  ]);
  const visibleCategories = categories.categories.slice(0, 6);

  // Visual-builder stores render their saved block layout; product blocks use
  // the real interactive grid. Stores without a builder doc keep the layout below.
  if (hasBuilderLayout(data.store.theme_config)) {
    const { blocks, design } = readBuilderSurface(data.store.theme_config, "landing");
    return (
      <StorefrontBlocks
        blocks={blocks}
        products={products.data}
        slug={slug}
        storeName={getStoreDisplayName(data.store)}
        design={design}
      />
    );
  }

  return (
    <div className="space-y-6">
      <nav
        aria-label="روابط المتجر"
        className="-mx-4 overflow-x-auto border-y border-[var(--border)] bg-[var(--card)]/80 px-4 py-2.5 shadow-sm backdrop-blur scrollbar-hide sm:mx-0 sm:rounded-2xl sm:border"
      >
        <div className="flex min-w-max items-center gap-2 sm:min-w-0 sm:grid sm:grid-cols-4">
        <Link
          href={`/${slug}/products`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold text-[var(--foreground)] transition hover:bg-[var(--muted)]"
        >
          <Search className="h-4 w-4 shrink-0 text-[var(--foreground)]" />
          كل المنتجات
        </Link>
        <Link
          href={`/${slug}/products?sort=featured`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold text-[var(--foreground)] transition hover:bg-[var(--muted)]"
        >
          <PackageCheck className="h-4 w-4 shrink-0 text-[var(--foreground)]" />
          المنتجات المميزة
        </Link>
        <Link
          href={`/${slug}/cart`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold text-[var(--foreground)] transition hover:bg-[var(--muted)]"
        >
          <ShoppingCart className="h-4 w-4 shrink-0 text-[var(--foreground)]" />
          السلة
        </Link>
        <Link
          href={`/${slug}/products`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold text-[var(--foreground)] transition hover:bg-[var(--muted)]"
        >
          <Tags className="h-4 w-4 shrink-0 text-[var(--foreground)]" />
          الأقسام
        </Link>
        </div>
      </nav>

      {visibleCategories.length ? (
        <section>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold">أقسام المتجر</h2>
            <Link href={`/${slug}/products`} className="text-sm hover:underline">
              تصفح الكتالوج
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((category) => (
              <Link
                key={category.id}
                href={`/${slug}/products?category_id=${category.id}`}
                className="rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <StoreAdSlot slotKey="store.category.promo" context={{ store_slug: slug }} className="w-full" />

      <section>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold">منتجات المتجر</h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              يعرض {products.data.length} من {products.total} منتجًا
            </p>
          </div>
          <Link href={`/${slug}/products`} className="text-sm hover:underline">
            عرض الكتالوج
          </Link>
        </div>
        <ProductGrid products={products.data} slug={slug} />
        <ProductsPagination slug={slug} paginator={products} query={qs} basePath={`/${slug}`} />
      </section>
    </div>
  );
}

import { Suspense } from "react";
import { StoreAdSlot } from "@/components/ads/StoreAdSlot";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductsPagination } from "@/components/product/ProductsPagination";
import { ProductsToolbar } from "@/components/product/ProductsToolbar";
import { StoreSidebar } from "@/components/store/StoreSidebar";
import { getCategories, getProducts, getStore } from "@/lib/api-server";
import { getStorefrontRequestContext } from "@/lib/storefront-preview-server";
import { ensurePublicStore } from "@/lib/storefront-guards";

export const revalidate = 60;

export default async function StoreProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const requestContext = await getStorefrontRequestContext();

  const storeData = await getStore(slug, requestContext);
  if (!ensurePublicStore(storeData, requestContext)) return null;

  const qs = new URLSearchParams();
  const tab = typeof sp.tab === "string" ? sp.tab : undefined;
  const category_id = typeof sp.category_id === "string" ? sp.category_id : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const page = typeof sp.page === "string" ? sp.page : "1";

  if (tab) qs.set("tab", tab);
  if (category_id) qs.set("category_id", category_id);
  if (sort) qs.set("sort", sort);
  if (q) qs.set("q", q);
  qs.set("page", page);
  qs.set("per_page", "50");

  const [cats, products] = await Promise.all([
    getCategories(slug, requestContext),
    getProducts(slug, qs, requestContext),
  ]);

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:gap-6">
      <Suspense
        fallback={
          <div
            className="hidden h-64 w-56 shrink-0 animate-pulse rounded-2xl bg-[var(--muted)] lg:block"
            aria-hidden
          />
        }
      >
        <StoreSidebar slug={slug} categories={cats.categories} />
      </Suspense>

      <div className="min-w-0 flex-1">
        <Suspense
          fallback={<div className="mb-6 h-28 animate-pulse rounded-2xl bg-[var(--muted)]" />}
        >
          <ProductsToolbar tabs={storeData.store.tabs ?? []} />
        </Suspense>
        <StoreAdSlot slotKey="store.product.sidebar" context={{ store_slug: slug }} className="mb-4 w-full" />
        <ProductGrid products={products.data} slug={slug} />
        <ProductsPagination slug={slug} paginator={products} query={qs} />
      </div>
    </div>
  );
}

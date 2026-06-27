import type { StoreProductCard } from "@/lib/api-server";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  slug,
}: {
  products: StoreProductCard[];
  slug: string;
}) {
  if (!products.length) {
    return (
      <div className="py-16 text-center text-sm text-[var(--c-muted)]">
        لا توجد منتجات ضمن هذا العرض.
      </div>
    );
  }

  return (
    <div className="store-product-grid grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 sm:gap-[var(--space-4)] lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} slug={slug} />
      ))}
    </div>
  );
}

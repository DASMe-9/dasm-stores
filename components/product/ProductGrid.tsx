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
      <div className="py-16 text-center text-sm text-[var(--muted-foreground)]">
        لا توجد منتجات ضمن هذا العرض.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} slug={slug} />
      ))}
    </div>
  );
}

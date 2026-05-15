import Link from "next/link";
import type { StoreProductCard } from "@/lib/api-server";

export function ProductCard({
  product,
  slug,
}: {
  product: StoreProductCard;
  slug: string;
}) {
  const price = Number(product.price);
  const compare = product.compare_at_price != null ? Number(product.compare_at_price) : null;
  const discountPct =
    compare && compare > price ? Math.round(((compare - price) / compare) * 100) : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition hover:shadow-md">
      <Link href={`/store/${slug}/products/${product.id}`} className="block">
        <div className="relative aspect-square bg-[var(--muted)]">
          {product.primary_image?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.primary_image.url}
              alt={product.primary_image.alt_text || product.name}
              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[var(--muted-foreground)]">
              بدون صورة
            </div>
          )}
          {product.is_featured ? (
            <span className="absolute top-2 right-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
              مميز
            </span>
          ) : null}
          {discountPct ? (
            <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
              خصم {discountPct}%
            </span>
          ) : null}
        </div>
      </Link>
      <div className="space-y-2 p-3">
        <Link href={`/store/${slug}/products/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug hover:underline">
            {product.name}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold" style={{ color: "var(--primary)" }}>
            {price.toFixed(0)} ر.س
          </span>
          {compare && compare > price ? (
            <span className="text-xs text-[var(--muted-foreground)] line-through">
              {compare.toFixed(0)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

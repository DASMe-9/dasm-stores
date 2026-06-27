import Link from "next/link";
import type { StoreProductCard } from "@/lib/api-server";
import { productImageAlt, productImageUrl } from "@/lib/product-image";
import { productCardClassName } from "@/lib/themes/product-card-class";
import { ProductImage } from "./ProductImage";

export function ProductCard({
  product,
  slug,
  cardStyle,
}: {
  product: StoreProductCard;
  slug: string;
  cardStyle?: string | null;
}) {
  const price = Number(product.price);
  const compare = product.compare_at_price != null ? Number(product.compare_at_price) : null;
  const discountPct =
    compare && compare > price ? Math.round(((compare - price) / compare) * 100) : null;

  const cardClass = productCardClassName(cardStyle);
  const imageUrl = productImageUrl(product);

  return (
    <article className={cardClass} dir="rtl">
      <Link href={`/${slug}/products/${product.id}`} className="store-product-card__link block">
        <div className="store-product-card__media relative aspect-[4/5] bg-[var(--c-surface-2)]">
          <ProductImage
            src={imageUrl}
            alt={productImageAlt(product)}
          />
          {product.is_featured ? (
            <span className="absolute right-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-accent)] shadow-[var(--shadow-sm)] backdrop-blur">
              مميز
            </span>
          ) : null}
          {discountPct ? (
            <span className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-sale)]">
              خصم {discountPct}%
            </span>
          ) : null}
        </div>
      </Link>
      <div className="store-product-card__body space-y-[var(--space-2)] p-[var(--space-3)]">
        <Link href={`/${slug}/products/${product.id}`}>
          <h3 className="store-product-card__title line-clamp-2 font-semibold text-[var(--c-text)] hover:underline">
            {product.name}
          </h3>
        </Link>
        <div className="flex flex-wrap items-baseline gap-[var(--space-2)]">
          <span className="store-product-card__price font-bold text-[var(--c-text)]">
            {price.toFixed(0)} ر.س
          </span>
          {compare && compare > price ? (
            <span className="text-xs text-[var(--c-muted)] line-through">
              {compare.toFixed(0)} ر.س
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

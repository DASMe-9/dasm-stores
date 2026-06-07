"use client";

import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { StoreProductDetail, StoreProductVariant } from "@/lib/api-server";
import type { MarketingTrackingConfig } from "@/lib/marketing-tracking";
import { trackAddToCart } from "@/lib/marketing-tracking";
import { productImageUrl } from "@/lib/product-image";
import { useCartStore } from "@/store/cartStore";

export function ProductPurchaseSection({
  slug,
  product,
  trackingConfig,
}: {
  slug: string;
  product: StoreProductDetail & { variants?: StoreProductVariant[] };
  trackingConfig?: MarketingTrackingConfig | null;
}) {
  const active = useMemo(
    () => (product.variants ?? []).filter((v) => v.is_active !== false),
    [product.variants],
  );
  const basePrice = Number(product.price);
  const [variantId, setVariantId] = useState<string | number | undefined>(active[0]?.id);

  const selected = active.find((v) => v.id === variantId);
  const unitPrice =
    selected?.price != null && String(selected.price) !== ""
      ? Number(selected.price)
      : basePrice;

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const ensureStoreSlug = useCartStore((s) => s.ensureStoreSlug);

  const primaryImage = productImageUrl(product) ?? undefined;

  function handleAdd() {
    ensureStoreSlug(slug);
    addItem({
      productId: product.id,
      variantId: active.length ? variantId : undefined,
      name: product.name,
      price: unitPrice,
      quantity: 1,
      image: primaryImage,
    });
    trackAddToCart(trackingConfig, {
      content_id: String(product.id),
      content_name: product.name,
      value: unitPrice,
      quantity: 1,
    });
    openDrawer();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-2xl font-extrabold" style={{ color: "var(--primary-text,var(--primary))" }}>
          {unitPrice.toFixed(0)} ر.س
        </span>
        {product.compare_at_price != null &&
        Number(product.compare_at_price) > unitPrice ? (
          <span className="text-sm text-[var(--muted-foreground)] line-through">
            {Number(product.compare_at_price).toFixed(0)} ر.س
          </span>
        ) : null}
      </div>

      {active.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold">اختر المتغير</p>
          <div className="flex flex-wrap gap-2">
            {active.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  variantId === v.id
                    ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]"
                    : "border-[var(--border)] hover:bg-[var(--muted)]"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-[var(--primary-foreground)] shadow-sm transition hover:opacity-95 sm:w-auto sm:min-w-[200px]"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <ShoppingBag className="h-4 w-4" />
        أضف للسلة
      </button>
    </div>
  );
}

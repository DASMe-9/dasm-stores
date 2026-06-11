"use client";

import { useMemo, useState, useEffect } from "react";
import { ShoppingBag, Check } from "lucide-react";
import type { StoreProductDetail, StoreProductVariant } from "@/lib/api-server";
import type { MarketingTrackingConfig } from "@/lib/marketing-tracking";
import { trackAddToCart } from "@/lib/marketing-tracking";
import { productImageUrl } from "@/lib/product-image";
import { useCartStore } from "@/store/cartStore";

interface ProductOption {
  name: string;
  values: string[];
}

export function ProductPurchaseSection({
  slug,
  product,
  trackingConfig,
}: {
  slug: string;
  product: StoreProductDetail & { variants?: StoreProductVariant[] };
  trackingConfig?: MarketingTrackingConfig | null;
}) {
  const activeVariants = useMemo(
    () => (product.variants ?? []).filter((v) => v.is_active !== false),
    [product.variants]
  );

  const basePrice = Number(product.price);

  // Group options from active variants
  const options = useMemo(() => {
    if (!activeVariants.length) return [];
    const optionsMap = new Map<string, Set<string>>();
    for (const v of activeVariants) {
      if (v.option_values) {
        for (const [key, val] of Object.entries(v.option_values)) {
          if (!optionsMap.has(key)) optionsMap.set(key, new Set());
          optionsMap.get(key)!.add(String(val));
        }
      }
    }
    const result: ProductOption[] = [];
    optionsMap.forEach((values, name) => {
      result.push({ name, values: Array.from(values) });
    });
    return result;
  }, [activeVariants]);

  // State for selected option values
  const [selections, setSelections] = useState<Record<string, string>>({});

  // Initialize selections with the first available combination
  useEffect(() => {
    if (activeVariants.length > 0 && Object.keys(selections).length === 0) {
      const firstVariant = activeVariants[0];
      if (firstVariant.option_values) {
        setSelections(firstVariant.option_values as Record<string, string>);
      } else {
        // Fallback if no option_values but variants exist
        setSelections({});
      }
    }
  }, [activeVariants, selections]);

  // Find the variant that matches the current selections
  const selectedVariant = useMemo(() => {
    if (!activeVariants.length) return undefined;
    return activeVariants.find((v) => {
      if (!v.option_values) return false;
      const vOpts = v.option_values as Record<string, string>;
      for (const [key, val] of Object.entries(selections)) {
        if (String(vOpts[key]) !== String(val)) return false;
      }
      return true;
    });
  }, [activeVariants, selections]);

  const unitPrice =
    selectedVariant?.price != null && String(selectedVariant.price) !== ""
      ? Number(selectedVariant.price)
      : basePrice;

  // Defensive stock guard: the listing already hides out_of_stock products, but
  // a product can sell out while this (ISR) page is open — block "add to cart"
  // and tell the customer instead of letting a sold-out item into the cart.
  const outOfStock =
    product.status === "out_of_stock" ||
    (product.track_stock === true &&
      product.stock_quantity != null &&
      Number(product.stock_quantity) <= 0);

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const ensureStoreSlug = useCartStore((s) => s.ensureStoreSlug);

  const primaryImage = productImageUrl(product) ?? undefined;

  function handleAdd() {
    if (outOfStock) return;
    ensureStoreSlug(slug);
    // If there are options but no matching variant is found (unavailable combination)
    if (options.length > 0 && !selectedVariant) {
      alert("هذا المتغير غير متوفر حالياً");
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name + (selectedVariant ? ` - ${selectedVariant.name}` : ""),
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

  const handleSelect = (optionName: string, value: string) => {
    setSelections((prev) => ({ ...prev, [optionName]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-extrabold text-primary tracking-tight">
          {unitPrice.toFixed(2)} <span className="text-lg font-bold">ر.س</span>
        </span>
        {product.compare_at_price != null &&
        Number(product.compare_at_price) > unitPrice ? (
          <div className="flex items-center gap-2">
            <span className="text-base text-muted-foreground line-through font-medium">
              {Number(product.compare_at_price).toFixed(2)} ر.س
            </span>
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-xs font-bold">
              خصم {Math.round((1 - unitPrice / Number(product.compare_at_price)) * 100)}%
            </span>
          </div>
        ) : null}
      </div>

      {options.length > 0 ? (
        <div className="space-y-5">
          {options.map((opt) => (
            <div key={opt.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">{opt.name}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {opt.values.map((val) => {
                  const isSelected = selections[opt.name] === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelect(opt.name, val)}
                      className={`relative overflow-hidden rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all duration-300 ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary shadow-sm transform scale-[1.02]"
                          : "border-border bg-card text-muted-foreground hover:border-border hover:bg-muted hover:scale-105"
                      }`}
                    >
                      {isSelected && (
                        <Check className="absolute top-1 left-1 w-3 h-3 text-primary opacity-50" />
                      )}
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {/* Missing variant warning */}
          {Object.keys(selections).length === options.length && !selectedVariant && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/50">
              هذه التشكيلة غير متوفرة حالياً.
            </div>
          )}
        </div>
      ) : activeVariants.length > 0 ? (
        /* Fallback for variants without proper option_values */
        <div className="space-y-3">
          <p className="text-sm font-bold text-foreground">الخيارات المتاحة</p>
          <div className="flex flex-wrap gap-2">
            {activeVariants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    if (v.option_values) {
                      setSelections(v.option_values as Record<string, string>);
                    }
                  }}
                  className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all duration-300 ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="pt-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock || (options.length > 0 && !selectedVariant)}
          aria-disabled={outOfStock || (options.length > 0 && !selectedVariant)}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-2xl sm:w-auto sm:min-w-[240px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl"
        >
          {!outOfStock && (
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
              <div className="relative h-full w-8 bg-white/20" />
            </div>
          )}
          <ShoppingBag className="h-5 w-5 transition-transform group-hover:-translate-y-1" />
          <span>{outOfStock ? "نفد المخزون" : "أضف للسلة الآن"}</span>
        </button>
      </div>
    </div>
  );
}

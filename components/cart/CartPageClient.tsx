"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import type { StoreProductDetail } from "@/lib/api-server";
import { useCartStore } from "@/store/cartStore";

export function CartPageClient({ slug }: { slug: string }) {
  const ensureStoreSlug = useCartStore((s) => s.ensureStoreSlug);
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.total());

  const [products, setProducts] = useState<Record<number, StoreProductDetail>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureStoreSlug(slug);
  }, [slug, ensureStoreSlug]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!items.length) {
        setProducts({});
        setLoading(false);
        return;
      }
      setLoading(true);
      const map: Record<number, StoreProductDetail> = {};
      try {
        await Promise.all(
          items.map(async (item) => {
            const res = await fetch(`/api/public-store/${slug}/products/${item.productId}`);
            if (!res.ok) return;
            const body = (await res.json()) as { product?: StoreProductDetail };
            if (body.product) map[item.productId] = body.product;
          }),
        );
      } finally {
        if (!cancelled) {
          setProducts(map);
          setLoading(false);
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [items, slug]);

  const subtotal = useMemo(() => total, [total]);
  const vat = subtotal * 0.15;
  const grand = subtotal + vat;

  return (
    <div className="min-h-[60vh]">
      <header className="mb-6 flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <Link
          href={`/store/${slug}`}
          className="rounded-xl p-2 hover:bg-[var(--muted)]"
          aria-label="رجوع للمتجر"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
        <ShoppingCart className="h-5 w-5" style={{ color: "var(--primary)" }} />
        <h1 className="text-lg font-bold">سلة التسوق</h1>
      </header>

      {loading ? (
        <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">جاري التحميل...</p>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[var(--muted-foreground)]">السلة فارغة</p>
          <Link
            href={`/store/${slug}/products`}
            className="mt-4 inline-block rounded-xl px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)]"
            style={{ backgroundColor: "var(--primary)" }}
          >
            تصفّح المنتجات
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <ul className="space-y-3">
            {items.map((item) => {
              const p = products[item.productId];
              return (
                <li
                  key={`${item.productId}-${item.variantId ?? "x"}`}
                  className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--muted)]">
                    {p?.primary_image?.url || item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p?.primary_image?.url ?? item.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{p?.name ?? item.name}</p>
                    <p className="mt-1 text-sm font-bold" style={{ color: "var(--primary)" }}>
                      {Number(p?.price ?? item.price).toFixed(0)} ر.س
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--muted)]"
                        onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--muted)]"
                        onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      type="button"
                      className="text-[var(--muted-foreground)] hover:text-red-500"
                      onClick={() => removeItem(item.productId, item.variantId)}
                      aria-label="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-bold">
                      {(Number(p?.price ?? item.price) * item.quantity).toFixed(0)} ر.س
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
            <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
              <span>المجموع الفرعي</span>
              <span>{subtotal.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
              <span>ضريبة القيمة المضافة (تقديرية 15٪)</span>
              <span>{vat.toFixed(2)} ر.س</span>
            </div>
            <hr className="border-[var(--border)]" />
            <div className="flex justify-between text-base font-bold">
              <span>الإجمالي التقديري</span>
              <span>{grand.toFixed(2)} ر.س</span>
            </div>
            <Link
              href={`/store/${slug}/checkout`}
              className="mt-2 block w-full rounded-xl py-3 text-center text-sm font-bold text-[var(--primary-foreground)]"
              style={{ backgroundColor: "var(--primary)" }}
            >
              متابعة الدفع
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

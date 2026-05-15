"use client";

import Link from "next/link";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export function CartDrawer({ slug }: { slug: string }) {
  const open = useCartStore((s) => s.drawerOpen);
  const close = useCartStore((s) => s.closeDrawer);
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.total());

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label="إغلاق"
        onClick={() => close()}
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col border-r border-[var(--border)] bg-[var(--card)] shadow-2xl"
        dir="rtl"
      >
        <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-sm font-bold">سلة التسوق</h2>
          <button
            type="button"
            onClick={() => close()}
            className="rounded-lg p-2 hover:bg-[var(--muted)]"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!items.length ? (
            <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">السلة فارغة</p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.variantId ?? "x"}`}
                  className="flex gap-3 rounded-xl border border-[var(--border)] p-3"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--muted)]">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug">{item.name}</p>
                    <p className="mt-1 text-sm font-bold" style={{ color: "var(--primary)" }}>
                      {Number(item.price).toFixed(0)} ر.س
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--muted)]"
                        onClick={() =>
                          updateQty(item.productId, item.variantId, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--muted)]"
                        onClick={() =>
                          updateQty(item.productId, item.variantId, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="mr-auto text-[var(--muted-foreground)] hover:text-red-500"
                        onClick={() => removeItem(item.productId, item.variantId)}
                        aria-label="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-[var(--border)] p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">الإجمالي</span>
            <span className="font-bold">{total.toFixed(2)} ر.س</span>
          </div>
          <Link
            href={`/store/${slug}/cart`}
            onClick={() => close()}
            className="block w-full rounded-xl py-3 text-center text-sm font-semibold text-[var(--primary-foreground)]"
            style={{ backgroundColor: "var(--primary)" }}
          >
            عرض السلة
          </Link>
        </footer>
      </aside>
    </div>
  );
}

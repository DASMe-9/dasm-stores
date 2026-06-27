"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

function subscribeHydration(callback: () => void) {
  const id = window.setTimeout(callback, 0);
  return () => window.clearTimeout(id);
}

function useHydrated() {
  return useSyncExternalStore(subscribeHydration, () => true, () => false);
}

export function CartBadge({ slug }: { slug: string }) {
  const hydrated = useHydrated();
  const count = useCartStore((s) => s.count());
  const visibleCount = hydrated ? count : 0;
  const open = useCartStore((s) => s.openDrawer);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => open()}
        className="relative inline-flex items-center gap-[var(--space-2)] rounded-[var(--r)] bg-[var(--c-brand)] px-[var(--space-4)] py-[var(--space-3)] text-sm font-semibold text-[var(--c-on-brand)] transition hover:opacity-95 md:hidden"
      >
        <ShoppingCart className="h-4 w-4" />
        السلة
        {visibleCount > 0 ? (
          <span className="absolute -left-[var(--space-2)] -top-[var(--space-2)] flex h-5 min-w-5 items-center justify-center rounded-[var(--r-pill)] bg-[var(--c-sale)] px-[var(--space-1)] text-[10px] font-bold text-[var(--c-on-brand)]">
            {visibleCount > 99 ? "99+" : visibleCount}
          </span>
        ) : null}
      </button>

      <Link
        href={`/${slug}/cart`}
        className="relative hidden items-center gap-[var(--space-2)] rounded-[var(--r)] bg-[var(--c-brand)] px-[var(--space-4)] py-[var(--space-3)] text-sm font-semibold text-[var(--c-on-brand)] transition hover:opacity-95 md:inline-flex"
      >
        <ShoppingCart className="h-4 w-4" />
        السلة
        {visibleCount > 0 ? (
          <span className="absolute -left-[var(--space-2)] -top-[var(--space-2)] flex h-5 min-w-5 items-center justify-center rounded-[var(--r-pill)] bg-[var(--c-sale)] px-[var(--space-1)] text-[10px] font-bold text-[var(--c-on-brand)]">
            {visibleCount > 99 ? "99+" : visibleCount}
          </span>
        ) : null}
      </Link>
    </div>
  );
}

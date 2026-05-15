"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export function CartBadge({ slug }: { slug: string }) {
  const count = useCartStore((s) => s.count());
  const open = useCartStore((s) => s.openDrawer);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => open()}
        className="relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-95 md:hidden"
        style={{
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
        }}
      >
        <ShoppingCart className="h-4 w-4" />
        السلة
        {count > 0 ? (
          <span className="absolute -top-2 -left-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>

      <Link
        href={`/store/${slug}/cart`}
        className="relative hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-95 md:inline-flex"
        style={{
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
        }}
      >
        <ShoppingCart className="h-4 w-4" />
        السلة
        {count > 0 ? (
          <span className="absolute -top-2 -left-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </Link>
    </div>
  );
}

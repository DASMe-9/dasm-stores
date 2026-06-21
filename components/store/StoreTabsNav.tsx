import Link from "next/link";
import type { StoreTab } from "@/lib/api-server";

export function StoreTabsNav({
  slug,
  tabs,
}: {
  slug: string;
  tabs: StoreTab[];
}) {
  if (!tabs?.length) return null;

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1600px] gap-2 overflow-x-auto px-4 py-3 text-sm font-medium scrollbar-hide sm:px-6 lg:px-8">
        <Link
          href={`/${slug}/products`}
          className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-[var(--muted)]"
          style={{ border: "1px solid var(--border)" }}
        >
          كل المنتجات
        </Link>
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/${slug}/products?tab=${encodeURIComponent(t.slug)}`}
            className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-[var(--muted)]"
            style={{ border: "1px solid var(--border)" }}
          >
            {t.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

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
    <nav className="border-b border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_90%,transparent)] backdrop-blur-md">
      <div className="store-tabs-nav mx-auto flex w-full max-w-[1600px] gap-[var(--space-2)] overflow-x-auto px-[var(--space-4)] py-[var(--space-3)] font-medium scrollbar-hide sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
        <Link
          href={`/${slug}/products`}
          className="whitespace-nowrap rounded-[var(--r-pill)] border border-[var(--c-line)] px-[var(--space-4)] py-[var(--space-2)] text-[var(--c-text)] transition hover:bg-[var(--c-surface-2)]"
        >
          كل المنتجات
        </Link>
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/${slug}/products?tab=${encodeURIComponent(t.slug)}`}
            className="whitespace-nowrap rounded-[var(--r-pill)] border border-[var(--c-line)] px-[var(--space-4)] py-[var(--space-2)] text-[var(--c-text)] transition hover:bg-[var(--c-surface-2)]"
          >
            {t.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

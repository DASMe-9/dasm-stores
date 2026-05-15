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
    <nav className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 text-sm font-medium scrollbar-hide">
        <Link
          href={`/store/${slug}/products`}
          className="whitespace-nowrap rounded-xl px-4 py-2 transition hover:bg-[var(--muted)]"
          style={{ border: "1px solid var(--border)" }}
        >
          الكل
        </Link>
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/store/${slug}/products?tab=${encodeURIComponent(t.slug)}`}
            className="whitespace-nowrap rounded-xl px-4 py-2 transition hover:bg-[var(--muted)]"
            style={{ border: "1px solid var(--border)" }}
          >
            {t.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

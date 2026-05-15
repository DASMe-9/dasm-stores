import { MapPin, Package, Store } from "lucide-react";
import Link from "next/link";
import type { ExploreStoreItem } from "@/lib/api-server";

function ownerLabel(type: string) {
  return (
    ({ venue_owner: "معرض", dealer: "تاجر", user: "متجر" } as Record<string, string>)[type] ||
    "متجر"
  );
}

export function StoreCard({ store }: { store: ExploreStoreItem }) {
  const areaName = store.area?.name_ar;

  return (
    <Link
      href={`/store/${store.slug}`}
      className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-32 overflow-hidden bg-[var(--muted)]">
        {store.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote CDN URLs vary per merchant
          <img src={store.banner_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        ) : null}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `linear-gradient(to left, var(--primary), var(--accent))`,
          }}
        />
      </div>
      <div className="relative -mt-8 p-4">
        <div className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border-2 border-[var(--card)] bg-[var(--card)] shadow">
          {store.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <Store className="h-6 w-6" style={{ color: "var(--primary)" }} />
          )}
        </div>
        <h3
          className="text-base font-bold text-[var(--foreground)] group-hover:underline"
          style={{ textDecorationColor: "var(--primary)" }}
        >
          {store.name}
        </h3>
        {store.description ? (
          <p className="mt-1 line-clamp-2 text-xs text-[var(--muted-foreground)]">{store.description}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
          <span
            className="rounded-full px-2 py-0.5 font-medium"
            style={{
              backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)",
              color: "var(--primary)",
            }}
          >
            {ownerLabel(store.owner_type)}
          </span>
          {areaName ? (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {areaName}
            </span>
          ) : null}
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" /> {store.products_count ?? 0} منتج
          </span>
        </div>
      </div>
    </Link>
  );
}

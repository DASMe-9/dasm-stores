import type { ExploreStoreItem } from "@/lib/api-server";
import { StoreCard } from "./StoreCard";

export function StoreGrid({ stores }: { stores: ExploreStoreItem[] }) {
  if (!stores.length) {
    return (
      <div className="py-20 text-center text-sm text-[var(--muted-foreground)]">
        لا توجد متاجر مطابقة حالياً.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stores.map((s) => (
        <StoreCard key={s.id} store={s} />
      ))}
    </div>
  );
}

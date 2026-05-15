import { LoadingGrid } from "@/components/shared/LoadingGrid";

export default function StoreProductsLoading() {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:gap-6">
      <div
        className="hidden h-72 w-56 shrink-0 animate-pulse rounded-2xl bg-[var(--muted)] lg:block"
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-6">
        <div className="h-28 animate-pulse rounded-2xl bg-[var(--muted)]" />
        <LoadingGrid variant="product" />
      </div>
    </div>
  );
}

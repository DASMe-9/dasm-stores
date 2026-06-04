import { LoadingGrid } from "@/components/shared/LoadingGrid";
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="h-7 w-40 animate-pulse rounded bg-[var(--muted)]" aria-hidden />
      <LoadingGrid variant="product" />
    </div>
  );
}

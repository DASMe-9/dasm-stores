import { LoadingGrid } from "@/components/shared/LoadingGrid";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="h-36 animate-pulse bg-[var(--muted)] md:h-44" aria-hidden />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <LoadingGrid variant="product" />
      </div>
    </div>
  );
}

import { LoadingGrid } from "@/components/shared/LoadingGrid";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div
        className="h-36 animate-pulse md:h-44"
        style={{
          background: `linear-gradient(to left, var(--primary), var(--accent))`,
          opacity: 0.35,
        }}
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <LoadingGrid variant="explore" />
      </div>
    </div>
  );
}

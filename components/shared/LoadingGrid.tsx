/**
 * هيكل تحميل (skeleton) متجاوب — استخدمه في `loading.tsx` وأثناء التحميل البطيء.
 */
export function LoadingGrid({
  variant = "product",
  count,
}: {
  variant?: "explore" | "product";
  /** افتراضي: 6 للاستكشاف، 8 للمنتجات */
  count?: number;
}) {
  const n =
    count ?? (variant === "explore" ? 6 : 8);
  const grid =
    variant === "explore"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div
      className={`grid gap-4 md:gap-5 ${grid}`}
      aria-busy="true"
      aria-label="جاري التحميل"
    >
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] ${
            variant === "explore" ? "min-h-[220px]" : ""
          }`}
        >
          <div
            className={`bg-[var(--muted)] ${variant === "explore" ? "h-32" : "aspect-square"}`}
          />
          <div className="space-y-2 p-4">
            <div className="h-4 w-[75%] rounded bg-[var(--muted)]" />
            <div className="h-3 w-[45%] rounded bg-[var(--muted)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

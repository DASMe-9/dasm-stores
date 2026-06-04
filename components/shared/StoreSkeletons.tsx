/**
 * هياكل تحميل (skeletons) إضافية للمتجر — متجاوبة وتتبع متغيّرات الثيم.
 * تكمّل LoadingGrid (الشبكات) بهياكل التفاصيل/السلة/النموذج/الحالة.
 */

function Bar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-[var(--muted)] ${className ?? ""}`}
      aria-hidden
    />
  );
}

/** صفحة تفاصيل المنتج: صورة كبيرة + معلومات + زر. */
export function ProductDetailSkeleton() {
  return (
    <div
      className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-2 lg:gap-10"
      aria-busy="true"
      aria-label="جاري التحميل"
    >
      <div className="space-y-3">
        <div className="aspect-square w-full animate-pulse rounded-2xl bg-[var(--muted)]" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-[var(--muted)]"
            />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Bar className="h-7 w-3/4" />
        <Bar className="h-5 w-1/3" />
        <Bar className="h-8 w-28" />
        <div className="space-y-2 pt-2">
          <Bar className="h-3 w-full" />
          <Bar className="h-3 w-5/6" />
          <Bar className="h-3 w-2/3" />
        </div>
        <Bar className="mt-4 h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

/** قائمة بنود (سلة / تتبع). */
export function LinesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="mx-auto max-w-3xl space-y-3 px-4 py-6"
      aria-busy="true"
      aria-label="جاري التحميل"
    >
      <Bar className="h-7 w-40" />
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4"
        >
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-[var(--muted)]" />
          <div className="min-w-0 flex-1 space-y-2">
            <Bar className="h-4 w-2/3" />
            <Bar className="h-3 w-1/3" />
          </div>
          <Bar className="h-6 w-16 shrink-0" />
        </div>
      ))}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <div className="flex justify-between">
          <Bar className="h-4 w-20" /> <Bar className="h-4 w-16" />
        </div>
        <Bar className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

/** نموذج (الدفع). */
export function FormSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      className="mx-auto max-w-2xl space-y-4 px-4 py-6"
      aria-busy="true"
      aria-label="جاري التحميل"
    >
      <Bar className="h-7 w-40" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Bar className="h-3 w-24" />
          <Bar className="h-11 w-full rounded-xl" />
        </div>
      ))}
      <Bar className="h-12 w-full rounded-xl sm:w-48" />
    </div>
  );
}

/** حالة مركزية (نجاح الطلب). */
export function StatusSkeleton() {
  return (
    <div
      className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center"
      aria-busy="true"
      aria-label="جاري التحميل"
    >
      <div className="h-20 w-20 animate-pulse rounded-full bg-[var(--muted)]" />
      <Bar className="h-6 w-48" />
      <Bar className="h-4 w-64" />
      <Bar className="mt-2 h-11 w-40 rounded-xl" />
    </div>
  );
}

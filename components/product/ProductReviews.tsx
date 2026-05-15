import type { StoreReview } from "@/lib/api-server";
import { Star } from "lucide-react";

export function ProductReviews({ reviews }: { reviews: StoreReview[] | undefined }) {
  if (!reviews?.length) {
    return (
      <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-bold">التقييمات</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">لا توجد تقييمات بعد.</p>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h2 className="text-base font-bold">التقييمات</h2>
      <ul className="mt-4 space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="border-b border-[var(--border)] pb-4 last:border-0">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < r.rating ? "fill-current" : "opacity-25"}`}
                  />
                ))}
              </div>
              {r.customer_name ? (
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  {r.customer_name}
                </span>
              ) : null}
            </div>
            {r.title ? <p className="mt-2 text-sm font-semibold">{r.title}</p> : null}
            {r.body ? (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{r.body}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

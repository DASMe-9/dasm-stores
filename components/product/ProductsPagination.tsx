import Link from "next/link";
import type { Paginated } from "@/lib/api-server";

export function ProductsPagination({
  slug,
  paginator,
  query,
}: {
  slug: string;
  paginator: Paginated<unknown>;
  query: URLSearchParams;
}) {
  const prev = paginator.current_page > 1 ? paginator.current_page - 1 : null;
  const next =
    paginator.current_page < paginator.last_page ? paginator.current_page + 1 : null;

  function href(page: number) {
    const qs = new URLSearchParams(query.toString());
    qs.set("page", String(page));
    const s = qs.toString();
    return `/store/${slug}/products${s ? `?${s}` : ""}`;
  }

  if (paginator.last_page <= 1) return null;

  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="ترقيم الصفحات">
      {prev ? (
        <Link
          href={href(prev)}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
        >
          السابق
        </Link>
      ) : (
        <span className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm opacity-40">
          السابق
        </span>
      )}
      <span className="text-sm text-[var(--muted-foreground)]">
        صفحة {paginator.current_page} من {paginator.last_page}
      </span>
      {next ? (
        <Link
          href={href(next)}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
        >
          التالي
        </Link>
      ) : (
        <span className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm opacity-40">
          التالي
        </span>
      )}
    </nav>
  );
}

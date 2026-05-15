"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ListFilter, X } from "lucide-react";
import type { StoreCategory } from "@/lib/api-server";

function buildProductsHref(
  slug: string,
  params: URLSearchParams,
  patch: Record<string, string | undefined>,
) {
  const next = new URLSearchParams(params.toString());
  Object.entries(patch).forEach(([k, v]) => {
    if (v === undefined || v === "") next.delete(k);
    else next.set(k, v);
  });
  next.delete("page");
  const s = next.toString();
  return `/store/${slug}/products${s ? `?${s}` : ""}`;
}

function CategoryTree({
  slug,
  categories,
  depth,
  params,
  activeId,
  onPick,
}: {
  slug: string;
  categories: StoreCategory[];
  depth: number;
  params: URLSearchParams;
  activeId: string | null;
  onPick?: () => void;
}) {
  return (
    <ul
      className={
        depth === 0
          ? "space-y-1"
          : "mr-3 mt-1 space-y-1 border-r border-[var(--border)] pr-2"
      }
    >
      {categories.map((c) => (
        <li key={c.id}>
          <Link
            href={buildProductsHref(slug, params, {
              category_id: String(c.id),
            })}
            onClick={onPick}
            className={`block rounded-lg px-2 py-1.5 text-sm transition hover:bg-[var(--muted)] ${
              activeId === String(c.id)
                ? "bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] font-semibold text-[var(--foreground)]"
                : "text-[var(--foreground)]"
            }`}
          >
            {c.name}
          </Link>
          {c.children?.length ? (
            <CategoryTree
              slug={slug}
              categories={c.children}
              depth={depth + 1}
              params={params}
              activeId={activeId}
              onPick={onPick}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** شريط جانبي للتصنيفات (سطح مكتب) + درج على الجوال — يتوافق مع `category_id` في الرابط */
export function StoreSidebar({
  slug,
  categories,
}: {
  slug: string;
  categories: StoreCategory[];
}) {
  const params = useSearchParams();
  const activeId = params.get("category_id");
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!categories.length) return null;

  const clearHref = buildProductsHref(slug, params, { category_id: undefined });

  const tree = (
    <CategoryTree
      slug={slug}
      categories={categories}
      depth={0}
      params={params}
      activeId={activeId}
      onPick={() => setMobileOpen(false)}
    />
  );

  return (
    <>
      <button
        type="button"
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium shadow-sm lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <ListFilter className="h-4 w-4 shrink-0" aria-hidden />
        تصفية التصنيفات
      </button>

      <aside className="hidden lg:block lg:w-56 lg:shrink-0">
        <nav
          className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
          aria-label="تصنيفات المتجر"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold">التصنيفات</h2>
            <Link
              href={clearHref}
              className="text-xs text-[var(--muted-foreground)] hover:underline"
            >
              الكل
            </Link>
          </div>
          {tree}
        </nav>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            aria-label="إغلاق"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col border-l border-[var(--border)] bg-[var(--card)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <span className="font-bold">التصنيفات</span>
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-[var(--muted)]"
                aria-label="إغلاق"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{tree}</div>
            <div className="border-t border-[var(--border)] p-4">
              <Link
                href={clearHref}
                className="block text-center text-sm font-medium hover:underline"
                style={{ color: "var(--primary)" }}
                onClick={() => setMobileOpen(false)}
              >
                عرض كل المنتجات
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

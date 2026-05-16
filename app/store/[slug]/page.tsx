import Link from "next/link";
import { PackageCheck, Search, ShoppingCart, Tags } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getCategories, getProducts, getStore } from "@/lib/api-server";
import { notFound } from "next/navigation";

export const revalidate = 300;

export default async function StoreHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getStore(slug);
  if (!data) notFound();

  const [featured, categories] = await Promise.all([
    getProducts(slug, new URLSearchParams({ sort: "featured", per_page: "8" })),
    getCategories(slug),
  ]);
  const visibleCategories = categories.categories.slice(0, 6);

  return (
    <div className="space-y-8">
      <section className="grid gap-3 md:grid-cols-4">
        <Link
          href={`/store/${slug}/products`}
          className="group flex min-h-28 items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div>
            <p className="text-sm font-extrabold text-[var(--foreground)]">كل المنتجات</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              تصفح كامل كتالوج المتجر مع البحث والترتيب.
            </p>
          </div>
          <Search className="h-7 w-7 shrink-0 text-[var(--primary)]" />
        </Link>
        <Link
          href={`/store/${slug}/products?sort=featured`}
          className="group flex min-h-28 items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div>
            <p className="text-sm font-extrabold text-[var(--foreground)]">المنتجات المميزة</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              عرض المنتجات التي فعلها صاحب المتجر كواجهة أولى.
            </p>
          </div>
          <PackageCheck className="h-7 w-7 shrink-0 text-[var(--primary)]" />
        </Link>
        <Link
          href={`/store/${slug}/cart`}
          className="group flex min-h-28 items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div>
            <p className="text-sm font-extrabold text-[var(--foreground)]">السلة</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              راجع منتجات هذا المتجر قبل إكمال الطلب.
            </p>
          </div>
          <ShoppingCart className="h-7 w-7 shrink-0 text-[var(--primary)]" />
        </Link>
        <Link
          href={`/store/${slug}/products`}
          className="group flex min-h-28 items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div>
            <p className="text-sm font-extrabold text-[var(--foreground)]">الأقسام</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              انتقل للتصنيفات عندما تكون متاحة في المتجر.
            </p>
          </div>
          <Tags className="h-7 w-7 shrink-0 text-[var(--primary)]" />
        </Link>
      </section>

      {visibleCategories.length ? (
        <section>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold">أقسام المتجر</h2>
            <Link href={`/store/${slug}/products`} className="text-sm hover:underline">
              تصفح الكتالوج
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((category) => (
              <Link
                key={category.id}
                href={`/store/${slug}/products?category_id=${category.id}`}
                className="rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-base font-bold">منتجات مميزة</h2>
          <Link href={`/store/${slug}/products?sort=featured`} className="text-sm hover:underline">
            عرض الكل
          </Link>
        </div>
        <ProductGrid products={featured.data} slug={slug} />
      </section>
    </div>
  );
}

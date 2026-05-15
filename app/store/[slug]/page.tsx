import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getProducts, getStore } from "@/lib/api-server";
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

  const featured = await getProducts(
    slug,
    new URLSearchParams({ sort: "featured", per_page: "8" }),
  );

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold">مرحباً بك في {data.store.name}</h2>
            <p className="mt-1 max-w-xl text-sm text-[var(--muted-foreground)]">
              تصفّح المنتجات المميزة أو انتقل إلى الكتالوج الكامل مع الفلاتر المتقدمة.
            </p>
          </div>
          <Link
            href={`/store/${slug}/products`}
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-[var(--primary-foreground)]"
            style={{ backgroundColor: "var(--primary)" }}
          >
            كل المنتجات
          </Link>
        </div>
      </section>

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

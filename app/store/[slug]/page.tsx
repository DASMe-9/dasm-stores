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

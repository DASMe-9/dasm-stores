import { notFound, redirect } from "next/navigation";
import { findCategoryBySlug } from "@/lib/category-utils";
import { getCategories } from "@/lib/api-server";

export const revalidate = 600;

export default async function CategoryAliasPage({
  params,
}: {
  params: Promise<{ slug: string; categorySlug: string }>;
}) {
  const { slug, categorySlug } = await params;
  const { categories } = await getCategories(slug);
  const cat = findCategoryBySlug(categories, categorySlug);
  if (!cat) notFound();

  redirect(`/store/${slug}/products?category_id=${cat.id}`);
}

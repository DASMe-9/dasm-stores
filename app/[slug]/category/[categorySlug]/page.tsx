import { notFound, redirect } from "next/navigation";
import { findCategoryBySlug } from "@/lib/category-utils";
import { getCategories } from "@/lib/api-server";
import { getStorefrontRequestContext } from "@/lib/storefront-preview-server";

export const revalidate = 600;

export default async function CategoryAliasPage({
  params,
}: {
  params: Promise<{ slug: string; categorySlug: string }>;
}) {
  const { slug, categorySlug } = await params;
  const requestContext = await getStorefrontRequestContext();
  const { categories } = await getCategories(slug, requestContext);
  const cat = findCategoryBySlug(categories, categorySlug);
  if (!cat) notFound();

  redirect(`/${slug}/products?category_id=${cat.id}`);
}

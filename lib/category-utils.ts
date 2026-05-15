import type { StoreCategory } from "@/lib/api-server";

export function findCategoryBySlug(
  categories: StoreCategory[],
  slug: string,
): StoreCategory | null {
  for (const c of categories) {
    if (c.slug === slug) return c;
    if (c.children?.length) {
      const inner = findCategoryBySlug(c.children, slug);
      if (inner) return inner;
    }
  }
  return null;
}

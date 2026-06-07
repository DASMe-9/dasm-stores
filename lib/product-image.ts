import type { StoreProductCard } from "./api-server";

export function productImageUrl(product?: Pick<StoreProductCard, "primary_image" | "image_url" | "images"> | null) {
  if (!product) return null;

  const primary =
    typeof product.primary_image === "string"
      ? product.primary_image
      : product.primary_image?.url;

  return (
    primary ||
    product.images?.find((image) => image.is_primary && image.url)?.url ||
    product.images?.find((image) => image.url)?.url ||
    product.image_url ||
    null
  );
}

export function productImageAlt(product?: Pick<StoreProductCard, "primary_image" | "name"> | null) {
  if (!product) return "";
  if (typeof product.primary_image === "string") return product.name;
  return product.primary_image?.alt_text || product.name;
}

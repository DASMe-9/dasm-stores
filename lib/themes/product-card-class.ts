import type { ThemeProductCardStyle } from "./types";

export function productCardClassName(style?: string | null): string {
  const base = "store-product-card";
  const variant = isProductCardStyle(style) ? style : "rounded-shadow";
  return `${base} store-product-card--${variant}`;
}

function isProductCardStyle(v: string | null | undefined): v is ThemeProductCardStyle {
  return (
    v === "rounded-shadow" ||
    v === "flat-grid" ||
    v === "luxury-tall" ||
    v === "compact-dense" ||
    v === "highlight-price"
  );
}

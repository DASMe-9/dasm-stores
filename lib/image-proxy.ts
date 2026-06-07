const PROXIED_PRODUCT_IMAGE_HOSTS = new Set(["media.taager.com"]);

export function proxiedProductImageSrc(src?: string | null) {
  const value = src?.trim();
  if (!value) return null;

  try {
    const parsed = new URL(value);
    if (parsed.protocol === "https:" && PROXIED_PRODUCT_IMAGE_HOSTS.has(parsed.hostname)) {
      return `/api/product-image?url=${encodeURIComponent(parsed.toString())}`;
    }
  } catch {
    return value;
  }

  return value;
}

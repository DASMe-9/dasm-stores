const PRODUCTION_STOREFRONT_ORIGIN = "https://stores.dasm.com.sa";

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function isLocalHost(host: string): boolean {
  const cleanHost = host.replace(/^\[|\]$/g, "").split(":")[0]?.toLowerCase();
  return cleanHost === "localhost" || cleanHost === "127.0.0.1" || cleanHost === "0.0.0.0" || cleanHost === "::1";
}

export function normalizeOrigin(value?: string | null): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  const normalized = withoutTrailingSlash(raw);
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const host = normalized.replace(/^\/+/, "").split("/")[0] ?? "";
  if (!host) return null;

  return `${isLocalHost(host) ? "http" : "https"}://${host}`;
}

export const STOREFRONT_ORIGIN =
  normalizeOrigin(process.env.NEXT_PUBLIC_STORES_URL) ??
  normalizeOrigin(process.env.NEXT_PUBLIC_STORE_DOMAIN) ??
  normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
  PRODUCTION_STOREFRONT_ORIGIN;

function isLocalOrigin(origin: string): boolean {
  try {
    return isLocalHost(new URL(origin).host);
  } catch {
    return false;
  }
}

export function browserStorefrontOrigin(): string {
  if (typeof window === "undefined") return STOREFRONT_ORIGIN;

  if (isLocalOrigin(STOREFRONT_ORIGIN) || isLocalOrigin(window.location.origin)) {
    return window.location.origin;
  }

  return STOREFRONT_ORIGIN;
}

export function storePath(slug: string, options?: { preview?: boolean }): string {
  const encodedSlug = encodeURIComponent(slug);
  const query = options?.preview ? "?preview=true" : "";
  return `/${encodedSlug}${query}`;
}

export function storefrontUrl(slug: string, options?: { preview?: boolean; origin?: string }): string {
  return `${withoutTrailingSlash(options?.origin ?? STOREFRONT_ORIGIN)}${storePath(slug, options)}`;
}

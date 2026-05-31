import { NextResponse, type NextRequest } from "next/server";

const STORE_SLUG_ALIASES: Record<string, string> = {
  cheerylife: "cheerlylive",
  cheerlylife: "cheerlylive",
};

const PREVIEW_SLUG_COOKIE = "stores_preview_slug";
const PREVIEW_COOKIE_MAX_AGE = 60 * 60;

const RESERVED = new Set([
  "admin",
  "api",
  "auth",
  "dashboard",
  "stores",
  "explore",
  "verify-email",
  "_next",
  "favicon.ico",
  "sitemap.xml",
]);

function nextWithPreviewHeader(request: NextRequest, slug: string) {
  const preview = request.nextUrl.searchParams.get("preview");
  const explicitPreview = preview === "true" || preview === "1";
  const previewCookie = request.cookies.get(PREVIEW_SLUG_COOKIE)?.value;
  const hasStoresToken = Boolean(request.cookies.get("stores_token")?.value);
  const cookiePreview = hasStoresToken && previewCookie === slug;

  if (!explicitPreview && !cookiePreview) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-dasm-store-preview", "1");

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (explicitPreview) {
    response.cookies.set(PREVIEW_SLUG_COOKIE, slug, {
      path: "/",
      sameSite: "lax",
      maxAge: PREVIEW_COOKIE_MAX_AGE,
    });
  }

  return response;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // --- Legacy /store/[slug] → /[slug] redirect (remove /store/ prefix) ---
  const legacyStoreMatch = pathname.match(/^\/store\/([^/]+)(\/.*)?$/);
  if (legacyStoreMatch) {
    const [, slug, rest = ""] = legacyStoreMatch;
    const canonical = STORE_SLUG_ALIASES[slug.toLowerCase()] ?? slug;
    const url = request.nextUrl.clone();
    url.pathname = `/${canonical}${rest}`;
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  // --- Alias redirect and preview for /[slug] ---
  const slugMatch = pathname.match(/^\/([^/]+)(\/.*)?$/);
  if (slugMatch) {
    const [, segment, rest = ""] = slugMatch;
    if (RESERVED.has(segment.toLowerCase())) return NextResponse.next();
    if (segment.includes(".")) return NextResponse.next();

    const canonical = STORE_SLUG_ALIASES[segment.toLowerCase()];
    if (canonical && canonical !== segment) {
      // /slug/product/123 → /slug/products/123
      const productMatch = rest.match(/^\/product\/(\d+)$/);
      if (productMatch) {
        const url = request.nextUrl.clone();
        url.pathname = `/${canonical}/products/${productMatch[1]}`;
        url.search = search;
        return NextResponse.redirect(url, 308);
      }

      // /slug/order/ABC → /slug/track/ABC
      const orderMatch = rest.match(/^\/order\/([^/]+)$/);
      if (orderMatch) {
        const url = request.nextUrl.clone();
        url.pathname = `/${canonical}/track/${orderMatch[1]}`;
        url.search = search;
        return NextResponse.redirect(url, 308);
      }

      const url = request.nextUrl.clone();
      url.pathname = `/${canonical}${rest}`;
      url.search = search;
      return NextResponse.redirect(url, 308);
    }

    // Legacy /product/ and /order/ rewrites (no alias needed)
    const productMatch = rest.match(/^\/product\/(\d+)$/);
    if (productMatch) {
      const url = request.nextUrl.clone();
      url.pathname = `/${segment}/products/${productMatch[1]}`;
      url.search = search;
      return NextResponse.redirect(url, 308);
    }

    const orderMatch = rest.match(/^\/order\/([^/]+)$/);
    if (orderMatch) {
      const url = request.nextUrl.clone();
      url.pathname = `/${segment}/track/${orderMatch[1]}`;
      url.search = search;
      return NextResponse.redirect(url, 308);
    }

    return nextWithPreviewHeader(request, segment);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|svg|webp|ico)).*)"],
};

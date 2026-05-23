import { NextResponse, type NextRequest } from "next/server";

const STORE_SLUG_ALIASES: Record<string, string> = {
  cheerylife: "cheerlylife",
};

const PREVIEW_SLUG_COOKIE = "stores_preview_slug";
const PREVIEW_COOKIE_MAX_AGE = 60 * 60;

const RESERVED = new Set([
  "admin",
  "api",
  "auth",
  "dashboard",
  "stores",
  "store",
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

  const storeMatch = pathname.match(/^\/store\/([^/]+)(\/.*)?$/);
  if (storeMatch) {
    const [, slug, rest = ""] = storeMatch;
    const canonical = STORE_SLUG_ALIASES[slug.toLowerCase()];
    if (canonical) {
      const url = request.nextUrl.clone();
      url.pathname = `/store/${canonical}${rest}`;
      url.search = search;
      return NextResponse.redirect(url, 308);
    }
    return nextWithPreviewHeader(request, slug);
  }

  const legacyMatch = pathname.match(/^\/([^/]+)(\/.*)?$/);
  if (legacyMatch) {
    const [, segment, rest = ""] = legacyMatch;
    if (RESERVED.has(segment.toLowerCase())) return NextResponse.next();
    if (segment.includes(".")) return NextResponse.next();

    const canonical = STORE_SLUG_ALIASES[segment.toLowerCase()] ?? segment;

    const productMatch = rest.match(/^\/product\/(\d+)$/);
    if (productMatch) {
      const url = request.nextUrl.clone();
      url.pathname = `/store/${canonical}/products/${productMatch[1]}`;
      url.search = search;
      return NextResponse.redirect(url, 308);
    }

    const orderMatch = rest.match(/^\/order\/([^/]+)$/);
    if (orderMatch) {
      const url = request.nextUrl.clone();
      url.pathname = `/store/${canonical}/track/${orderMatch[1]}`;
      url.search = search;
      return NextResponse.redirect(url, 308);
    }

    const url = request.nextUrl.clone();
    url.pathname = `/store/${canonical}${rest}`;
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|svg|webp|ico)).*)"],
};

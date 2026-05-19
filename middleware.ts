import { NextResponse, type NextRequest } from "next/server";

const STORE_SLUG_ALIASES: Record<string, string> = {
  cheerylife: "cheerlylife",
};

const RESERVED = new Set([
  "admin",
  "api",
  "auth",
  "dashboard",
  "stores",
  "store",
  "explore",
  "_next",
  "favicon.ico",
  "sitemap.xml",
]);

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // --- Alias redirect inside /store/... ---
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
    return NextResponse.next();
  }

  // --- Legacy /[slug] → /store/[slug] redirect ---
  const legacyMatch = pathname.match(/^\/([^/]+)(\/.*)?$/);
  if (legacyMatch) {
    const [, segment, rest = ""] = legacyMatch;
    if (RESERVED.has(segment.toLowerCase())) return NextResponse.next();
    if (segment.includes(".")) return NextResponse.next();

    const canonical = STORE_SLUG_ALIASES[segment.toLowerCase()] ?? segment;

    // /slug/product/123 → /store/slug/products/123
    const productMatch = rest.match(/^\/product\/(\d+)$/);
    if (productMatch) {
      const url = request.nextUrl.clone();
      url.pathname = `/store/${canonical}/products/${productMatch[1]}`;
      url.search = search;
      return NextResponse.redirect(url, 308);
    }

    // /slug/order/ABC → /store/slug/track/ABC
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

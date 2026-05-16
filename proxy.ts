import { NextResponse, type NextRequest } from "next/server";

const STORE_SLUG_ALIASES: Record<string, string> = {
  cheerylife: "cheerlylife",
};

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const match = pathname.match(/^\/store\/([^/]+)(\/.*)?$/);
  if (!match) return NextResponse.next();

  const [, slug, rest = ""] = match;
  const canonicalSlug = STORE_SLUG_ALIASES[slug.toLowerCase()];
  if (!canonicalSlug) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/store/${canonicalSlug}${rest}`;
  url.search = search;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: "/store/:path*",
};

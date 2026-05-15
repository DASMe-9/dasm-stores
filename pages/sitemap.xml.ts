/**
 * Dynamic sitemap.xml — enumerates all active stores from the DASM API.
 *
 * Served at GET /sitemap.xml with XML content-type and short CDN TTL so
 * freshly-activated stores appear to search engines quickly.
 *
 * For a store with lots of products/cars we'll eventually split into
 * per-store sitemaps (index + children). For MVP a single master is fine.
 */
import type { GetServerSideProps } from "next";
import { SITE } from "@/lib/seo";

type StoreEntry = {
  slug: string;
  updated_at?: string;
  lastmod?: string;
};

const API_URL =
  process.env.API_BACKEND_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://dasm-platform-backend.onrender.com";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(
  loc: string,
  opts: { lastmod?: string; changefreq?: string; priority?: number } = {},
): string {
  const parts = [`    <loc>${escapeXml(loc)}</loc>`];
  if (opts.lastmod) parts.push(`    <lastmod>${opts.lastmod}</lastmod>`);
  if (opts.changefreq) parts.push(`    <changefreq>${opts.changefreq}</changefreq>`);
  if (opts.priority != null) parts.push(`    <priority>${opts.priority.toFixed(1)}</priority>`);
  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

async function fetchActiveStores(): Promise<StoreEntry[]> {
  try {
    const res = await fetch(`${API_URL}/api/stores/public/explore?per_page=500`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const body = await res.json();
    const items = Array.isArray(body?.data)
      ? body.data
      : Array.isArray(body?.stores)
        ? body.stores
        : Array.isArray(body)
          ? body
          : [];
    return items
      .map((s: unknown): StoreEntry | null => {
        if (!s || typeof s !== "object") return null;
        const slug = (s as Record<string, unknown>).slug;
        if (typeof slug !== "string" || !slug) return null;
        const updated = (s as Record<string, unknown>).updated_at;
        return {
          slug,
          updated_at: typeof updated === "string" ? updated : undefined,
        };
      })
      .filter((s: StoreEntry | null): s is StoreEntry => s !== null);
  } catch {
    return [];
  }
}

function buildSitemap(stores: StoreEntry[]): string {
  const today = new Date().toISOString().slice(0, 10);
  const staticRoutes = [
    urlEntry(`${SITE.url}/`, { changefreq: "daily", priority: 1.0, lastmod: today }),
    urlEntry(`${SITE.url}/explore`, { changefreq: "weekly", priority: 0.5, lastmod: today }),
  ];

  const storeRoutes = stores.flatMap((s) => {
    const lastmod = s.updated_at ? s.updated_at.slice(0, 10) : today;
    return [
      urlEntry(`${SITE.url}/store/${s.slug}`, {
        changefreq: "daily",
        priority: 0.9,
        lastmod,
      }),
      urlEntry(`${SITE.url}/store/${s.slug}/products`, {
        changefreq: "daily",
        priority: 0.85,
        lastmod,
      }),
      urlEntry(`${SITE.url}/store/${s.slug}/cart`, {
        changefreq: "monthly",
        priority: 0.3,
        lastmod,
      }),
    ];
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticRoutes, ...storeRoutes].join("\n")}
</urlset>
`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const stores = await fetchActiveStores();
  const xml = buildSitemap(stores);

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  // Cache at the edge for 5 minutes; stale-while-revalidate for 1 hour.
  res.setHeader(
    "Cache-Control",
    "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  );
  res.write(xml);
  res.end();

  return { props: {} };
};

// getServerSideProps writes the response directly — component never renders.
export default function Sitemap() {
  return null;
}

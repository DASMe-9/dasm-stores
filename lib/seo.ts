/**
 * SEO helpers — single source of truth for meta tags, canonical URLs,
 * OpenGraph, Twitter Cards, and Schema.org JSON-LD across dasm-stores.
 *
 * Consumers pass structured data; helpers return either JSX props or
 * stringified JSON-LD ready to drop into <Head>.
 */

export const SITE = {
  url:
    process.env.NEXT_PUBLIC_STORE_DOMAIN?.startsWith("http")
      ? process.env.NEXT_PUBLIC_STORE_DOMAIN!
      : process.env.NEXT_PUBLIC_STORE_DOMAIN
        ? `https://${process.env.NEXT_PUBLIC_STORE_DOMAIN.replace(/^https?:\/\//, "")}`
        : process.env.NEXT_PUBLIC_SITE_URL || "https://stores.dasm.com.sa",
  name: "متاجر داسم",
  nameEn: "DASM Stores",
  defaultTitle: "متاجر داسم — منصة المتاجر من داسم",
  defaultDescription:
    "متاجر داسم: منصة متاجر مستقلة لكل معرض وتاجر في السعودية. سيارات، قطع غيار، إكسسوارات، والمزيد — مدعومة بمنظومة داسم.",
  locale: "ar_SA",
  twitter: "@dasm_sa",
  defaultOgImage: "/og-default.png",
  themeColor: "#0A4B8C",
} as const;

export type SeoProps = {
  title?: string;
  description?: string;
  path?: string; // e.g. "/alrajhi-motors"
  image?: string | null; // absolute URL or path
  noindex?: boolean;
  type?: "website" | "article" | "product";
};

/** Absolute canonical URL for a given path. */
export function canonicalUrl(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.url}${clean === "/" ? "" : clean}`;
}

/** Absolute URL for an OG image (accepts path or full URL). */
export function absoluteImage(src?: string | null): string {
  if (!src) return `${SITE.url}${SITE.defaultOgImage}`;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${SITE.url}${src.startsWith("/") ? src : `/${src}`}`;
}

/** Clip to SEO-friendly length (descriptions ~155, titles ~60). */
export function clip(text: string | undefined | null, max: number): string {
  if (!text) return "";
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

/** Build a full title — page-specific + site suffix. */
export function buildTitle(pageTitle?: string): string {
  if (!pageTitle) return SITE.defaultTitle;
  return clip(`${pageTitle} — ${SITE.name}`, 65);
}

/* ─────────────────────────────────────────────────────────────── */
/*  Schema.org / JSON-LD builders                                  */
/* ─────────────────────────────────────────────────────────────── */

type Thing = Record<string, unknown>;

/** Wrap a schema object as a <script type="application/ld+json"> payload. */
export function jsonLdString(schema: Thing | Thing[]): string {
  return JSON.stringify(schema);
}

export function organizationSchema(): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    alternateName: SITE.nameEn,
    url: SITE.url,
    logo: absoluteImage("/logo.png"),
    sameAs: [
      "https://www.dasm.com.sa",
      "https://twitter.com/dasm_sa",
    ],
  };
}

export function websiteSchema(): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: "ar-SA",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export type StoreForSchema = {
  slug: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  social?: Record<string, string | null | undefined>;
};

/**
 * AutoDealer / LocalBusiness schema for a store landing page.
 * Falls back to plain LocalBusiness if store category is unknown.
 */
export function storeSchema(store: StoreForSchema): Thing {
  const sameAs = Object.values(store.social ?? {}).filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );

  const schema: Thing = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.name,
    url: canonicalUrl(`/store/${store.slug}`),
    image: absoluteImage(store.coverUrl || store.logoUrl),
    logo: absoluteImage(store.logoUrl),
  };

  if (store.description) schema.description = clip(store.description, 300);
  if (store.phone) schema.telephone = store.phone;
  if (sameAs.length) schema.sameAs = sameAs;
  if (store.address || store.city) {
    schema.address = {
      "@type": "PostalAddress",
      addressLocality: store.city ?? undefined,
      streetAddress: store.address ?? undefined,
      addressCountry: "SA",
    };
  }
  if (store.latitude != null && store.longitude != null) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: store.latitude,
      longitude: store.longitude,
    };
  }
  return schema;
}

export type ProductForSchema = {
  id: number | string;
  slug?: string | null;
  storeSlug: string;
  title: string;
  description?: string | null;
  price: number | string;
  currency?: string;
  images?: string[];
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  brand?: string | null;
  condition?: "NewCondition" | "UsedCondition" | "RefurbishedCondition";
};

export function productSchema(p: ProductForSchema): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description ? clip(p.description, 300) : undefined,
    image: (p.images ?? []).map((s) => absoluteImage(s)),
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    itemCondition: p.condition
      ? `https://schema.org/${p.condition}`
      : undefined,
    offers: {
      "@type": "Offer",
      url: canonicalUrl(`/store/${p.storeSlug}/products/${p.slug ?? p.id}`),
      priceCurrency: p.currency ?? "SAR",
      price: p.price,
      availability: `https://schema.org/${p.availability ?? "InStock"}`,
    },
  };
}

export type VehicleForSchema = {
  id: number | string;
  slug?: string | null;
  storeSlug: string;
  make: string;
  model: string;
  year: number | string;
  mileageKm?: number | null;
  price?: number | null;
  images?: string[];
  color?: string | null;
  transmission?: string | null;
  fuel?: string | null;
  vin?: string | null;
};

export function vehicleSchema(v: VehicleForSchema): Thing {
  const name = `${v.make} ${v.model} ${v.year}`;
  const schema: Thing = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name,
    brand: { "@type": "Brand", name: v.make },
    model: v.model,
    vehicleModelDate: String(v.year),
    image: (v.images ?? []).map((s) => absoluteImage(s)),
  };
  if (v.mileageKm != null) {
    schema.mileageFromOdometer = {
      "@type": "QuantitativeValue",
      value: v.mileageKm,
      unitCode: "KMT",
    };
  }
  if (v.color) schema.color = v.color;
  if (v.vin) schema.vehicleIdentificationNumber = v.vin;
  if (v.transmission) schema.vehicleTransmission = v.transmission;
  if (v.fuel) schema.fuelType = v.fuel;
  if (v.price != null) {
    schema.offers = {
      "@type": "Offer",
      priceCurrency: "SAR",
      price: v.price,
      availability: "https://schema.org/InStock",
      url: canonicalUrl(`/${v.storeSlug}/cars/${v.slug ?? v.id}`),
    };
  }
  return schema;
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbSchema(items: BreadcrumbItem[]): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function itemListSchema(
  name: string,
  items: { name: string; url: string; image?: string }[],
): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      url: it.url.startsWith("http") ? it.url : canonicalUrl(it.url),
      image: it.image ? absoluteImage(it.image) : undefined,
    })),
  };
}

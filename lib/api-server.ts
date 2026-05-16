/**
 * Server-first HTTP helpers for the public storefront (App Router).
 * Uses API_BACKEND_URL (server env). ISR via fetch `next.revalidate` where noted.
 */

export function getApiBase(): string {
  const base =
    process.env.API_BACKEND_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "https://dasm-platform-backend.onrender.com";
  return base;
}

const JSON_HEADERS = { Accept: "application/json", "Content-Type": "application/json" };

export type CheckoutPayload = {
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  shipping_address: { city: string; street: string; zip?: string };
  items: Array<{ product_id: number; variant_id?: number; quantity: number }>;
  coupon_code?: string;
  shipping_config_id?: number;
  tryoto_delivery_option_id?: string;
};

export type ExploreStoreItem = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  owner_type: string;
  area?: { id: number; name_ar: string } | null;
  products_count?: number;
};

export type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links?: { url: string | null; label: string; active: boolean }[];
};

export type StoreShippingConfig = {
  id: number;
  provider?: string | null;
  flat_rate?: number | string | null;
  free_above_amount?: number | string | null;
  estimated_days?: number | null;
  is_active?: boolean;
};

export type StorePublic = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  theme_config?: import("./store-themes").StoreThemeConfig | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_whatsapp: string | null;
  social_links: Record<string, string> | null;
  owner_type: string;
  meta_title?: string | null;
  meta_description?: string | null;
  area?: { id: number; name_ar: string } | null;
  theme?: {
    id: number;
    name: string;
    slug: string;
    css_variables?: Record<string, string> | null;
    template_config?: unknown;
  } | null;
  tabs: StoreTab[];
  shipping_configs?: StoreShippingConfig[];
};

export type StoreShippingSummary = {
  tryoto_enabled: boolean;
  legacy_flat_enabled: boolean;
  shipping_origin_city?: string | null;
  shipping_markup_sar: number;
  shipping_extra_per_kg_sar: number;
};

/** Laravel serializes camelCase relation keys when loaded as shippingConfigs */
export type StoreShowResponse = {
  store: StorePublic & { shippingConfigs?: StoreShippingConfig[] };
  has_payment: boolean;
  shipping?: StoreShippingSummary;
};

export type StoreTab = {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  sort_order?: number;
};

export type StoreProductVariant = {
  id: number;
  name: string;
  sku?: string | null;
  price?: string | number | null;
  is_active?: boolean;
};

export type StoreProductCard = {
  id: number;
  name: string;
  slug: string;
  price: string | number;
  compare_at_price?: string | number | null;
  is_featured: boolean;
  primary_image?: { url: string; alt_text?: string | null } | null;
  variants?: StoreProductVariant[];
};

export type StoreCategory = {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  children?: StoreCategory[];
};

export type StoreReview = {
  id: number;
  rating: number;
  title?: string | null;
  body?: string | null;
  customer_name?: string | null;
  created_at?: string;
};

export type StoreProductDetail = StoreProductCard & {
  description?: string | null;
  sku?: string | null;
  images?: { url: string; alt_text?: string | null; sort_order?: number }[];
  category?: { id: number; name: string; slug: string } | null;
  tab?: { id: number; name: string; slug: string } | null;
  reviews?: StoreReview[];
};

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

/** ISR 120s — explore */
export async function getExploreStores(params?: {
  q?: string;
  owner_type?: string;
  per_page?: number;
  page?: number;
}): Promise<Paginated<ExploreStoreItem>> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.owner_type) qs.set("owner_type", params.owner_type);
  if (params?.per_page) qs.set("per_page", String(params.per_page));
  if (params?.page) qs.set("page", String(params.page));

  const url = `${getApiBase()}/api/stores/public/explore?${qs}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 120 },
  });
  if (!res.ok) return { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 };
  return parseJson<Paginated<ExploreStoreItem>>(res);
}

/** ISR 300s — store shell */
export async function getStore(slug: string): Promise<StoreShowResponse | null> {
  const res = await fetch(`${getApiBase()}/api/stores/public/${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  const body = await parseJson<StoreShowResponse>(res);
  if (!body?.store) return null;
  return body;
}

/** ISR 60s — catalog */
export async function getProducts(
  slug: string,
  params?: URLSearchParams | Record<string, string | undefined>,
): Promise<Paginated<StoreProductCard>> {
  const qs =
    params instanceof URLSearchParams
      ? params
      : new URLSearchParams(
          Object.entries(params ?? {}).filter(([, v]) => v != null && v !== "") as [string, string][],
        );

  const url = `${getApiBase()}/api/stores/public/${encodeURIComponent(slug)}/products?${qs}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });
  if (!res.ok) return { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 };
  return parseJson<Paginated<StoreProductCard>>(res);
}

/** ISR 120s — PDP */
export async function getProduct(
  slug: string,
  productId: string,
): Promise<{ product: StoreProductDetail } | null> {
  const res = await fetch(
    `${getApiBase()}/api/stores/public/${encodeURIComponent(slug)}/products/${encodeURIComponent(productId)}`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    },
  );
  if (!res.ok) return null;
  return parseJson(res);
}

/** ISR 600s — categories */
export async function getCategories(slug: string): Promise<{ categories: StoreCategory[] }> {
  const res = await fetch(
    `${getApiBase()}/api/stores/public/${encodeURIComponent(slug)}/categories`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: 600 },
    },
  );
  if (!res.ok) return { categories: [] };
  return parseJson(res);
}

/** POST checkout — call from Server Actions only (needs secret base URL). */
export async function checkout(
  slug: string,
  payload: CheckoutPayload,
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const res = await fetch(`${getApiBase()}/api/stores/checkout/${encodeURIComponent(slug)}`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  const body = await parseJson<unknown>(res);
  return { ok: res.ok, status: res.status, body };
}

/** Real-time tracking — no-store */
export async function trackOrder(
  slug: string,
  orderNumber: string,
): Promise<unknown | null> {
  const res = await fetch(
    `${getApiBase()}/api/stores/track/${encodeURIComponent(slug)}/${encodeURIComponent(orderNumber)}`,
    {
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  return parseJson(res);
}

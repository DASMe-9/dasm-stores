# DASM Stores — Storefront Implementation Plan

> **الريبو المستهدف:** `DASMe-9/dasm-stores` → `stores.dasm.com.sa`
> **المرجع المعماري:** Salla Twilight storefront (SSR/ISR + Web Components)
> **التقنية:** Next.js 16 App Router · TypeScript · Tailwind CSS
> **الحالة:** PR-B مدموج (SEO foundation + sitemap + robots + JSON-LD) → هذه الخطة للمراحل التالية
> **كُتب بواسطة:** Claude Code `[cc]` — 2026-05-14

---

## 1. الـ Backend API المتاح (مُثبَّت ومختبَر)

Base URL: `https://dasm-platform-backend.onrender.com`

| Endpoint | Method | الوصف |
|---|---|---|
| `/api/stores/public/explore` | GET | استكشاف المتاجر — يدعم `?q=&owner_type=&per_page=` |
| `/api/stores/public/{slug}` | GET | بيانات متجر واحد + tabs + theme + shippingConfigs |
| `/api/stores/public/{slug}/products` | GET | منتجات المتجر — يدعم `?tab=&category_id=&q=&sort=newest\|price_asc\|price_desc\|featured&per_page=20` |
| `/api/stores/public/{slug}/products/{id}` | GET | تفاصيل منتج واحد + images + variants + reviews |
| `/api/stores/public/{slug}/categories` | GET | تصنيفات هرمية (parent → children) |
| `/api/stores/checkout/{slug}` | POST | إنشاء طلب جديد |
| `/api/stores/webhook/payment` | POST | Webhook دفع (للـ backend فقط) |
| `/api/stores/track/{slug}/{orderNumber}` | GET | تتبع طلب بدون login |

### Checkout Request Body

```typescript
interface CheckoutPayload {
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  shipping_address: { city: string; street: string; zip?: string };
  items: Array<{ product_id: number; variant_id?: number; quantity: number }>;
  coupon_code?: string;
  shipping_config_id?: number;
}
// Response → { payment_url: string; order_number: string }
```

### Store Response Shape

```typescript
interface StorePublic {
  id: number; name: string; slug: string;
  description: string; logo_url: string; banner_url: string;
  contact_phone: string; contact_email: string; contact_whatsapp: string;
  social_links: Record<string, string>;
  owner_type: 'venue_owner' | 'dealer' | 'user';
  area: { id: number; name_ar: string };
  theme: { id: number; name: string; slug: string; css_variables: Record<string,string>; template_config: object };
  tabs: StoreTab[]; // ordered by sort_order
  shippingConfigs: StoreShippingConfig[];
  has_payment: boolean;
}
```

---

## 2. بنية الصفحات (مرتّبة بأولوية التنفيذ)

```
app/
├── page.tsx                              → صفحة الاستكشاف (grid المتاجر)
├── store/
│   └── [slug]/
│       ├── layout.tsx                    → StoreShell: header + nav tabs + theme CSS vars
│       ├── page.tsx                      → الصفحة الرئيسية للمتجر (hero + featured products)
│       ├── products/
│       │   ├── page.tsx                  → كتالوج المنتجات + فلاتر
│       │   └── [productId]/
│       │       └── page.tsx              → صفحة المنتج (صور + variants + add to cart + reviews)
│       ├── category/
│       │   └── [categorySlug]/
│       │       └── page.tsx              → فلترة حسب التصنيف (reuses products page)
│       ├── cart/
│       │   └── page.tsx                  → السلة (client component — zustand)
│       ├── checkout/
│       │   └── page.tsx                  → نموذج الدفع + ملخص الطلب
│       ├── success/
│       │   └── page.tsx                  → تأكيد الطلب (order_number + رابط تتبع)
│       └── track/
│           └── [orderNumber]/
│               └── page.tsx              → تتبع الطلب (بدون login)
└── not-found.tsx                         → 404 عام
```

---

## 3. الـ Components Tree

```
components/
├── explore/
│   ├── StoreGrid.tsx           → grid المتاجر مع lazy loading
│   ├── StoreCard.tsx           → بطاقة متجر (logo + name + products_count + area)
│   └── ExploreSearch.tsx       → حقل بحث debounced
├── store/
│   ├── StoreHeader.tsx         → banner + logo + اسم المتجر + تواصل
│   ├── StoreTabsNav.tsx        → تبويبات المتجر (من tabs API) — sticky
│   ├── StoreSidebar.tsx        → فلاتر التصنيفات (desktop) / drawer (mobile)
│   └── StoreThemeApplier.tsx   → يُحقن css_variables من theme في :root
├── product/
│   ├── ProductGrid.tsx         → grid المنتجات (SSR + client pagination)
│   ├── ProductCard.tsx         → بطاقة (صورة + اسم + سعر + زر إضافة)
│   ├── ProductGallery.tsx      → معرض صور (thumbnail strip + main image)
│   ├── ProductVariants.tsx     → اختيار المتغيرات (size/color/etc)
│   ├── ProductReviews.tsx      → تقييمات العملاء
│   └── AddToCartButton.tsx     → client component يتصل بـ cartStore
├── cart/
│   ├── CartDrawer.tsx          → سلة منزلقة (sheet) من اليمين
│   ├── CartItem.tsx            → صف منتج + quantity + حذف
│   └── CartSummary.tsx         → ملخص الأسعار + كوبون + شحن
├── checkout/
│   ├── CheckoutForm.tsx        → نموذج بيانات العميل + الشحن
│   ├── ShippingSelector.tsx    → اختيار طريقة الشحن
│   ├── OrderSummary.tsx        → ملخص الطلب قبل الدفع
│   └── CouponInput.tsx         → حقل كوبون الخصم
└── shared/
    ├── WhatsAppButton.tsx      → زر واتساب للتواصل مع المتجر
    ├── ShareButton.tsx         → مشاركة الصفحة
    └── LoadingGrid.tsx         → skeleton cards
```

---

## 4. إدارة الحالة — Cart Store (Zustand)

```typescript
// store/cartStore.ts
interface CartItem {
  productId: number;
  variantId?: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartStore {
  storeSlug: string | null;        // السلة مرتبطة بمتجر واحد فقط
  items: CartItem[];
  coupon: string | null;
  selectedShippingId: number | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variantId?: number) => void;
  updateQty: (productId: number, variantId: number | undefined, qty: number) => void;
  clearCart: () => void;
  total: () => number;
}
// persist في localStorage
```

---

## 5. التثيم (Theme System)

المتجر يُعيد `theme.css_variables` من API — يُحقن مباشرةً في CSS variables:

```typescript
// StoreThemeApplier.tsx (Server Component)
export function StoreThemeApplier({ vars }: { vars: Record<string,string> }) {
  const css = Object.entries(vars)
    .map(([k, v]) => `--${k}: ${v};`)
    .join(' ');
  return <style>{`:root { ${css} }`}</style>;
}
```

المكونات تستخدم `var(--primary)` و`var(--accent)` بدلاً من ألوان ثابتة.

---

## 6. الـ lib المطلوبة

```typescript
// lib/api-server.ts (موجود جزئياً — يحتاج توسيع)
const BASE = process.env.API_BACKEND_URL!;

export async function getStore(slug: string) {
  const res = await fetch(`${BASE}/api/stores/public/${slug}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('store_not_found');
  return res.json();
}

export async function getProducts(slug: string, params: URLSearchParams) {
  const res = await fetch(`${BASE}/api/stores/public/${slug}/products?${params}`, { next: { revalidate: 60 } });
  return res.json();
}

export async function getProduct(slug: string, id: string) {
  const res = await fetch(`${BASE}/api/stores/public/${slug}/products/${id}`, { next: { revalidate: 120 } });
  return res.json();
}

export async function getCategories(slug: string) {
  const res = await fetch(`${BASE}/api/stores/public/${slug}/categories`, { next: { revalidate: 600 } });
  return res.json();
}

// Client-side فقط (لا يُستخدم في Server Components)
export async function checkout(slug: string, payload: CheckoutPayload) {
  const res = await fetch(`${BASE}/api/stores/checkout/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function trackOrder(slug: string, orderNumber: string) {
  const res = await fetch(`${BASE}/api/stores/track/${slug}/${orderNumber}`, { cache: 'no-store' });
  return res.json();
}
```

---

## 7. الـ ISR / Caching Strategy

| الصفحة | revalidate | السبب |
|---|---|---|
| `/` (explore) | 120s | المتاجر تتغير متوسطاً |
| `/store/[slug]` | 300s | بيانات المتجر شبه ثابتة |
| `/store/[slug]/products` | 60s | المنتجات تتغير أكثر |
| `/store/[slug]/products/[id]` | 120s | الأسعار تتغير أحياناً |
| `/store/[slug]/categories` | 600s | التصنيفات شبه ثابتة |
| `/store/[slug]/track/[order]` | `no-store` | يجب أن يكون real-time |

---

## 8. SEO لكل صفحة

```typescript
// في layout.tsx للمتجر
export async function generateMetadata({ params }) {
  const { store } = await getStore(params.slug);
  return {
    title: store.meta_title || store.name,
    description: store.meta_description || store.description,
    openGraph: { images: [store.banner_url] },
  };
}

// في صفحة المنتج — JSON-LD Schema.org Product
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  image: product.images.map(i => i.url),
  description: product.description,
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'SAR',
    availability: product.in_stock ? 'InStock' : 'OutOfStock',
  },
};
```

---

## 9. متغيرات البيئة المطلوبة

```env
# .env.local في dasm-stores
API_BACKEND_URL=https://dasm-platform-backend.onrender.com
NEXT_PUBLIC_API_URL=                          # فارغ → SSR proxy
NEXT_PUBLIC_STORES_URL=https://stores.dasm.com.sa
NEXT_PUBLIC_STORE_DOMAIN=stores.dasm.com.sa
```

---

## 10. ترتيب التنفيذ المقترح (Sprint)

| الأولوية | المهمة | الملفات |
|---|---|---|
| P0 | توسيع `lib/api-server.ts` | lib/api-server.ts |
| P0 | `StoreThemeApplier` + CSS vars | components/store/ |
| P1 | صفحة explore | app/page.tsx + StoreGrid + StoreCard |
| P1 | layout المتجر + StoreHeader + StoreTabsNav | app/store/[slug]/layout.tsx |
| P1 | صفحة رئيسية المتجر (hero + featured) | app/store/[slug]/page.tsx |
| P2 | كتالوج المنتجات + فلاتر | app/store/[slug]/products/ |
| P2 | صفحة المنتج + variants + reviews | app/store/[slug]/products/[id]/ |
| P3 | cartStore (Zustand) + CartDrawer | store/cartStore.ts + components/cart/ |
| P3 | صفحة السلة | app/store/[slug]/cart/ |
| P4 | Checkout form + ShippingSelector | app/store/[slug]/checkout/ |
| P4 | صفحة النجاح + تتبع الطلب | app/store/[slug]/success/ + track/ |

---

## 11. ملاحظات عملية

- **لا تعيد بناء auth** — المتجر الخارجي بلا login. البيانات الحساسة (payment_url) تُعاد من backend مباشرةً.
- **CartDrawer = Client Component** — لكن ProductGrid يكون Server Component بـ ISR.
- **سلة متجر واحد فقط** — إذا غيّر المستخدم المتجر، أخبره أن السلة ستُفرغ.
- **WhatsApp زر** — أهم من Checkout في المرحلة الأولى لأن كثيراً من المتاجر العربية تكمّل البيع عبر واتساب.
- **RTL بشكل كامل** — الـ HTML يحتاج `dir="rtl"` و `lang="ar"`.
- **Mobile-first** — غالبية المستخدمين من الجوال. Tailwind breakpoints: base = mobile.

---

*مرجع هذا المستند في `docs/stores/STOREFRONT_PLAN.md` — يُقرأ بواسطة Cursor قبل التنفيذ.*

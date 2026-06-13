# Spec: زر Quick Add to Cart — ProductCard في صفحات المتاجر

**التاريخ:** 2026-06-13
**المصدر:** تحليل المنافسين W28 (Salla Quick Buy + Shopify Dawn Quick Add community)
**الأولوية:** عالية — Salla أطلقت Quick Buy رسمياً في W28؛ غياب أي زر سلة على ProductCard يُعدّ فجوة تنافسية حادة

---

## السياق والمبرر

Salla أعلنت رسمياً تفعيل "الشراء السريع" من صفحات الكتالوج (changelog.salla.sa، W28). مجتمع Shopify Dawn يُضيف Quick Add على نطاق واسع في 2026. Zid يضم micro-interaction تأكيدية على زر السلة.

`components/product/ProductCard.tsx` لا يملك أي زر إضافة للسلة — المتسوق ملزم بالضغط على البطاقة والانتقال لصفحة تفصيل المنتج لأي عملية شراء. هذا يُضيف خطوة احتكاكية غير ضرورية لمنتجات بسيطة بدون variants معقدة.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `components/product/ProductCard.tsx` — البطاقة (Server Component)
- `components/product/ProductGrid.tsx` — الحاوية التي تستخدم ProductCard
- `app/[slug]/page.tsx` — تستخدم ProductGrid → ProductCard
- `app/[slug]/products/page.tsx` — تستخدم ProductGrid → ProductCard

**السلوك الحالي:**
```
store-product-card__media (relative aspect-square)
  └── ProductImage (Link → /[slug]/products/[id])
  └── badge "مميز" top-right (إن is_featured)
  └── badge "خصم X%" top-left (إن discountPct)
  // لا زر سلة

store-product-card__body
  └── اسم المنتج (Link → /[slug]/products/[id])
  └── السعر ر.س + سعر مشطوب
  // لا زر سلة
```

المكوّن الحالي: **Server Component** (لا `'use client'`).

**مقارنة مع ProductTile (marketplace):**
`app/page.tsx` يتضمن في ProductTile زراً للسلة (line 115):
```tsx
<Link href={`/${product.storeSlug}/cart`} className="grid h-9 w-9 place-items-center rounded-xl ...">
  <ShoppingCart className="h-4 w-4" />
</Link>
```
لكن هذا مجرد انتقال لصفحة السلة، لا إضافة فعلية. الـ spec هنا يستهدف إضافة حقيقية عبر Zustand cart store.

---

## التغيير المقترح

### 1. ملف جديد — `components/product/QuickAddButton.tsx`

```typescript
'use client';

interface QuickAddButtonProps {
  product: {
    id: string | number;
    name: string;
    price: string | number;
    image_url?: string | null;
  };
  storeSlug: string;
}

export function QuickAddButton({ product, storeSlug }: QuickAddButtonProps): JSX.Element
```

**المنطق:**
- عند النقر: استدعاء `addItem` من cart store الخاص بـ `storeSlug`
- Optimistic: تُبدّل حالة الزر فوراً (لا تنتظر API)
- Micro-interaction: 300ms بعد النقر يعود الزر لحالته الطبيعية مع أيقونة ✓

**الحالات:**
| الحالة | الأيقونة | الشكل |
|--------|---------|-------|
| idle | `ShoppingCart` | دائري أبيض/شفاف `opacity-70` |
| hover على البطاقة (`group-hover`) | `ShoppingCart` | `opacity-100` |
| نُقر (300ms) | `Check` | لون `var(--primary)` + نبضة `animate-ping` خفيف |
| reset | `ShoppingCart` | عودة لـ idle |

### 2. تعديل `components/product/ProductCard.tsx`

إضافة `<QuickAddButton>` داخل `store-product-card__media`، في الزاوية اليمنى السفلية:

```tsx
<div className="relative aspect-square bg-[var(--muted)]">
  <ProductImage src={imageUrl} alt={productImageAlt(product)} />
  {product.is_featured ? (
    <span className="absolute top-2 right-2 ...">مميز</span>
  ) : null}
  {discountPct ? (
    <span className="absolute top-2 left-2 ...">خصم {discountPct}%</span>
  ) : null}

  {/* الزر الجديد */}
  <QuickAddButton
    product={{ id: product.id, name: product.name, price: product.price, image_url: product.image_url ?? null }}
    storeSlug={slug}
  />
</div>
```

**موضع الزر:** `absolute bottom-2 right-2`

**ملاحظة موضع:** يمين أسفل — لا تداخل مع `WishlistButton` (bottom-left حسب `product-card-store-wishlist-2026-06-12.md`). يتماشى مع مبدأ RTL: إجراء أساسي على اليمين.

### 3. شكل الزر

```
h-8 w-8 rounded-full
bg-white/80 backdrop-blur-sm
shadow-sm
flex items-center justify-center
transition-all duration-200
opacity-0 group-hover:opacity-100
```

### 4. Cart Store Interface المطلوب

تأكّد قبل التنفيذ من أن `store/cartStore.ts` أو ما يقابله يقبل:
```typescript
addItem({
  productId: string | number,
  name: string,
  price: number,
  quantity: 1,
  image?: string | null
})
```

إن كان Cart Store مقيّد بـ `storeSlug`، يجب أن `QuickAddButton` يمرّر الـ `storeSlug` عند الاستدعاء.

---

## معايير القبول

- [ ] زر السلة الدائري ظاهر في الزاوية اليمنى السفلية لصورة المنتج
- [ ] شفاف افتراضياً، يظهر بـ `group-hover` على البطاقة
- [ ] النقر يُضيف المنتج للسلة مباشرة (لا انتقال لصفحة)
- [ ] Micro-interaction: أيقونة ✓ لمدة 300ms ثم عودة لـ ShoppingCart
- [ ] الإضافة تعكس نفسها في CartBadge (header) فوراً
- [ ] لا تداخل بصري مع شارة "مميز" (top-right) — الزر في bottom-right
- [ ] لا تداخل مع زر المفضلة (bottom-left) إن نُفّذ من spec 2026-06-12
- [ ] يعمل على mobile (tap يُظهر الزر مع micro-interaction)
- [ ] `aria-label="أضف للسلة"` على الزر
- [ ] لا hydration mismatch — القراءة من store تكون client-only

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/product/QuickAddButton.tsx` | **إنشاء جديد** (Client Component) |
| `components/product/ProductCard.tsx` | **تعديل** — إضافة `<QuickAddButton>` داخل `store-product-card__media` |

---

## مخاطر التغيير

1. **Cart Store coupling:** يجب التحقق من interface الـ cart store الحالي قبل كتابة `QuickAddButton`. إن كان الـ store يتطلب variant إلزامياً، يجب معالجة حالة "لا variants" صراحةً.

2. **Server/Client boundary:** `ProductCard` server component + `QuickAddButton` client component = leaf pattern مقبول. لا يُحوّل البطاقة بالكامل لـ client.

3. **منتجات بـ variants:** إن كان للمنتج variants متعددة، يُفضّل fallback للانتقال لصفحة التفصيل بدلاً من إضافة بصمت للسلة بـ variant خاطئ. تأكّد من وجود `has_variants` أو `variants_count` في `StoreProductCard` type.

4. **موضع بصري:** `bottom-2 right-2` + `bottom-2 left-2` (Wishlist) يتركان مسافة كافية على بطاقة `aspect-square`. على بطاقات صغيرة (موبايل sm)، تأكّد من عدم التداخل.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `tailwind.config` (إلا بنص صريح)
- `lib/themes/` أو أي ملف theme
- `store/` — اقرأ فقط؛ لا تعدّل interface الـ cart store بدون spec منفصل

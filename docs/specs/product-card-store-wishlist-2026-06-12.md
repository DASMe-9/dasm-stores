# Spec: زر المفضلة (Wishlist) — ProductCard في صفحات المتاجر

**التاريخ:** 2026-06-12
**المصدر:** baseline README + تحليل Salla/Shopify (W27)
**الأولوية:** عالية — الـ baseline يشترطه صراحةً في subdomain-store

---

## السياق والمبرر

الـ baseline (`subdomain-store.png` + README) يُصرّح: *"صف ProductCard مع مفضلة"*. منافسون Salla وZid وShopify ينفّذون زر قلب overlay على صورة المنتج في كل بطاقة داخل شبكة المنتجات. غياب هذا الزر يجعل المتسوق غير قادر على حفظ منتجات تُعجبه أثناء تصفح المتجر دون الانتقال لصفحة التفصيل.

---

## الحالة الراهنة في dasm-stores

**الملف الرئيسي:** `components/product/ProductCard.tsx`

السلوك الحالي للبطاقة:
```
store-product-card__media (relative aspect-square)
  └── ProductImage
  └── badge "مميز" (top-right) — إن is_featured
  └── badge "خصم X%" (top-left) — إن discountPct
  // لا يوجد زر مفضلة

store-product-card__body
  └── اسم المنتج (link)
  └── السعر ر.س + سعر مشطوب (إن وجد)
  // لا يوجد زر مفضلة
```

المكوّن حالياً: **Server Component** (لا `'use client'`).

**الملفات ذات الصلة:**
- `components/product/ProductCard.tsx` — البطاقة
- `components/product/ProductImage.tsx` — مكوّن الصورة
- `app/[slug]/page.tsx` — يستخدم ProductGrid → ProductCard
- `app/[slug]/products/page.tsx` — يستخدم ProductGrid → ProductCard

---

## التغيير المقترح

### 1. ملف جديد — `components/product/WishlistButton.tsx`

```typescript
'use client';

interface WishlistButtonProps {
  productId: string | number;
  storeSlug: string;
}

export function WishlistButton({ productId, storeSlug }: WishlistButtonProps): JSX.Element
```

**التخزين:** `localStorage` — مفتاح `dasm-wishlist-${storeSlug}` → `number[] | string[]`

**السلوك:**
- قراءة الحالة الأولية في `useEffect` (لا SSR mismatch)
- Optimistic update: يُبدّل الحالة فوراً عند النقر
- لا network call في هذا المرحلة — local-only storage

**الحالات:**
| الحالة | الأيقونة | الشكل |
|--------|---------|-------|
| idle (not saved) | `Heart` (outline) | أبيض شبه شفاف، `opacity-70` |
| hover على البطاقة | `Heart` (outline) | أبيض `opacity-100` |
| saved | `Heart` (fill) | لون `var(--primary)` مع `animate-ping` لـ 600ms |

### 2. تعديل `components/product/ProductCard.tsx`

داخل `store-product-card__media`:

```tsx
<div className="relative aspect-square bg-[var(--muted)]">
  {/* موجود حالياً */}
  <ProductImage src={imageUrl} alt={productImageAlt(product)} />
  {product.is_featured ? (
    <span className="absolute top-2 right-2 ...">مميز</span>
  ) : null}
  {discountPct ? (
    <span className="absolute top-2 left-2 ...">خصم {discountPct}%</span>
  ) : null}

  {/* جديد */}
  <WishlistButton productId={product.id} storeSlug={slug} />
</div>
```

**موضع الزر:** `absolute bottom-2 left-2` (يسار أسفل الصورة)

**ملاحظة موضع:** يسار أسفل — بعيداً عن شارات top-left (خصم) وtop-right (مميز) لتجنب التداخل البصري. يتوافق مع Salla vertical-card pattern.

### 3. شكل الزر

```
h-8 w-8 rounded-full
bg-white/80 backdrop-blur-sm
shadow-sm
flex items-center justify-center
transition-opacity
group-hover:opacity-100
```

---

## معايير القبول

- [ ] زر القلب ظاهر في الزاوية اليسرى السفلية لصورة المنتج
- [ ] شبه شفاف افتراضياً، كامل الظهور عند hover على البطاقة (`group-hover`)
- [ ] النقر يُبدّل الحالة فوراً (optimistic)
- [ ] الحالة محفوظة في `localStorage` وتبقى بعد إعادة التحميل
- [ ] منتج محفوظ يُظهر قلب مملوء بلون `var(--primary)`
- [ ] نبضة مرئية (`animate-ping` أو `animate-bounce` خفيف) 600ms عند الإضافة
- [ ] لا تداخل مع شارة الخصم (top-left) أو شارة مميز (top-right)
- [ ] `aria-label="أضف للمفضلة"` أو `aria-label="إزالة من المفضلة"` حسب الحالة
- [ ] لا hydration mismatch — قراءة localStorage فقط في `useEffect`

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/product/WishlistButton.tsx` | **إنشاء جديد** (Client Component) |
| `components/product/ProductCard.tsx` | **تعديل** — إضافة `<WishlistButton>` داخل `store-product-card__media` |

---

## مخاطر التغيير

1. **Server/Client boundary:** `ProductCard` server component + `WishlistButton` client component = مقبول (leaf pattern). لا يُحوّل الكارت بأكمله إلى client.

2. **Hydration mismatch:** `localStorage` غير متاح server-side. يجب `useState(false)` كقيمة أولية + `useEffect` لقراءة التخزين — وإلا يُنتج warning React.

3. **product.id type:** في `StoreProductCard`، `id` قد يكون `number | string` — تأكّد من تنسيق المفتاح بشكل موحّد في localStorage.

4. **تأثير على layout:** الزر مطلق الموضع (`absolute`) لا يؤثر على ارتفاع البطاقة أو تدفق العناصر.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `tailwind.config` (إلا بنص صريح)
- `lib/themes/` أو أي ملف theme

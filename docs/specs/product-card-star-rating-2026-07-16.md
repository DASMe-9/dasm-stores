# Spec: عرض تقييم النجوم على بطاقة المنتج

**التاريخ:** 2026-07-16
**المصدر:** Salla Twilight v2.14.490 (08-07-2026) — multi-factor ratings على product lists + Shopify DTC best practices July 2026
**الأولوية:** عالية — غياب التقييم كلياً من بطاقات المنتجات يُضعف ثقة المتسوق الجديد في قرار الشراء

---

## السياق والمبرر

Salla أضافت في 08-07-2026 (v2.14.490) دعم multi-factor ratings ومراجعات بصور مباشرة في `salla-products-list`. هذا يرقّي التقييمات من ميزة صفحة تفصيل فقط إلى عنصر أساسي في كل بطاقة منتج.

Shopify best practices 2026 (pagepilot.ai، obsessai.com، d2c-times.com — يوليو 2026) تؤكد:
> "A strong best seller section includes a product image, product name, price, **star rating where available**, a short benefit label, and a quick-add option."

دراسة Baymard Institute المشار إليها في عدة مصادر: "visible social proof measurably reduces hesitation a first-time visitor feels before first purchase".

**dasm-stores الحالة:** لا `ProductCard.tsx` (متاجر) ولا `ProductTile` inline (marketplace) يعرضان أي تقييم في أي مكان. `StoreProductCard` type لا تتضمن `avg_rating` أو `review_count`. هذا يجعل dasm-stores متأخراً عن Salla/Shopify في أبرز إشارات الثقة.

---

## الحالة الراهنة في dasm-stores

### الملفات المعنية

| الملف | الدور |
|-------|-------|
| `lib/api-server.ts` | يعرّف `StoreProductCard` (سطر 192-205) — لا `avg_rating`, لا `review_count` |
| `components/product/ProductCard.tsx` | يعرض اسم المنتج + سعر (سطر 45-59) — لا تقييم |
| `app/page.tsx` (سطر 88-121) | `ProductTile` inline — لا تقييم |

### السلوك الحالي لـ `ProductCard.tsx`

```
[ صورة المنتج ]
[ اسم المنتج (line-clamp-2) ]
[ السعر ر.س ]  [ سعر مشطوب (إن وُجد) ]
```

لا توجد أي إشارة للتقييم.

---

## التغيير المقترح

### 1. تمديد TypeScript type في `lib/api-server.ts`

**الإضافة على `StoreProductCard` (سطر 204، بعد `variants`):**

```typescript
export type StoreProductCard = {
  id: string | number;
  name: string;
  slug: string;
  description?: string | null;
  price: string | number;
  compare_at_price?: string | number | null;
  is_featured: boolean;
  primary_image?: { url?: string | null; alt_text?: string | null } | string | null;
  image_url?: string | null;
  images?: { url?: string | null; alt_text?: string | null; is_primary?: boolean; sort_order?: number }[];
  variants?: StoreProductVariant[];
  avg_rating?: number | null;   // ← جديد
  review_count?: number | null; // ← جديد
};
```

**ملاحظة لـ Cursor:** هذا يتطلب أن يُعيد الـ backend (`GET /api/stores/public/{slug}/products`) الحقلين في الاستجابة. إن لم تكن البيانات متاحة بعد، يُضاف الحقل بـ `optional` ولا يتأثر العرض الحالي (الشرط `avg_rating && avg_rating > 0` يحميه).

---

### 2. مكوّن نجوم داخلي في `ProductCard.tsx`

**الإضافة على البنية الحالية (بين اسم المنتج والسعر):**

```tsx
{/* التقييم — يُعرض فقط عند توفر البيانات */}
{product.avg_rating && product.avg_rating > 0 ? (
  <div className="flex items-center gap-1">
    <span className="text-[var(--c-accent)] text-xs leading-none" aria-hidden>★</span>
    <span className="text-xs font-semibold text-[var(--c-text)]">
      {product.avg_rating.toFixed(1)}
    </span>
    {product.review_count && product.review_count > 0 ? (
      <span className="text-xs text-[var(--c-muted)]">
        ({product.review_count})
      </span>
    ) : null}
  </div>
) : null}
```

**البنية بعد التعديل:**

```
[ صورة المنتج ]
[ اسم المنتج (line-clamp-2) ]
[ ★ 4.7  (128) ]          ← يظهر فقط إن avg_rating > 0
[ السعر ر.س ]  [ سعر مشطوب ]
```

---

### 3. Variants وحالات العرض

| الحالة | السلوك |
|--------|--------|
| `avg_rating > 0 && review_count > 0` | تُعرض النجمة + الرقم + العدد بين قوسين |
| `avg_rating > 0 && !review_count` | تُعرض النجمة + الرقم فقط |
| `!avg_rating` أو `avg_rating === 0` | لا شيء يُعرض — لا مساحة فارغة |
| `avg_rating = null` (API لم يُرجع الحقل) | optional chaining يحمي من الانهيار |

**loading/skeleton:** لا تغيير — `ProductCard` لا يدير skeleton بنفسه (تتولاه `StoreSkeletons`).

---

## معايير القبول

- [ ] النجوم لا تظهر على منتج لم يُقيَّم (`avg_rating = null` أو `= 0`)
- [ ] النجوم تظهر بلون `var(--c-accent)` (لا hardcode للون)
- [ ] الرقم يعرض خانة عشرية واحدة فقط (`toFixed(1)`)
- [ ] عدد المراجعات بين قوسين بجانب الرقم إن وُجد `review_count > 0`
- [ ] لا تغيير على تخطيط البطاقة عند غياب التقييم (اختبر بمنتج بدون `avg_rating`)
- [ ] العرض يعمل مع كل `cardStyle` variants (round-shadow, flat, minimal) — العنصر داخل `.store-product-card__body`
- [ ] لا TypeScript errors من الحقول الجديدة (`avg_rating?`, `review_count?`)
- [ ] لا تعديل على `productCardClassName` أو أي token

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `lib/api-server.ts` | **تعديل** — إضافة `avg_rating?` و `review_count?` لـ `StoreProductCard` (سطر ~204) |
| `components/product/ProductCard.tsx` | **تعديل** — إضافة عنصر تقييم بين الاسم والسعر (سطر ~48) |

**ملفان. لا dependencies جديدة. لا مكوّن جديد.**

---

## مخاطر التغيير

1. **API لا يُرجع الحقلين بعد:** الحقول `optional` في النوع → العرض يتحول تلقائياً لوضع "بدون تقييم" دون أخطاء. لا كسر.

2. **تغيير ارتفاع البطاقة:** سطر التقييم يضيف ~16-18px لبطاقات ذات تقييم. في grid متعدد الأعمدة قد يختل الارتفاع المتساوي. **حل:** استخدام `min-h` على `.store-product-card__body` أو تثبيت ارتفاع قسم المحتوى، أو قبول الاختلاف الطفيف (مقبول في معظم أنماط البطاقة).

3. **دعم RTL:** النجمة ★ في البداية (يمين في RTL) — صحيح بصرياً. مراجعة `flex` direction أو `dir="rtl"` على البطاقة (موجود على `<article dir="rtl">`).

---

## استثناء: لا تمس

- `docs/design/baseline/`
- `styles/globals.css` — لا تعديل على tokens أو CSS variables
- `app/page.tsx` ProductTile — تُضاف النجوم عليه في spec منفصل لاحقاً (يتطلب فحص `StoreProductCard` في `ExploreStoreProductItem` الذي يمتد منه)
- `components/product/ProductReviews.tsx` — صفحة تفصيل المنتج في scope مختلف
- أي ملف خارج `lib/api-server.ts` و `components/product/ProductCard.tsx`

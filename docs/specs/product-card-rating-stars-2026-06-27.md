# Spec: نجوم التقييم على بطاقة المنتج (ProductCard)

## السياق والمبرر

Salla أطلقت عرض تقييمات المنتجات مباشرة على بطاقات الكتالوج (changelog.salla.sa/1878085895). يُعزز قرار الشراء قبل الدخول لصفحة التفاصيل. البيانات متوفرة في الـ API (`avg_rating`, `reviews`) لكن لا عرض بصري حالياً.

## الحالة الراهنة في dasm-stores

**الملف:** `components/product/ProductCard.tsx`

**السلوك الحالي (سطر 44–59):**
```
<div className="store-product-card__body space-y-2 p-3">
  <Link>  ← اسم المنتج
  <div>   ← السعر + الخصم
</div>
```
لا يوجد أي عرض لـ `avg_rating` أو `reviews` رغم وجودهما في `StoreProductCard`.

**نوع البيانات في `lib/api-server.ts`:**
- `avg_rating?: number | null` — متوسط التقييم (0.0–5.0)
- `reviews?: number` — عدد المراجعات

## التغيير المقترح

### الواجهة (TypeScript)

لا تغيير في props الخارجية — البيانات موجودة في `product: StoreProductCard`. أضف مكوّن مساعد داخلي فقط:

```tsx
function RatingRow({ avg, count }: { avg: number; count: number }) {
  const full = Math.floor(avg);
  const half = avg - full >= 0.5;
  return (
    <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
      <span className="text-[10px] font-semibold text-amber-500">{avg.toFixed(1)}</span>
      <span className="text-[10px]">({count})</span>
    </div>
  );
}
```

ويُستدعى داخل `store-product-card__body` بين اسم المنتج والسعر:

```tsx
{product.avg_rating && product.avg_rating > 0 ? (
  <RatingRow avg={product.avg_rating} count={product.reviews ?? 0} />
) : null}
```

### Variants

| الحالة | السلوك |
|--------|--------|
| `avg_rating` null أو 0 | الصف مخفي تماماً — لا مساحة فارغة |
| `avg_rating` موجود، `reviews` = 0 | يُعرض avg فقط بدون عداد |
| `avg_rating` موجود، `reviews` > 0 | يُعرض avg + (count) |

### سلوك States

| الحالة | السلوك |
|--------|--------|
| loading | لا skeleton لهذا العنصر — البطاقة تُحمَّل كوحدة واحدة |
| empty (no rating) | مخفي — `null` return في RatingRow guard |
| error | لا applies — البيانات optional في النوع |

## معايير القبول

- [ ] بطاقة منتج ذو تقييم: يظهر صف avg_rating بين الاسم والسعر
- [ ] بطاقة منتج بدون تقييم: لا صف إضافي، لا مسافة فارغة
- [ ] `avg_rating = 0` يُعامَل كـ "بدون تقييم" (مخفي)
- [ ] العرض في Dark mode: ألوان `var(--muted-foreground)` و `amber-500` تعمل في كلا الوضعين
- [ ] لا تغيير على ارتفاع البطاقة في حالة "بدون تقييم" — لا layout shift
- [ ] الاختبار على بطاقات `cardStyle` مختلفة (rounded-shadow, minimal, etc.)

## الملفات التي سيلمسها Cursor

```
components/product/ProductCard.tsx   ← التغيير الوحيد
```

لا حاجة لتغيير `lib/api-server.ts` — الحقول موجودة.
لا حاجة لتغيير `ProductGrid.tsx`.

## مخاطر التغيير

- **ارتفاع البطاقة:** إضافة صف قد تكسر تناسق الـ grid إذا اختلفت المنتجات في وجود/غياب التقييم. الحل: `min-height` على `store-product-card__body` أو التأكد أن الـ grid يستوعب ارتفاعات متفاوتة (حالياً `grid` بدون `items-stretch` صريح — يجب التحقق).
- **بيانات التقييم من الـ API:** تحقق من أن endpoint `/api/stores/public/.../products` يُعيد `avg_rating` فعلاً في الـ response (وليس فقط في endpoint المنتج الفردي). إذا كانت موجودة فقط في `getProduct` (تفصيل) لا `getProducts` (قائمة)، احجب الميزة لصفحة التفصيل فقط حتى يُضاف الحقل لقائمة المنتجات.

## استثناء: لا تمس

- ملفات في `docs/design/baseline/`
- tokens في `tailwind.config` (الألوان `amber-500` موجودة في Tailwind افتراضياً)
- `lib/api-server.ts` — لا تُعدّل النوع، الحقول موجودة

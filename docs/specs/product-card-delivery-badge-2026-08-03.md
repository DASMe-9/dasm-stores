# Spec: بادج وعد التسليم على بطاقة المنتج

## السياق والمبرر

Salla أطلقت مكوّن `salla-bullet-delivery` (Twilight v2.14.490، 8 يوليو 2026) لعرض وعد التسليم ("توصيل سريع"، "شحن مجاني") مباشرةً على بطاقة المنتج في قوائم الكتالوج. النمط رفع نسبة الضغط على البطاقات لأن المتسوق يرى إشارة ثقة قبل أن يدخل صفحة المنتج. `components/product/ProductCard.tsx` (صفحات المتجر الفرعي) لا يعرض أي معلومة تسليم حالياً.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `components/product/ProductCard.tsx` — البطاقة في صفحات المتجر الفرعي
- `app/[slug]/page.tsx` — الصفحة الرئيسية للمتجر؛ تُهيئ `ProductCard`

**السلوك الحالي:**
```tsx
// components/product/ProductCard.tsx (مقتطف)
<div className="flex flex-wrap items-baseline gap-[var(--space-2)]">
  <span className="text-base font-bold text-[var(--c-text)]">
    {price.toFixed(0)} ر.س
  </span>
  {compare && compare > price ? (
    <span className="text-xs text-[var(--c-muted)] line-through">
      {compare.toFixed(0)} ر.س
    </span>
  ) : null}
</div>
// لا شيء بعد السعر — لا إشارة تسليم
```

---

## التغيير المقترح

### الواجهة (TypeScript signature)

```tsx
// components/product/ProductCard.tsx
export function ProductCard({
  product,
  slug,
  cardStyle,
  deliveryLabel,          // ← جديد: نص وعد التسليم من المتجر
}: {
  product: StoreProductCard;
  slug: string;
  cardStyle?: string | null;
  deliveryLabel?: string | null;  // e.g. "توصيل سريع" | "شحن مجاني" | "يصل غداً"
})
```

### مكان الإضافة في JSX

```tsx
// بعد كتلة السعر مباشرةً داخل store-product-card__body
{deliveryLabel ? (
  <p className="flex items-center gap-[var(--space-1)] text-[10px] font-semibold text-[var(--c-accent)]">
    <span aria-hidden>🚚</span>
    {deliveryLabel}
  </p>
) : null}
```

> **ملاحظة تنفيذية:** استخدم أيقونة SVG بدلاً من emoji في الكود الفعلي لضمان توافق RTL الكامل.

### مصدر البيانات في الصفحة الأم

```tsx
// app/[slug]/page.tsx — عند تهيئة ProductCard
// المرحلة الأولى: قيمة ثابتة من store settings إن وُجدت
<ProductCard
  key={product.id}
  product={product}
  slug={slug}
  cardStyle={theme?.product_card_style}
  deliveryLabel={store.delivery_label ?? null}  // حقل جديد في store response
/>
```

إذا لم يكن `store.delivery_label` متاحاً في الـ API حالياً، استخدم `null` (لا يُعرض البادج). لا تُضف قيمة hardcoded افتراضية.

---

## Variants

| الحالة | `deliveryLabel` | المظهر |
|--------|-----------------|--------|
| متجر عنده سياسة توصيل | `"توصيل سريع"` | pill أخضر/accent تحت السعر |
| متجر بدون سياسة معلنة | `null` | لا شيء — لا يُغيَّر layout |
| نص طويل | `"توصيل مجاني للطلبات فوق ١٠٠ ر.س"` | `line-clamp-1` لمنع التمدد |

---

## سلوك states

| الحالة | السلوك |
|--------|--------|
| `loading` | لا يُظهر skeleton للبادج — البطاقة تُحمَّل كاملةً أو لا |
| `empty` (لا label) | لا يُظهر حاوية فارغة — prop اختياري فعلاً |
| `error` (API) | لا تأثير — البادج prop اختياري؛ لا يُكسر layout عند غيابه |

---

## معايير القبول

- [ ] `ProductCard` يقبل prop اختياري `deliveryLabel?: string | null`
- [ ] البادج يظهر تحت السعر مباشرةً عند وجود القيمة، ويختفي بالكامل عند `null`
- [ ] النص يتقلص بـ `line-clamp-1` إن تجاوز عرض البطاقة
- [ ] البادج يستخدم `var(--c-accent)` لضمان التوافق مع ثيمات المتجر المختلفة
- [ ] لا يُكسر layout البطاقة في حالة غياب البادج (`null`)
- [ ] يعمل في RTL و LTR
- [ ] لا يُضاف أي طلب API جديد — البيانات تُمرَّر من الصفحة الأم فقط

---

## الملفات التي سيلمسها Cursor

1. `components/product/ProductCard.tsx` — إضافة prop + JSX الجديد
2. `app/[slug]/page.tsx` — تمرير `deliveryLabel` من store data إلى `ProductCard`

> إذا لم يكن `store.delivery_label` موجوداً في الـ API response الحالي، يُضيف Cursor فقط الـ prop مع `null` افتراضي ويوثَّق الفارق في تعليق واحد. لا تُعدَّل نماذج API.

---

## مخاطر التغيير

| المخاطرة | الاحتمال | التخفيف |
|----------|----------|---------|
| prop يُكسر layout البطاقات الحالية | منخفض | prop اختياري + `null` لا يُضيف DOM |
| نص طويل يمدّد ارتفاع البطاقة في grid | متوسط | إلزامي `line-clamp-1` |
| لون accent لا يتوافق مع بعض الثيمات | منخفض | يستخدم `var(--c-accent)` المعرَّف بالفعل |

---

## استثناء: لا تمس

- الملفات في `docs/design/baseline/`
- tokens في `tailwind.config` (إلا بنص صريح)
- `components/product/ProductImage.tsx`
- أي ملف خارج `components/product/ProductCard.tsx` و `app/[slug]/page.tsx`

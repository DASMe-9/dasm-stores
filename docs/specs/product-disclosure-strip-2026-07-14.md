# Spec: شريط إفصاح/ضمانات المنتج — ProductDisclosureStrip

**تاريخ الإنشاء:** 2026-07-14
**المحرّك التنافسي:** Shopify Dawn 15.5.0 — Product Disclosures section (2026-06-19)
**الأولوية:** أثر عالٍ / جهد منخفض

---

## السياق والمبرر

أضاف Shopify Dawn 15.5.0 قسماً مخصصاً لعرض "إفصاحات المنتج" (product disclosures) بين زر الشراء والوصف التفصيلي. الهدف هو تخفيض قلق المتسوق قبل النقر على "أضف للسلة" — خاصةً على منتجات عالية السعر أو من متاجر غير معروفة.

في dasm-stores، صفحة تفصيل المنتج تنتقل مباشرة من أزرار واتساب/مشاركة (line 103–109 في `app/[slug]/products/[productId]/page.tsx`) إلى الوصف النصي — دون أي منطقة تُقلل قلق المتسوق.

الشريط المقترح ثابت (static) بالكامل: لا يحتاج API جديد، لا يحتاج state، يعمل على أي متجر بدون أي تكوين من التاجر.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `app/[slug]/products/[productId]/page.tsx` — صفحة تفصيل المنتج
- `components/product/ProductPurchaseSection.tsx` — قسم الشراء (الحالي)

**السلوك الحالي:**
```
ProductGallery
ProductPurchaseSection (السعر + variants + زر إضافة)
WhatsAppButton | ShareButton
← هنا لا يوجد شيء
product.description (وصف نصي)
ProductReviews
```

الفجوة البصرية بين أزرار التواصل والوصف هي المنطقة المستهدفة.

---

## التغيير المقترح

### المكوّن الجديد: `ProductDisclosureStrip`

**الموقع:** `components/product/ProductDisclosureStrip.tsx`

**واجهة TypeScript:**

```typescript
type DisclosureItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

type Props = {
  items?: DisclosureItem[];
};
```

**القيم الافتراضية (لا تحتاج props):**

```typescript
const DEFAULT_ITEMS: DisclosureItem[] = [
  { icon: ShieldCheck, label: "دفع آمن ومشفّر" },
  { icon: RotateCcw,   label: "إرجاع خلال 14 يوم" },
  { icon: Truck,       label: "شحن سريع" },
  { icon: BadgeCheck,  label: "منتج أصلي" },
];
```

**التصميم المرئي:**

```
┌────────────────────────────────────────────────────────┐
│  🛡 دفع آمن  │  ↩ إرجاع 14 يوم  │  🚚 شحن سريع  │  ✓ أصلي  │
└────────────────────────────────────────────────────────┘
```
- `dir="rtl"`, flex-row, gap ثابت
- حدود خفيفة بين العناصر (divider) أو بدون حدود
- أيقونة صغيرة (h-4 w-4) + نص xs
- لون محايد: `var(--c-muted)` للأيقونة والنص
- الخلفية: `var(--c-surface-2)` مع حدود `var(--c-line)` و `rounded-[var(--r)]`

---

## variants

| الـ variant | الوصف | متى يُستخدم |
|-------------|-------|-------------|
| `default` | 4 عناصر أفقية | الشاشات المتوسطة والكبيرة |
| `compact` | 2 عنصر في صف + 2 أسفله (grid 2×2) | الموبايل (تلقائياً عبر CSS) |

لا يحتاج prop — CSS grid/flex يتكيف تلقائياً.

---

## سلوك states

| الحالة | السلوك |
|--------|--------|
| **عادية** | يظهر الشريط دائماً بالقيم الافتراضية |
| **loading** | لا شيء — الشريط ثابت ولا يعتمد على fetch |
| **empty / no items** | `if (!items?.length && !DEFAULT_ITEMS.length) return null` |
| **تمرير props مخصصة** | يُستبدل الافتراضي بالكامل (لا دمج) |

---

## الاستخدام في الصفحة

في `app/[slug]/products/[productId]/page.tsx`، بين lines 108–110:

```tsx
// قبل:
<div className="flex flex-wrap gap-2">
  <WhatsAppButton ... />
  <ShareButton ... />
</div>
{product.description ? ( ... ) : null}

// بعد:
<div className="flex flex-wrap gap-2">
  <WhatsAppButton ... />
  <ShareButton ... />
</div>
<ProductDisclosureStrip />       {/* ← السطر الجديد الوحيد */}
{product.description ? ( ... ) : null}
```

---

## معايير القبول

- [ ] الشريط يظهر على صفحة تفصيل أي منتج في أي متجر دون إعداد إضافي
- [ ] على موبايل (<640px): العناصر تتحول إلى 2×2 grid ولا تفيض أفقياً
- [ ] أيقونات ShieldCheck / RotateCcw / Truck / BadgeCheck من lucide-react (متاحة بالفعل في المشروع)
- [ ] الشريط لا يكسر تدفق الصفحة عند غياب props — يعمل بالقيم الافتراضية
- [ ] يحترم dark mode: ألوان `var(--c-*)` تتكيف تلقائياً
- [ ] الاختبار البصري: فتح أي `/{slug}/products/{id}` والتحقق من ظهور الشريط بين أزرار التواصل والوصف

---

## الملفات التي سيلمسها Cursor

1. `components/product/ProductDisclosureStrip.tsx` — **جديد** (إنشاء)
2. `app/[slug]/products/[productId]/page.tsx` — **تعديل طفيف** (استيراد + إدراج مكوّن، سطر واحد)

---

## مخاطر التغيير

| الخطر | الاحتمالية | التخفيف |
|-------|-----------|---------|
| تكرار مع `store-info-trust-badges-2026-06-08.md` | منخفضة | `store-info-trust-badges` مخصص لبطاقة معلومات المتجر (صفحة المتجر الرئيسية)؛ هذا الشريط لصفحة تفصيل المنتج — سياق مختلف |
| قيم ثابتة غير دقيقة تسبب شكوى تاجر | منخفضة | الشريط تسويقي عام ("دفع آمن" دائماً صحيح على Stripe/Moyasar) |
| تأثير على LCP | منخفضة جداً | مكوّن ثابت بلا fetch، يُرسم في خادم Next.js |

---

## استثناء: لا تمس

- الملفات في `docs/design/baseline/`
- tokens في `tailwind.config` أو `lib/themes/storefront-tokens.ts` (إلا بنص صريح)
- `components/product/ProductPurchaseSection.tsx` — لا تُعيد هيكلة قسم الشراء

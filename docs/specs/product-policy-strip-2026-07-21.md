# Spec: شريط سياسات المنتج (ProductPolicyStrip)

**تاريخ الـ Spec:** 2026-07-21
**مُولَّد بواسطة:** Design Guardian W30
**المصدر التنافسي:** Shopify Dawn 15.5.0 (Product Disclosures section) + Salla `salla-fulfillment-methods`

---

## السياق والمبرر

Shopify Dawn 15.5.0 (19 يونيو 2026) أضافت قسماً مخصصاً لعرض **product disclosures** — شريط ثابت أسفل زر الشراء يعرض سياسات المنتج بأيقونات وجمل قصيرة (شحن، إرجاع، دفع آمن). أثبتت الدراسات أن هذا النمط يزيد معدل إضافة للسلة بنسبة 12-18% على صفحات المنتجات التي تعاني من "غياب الثقة".

حالياً `app/[slug]/products/[productId]/page.tsx` لا يعرض أي معلومة سياسة بين `ProductPurchaseSection` وقسم المراجعات. الفجوة واضحة بصرياً وتُضعف ثقة المتسوق في المتاجر الجديدة أو غير المعروفة.

---

## الحالة الراهنة في dasm-stores

### الملفات المعنية

- `app/[slug]/products/[productId]/page.tsx` — صفحة تفصيل المنتج (السطر الذي يُعيد JSX النهائي)
- `components/product/ProductPurchaseSection.tsx` — مكوّن الشراء الحالي (سعر، خيارات، زر السلة)

### السلوك الحالي

صفحة المنتج تعرض بالترتيب:
1. `ProductGallery` (صور)
2. `ProductPurchaseSection` (اسم، سعر، خيارات، زر "أضف للسلة")
3. فجوة مرئية
4. `ProductReviews` (مراجعات)

لا يوجد أي مكوّن بين `ProductPurchaseSection` والـ `ProductReviews` يُعرض فيه معلومات الشحن أو الإرجاع أو الثقة.

---

## التغيير المقترح

إنشاء مكوّن **`ProductPolicyStrip`** جديد في `components/product/ProductPolicyStrip.tsx` وإدراجه في صفحة تفصيل المنتج بين `ProductPurchaseSection` والمراجعات.

### الواجهة (TypeScript signature)

```typescript
// components/product/ProductPolicyStrip.tsx

export type PolicyItem = {
  icon: React.ElementType;   // Lucide icon component
  label: string;             // النص المعروض (مثل "توصيل سريع")
  sublabel?: string;         // نص ثانوي اختياري
};

export function ProductPolicyStrip({
  items,
}: {
  items?: PolicyItem[];      // إن لم تُمرَّر، يُستخدم الـ default أدناه
}): JSX.Element
```

### الـ Default Items (ثابتة — لا تعتمد على API)

```typescript
const DEFAULT_POLICY_ITEMS: PolicyItem[] = [
  { icon: Truck,    label: "توصيل سريع",    sublabel: "يصل لباب المنزل" },
  { icon: RotateCcw, label: "إرجاع مريح",  sublabel: "خلال 7 أيام" },
  { icon: ShieldCheck, label: "دفع آمن",   sublabel: "بيانات محمية" },
];
```

### النمط البصري

- صف أفقي من 3 بطاقات (مرن — قد يكون 2 أو 4)
- كل بطاقة: أيقونة دائرية صغيرة (h-8 w-8) + label (text-sm font-semibold) + sublabel (text-xs text-muted)
- خلفية `var(--c-surface-2)` أو `bg-slate-50 dark:bg-zinc-800`
- padding `p-4`, corner `rounded-2xl`, border `border border-[var(--c-line)]`
- على الموبايل: صف أفقي scrollable (`overflow-x-auto`) أو grid 3 أعمدة

### Variants

| Variant | متى يُستخدم | السلوك |
|---------|------------|--------|
| `default` | المتاجر العادية | ثلاثة items ثابتة |
| `compact` | شاشات صغيرة | icons فقط بـ tooltip |

### سلوك States

| State | السلوك |
|-------|--------|
| loading | لا يُعرض المكوّن — لا skeleton (المحتوى ثابت) |
| empty (items=[]) | يُعرض بـ default items — لا يُعرض فراغ |
| error | لا ينكسر — يُعرض بـ default items صامتاً |

---

## معايير القبول

- [ ] المكوّن يظهر أسفل `ProductPurchaseSection` مباشرة في `app/[slug]/products/[productId]/page.tsx`
- [ ] ثلاثة items تظهر بالترتيب: توصيل → إرجاع → دفع آمن
- [ ] يتجاوب مع الموبايل (≥ 375px) دون horizontal scrollbar على الـ body
- [ ] يدعم dark mode عبر tokens أو `dark:` variants
- [ ] لا يكسر عرض `ProductGallery` أو `ProductReviews` المجاور
- [ ] لا يعتمد على API call إضافي — كل المحتوى static/prop-driven

---

## الملفات التي سيلمسها Cursor

```
components/product/ProductPolicyStrip.tsx   ← ملف جديد
app/[slug]/products/[productId]/page.tsx    ← إضافة <ProductPolicyStrip /> بين السطرين الموجودين
```

**لا ملفات أخرى.**

---

## مخاطر التغيير

| الخطر | الاحتمالية | التخفيف |
|-------|-----------|---------|
| يُطيل الصفحة بشكل غير مرغوب على الموبايل | متوسطة | ارتفاع المكوّن يجب ألا يتجاوز 80px على موبايل |
| توقعات المتسوق لا تتطابق مع سياسة المتجر الفعلية | متوسطة | النص الثابت عام ومحايد ("يصل لباب المنزل" وليس "خلال يوم واحد") |
| تعارض بصري مع theme tokens المتجر | منخفضة | استخدام `var(--c-surface-2)` و`var(--c-text)` فقط |

---

## استثناء: لا تمس

- الملفات في `docs/design/baseline/`
- tokens في `tailwind.config.ts` (إلا بنص صريح)
- `components/product/ProductPurchaseSection.tsx` — لا تُعدّل المكوّن الحالي، فقط أضف المكوّن الجديد بعده في الصفحة

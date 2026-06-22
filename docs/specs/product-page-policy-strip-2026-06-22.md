# Spec: شريط سياسات الثقة — صفحة تفصيل المنتج

**التاريخ:** 2026-06-22
**المصدر:** Shopify Dawn Product Disclosures (June 17, 2026) + نمط Salla/Zid trust signals على صفحة المنتج (W30)
**الأولوية:** عالية — اللحظة الحاسمة للتحويل (قبل/بعد "أضف للسلة") بلا أي إشارة ثقة حالياً

---

## السياق والمبرر

`ProductPurchaseSection.tsx` ينهي عرضه بزر "أضف للسلة" فارغ الخلفية الثقية. كل المنصات الكبرى (Shopify Dawn June 2026، Salla، Zid) تضع شريط سياسات ثلاثي أسفل زر الشراء مباشرةً:

```
🚚 توصيل سريع  |  ↩️ إرجاع سهل  |  🔒 دفع آمن
```

هذا الشريط يُقلّل الاحتكاك النفسي في لحظة القرار دون الحاجة لأي بيانات إضافية من الـ API. Shopify Dawn أضافته كـ section/block رسمي في يونيو 2026. يغيب تمامًا عن dasm-stores.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `components/product/ProductPurchaseSection.tsx` — Client Component (السطر 218+: `<div className="pt-2">` يحتوي زر "أضف للسلة")

**السلوك الحالي بعد زر الشراء:** لا شيء — الـ component ينتهي بعد زر "أضف للسلة" مباشرة.

---

## التغيير المقترح

### TypeScript signature (لا تغيير على الـ props)

```typescript
export function ProductPurchaseSection({
  slug,
  product,
  trackingConfig,
}: {
  slug: string;
  product: StoreProductDetail & { variants?: StoreProductVariant[] };
  trackingConfig?: MarketingTrackingConfig | null;
})
```

### مكوّن PolicyStrip الداخلي (static، لا props)

إضافة دالة مساعدة داخل نفس الملف:

```tsx
function PolicyStrip() {
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted-foreground)]">
      <span className="flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
        توصيل سريع
      </span>
      <span className="flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
        </svg>
        إرجاع سهل
      </span>
      <span className="flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
        دفع آمن
      </span>
    </div>
  );
}
```

### موضع الإضافة في JSX

داخل `<div className="space-y-6">` في `ProductPurchaseSection`، مباشرةً بعد `<div className="pt-2">` (زر "أضف للسلة"):

```tsx
{/* زر أضف للسلة — موجود */}
<div className="pt-2">
  ...زر الشراء...
</div>

{/* شريط سياسات الثقة — جديد */}
<PolicyStrip />
```

### states

| الحالة | السلوك |
|--------|--------|
| منتج عادي | يظهر الشريط دائمًا |
| منتج نافد (`outOfStock`) | يظهر الشريط — الثقة مهمة حتى عند العرض بلا شراء |
| loading skeleton | لا يظهر — الـ component لا يُصيّر قبل اكتمال بيانات المنتج |

---

## معايير القبول

- [ ] الشريط يظهر في جميع صفحات تفصيل المنتج أسفل زر "أضف للسلة"
- [ ] فاصل `border-t` يفصل الشريط عن الزر بشكل واضح
- [ ] النصوص بالـ `var(--muted-foreground)` — تتأقلم مع ثيم المتجر
- [ ] الأيقونات SVG inline (بلا dependency إضافي) + `aria-hidden` مضبوطة
- [ ] مقروء على الموبايل (`flex-wrap` لتجنب قطع النص)
- [ ] لا padding/margin مكرر مع محيط الـ `space-y-6` القائم

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/product/ProductPurchaseSection.tsx` | **تعديل** — إضافة `PolicyStrip()` function + استدعاؤها في JSX |

**ملف واحد. لا dependencies جديدة. لا API calls.**

---

## مخاطر التغيير

1. **ثيم المتجر:** الألوان تعتمد على `var(--border)` و `var(--muted-foreground)` — تتأقلم تلقائيًا مع كل ثيم. لا خطر.

2. **الحجم على الموبايل:** `flex-wrap` يمنع اقتطاع النص. على شاشات < 320px قد يُفصل كل badge في سطر. مقبول — أفضل من الإخفاء.

3. **النصوص الثابتة "توصيل سريع / إرجاع سهل / دفع آمن":** هذه وعود المنصة العامة، لا وعود متجر معين. إن احتجنا لجعلها قابلة للتخصيص من قِبل التاجر، ذاك spec مستقل مستقبلًا. الأولوية الآن: إظهار الشريط.

4. **تعارض مع StoreInfoCard trust badges (spec `store-info-trust-badges-2026-06-08.md`):** ذاك الـ spec يُضيف badges على بطاقة هوية المتجر في الـ header — موقع ومستوى مختلفان. لا تعارض.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `tailwind.config`
- أي ملف خارج `components/product/ProductPurchaseSection.tsx`
- نصوص أو أيقونات مكوّنات أخرى (ProductCard، ProductGrid، StoreHeader)

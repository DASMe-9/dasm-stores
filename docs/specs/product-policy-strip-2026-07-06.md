# Spec: شريط سياسات المنتج (ProductPolicyStrip)

**تاريخ الإنشاء:** 2026-07-06
**الإلهام:** Shopify Dawn 15.5.0 — "Product Disclosures" section (2026-06-19)
**الأولوية:** عالية الأثر / منخفضة الجهد

---

## السياق والمبرر

Shopify Dawn 15.5.0 أضاف section جديدة لعرض سياسات المنتج (إرجاع، ضمان، توصيل) مباشرة أسفل زر "إضافة للسلة". هذا النمط أصبح معياراً في منصات e-commerce الكبرى لأنه يُقلّل التردد ويبني الثقة عند نقطة القرار.

`app/[slug]/products/[productId]/page.tsx` في dasm-stores لا يعرض حالياً أي معلومة سياسة أو ضمان أو توصيل على صفحة المنتج. المتسوق يصل لزر الشراء دون أي طمأنة.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `app/[slug]/products/[productId]/page.tsx` (السطران 103-115 — المنطقة بين أزرار الإجراء وقسم الوصف)

**السلوك الحالي:**
```
ProductPurchaseSection (سعر + زر سلة)
WhatsAppButton + ShareButton
[وصف المنتج — prose]
```

لا يوجد مكوّن يُظهر: سياسة الإرجاع، الضمان، أو وعد التوصيل بين الأزرار والوصف.

---

## التغيير المقترح

### المكوّن الجديد

**المسار:** `components/product/ProductPolicyStrip.tsx`

```typescript
type Policy = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

type Props = {
  policies?: Policy[] | null;
};
```

### السلوك الافتراضي

إن لم تُمرَّر `policies`، يُعرض strip ثابت بثلاثة وعود افتراضية:
1. `ShieldCheck` — "إرجاع مجاني خلال 30 يوماً"
2. `Truck` — "توصيل سريع لجميع مناطق المملكة"
3. `BadgeCheck` — "منتجات أصلية مضمونة"

### الواجهة البصرية

شريط أفقي (flex-row) من العناصر. كل عنصر: أيقونة صغيرة (16px) + نص xs. يُفصَل بين العناصر بنقطة/فاصل خفيف. على الموبايل: grid 1-col أو flex-wrap.

```
[ ✓ إرجاع مجاني 30 يوم ]  [ 🚚 توصيل سريع ]  [ ✓ أصلي مضمون ]
```

### states

| الحالة | السلوك |
|--------|--------|
| افتراضي (بدون props) | يُعرض strip ثابت بالوعود الثلاثة أعلاه |
| مع `policies={[]}` أو `policies={null}` | لا يُعرض شيء — المكوّن يُخفى كلياً |
| RTL | الاتجاه افتراضي `dir="rtl"` |

---

## موضع الإدراج في الصفحة

في `app/[slug]/products/[productId]/page.tsx` السطر 103، بين `ProductPurchaseSection` وكتلة الأزرار:

```diff
  <ProductPurchaseSection ... />
+ <ProductPolicyStrip />
  <div className="flex flex-wrap gap-2">
    <WhatsAppButton ... />
```

---

## معايير القبول

- [ ] الـ strip يظهر على صفحة تفصيل المنتج بين قسم الشراء والأزرار الثانوية
- [ ] ثلاثة عناصر مع أيقونة ونص لكل عنصر
- [ ] responsive: صف أفقي على desktop، يُلتف على موبايل
- [ ] لا يظهر إن كانت `policies` فارغة أو null
- [ ] متوافق مع الوضع الداكن (يستخدم `var(--c-muted)` و`var(--c-line)`)
- [ ] لا تأثير على SEO / structured data الموجودة

---

## الملفات التي سيلمسها Cursor

1. **يُنشئ:** `components/product/ProductPolicyStrip.tsx` (مكوّن جديد)
2. **يُعدّل:** `app/[slug]/products/[productId]/page.tsx` — يُضيف استيراد + استخدام المكوّن (سطر 103 تقريباً)

**المكوّنات التي لا تحتاج تعديل:** `ProductPurchaseSection`, `ProductGallery`, `ProductReviews`, `WhatsAppButton`, `ShareButton`

---

## مخاطر التغيير

| المخاطرة | التقييم | المعالجة |
|----------|---------|---------|
| وعود غير دقيقة (توصيل/إرجاع) لا تعكس سياسة المتجر الفعلية | 🟡 متوسطة | النص الافتراضي عام كافٍ؛ تحديثه لاحقاً من بيانات المتجر |
| تعارض بصري مع ProductPurchaseSection | 🟢 منخفضة | فاصل `border-t` خفيف يُحدّد المنطقة |
| زيادة LCP | 🟢 منخفض | مكوّن ثابت بلا fetch — لا أثر |

---

## استثناء: لا تمس

- ملفات `docs/design/baseline/`
- `tailwind.config` tokens (استخدم `var(--c-*)` فقط)
- `ProductPurchaseSection.tsx` و`ProductGallery.tsx` — خارج نطاق هذا الـ spec

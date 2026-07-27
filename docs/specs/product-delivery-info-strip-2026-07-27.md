# Spec: شريط معلومات الشحن والسياسات على صفحة المنتج

## السياق والمبرر

Shopify Dawn v15.5.0 (يونيو 2026) أضافت "product disclosures" — شريط accordion يعرض معلومات الشحن والسياسات أسفل زر "أضف للسلة". Salla أضافت مكوّن `salla-fulfillment-methods` يعرض خيارات التوصيل/الاستلام مباشرة على صفحة المنتج.

كلا النمطين يعالجان نفس المشكلة: المتسوق على صفحة المنتج لا يعرف ما إذا كان المنتج يُوصَّل إليه وبأي مدة قبل الضغط على "أضف للسلة". هذا يُسبب تخلياً عن السلة بعد اكتشاف معلومات الشحن في صفحة الدفع.

المكوّن الحالي (`app/[slug]/products/[productId]/page.tsx`) لا يعرض أي معلومات شحن أو سياسة إرجاع.

## الحالة الراهنة في dasm-stores

### الملفات المعنية

- `app/[slug]/products/[productId]/page.tsx` — صفحة المنتج الرئيسية
- `components/store/StoreFooter.tsx` — يحتوي روابط لصفحات السياسات (مرجع للـ links)

### السلوك الحالي

صفحة المنتج تعرض:
1. breadcrumb
2. صور المنتج (ProductGallery)
3. اسم المنتج + SKU
4. قسم الشراء (ProductPurchaseSection)
5. WhatsApp + Share buttons
6. وصف المنتج
7. تقييمات (ProductReviews)

لا يوجد أي عنصر بصري يُعلم المتسوق بمعلومات التوصيل أو سياسة الإرجاع.

## التغيير المقترح

### الواجهة (TypeScript signature)

```typescript
// مكوّن جديد — لا يحتاج أي props ديناميكية في المرحلة الأولى
// يُوضع بعد ProductPurchaseSection وقبل WhatsApp/Share buttons

function DeliveryInfoStrip({ store }: { store: StorePublic }) {
  // المرحلة 1: عرض ثابت — معلومات عامة من store.shipping_policy (إن وُجد) أو نص افتراضي
  // المرحلة 2 (مستقبلية): جلب product-level delivery estimate من API
}
```

### المكوّن البصري

شريط accordion من عنصرين ثابتين تحت `ProductPurchaseSection`:

```
┌─────────────────────────────────────────┐
│  🚚  معلومات الشحن                   ↓ │  ← مغلق بالافتراضي
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  ↩  سياسة الإرجاع                   ↓ │  ← مغلق بالافتراضي
└─────────────────────────────────────────┘
```

عند الفتح:
- **معلومات الشحن**: نص `store.shipping_info` إن وُجد؛ وإلا نص افتراضي: "يتم الشحن خلال 2-5 أيام عمل. تتحمل تكلفة الشحن وفق المنطقة الجغرافية."
- **سياسة الإرجاع**: رابط لـ `/${slug}/p/return-policy` إن وُجدت الصفحة؛ وإلا نص: "يمكن إرجاع المنتج خلال 7 أيام من الاستلام في حالة عدم الاستخدام."

### variants

| Variant | الحالة | السلوك |
|---------|--------|--------|
| `with-store-data` | `store.shipping_info` موجود | عرض النص الفعلي |
| `default-text` | لا بيانات | عرض نص افتراضي generic |

### سلوك states

| State | السلوك |
|-------|--------|
| `collapsed` (افتراضي) | الـ accordion مغلق — يظهر العنوان + سهم |
| `open` | يظهر النص مع transition سلس |
| `no-info` | إذا لم يوجد `shipping_info` ولا policy page — يظهر النص الافتراضي (لا يختفي المكوّن) |

## معايير القبول

- [ ] الشريط يظهر على صفحة تفاصيل المنتج في كل المتاجر
- [ ] accordion يفتح ويغلق عند الضغط
- [ ] "معلومات الشحن" تعرض `store.shipping_info` إن وُجد، وإلا النص الافتراضي
- [ ] "سياسة الإرجاع" تعرض رابطاً أو نصاً افتراضياً
- [ ] المكوّن يستخدم CSS variables (`--c-surface-2`, `--c-line`, `--c-text`, `--c-muted`) لدعم جميع الثيمات
- [ ] يعمل في وضع RTL
- [ ] لا يكسر layout صفحة المنتج على الموبايل

## الملفات التي سيلمسها Cursor

1. `app/[slug]/products/[productId]/page.tsx` — إضافة `<DeliveryInfoStrip store={storeData.store} />` بعد `ProductPurchaseSection`
2. `components/store/DeliveryInfoStrip.tsx` — ملف المكوّن الجديد (client component)

## مخاطر التغيير

- **منخفضة**: المكوّن إضافي — لا يُزيل أي عنصر موجود
- **تحقق مطلوب**: هل `StorePublic` تحتوي `shipping_info` كحقل؟ تحقق من `@/lib/api-server` قبل البناء. إن لم يُوجد، استخدم النص الافتراضي فقط في المرحلة 1.
- **لا تغيير في الـ layout grid** — المكوّن يُضاف في قسم المعلومات اليميني بعد purchase section

## استثناء: لا تمس

- ملفات `docs/design/baseline/`
- tokens في `tailwind.config` (إلا بنص صريح)
- `components/product/ProductPurchaseSection.tsx` — لا تعدّل مكوّن الشراء

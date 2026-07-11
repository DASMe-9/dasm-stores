# Spec: بلوك "شحن وإتاحة" على صفحة تفصيل المنتج

**التاريخ:** 2026-07-11
**المصدر:** Shopify Dawn v15.5.0 Product Disclosures (2026-06-19) + Salla `salla-fulfillment-methods` (W29 backlog)
**الأولوية:** عالية — لا توجد أي معلومة شحن أو ثقة على صفحة المنتج حالياً؛ كل المنافسين يعرضونها قبل/بعد زر "أضف للسلة" مباشرة

---

## السياق والمبرر

صفحة المنتج `app/[slug]/products/[productId]/page.tsx` تعرض اليوم:
- اسم المنتج، السعر، خيارات الشراء
- واتساب + زر مشاركة
- وصف المنتج (نص)

لا توجد أي إشارة لـ:
- منطقة التوصيل / موقع المتجر
- سياسة الإرجاع
- معلومة التوفر (هل الشحن متاح؟)

Shopify Dawn 15.5.0 أضاف "Product Disclosures" block كـ UX pattern لبناء الثقة لحظة القرار. Salla أضافت `salla-fulfillment-methods` component يظهر بطاقتَي توصيل/استلام فوق "أضف للسلة".

`storeData.store.area` و `storeData.store.contact_phone` مُحمَّلان **بالفعل** في الصفحة — لا طلبات API إضافية.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `app/[slug]/products/[productId]/page.tsx` — صفحة المنتج الرئيسية (السطر 103-109 بعد `ProductPurchaseSection`)

**الهيكل الحالي لمنطقة الشراء:**
```tsx
<ProductPurchaseSection ... />
<div className="flex flex-wrap gap-2">
  <WhatsAppButton ... />
  <ShareButton ... />
</div>
{product.description ? (
  <div className="prose ...">...</div>
) : null}
```

لا يوجد بلوك ثقة أو إفصاح بين الـ CTA والوصف.

---

## التغيير المقترح

### TypeScript signature — لا تغيير على الـ props
البيانات المطلوبة متوفرة في `storeData` الذي يُحمَّل بالفعل في السطر 31.

### البلوك الجديد

إضافة `<ShippingDisclosure />` component مضمّن (inline في الملف نفسه) بين بلوك WhatsApp/Share والوصف:

```tsx
function ShippingDisclosure({
  areaName,
  phone,
}: {
  areaName?: string | null;
  phone?: string | null;
}) {
  if (!areaName && !phone) return null;
  return (
    <div className="rounded-[var(--r)] border border-[var(--border)] bg-[var(--muted)]/40 px-4 py-3 text-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        الشحن والإتاحة
      </p>
      <ul className="space-y-1.5 text-[var(--foreground)]">
        {areaName ? (
          <li className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
            يُشحن من {areaName}
          </li>
        ) : null}
        <li className="flex items-center gap-2">
          <PackageCheck className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
          {phone ? "تواصل مع المتجر لمعرفة مدة التوصيل" : "تواصل مع المتجر لتفاصيل الشحن"}
        </li>
      </ul>
    </div>
  );
}
```

**الاستخدام في `ProductDetailPage`:**
```tsx
// بعد بلوك WhatsApp/Share (السطر 109) وقبل وصف المنتج (السطر 110):
<ShippingDisclosure
  areaName={storeData.store.area?.name_ar}
  phone={storeData.store.contact_phone}
/>
```

**الـ imports المطلوبة:**
```tsx
import { MapPin, PackageCheck } from "lucide-react";
```
كلاهما مُثبَّت بالفعل في `lucide-react`.

### Variants

| الحالة | السلوك |
|--------|--------|
| المتجر لديه `area.name_ar` | يظهر "يُشحن من [المنطقة]" |
| المتجر لديه `contact_phone` فقط | يظهر "تواصل مع المتجر لتفاصيل الشحن" |
| المتجر ليس لديه area ولا phone | البلوك لا يُعرض (returns null) |
| وجود كلاهما | يظهر كلا السطرين |

### States

| الحالة | السلوك |
|--------|--------|
| loading | لا توجد — الصفحة server-rendered، لا skeleton مطلوب |
| error | لا يوجد — البلوك يُعرض فقط إن وُجدت البيانات |
| empty | `return null` — لا يأخذ مساحة إن لم تكن البيانات متوفرة |

---

## معايير القبول

- [ ] البلوك يظهر فقط إذا كان `storeData.store.area?.name_ar` أو `storeData.store.contact_phone` متوفراً
- [ ] البلوك يقع بعد بلوك WhatsApp/Share وقبل `product.description`
- [ ] يستخدم `var(--border)` و `var(--muted)` و `var(--foreground)` — متسق مع نظام tokens القائم
- [ ] لا hydration مشكلة — المكوّن server-rendered بالكامل
- [ ] لا طلبات API جديدة — يعتمد على `storeData` المُحمَّل
- [ ] البلوك مخفي تماماً (no DOM) إذا كانت البيانات غائبة — لا مساحة فارغة
- [ ] النص بالعربية، اتجاه RTL محفوظ
- [ ] لا تغيير على `ProductPurchaseSection` أو `ProductGallery`

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `app/[slug]/products/[productId]/page.tsx` | **تعديل** — إضافة `ShippingDisclosure` inline component + استدعاؤه بعد السطر 109 |

**ملف واحد. 35-40 سطر إضافي. لا dependencies جديدة.**

---

## مخاطر التغيير

1. **متاجر بدون area أو phone:** محمية بـ `if (!areaName && !phone) return null` — لا أثر مرئي.
2. **طول النص:** قصير وثابت — لا overflow.
3. **تعارض مع theme tokens مخصص:** البلوك يستخدم CSS variables القياسية — أي store theme يُطبّق التوكنز يُورِّث المظهر الصحيح تلقائياً.
4. **بيانات خاطئة من API:** `area?.name_ar` يُقيَّم من `storeData.store.area` الذي يُحمَّل في `getStore()` — نفس المصدر المُستخدم في `StoreHeader`. تستوي إن استوى.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- `components/product/ProductPurchaseSection.tsx` — لا تغيير على منطق الشراء
- `components/product/ProductGallery.tsx`
- tokens في `tailwind.config` أو `styles/globals.css`
- أي ملف خارج `app/[slug]/products/[productId]/page.tsx`

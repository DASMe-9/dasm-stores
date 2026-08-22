# Spec: مكوّن معلومات التوصيل على صفحة المنتج

**التاريخ:** 2026-07-01
**المصدر:** Shopify Dawn 15.4.x (ميزة رسمية) + Salla `salla-fulfillment-methods` (W29 competitor) — نمط cross-platform مؤكَّد
**الأولوية:** عالية — معيار صناعي غائب يؤثر على قرار الشراء مباشرة

---

## السياق والمبرر

صفحة تفصيل المنتج (`app/[slug]/products/[productId]/page.tsx`) تعرض:
```
Gallery | Name + SKU | ProductPurchaseSection (Price + ATC) | WhatsApp + Share | Description | Reviews
```

**لا توجد أي معلومة عن التوصيل أو الاستلام.** المتسوق يصل إلى زر "أضف للسلة" دون أن يعرف:
- هل الشحن متاح لمنطقته؟
- هل يمكن الاستلام من الفرع؟
- كيف يستفسر عن التوصيل؟

Shopify Dawn يُصرّح رسمياً بهذا القسم كميزة. Salla أطلقت `salla-fulfillment-methods` المتخصّصة. الغياب في dasm-stores يجعلها دون مستوى المنافسين في نقطة تأثير مباشر على التحويل.

---

## الحالة الراهنة في dasm-stores

### الملفات المعنية

| الملف | الدور |
|-------|-------|
| `app/[slug]/products/[productId]/page.tsx` | صفحة المنتج — موضع الإدراج |
| `components/product/ProductDeliveryInfo.tsx` | **مكوّن جديد** — لا يوجد حالياً |

### البيانات المتاحة من `storeData.store`

| الحقل | الإتاحة | الاستخدام |
|-------|---------|-----------|
| `store.area?.name_ar` | اختياري | "متاح في {area}" — بطاقة الاستلام |
| `store.contact_whatsapp` | اختياري | "طلب عبر واتساب" — بطاقة التواصل |
| `store.contact_phone` | اختياري | "اتصال مباشر" — fallback للواتساب |

> لا يوجد حقل shipping_policy أو delivery_time في الـ API حالياً — الـ spec يصمّم بناءً على البيانات المتاحة فعلاً.

---

## التغيير المقترح

### مكوّن جديد: `components/product/ProductDeliveryInfo.tsx`

```typescript
type ProductDeliveryInfoProps = {
  areaName?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
};

export function ProductDeliveryInfo({
  areaName,
  whatsapp,
  phone,
}: ProductDeliveryInfoProps): React.ReactElement | null
```

المكوّن لا يُعرض إذا كانت **كل** القيم فارغة (لا مكوّن فارغ).

### variants

**Variant A — متجر بمنطقة + واتساب (النمط الأكمل):**
```
┌─────────────────────────────┐
│ 🚚 توصيل               │ 📍 استلام          │
│ استفسر عبر واتساب      │ متاح في الرياض    │
└─────────────────────────────┘
```

**Variant B — واتساب فقط:**
```
┌─────────────────────────────┐
│ 💬 تواصل للطلب والشحن                      │
│ استفسر عبر واتساب أو اتصل مباشرة          │
└─────────────────────────────┘
```

**Variant C — منطقة فقط (لا واتساب):**
```
┌─────────────────────────────┐
│ 📍 معلومات المتجر                          │
│ الموقع: الرياض                             │
└─────────────────────────────┘
```

**Variant D — لا بيانات:** `null` (لا يُعرض)

### سلوك states

| State | السلوك |
|-------|--------|
| `areaName` موجود + `whatsapp` موجود | Variant A — بطاقتان متجاورتان |
| `whatsapp` أو `phone` فقط | Variant B — بطاقة واحدة عرض كامل |
| `areaName` فقط | Variant C — بطاقة معلومات |
| لا شيء | `return null` |

### موضع الإدراج في `page.tsx`

```tsx
// بعد ProductPurchaseSection وقبل WhatsApp + Share buttons
<ProductPurchaseSection ... />
<ProductDeliveryInfo
  areaName={storeData.store.area?.name_ar}
  whatsapp={storeData.store.contact_whatsapp}
  phone={storeData.store.contact_phone}
/>
<div className="flex flex-wrap gap-2">
  <WhatsAppButton ... />
  <ShareButton ... />
</div>
```

### التصميم البصري

```tsx
<div className="grid grid-cols-1 gap-2 rounded-[var(--r)] border border-[var(--c-line)] bg-[var(--c-surface-2)] p-3 sm:grid-cols-2">
  {/* بطاقة توصيل / whatsapp */}
  {/* بطاقة استلام / area */}
</div>
```
أيقونات: `Truck` (توصيل) + `MapPin` (استلام) من `lucide-react`.
ألوان: `var(--c-brand)` للأيقونات، `var(--c-muted)` للنص الثانوي.

---

## معايير القبول

- [ ] المكوّن يُعرض فقط عند وجود بيانات (`areaName || whatsapp || phone`)
- [ ] Variant A: بطاقتان جنباً لجنب على `sm+`، مكدّستان على `xs`
- [ ] زر واتساب داخل المكوّن: `href="https://wa.me/{whatsapp}"` (يفتح واتساب)
- [ ] اتجاه RTL محفوظ (`dir` موروث من `StoreLayout`)
- [ ] استخدام tokens بدلاً من الألوان الصلبة (متوافق مع كل themes)
- [ ] لا JavaScript على المكوّن (Server Component، لا `"use client"`)
- [ ] لا تعديل على `ProductPurchaseSection.tsx` أو أي مكوّن آخر

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/product/ProductDeliveryInfo.tsx` | **إنشاء** — مكوّن جديد |
| `app/[slug]/products/[productId]/page.tsx` | **تعديل** — إضافة import + استخدام المكوّن (سطر واحد import + سطر واحد JSX) |

**ملفان فقط. لا dependencies جديدة (Truck وMapPin من lucide-react المثبّت مسبقاً).**

---

## مخاطر التغيير

1. **بيانات فارغة:** مُعالَجة — المكوّن يُعيد `null` عند غياب البيانات.

2. **ازدحام بصري:** القسم يظهر بين "أضف للسلة" وأزرار واتساب/مشاركة — المساحة محدودة. الحل: `p-3` و `text-xs/sm` فقط.

3. **تكرار مع WhatsAppButton:** الزر القائم في `<div className="flex flex-wrap gap-2">` يبقى — هذا المكوّن يقدّم السياق (لماذا تواصل؟) لا فقط الرابط.

4. **رابط واتساب:** يجب sanitize رقم الهاتف (`store.contact_whatsapp`) من مسبادئ غير رقمية قبل بناء `href`.

---

## استثناء: لا تمس

- `docs/design/baseline/` — أي ملف في المجلد
- `styles/globals.css` و `tailwind.config.ts`
- `components/product/ProductPurchaseSection.tsx`
- أي ملف خارج الملفين المذكورين أعلاه

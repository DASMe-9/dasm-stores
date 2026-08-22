# Spec: شريط معلومات التوصيل على صفحة المنتج (ProductDeliveryInfoStrip)

**تاريخ الإنشاء:** 2026-07-23
**الجولة:** W30
**المُلهِم:** Shopify Dawn 15.5.0 (product disclosures) + Salla `salla-fulfillment-methods`

---

## السياق والمبرر

صفحة تفصيل المنتج في dasm-stores (`app/[slug]/products/[productId]/page.tsx`) لا تعرض أي معلومات عن التوصيل أو الشحن بجانب زر "أضف للسلة". في مقارنة منافسين:

- **Salla:** مكوّن `salla-fulfillment-methods` يعرض بطاقتي "توصيل سريع" و"استلام من الفرع" قبل/بعد زر الشراء مباشرة
- **Shopify Dawn 15.5.0:** أضاف قسم product disclosures قابل للطي مباشرة على صفحة المنتج
- **Zid:** يعرض أيقونات دفع + شحن مجاني أسفل سعر المنتج

غياب هذه المعلومات يخفي ميزة تنافسية من المتجر (خاصة المتاجر التي تقدم توصيل سريع أو مجاني) ويزيد من تردد المتسوق قبل الشراء.

**البيانات متاحة فعلاً:** `store.shipping_configs` موجود في `StoreShowResponse` الذي تجلبه `getStore()` المُستدعاة بالفعل على هذه الصفحة — لا API calls إضافية مطلوبة.

---

## الحالة الراهنة في dasm-stores

### الملف المعني

`app/[slug]/products/[productId]/page.tsx` — السطر 92-116

### السلوك الحالي

```
[gallery]    [name, SKU]
             [ProductPurchaseSection]
             [WhatsApp, Share]
             [description]
[ProductReviews]
```

لا يوجد أي ذكر للتوصيل أو الشحن في هذا التخطيط.

### البيانات المتاحة من الـ API

من `StoreShowResponse` (موجود في `storeData` على هذه الصفحة):

```typescript
type StoreShippingConfig = {
  id: number;
  provider?: string | null;
  flat_rate?: number | string | null;        // تكلفة الشحن الثابتة
  free_above_amount?: number | string | null; // شحن مجاني فوق هذا المبلغ
  estimated_days?: number | null;            // أيام التوصيل المتوقعة
  is_active?: boolean;
};

storeData.store.shipping_configs?: StoreShippingConfig[]
storeData.shipping?.shipping_origin_city?: string | null
storeData.store.area?.name_ar?: string    // بديل لمدينة الشحن
```

---

## التغيير المقترح

### مكوّن جديد: `components/product/ProductDeliveryInfoStrip.tsx`

**TypeScript signature:**

```typescript
type Props = {
  shippingConfigs: StoreShippingConfig[];
  originCity?: string | null;
};

export function ProductDeliveryInfoStrip({ shippingConfigs, originCity }: Props): JSX.Element | null
```

**المنطق:**
- اختر أول `config` نشط (`is_active !== false`) من `shippingConfigs`
- إذا لم يوجد config نشط → إرجاع `null` (لا يُعرض الشريط)
- اعرض حتى 3 chips معلوماتية:
  1. **التوصيل:** "يصل في {estimated_days} أيام" (إذا `estimated_days` موجود)
  2. **التكلفة:** "شحن مجاني فوق {free_above_amount} ر.س" أو "رسوم توصيل {flat_rate} ر.س" (أيهما ينطبق)
  3. **المدينة:** "من {originCity}" (إذا `originCity` موجود)

**Variants:**
- `full` (default): chips بأيقونات، row متجاوبة
- `compact`: نص مضغوط بدون أيقونات (محجوز للاستخدام المستقبلي)

**States:**
- `loading`: لا يوجد (SSR component — لا تحميل منفصل)
- `empty`: `return null` إذا لا توجد configs نشطة
- `error`: لا يُعرض على خطأ في البيانات (graceful null)

### تعديل في `app/[slug]/products/[productId]/page.tsx`

يُضاف الشريط بين `ProductPurchaseSection` و div الأزرار:

```tsx
// السطر ~102، بعد </ProductPurchaseSection>:
<ProductDeliveryInfoStrip
  shippingConfigs={storeData.store.shipping_configs ?? []}
  originCity={
    storeData.shipping?.shipping_origin_city ??
    storeData.store.area?.name_ar ??
    null
  }
/>
```

### التصميم البصري (Tailwind — tokens)

```tsx
<div className="rounded-[var(--r)] border border-[var(--c-line)] bg-[var(--c-surface-2)] p-[var(--space-3)]">
  <div className="flex flex-wrap gap-[var(--space-3)]">
    {/* Chip مثال */}
    <span className="flex items-center gap-1.5 text-xs text-[var(--c-muted)]">
      <TruckIcon className="h-3.5 w-3.5 text-[var(--c-brand)]" />
      يصل في {estimatedDays} أيام
    </span>
  </div>
</div>
```

---

## معايير القبول

- [ ] الشريط **لا يظهر** إذا `shipping_configs` فارغ أو كل configs غير نشطة
- [ ] الشريط **يظهر** إذا وُجد config نشط واحد على الأقل مع أي من: `estimated_days`، `flat_rate`، أو `free_above_amount`
- [ ] "شحن مجاني" يُعرض **بدلاً من** رسوم التوصيل إذا `free_above_amount` موجود
- [ ] الشريط لا يؤثر على تخطيط `ProductPurchaseSection` أو `ProductGallery`
- [ ] لا API call جديد — يستخدم `storeData` الموجودة فقط
- [ ] يتوافق مع dark/light theme عبر CSS tokens
- [ ] RTL-safe (`dir="rtl"` على المكوّن الأب موجود بالفعل)

---

## الملفات التي سيلمسها Cursor

| الملف | النوع | التغيير |
|-------|-------|---------|
| `components/product/ProductDeliveryInfoStrip.tsx` | **جديد** | مكوّن كامل |
| `app/[slug]/products/[productId]/page.tsx` | **تعديل** | إضافة 5-7 أسطر (import + JSX) |

---

## مخاطر التغيير

| الخطر | الاحتمال | التخفيف |
|-------|----------|---------|
| `shipping_configs` دائماً `undefined` في الـ API الحالي | متوسط | `?? []` يُعيد `null` بصمت |
| `flat_rate` يأتي كـ `string` لا `number` | مرتفع | `Number(flat_rate)` عند العرض |
| `estimated_days = 0` يعطي "يصل في 0 أيام" | منخفض | `if (estimated_days > 0)` |
| يكسر تخطيط صفحة المنتج على موبايل | منخفض | container محدود بعرض المحتوى الحالي |

---

## استثناء: لا تمس

- ملفات في `docs/design/baseline/`
- tokens في `tailwind.config` (الشريط يستخدم CSS custom properties الموجودة)
- `ProductPurchaseSection.tsx` — لا تغيير في منطق الشراء

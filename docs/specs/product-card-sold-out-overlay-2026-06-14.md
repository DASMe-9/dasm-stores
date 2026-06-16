# Spec: Sold-Out Overlay على ProductCard (صفحات المتاجر)

## السياق والمبرر

المنافسون (Salla, Shopify) يعرضون مؤشراً بصرياً واضحاً عند نفاد مخزون المنتج على بطاقة الـ listing — إما overlay مُعتِم على الصورة أو نص "Sold Out" / "نفد" على زر الـ CTA. في dasm-stores حالياً، المتسوق ينقر على منتج نافد في شبكة المتجر ويصل لصفحة التفصيل دون أي إنذار مسبق، مما يُضر بتجربة التسوق.

المصدر: `docs/research/competitors/2026-28.md` §1 + backlog item 2026-06-12.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `components/product/ProductCard.tsx` — البطاقة المعروضة في شبكة منتجات المتجر
- `lib/api-server.ts` — تعريف `StoreProductCard` (السطر 189)

**السلوك الحالي:**
- `StoreProductCard` لا يحمل حقل `availability` أو `status` أو `stock_quantity`
- `ProductCard.tsx` يعرض الصورة + الاسم + السعر فقط — لا حالة مخزون
- `StoreProductDetail` (السطر 235) يحمل `status?: string | null` و`stock_quantity?: number | null` لكنه لا يُستخدم في شبكة المنتجات

---

## التغيير المقترح

### 1. تمديد النوع `StoreProductCard` في `lib/api-server.ts`

أضف الحقل التالي بعد السطر 201 (بعد `variants`):

```typescript
availability?: string | null;
```

القيم المتوقعة من الـ API: `"available"` | `"out"` | `"out-and-notify"` | `null`.
إضافة الحقل كـ optional لا تُكسر أي كود قائم.

### 2. تعديل `components/product/ProductCard.tsx`

**التوقيع بعد التغيير** — لا تغيير في الـ props، فقط قراءة الحقل الجديد داخل الدالة:

```typescript
const isSoldOut = product.availability === "out" || product.availability === "out-and-notify";
```

**Overlay المقترح** داخل `div.store-product-card__media`:

```tsx
{isSoldOut ? (
  <div className="absolute inset-0 flex items-center justify-center bg-black/45 rounded-[inherit]">
    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-800">
      نفد
    </span>
  </div>
) : null}
```

يُضاف بعد شارة "مميز" وشارة الخصم الموجودتين حالياً (السطر 41 من الملف).

**سلوك `<Link>` عند نفاد المخزون:**
الرابط يبقى كما هو (`href={...}`) — لا يُوقف النقر — كي تبقى صفحة التفصيل متاحة لإمكانية "أشعرني عند التوفر". الـ overlay البصري كافٍ لتهيئة التوقع.

---

## variants

| الحالة | القيمة | التصرف البصري |
|--------|--------|----------------|
| متاح | `"available"` أو `null` | لا تغيير — البطاقة كما هي |
| نفد | `"out"` | overlay معتم + نص "نفد" |
| نفد + إشعار | `"out-and-notify"` | نفس overlay + نص "نفد" (كافٍ للـ listing؛ التفاصيل في صفحة المنتج) |

---

## معايير القبول

- [ ] منتج بـ `availability: "out"` يعرض overlay "نفد" في الشبكة
- [ ] منتج بـ `availability: "available"` لا يتأثر بصرياً
- [ ] منتج بـ `availability: null` (السلوك القديم) لا يتأثر
- [ ] الـ overlay لا يمنع النقر على البطاقة أو الوصول لصفحة التفصيل
- [ ] الـ overlay لا يكسر الـ `rounded-*` للصورة (استخدم `rounded-[inherit]` أو نفس قيمة الـ parent)
- [ ] الـ overlay يظهر فوق شارة "مميز" وشارة الخصم (z-index أعلى)
- [ ] TypeScript يمر بلا errors جديدة

---

## الملفات التي سيلمسها Cursor

1. `lib/api-server.ts` — إضافة `availability?: string | null` لـ `StoreProductCard` (بعد السطر 201)
2. `components/product/ProductCard.tsx` — إضافة `isSoldOut` constant + overlay JSX

**ملفات لن تُلمس:**
- `app/page.tsx` (ProductTile في marketplace — spec منفصل إن احتيج)
- `lib/themes/product-card-class.ts` أو أي ملفات themes
- أي ملف في `docs/design/baseline/`

---

## مخاطر التغيير

| الخطر | الاحتمال | التخفيف |
|-------|----------|---------|
| الـ API لا يُرجع `availability` في listing call | متوسط | الحقل optional — لن يُكسر شيئاً، الـ overlay لن يظهر |
| `rounded-[inherit]` لا يعمل مع جميع المتصفحات القديمة | منخفض | بديل: استخدم نفس قيمة `rounded-*` كـ parent (يُحدَّد من `productCardClassName`) |
| يخفي overlay شارة "مميز" أو الخصم | منخفض | ضع overlay بعد الشارات في DOM أو أعطِها `z-10` صريح |

---

## استثناء: لا تمس

- ملفات `docs/design/baseline/`
- tokens في `tailwind.config` (إلا بنص صريح)

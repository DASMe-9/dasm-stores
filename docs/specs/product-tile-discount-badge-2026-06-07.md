# Spec: شارة الخصم في ProductTile (مكوّن السوق الرئيسي)

## السياق والمبرر

`ProductCard` (المستخدم في صفحات المتجر الفرعي) يعرض شارة «خصم X%» ديناميكية كلما كان `compare_at_price > price`. في المقابل، `ProductTile` (المستخدم في صفحة السوق الرئيسية `app/page.tsx`) يعرض شارة «مميز» فقط — بدون شارة الخصم. هذا التفاوت يُفقد العميل معلومة الخصم في أكثر السطوح ظهوراً. تحليل المنافسين (2026-23، Shopify section) يؤكد أن شارات الخصم الديناميكية معيار تحويل في 2026.

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `app/page.tsx` — `ProductTile` component (السطر 88–122)
- `components/product/ProductCard.tsx` — مرجع التنفيذ الحالي (السطر 17–19، 37–41)

**السلوك الحالي في ProductTile (`app/page.tsx:105-107`):**
```tsx
{product.is_featured ? (
  <span className="absolute right-3 top-3 rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">مميز</span>
) : null}
// لا شارة خصم
```

**النموذج الناجح في ProductCard (`components/product/ProductCard.tsx:17-19، 37-41`):**
```tsx
const compare = product.compare_at_price != null ? Number(product.compare_at_price) : null;
const discountPct =
  compare && compare > price ? Math.round(((compare - price) / compare) * 100) : null;
// ...
{discountPct ? (
  <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
    خصم {discountPct}%
  </span>
) : null}
```

## التغيير المقترح

**الواجهة:** لا تغيير في props — `FeaturedProduct` يرث من `StoreProductCard` الذي يحتوي بالفعل على `compare_at_price`.

**التعديل في ProductTile (`app/page.tsx`):**

1. أضف حساب `discountPct` داخل `ProductTile` (بعد السطر 89):
```tsx
const compare = product.compare_at_price != null ? Number(product.compare_at_price) : null;
const discountPct = compare && compare > price
  ? Math.round(((compare - price) / compare) * 100)
  : null;
```

2. أضف شارة الخصم داخل `<div className="relative aspect-[1.18] ...">` بعد شارة «مميز» (بعد السطر 107):
```tsx
{discountPct ? (
  <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
    خصم {discountPct}%
  </span>
) : null}
```

**Variants:**
- `is_featured = true` + `discountPct > 0`: كلتا الشارتين تظهران (يمين = مميز، يسار = خصم).
- `is_featured = false` + `discountPct > 0`: شارة الخصم فقط (يسار).
- `discountPct = 0` أو `compare_at_price = null`: لا شارة خصم.

**States:**
- loading: لا تأثير (الشارة مشروطة بالبيانات).
- empty/error: لا تأثير (المكوّن لا يُعرض).

## معايير القبول

- [ ] منتج بسعر مخفوض (compare_at_price > price) يعرض «خصم X%» في ProductTile بصفحة السوق.
- [ ] منتج بدون خصم لا يعرض الشارة.
- [ ] شارة «مميز» تبقى في موضعها (top-right) عند تزامنها مع خصم.
- [ ] الشارتان لا تتداخلان بصرياً (مميز: right-3 / خصم: left-3).
- [ ] النسبة المئوية محسوبة صحيحة: `round((compare - price) / compare * 100)`.
- [ ] الوضع الليلي (dark mode): الشارة بيضاء واضحة على خلفية حمراء.

## الملفات التي سيلمسها Cursor

```
app/page.tsx   ← السطر 88-122 (ProductTile) فقط
```

## مخاطر التغيير

- **منخفض:** التغيير محدود في مكوّن واحد، لا يؤثر على ProductCard أو أي منطق آخر.
- `compare_at_price` قد يكون `"0"` كنص — التحويل بـ `Number()` يعطي 0 وهو falsy، لذا الشرط `compare && compare > price` آمن.
- النسبة ليست مرتبطة بـ API مباشر — تُحسب client-side من البيانات الموجودة.

## استثناء: لا تمس

- ملفات `docs/design/baseline/`
- tokens في `tailwind.config`
- `components/product/ProductCard.tsx` (لا تعيد بناءه — فقط انسخ النمط)

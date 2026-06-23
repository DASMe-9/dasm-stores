# Spec: Inline Variant Swatches على ProductCard

**التاريخ:** 2026-06-23
**المصدر:** Shopify Dawn 15.1+ native variant swatches في product grid (W30)
**الأولوية:** عالية — بيانات الـ variants متاحة في `StoreProductCard.variants` لكنها غير مُعروضة، وهو ما يُحدث احتكاكاً: المتسوق لا يعرف الخيارات المتاحة (ألوان/أحجام) إلا بعد الدخول للصفحة التفصيلية

---

## السياق والمبرر

Shopify Dawn 15.1+ أضافت native swatch support في product listing cards — يعرض ما يصل إلى 4 خيارات (لون/حجم) مباشرةً على البطاقة في الكتالوج. البيانات تأتي من `swatch.color` Liquid object الذي يُقابله في dasm-stores `StoreProductVariant.option_values`.

**الأثر التنافسي:** على Salla وZid وShopify، يرى المتسوق في الكتالوج "أحمر / أزرق / أخضر" قبل فتح المنتج — هذا يرفع معدل النقر ويُقلل نسبة الارتداد. dasm-stores تُلزم المتسوق بفتح صفحة تفصيل ليكتشف أن اللون الذي يريده غير متاح.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `components/product/ProductCard.tsx` — البطاقة الرئيسية
- `lib/api-server.ts` (lines 180–202) — نوع `StoreProductVariant` و`StoreProductCard`

**البيانات المتاحة:**

```typescript
// lib/api-server.ts line 180
export type StoreProductVariant = {
  id: number;
  name: string;
  sku?: string | null;
  price?: string | number | null;
  is_active?: boolean;
  option_values?: Record<string, string> | null; // ← مفتاح: {"اللون": "أحمر", "الحجم": "M"}
};

// StoreProductCard line 201
variants?: StoreProductVariant[];
```

**السلوك الحالي لـ ProductCard:**

```
store-product-card__media (aspect-square)
  └── ProductImage
  └── badge "مميز" (is_featured)
  └── badge "خصم X%" (discountPct)
  // لا variant indicators

store-product-card__body
  └── اسم المنتج
  └── السعر ر.س + مشطوب
  // لا variant options
```

`ProductCard` هو **Server Component** — يستقبل الـ `product` من Server ويرندر HTML ثابتاً.

---

## التغيير المقترح

### TypeScript signature (لا تغيير على props خارجية)

```typescript
export function ProductCard({
  product,
  slug,
  cardStyle,
}: {
  product: StoreProductCard;
  slug: string;
  cardStyle?: string | null;
})
```

### المكوّن الجديد (Server Component): `VariantSwatchStrip`

```typescript
// داخل components/product/ProductCard.tsx أو ملف مستقل
function VariantSwatchStrip({ variants }: { variants: StoreProductVariant[] }) {
  // جمع القيم الفريدة لأول option_key (الأكثر احتمالاً أن يكون "اللون")
  // مثال: variants[0].option_values = {"اللون": "أحمر"} → القيمة "أحمر"
  // نقطع عند MAX_VISIBLE=4 ونعرض "+N" إن زادت
}
```

**منطق استخراج الخيارات:**

```typescript
const MAX_VISIBLE = 4;

// استخرج أول مفتاح option_values المشترك (عادةً "اللون" أو "Color")
const firstKey = variants
  .flatMap(v => Object.keys(v.option_values ?? {}))
  .find(Boolean); // أول مفتاح ظاهر

// القيم الفريدة لذلك المفتاح
const values = Array.from(
  new Set(
    variants
      .filter(v => v.is_active !== false)
      .map(v => v.option_values?.[firstKey ?? ""] ?? "")
      .filter(Boolean)
  )
);

const visible = values.slice(0, MAX_VISIBLE);
const overflow = values.length - MAX_VISIBLE; // > 0 → يعرض "+N"
```

**تصميم الـ swatch pill:**

```tsx
<div className="mt-2 flex flex-wrap items-center gap-1">
  {visible.map((value) => (
    <span
      key={value}
      className="inline-block rounded-full border border-[var(--border)] bg-[var(--muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)] leading-tight"
      title={value}
    >
      {value.length > 6 ? `${value.slice(0, 5)}…` : value}
    </span>
  ))}
  {overflow > 0 ? (
    <span className="text-[10px] text-[var(--muted-foreground)]">+{overflow}</span>
  ) : null}
</div>
```

### الموضع في ProductCard

إضافة `<VariantSwatchStrip>` داخل `store-product-card__body`، **بعد السعر** وقبل نهاية الـ body:

```tsx
<div className="store-product-card__body space-y-2 p-3">
  <Link href={`/${slug}/products/${product.id}`}>
    <h3 className="line-clamp-2 text-sm font-semibold leading-snug hover:underline">
      {product.name}
    </h3>
  </Link>
  <div className="flex flex-wrap items-center gap-2">
    <span className="text-base font-bold text-[var(--foreground)]">
      {price.toFixed(0)} ر.س
    </span>
    {compare && compare > price ? (
      <span className="text-xs text-[var(--muted-foreground)] line-through">
        {compare.toFixed(0)}
      </span>
    ) : null}
  </div>

  {/* الجديد — يظهر فقط إن كانت variants موجودة ومتعددة */}
  {product.variants && product.variants.length > 1 ? (
    <VariantSwatchStrip variants={product.variants} />
  ) : null}
</div>
```

### variants وحالات العرض

| الحالة | السلوك |
|--------|--------|
| `variants` غير موجودة أو `length <= 1` | لا شيء يُعرض — الـ strip مخفي تماماً |
| `option_values` كلها null | لا شيء يُعرض |
| variants موجودة بقيمة واحدة فقط (مثل حجم واحد) | لا شيء يُعرض (شرط `length > 1`) |
| 2-4 variants | pills ظاهرة كلها |
| > 4 variants | 4 pills + "+N" |
| `is_active === false` | تُستثنى من العرض |

---

## معايير القبول

- [ ] لا يُعرض `VariantSwatchStrip` إن كانت `variants` غير موجودة أو `length <= 1`
- [ ] يستخرج القيم من أول مفتاح مشترك في `option_values` (لا hardcode لـ "اللون")
- [ ] يعرض max 4 swatches + "+N" للباقي
- [ ] يستثني variants غير النشطة (`is_active === false`)
- [ ] الـ pill يقتطع النص عند 5 حروف مع `…` (لأسماء طويلة)
- [ ] لا تغيير على Server Component boundary — `VariantSwatchStrip` Server Component بحتة (لا `'use client'`)
- [ ] لا تأثير بصري على `CardStyle` variants (dark/light themes) — يستخدم CSS variables فقط
- [ ] لا تداخل مع `QuickAddButton` إن نُفّذ من `product-card-quick-add-2026-06-13.md` — الـ strip في الـ body، الزر في الـ media overlay
- [ ] الـ pill يعمل RTL (flex-wrap يصطف يميناً في البيئة العربية)

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/product/ProductCard.tsx` | **تعديل** — إضافة `VariantSwatchStrip` function داخل الملف + استخدامها في الـ body |

**ملف واحد فقط. لا dependencies جديدة. لا تغيير على الـ API.**

---

## مخاطر التغيير

1. **option_values structure غير موحّدة:** المفاتيح قد تكون "اللون" أو "Color" أو "colour" حسب إعداد البائع. الحل: نأخذ أول مفتاح ظاهر بـ `Object.keys(v.option_values ?? {})[0]` بدلاً من hardcode اسم المفتاح.

2. **variants فارغة من الـ API:** `variants?: StoreProductVariant[]` optional — الكود محمي بـ `product.variants && product.variants.length > 1`.

3. **أداء (Performance):** `VariantSwatchStrip` يُعالَج server-side فقط — لا JavaScript إضافي في الـ bundle. الـ `Set` و `Array.from` تُنفَّذ مرة عند SSR.

4. **بطاقات صغيرة (sm/xs):** `flex-wrap` يتعامل مع تجاوز العرض. الـ pills صغيرة (`text-[10px]`) ولن تكسر التخطيط.

5. **ارتفاع البطاقة:** إضافة صف جديد في الـ body يرفع الارتفاع قليلاً. في grids الكتالوج، البطاقات auto-height — لا مشكلة تخطيط. في grids fixed-height إن وُجدت، تأكد من `overflow-hidden` أو `min-h`.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `tailwind.config` / `styles/globals.css`
- `lib/api-server.ts` — البيانات كافية، لا تعديل على الـ types
- `components/product/ProductGrid.tsx` — لا تغيير مطلوب
- `app/[slug]/page.tsx` و `app/[slug]/products/page.tsx` — لا تعديل مطلوب (يستخدمان ProductCard بدون تغيير

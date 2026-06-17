# Spec: نقاط ألوان Variants على ProductCard (صفحات المتجر)

**التاريخ:** 2026-06-17
**المصدر:** Salla Twilight v2.14.420 (carousel nav عبر color options) + Shopify Horizon (native color swatches) — W30
**الأولوية:** عالية — نمط مشترك بين منافسَين رئيسيَّين يُسرّع قرار الشراء دون مغادرة الـ listing

---

## السياق والمبرر

`ProductCard.tsx` يعرض: صورة، شارة مميز، شارة خصم، اسم، سعر. لا يُظهر أي معلومة عن المتغيرات (variants) المتاحة.

`StoreProductCard.variants` موجود في الـ response — يحمل `option_values: Record<string, string>` لكل variant (مثال: `{ "اللون": "أحمر" }`).

كلا المنافسَين (Salla Twilight + Shopify Horizon) يعرضان نقاط ألوان صغيرة أسفل السعر مباشرة. النتيجة: المتسوق يرى الألوان المتاحة بنظرة واحدة دون فتح صفحة المنتج → معدل نقر أعلى على الكتالوج.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `components/product/ProductCard.tsx` — بطاقة المنتج في صفحات المتجر
- `lib/api-server.ts` — `StoreProductCard.variants?: StoreProductVariant[]`

**السلوك الحالي:**
- لا تُعرض أي معلومة عن variants في الـ card
- `product.variants` متاح في النوع لكن غير مستخدم في `ProductCard.tsx`

**بنية البيانات ذات الصلة:**
```typescript
// lib/api-server.ts (قراءة فقط)
type StoreProductVariant = {
  sku?: string | null;
  price?: string | number | null;
  is_active?: boolean;
  option_values?: Record<string, string> | null; // مثال: { "اللون": "أحمر", "الحجم": "L" }
};

type StoreProductCard = {
  // ...
  variants?: StoreProductVariant[];
};
```

---

## التغيير المقترح

### الواجهة (TypeScript)

**لا تغيير على props الـ `ProductCard`** — يكفي `product.variants` الموجود في النوع.

إضافة دالة مساعدة `extractColorSwatches` خارج المكوّن:

```typescript
const COLOR_KEYS = ["اللون", "لون", "color", "Color", "اللون:"];

const COLOR_MAP: Record<string, string> = {
  أحمر: "#EF4444", red: "#EF4444",
  أزرق: "#3B82F6", blue: "#3B82F6",
  أخضر: "#22C55E", green: "#22C55E",
  أسود: "#18181B", black: "#18181B",
  أبيض: "#F8FAFC", white: "#F8FAFC",
  أصفر: "#EAB308", yellow: "#EAB308",
  بني: "#92400E", brown: "#92400E",
  زهري: "#EC4899", pink: "#EC4899",
  بنفسجي: "#A855F7", purple: "#A855F7",
  برتقالي: "#F97316", orange: "#F97316",
  رمادي: "#6B7280", gray: "#6B7280", grey: "#6B7280",
  بيج: "#D4B896", beige: "#D4B896",
  ذهبي: "#F59E0B", gold: "#F59E0B",
  فضي: "#9CA3AF", silver: "#9CA3AF",
  كحلي: "#1E3A5F", navy: "#1E3A5F",
  زيتي: "#4B5320", olive: "#4B5320",
};

function extractColorSwatches(
  variants: StoreProductVariant[] | undefined,
): { color: string; label: string }[] {
  if (!variants?.length) return [];
  const seen = new Set<string>();
  const result: { color: string; label: string }[] = [];
  for (const v of variants) {
    if (!v.option_values || v.is_active === false) continue;
    for (const key of COLOR_KEYS) {
      const val = v.option_values[key];
      if (val && !seen.has(val.toLowerCase())) {
        seen.add(val.toLowerCase());
        result.push({
          label: val,
          color: COLOR_MAP[val] ?? COLOR_MAP[val.toLowerCase()] ?? val,
        });
      }
    }
  }
  return result;
}
```

### مكوّن `VariantSwatches` (داخل نفس الملف)

```typescript
const MAX_SWATCHES = 4;

function VariantSwatches({ swatches, slug, productId }: {
  swatches: { color: string; label: string }[];
  slug: string;
  productId: string | number;
}) {
  if (!swatches.length) return null;
  const visible = swatches.slice(0, MAX_SWATCHES);
  const overflow = swatches.length - MAX_SWATCHES;
  return (
    <div className="flex items-center gap-1.5 pt-1" aria-label="ألوان متاحة">
      {visible.map((s) => (
        <Link
          key={s.label}
          href={`/${slug}/products/${productId}`}
          title={s.label}
          aria-label={s.label}
          className="h-4 w-4 rounded-full border border-slate-300 dark:border-zinc-600 ring-offset-1 transition hover:ring-2 hover:ring-[var(--primary,#10b981)] focus-visible:ring-2 focus-visible:ring-[var(--primary,#10b981)]"
          style={{ backgroundColor: s.color }}
        />
      ))}
      {overflow > 0 ? (
        <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
```

### التكامل في `ProductCard`

```typescript
// داخل store-product-card__body، بعد قسم السعر:
const swatches = extractColorSwatches(product.variants);

// في الـ JSX:
<div className="store-product-card__body space-y-2 p-3">
  <Link href={...}><h3 ...>{product.name}</h3></Link>
  <div className="flex flex-wrap items-center gap-2">
    <span ...>{price.toFixed(0)} ر.س</span>
    {/* compare price */}
  </div>
  <VariantSwatches swatches={swatches} slug={slug} productId={product.id} />
</div>
```

### Variants وحالات الـ states

| الحالة | السلوك المتوقع |
|--------|----------------|
| `variants` غائب أو `[]` | لا تُعرض نقاط — `extractColorSwatches` تُعيد `[]` |
| لا أحد من الـ variants يملك color key | لا تُعرض نقاط |
| كل الـ variants بلون واحد | نقطة واحدة فقط |
| لون غير مُعرَّف في COLOR_MAP | يُستخدم الاسم مباشرة كـ `backgroundColor` (CSS يتعامل معه إن كان اسم لون صالح) |
| أكثر من `MAX_SWATCHES` ألوان | تُعرض أول 4 + نص "+N" |
| `variant.is_active === false` | يُتجاهل الـ variant |
| loading / skeleton | لا تأثير — `ProductCard` لا يعرض skeleton ذاتياً |

---

## معايير القبول

- [ ] نقاط الألوان تظهر فقط إن كان `variants` يحمل خيارات لون (`option_values` يحتوي مفتاحاً من `COLOR_KEYS`)
- [ ] بطاقة منتج بلا variants (أو بلا لون) تظهر كما هي — لا تغيير مرئي
- [ ] الحد الأقصى 4 نقاط ظاهرة؛ النقاط الإضافية تظهر كـ "+N"
- [ ] كل نقطة `Link` يوجه لصفحة المنتج `/${slug}/products/${product.id}`
- [ ] لون البطاقة البيضاء (`أبيض`) يملك حداً `border-slate-300` مرئياً
- [ ] لا تأثير على حالة `discountPct` badge أو `is_featured` badge
- [ ] `VariantSwatches` يُعيد `null` حين لا توجد نقاط — لا `<div>` فارغ
- [ ] لا import جديد خارج `next/link` (المستورد أصلاً في الملف)

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/product/ProductCard.tsx` | **تعديل** — إضافة `extractColorSwatches`، `VariantSwatches`، واستدعاءهما في الـ JSX |

**ملف واحد. لا dependencies جديدة. لا تعديل على API أو types.**

---

## مخاطر التغيير

1. **بيانات غير متاحة في API:** إن كان `getProducts()` لا يُعيد `variants` في list endpoint بشكل افتراضي، لن تظهر النقاط (يُعيد `[]` بصمت). **لا خطأ — يتطلب تحقق يدوي بعد التنفيذ.**

2. **أسماء ألوان غير معروفة:** لون لا يوجد في `COLOR_MAP` يُمرَّر كـ `backgroundColor` مباشرة. CSS يتجاهل القيم غير الصالحة؛ النقطة ستظهر بلون `transparent`. **حل مؤجل:** fallback لنقطة رمادية `#9CA3AF` إن كانت القيمة غير قابلة للتفسير.

3. **أداء:** `extractColorSwatches` تُنفَّذ مرة لكل card في شبكة المنتجات. الشبكة تعرض عادةً 12–50 منتجاً. التعقيد O(variants * COLOR_KEYS) — لا خطر.

4. **RTL/LTR:** النقاط في `flex` مع `gap-1.5` — محايدة للاتجاه، تعمل في كلا الوضعَين.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- `lib/api-server.ts` — النوع `StoreProductCard` يُقرأ فقط، لا تعديل
- tokens في `tailwind.config`
- أي مكوّن خارج `components/product/ProductCard.tsx`
- `app/page.tsx` (ProductTile في الـ marketplace يختلف عن ProductCard في المتاجر — spec منفصل مستقبلاً)

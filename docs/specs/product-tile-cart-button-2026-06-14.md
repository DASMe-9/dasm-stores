# Spec: زر السلة الدائري — ProductTile في marketplace

**التاريخ:** 2026-06-14
**المصدر:** baseline README (زر سلة صغير) + Shopify Dawn trend (W27–W28) + فحص مباشر للكود
**الأولوية:** متوسطة — تأثير بصري عالٍ، جهد منخفض جداً (سطر واحد)

---

## السياق والمبرر

الـ baseline (`marketplace-home.png` + `components-inventory.md`) يُصنّف زر السلة في ProductCard بـ "زر سلة صغير". الاتجاه السائد في Shopify Dawn 11+ ومجتمع مطوري Salla هو زر دائري (`rounded-full`) overlay على الصورة — لا مستطيل ثقيل. الفجوة الحالية: الزر في `ProductTile` (marketplace) يستخدم `rounded-xl`، ما يجعله مستطيلاً ناعم الزوايا بدلاً من دائري حقيقي.

تقرير W27 (سطر "يُعزز قرار جعل زر السلة دائرياً") يوثّق هذا النمط المنافس. بقي التصحيح معلقاً جولتين.

---

## الحالة الراهنة في dasm-stores

**الملف:** `app/page.tsx`

داخل `function ProductTile` (السطر ~115):

```tsx
<Link
  href={`/${product.storeSlug}/cart`}
  className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-600 hover:text-white"
  aria-label={`فتح سلة ${product.storeName}`}
>
  <ShoppingCart className="h-4 w-4" />
</Link>
```

المشكلة: `rounded-xl` يُنتج شكلاً مستطيلاً ذا زوايا — لا دائرة حقيقية.

---

## التغيير المقترح

### تعديل `app/page.tsx` — السطر ~115

**قبل:**
```tsx
className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 ..."
```

**بعد:**
```tsx
className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 ..."
```

تغيير وحيد: `rounded-xl` → `rounded-full`

---

## الواجهة (لا تغيير — مكوّن Server موجود)

```typescript
// لا props جديدة — تغيير CSS فقط
function ProductTile({ product }: { product: FeaturedProduct }): JSX.Element
```

---

## Variants

| الـ variant | الوصف | التطبيق |
|-------------|-------|---------|
| الافتراضي (فاتح) | دائرة خضراء فاتحة `bg-emerald-50` | موجود |
| Dark mode | دائرة `bg-emerald-500/10` | موجود — لا تغيير مطلوب |
| hover | دائرة خضراء داكنة مع أيقونة بيضاء | موجود — لا تغيير مطلوب |

---

## سلوك states

| الحالة | المظهر |
|--------|--------|
| عادي | دائرة `h-9 w-9` خضراء فاتحة |
| hover | `bg-emerald-600 text-white` |
| loading (لا ينطبق) | السلة صفحة مستقلة — لا loading state في الزر |
| error (لا ينطبق) | Link — يُعيد التوجيه دائماً |

---

## معايير القبول

- [ ] الزر دائري بصرياً (يبدو كدائرة كاملة لا مستطيل)
- [ ] الأبعاد `h-9 w-9` محفوظة بدون تغيير
- [ ] Dark mode لا يختلف (class الـ dark موجود بالفعل)
- [ ] hover state يعمل كما هو
- [ ] aria-label محفوظ بدون تغيير
- [ ] لا تغيير في سلوك الـ Link أو المسار

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `app/page.tsx` | **تعديل** — سطر واحد: `rounded-xl` → `rounded-full` داخل `ProductTile` |

لا ملفات إضافية مطلوبة.

---

## مخاطر التغيير

**منخفضة جداً.** التغيير تجميلي بحت:
1. لا تغيير في الأبعاد أو الـ layout
2. لا تغيير في المسار أو السلوك
3. لا تأثير على TypeScript أو types
4. الـ dark mode يعمل بالفعل مع الشكل الدائري

الخطر الوحيد المحتمل: إذا كانت شبكة المنتجات ذات أعمدة ضيقة جداً (mobile 2-col)، الزر `h-9 w-9` مناسب — الدائرية لا تُضيق المساحة.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- `components/product/ProductCard.tsx` (مكوّن مختلف — store pages)
- أي ملف theme أو tokens

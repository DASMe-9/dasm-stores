# Spec: زر Quick-Add سلة دائري — ProductCard في صفحات المتاجر

**التاريخ:** 2026-06-15
**المصدر:** baseline README + Shopify Dawn circular button pattern (W27/W28) + تحليل الكود
**الأولوية:** عالية — الـ baseline يُصرّح بزر سلة في ProductCard، والـ marketplace ProductTile يملكه بالفعل (لكن بشكل مستطيل)

---

## السياق والمبرر

الـ baseline (`subdomain-store.png` + README) يُصرّح: *"صف ProductCard مع مفضلة"* — والمرافق البصري لزر المفضلة في كل منافس رئيسي هو **زر السلة الدائري** على نفس البطاقة.

`app/page.tsx` (marketplace) يحتوي فعلاً على زر سلة في `ProductTile` (السطر 115):
```tsx
<Link href={`/${product.storeSlug}/cart`}
  className="grid h-9 w-9 place-items-center rounded-xl ...">
  <ShoppingCart className="h-4 w-4" />
</Link>
```
لكنه `rounded-xl` لا `rounded-full`، وغائب كلياً عن `components/product/ProductCard.tsx` المستخدَم في صفحات المتاجر الفرعية.

Shopify Dawn 11+ وSalla theme-raed كلاهما استقرّا على زر **دائري كامل** (`rounded-full`) كـ overlay على صورة المنتج — نمط موثّق في W27 وW28.

---

## الحالة الراهنة في dasm-stores

**الملف الرئيسي:** `components/product/ProductCard.tsx`

```
store-product-card__media (relative aspect-square)
  └── ProductImage
  └── badge "مميز" (absolute top-2 right-2)
  └── badge "خصم X%" (absolute top-2 left-2)
  // ❌ لا زر سلة

store-product-card__body
  └── اسم المنتج (link)
  └── السعر ر.س + سعر مشطوب
  // ❌ لا زر سلة
```

**الاستخدامات:**
- `app/[slug]/page.tsx` ← `ProductGrid` ← `ProductCard`
- `app/[slug]/products/page.tsx` ← `ProductGrid` ← `ProductCard`
- `app/[slug]/category/[categorySlug]/page.tsx` ← `ProductGrid` ← `ProductCard`

---

## التغيير المقترح

### 1. تعديل `components/product/ProductCard.tsx`

داخل `store-product-card__media`، أضف زر سلة دائري بعد شارات المميز/الخصم الحالية:

```tsx
{/* داخل <div className="store-product-card__media relative aspect-square ..."> */}

{/* الموجود حالياً */}
<ProductImage src={imageUrl} alt={productImageAlt(product)} />
{product.is_featured ? (
  <span className="absolute top-2 right-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
    مميز
  </span>
) : null}
{discountPct ? (
  <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
    خصم {discountPct}%
  </span>
) : null}

{/* جديد: زر السلة الدائري */}
<Link
  href={`/${slug}/cart`}
  aria-label="أضف للسلة"
  className="
    absolute bottom-2 right-2
    flex h-8 w-8 items-center justify-center
    rounded-full
    bg-white/85 backdrop-blur-sm
    shadow-sm
    text-[var(--foreground)]
    opacity-0 group-hover:opacity-100
    transition-opacity duration-200
    hover:bg-[var(--primary)] hover:text-white
  "
  onClick={(e) => e.stopPropagation()}
>
  <ShoppingCart className="h-4 w-4" />
</Link>
```

### 2. الموضع

```
product image
┌──────────────────────┐
│  [مميز ▲]  [خصم% ▲]  │  ← top-2 right/left (موجود)
│                      │
│                      │
│           [💛] [🛒]  │  ← bottom-2 left (wishlist) + bottom-2 right (cart)
└──────────────────────┘
```

- `WishlistButton` (من spec 2026-06-12): `absolute bottom-2 left-2`
- زر السلة: `absolute bottom-2 right-2`

المسافة بين الزرين تمنع التداخل وتُبرز الزوج البصري بشكل متوازن.

### 3. TypeScript signature المُعدَّل

لا تغيير في الـ props — يستخدم `slug` الموجود مسبقاً وينشئ `href` ثابتاً للسلة.

**ملاحظة:** في هذه المرحلة الزر يُوجّه لصفحة `/{slug}/cart` (نفس أسلوب marketplace ProductTile). إضافة "add to cart" فعلية عبر Zustand store مؤجّلة لـ spec مستقل.

---

## States

| الحالة | السلوك |
|--------|--------|
| idle (لا hover) | `opacity-0` — الزر مخفي |
| hover على البطاقة (`group-hover`) | `opacity-100` — يظهر الزر |
| hover مباشرة على الزر | `bg-[var(--primary)] text-white` |
| النقر | يوجّه لـ `/{slug}/cart` |

---

## معايير القبول

- [ ] زر سلة دائري (`rounded-full h-8 w-8`) ظاهر في الزاوية اليمنى السفلية لصورة المنتج
- [ ] مخفي افتراضياً (`opacity-0`)، يظهر عند hover على البطاقة (`group-hover:opacity-100`)
- [ ] النقر يُوجّه لـ `/${slug}/cart`
- [ ] `aria-label="أضف للسلة"` على الزر
- [ ] `e.stopPropagation()` يمنع اختراق الـ `<Link>` الأم للبطاقة
- [ ] لا تداخل مع شارة "مميز" (top-right) ولا مع `WishlistButton` (bottom-left)
- [ ] الزر يُغيّر لون الخلفية لـ `var(--primary)` عند hover عليه مباشرة
- [ ] متجاوب — يعمل على موبايل بدون hover (يظهر دائماً على touch devices بـ `@media (hover: none)`)

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/product/ProductCard.tsx` | **تعديل** — إضافة `<Link>` زر سلة + import `ShoppingCart` من `lucide-react` |

ملاحظة: `ShoppingCart` مستورد مسبقاً في `app/page.tsx` — تأكّد من إضافة الـ import في `ProductCard.tsx` إن لم يكن موجوداً.

---

## مخاطر التغيير

1. **`<Link>` داخل `<Link>`:** الزر `<Link href="/{slug}/cart">` موجود داخل `<article>` لا داخل `<Link>` آخر — لا تداخل في DOM. (الـ `<Link>` الأم في `store-product-card__link` تلفّ `store-product-card__media` فقط، لا الـ `article` كاملاً.) تحقّق من هذا في الكود الفعلي قبل التنفيذ.

2. **Touch devices:** `group-hover` لا يعمل على اللمس. يُوصى بإضافة:
   ```css
   @media (hover: none) {
     .store-product-card__cart-btn { opacity: 1; }
   }
   ```
   أو استخدام `sm:opacity-0 sm:group-hover:opacity-100` مع `opacity-100` كافتراض.

3. **article className (`cardClass`):** مُشتَق من `productCardClassName(cardStyle)` في `lib/themes/`. تأكّد أن `group` موجود في الـ class أو أضفه لـ `<article>` لتفعيل `group-hover`.

4. **`e.stopPropagation()`:** يتطلب `'use client'` إن أُضيف كـ inline handler. بديل أنظف: لفّ الزر في Client Component صغير `CartLinkButton` مشابه لـ `WishlistButton`.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `tailwind.config`
- `lib/themes/product-card-class.ts` أو أي ملف theme

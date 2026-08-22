# تقرير انحراف بصري — baseline-drift-2026-07-25

**تاريخ التشغيل:** 2026-07-25 (جولة أسبوعية — السبت)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**يوجد drift جديد — 3 انحرافات بصرية في `components/product/ProductCard.tsx`** ناتجة عن كوميت توكين رفاكتور (`8b42fda` — 2026-06-27). التغييرات الثلاثة تمس مظهر بطاقات المنتج في صفحات المتاجر الفرعية مقارنةً بالـ baseline.

**قرار المرحلة:** drift موجود → تقرير drift + إيقاف. لا تكملة للمرحلتين 2 و3 هذه الجولة.

---

## الكوميتات الجديدة التي مسّت ملفات الـ baseline (2026-06-16 → 2026-07-25)

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx` | **drift — 3 انحرافات** |
| `56ee40c` | 2026-06-25 | drop "cart emptied" banner | `components/store/StoreChrome.tsx` | إزالة بانر amber مؤقت — تحسين، لا تراجع |
| `2a4698d` | 2026-06-17 | builder gate for store pages | `app/[slug]/page.tsx` | المتاجر غير الـ builder تبقى كالـ baseline |
| `5f7bf39` | 2026-06-17 | remove duplicate advertise banner | `app/page.tsx` | إزالة ازدواجية — تحسين، لا تراجع |
| `9a7dab5`/`d3ece4c` | 2026-06-27 | social login auth flow | `pages/auth/` | تدفق مصادقة — خارج نطاق baseline |

لم يُلمس أي من: `app/page.tsx` (Hero)، `components/explore/StoreCard.tsx`، `components/home/HomeHeaderActions.tsx`.

---

## الانحراف الأول — نسبة أبعاد صورة بطاقة المنتج (حرج بصري)

**الملف:** `components/product/ProductCard.tsx` — السطر 27
**الكوميت:** `8b42fda` (2026-06-27)

### الحالة في الـ baseline
بطاقة المنتج في صفحات المتاجر الفرعية تعرض صورة **مربعة** (`aspect-square` = نسبة 1:1).

### الحالة الحالية في الكود
```tsx
<div className="store-product-card__media relative aspect-[4/5] bg-[var(--c-surface-2)]">
```
النسبة أصبحت **4:5** (portrait — أطول من العرض). كل بطاقات المنتج في المتاجر الفرعية أصبحت بشكل عمودي.

### الوصف البصري
الـ baseline يُظهر بطاقات منتج ذات صورة مربعة تحاذي جميع البطاقات أفقياً في الشبكة. الكود الحالي ينتج صوراً أطول بنسبة 25%، مما يغير ديناميكية الشبكة وتوزيع المساحة البصرية.

### توصية الاسترجاع
```tsx
// السطر 27 — يُعدَّل من:
<div className="store-product-card__media relative aspect-[4/5] bg-[var(--c-surface-2)]">
// إلى:
<div className="store-product-card__media relative aspect-square bg-[var(--c-surface-2)]">
```
> **ملاحظة:** إذا كانت نسبة 4:5 قراراً تصميمياً مقصوداً، يجب تحديث ملف الـ baseline بدلاً من الرجوع إلى `aspect-square`.

---

## الانحراف الثاني — شارة "مميز" من solid amber إلى glassmorphism

**الملف:** `components/product/ProductCard.tsx` — السطر 33-35
**الكوميت:** `8b42fda` (2026-06-27)

### الحالة في الـ baseline
شارة "مميز" على بطاقة المنتج كانت لون خلفية **أصفر-برتقالي صلب** (`bg-amber-500`) مع نص أبيض — بارزة وواضحة على الصورة.

### الحالة الحالية في الكود
```tsx
<span className="absolute right-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-accent)] shadow-[var(--shadow-sm)] backdrop-blur">
  مميز
</span>
```
الشارة أصبحت **glassmorphism** (خلفية شفافة 88% + blur + حدود رفيعة + لون accent). يجعلها أخف وأقل وضوحاً، خاصة على صور ذات خلفية فاتحة.

### الوصف البصري
الـ baseline يُظهر شارة "مميز" بلون amber صلب فوق الصورة — سهلة القراءة وبارزة. الكود الحالي ينتج شارة شبه شفافة تندمج مع الصورة وقد تُفقد الوضوح على خلفيات فاتحة.

### توصية الاسترجاع
```tsx
// السطر 33 — يُعدَّل من:
<span className="absolute right-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-accent)] shadow-[var(--shadow-sm)] backdrop-blur">
// إلى:
<span className="absolute right-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-amber-500 px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-white">
```
> **بديل:** إبقاء glassmorphism مع ضمان `text-[var(--c-accent)]` له contrast كافٍ — لكن يتطلب تحديث baseline.

---

## الانحراف الثالث — شارة الخصم من solid red إلى subtle toned

**الملف:** `components/product/ProductCard.tsx` — السطر 38-40
**الكوميت:** `8b42fda` (2026-06-27)

### الحالة في الـ baseline
شارة الخصم "خصم X%" كانت **أحمر صلب** (`bg-red-500 text-white`) — عالية الوضوح وتلفت الانتباه.

### الحالة الحالية في الكود
```tsx
<span className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-sale)]">
  خصم {discountPct}%
</span>
```
خلفية الشارة أصبحت **12% من لون c-sale** فقط (شفافية عالية) مع نص بلون c-sale. أقل ظهوراً وأكثر دمجاً مع خلفية الصورة.

### الوصف البصري
الـ baseline يُظهر شارة خصم حمراء صلبة تلفت نظر المتسوق فوراً. الكود الحالي ينتج شارة خافتة هادئة تتناسب مع الـ design system لكنها أقل جذباً للانتباه — قد يؤثر على نسبة النقر على منتجات الخصم.

### توصية الاسترجاع
```tsx
// السطر 38 — يُعدَّل من:
<span className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-sale)]">
// إلى:
<span className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-red-500 px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-white">
```
> **بديل:** تعديل نسبة الـ color-mix إلى 80-100% لتحقيق ظهور أقوى ضمن الـ token system.

---

## ملخص الانحرافات الجديدة

| المكوّن | السطر | العنصر | الحالة السابقة (baseline) | الحالة الحالية | خطورة | الكوميت |
|---------|-------|--------|---------------------------|----------------|--------|---------|
| ProductCard (store) | 27 | نسبة أبعاد الصورة | `aspect-square` (1:1) | `aspect-[4/5]` (portrait) | 🔴 عالية | `8b42fda` |
| ProductCard (store) | 33 | شارة "مميز" | Solid amber / نص أبيض | Glassmorphism / backdrop-blur | 🟡 متوسطة | `8b42fda` |
| ProductCard (store) | 38 | شارة الخصم | Solid red / نص أبيض | Color-mix 12% + token text | 🟡 متوسطة | `8b42fda` |

---

## حالة الفجوات البصرية المستمرة (لا تغيير)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## الخطوة المطلوبة

**قرار مطلوب من الفريق لكل انحراف:**
1. **نسبة الأبعاد 4:5:** هل هو قرار تصميمي مقصود (portrait cards)؟ إن نعم → تحديث baseline. إن لا → `aspect-square` في السطر 27.
2. **شارات Glassmorphism:** هل تتوافق مع baseline المحدَّث؟ إن لا → إعادة الألوان الصلبة أو تعديل نسبة color-mix.

حين يُتخذ القرار، يتولى Cursor تنفيذ الاسترجاع أو يُحدَّث ملف الـ baseline في `docs/design/baseline/`.

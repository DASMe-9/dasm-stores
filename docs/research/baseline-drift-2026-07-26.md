# تقرير انحراف بصري — baseline-drift-2026-07-26

**تاريخ التشغيل:** 2026-07-26 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد آنذاك)

---

## ملخص تنفيذي

**يوجد drift جديد.** كوميت `8b42fda` (2026-06-27) أجرى إعادة هيكلة بصرية على `ProductCard.tsx`
بالانتقال إلى نظام design tokens — وأحدث ثلاثة انحرافات قابلة للقياس عن الـ baseline.

**قرار المرحلة:** انحراف مانع → لا تُكتمل المرحلة 3 (spec). يُحال للمراجعة.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملفات ذات الصلة بالـ baseline | التأثير البصري |
|---------|---------|-------|----------------------------------|----------------|
| `8b42fda` | 2026-06-27 | `[codex] refactor storefront components to tokens` | `components/product/ProductCard.tsx` | **drift — انظر المرحلة 1** |
| `56ee40c` | 2026-06-25 | `fix(storefront): drop cart emptied banner` | `components/store/StoreChrome.tsx` | إزالة banner UX — خارج نطاق baseline المتسوق |
| `5f7bf39` | 2026-06-17 | `fix(marketplace): remove duplicate advertise banner` | `app/page.tsx` | إزالة بانر مكرر — لا تأثير على baseline الأصلي |
| `2a4698d` | قبل 2026-06-17 | `feat(storefront): phase 4c — visual builder hybrid` | `app/[slug]/page.tsx` | Conditional builder path — لا تغيير على fallback layout |

---

## الانحرافات الجديدة — المكوّن: `ProductCard` (صفحات المتاجر الفرعية)

**الملف:** `components/product/ProductCard.tsx`
**الكوميت المُحدِث:** `8b42fda` بتاريخ 2026-06-27

### 1. نسبة عرض/ارتفاع صورة المنتج

| | الحالة السابقة | الحالة الحالية |
|-|----------------|----------------|
| **الكود (السطر 27)** | `aspect-square` | `aspect-[4/5]` |
| **الأثر البصري** | صور منتجات مربعة 1:1 | صور بورتريت أطول 4:5 |
| **الملف + السطر** | `components/product/ProductCard.tsx:27` | نفسه |

**وصف بصري:** شبكة المنتجات في المتجر الفرعي أصبحت تعرض صوراً أطول عمودياً بدلاً من الصور المربعة التي يُرجَّح أنها ظاهرة في لقطة الـ baseline.

**توصية الاسترجاع (كتوصية فقط):**
```
السطر 27 الحالي:
  <div className="store-product-card__media relative aspect-[4/5] bg-[var(--c-surface-2)]">

يصبح:
  <div className="store-product-card__media relative aspect-square bg-[var(--c-surface-2)]">
```
⚠️ *تحتاج مراجعة بشرية مقارنة بـ `docs/design/baseline/subdomain-store.png` للتأكد من أن baseline يُظهر صوراً مربعة فعلاً.*

---

### 2. شارة «مميز» — من solid amber إلى glass token

| | الحالة السابقة | الحالة الحالية |
|-|----------------|----------------|
| **الكود (السطر 33)** | `rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white` | `rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] ... text-[var(--c-accent)] shadow backdrop-blur` |
| **الأثر البصري** | pill أصفر/بني داكن صلب | badge شفافة بحدود مع تمويه خلفية (glassmorphism) |
| **الملف + السطر** | `components/product/ProductCard.tsx:33` | نفسه |

**وصف بصري:** الشارة انتقلت من لون صلب (amber-500 أبيض النص) إلى تصميم زجاجي يعتمد على لون الـ accent للثيم. التأثير مختلف بصرياً عن الـ baseline وقد يتباين باختلاف ثيم كل متجر.

**توصية الاسترجاع (كتوصية فقط):**
```
السطر 33 الحالي — className شارة is_featured:
  rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)]
  px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-accent)] shadow-[var(--shadow-sm)] backdrop-blur

يصبح:
  rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white
```

---

### 3. شارة الخصم — من solid red إلى glass token

| | الحالة السابقة | الحالة الحالية |
|-|----------------|----------------|
| **الكود (السطر 38)** | `rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white` | `rounded-[var(--r-pill)] bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] ... text-[var(--c-sale)]` |
| **الأثر البصري** | pill أحمر صلب بنص أبيض | badge شفافة بلون sale المخفف |
| **الملف + السطر** | `components/product/ProductCard.tsx:38` | نفسه |

**وصف بصري:** شارة الخصم انتقلت من pill أحمر صلب مباشر إلى لون شفاف مرتبط بمتغير `--c-sale` للثيم. واضح وقابل للقراءة لكنه أقل حدة بصرياً.

**توصية الاسترجاع (كتوصية فقط):**
```
السطر 38 الحالي — className شارة discountPct:
  rounded-[var(--r-pill)] bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))]
  px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-sale)]

يصبح:
  rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white
```

---

## حالة الفجوات البصرية المستمرة من الجولات السابقة (لا تغيير)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| Header (guest) | زر "افتح متجرك" | **غائب** | محل `home-header-seller-cta-2026-06-16.md` — ينتظر Cursor |

---

## الانحرافات الجديدة هذه الجولة — ملخص للمراجعة

| # | الملف | السطر | العنصر | نوع الانحراف |
|---|-------|--------|---------|--------------|
| 1 | `components/product/ProductCard.tsx` | 27 | aspect ratio صورة المنتج | `aspect-square` → `aspect-[4/5]` |
| 2 | `components/product/ProductCard.tsx` | 33 | شارة «مميز» | solid amber → glass token |
| 3 | `components/product/ProductCard.tsx` | 38 | شارة الخصم | solid red → glass token |

**المطلوب:** مراجعة بشرية مقارنة بـ `docs/design/baseline/subdomain-store.png` للبت في:
- هل aspect-[4/5] أقرب للـ baseline من aspect-square؟
- هل التصميم الزجاجي مقبول كتطور بصري أم يُعاد إلى solid كما في الـ baseline؟

---

## الخطوة التالية

لا spec هذه الجولة (drift مانع موجود). تكتمل المرحلة 2 فقط.
المراجعة البشرية مطلوبة قبل إغلاق هذه الانحرافات أو اعتمادها.

# تقرير انحراف بصري — baseline-drift-2026-07-05

**تاريخ التشغيل:** 2026-07-05 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**وُجد drift جديد** — commit `8b42fda` (2026-06-27، PR #208) أعاد هيكلة `components/product/ProductCard.tsx` للاعتماد على design tokens. التغييرات بصرية مؤثرة تمس صفحة المتجر الفرعي (`subdomain-store.png`):

1. نسبة الصورة تغيرت من مربعة (1:1) إلى صورية (4:5)
2. شارة «مميز» انتقلت من أسلوب solid amber إلى frosted/glass
3. شارة الخصم انتقلت من solid red إلى تدرج شفاف

**قرار المرحلة:** drift موثّق → تكتمل المرحلة 2 (استخبارات منافسين) دون المرحلة 3 (spec).

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | التأثير البصري |
|---------|---------|-------|----------------|
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens (PR #208) | **drift — مفصّل أدناه** |
| `b95d2b6` | 2026-06-27 | [codex] add storefront theme tokens | tokens جديدة — لا تأثير بصري مباشر |
| `5f7bf39` | ~2026-06-20 | fix(marketplace): remove duplicate advertise banner (#181) | حذف قسم مكرر — إصلاح، لا drift |
| `2a4698d` | ~2026-06-19 | feat(storefront): phase 4c — visual builder hybrid (#180) | إضافة مسار builder لصفحة المتجر — الـ default layout بقي سليماً |

---

## تفاصيل الـ Drift

### 1. نسبة صورة المنتج — `components/product/ProductCard.tsx` سطر 27

| | القيمة |
|--|--------|
| **الملف** | `components/product/ProductCard.tsx` |
| **السطر** | 27 |
| **الكوميت** | `8b42fda` |
| **قبل** | `aspect-square` (1:1 — مربعة) |
| **بعد** | `aspect-[4/5]` (نسبة صورية أطول) |
| **الأثر** | بطاقة المنتج في صفحات المتجر الفرعي أصبحت أطول — تختلف عن baseline `subdomain-store.png` |
| **الانطباق على الـ baseline** | `subdomain-store.png` — بطاقات المنتج في الشبكة |

**توصية الاسترجاع (فقط — لا تنفّذ):**
```tsx
// السطر 27 في components/product/ProductCard.tsx
// الحالي:
<div className="store-product-card__media relative aspect-[4/5] bg-[var(--c-surface-2)]">
// المقترح للاسترجاع:
<div className="store-product-card__media relative aspect-square bg-[var(--c-surface-2)]">
```
*ملاحظة: `aspect-[4/5]` هو نمط سائد في Salla وZid — يُنصح بمناقشة تحديث الـ baseline بدلاً من الاسترجاع.*

---

### 2. شارة «مميز» — `components/product/ProductCard.tsx` سطر 33

| | القيمة |
|--|--------|
| **الملف** | `components/product/ProductCard.tsx` |
| **السطر** | 33 |
| **الكوميت** | `8b42fda` |
| **قبل** | `rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white` |
| **بعد** | `rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-accent)] shadow-[var(--shadow-sm)] backdrop-blur` |
| **الأثر** | الشارة انتقلت من لون ثابت أصفر-برتقالي مع نص أبيض إلى أسلوب frosted/glass متكيّف مع Theme المتجر |
| **الانطباق على الـ baseline** | `subdomain-store.png` — شارة «مميز» على البطاقة |

**توصية:**
الأسلوب الجديد (glass/frosted) متسق مع نظام الـ tokens ومع التوجه التصميمي العام. يُنصح بتحديث الـ baseline لتعكس هذا الأسلوب بدلاً من الاسترجاع.

---

### 3. شارة الخصم — `components/product/ProductCard.tsx` سطر 37

| | القيمة |
|--|--------|
| **الملف** | `components/product/ProductCard.tsx` |
| **السطر** | 37 |
| **الكوميت** | `8b42fda` |
| **قبل** | `rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white` |
| **بعد** | `rounded-[var(--r-pill)] bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-sale)]` |
| **الأثر** | الشارة انتقلت من solid red إلى خلفية sale-tinted فاتحة مع نص ملوّن — الوزن البصري أخف |
| **الانطباق على الـ baseline** | `subdomain-store.png` — شارة الخصم على البطاقة |

**توصية:**
الأسلوب الجديد يتكيّف مع color tokens المتجر — مناسب لمنصة multi-tenant. يُنصح بتحديث الـ baseline.

---

## الفجوات البصرية المستمرة (من تقارير سابقة)

| المكوّن | العنصر | الحالة في الكود | الحالة |
|---------|--------|-----------------|--------|
| ProductTile (marketplace) | شارة «ممول» | غائب | ينتظر Cursor — `product-tile-wishlist-2026-06-11.md` |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` | ينتظر Cursor — `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب | غائب | ينتظر Cursor — `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store) | أيقونة قلب | غائب | ينتظر Cursor — `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | غائب | ينتظر Cursor — `store-info-trust-badges-2026-06-08.md` |
| Store (mobile) | Sticky Cart Bar | غائب | ينتظر Cursor — `sticky-mini-cart-bar-2026-06-15.md` |

---

## التوصية الفورية

1. **مراجعة الـ baseline**: الـ drift في `ProductCard.tsx` ناتج عن قرار تصميمي مقصود (PR #208 — design tokens). الأسلوب الجديد متسق مع التوجه العام. يُوصى بتحديث `docs/design/baseline/subdomain-store.png` لتعكس الحالة الراهنة.
2. **إبلاغ الفريق**: الـ aspect-ratio تغيّر من 1:1 إلى 4:5 — قرار مؤثر يستحق تأكيداً صريحاً من صاحب المنتج قبل إغلاق الـ baseline.
3. **Phase 3 معلّقة**: لن يُولَّد spec جديد هذه الجولة ريثما يتأكد الفريق من الـ baseline المحدّث.

# تقرير انحراف بصري — baseline-drift-2026-07-15

**تاريخ التشغيل:** 2026-07-15 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**تاريخ تجميد الـ baseline:** 2026-06-07
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

**تم رصد drift جديد في `components/product/ProductCard.tsx`** — ثلاثة انحرافات بصرية متفاوتة الأثر نتجت عن الـ tokens refactor بتاريخ 2026-06-27 (كوميت `8b42fda`). الـ drift مانع: **لا تكملة للمراحل 2–4 هذه الجولة**.

---

## الكوميتات الجديدة منذ 2026-06-16

| الكوميت | التاريخ | الوصف | الملفات المتأثرة |
|---------|---------|-------|-----------------|
| `5f7bf39` | 2026-06-17 | إصلاح: حذف بانر "أعلن الآن" المكرر في الصفحة الرئيسية | `app/page.tsx` |
| `2a4698d` | قبل 2026-06-16 | feat: visual builder هجين في الـ storefront | `app/[slug]/page.tsx` |
| `8f7b63b` | 2026-06-21 | feat: تصميم Salla-style على landing المتجر | `components/storefront/StorefrontBlocks.tsx` |
| `8b42fda` | 2026-06-27 | refactor: ترحيل tokens في مكوّنات الـ storefront | `components/product/ProductCard.tsx` + 11 ملفاً آخر |

الكوميتات `5f7bf39`، `2a4698d`، `8f7b63b` لا تمسّ الـ baseline البصري للمتسوق.
الكوميت `8b42fda` أحدث ثلاثة انحرافات موثّقة أدناه.

---

## الانحرافات الجديدة

### 1. نسبة الصورة في ProductCard — HIGH

| البند | التفصيل |
|-------|---------|
| **الملف** | `components/product/ProductCard.tsx` |
| **السطر** | 27 |
| **الكوميت** | `8b42fda` — 2026-06-27 |
| **الـ baseline** | `aspect-square` (مربع — متوافق مع baseline 2026-06-07) |
| **الحالة الحالية** | `aspect-[4/5]` (بورتريه أطول بنسبة 25%) |
| **الأثر البصري** | بطاقات المنتجات في صفحات المتاجر الفرعية أصبحت أطول عمودياً. الشبكة تبدو أكثر ضيقاً، وتتعارض مع نسب الصور الواردة في الـ baseline |
| **توصية الاسترجاع** | السطر 27: `<div className="store-product-card__media relative aspect-square bg-[var(--c-surface-2)]">` |

---

### 2. شارة "مميز" في ProductCard — MEDIUM

| البند | التفصيل |
|-------|---------|
| **الملف** | `components/product/ProductCard.tsx` |
| **السطر** | 33 |
| **الكوميت** | `8b42fda` — 2026-06-27 |
| **الـ baseline** | شارة صلبة كاملة: `rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white` |
| **الحالة الحالية** | شارة شفافة مع backdrop-blur: `rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] … text-[var(--c-accent)] shadow-[var(--shadow-sm)] backdrop-blur` |
| **الأثر البصري** | الشارة انتقلت من علامة بصرية واضحة (amber صلب) إلى مظهر شفاف/زجاجي. على خلفيات فاتحة قد يصعب رؤيتها. الـ baseline يحدد "شارة رعاية بلون تركواز واضح" |
| **توصية الاسترجاع** | السطر 33: `<span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">` |

> **ملاحظة:** الاسترجاع الكامل لـ `amber-500` قد لا يتوافق مع tokens الجديدة. البديل المقبول: `bg-[var(--c-accent)] text-[var(--c-surface)] rounded-full` (صلب بدون backdrop-blur) بشرط ألا يتغير اللون عن amber/teal على القيم الافتراضية للـ token.

---

### 3. شارة "خصم %" في ProductCard — LOW

| البند | التفصيل |
|-------|---------|
| **الملف** | `components/product/ProductCard.tsx` |
| **السطر** | 38 |
| **الكوميت** | `8b42fda` — 2026-06-27 |
| **الـ baseline** | شارة حمراء صلبة: `rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white` |
| **الحالة الحالية** | شارة شفافة: `rounded-[var(--r-pill)] bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] … text-[var(--c-sale)]` |
| **الأثر البصري** | شارة الخصم أقل وضوحاً بصرياً، خاصةً على خلفيات الصور المضيئة. الـ baseline لم ينص على شارة خصم بشكل صريح لكن الإرشادات العامة تفترض تمييزاً واضحاً لقيمة الخصم |
| **توصية الاسترجاع** | السطر 38: `<span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">` |

---

## جدول الفجوات المستمرة (لم تتغير حالتها)

| المكوّن | العنصر | الحالة | القرار |
|---------|--------|--------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة `rounded-full` | `rounded-xl` في الكود | ينتظر Cursor — spec `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب | **غائب** | ينتظر Cursor — spec `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store) | أيقونة قلب | **غائب** | ينتظر Cursor — spec `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | **غائب** | ينتظر Cursor — spec `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | ينتظر Cursor — spec `sticky-mini-cart-bar-2026-06-15.md` |

---

## الخطوات المطلوبة

1. **الإجراء الفوري (بشري):** مراجعة الانحراف رقم 1 (نسبة الصورة) مع محمد الزهراني — هل يتم اعتماد `aspect-[4/5]` كـ baseline update جديد أم الاسترجاع لـ `aspect-square`؟
2. **إجراء Cursor:** تطبيق توصيات الاسترجاع للانحرافين 2 و3 (الشارات) إن لم يُعتمد الـ token الجديد — أو توثيق الـ token كـ baseline update رسمي.
3. **الجولة القادمة:** تكملة المرحلتين 2 و3 (منافسون + spec) بعد تسوية هذا الـ drift.

# تقرير انحراف بصري — baseline-drift-2026-07-13

**تاريخ التشغيل:** 2026-07-13 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**⚠️ انحراف بصري جديد مؤكد.** كوميت واحد (8b42fda، 2026-06-27) غيّر ثلاثة عناصر بصرية
في `ProductCard.tsx` تخرج عن الـ baseline المجمّد. القرار المطلوب: قبول التغييرات كـ baseline
جديد أو استرجاعها.

**قرار المرحلة:** drift موجود → توقف قبل المرحلة 2 حسب البروتوكول.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملفات البصرية المتأثرة |
|---------|---------|-------|--------------------------|
| `8b42fda` | 2026-06-27 | `[codex] refactor storefront components to tokens` | `components/product/ProductCard.tsx` + 11 ملف آخر |
| `56ee40c` | 2026-06-25 | `fix(storefront): drop the intrusive "cart emptied" banner` | `components/store/StoreChrome.tsx` — خارج نطاق baseline |
| `5f7bf39` | 2026-06-17 | `fix(marketplace): remove duplicate advertise banner` | `app/page.tsx` — يُصحّح انحرافاً سابقاً (بانر مضاعف) |
| `2a4698d` | 2026-06-17 | `feat(storefront): phase 4c — public storefront renders the visual builder` | `app/[slug]/page.tsx` — مسار تصيير جديد مشروط |

---

## الانحرافات البصرية الجديدة

### 1. نسبة أبعاد بطاقة المنتج — `aspect-square` → `aspect-[4/5]`

| التفصيل | القيمة |
|---------|--------|
| الملف | `components/product/ProductCard.tsx`، السطر 27 |
| الكوميت | `8b42fda`، 2026-06-27 |
| **قبل** | `aspect-square` — صورة مربعة (1:1) |
| **بعد** | `aspect-[4/5]` — صورة عمودية (0.8:1) |
| انطباق الـ baseline | `subdomain-store.png` يُظهر بطاقات بنسبة مربعة في شبكة المنتجات |
| الشدة | **متوسطة** — يؤثر على نسب جميع بطاقات المنتج في صفحات المتاجر |

**توصية الاسترجاع (توصية فقط — لا تُنفَّذ):**
```diff
- <div className="store-product-card__media relative aspect-[4/5] bg-[var(--c-surface-2)]">
+ <div className="store-product-card__media relative aspect-square bg-[var(--c-surface-2)]">
```
**أو:** تحديث الـ baseline ليعكس `aspect-[4/5]` كخيار تصميمي معتمد.

---

### 2. شارة "مميز" — تحويل من ألوان صلبة إلى glassmorphism

| التفصيل | القيمة |
|---------|--------|
| الملف | `components/product/ProductCard.tsx`، السطر 33 |
| الكوميت | `8b42fda`، 2026-06-27 |
| **قبل** | `bg-amber-500 text-white rounded-full` — خلفية برتقالية صلبة، نص أبيض |
| **بعد** | `rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] text-[var(--c-accent)] shadow-[var(--shadow-sm)] backdrop-blur` — شفافة مع ضبابية |
| انطباق الـ baseline | الـ baseline يُظهر شارة برتقالية صلبة واضحة الاختلاف |
| الشدة | **منخفضة-متوسطة** — تغيير أسلوبي يؤثر على قراءة الشارة عند تباين الألوان |

**توصية:** هذا تحسين أسلوبي مقبول، لكن يحتاج موافقة المالك لتحديث الـ baseline.

---

### 3. شارة الخصم — تحويل من أحمر صلب إلى لون ناعم

| التفصيل | القيمة |
|---------|--------|
| الملف | `components/product/ProductCard.tsx`، السطر 37-41 |
| الكوميت | `8b42fda`، 2026-06-27 |
| **قبل** | `bg-red-500 text-white` — خلفية حمراء صلبة، نص أبيض |
| **بعد** | `bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] text-[var(--c-sale)]` — خلفية ناعمة بـ 12% من لون البيع، نص بلون البيع |
| انطباق الـ baseline | الـ baseline يُظهر شارة خصم بلون مؤكد وواضح |
| الشدة | **منخفضة** — الشارة لا تزال مقروءة، لكن أقل تمييزاً |

---

## التحسين الإيجابي (إصلاح drift سابق)

| العنصر | الكوميت | الوضع |
|--------|---------|-------|
| البانر الإعلاني المضاعف في marketplace home | `5f7bf39` | **محلول** — الكوميت أزال نسخة البانر الزائدة. يتوافق الـ home الآن مع الـ baseline |

---

## حالة الفجوات البصرية المستمرة (من التقارير السابقة)

جدول محدَّث — لا تغيير في الحالة:

| المكوّن | العنصر | الحالة | القرار |
|---------|--------|--------|--------|
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| Home header | زر "افتح متجرك" للضيف | **غائب** | محل `home-header-seller-cta-2026-06-16.md` — ينتظر Cursor |

---

## القرار المطلوب من المالك

الكوميت `8b42fda` (2026-06-27) هو "refactor إلى tokens" ويُحتمل أن يكون تغييراً مقصوداً. يحتاج **محمد الزهراني** الرد على:

1. **نسبة الأبعاد `aspect-[4/5]`** — هل تُقبل كـ baseline جديد أم تُستعاد إلى `aspect-square`؟
2. **شارتا "مميز" و"خصم"** — هل التصميم الجديد (glassmorphism/ناعم) مُعتمد رسمياً؟

في حال القبول: فتح PR بعنوان `baseline-update` لتحديث `docs/design/baseline/`.
في حال الاسترجاع: تعديل `ProductCard.tsx` بالتوصيات أعلاه.

---

## ملاحظة: مسار تصيير جديد (visual builder)

`app/[slug]/page.tsx` (كوميت 2a4698d) أضاف مسار تصيير مشروط: إن كان المتجر يستخدم
`hasBuilderLayout()` فإن الصفحة الرئيسية له تُصيَّر عبر `<StorefrontBlocks>` بدلاً من
التخطيط الافتراضي. هذا يعني أن الـ baseline لصفحة المتجر (`subdomain-store.png`) ينطبق
فقط على المتاجر **بدون** visual builder. المتاجر المُفعَّل عليها builder تخرج بطبيعتها عن
baseline الصفحة الافتراضية — وهذا مقصود حسب مسار المشروع.

**لا إجراء مطلوب** لهذا البند.

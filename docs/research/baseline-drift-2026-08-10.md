# تقرير انحراف بصري — baseline-drift-2026-08-10

**تاريخ التشغيل:** 2026-08-10 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج — آخر تقرير متاح)

---

## ملخص تنفيذي

**يوجد drift جديد جوهري.** اكتُشف انحراف بصري عالي الأثر في صفحة الـ marketplace الرئيسية (`app/page.tsx`) نتيجة إعادة تصميم كاملة نُفّذت في PR #271 (2026-07-30). التغييرات تمسّ ثلاثة مكوّنات تُعدّ جزءاً من baseline المُجمَّد:

1. **Hero section** — هيكل ومحتوى مختلف كلياً
2. **شريط البحث** — انتقل من داخل الـ Hero إلى section مستقلة
3. **زر CTA في ProductTile** — تحوّل من «إضافة للسلة» إلى «عرض المنتج»

**قرار المرحلة:** drift مانع ← **لا تكتمل المرحلة 2**.
صفحة المتجر الفرعي (`app/[slug]/page.tsx` + `StoreHeader.tsx`) لا تحمل drift جديداً منذ 2026-06-16.

---

## الكوميتات الجديدة المؤثرة بصرياً منذ الجولة الأخيرة

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `013f987` | 2026-07-30 | elevate DASM Stores marketplace homepage | `app/page.tsx` + `HomeHeaderActions.tsx` | ⚠️ عالي — إعادة تصميم كاملة |
| `2a9372c` | 2026-07-30 | fix homepage light and dark theme coverage | `app/page.tsx` | 🟡 ألوان dark mode |
| `8b42fda` | 2026-06-27 | refactor storefront components to tokens | `components/product/ProductCard.tsx` + مكوّنات store | 🟢 styling فقط — لا تغيير هيكلي |
| `8f7b63b` | 2026-06-21 | Salla-style landing | `StorefrontBlocks.tsx` + `BlockRenderer.tsx` | 🟢 builder stores فقط — خارج baseline |
| `4edbdeb` | 2026-08-01 | feat(ads): seller ads results page | لوحة التاجر فقط | 🟢 خارج نطاق baseline |
| `ce5e8e2` | 2026-08-03 | fix(copy): copy only (no layout changes) | `AdBanner.tsx` + `pages/auth/login.tsx` | 🟢 نص فقط |

---

## التحليل المكوّن بمكوّن — marketplace-home

### 1. Hero Section ⚠️ DRIFT جديد عالي الخطورة

| العنصر | الـ Baseline | الكود الحالي | الحالة |
|--------|-------------|--------------|--------|
| خلفية الـ Hero | بطاقة داكنة `bg-[#021b1f]` مع `rounded-3xl` و `min-h-[280px]` | قسم كامل العرض `bg-[#eaf2f1]` مع radial gradients | **DRIFT جديد** |
| عنوان الـ Hero | «اكتشف متاجر ومنتجات داسم» — نص أبيض مركزي | «من متجر سعودي مستقل، إلى سوق أكبر.» — نص يساري أخضر/ذهبي | **DRIFT جديد** |
| الجانب الأيمن من الـ Hero | HeroScene — أيقونات منتجات متحركة (كان مقبولاً كـ"غائب") | CommercePassport card — بطاقة خطوات نمو المتجر | **DRIFT جديد** |
| شريط البحث | جزء من بطاقة الـ Hero (absolute bottom-7) | **نُقل** إلى `<section>` مستقلة خارج Hero بالكامل | **DRIFT جديد** |

**الملف:** `app/page.tsx`
**الموضع الحالي:** سطر ~452–499 (Hero) وسطر ~501–529 (Search)
**الموضع السابق:** سطر واحد مضغوط كان يحتوي `HeroScene` + `StoreAdSlot` + نص + search في بطاقة واحدة

**توصية الاسترجاع (للمراجعة فقط — لا تنفيذ):**
- خيار A: استعادة بطاقة Hero الداكنة مع نقل CommercePassport إلى section منفصلة
- خيار B: قبول الـ Hero الجديد وتحديث baseline بموافقة المالك

---

### 2. ProductTile — زر CTA ⚠️ DRIFT جديد متوسط + spec متقادم

| العنصر | الـ Baseline | الكود الحالي | الحالة |
|--------|-------------|--------------|--------|
| أيقونة زر CTA | `ShoppingCart` — يضيف للسلة | `ArrowLeft` — ينتقل لصفحة المنتج | **DRIFT جديد** |
| href الزر | `/${product.storeSlug}/cart` | `/${product.storeSlug}/products/${product.id}` | **DRIFT جديد** |
| شكل الزر | `rounded-xl` (كان محل spec لتحويله `rounded-full`) | `rounded-xl` (بقي كما هو) | مستمر |

**الملف:** `app/page.tsx` السطر ~235–241 (داخل `function ProductTile`)
**ملاحظة:** الـ spec المعلق `docs/specs/product-tile-cart-button-2026-06-14.md` أصبح **متقادماً** — كان يعالج تحويل الـ corner radius من `xl` إلى `full`، لكن الكوميت `013f987` غيّر الزر ليكون «عرض المنتج» بدلاً من «سلة»، مما يجعل spec الـ rounded-full غير ذي صلة. يُعاد كتابته إن قُرّر استعادة زر السلة.

---

### 3. قسم «لأصحاب المتاجر» — إضافة خارج baseline

| العنصر | الـ Baseline | الكود الحالي | الحالة |
|--------|-------------|--------------|--------|
| MerchantCapabilities | غائب | 4 بطاقات capability + CommercePassport steps | إضافة جديدة |

هذه إضافة إيجابية ولكنها غير موجودة في baseline المُجمَّد. **لا توصية باسترجاعها** — تحتاج قرار من المالك لتحديث baseline.

---

### 4. HomeHeaderActions — ThemeToggle

| العنصر | الـ Baseline | الكود الحالي | الحالة |
|--------|-------------|--------------|--------|
| ThemeToggle في هيدر marketplace | غائب في الوصف | موجود `<ThemeToggle />` | إضافة طفيفة |

تحسين UX ولا يمس الـ baseline المرئي الجوهري. مقبول ضمنياً.

---

### 5. عناصر مستمرة من تقارير سابقة (لا تغيير في حالتها)

| المكوّن | العنصر | الحالة | المرجع |
|---------|--------|--------|--------|
| ProductTile (marketplace) | شارة «ممول» | **غائب** — مقبول 2026-06-07 | — |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** — مقبول 2026-06-07 | — |
| Store (mobile) | Sticky Cart Bar | **غائب** | `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| Home seller CTA | Seller CTA button | — | `home-header-seller-cta-2026-06-16.md` — ينتظر Cursor |

---

## التحليل — subdomain-store

لا drift جديد. كوميتات `8b42fda` (tokens refactor) و`fd402fd` (conversion tracking) لم تمسّ البنية البصرية لـ:
- `StoreHeader.tsx` — Hero بانر + بطاقة معلومات المتجر العائمة (بقيت كما هي)
- `app/[slug]/page.tsx` — nav + categories + ProductGrid (بقيت كما هي)
- `components/product/ProductCard.tsx` — token refactor ← لا تغيير هيكلي، فقط CSS variables

---

## قائمة المراجع

| الملف | السطر | العنصر المعني |
|-------|-------|--------------|
| `app/page.tsx` | 452–499 | Hero section الجديد |
| `app/page.tsx` | 501–529 | Search section المستقلة |
| `app/page.tsx` | 235–241 | ProductTile CTA (ArrowLeft) |
| `app/page.tsx` | 531–579 | MerchantCapabilities section الجديدة |
| `components/home/HomeHeaderActions.tsx` | كامل | ThemeToggle مضاف |
| `docs/specs/product-tile-cart-button-2026-06-14.md` | — | spec متقادم — يحتاج مراجعة |

---

## الخطوة التالية

**مطلوب قرار من المالك:**

| الخيار | الوصف |
|--------|-------|
| أ — قبول التغييرات | تحديث baseline بموافقة صريحة عبر PR بعنوان `baseline-update` |
| ب — استعادة Hero القديم | فتح spec لـ Cursor بالعودة للبطاقة الداكنة مع الحفاظ على CommercePassport كـ section |
| ج — استعادة زر السلة | فتح spec منفصل لتحويل ArrowLeft → ShoppingCart في ProductTile |

**لا تكتمل المراحل 2 و3 في هذه الجولة بسبب وجود drift مانع.**

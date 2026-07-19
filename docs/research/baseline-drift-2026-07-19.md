# تقرير انحراف بصري — baseline-drift-2026-07-19

**تاريخ التشغيل:** 2026-07-19 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات منذ الجولة الأخيرة (2026-06-16) التي تمسّ ملفات قائمة Phase 1 تقتصر على:

1. إعادة هيكلة CSS إلى design tokens (`8b42fda`، 2026-06-27) — تغيير في أسماء CSS vars فقط، لا تغيير بصري هيكلي.
2. إزالة بانر إعلاني مكرر (`5f7bf39`، 2026-06-17) — خارج قائمة فحص Phase 1 (AdSlot ليس في الـ checklist المحدد).

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات ذات الصلة منذ 2026-06-16

| الكوميت | التاريخ | الوصف | الملفات | التأثير البصري |
|---------|---------|-------|---------|----------------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` | إزالة بانر إعلاني مكرر — خارج قائمة Phase 1 |
| `2a4698d` | 2026-06 | feat(storefront): phase 4c visual builder hybrid | `app/[slug]/page.tsx` | تحسين storefront builder — لا تأثير على baseline checklist |
| `09dcbe4` | 2026-06 | fix(storefront): drop duplicate chrome hero for builder | `app/[slug]/...` | إصلاح تقني builder — لا تأثير على baseline |
| `e65d0a0` | 2026-06 | fix(storefront): make products page discoverable | `app/[slug]/page.tsx`, nav | إضافة nav links — لا تأثير على baseline |
| `56ee40c` | 2026-06 | fix(storefront): drop cart emptied banner | `components/cart/...` | إزالة banner تدخلي — خارج نطاق baseline |
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | `ProductCard.tsx`، `StoreHeader.tsx`، ... | CSS vars فقط — لا تغيير بصري |
| `b95d2b6` | 2026-06-27 | [codex] add storefront theme tokens | CSS/theme | إضافة CSS tokens — لا تغيير بصري |

الملفات التالية **لم تُلمس** بأي كوميت جديد:
- `components/explore/StoreCard.tsx`
- `components/home/HomeHeaderActions.tsx`

---

## نتائج فحص Phase 1

### Hero (marketplace) — `app/page.tsx`

| العنصر | الـ baseline | الحالة | القرار |
|--------|------------|--------|--------|
| عنوان رئيسي + فرعي | "اكتشف متاجر ومنتجات داسم" | ✅ مطابق | — |
| شريط البحث | حقل أبيض في أسفل الهيرو | ✅ موجود (`<form action="/">`) | — |
| الخلفية | داكنة تركواز مع تدرج وجسيمات | ✅ `bg-[#021b1f]` + `HeroScene` | — |
| شارة "مساحة إعلان رئيسية" | داخل الهيرو | ✅ `<StoreAdSlot slotKey="store.home.banner" variant="hero">` | — |
| أيقونات مزايا المنصة | صف أيقونات تحت البحث | ❌ غائبة | مقبول بقرار التجميد 2026-06-07 |

### بطاقة المنتج (marketplace) — `ProductTile` في `app/page.tsx`

| العنصر | الـ baseline | الحالة | القرار |
|--------|------------|--------|--------|
| شارة "ممول" | تركواز | ❌ "مميز" (`is_featured`) | محل spec معلق |
| زر القلب (مفضلة) | أيقونة قلب على الصورة | ❌ غائب | محل `product-tile-wishlist-2026-06-11.md` |
| زر السلة الدائري | `rounded-full` | ❌ `rounded-xl` | محل `product-tile-cart-button-2026-06-14.md` |
| السعر بـ"رس" | سعر بعملة محلية | ✅ `{price} ر.س` | — |

### بطاقة المتجر — `StoreCard` / featured inline في `app/page.tsx`

| العنصر | الـ baseline | الحالة | القرار |
|--------|------------|--------|--------|
| الشعار الدائري | دائري RTL | ❌ `rounded-xl` (StoreCard) / `rounded-2xl` (featured) | فجوة معروفة |
| عداد المنتجات | "{n} منتج" | ✅ موجود في كلا التطبيقين | — |
| زر "زيارة المتجر" | بحدود تركواز | ✅ featured stores (inline) / ❌ غائب في StoreCard component | محل `store-card-visit-cta-2026-06-13.md` |

### شريط الإحصائيات السفلي

| العنصر | الحالة | القرار |
|--------|--------|--------|
| 15,000 متجر / +1 مليون / 99.6% رضا | ❌ غائب | مقبول بقرار التجميد 2026-06-07 |

### صفحة المتجر الفرعي — `StoreHeader.tsx`

| العنصر | الـ baseline | الحالة | القرار |
|--------|------------|--------|--------|
| Hero بانر | بانر سينمائي عريض | ✅ `store-hero-motion` + `h-36/h-52` | — |
| بطاقة معلومات المتجر العائمة | `-mt-8` بيضاء مع شعار + اسم + وصف | ✅ موجودة (`-mt-8 flex ... rounded-[var(--r-lg)]`) | — |
| وسوم الثقة (الرياض/موثوق/توصيل سريع) | صف وسوم في البطاقة | ❌ غائبة | محل `store-info-trust-badges-2026-06-08.md` |

---

## جدول الفجوات المستمرة (لا تغيير في الحالة)

| المكوّن | العنصر | Spec المعلق | الحالة |
|---------|--------|-------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | — | مقبول (تجميد) |
| ProductTile | شارة «ممول» | — | ينتظر Cursor |
| ProductTile | زر قلب مفضلة | `product-tile-wishlist-2026-06-11.md` | ينتظر Cursor |
| ProductTile | زر سلة دائري | `product-tile-cart-button-2026-06-14.md` | ينتظر Cursor |
| ProductCard (store) | قلب مفضلة | `product-card-store-wishlist-2026-06-12.md` | ينتظر Cursor |
| StoreInfoCard | وسوم الثقة | `store-info-trust-badges-2026-06-08.md` | ينتظر Cursor |
| StatsBar (marketplace) | 15K/1M/99.6% | — | مقبول (تجميد) |
| Store (mobile) | Sticky Cart Bar | `sticky-mini-cart-bar-2026-06-15.md` | ينتظر Cursor |

---

## الخطوة التالية

لا تصحيح مطلوب. تكتمل المرحلتان 2 و3 وفق الجدول.

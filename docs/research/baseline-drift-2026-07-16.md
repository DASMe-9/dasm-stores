# تقرير انحراف بصري — baseline-drift-2026-07-16

**تاريخ التشغيل:** 2026-07-16 (جولة أسبوعية — الأربعاء)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift — جولة W29)
**فترة التغطية:** 2026-06-16 → 2026-07-16 (30 يوماً، غياب الجولة الأسبوعية أربع دورات)

---

## ملخص تنفيذي

**لا يوجد drift حرج جديد يمنع التقدم.** الكوميتات المؤثرة على الملفات المراقبة تمثل تحسينات مقصودة أو إصلاح أخطاء، لا انحرافاً عن العقد البصري مع baseline.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة المؤثرة على الملفات المراقبة (منذ 2026-06-16)

| الكوميت | التاريخ | الوصف | الملف المتأثر | التأثير البصري |
|---------|---------|-------|--------------|----------------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` | **تحسين** — إزالة بانر مكرر لم يكن في baseline |
| `2a4698d` | 2026-06-17 | feat(storefront): visual builder hybrid (#180) | `app/[slug]/page.tsx` | **مقصود** — متاجر builder تعرض مسار مختلف |
| `09dcbe4` | 2026-06-21 | fix(storefront): drop duplicate chrome hero for builder stores (#194) | `app/[slug]/layout.tsx` + `StoreHeader.tsx` | **مقصود** — builder stores تحصل على compact header |
| `60fd4bc` | 2026-06-25 | feat(storefront): standard legal footer (#203) | `StoreFooter.tsx` | **خارج نطاق** — محتوى footer قانوني |
| `56ee40c` | 2026-06-25 | fix(storefront): drop "cart emptied" banner (#204) | `StoreChrome.tsx` | **تحسين** — إزالة banner متطفل |
| `b95d2b6` | 2026-06-27 | [codex] add storefront theme tokens | multiple | **بنيوي** — CSS variables، لا تغيير مرئي |
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | `StoreCard.tsx` + other | **بنيوي** — CSS variables، لا عناصر مضافة أو محذوفة |

الكوميتات اللاحقة (SSO، social login، profile completion — #209، #215، #216، #243، #244): كلها خارج نطاق baseline المتسوق.

---

## مراجعة مكوّنات Baseline (حالة 2026-07-16)

### Hero (marketplace) — `app/page.tsx`

| العنصر | الـ baseline | الحالة | الحكم |
|---------|------------|--------|-------|
| خلفية `#021b1f` + HeroScene | ✅ | موجود — سطر 73-85 | مطابق |
| شريط بحث `rounded-full` + نطاق | ✅ | موجود — سطر 178 | مطابق |
| عنوان رئيسي + وصف | ✅ | موجود | مطابق |
| `StoreAdSlot variant="hero"` | ✅ | موجود | مطابق |
| بانر إعلاني مكرر | ❌ في baseline | محذوف بـ `5f7bf39` | **تحسين** — الـ baseline يُظهر بانراً واحداً |
| أيقونات مزايا المنصة (شحن/ثقة) | ❌ في الكود | غائب | مقبول بقرار التجميد 2026-06-07 |

### ProductTile (marketplace) — `app/page.tsx` (inline، سطر 88-121)

| العنصر | الـ baseline | الحالة | الحكم |
|---------|------------|--------|-------|
| صورة المنتج + اسم + سعر ر.س | ✅ | موجود | مطابق |
| زر سلة صغير | ✅ (دائري) | موجود لكن `rounded-xl` (سطر 115) | **فجوة مستمرة** — محل `product-tile-cart-button-2026-06-14.md` |
| شارة «ممول» | ❌ | غائب | مقبول بقرار التجميد |
| أيقونة قلب مفضلة | ❌ | غائب | محل `product-tile-wishlist-2026-06-11.md` |

### StoreCard — `components/explore/StoreCard.tsx`

| العنصر | الـ baseline | الحالة | الحكم |
|---------|------------|--------|-------|
| شعار المتجر | ✅ (`rounded-xl` بدلاً من دائري) | موجود — سطر 35 | فجوة بصرية طفيفة — موثقة سابقاً |
| اسم المتجر + عدد المنتجات + المنطقة | ✅ | موجود | مطابق |
| زر «زيارة المتجر» صريح | ❌ | البطاقة link كاملة | فجوة مستمرة — موثقة |
| **ألوان CSS variables** | hardcoded قبل 2026-06-27 | `var(--card)`, `var(--border)`, `var(--primary)` | مقبول — المتغيرات محددة في `:root` بشكل صحيح (`globals.css` سطر 41-42) |

### StoreHeader / StoreInfoCard — `components/store/StoreHeader.tsx`

| العنصر | الـ baseline | الحالة | الحكم |
|---------|------------|--------|-------|
| بانر hero (non-builder) | ✅ | موجود — سطر 130-177 | مطابق |
| بطاقة معلومات عائمة `-mt-8` | ✅ | موجود — سطر 180 | مطابق |
| شعار المتجر + اسم + وصف | ✅ | موجود — سطر 181-193 | مطابق |
| وسوم ثقة (موثوق، توصيل) | ❌ | غائب | محل `store-info-trust-badges-2026-06-08.md` |
| **compact mode لـ builder stores** | لا ينطبق | جديد — سطر 95-127 | **مقصود** — builder stores تتحكم في hero نفسها |

---

## ملاحظة: تأثير token refactor على StoreCard

الكوميت `8b42fda` حوّل `StoreCard` منألوان Tailwind ثابتة إلى `var(--card)`, `var(--border)`, `var(--primary)`, `var(--muted)`, `var(--muted-foreground)`.

تحقق: `:root` في `styles/globals.css` يعرّف هذه المتغيرات بقيم محددة (`--card: var(--c-surface)` = `#FFFFFF`)، وتعمل بشكل سليم على صفحة marketplace التي لا تستخدم `.store-front-root`. لا تغيير بصري فعلي.

---

## جدول الفجوات المستمرة (بدون تغيير من W29)

| المكوّن | الفجوة | الحالة |
|---------|--------|--------|
| ProductTile (marketplace) | زر سلة `rounded-xl` بدلاً من `rounded-full` | محل spec `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | غياب أيقونة قلب | محل spec `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | غياب زر مفضلة | محل spec `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| ProductCard (store pages) | غياب عرض التقييم | **جديد — محل spec 2026-07-16** |
| StoreInfoCard | غياب وسوم ثقة | محل spec `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Hero (marketplace) | غياب أيقونات مزايا | مقبول بقرار التجميد |
| StatsBar | غياب | مقبول بقرار التجميد |
| Marketplace header | غياب CTA "افتح متجرك" | محل spec `home-header-seller-cta-2026-06-16.md` — ينتظر Cursor |
| Store (mobile) | Sticky Cart Bar | محل spec `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

# تقرير انحراف بصري — baseline-drift-2026-07-06

**تاريخ التشغيل:** 2026-07-06 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**يوجد drift جديد — غير حرج.** كوميت `8b42fda` (2026-06-27) أجرى إعادة هيكلة شاملة لتوكنز CSS في مكوّنات صفحات المتجر الفرعي. التغييرات مقصودة معمارياً، لكنها تُحدث انحرافاً بصرياً موثّقاً عن baseline.

**قرار المرحلة:** لا drift مانع (التغييرات متعمّدة وليست تراجعاً) → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملفات المؤثرة |
|---------|---------|-------|----------------|
| `8b42fda` | 2026-06-27 | `[codex] refactor storefront components to tokens` | `ProductCard.tsx`, `StoreHeader.tsx`, `CartBadge.tsx`, `StoreFooter.tsx`, `StoreTabsNav.tsx` و 7 أخرى |
| `56ee40c` | 2026-06-27 | `fix(storefront): drop cart emptied banner` | `StoreChrome.tsx` |
| `8f7b63b` | 2026-06-21 | `feat(storefront): Salla-style landing` | `StorefrontBlocks.tsx`, `BlockRenderer.tsx` |
| `5f7bf39` | 2026-06-? | `fix(marketplace): remove duplicate advertise banner` | `app/page.tsx` |
| `2a4698d` | 2026-06-? | `feat(storefront): phase 4c — public storefront renders visual builder` | متعدد |

---

## انحرافات جديدة مكتشفة — كوميت 8b42fda

### Drift 1: نسبة أبعاد صورة ProductCard (متجر فرعي)

| المحور | التفصيل |
|--------|---------|
| **الملف** | `components/product/ProductCard.tsx` — السطر 27 |
| **قبل** | `aspect-square` (نسبة 1:1) |
| **بعد** | `aspect-[4/5]` (نسبة بورتريه، أطول) |
| **التأثير البصري** | بطاقات المنتجات في صفحات المتجر الفرعي أطول الآن — يتغير شكل الشبكة بالكامل |
| **هل يخالف baseline؟** | الـ baseline يذكر "صورة منتج كبيرة" دون تحديد نسبة؛ التغيير مقصود ومتسق مع التوجه Salla-style |
| **توصية** | لا استرجاع — الـ 4/5 متسق مع الاتجاه التصميمي. توثيق فقط |

### Drift 2: أسلوب شارة "مميز" في ProductCard

| المحور | التفصيل |
|--------|---------|
| **الملف** | `components/product/ProductCard.tsx` — السطر 33 |
| **قبل** | `bg-amber-500 text-white` (خلفية كهرمانية صلبة، نص أبيض) |
| **بعد** | `bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] text-[var(--c-accent)] shadow-[var(--shadow-sm)] backdrop-blur` (زجاجي/frosted) |
| **التأثير البصري** | الشارة انتقلت من pill كهرماني بارز إلى badge شفاف هادئ |
| **هل يخالف baseline؟** | نعم — baseline يصف شارات واضحة اللون. التغيير أقل بروزاً |
| **توصية** | يُقبل كتحسين جمالي — لا استرجاع. سيُوثَّق في المراجعة الدورية |

### Drift 3: أسلوب شارة الخصم في ProductCard

| المحور | التفصيل |
|--------|---------|
| **الملف** | `components/product/ProductCard.tsx` — السطر 38 |
| **قبل** | `bg-red-500 text-white` (خلفية حمراء صلبة) |
| **بعد** | `bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] text-[var(--c-sale)]` (ظل خفيف بلون sale) |
| **التأثير البصري** | شارة الخصم أصبحت هادئة وغير مباشرة — قد تقلّل من بروز العروض |
| **هل يخالف baseline؟** | جزئياً — baseline يصف "نص دعوة بارز" و"السعر مع الخصم مُبرز" |
| **توصية** | يُراجَع مع صاحب القرار — الخصم المُبرز يحسن التحويل. مؤجل للـ sprint planning |

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث — لا تغيير في الحالة مقارنة بالتقرير السابق:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | spec `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | spec `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | spec `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | spec `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | spec `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تغييرات `8b42fda` مقصودة (refactor إلى tokens) وليست تراجعاً. شارة الخصم تحتاج مراجعة مع صاحب القرار إن كان تقليل البروز مقصوداً. تكتمل المرحلتان 2 و3 وفق الجدول.

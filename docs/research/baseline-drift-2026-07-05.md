# تقرير انحراف بصري — baseline-drift-2026-07-05

**تاريخ التشغيل:** 2026-07-05 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)
**ملاحظة:** هذه أول جولة بعد فجوة 19 يومًا (17 يونيو – 5 يوليو).

---

## ملخص تنفيذي

**لا يوجد drift حرج جديد.** التغييرات على ملفات الـ baseline كانت مقصودة ومُحسِّنة:
- `ProductCard.tsx` — نسبة الصورة تحولت من مربع إلى بورتريه (4/5) وتوافق baseline بشكل أفضل
- `StoreCard.tsx` — إعادة هيكلة إلى CSS tokens؛ لا تغيير بصري جوهري
- `app/page.tsx` — حُذف البانر الإعلاني المكرر، الحالة أنظف الآن

**قرار المرحلة:** لا انحراف مانع → تكملة المراحل 2 و3.

---

## الكوميتات الجديدة منذ 2026-06-16

| الكوميت | التاريخ | الوصف | الملفات | التأثير البصري على الـ baseline |
|---------|---------|-------|---------|--------------------------------|
| `5f7bf39` | 2026-06-17 | fix: remove duplicate advertise banner | `app/page.tsx` | يزيل مقطع إعلاني مكرر — لا baseline انحراف |
| `09dcbe4` | 2026-06-17 | fix: drop duplicate chrome hero for builder stores | `app/[slug]/page.tsx` | إصلاح تقني داخلي — خارج نطاق baseline |
| `60fd4bc` | 2026-06-18 | feat: standard legal footer + policy pages | `app/[slug]/layout.tsx` | إضافة `StoreFooter` — جديد، ليس في baseline، ليس انحرافًا |
| `b95d2b6` | 2026-06-26 | [codex] add storefront theme tokens | CSS tokens | أساسية — لا تغيير بصري مباشر |
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | `ProductCard.tsx`, `StoreCard.tsx` | ← انظر تفصيل أدناه |
| `9a7dab5` | 2026-06-28 | feat: migrate Google sign-in | `pages/auth/` | تدفق مصادقة — خارج نطاق baseline |
| `b16dbb8` | 2026-07-01 | feat(onboarding): name + password fields | `pages/onboarding/` | Onboarding فقط — خارج نطاق baseline |

---

## تفصيل التغيير في 8b42fda (Token Refactor)

### ProductCard.tsx — نسبة الصورة

| العنصر | قبل | بعد | التقييم |
|--------|-----|-----|---------|
| نسبة الصورة | `aspect-square` (1:1) | `aspect-[4/5]` (0.8 — بورتريه) | **تحسين مقبول** — baseline يصف "بطاقة عمودية"؛ البورتريه أقرب للوصف وأكثر توافقًا مع Salla/Zid/Shopify |
| شارة "مميز" | `bg-amber-500` solid أبيض | tokens: شبه شفاف + backdrop-blur | تحسين مقبول — أكثر تكيفًا مع ثيمات المتجر |
| شارة الخصم | `bg-red-500` solid أبيض | tokens: `bg-[color-mix(...c-sale...)]` | مقبول — متسق مع نظام الألوان |
| اتجاه المقالة | غير محدد | `dir="rtl"` | إضافة دفاعية صحيحة للـ RTL |

**قرار:** لا انحراف. التغيير intentional ومحسِّن.

### StoreCard.tsx — Token Refactor

تحويل `bg-white dark:bg-zinc-900` وما يشابهه إلى `bg-[var(--card)]`. البنية البصرية (بانر + لوغو + اسم + badges) لم تتغيّر. لا drift جديد.

---

## حالة الفجوات البصرية المستمرة (محدَّثة)

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
| HomeHeaderActions | زر "افتح متجرك" للضيف | **غائب** | محل `home-header-seller-cta-2026-06-16.md` — ينتظر Cursor |

---

## الخطوة التالية

لا تصحيح مطلوب. جولتا 2 و3 تكتملان وفق الجدول.

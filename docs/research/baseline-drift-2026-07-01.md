# تقرير انحراف بصري — baseline-drift-2026-07-01

**تاريخ التشغيل:** 2026-07-01 (جولة أسبوعية — الثلاثاء)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات منذ الجولة الأخيرة (2026-06-16 → 2026-07-01) مقسّمة إلى ثلاث حزم:
- حزمة auth (social login) → خارج نطاق baseline المتسوق
- حزمة theme tokens refactor → إعادة هيكلة بصرية متكافئة، لا انحراف مرئي
- حزمة builder/storefront → تغيير معماري مقصود موثّق

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ 2026-06-16

### حزمة Social Auth (غير مؤثرة بصرياً على baseline)

| الكوميت | الوصف | التأثير البصري |
|---------|-------|----------------|
| `fb4a859` | Merge PR #216 — profile completion fields | تدفق onboarding — خارج نطاق baseline |
| `b16dbb8` | feat(onboarding): collect name + optional password | صفحة onboarding جديدة — خارج نطاق |
| `bd8c40c` | Merge PR #215 — social login redirect | تدفق auth — خارج نطاق baseline |
| `9a7dab5` | feat(auth): migrate Google sign-in to Socialite | `pages/auth/` فقط |
| `57c9dd1` | Merge PR #209 — social login | ملفات auth — خارج نطاق |
| `d3ece4c` | feat(auth): add Google/Apple sign-in + forced profile completion | ملفات auth — خارج نطاق |

### حزمة Theme Tokens Refactor (مراجعة مفصّلة)

| الكوميت | الوصف | الملفات المتأثرة ببيسلاين |
|---------|-------|---------------------------|
| `b95d2b6` | add storefront theme tokens | `app/[slug]/layout.tsx`, `styles/globals.css`, `lib/themes/` — بنية، لا تغيير بصري |
| `8b42fda` | refactor storefront components to tokens | `ProductCard.tsx`, `StoreHeader.tsx` وآخرون |

**مراجعة `8b42fda` على مكوّنات البيسلاين:**

`components/product/ProductCard.tsx` — بعد التوكن:
- الهيكل البصري مطابق للسابق: صورة + badge مميز + badge خصم + اسم + سعر
- التغيير: استبدال `text-slate-900` بـ `text-[var(--c-text)]` وما شابه — **متكافئ بصرياً**
- لا عناصر أُضيفت أو حُذفت من المكوّن

`components/store/StoreHeader.tsx` — بعد التوكن:
- Hero section: `h-36 rounded-[var(--r-lg)]` ← سابقاً `h-36 rounded-3xl` — **متكافئ**
- StoreInfoCard: `-mt-8 backdrop-blur` — موجود، لا تغيير هيكلي
- Logo: `h-16 w-16 rounded-[var(--r)]` ← `rounded-2xl` — **متكافئ**
- **نتيجة:** لا انحراف

### حزمة Builder/Storefront (تغيير معماري موثّق)

| الكوميت | الوصف | التقييم |
|---------|-------|---------|
| `6041806` + `8b42fda` | Merge PR #208 store-theme-tokens | مراجعة أعلاه |
| `f13b4c1` | fix(themes): drop fake testimonials & newsletter | تحسين — لا انحراف |
| `56ee40c` | fix(storefront): drop intrusive "cart emptied" banner | تحسين UX — لا انحراف |
| `60fd4bc` | feat(storefront): standard legal footer + policy pages | إضافة — لا تأثير على البيسلاين |
| `e65d0a0` | fix(storefront): make products page discoverable in nav | تحسين nav — لا انحراف |
| `09dcbe4` | fix(storefront): drop duplicate chrome hero for builder stores | **تغيير معماري مقصود** — انظر أدناه |
| `8f7b63b` | feat(storefront): Salla-style landing — curated | StorefrontBlocks — builder فقط |
| `5f45ab2` | feat(stores/theme): visual block builder primary | لوحة تحكم — خارج نطاق |
| `26cc22e` | feat(theme/templates): redesign 6 store templates | builder templates — خارج نطاق |
| `5f7bf39` | fix(marketplace): remove duplicate advertise banner | **إصلاح** (تكرار) — لا انحراف |
| `2a4698d` | feat(storefront): phase 4c — public storefront renders visual builder | **تغيير معماري مقصود** |

**ملاحظة على التغيير المعماري `09dcbe4`:**

أضاف `compact={hasBuilderLayout(store.theme_config)}` إلى `<StoreHeader>`. للمتاجر المُصمَّمة بالـ visual builder:
- `compact=true` → شريط معلومات نحيف فقط (لا hero بانر، لا StoreInfoCard)
- الـ builder landing blocks تحمل Hero الخاص بها

**لماذا ليس drift؟** هذا التغيير موثّق في تعليق الكود (`Builder stores own the hero via their landing blocks`) وهو قرار معماري مقصود. المتاجر غير-builder تستمر في عرض Hero + StoreInfoCard الكاملة كما في البيسلاين. البيسلاين يمثّل الآن متاجر الـ fallback path (non-builder).

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث — لا تغيير في الحالة مقارنة بالتقرير السابق:

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
| Product detail page | معلومات الشحن/التوصيل | **غائب** | محل spec هذه الجولة (W30) |

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول.

# تقرير انحراف بصري — baseline-drift-2026-07-04

**تاريخ التشغيل:** 2026-07-04 (جولة أسبوعية — السبت)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**تم رصد drift جديد** في `components/product/ProductCard.tsx` ناتج عن كوميت `8b42fda` (Jun 27 — PR #208 feature/store-theme-tokens). ثلاثة انحرافات بصرية في صفحات المتاجر الفرعية عن baseline `subdomain-store.png`.

**قرار المرحلة:** drift موجود → المرحلة 3 (spec) مؤجلة. المرحلة 2 تكتمل عادةً.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `5f7bf39` | Jun 17 | fix(marketplace): remove duplicate advertise banner (#181) | `app/page.tsx` | إزالة بانر "مساحة إعلان بانر واسعة" المكرر — تقليص drift سابق، لا drift جديد |
| `56ee40c` | Jun 17 | fix(storefront): drop cart-emptied banner (#204) | `components/store/StoreChrome.tsx` | UX لا بصريات — خارج نطاق baseline المتسوق |
| `8b42fda` | Jun 27 | [codex] refactor storefront components to tokens (PR #208) | `components/product/ProductCard.tsx` + 11 ملفاً | **drift حرج — انظر أدناه** |

---

## Drift جديد — رصد هذه الجولة

### Drift 1 — نسبة عرض/ارتفاع صورة المنتج (حرج بصري)

| المحور | الحالة |
|--------|--------|
| **المكوّن** | `components/product/ProductCard.tsx` — السطر 27 |
| **قبل الكوميت** | `aspect-square` (1:1 — مربع) |
| **بعد الكوميت** | `aspect-[4/5]` (4:5 — أطول من المربع) |
| **الانحراف عن baseline** | baseline `subdomain-store.png` يُظهر بطاقات منتجات بصورة مربعة. الكود الجديد يجعل الصورة أطول بنسبة 25% مما يُضيّق عرض الشبكة ويُعطي مظهراً مختلفاً. |
| **الملف والسطر** | `components/product/ProductCard.tsx:27` |
| **توصية الاسترجاع** | السطر 27 يصبح: `className="store-product-card__media relative aspect-square bg-[var(--c-surface-2)]"` |

---

### Drift 2 — شارة "مميز" — تغيير من solid amber إلى frosted glass

| المحور | الحالة |
|--------|--------|
| **المكوّن** | `components/product/ProductCard.tsx` — السطر 33 |
| **قبل الكوميت** | `rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white` (بيضاء على خلفية amber صلبة) |
| **بعد الكوميت** | `rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] ... backdrop-blur text-[var(--c-accent)]` (لون السمة، خلفية شبه شفافة، blur) |
| **الانحراف عن baseline** | baseline يُظهر شارة "مميز" بلون صلب مميز (amber/برتقالي). الشارة الجديدة شفافة يعتمد لونها على سمة المتجر — أقل وضوحاً في السمات ذات الألوان الفاتحة. |
| **الملف والسطر** | `components/product/ProductCard.tsx:33` |
| **توصية الاسترجاع** | استبدال class الشارة بالتالي (يحافظ على التوافق مع tokens ويُبقي وضوح اللون):<br>`className="absolute right-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-amber-500 px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-white"` |

---

### Drift 3 — شارة الخصم — تغيير من solid red إلى soft tint

| المحور | الحالة |
|--------|--------|
| **المكوّن** | `components/product/ProductCard.tsx` — السطر 38 |
| **قبل الكوميت** | `rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white` (أبيض على أحمر صلب) |
| **بعد الكوميت** | `bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] text-[var(--c-sale)]` (نص ملون بلون البيع على خلفية شفافة خفيفة جداً) |
| **الانحراف عن baseline** | baseline يُظهر شارة خصم بأحمر صلب عالي التباين. الشارة الجديدة (12% opacity) أقل بكثير في التباين وقد تكون غير مقروءة في سمات معينة. |
| **الملف والسطر** | `components/product/ProductCard.tsx:38` |
| **توصية الاسترجاع** | استبدال:<br>`className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[var(--c-sale,#ef4444)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-white"` |

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث — لا تغيير في حالة الفجوات المعروفة:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | غائب | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | غائب | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | غائب | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | غائب | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| ProductCard (store pages) | `aspect-square` | **`aspect-[4/5]`** (drift جديد) | **توصية استرجاع أعلاه — ينتظر Cursor** |
| ProductCard (store pages) | شارة "مميز" solid amber | frosted glass (drift جديد) | **توصية استرجاع أعلاه — ينتظر Cursor** |
| ProductCard (store pages) | شارة خصم solid red | soft tint (drift جديد) | **توصية استرجاع أعلاه — ينتظر Cursor** |
| StoreInfoCard | وسوم ثقة | غائب | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | غائب | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | غائب | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## ملاحظة على fix #181 (إيجابية)

كوميت `5f7bf39` أزال بانر "مساحة إعلان بانر واسعة" المكرر من `app/page.tsx`. كان هذا drift إضافي (عنصر زائد عن baseline). الإزالة تُقرّب الصفحة من baseline — لا إجراء مطلوب.

---

## الخطوة التالية

**لا spec هذه الجولة** (drift حرج موجود). المهام المقترحة لـ Cursor بأولوية:
1. **عالية:** إعادة `aspect-square` في ProductCard (drift#1 — أثر بصري مباشر على شبكة المنتجات)
2. **متوسطة:** إعادة الشارتين solid (drift#2 و drift#3 — تأثير على وضوح badges)

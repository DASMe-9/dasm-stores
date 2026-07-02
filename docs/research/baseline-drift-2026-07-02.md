# تقرير انحراف بصري — baseline-drift-2026-07-02

**تاريخ التشغيل:** 2026-07-02 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

**يوجد drift جديد — مكوّنان متأثران.** الكوميتات اللاحقة لـ 2026-06-16 تضمّنت إعادة هيكلة بصرية لـ `ProductCard` وحذف `AdSlot.wide` من الصفحة الرئيسية.

**قرار المرحلة:** drift موجود → لا تكملة للمرحلتين 2 و3 هذه الجولة.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملفات الحرجة |
|---------|---------|-------|----------------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` ← **يمس baseline** |
| `2a4698d` | 2026-06-17 | feat(storefront): phase 4c — visual builder | `app/[slug]/page.tsx` |
| `f6d90db` | 2026-06-17 | feat(dashboard/theme): phase 4a — 10 new section blocks | لوحة تحكم فقط |
| `d987a13` | 2026-06-17 | feat(dashboard/theme): phase 4b — visual store builder | لوحة تحكم فقط |
| `26cc22ea` | 2026-06-17 | feat(theme/templates): redesign the 6 store templates | `lib/themes/blocks/templates.ts` |
| `5f45ab2` | 2026-06-21 | feat(stores/theme): visual block builder as primary designer | لوحة تحكم فقط |
| `09dcbe4` | 2026-06-21 | fix(storefront): drop duplicate chrome hero for builder stores | `app/[slug]/layout.tsx` — builder فقط |
| `8f7b63b` | 2026-06-21 | feat(storefront): Salla-style landing | `components/storefront/StorefrontBlocks.tsx` — builder فقط |
| `e65d0a0` | 2026-06-21 | fix(storefront): make products page discoverable | `app/[slug]/page.tsx` — إضافة شريط تنقل |
| `60fd4bc` | 2026-06-25 | feat(storefront): standard legal footer + policy pages | `app/[slug]/layout.tsx` |
| `56ee40c` | 2026-06-25 | fix(storefront): drop "cart emptied" banner | `components/store/StoreChrome.tsx` |
| `b95d2b6` | 2026-06-27 | [codex] add storefront theme tokens | `lib/themes/storefront-tokens.ts` |
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx` ← **يمس baseline** |
| `d3ece4c` | 2026-06-27 | feat(auth): add Google/Apple sign-in | auth فقط |
| `9a7dab5` | 2026-06-29 | feat(auth): migrate Google sign-in to Socialite redirect | auth فقط |
| `b16dbb8` | 2026-06-30 | feat(onboarding): collect name + optional password | auth فقط |

---

## الانحرافات الجديدة المكتشفة

### 1. ProductCard — نسبة الأبعاد ونمط الشارات (حرج متوسط)

| الحقل | القيمة |
|-------|--------|
| **الملف** | `components/product/ProductCard.tsx` |
| **السطر** | 27 (الوسيط) |
| **الكوميت** | `8b42fda` — 2026-06-27 |
| **الوصف الدقيق** | إعادة هيكلة كاملة إلى نظام CSS tokens |

**التفاصيل:**

*أ) نسبة أبعاد صورة المنتج:*
- الـ baseline: صورة منتج مربعة ظاهرة في اللقطة (ترتيب بصري 1:1)
- الكود قبل الكوميت: `aspect-square` (1:1)
- الكود بعد الكوميت (السطر 27): `aspect-[4/5]` (بورتريت)
- **التأثير:** تضيق البطاقات أفقياً في شبكة المنتجات — يغيّر الإيقاع البصري للشبكة بالكامل

*ب) شارة "مميز":*
- الكود قبل: `bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white` — حبّة أمبر صلبة واضحة
- الكود بعد (السطر 33): `rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(...)] text-[var(--c-accent)] shadow backdrop-blur` — نمط glassmorphic بلون يتغيّر بحسب الثيم
- **التأثير:** الشارة لم تعد بلون ثابت — تظهر بحسب preset الثيم (أخضر داكن في `quiet`، ذهبي في `night`، إلخ)

*ج) شارة "خصم%":*
- الكود قبل: `bg-red-500 text-white` — أحمر صلب
- الكود بعد (السطر 38): `bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] text-[var(--c-sale)]` — ناعم بلون الثيم
- **التأثير:** الشارة أهدأ بصرياً وأقل ظهوراً

**توصية الاسترجاع (للمكوّن ب فقط — الشارتان):**
- السطر 33 يصبح: `className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white"`
- السطر 38 يصبح: `className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white"`
- ملاحظة: نسبة الأبعاد `aspect-[4/5]` قد تكون قراراً متعمداً يُحسّن عرض صور الملابس — تحتاج تأكيداً قبل الاسترجاع

---

### 2. AdSlot.wide — محذوف من الصفحة الرئيسية للسوق (إشعار)

| الحقل | القيمة |
|-------|--------|
| **الملف** | `app/page.tsx` |
| **السطر المحذوف** | كان في الموضع بين قسمي `#stores` و `#categories` |
| **الكوميت** | `5f7bf39` — 2026-06-17 |
| **الوصف الدقيق** | حذف قسم كامل: `مساحة إعلان بانر واسعة` |

**التفاصيل:**
- الـ baseline يصف نوعين من AdSlot: `featured` (بطاقة تحت المنتجات) و `wide` (شريط عرض كامل)
- الكوميت حذف `AdSlot.wide` واصفاً إياه بـ "duplicate"
- `AdSlot.featured` (السطر 179 في الحالة الراهنة) ما زال موجوداً ✓
- **الأثر:** فقدان موضع الإعلان البانر في منتصف الصفحة

**توصية الاسترجاع:**
- إعادة إضافة قسم AdSlot.wide بعد قسم `#stores` وقبل `#categories` — أو قرار رسمي بالتجميد إن كان الحذف متعمداً

---

## حالة الفجوات البصرية المستمرة (من تقارير سابقة)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | ينتظر Cursor (`product-tile-cart-button-2026-06-14.md`) |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor (`product-tile-wishlist-2026-06-11.md`) |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor (`product-card-store-wishlist-2026-06-12.md`) |
| StoreInfoCard | وسوم ثقة | **غائب** | ينتظر Cursor (`store-info-trust-badges-2026-06-08.md`) |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | ينتظر Cursor (`sticky-mini-cart-bar-2026-06-15.md`) |
| AdSlot.wide (marketplace) | شريط بانر إعلاني واسع | **محذوف** | **جديد هذه الجولة — يحتاج قرار** |
| ProductCard aspect ratio | `aspect-square` → `aspect-[4/5]` | تغيّر | **جديد هذه الجولة — يحتاج قرار** |
| ProductCard badge style | أمبر/أحمر صلب → glassmorphic | تغيّر | **جديد هذه الجولة — يحتاج قرار** |

---

## الخطوة التالية

**مطلوب قرار من الفريق على دفتر الأعمال:**
1. هل `aspect-[4/5]` في ProductCard مقصود؟ إن نعم → تجميد. إن لا → استرجاع بتوصية الاسترجاع أعلاه
2. هل حذف `AdSlot.wide` قرار نهائي؟ إن نعم → تجميد وتحديث baseline. إن لا → إعادة إضافته
3. أسلوب شارات "مميز/خصم%" الجديد (glassmorphic) — تأكيد أو استرجاع

لا تكملة للمرحلتين 2 و3 هذه الجولة بسبب وجود drift جديد.

# تقرير انحراف بصري — baseline-drift-2026-07-07

**تاريخ التشغيل:** 2026-07-07 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

**يوجد drift جديد في صفحة المتجر الفرعي (subdomain).** كوميت `8b42fda` بتاريخ 2026-06-27 غيّر مكوّن `ProductCard` ضمن إعادة بناء design tokens. التغييران البصريان ينحرفان عن الـ baseline الموثّق.

**قرار المرحلة:** يوجد drift → لا تكملة للمرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-17 → 2026-07-07)

| الكوميت | التاريخ | الوصف | الملفات البصرية المتأثرة |
|---------|---------|-------|--------------------------|
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | `ProductCard.tsx` ✓ |
| `b95d2b6` | 2026-06-27 | [codex] add storefront theme tokens | `tokens` فقط |
| `56ee40c` | 2026-06-22 | fix: drop cart-emptied banner | `cart UX` — خارج baseline |
| `60fd4bc` | 2026-06-22 | feat: legal footer + policy pages | `footer` — خارج baseline |
| `09dcbe4` | 2026-06-21 | fix: drop duplicate chrome hero for builder stores | `builder path` — خارج baseline |
| `8f7b63b` | 2026-06-21 | feat: Salla-style landing — curated, less card-dominated | `StorefrontBlocks/BlockRenderer` — builder path |

لم يُلمس أي من الملفات التالية:
- `app/page.tsx` — لا drift في الصفحة الرئيسية
- `app/[slug]/page.tsx` — التغييرات الأخيرة خارج نطاق baseline البصري
- `components/explore/StoreCard.tsx`
- `components/home/HomeHeaderActions.tsx`
- `components/store/StoreChrome.tsx`

---

## الانحرافات البصرية الجديدة

### 1. تغيير نسبة أبعاد صورة المنتج في بطاقة المتجر الفرعي

| التفصيل | الـ baseline | الكود بعد الكوميت |
|---------|-------------|-------------------|
| **المكوّن** | `ProductCard` (صفحة المتجر الفرعي) | — |
| **الملف** | `components/product/ProductCard.tsx` | — |
| **السطر** | 27 | — |
| **قبل** | `aspect-square` | بطاقة مربّعة |
| **بعد** | `aspect-[4/5]` | بطاقة أطول عمودياً (~25% زيادة في ارتفاع الصورة) |
| **الأثر البصري** | تغيير حجم بطاقات المنتج في جميع صفحات المتاجر الفرعية | |

**الـ baseline الموثّق في `components-inventory.md`:** "بطاقة عمودية فاتحة، صورة منتج كبيرة" — لم يُحدَّد aspect ratio صراحةً، لكن الـ baseline المرئي يُظهر صورة مربّعة أو شبه مربّعة.

**توصية الاسترجاع:** السطر 27 في `components/product/ProductCard.tsx` يعود إلى:
```tsx
<div className="store-product-card__media relative aspect-square bg-[var(--c-surface-2)]">
```
**ملاحظة:** التغيير من `aspect-square` إلى `aspect-[4/5]` قد يكون مقصوداً لمواءمة نسبة الصورة مع صور المنتجات الحقيقية (4:5 أقرب لنسبة الكاميرا). يُوصى بمراجعة مع المالك قبل الاسترجاع.

---

### 2. تغيير لون ونمط شارة "مميز" في بطاقة المنتج

| التفصيل | الـ baseline | الكود بعد الكوميت |
|---------|-------------|-------------------|
| **المكوّن** | `ProductCard` (شارة featured) | — |
| **الملف** | `components/product/ProductCard.tsx` | — |
| **السطر** | 33 | — |
| **قبل** | `rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white` | خلفية برتقالية/ذهبية صلبة، نص أبيض |
| **بعد** | `rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-accent)] shadow-[var(--shadow-sm)] backdrop-blur` | خلفية شفافة، نص بلون الـ accent، حدود، وتأثير blur |
| **الأثر البصري** | الشارة انتقلت من solid amber → glassmorphism بلون الـ accent (تركواز/أخضر حسب الثيم). أثر بصري جذري. |

**توصية الاسترجاع:** السطر 33 يعود إلى:
```tsx
<span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
```
**ملاحظة:** التغيير إلى design tokens اتجاه صحيح عمارياً (يدعم التخصيص لكل متجر)، لكنه يُبطل الثبات البصري الموثّق في الـ baseline.

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث من التقرير السابق — لا تغيير في الحالة:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` | spec `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | spec `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | spec `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | spec `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | spec `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## الخطوة التالية

**مطلوب قرار من المالك** حول الانحرافين المكتشفين:
1. **نسبة الأبعاد** `aspect-square` → `aspect-[4/5]`: هل التغيير مقصود؟ إن لم يكن — استرجاع بالتوصية أعلاه.
2. **شارة featured glassmorphism**: هل التوجه token-based الجديد يصبح الـ baseline الجديد؟ إن لم يكن — استرجاع.

لا تكملة للمرحلتين 2 و3 في هذه الجولة.

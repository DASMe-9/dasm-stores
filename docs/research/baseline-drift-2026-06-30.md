# تقرير انحراف بصري — baseline-drift-2026-06-30

**تاريخ التشغيل:** 2026-06-30 (جولة أسبوعية — الأحد 2026-06-28 trigger)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16) تشمل إعادة هيكلة
tokens التصميمية في مكوّنات المتجر الفرعي، وتحسينات UX في الـ storefront landing، وتدفقات
المصادقة الاجتماعية — ولا شيء منها يمس العقد البصري للـ baseline.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | الوصف | الملفات | التأثير البصري |
|---------|-------|---------|----------------|
| `9a7dab5` | feat(auth): migrate Google sign-in to Socialite redirect | `pages/auth/` | تدفق دخول — خارج نطاق baseline |
| `d3ece4c` | feat(auth): add Google/Apple sign-in + forced profile | `pages/auth/` | تدفق دخول — خارج نطاق baseline |
| `8b42fda` | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx` + 11 ملف storefront | تحويل داخلي من Tailwind hardcoded إلى CSS tokens — لا تغيير في الهيكل البصري |
| `b95d2b6` | [codex] add storefront theme tokens | `styles/` / tokens | تعريف المتغيرات — البصري يبقى مشروطاً بالقيم المُعيَّنة |
| `56ee40c` | fix: drop intrusive cart-emptied banner (#204) | `components/store/StoreChrome.tsx` | إزالة banner — تحسين UX، لا انحراف |
| `60fd4bc` | feat: standard legal footer + policy pages (#203) | `components/store/StoreFooter.tsx` | إضافة footer بالمتجر — خارج نطاق baseline |
| `e65d0a0` | fix: products page discoverable in store nav (#195) | `app/[slug]/page.tsx` + nav | تحسين تنقل — خارج نطاق baseline |
| `09dcbe4` | fix: drop duplicate chrome hero builder stores (#194) | `app/[slug]/layout.tsx` | إزالة تكرار hero للمتاجر ذات builder — تحسين، لا انحراف |
| `8b42fXX` | feat: Salla-style landing — curated, less card-dominated (#193) | `app/[slug]/page.tsx` | تحديث landing page المتجر: nav pills + category chips + product grid. لا يمس baseline hero/StoreInfoCard في StoreHeader |

---

## ملاحظة مهمة — token refactor (8b42fda)

`components/product/ProductCard.tsx` تحوّل من Tailwind hardcoded إلى نظام CSS tokens:
- **قبل:** `rounded-xl bg-emerald-50 text-emerald-700 ...`
- **بعد:** `var(--c-surface-2)` / `store-product-card__*` class names / `productCardClassName(cardStyle)`

هذا تحويل هيكلي لدعم الثيمات المتعددة. البصر الناتج يعتمد على قيم tokens المُعيَّنة في `b95d2b6`.
**ليس drift** — التغيير مقصود ومقترن بالـ theme system.

---

## حالة الفجوات البصرية المستمرة

لا تغيير في الحالة — محدَّث من التقرير السابق:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود — `app/page.tsx:115` | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

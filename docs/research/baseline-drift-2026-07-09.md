# تقرير انحراف بصري — baseline-drift-2026-07-09

**تاريخ التشغيل:** 2026-07-09 (جولة أسبوعية — الأربعاء، W30)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات الخمسة الجديدة منذ الجولة الأخيرة (2026-06-16) تشمل refactor للتوكينات، وإضافة رابط تنقل في هيدر المتجر، وإصلاحات لمتاجر الـ builder — ولا أثر بصري سلبي منها على الـ baseline.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | الوصف | الملفات المتأثرة | التأثير البصري |
|---------|-------|-----------------|----------------|
| `e65d0a0` | fix(storefront): make products page discoverable in store nav | `StoreHeader.tsx`, `StoreTabsNav.tsx` | إيجابي — يُقرّب من baseline: أضاف رابط «المنتجات» في nav الهيدر وعنوان Tab أوضح |
| `8b42fda` | [codex] refactor storefront components to tokens | `StoreHeader.tsx`, `ProductCard.tsx` + 10 ملفات أخرى | CSS فقط (hardcoded colors → CSS vars) — لا تغيير بصري إذا الـ tokens مضبوطة |
| `09dcbe4` | fix(storefront): drop duplicate chrome hero for builder stores | `StoreHeader.tsx`-related | builder stores فقط — لا أثر على default store baseline |
| `5f7bf39` | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` | إزالة تكرار — لا drift |
| `2a4698d` | feat(storefront): phase 4c — visual builder (hybrid) | `app/[slug]/page.tsx` + builder code | builder path فقط — لا أثر على الـ default baseline |

---

## الملفات المراقبة — حالة الفحص

| الملف | آخر تعديل مرصود | التأثير على baseline |
|-------|----------------|---------------------|
| `app/page.tsx` | `5f7bf39` (إزالة banner مكرر) | لا drift |
| `app/[slug]/page.tsx` | `2a4698d` (builder path) | لا drift على المسار الافتراضي |
| `components/store/StoreHeader.tsx` | `8b42fda` (token refactor) | لا drift بصري |
| `components/explore/StoreCard.tsx` | لم يُلمس | — |
| `components/product/ProductCard.tsx` | `8b42fda` (token refactor) | لا drift بصري |
| `components/home/HomeHeaderActions.tsx` | لم يُلمس | — |

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث — لا تغيير في الحالة عن 2026-06-16:

| المكوّن | العنصر | الحالة في الكود | الملف | Spec المقابلة |
|---------|--------|-----------------|-------|--------------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | `app/page.tsx` | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | `app/page.tsx` | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` | `app/page.tsx` | `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | `app/page.tsx` | `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | `components/product/ProductCard.tsx` | `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | `components/store/StoreHeader.tsx` | `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | `app/page.tsx` | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | `app/[slug]/layout.tsx` | `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## ملاحظة خاصة — exa متاحة هذه الجولة

exa فعّالة للمرة الأولى منذ W23. تم إجراء فحص حي للمنافسين في المرحلة 2.

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

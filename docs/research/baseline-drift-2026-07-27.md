# تقرير انحراف بصري — baseline-drift-2026-07-27

**تاريخ التشغيل:** 2026-07-27 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات منذ الجولة الأخيرة (2026-06-16) تشمل إعادة هيكلة التوكنات وإصلاحات في المتجر الفرعي — لا انحراف بصري جديد عن الـ baseline.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة التي تمسّ ملفات الـ baseline (2026-06-16 ← 2026-07-27)

| الكوميت | الوصف | الملفات المتأثرة | التأثير البصري |
|---------|-------|------------------|----------------|
| `8b42fda` | refactor storefront components to tokens | `StoreHeader.tsx`, `ProductCard.tsx`, `StoreTabsNav.tsx` + 9 ملفات | تغيير معماري من Tailwind hardcoded إلى CSS variables — التوقع البصري محافظ |
| `b95d2b6` | add storefront theme tokens | ملفات CSS tokens | توفير متغيرات CSS — لا أثر بصري مباشر على baseline |
| `09dcbe4` | drop duplicate chrome hero for builder stores | `StoreHeader.tsx` | أضاف `compact` mode للمتاجر التي تستخدم visual builder — الـ baseline (non-builder) لا يزال يُعرض كما هو |
| `e65d0a0` | make products page discoverable in store nav | `app/[slug]/page.tsx` | إضافة رابط "الأقسام" في nav المتجر — تحسين UX خارج نطاق baseline |
| `5f7bf39` | remove duplicate advertise banner on stores home | `app/page.tsx` | إزالة نسخة مكررة من banner الإعلانات — النسخة الأصلية داخل Hero لا تزال موجودة |

---

## حالة الفجوات البصرية المستمرة (محدَّثة)

لا تغيير في الحالة عن التقرير السابق:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** (`مميز` بدلاً منها) | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود — `app/page.tsx:115` | ينتظر Cursor — spec: `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor — spec: `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** — `components/product/ProductCard.tsx` | ينتظر Cursor — spec: `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة (موثوق/توصيل سريع) | **غائب** — `components/store/StoreHeader.tsx:197-214` | ينتظر Cursor — spec: `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar (15,000 متجر / +1 مليون / 99.6%) | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | ينتظر Cursor — spec: `sticky-mini-cart-bar-2026-06-15.md` |

---

## ملاحظة: Compact Mode في StoreHeader

الكوميت `09dcbe4` أضاف `compact={hasBuilderLayout(store.theme_config)}` في `app/[slug]/layout.tsx:92`. المتاجر التي تستخدم Visual Builder تُعرض الآن في وضع slim strip بدلاً من Hero + floating card. هذا القرار متعمد لتجنب التعارض مع blocks المتجر المصمّمة. الـ baseline الرسمي (subdomain-store.png) يمثل متجراً بدون Visual Builder — الفجوة البصرية للمتاجر builder هي feature، لا drift.

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

# تقرير انحراف بصري — baseline-drift-2026-06-21

**تاريخ التشغيل:** 2026-06-21 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16) تقتصر على
إصلاح بانر مكرر وإضافة مسار visual builder — كلاهما خارج نطاق الانحراف البصري عن الـ baseline.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | الوصف | الملف | التأثير البصري |
|---------|-------|-------|----------------|
| `5f7bf39` | fix(marketplace): remove duplicate advertise banner on stores home | `app/page.tsx` | حذف بانر "أعلن الآن" مكرر — تصحيح نحو baseline |
| `2a4698d` | feat(storefront): phase 4c — visual builder (hybrid) | `app/[slug]/page.tsx` + `components/storefront/StorefrontBlocks.tsx` + `lib/storefront-builder.ts` | مسار builder للمتاجر التي استخدمت المحرر فقط — المتاجر بدون builder يبقى layout كما هو |

### تحليل التأثير البصري

**`5f7bf39`** — إزالة بانر "مساحة إعلان بانر واسعة" المكررة أسفل قسم المتاجر المميزة.
البانر الإعلاني الأول (أسفل قسم المنتجات) لا يزال موجوداً. لا drift — هذا تصحيح.

**`2a4698d`** — يضيف منطق `hasBuilderLayout()` لقراءة `theme_config.editor`:
- المتاجر **بدون** builder config (الغالبية): تُعرض layout `app/[slug]/page.tsx` بدون تغيير — لا drift
- المتاجر **مع** builder config: تُعرض `StorefrontBlocks` بدلاً من layout القياسي — مسار جديد خارج نطاق baseline الأصلي

ملاحظة: `StorefrontBlocks` يرث `StoreHeader` و`StoreChrome` من `layout.tsx` — الـ chrome الرئيسي محفوظ.

---

## حالة الفجوات البصرية المستمرة

لا تغيير في الحالة — نسخ محدَّث من تقرير 2026-06-16:

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

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

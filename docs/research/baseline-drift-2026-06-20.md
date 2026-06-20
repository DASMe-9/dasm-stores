# تقرير انحراف بصري — baseline-drift-2026-06-20

**تاريخ التشغيل:** 2026-06-20 (جولة أسبوعية — W30)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** ثمانية كوميتات جديدة منذ 2026-06-16، ستة منها تخص الـ visual builder لصاحب المتجر وقوالب الثيمات (لا تأثير على مسار المتسوق). كوميتان مسّا ملفات ذات صلة بالـ baseline:

1. **`5f7bf39`** (fix: remove duplicate advertise banner) — حذف بانر إعلاني مكرر أسفل قسم المتاجر المميزة. الـ baseline يُظهر بانراً واحداً فقط → هذا الكوميت يُقرّب الكود من الـ baseline. **لا انحراف.**
2. **`2a4698d`** (feat: phase 4c visual builder) — أضاف مسار `StorefrontBlocks` للمتاجر التي تستخدم الـ builder. المتاجر التقليدية (بدون `theme_config.editor`) تحتفظ بنفس تخطيط `app/[slug]/page.tsx` الكلاسيكي. **لا انحراف في المسار الافتراضي.**

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ 2026-06-16

| الكوميت | الوصف | الملف المعني | التأثير البصري |
|---------|-------|--------------|----------------|
| `26cc22e` | feat: redesign 6 store templates | `lib/themes/blocks/templates.ts` | قوالب builder — خارج نطاق baseline المتسوق |
| `5f7bf39` | fix: remove duplicate advertise banner | `app/page.tsx` | حذف بانر مكرر — يُقرّب من baseline |
| `2a4698d` | feat: phase 4c visual builder storefront | `app/[slug]/page.tsx` | مسار builder جديد — المسار الكلاسيكي محفوظ |
| `d987a13` | feat: visual builder phase 4b | `components/theme-editor/*` | داشبورد البائع فقط — لا تأثير على متسوق |
| `f6d90db` | feat: 10 new section blocks | `lib/themes/blocks/*` | داشبورد Builder — لا تأثير على متسوق |
| `c3bd613` | feat: AI block assistant | `components/theme-editor/*` | داشبورد Builder — لا تأثير على متسوق |
| `35dece8` | feat: surfaces, visual blocks | `components/theme-editor/*` | داشبورد Builder — لا تأثير على متسوق |
| `0f685d9` | feat: Shopify-style block theme editor | `components/theme-editor/*` | داشبورد Builder — لا تأثير على متسوق |

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث من التقرير السابق — لا تغيير في الحالة:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | ينتظر Cursor — `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor — `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor — `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | **غائب** | ينتظر Cursor — `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | ينتظر Cursor — `sticky-mini-cart-bar-2026-06-15.md` |
| HomeHeaderActions | زر "افتح متجرك" | **غائب** | ينتظر Cursor — `home-header-seller-cta-2026-06-16.md` |

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

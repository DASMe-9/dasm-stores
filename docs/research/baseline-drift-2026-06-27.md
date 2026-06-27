# تقرير انحراف بصري — baseline-drift-2026-06-27

**تاريخ التشغيل:** 2026-06-27 (جولة أسبوعية — السبت)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد يمس المسارين البصريين الرئيسيين.** الكوميتات الثمانية الجديدة منذ 2026-06-16 تركّزت على
storefront builder ومتاجر القوالب — خارج نطاق الـ baseline المرجعي الذي يصوّر متجراً غير-builder.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ 2026-06-16

| الكوميت | الوصف | الملفات المتأثرة | التأثير البصري |
|---------|-------|------------------|----------------|
| `f13b4c1` | fix(themes): drop fake testimonials & newsletter from default templates | `lib/themes/blocks/templates.ts` | قوالب builder فقط — خارج baseline |
| `56ee40c` | fix(storefront): drop cart-emptied store-switch banner | `components/store/StoreChrome.tsx` | banner مؤقت اختفى — غير موثّق في baseline |
| `60fd4bc` | feat(storefront): standard legal footer + policy pages | `app/[slug]/layout.tsx`, `StoreFooter.tsx`, `lib/legal/policies.ts` | footer قانوني جديد — خارج نطاق baseline |
| `e65d0a0` | fix(storefront): make products page discoverable in store nav | `StoreTabsNav.tsx` | nav المتجر — خارج baseline |
| `09dcbe4` | fix(storefront): drop duplicate chrome hero for builder stores | `app/[slug]/layout.tsx`, `StoreHeader.tsx` | builder stores فقط (compact=true) — غير موثّق في baseline |
| `8f7b63b` | feat(storefront): Salla-style landing — curated, less card-dominated | `StorefrontBlocks.tsx`, `ProductGrid.tsx` | builder landing + ProductGrid 6→4 col |
| `5f7bf39` | fix(marketplace): remove duplicate advertise banner on stores home | `app/page.tsx` | حذف بانر إعلانات مكرر — تحسين بصري |
| `2a4698d` | feat(storefront): phase 4c — visual builder hybrid | `app/[slug]/page.tsx` | builder path فقط |

### تفصيل `09dcbe4` — compact mode في StoreHeader

هذا الكوميت يُدخل prop جديد `compact={hasBuilderLayout(...)}` في `StoreLayout`:
- **Builder stores**: يُظهر شريط هوية نحيف بدلاً من Hero البانر + StoreInfoCard الطافية.
- **Non-builder stores** (نفس ما يصوّره الـ baseline): الـ `compact=false` — يبقى Hero البانر والـ StoreInfoCard كما هما.

→ **لا drift للـ baseline**.

### تفصيل `8f7b63b` — ProductGrid 6→4 columns

`ProductGrid.tsx` تغيّر من `grid-cols-6` إلى `grid-cols-4` على desktop. هذا مكوّن المتجر الفرعي (builder landing). الـ `ProductTile` في `app/page.tsx` (السوق الرئيسي) منفصل ولم يتغير.

→ **لا drift للـ baseline**.

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث من التقرير السابق — لا تغيير في الحالة:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة (شحن/ثقة/أمان/دعم) | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود (سطر 115 `app/page.tsx`) | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة (موثوق/توصيل سريع/الرياض) | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar (15,000 متجر / +1م / 99.6%) | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

# تقرير انحراف بصري — baseline-drift-2026-06-23

**تاريخ التشغيل:** 2026-06-23 (جولة أسبوعية — الاثنين)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16) تتضمن 13 كوميت تغطي:
- visual block builder (theme editor)
- Salla-style storefront landing (تغيير تكويني في `StorefrontBlocks`، لا يمس الـ baseline بالمعنى الانحداري)
- إضافة "المنتجات" لتنقل StoreHeader العلوي (تحسين، لا تراجع)
- إصلاح hero مكرر لمتاجر builder (`compact` prop في `StoreHeader`)
- حذف بانر إعلاني مكرر في marketplace

لا يوجد أي تغيير يسبّب تراجعاً بصرياً عن الـ baseline.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16 → 2026-06-23)

| الكوميت | التاريخ | الوصف | الملفات البصرية | التأثير |
|---------|---------|-------|----------------|---------|
| `e65d0a0` | 2026-06-21 | fix(storefront): make the products page discoverable in store nav | `StoreHeader.tsx` | يُضيف "المنتجات" للنافبار العلوي — تحسين اكتشافية، لا تراجع |
| `09dcbe4` | 2026-06-21 | fix(storefront): drop duplicate chrome hero for builder stores | `StoreHeader.tsx` | يُضيف `compact` prop للـ builder — لا تأثير على المتاجر العادية |
| `8f7b63b` | 2026-06-21 | feat(storefront): Salla-style landing | `ProductGrid.tsx`, `StorefrontBlocks.tsx`, `BlockRenderer.tsx` | شبكة منتجات builder: 6-up → 4-up، فئات أنظف — لا يمس `app/[slug]/page.tsx` غير-builder |
| `afd9d71` | 2026-06-21 | fix(storefront): image-with-text fallback | `StorefrontBlocks.tsx` | إصلاح block builder — خارج نطاق baseline |
| `5f45ab2` | 2026-06-21 | feat(stores/theme): visual block builder primary | متعددة (lib/themes) | بنية builder — خارج نطاق baseline المتسوق |
| `26cc22e` | 2026-06-17 | feat(theme/templates): redesign 6 store templates | `lib/themes/blocks/templates.ts` | قوالب builder — خارج نطاق baseline |
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` | حذف بانر مكرر — يُصحّح الـ baseline، لا يُحدث drift |
| `2a4698d` | 2026-06-17 | feat(storefront): phase 4c — hybrid builder render | متعددة | public storefront + builder — لا يمس المتاجر غير-builder |
| `d987a13` | 2026-06-17 | feat(dashboard/theme): phase 4b | متعددة | لوحة تحكم — خارج نطاق baseline المتسوق |
| `f6d90db` | 2026-06-17 | feat(dashboard/theme): phase 4a — 10 blocks | متعددة | لوحة تحكم — خارج نطاق baseline المتسوق |
| `c3bd613` | 2026-06-17 | feat(dashboard/theme): m3 — AI block assistant | متعددة | لوحة تحكم — خارج نطاق baseline المتسوق |
| `35dece8` | 2026-06-16 | feat(dashboard/theme): m2 — live iframe | متعددة | لوحة تحكم — خارج نطاق baseline المتسوق |
| `0f685d9` | 2026-06-16 | feat(dashboard/theme): Shopify-style block editor | متعددة | لوحة تحكم — خارج نطاق baseline المتسوق |

---

## تحليل الملفات البصرية المحورية

### الصفحة الرئيسية (`app/page.tsx`)

| العنصر | الـ baseline | الكود الحالي | الحالة |
|--------|-------------|-------------|--------|
| Hero: خلفية داكنة + عنوان + بحث | ✓ | `#021b1f` bg + "اكتشف متاجر ومنتجات داسم" + form بحث | **مطابق** |
| ProductTile: شبكة 2/3/4/6 أعمدة | ✓ | `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6` | **مطابق** |
| بانر إعلاني "ظهور أوسع" | ✓ | موجود (line 179) | **مطابق** |
| متاجر مميزة (5 بطاقات) | ✓ | `featuredStores.slice(0, 5)` | **مطابق** |
| تصفح الأقسام (بطاقات icons) | ✓ | `categories.map(...)` | **مطابق** |
| كل المتاجر (grid) | ✓ | `StoreCard` grid | **مطابق** |

### صفحة المتجر الفرعي (`app/[slug]/page.tsx` + `components/store/StoreHeader.tsx`)

| العنصر | الـ baseline | الكود الحالي | الحالة |
|--------|-------------|-------------|--------|
| Hero بانر المتجر (صورة/موشن) | ✓ | `store-hero-motion` + `h-36 md:h-52` | **مطابق** |
| بطاقة معلومات المتجر العائمة | ✓ | `-mt-8` card مع logo + اسم + موقع + رقم | **مطابق** |
| نافبار تنقل (الرئيسية/المنتجات) | ✓ | رابط الرئيسية + رابط المنتجات جديد (e65d0a0) | **مطابق + تحسين** |
| أقسام المتجر (pills) | ✓ | `visibleCategories.map(...)` | **مطابق** |
| شبكة المنتجات (ProductGrid) | ✓ | `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` | **مطابق** |

---

## حالة الفجوات البصرية المستمرة (موثّقة سابقاً، تنتظر Cursor)

| المكوّن | العنصر | الحالة | الـ spec المرجعي |
|---------|--------|--------|----------------|
| `ProductTile` (marketplace) | زر سلة دائري (`rounded-full`) | معلّق Cursor | `product-tile-cart-button-2026-06-14.md` |
| `ProductTile` (marketplace) | أيقونة قلب المفضلة | معلّق Cursor | `product-tile-wishlist-2026-06-11.md` |
| `ProductCard` (store pages) | أيقونة قلب المفضلة | معلّق Cursor | `product-card-store-wishlist-2026-06-12.md` |
| `StoreInfoCard` | وسوم ثقة (متجر موثوق / توصيل سريع) | معلّق Cursor | `store-info-trust-badges-2026-06-08.md` |
| Store (mobile) | Sticky Cart Bar | معلّق Cursor | `sticky-mini-cart-bar-2026-06-15.md` |
| `ProductCard` | زر Quick Add | معلّق Cursor | `product-card-quick-add-2026-06-13.md` |
| `ProductCard` | Sold-out overlay | معلّق Cursor | `product-card-sold-out-overlay-2026-06-14.md` |
| `HomeHeaderActions` | زر "افتح متجرك" للضيف | معلّق Cursor | `home-header-seller-cta-2026-06-16.md` |

> **ملاحظة W30:** التغيير `8f7b63b` (Salla-style landing) خفّض أعمدة شبكة builder من 6 إلى 4 — هذا التغيير لا يمس `app/[slug]/page.tsx` للمتاجر غير-builder. الفجوة البصرية الوحيدة المكتشفة حديثاً في ProductGrid هي شبكة `StorefrontBlocks` الخاصة بالـ builder وهي خارج نطاق الـ baseline.

---

## الخطوة التالية

لا تصحيح مطلوب. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

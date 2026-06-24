# تقرير انحراف بصري — baseline-drift-2026-06-24

**تاريخ التشغيل:** 2026-06-24 (جولة أسبوعية — الثلاثاء)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات الخمسة الجديدة منذ 2026-06-16 تُضيف عناصر أو تُحسّن التجربة دون إزالة أي عنصر من الـ baseline. الفجوات المعروفة تبقى بدون تغيير حالتها.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ 2026-06-16

| الكوميت | الوصف | الملفات | التأثير البصري |
|---------|-------|---------|----------------|
| `2a4698d` | feat(storefront): phase 4c — public storefront renders the visual builder (hybrid) | `app/[slug]/layout.tsx` + `app/[slug]/page.tsx` | Builder stores تعرض layout المحرر — خارج نطاق baseline اللقطتين |
| `5f7bf39` | fix(marketplace): remove duplicate advertise banner on stores home | `app/page.tsx` | حذف بانر ترويجي مكرر — البانر الرئيسي لا يزال موجوداً (السطر 179) ✓ |
| `8f7b63b` | feat(storefront): Salla-style landing — curated, less card-dominated | `ProductGrid.tsx` + `StorefrontBlocks.tsx` | ProductGrid: 6-up → 4-up على desktop **للمتاجر الفرعية فقط** — أقرب للـ baseline. "عرض الكل ←" مضاف لـ builder stores |
| `09dcbe4` | fix(storefront): drop duplicate chrome hero for builder stores | `StoreHeader.tsx` + `layout.tsx` | Builder stores → slim strip بدلاً من banner+card مكدّسين. **غير Builder stores: لا تغيير** |
| `e65d0a0` | fix(storefront): make the products page discoverable in store nav | `StoreHeader.tsx` + `StoreTabsNav.tsx` | رابط "المنتجات" مضاف للـ nav — إضافة لا إزالة |

---

## مقارنة تفصيلية مع الـ baseline

### marketplace-home.png

| المكوّن | الحالة في baseline | الحالة في الكود | التغيير منذ 16/06 | الحكم |
|---------|-------------------|-----------------|-------------------|-------|
| Hero (عنوان + بحث) | "اكتشف متاجر ومنتجات داسم" + شريط بحث | موجود `app/page.tsx:178` | لا تغيير | ✅ مطابق |
| أيقونات مزايا المنصة تحت البحث | صف 4 أيقونات (شحن/ثقة/أمان/دعم) | **غائب** | لا تغيير | ⚪ مقبول (قرار تجميد 2026-06-07) |
| ProductTile: شارة "ممول" | شارة تركواز "ممول" فوق الصورة | يُعرض "مميز" فقط عند `is_featured` — لا منطق sponsorship | لا تغيير | ⚪ مقبول (قرار تجميد) |
| ProductTile: زر سلة دائري | `rounded-full` | `rounded-xl` (السطر 115) | لا تغيير | 🟡 ينتظر Cursor (`product-tile-cart-button-2026-06-14`) |
| ProductTile: أيقونة قلب | overlay على الصورة | **غائب** | لا تغيير | 🟡 ينتظر Cursor (`product-tile-wishlist-2026-06-11`) |
| بانر الإعلان "ظهور أوسع" | بانر داكن مع CTA | موجود `app/page.tsx:179` | الـ duplicate حُذف، البانر الرئيسي سليم | ✅ مطابق |
| StatsBar (15,000 متجر / +1M) | شريط أرقام في الفوتر | **غائب** | لا تغيير | ⚪ مقبول (قرار تجميد) |

### subdomain-store.png

| المكوّن | الحالة في baseline | الحالة في الكود | التغيير منذ 16/06 | الحكم |
|---------|-------------------|-----------------|-------------------|-------|
| Hero banner (متجر غير builder) | بانر سينمائي داكن | `StoreHeader.tsx:139-186` — لا تغيير للمتاجر العادية | لا تغيير | ✅ مطابق |
| Floating store info card | -mt-8/10 card مع logo + اسم + موقع | `StoreHeader.tsx:189-237` — لا تغيير للمتاجر العادية | لا تغيير | ✅ مطابق |
| وسوم ثقة (موثوق / توصيل سريع) | صف badges تحت اسم المتجر | **غائب** | لا تغيير | 🟡 ينتظر Cursor (`store-info-trust-badges-2026-06-08`) |
| منتجات ProductCard: قلب + سلة | قلب overlay + زر سلة | **غائب** كلاهما `ProductCard.tsx` | لا تغيير | 🟡 ينتظر Cursor (`product-card-store-wishlist-2026-06-12`) |
| تبويب التنقل (4 روابط) | كل المنتجات / مميزة / سلة / أقسام | `app/[slug]/page.tsx:54-88` ✓ | "كل المنتجات" ← "الكل" (تحسين) | ✅ أحسن من baseline |
| ProductGrid (4-up store) | ~4 أعمدة على desktop | `lg:grid-cols-4` (بعد `8f7b63b`) | تحسين: من 6 → 4 | ✅ أقرب للـ baseline |

---

## عناصر جديدة لا تخالف الـ baseline

هذه الإضافات غير موجودة في الـ baseline لكنها لا تُزيل أي عنصر:

| العنصر | الملف + السطر | التقييم |
|--------|--------------|---------|
| رابط "المنتجات" في nav الهيدر | `StoreHeader.tsx:87-90` | إضافة مفيدة — baseline لا يُبطلها |
| "عرض الكل ←" في StorefrontBlocks | `StorefrontBlocks.tsx:79-85` | إضافة (builder stores فقط) — مطابق لأسلوب سلة |
| Compact mode للـ builder stores | `StoreHeader.tsx:103-136` | builder stores خارج نطاق baseline screenshots |

---

## الفجوات المستمرة (لا تغيير في الحالة)

| المكوّن | الانحراف | الـ spec المعني | الحالة |
|---------|---------|----------------|--------|
| ProductTile (marketplace) | زر سلة `rounded-xl` بدل `rounded-full` | `product-tile-cart-button-2026-06-14.md` | ينتظر Cursor |
| ProductTile (marketplace) | قلب المفضلة غائب | `product-tile-wishlist-2026-06-11.md` | ينتظر Cursor |
| ProductCard (store pages) | قلب + سلة غائبان | `product-card-store-wishlist-2026-06-12.md` | ينتظر Cursor |
| StoreInfoCard | وسوم الثقة غائبة | `store-info-trust-badges-2026-06-08.md` | ينتظر Cursor |
| Marketplace footer | StatsBar غائب | — | مقبول (قرار تجميد) |
| Store (mobile) | Sticky Cart Bar غائب | `sticky-mini-cart-bar-2026-06-15.md` | ينتظر Cursor |

---

## الخطوة التالية

لا تصحيح مطلوب. تكتمل المرحلتان 2 و3 وفق الجدول.

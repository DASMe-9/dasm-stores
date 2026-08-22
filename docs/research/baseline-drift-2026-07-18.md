# تقرير انحراف بصري — baseline-drift-2026-07-18

**تاريخ التشغيل:** 2026-07-18 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات السبعة التي لمست ملفات baseline منذ 2026-06-16 أجرت تغييرات هيكلية (CSS tokens، compact mode للـ builder stores، StoreFooter) دون أي تأثير على العناصر البصرية المحددة في baseline.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة التي لمست ملفات baseline منذ 2026-06-16

| الكوميت | التاريخ | الوصف | الملف المتأثر | التأثير البصري |
|---------|---------|-------|---------------|----------------|
| `5f7bf39` | 2026-06-17 | إزالة بانر إعلاني مكرر من الرئيسية | `app/page.tsx` | إزالة تكرار — لا drift |
| `09dcbe4` | 2026-06-21 | compact mode لـ builder stores في StoreHeader | `app/[slug]/layout.tsx` + `StoreHeader.tsx` | builder stores فقط — non-builder baseline محمي ✅ |
| `8f7b63b` | 2026-06-21 | تحسينات StorefrontBlocks (Salla-style landing) | `StorefrontBlocks.tsx` + `BlockRenderer.tsx` | builder stores فقط — خارج نطاق baseline ✅ |
| `56ee40c` | 2026-06-25 | حذف بانر "تم إفراغ السلة" من StoreChrome | `components/store/StoreChrome.tsx` | حذف عنصر غير موجود في baseline — تحسين UX ✅ |
| `60fd4bc` | 2026-06-25 | إضافة StoreFooter وصفحات قانونية | `app/[slug]/layout.tsx` | تحت منطقة viewport الـ baseline — خارج النطاق ✅ |
| `b95d2b6` | 2026-06-27 | إضافة CSS theme tokens (data-theme، CSS variables) | `app/[slug]/layout.tsx` | تغيير تقني — يُعيد تسمية الـ tokens لا البصر ✅ |
| `8b42fda` | 2026-06-27 | إعادة هيكلة ProductCard لاستخدام CSS tokens | `components/product/ProductCard.tsx` | نفس العناصر البصرية، tokens فقط تغيّرت ✅ |

---

## تدقيق الملفات مقابل baseline

### Hero (marketplace home — app/page.tsx)

| العنصر | الـ baseline | الحالة في الكود | القرار |
|--------|-------------|-----------------|--------|
| العنوان الرئيسي | "اكتشف متاجر ومنتجات داسم" | `<h1>اكتشف متاجر ومنتجات داسم</h1>` | ✅ متطابق |
| شريط البحث | rounded-full + زر "بحث" | `<form>` بـ `rounded-full` + `<button>بحث</button>` | ✅ متطابق |
| الخلفية الداكنة | `bg-[#021b1f]` | `bg-[#021b1f]` | ✅ متطابق |
| مساحة إعلانية | بانر "أعلن الآن" | `StoreAdSlot` + رابط "أعلن الآن" | ✅ متطابق |
| العناصر الزخرفية | HeroScene | `<HeroScene />` محفوظ | ✅ متطابق |

### ProductTile (marketplace — app/page.tsx)

| العنصر | الـ baseline | الحالة في الكود | القرار |
|--------|-------------|-----------------|--------|
| شارة "ممول" | موجودة | غائبة | 🟡 مقبول (قرار تجميد 2026-06-07) |
| زر سلة دائري | `rounded-full` | `rounded-xl` السطر 115 | 🔴 انحراف قديم — spec جاهز (product-tile-cart-button-2026-06-14.md) |
| أيقونة القلب (مفضلة) | موجودة | غائبة | 🔴 انحراف قديم — spec جاهز (product-tile-wishlist-2026-06-11.md) |
| السعر بـ "ر.س" | موجود | `{price.toFixed(0)} ر.س` السطر 114 | ✅ متطابق |

### StoreCard (all-stores — components/explore/StoreCard.tsx)

| العنصر | الـ baseline | الحالة في الكود | القرار |
|--------|-------------|-----------------|--------|
| شعار المتجر الدائري | دائري | `rounded-xl` (ليس `rounded-full`) | 🟡 ملاحظة — لم يُذكر كـ drift رسمي سابقاً |
| عداد المنتجات | موجود | `{store.products_count ?? 0} منتج` | ✅ متطابق |
| بانر المتجر | موجود | `h-32 overflow-hidden` + `img banner_url` | ✅ متطابق |

### صفحة المتجر الفرعي — StoreHeader.tsx

| العنصر | الـ baseline | الحالة في الكود | القرار |
|--------|-------------|-----------------|--------|
| Hero بانر | موجود | `store-hero-motion` + background/video/image السطر 132 | ✅ متطابق |
| بطاقة معلومات عائمة (-mt-8) | موجودة | `-mt-8 flex flex-col gap-...` السطر 180 | ✅ متطابق |
| شعار دائري في البطاقة | موجود | `h-16 w-16 rounded-[var(--r)]` السطر 181 | ✅ متطابق |
| المنطقة (الرياض) | موجودة | `MapPin + areaName` السطر 200 | ✅ متطابق (مشروط ببيانات المتجر) |
| وسوم ثقة | موجودة في baseline | غائبة | 🔴 انحراف قديم — spec جاهز (store-info-trust-badges-2026-06-08.md) |

### ملاحظة: compact mode لـ builder stores

يعرض `StoreHeader` الآن وضعاً مضغوطاً عند `hasBuilderLayout(store.theme_config) === true`. هذا لا يؤثر على الـ baseline لأن الـ baseline يُصور متجراً بالقالب الافتراضي (غير builder). المسار غير المضغوط محمي تماماً.

---

## حالة الفجوات البصرية المستمرة (من 2026-06-16)

لا تغيير في الحالة:

| المكوّن | العنصر | الحالة | قرار |
|---------|--------|--------|------|
| ProductTile | زر سلة `rounded-xl` | مستمر | spec product-tile-cart-button-2026-06-14.md — ينتظر Cursor |
| ProductTile | أيقونة قلب | غائب | spec product-tile-wishlist-2026-06-11.md — ينتظر Cursor |
| ProductCard (store) | أيقونة قلب | غائب | spec product-card-store-wishlist-2026-06-12.md — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | غائب | spec store-info-trust-badges-2026-06-08.md — ينتظر Cursor |
| Hero (marketplace) | أيقونات مزايا المنصة | غائب | مقبول (قرار تجميد) |
| ProductTile | شارة "ممول" | غائب | مقبول (قرار تجميد) |
| Marketplace footer | StatsBar | غائب | مقبول (قرار تجميد) |
| Store (mobile) | Sticky Cart Bar | غائب | spec sticky-mini-cart-bar-2026-06-15.md — ينتظر Cursor |

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

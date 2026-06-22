# تقرير انحراف بصري — baseline-drift-2026-06-22

**تاريخ التشغيل:** 2026-06-22 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد غير مقصود.** ستة كوميتات جديدة منذ الجولة الأخيرة (2026-06-16 → 2026-06-22) — جميعها تحسينات مقصودة لا تُحدث انحرافًا عن الـ baseline. تمت إزالة بانر إعلاني مكرر بقرار إنتاجي، وأُضيفت واجهة compact للمتاجر Builder، وأُعيد تسمية تبويب في الـ tabs nav.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16 → 2026-06-22)

| الكوميت | الوصف | الملفات | التأثير البصري |
|---------|-------|---------|----------------|
| `e65d0a0` | fix: إضافة "المنتجات" لنافذة الـ sticky nav (#195) | `StoreHeader.tsx`, `StoreTabsNav.tsx` | رابط إضافي في الهيدر — تحسين، لا تراجع |
| `09dcbe4` | fix: إزالة تضارب hero لمتاجر Builder (#194) | `app/[slug]/layout.tsx`, `StoreHeader.tsx` | Compact mode للـ builder stores فقط — المتاجر الكلاسيكية غير متأثرة |
| `8f7b63b` | feat: Salla-style landing (#193) | `ProductGrid.tsx`, `StorefrontBlocks.tsx` | تغيير `lg:grid-cols-6` → `lg:grid-cols-4` في صفحات المتجر — تقترب من الـ baseline |
| `afd9d71` | fix: image-with-text تدهور نظيف بلا صورة (#192) | `BlockRenderer.tsx` | Builder blocks فقط — خارج نطاق baseline |
| `5f45ab2` | feat: visual block builder (#190) | `SellerShell.tsx`, `lib/themes/` | لوحة تحكم البائع — خارج نطاق baseline المتسوق |
| `5f7bf39` | fix: إزالة بانر إعلاني مكرر (#181) | `app/page.tsx` | إزالة متعمدة لبانر ثانٍ ("مساحة إعلان بانر واسعة") — قرار إنتاجي |
| `2a4698d` | feat: storefront يعرض visual builder (#180) | `app/[slug]/page.tsx`, `StorefrontBlocks.tsx` | Builder stores تعرض blocks — المتاجر الكلاسيكية غير متأثرة |

---

## تحليل مكوّن بمكوّن

### 1. Hero الصفحة الرئيسية (app/page.tsx)
- **العنوان "اكتشف متاجر ومنتجات داسم":** ✅ مطابق للـ baseline
- **شريط البحث:** ✅ مطابق
- **بانر إعلاني "ظهور أوسع بين منتجات المتاجر":** ✅ موجود ومطابق
- **البانر الثاني "مساحة إعلان بانر واسعة":** حُذف في `5f7bf39` — كان مكررًا وغير ضروري. قرار إنتاجي. التأثير على الـ baseline: الصورة المرجعية ربما التقطت حالة قبل الحذف، لكنه تصحيح مقصود لا يُعدّ تراجعًا.

### 2. ProductTile (marketplace)
- **زر السلة:** `rounded-xl` — لا تغيير. لا يزال انحرافًا قائمًا (معلّق spec `product-tile-cart-button-2026-06-14.md`).
- **أيقونة القلب:** غائبة — لا تغيير. معلّق spec `product-tile-wishlist-2026-06-11.md`.
- **شارة "ممول":** غائبة — مقبول بقرار التجميد 2026-06-07.

### 3. ProductGrid (صفحات المتجر)
- **تغيير `lg:grid-cols-6` → `lg:grid-cols-4`:** بطاقات أكبر وأقل ازدحامًا. يُقرّب الشكل من الـ baseline (`subdomain-store.png` يُظهر شبكة 3-4 بطاقات). **تحسين نحو الـ baseline، لا انحراف عنه.**

### 4. StoreCard (المتجر في explore)
- لم يُلمس. الفجوات القائمة (عداد المنتجات، شارة متجر موثوق) لا تغيير.

### 5. StoreHeader (صفحة المتجر الفرعي)
- **Hero banner + floating card:** ✅ للمتاجر الكلاسيكية بلا تغيير
- **إضافة رابط "المنتجات" في sticky nav:** تحسين UX — ليس في الـ baseline لكنه لا يكسره
- **Compact mode (builder stores):** يُقلّص Chrome للـ builder stores تحاشيًا للتضارب. لا تأثير على المتاجر الكلاسيكية
- **Trust badges ("متجر موثوق", "توصيل سريع"):** لا تغيير — انحراف قائم (معلّق spec `store-info-trust-badges-2026-06-08.md`)

---

## حالة الفجوات البصرية المستمرة

لا تغيير في الحالة منذ 2026-06-16:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | غائب | مقبول بقرار التجميد 2026-06-07 |
| ProductTile | شارة «ممول» | غائب | مقبول بقرار التجميد |
| ProductTile | زر سلة دائري `rounded-full` | `rounded-xl` | spec معلّق `product-tile-cart-button-2026-06-14.md` |
| ProductTile | أيقونة قلب (مفضلة) | غائب | spec معلّق `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب | غائب | spec معلّق `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | غائب | spec معلّق `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | غائب | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | غائب | spec معلّق `sticky-mini-cart-bar-2026-06-15.md` |

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

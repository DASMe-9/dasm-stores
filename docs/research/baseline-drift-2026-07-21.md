# تقرير انحراف بصري — baseline-drift-2026-07-21

**تاريخ التشغيل:** 2026-07-21 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift حرج جديد.** الكوميتات السبعة الجديدة منذ 2026-06-16 تتمحور حول:
- إعادة هيكلة CSS tokens للـ storefront (لا انحراف بصري بنيوي للمتسوق)
- إزالة بانر إعلاني مكرر في marketplace (تصحيح لا drift)
- إضافة مسار builder hybrid لصفحة المتجر (الـ non-builder path لا يزال سليماً)
- تبسيط StoreChrome (حذف بانر "تم إفراغ السلة")

تم اكتشاف انحراف بنيوي **سابق غير موثَّق** في مكوّن StoreCard. موثَّق أدناه كتنبيه، ولا يمنع الانتقال للمرحلة 2.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ 2026-06-16

| الكوميت | الوصف | الملفات | التأثير البصري |
|---------|-------|---------|----------------|
| `8b42fda` | refactor: storefront components to tokens | ProductCard, ProductGrid, ProductImage, StoreHeader, StoreTabsNav, StorefrontBlocks | تحويل قيم hard-coded إلى CSS tokens — لا تغيير بنيوي، أُضيفت شارة خصم `discountPct` جديدة في ProductCard |
| `b95d2b6` | feat: add storefront theme tokens | `app/[slug]/layout.tsx`, `styles/globals.css`, `lib/themes/` | إضافة نظام CSS vars — أساسي لا بصري مباشر |
| `5f7bf39` | fix: remove duplicate advertise banner on stores home | `app/page.tsx` | حذف بانر إعلاني مكرر — تصحيح، لا drift |
| `2a4698d` | feat: storefront renders visual builder (hybrid) | `app/[slug]/page.tsx` | المتاجر التي تستخدم builder تعرض `StorefrontBlocks`؛ المتاجر الأخرى تحتفظ بالـ layout القديم |
| `09dcbe4` | fix: drop duplicate chrome hero for builder stores | `app/[slug]/layout.tsx`, `components/store/StoreHeader.tsx` | المتاجر ذات builder تحصل على شريط compact؛ المتاجر العادية تحتفظ بـ Hero + StoreInfoCard كاملة |
| `60fd4bc` | feat: standard legal footer + policy pages | `app/[slug]/layout.tsx`, `app/[slug]/p/[doc]/page.tsx`, `components/store/StoreFooter.tsx` | صفحات قانونية جديدة — خارج نطاق baseline |
| `e65d0a0` | fix: make products page discoverable in store nav | `components/store/StoreHeader.tsx`, `components/store/StoreTabsNav.tsx` | إصلاح رابط تنقل — بصري ثانوي |

---

## تقييم مكوّن بمكوّن

### Hero (marketplace) — `app/page.tsx`

| العنصر | الـ baseline | الكود الحالي | التقييم |
|--------|--------------|--------------|---------|
| العنوان الرئيسي | "اكتشف متاجر ومنتجات" | `اكتشف متاجر ومنتجات داسم` ✅ | مطابق |
| شريط البحث | حقل + قائمة نطاق + زر | حقل + زر (بلا قائمة نطاق) | فجوة مقبولة بقرار التجميد 2026-06-07 |
| خلفية داكنة + مشهد بصري | `bg-[#021b1f]` + `HeroScene` ✅ | مطابق | ✅ |
| أيقونات المزايا (شحن/ثقة/أمان) | موجودة في baseline | **غائبة** | مقبول بقرار التجميد |
| AdSlot | شارة "مساحة إعلان" | `StoreAdSlot variant="hero"` ✅ | مطابق |

### ProductTile (marketplace) — `app/page.tsx`

| العنصر | الـ baseline | الكود الحالي (السطر) | التقييم |
|--------|--------------|---------------------|---------|
| شارة "ممول" | موجودة | `is_featured` → "مميز" فقط | مقبول بقرار التجميد |
| زر سلة دائري | `rounded-full` | `rounded-xl` (س. 115) | **drift مستمر** — spec ينتظر Cursor |
| أيقونة قلب (مفضلة) | موجودة | **غائبة** | spec ينتظر Cursor |
| السعر بـ"ر.س" | موجود | `{price.toFixed(0)} ر.س` ✅ | مطابق |

### ProductCard (store pages) — `components/product/ProductCard.tsx`

| العنصر | الـ baseline | الكود الحالي | التقييم |
|--------|--------------|--------------|---------|
| بطاقة عمودية + صورة | ✅ | `aspect-[4/5]` ✅ | مطابق |
| شارة "مميز" | ✅ | `is_featured` → "مميز" ✅ | مطابق |
| شارة خصم % | غير محدد في baseline | **مضافة حديثاً** `discountPct` | إضافة إيجابية — لا drift |
| أيقونة قلب (مفضلة) | موجودة في baseline | **غائبة** | spec ينتظر Cursor |
| زر سلة | موجود في baseline | **غائب** (الكارد يرتبط بصفحة المنتج) | spec ينتظر Cursor |

### StoreCard (كل المتاجر) — `components/explore/StoreCard.tsx`

⚠️ **تنبيه: انحراف بنيوي سابق — لم يُوثَّق في تقارير سابقة**

| العنصر | الـ baseline | الكود الحالي | التقييم |
|--------|--------------|--------------|---------|
| التخطيط | "بطاقة أفقية فاتحة" | **بطاقة عمودية** مع بانر 128px | ❌ drift بنيوي سابق |
| الشعار | "أيقونة دائرية" | `rounded-xl` (ليس `rounded-full`) | ❌ drift |
| زر "زيارة المتجر" | موجود بحدود تركواز | **غائب** — البطاقة كلها link | ❌ drift |
| عدد المنتجات | موجود | `{products_count} منتج` ✅ | مطابق |
| الموقع الجغرافي | غير محدد في baseline | `areaName` ✅ | إضافة جيدة |

> **ملاحظة:** `git log --follow components/explore/StoreCard.tsx` يُظهر 3 كوميتات قديمة فقط (checkout + settings فقط)، مما يعني أن هذا التخطيط الجديد سابق لبداية رصد الـ guardian. ليس regression جديد — لكنه يستحق spec مستقبلاً.
>
> **الملفات المتأثرة:** `components/explore/StoreCard.tsx` (السطور 18-73)
> **توصية:** إضافة `data-testid="visit-btn"` + نص "زيارة المتجر" كـ inline span في `p-4` div. يحوّل الانحراف إلى baseline جديد دون إعادة هيكلة.

### Hero + StoreInfoCard (store subdomain) — `components/store/StoreHeader.tsx`

| العنصر | الـ baseline | الكود الحالي | التقييم |
|--------|--------------|--------------|---------|
| Hero بانر | خلفية داكنة + أنيميشن | `store-hero-motion store-hero-{motion}` ✅ | مطابق للمتاجر العادية |
| بطاقة المتجر العائمة | بطاقة بيضاء `-mt-8` | `-mt-8` + `backdrop-blur` ✅ | مطابق |
| شعار دائري | `rounded-full` | `rounded-[var(--r)]` (قيمة token) | متغير حسب الثيم |
| وسوم ثقة (موثوق/سريع) | الرياض + موثوق + توصيل سريع | **غائبة** | spec `store-info-trust-badges-2026-06-08.md` ينتظر Cursor |
| المتاجر ذات builder | hero كامل | **compact strip فقط** | ميزة مقصودة، لا drift |

---

## جدول الفجوات البصرية المستمرة (محدَّث)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | غائب | مقبول بقرار التجميد 2026-06-07 |
| ProductTile | شارة «ممول» | غائب | مقبول بقرار التجميد |
| ProductTile | زر سلة `rounded-xl` بدل `rounded-full` | `rounded-xl` | spec `product-tile-cart-button-2026-06-14.md` ينتظر Cursor |
| ProductTile | أيقونة قلب (مفضلة) | غائب | spec `product-tile-wishlist-2026-06-11.md` ينتظر Cursor |
| ProductCard (store) | أيقونة قلب (مفضلة) | غائب | spec `product-card-store-wishlist-2026-06-12.md` ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | غائب | spec `store-info-trust-badges-2026-06-08.md` ينتظر Cursor |
| Marketplace footer | StatsBar | غائب | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | غائب | spec `sticky-mini-cart-bar-2026-06-15.md` ينتظر Cursor |
| StoreCard (كل المتاجر) | بطاقة أفقية + زر زيارة + شعار دائري | انحراف بنيوي | **مُرصَد هذه الجولة** — spec مرشح لجولة لاحقة |

---

## الخطوة التالية

لا تصحيح بصري مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

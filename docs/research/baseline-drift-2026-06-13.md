# تقرير انحراف بصري — baseline-drift-2026-06-13

**تاريخ التشغيل:** 2026-06-13 (تشغيل يدوي — السبت)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-11.md` (لا انحراف جديد)

---

## ملخص تنفيذي

**لا يوجد drift جديد حرج منذ آخر تشغيل (2026-06-11).** الكوميتان الجديدتان تخصّان dashboard الاستيراد وصفحة التسجيل فقط، وكلاهما خارج نطاق الـ baseline المراقب.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-12)

| الكوميت | الوصف | الملف المتأثر | التأثير البصري |
|---------|-------|---------------|----------------|
| `5589c30` | Improve store import dashboard UX | `pages/dashboard/import.tsx` | dashboard فقط — خارج نطاق baseline المتسوق |
| `ad1943b` | trim store-owner signup form to essentials | `pages/auth/signup.tsx` | صفحة تسجيل — خارج نطاق baseline |

كلا الملفين في مسارات لا يشملها الـ baseline (`pages/dashboard/`, `pages/auth/`). لا تأثير على: `app/page.tsx`، `app/[slug]/page.tsx`، `components/product/ProductCard.tsx`، `components/explore/StoreCard.tsx`.

---

## مراجعة المكوّنات الرئيسية

### Hero (marketplace) — `app/page.tsx`

| العنصر | الـ baseline | الحالة الراهنة | القرار |
|--------|-------------|-----------------|--------|
| العنوان الرئيسي | موجود | ✅ "اكتشف متاجر ومنتجات داسم" | مطابق |
| شريط البحث | موجود | ✅ form + Search icon | مطابق |
| الخلفية الداكنة | `#021b1f` | ✅ `bg-[#021b1f]` | مطابق |
| مساحة إعلان رئيسية | شارة | ✅ `StoreAdSlot variant="hero"` | مطابق |
| أيقونات مزايا المنصة | موجودة في README | **غائب** | مقبول بقرار التجميد |

### ProductTile (marketplace) — `app/page.tsx` السطر 88–122

| العنصر | الـ baseline | الحالة الراهنة | القرار |
|--------|-------------|-----------------|--------|
| شارة "ممول" | موجودة | **غائب** | مقبول بقرار التجميد |
| أيقونة قلب (مفضلة) | موجودة | **غائب** | spec `product-tile-wishlist-2026-06-11.md` ينتظر Cursor |
| زر السلة | دائري (`rounded-full`) | ⚠️ `rounded-xl` — سطر 115 | **موثّق أدناه** |
| السعر بـ"ر.س" | موجود | ✅ | مطابق |

### StoreCard — `components/explore/StoreCard.tsx`

| العنصر | الـ baseline | الحالة الراهنة | القرار |
|--------|-------------|-----------------|--------|
| الشعار الدائري | دائري | `h-14 w-14 rounded-xl` | **موثّق أدناه** |
| عداد المنتجات | موجود | ✅ `{store.products_count} منتج` | مطابق |
| زر "زيارة المتجر" | موجود بحدود تركواز | **غائب** | محل spec هذه الجولة |

### شريط الإحصائيات السفلي

| العنصر | الـ baseline | الحالة الراهنة | القرار |
|--------|-------------|-----------------|--------|
| StatsBar (15,000 / 1M / 99.6%) | موجود | **غائب** | مقبول بقرار التجميد |

### صفحة المتجر الفرعي — `app/[slug]/layout.tsx` + `app/[slug]/page.tsx`

لا تغييرات في كلا الملفين في الكوميتات الأخيرة. الـ StoreHeader لا يزال يُحمَّل عبر الـ layout. لا انحراف.

---

## ملاحظتان بصريتان للتوثيق (لا تمنعان الجولة)

### 1. زر سلة ProductTile — `rounded-xl` بدلاً من `rounded-full`

**الملف:** `app/page.tsx` السطر 115
**الـ baseline يُشير:** "زر سلة صغير دائري" (من `components-inventory.md`: "زر سلة صغير")
**الحالة الراهنة:**
```tsx
className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 ..."
```
**التوصية:** تغيير `rounded-xl` → `rounded-full` لمطابقة الـ baseline الدائري. جهد سطر واحد.
**الأولوية:** 🟡 متوسطة — تحسين بصري غير حرج.

### 2. شعار StoreCard — `rounded-xl` بدلاً من `rounded-full`

**الملف:** `components/explore/StoreCard.tsx` السطر 35
**الـ baseline يُشير:** "أيقونة/شعار دائري" (`components-inventory.md`)
**الحالة الراهنة:**
```tsx
<div className="... h-14 w-14 ... rounded-xl ...">
```
**التوصية:** تغيير `rounded-xl` → `rounded-full` لتحقيق الشكل الدائري الكامل.
**الأولوية:** 🟡 متوسطة — يُضاف لـ spec StoreCard القادم.

---

## حالة الفجوات المستمرة (من تقارير سابقة)

| المكوّن | العنصر | الحالة | المرجع |
|---------|--------|--------|--------|
| ProductCard (marketplace) | شارة «ممول» | غائب — مقبول | قرار التجميد |
| ProductCard (marketplace) | أيقونة قلب | غائب | spec `product-tile-wishlist-2026-06-11` — ينتظر Cursor |
| ProductCard (store) | أيقونة قلب | غائب | spec `product-card-store-wishlist-2026-06-12` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | غائب | spec `store-info-trust-badges-2026-06-08` — ينتظر Cursor |
| StoreCard | زر "زيارة المتجر" | غائب | محل spec هذه الجولة |
| Marketplace footer | StatsBar | غائب — مقبول | قرار التجميد |

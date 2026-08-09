# تقرير انحراف بصري — baseline-drift-2026-08-09

**تاريخ التشغيل:** 2026-08-09 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md`
**الفجوة الزمنية:** 7 أسابيع ونصف منذ آخر تشغيل (2026-06-16)

---

## ملخص تنفيذي

**تم رصد drift جديد وجوهري.** الكوميت `013f987` + `2a9372c` (2026-07-30) بعنوان "elevate DASM Stores marketplace homepage" غيّرا `app/page.tsx` بـ 833 إضافة و112 حذف. الـ baseline لم يُحدَّث عبر PR رسمي بعنوان `baseline-update` كما تشترط `docs/design/baseline/README.md`.

**قرار المرحلة:** drift جديد موجود → لا تتجاوز المرحلة 2. الـ spec مؤجل لحين تحديث الـ baseline.

---

## الكوميتات الجديدة على الملفات المحمية (2026-06-16 → 2026-08-09)

| الكوميت | التاريخ | الوصف | الملفات المتأثرة | التأثير البصري |
|---------|---------|-------|------------------|----------------|
| `013f987` | 2026-07-30 | elevate DASM Stores marketplace homepage | `app/page.tsx`, `components/home/HomeHeaderActions.tsx` | تغيير جذري في الـ Hero والهيدر |
| `2a9372c` | 2026-07-30 | fix homepage light and dark theme coverage | `app/page.tsx` | تعديلات ألوان Hero بين الوضعين |
| `8b42fda` | 2026-06-27 | refactor storefront components to tokens | `components/product/ProductCard.tsx` | انتقال للـ CSS variables |
| `b95d2b6` | 2026-06-27 | add storefront theme tokens | styles/ + components/ | تعريف منظومة CSS variables جديدة |

---

## المرحلة 1 — تحليل الانحرافات البصرية الجديدة

### 1. Hero (marketplace) — انحراف جوهري جديد

**الملف:** `app/page.tsx` السطر 452–499
**الكوميت:** `013f987` (2026-07-30)

| العنصر | الـ baseline | الحالة في الكود | نوع الانحراف |
|--------|-------------|-----------------|--------------|
| خلفية Hero (light mode) | "شريط علوي داكن" `dark/navy` | `bg-[#eaf2f1]` (فاتح جداً) | **انحراف جديد** |
| المحتوى البصري الأيمن | صور منتجات/أغراض ثلاثية الأبعاد | مكوّن `CommercePassport` (بطاقة خطوات) | **انحراف جديد** |
| شريط البحث | مدمج داخل قسم الـ Hero | قسم مستقل منفصل (السطر 501–529) | **انحراف جديد** |
| قائمة نطاق البحث («الكل») | ظاهرة بجانب حقل البحث | غائبة — حقل نص فقط | **انحراف جديد** |
| صف أيقونات مزايا المنصة | موجود (شحن/ثقة/أمان/دعم) | غائب | مقبول بقرار التجميد 2026-06-07 |
| شارة "مساحة إعلان رئيسية" | موجودة في الزاوية | غائبة | مقبول بقرار التجميد |

**وصف تفصيلي للانحراف:**

الـ Hero في الـ baseline صُمِّم بخلفية داكنة (`dark/navy`) مع تأثير تركواز سائل وجسيمات وخطوط ضوء، ويحتل الجزء الأيمن صور منتجات وأغراض معلقة ثلاثية الأبعاد، مع شريط بحث أبيض كبير مدمج فيه.

الكود الحالي بعد الترقية يعرض:
- خلفية **فاتحة** في light mode (`bg-[#eaf2f1]`) مع تدرج شعاعي خفيف (`radial-gradient`)
- مكوّن `<CommercePassport>` (بطاقة خطوات النمو) بدلاً من الصور ثلاثية الأبعاد
- شريط البحث **خارج** Hero في `<section>` مستقل تحته مباشرة
- لا قائمة نطاق للبحث

**توصية الاسترجاع (كتوصية فقط، لا تُنفَّذ):**

لإعادة Hero لمطابقة الـ baseline:
- السطر 453: تغيير `bg-[#eaf2f1]` → `bg-[#081c2c]` في كلا الوضعين
- السطر 497: استبدال `<CommercePassport storeCount={...} />` بعنصر صور منتجات ثلاثية الأبعاد
- نقل كتلة البحث (السطر 501–529) لتكون داخل `<section data-testid="platform-hero">` وإضافة قائمة نطاق

**أو:** فتح PR باسم `baseline-update` لتثبيت الـ baseline على الشكل الجديد المعتمد.

---

### 2. قسم "لأصحاب المتاجر" — إضافة جديدة غير موجودة في الـ baseline

**الملف:** `app/page.tsx` السطر 531–579
**الكوميت:** `013f987` (2026-07-30)

قسم `#for-merchants` الجديد يعرض شبكة 2×2 لـ `merchantCapabilities`. هذا القسم غير موجود في لقطة الـ baseline. لا يُعدّ رجوعاً وإنما إضافة — لكن يوسّع الفجوة بين الكود والـ baseline.

---

### 3. HomeHeaderActions — تغيير جزئي مطابق للـ spec المعلق

**الملف:** `components/home/HomeHeaderActions.tsx`
**الكوميت:** `013f987` (2026-07-30)

تم تنفيذ توصية الـ spec `home-header-seller-cta-2026-06-16.md` جزئياً:
- أُضيف زر "افتح متجرك" (السطر 138–144) للضيف بلون `#0e7c66` ✓
- أُضيفت أيقونة `<Store>` داخل الزر ✓
- يظهر على `md:inline-flex` (الـ spec اقترح `sm:inline-flex`) — فارق طفيف
- زر تسجيل الدخول لا يزال موجوداً ✓

هذا **التزام بالـ spec** وليس انحرافاً.

---

### 4. ProductCard (store pages) — انتقال لـ CSS variables

**الملف:** `components/product/ProductCard.tsx`
**الكوميت:** `8b42fda` (2026-06-27)

المكوّن انتقل من ألوان Tailwind ثابتة (`bg-emerald-...`) إلى منظومة CSS variables (`var(--c-surface)` إلخ). لا تغيير في البنية البصرية، لكن الألوان الآن تتبع ثيم المتجر. تم كذلك إضافة badge "خصم X%" (`discountPct`) — إضافة بصرية جديدة غير موجودة في الـ baseline لكن إيجابية.

الفجوات المقبولة السابقة في `ProductCard.tsx` لا تزال قائمة:
- أيقونة قلب (مفضلة) — `product-card-store-wishlist-2026-06-12.md` ينتظر Cursor

---

## حالة الفجوات البصرية المستمرة (تحديث من 2026-06-16)

| المكوّن | العنصر | الحالة | القرار |
|---------|--------|--------|--------|
| Hero (marketplace) | خلفية داكنة | **انحراف جديد** `013f987` | يتطلب baseline-update PR |
| Hero (marketplace) | صور منتجات ثلاثية الأبعاد | **انحراف جديد** `013f987` | يتطلب baseline-update PR |
| Hero (marketplace) | بحث مدمج في Hero | **انحراف جديد** `013f987` | يتطلب baseline-update PR |
| Hero (marketplace) | أيقونات مزايا المنصة | غائب | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | غائب — «مميز» بدلاً منها | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري | `rounded-xl` في الكود | `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب | غائب | `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب | غائب | `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | غائب | `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | غائب | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | غائب | `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## الإجراء المطلوب من المالك

وُجد drift جوهري جديد في `app/page.tsx` نتيجة الترقية في `013f987` (2026-07-30). الـ baseline لم يُحدَّث عبر الإجراء الرسمي.

**الخيارات المتاحة:**

1. **تحديث الـ baseline:** فتح PR منفصل بعنوان `baseline-update` يتضمن لقطات جديدة تعكس الـ Hero الجديد و`CommercePassport`. هذا الإجراء يُعيد تزامن الـ guardian مع الكود الحالي.

2. **الرجوع للتصميم القديم:** إذا كانت الترقية غير مقصودة، يُعاد Hero لحالته السابقة (خلفية داكنة + صور ثلاثية الأبعاد + بحث مدمج).

**حتى يتم أحد الإجراءين، الـ Phase 3 (توليد spec) مُوقَف لهذه الجولة.**

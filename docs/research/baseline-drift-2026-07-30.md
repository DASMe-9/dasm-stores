# تقرير انحراف بصري — baseline-drift-2026-07-30

**تاريخ التشغيل:** 2026-07-30 (جولة أسبوعية — الأربعاء)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**يوجد drift جديد — مرحلتان 2 و3 مُعلَّقتان.**

تم اكتشاف انحرافين بصريين جديدين ناتجَين عن الكوميت `013f987` (2026-07-30 — "[codex] elevate DASM Stores marketplace homepage"):

1. **Hero section أُعيد بناؤه بالكامل** — البنية والمحتوى تغيّرا جذرياً.
2. **زر الـ ProductTile تغيّر وجهته وأيقونته** — من رابط السلة (ShoppingCart) إلى رابط تفصيل المنتج (ArrowLeft).

**ملاحظة إيجابية:** تم تنفيذ توصية W29 — زر "افتح متجرك" في الهيدر للضيوف. Spec `home-header-seller-cta-2026-06-16.md` مُنجَز.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `5f7bf39` | 2026-06-17 | إزالة بانر إعلاني مكرر | `app/page.tsx` | طفيف — تنظيف |
| `8b42fda` | 2026-06-27 | إعادة هيكلة مكوّنات المتجر لتوكنز التصميم | `components/product/ProductCard.tsx` و غيره | بصرياً معادل — تغيير في الفئات فقط |
| `013f987` | 2026-07-30 | "elevate DASM Stores marketplace homepage" | `app/page.tsx` + `components/home/HomeHeaderActions.tsx` | **تغيير جوهري — يُسبب drift** |

---

## الانحراف #1 — Hero section أُعيد بناؤه بالكامل

**الملف:** `app/page.tsx`
**السطور:** `447–495` (الحالة الراهنة)
**كوميت التغيير:** `013f987` (2026-07-30)

### الوصف البصري

| العنصر | الـ Baseline (متوقع) | الحالة الراهنة |
|--------|---------------------|----------------|
| خلفية Hero | `bg-[#021b1f]` — أخضر داكن عميق | `bg-[#081c2c]` — كحلي داكن |
| محتوى Hero | أنيميشن منتجات (HeroScene) + بطاقات أيقونات + سلة تسوق + `StoreAdSlot` مضمَّن | عنوان نصي + CommercePassport widget ثنائي الأعمدة |
| شريط البحث | داخل قسم Hero بـ `rounded-full` + `rounded-full` للزر | قسم منفصل أسفل Hero بـ `rounded-2xl` |
| زر التحويل في Hero | غائب | "أنشئ متجرك" + "استكشف السوق" |
| شارة "مساحة إعلان رئيسية" | غائبة (مقبولة بقرار تجميد 2026-06-07) | غائبة (بلا تغيير) |

### توصية الاسترجاع (للمراجعة فقط — لا تنفَّذ)

لا يُوصى باسترجاع كامل — هذا تطوير معماري متعمَّد وليس رجعة غير مقصودة.
التوصية: مراجعة بشرية لتقرير ما إذا كان `CommercePassport` يُمثّل الـ baseline الجديد أم يجب تعديله.

---

## الانحراف #2 — زر ProductTile: وجهة الرابط وأيقونته تغيّرا

**الملف:** `app/page.tsx`
**السطور:** `235–241` (الحالة الراهنة)
**كوميت التغيير:** `013f987` (2026-07-30)

### الوصف البصري

| العنصر | قبل `013f987` | الحالة الراهنة |
|--------|---------------|----------------|
| الأيقونة | `ShoppingCart` | `ArrowLeft` |
| الوجهة | `/${storeSlug}/cart` | `/${storeSlug}/products/${productId}` |
| الشكل | `rounded-xl` | `rounded-xl` (بلا تغيير) |
| الـ aria-label | `فتح سلة {storeName}` | `عرض {productName}` |

### الأثر على الـ Specs المعلَّقة

Spec `product-tile-cart-button-2026-06-14.md` كان يستهدف تحويل الزر إلى `rounded-full` مع إبقاء وجهته للسلة. هذا الـ spec يحتاج مراجعة — الكود الحالي غيّر الزر لرابط تفصيل منتج، فلم تعد فكرة "زر سلة دائري" قابلة للتطبيق كما صِيغت.

### توصية الاسترجاع (للمراجعة فقط — لا تنفَّذ)

إن أُريد استعادة سلوك السلة:
```
// السطر 235 (قبل) كان:
<Link href={`/${product.storeSlug}/cart`} className="... rounded-xl ..." aria-label={`فتح سلة ${product.storeName}`}>
  <ShoppingCart className="h-4 w-4" />
</Link>
```
التوصية: مراجعة بشرية لتقرير ما إذا كان "رابط تفصيل المنتج" هو السلوك المقصود أم خطأ في الـ refactor.

---

## ملاحظة إيجابية — Spec W29 مُنجَز تلقائياً

**Spec:** `home-header-seller-cta-2026-06-16.md`
**الحالة:** ✅ **مُنجَز** في `013f987`

`HomeHeaderActions.tsx` يعرض الآن للضيف زرَّين:
- `افتح متجرك` → `/auth/signup` (أخضر، مع أيقونة Store)
- `تسجيل الدخول` → `/auth/login?returnUrl=/dashboard`

هذا يطابق توصية W29 باستلهام من Shopify header CTA. لا يلزم spec جديد لهذا المكوّن.

---

## حالة الفجوات البصرية المستمرة (محدَّث)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | بنية الـ Hero كاملة | **تغيّرت جذرياً** (CommercePassport) | **drift جديد — يحتاج مراجعة بشرية** |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | زر سلة دائري | **تغيّر لرابط تفصيل منتج** | **drift جديد — spec `product-tile-cart-button-2026-06-14.md` يحتاج مراجعة** |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| HomeHeaderActions | زر "افتح متجرك" للضيف | ✅ **مُنجَز** | spec `home-header-seller-cta-2026-06-16.md` مُغلَق |

---

## الخطوة التالية

1. **مراجعة بشرية مطلوبة** للبت في:
   - هل `CommercePassport` هو الـ baseline الجديد الرسمي؟ → إن نعم: تحديث `docs/design/baseline/marketplace-home.png`
   - هل تغيير زر ProductTile من سلة → تفصيل منتج مقصود؟ → إن نعم: إغلاق `product-tile-cart-button-2026-06-14.md`

2. **لا تكملة لمرحلتَي 2 و3 هذه الجولة** (drift مانع وفق قواعد الحارس).

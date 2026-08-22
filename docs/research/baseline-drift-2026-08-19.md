# تقرير انحراف بصري — baseline-drift-2026-08-19

**تاريخ التشغيل:** 2026-08-19 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

**⚠️ يوجد drift جديد حرج.** كوميت `013f987` بتاريخ 2026-07-30 أعاد هيكلة Hero الصفحة الرئيسية بشكل جوهري، مما أنتج انحرافين بصريين واضحين عن الـ baseline:

1. **شريط البحث نُقل خارج الـ Hero** إلى قسم مستقل أسفله.
2. **العمود الأيمن في الـ Hero تغيّر** من "مساحة إعلان رئيسية" إلى مكوّن `CommercePassport` (خطوات تأهيل التاجر).

**قرار المرحلة:** drift موجود → التوقف عند المرحلة 1، عدم المضي في المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `5f7bf39` | 2026-06-17 | remove duplicate advertise banner on stores home | `app/page.tsx` | إزالة بانر إعلاني مزدوج — تأثير محدود |
| `8b42fda` | 2026-06-27 | refactor storefront components to tokens | `components/product/ProductCard.tsx`, مكوّنات أخرى | إعادة هيكلة للـ tokens — بصرياً مقبول ضمن نطاق الـ store pages |
| `013f987` | 2026-07-30 | elevate DASM Stores marketplace homepage | `app/page.tsx`, `components/home/HomeHeaderActions.tsx` | **⚠️ DRIFT حرج — انظر التفاصيل أدناه** |
| `2a9372c` | 2026-07-30 | fix homepage light and dark theme coverage | `app/page.tsx` | تصحيح ألوان Dark mode — توسيع لتغيير 013f987 |

---

## انحراف 1 — شريط البحث خارج الـ Hero

**شدة الانحراف:** عالية — البحث عنصر تحويل رئيسي

**الوضع في الـ baseline:**
شريط البحث كان داخل قسم الـ Hero (`section[data-testid="platform-hero"]`)، مرئي فوراً عند الهبوط على الصفحة.

**الوضع الحالي في الكود (`app/page.tsx`):**
- Hero section (السطور 451-499): لا يحتوي على شريط بحث.
- شريط البحث منقول إلى قسم مستقل (السطر 501-529) أسفل الـ Hero مباشرة:

```tsx
// السطور 501-529 — قسم مستقل للبحث
<section className="border-b border-slate-200 bg-[#f4f0e8] px-4 py-5 dark:border-zinc-800 dark:bg-zinc-900">
  <form action="/" className="...">
    <Search className="..." />
    <input id="marketplace-search" name="q" placeholder="ابحث عن منتج أو متجر..." ... />
    <button>بحث</button>
  </form>
</section>
```

**الانعكاس البصري:**
البحث أصبح مفصولاً عن الـ Hero بحاجز بصري واضح (`bg-[#f4f0e8]`)، مما يُخرجه عن المنطقة الحارة (above-the-fold hero) للزوار الجدد على الشاشات المتوسطة والكبيرة.

**توصية الاسترجاع (كتوصية فقط — لا تنفّذ):**
نقل عنصر `<form>` للبحث (السطور 503-520) داخل `<section data-testid="platform-hero">` قبل بداية شبكة الأعمدة اللازمة (السطر 456)، أو دمجه في الجزء السفلي من العمود الأيسر في الـ Hero (بعد أزرار الـ CTA، السطر 487). يكفل هذا رؤيته فور تحميل الصفحة.

---

## انحراف 2 — العمود الأيمن في الـ Hero: CommercePassport بدلاً من الإعلان

**شدة الانحراف:** متوسطة — يؤثر على الهوية البصرية والنموذج الإعلاني

**الوضع في الـ baseline:**
العمود الأيمن في الـ Hero كان يحمل "مساحة إعلان رئيسية" (شارة/بانر معلن).

**الوضع الحالي في الكود (`app/page.tsx`, السطر 497):**
```tsx
<CommercePassport storeCount={paginator.total} />
```

`CommercePassport` (السطور 275-332) مكوّن بصري يعرض خطوات تأهيل التاجر (هوية المتجر / الكتالوج / الدفع / الشحن / الوصول للعميل) على شكل بطاقة "جواز نمو المتجر" ذات تصميم علامة تجارية داخلية.

**الانعكاس البصري:**
- "مساحة إعلان رئيسية" المُتوقعة في الـ baseline غائبة.
- المساحة الإعلانية الوحيدة المتبقية في الصفحة الرئيسية هي `<StoreAdSlot slotKey="store.home.banner" />` (السطر 617-622) أسفل شبكة المنتجات.
- الـ CommercePassport مفيد وظيفياً (يستهدف التاجر) لكنه غير مُدرَج في الـ baseline.

**توصية الاسترجاع (كتوصية فقط — لا تنفّذ):**
إما:
- (أ) إعادة `<StoreAdSlot slotKey="store.home.main" variant="hero" />` إلى العمود الأيمن في الـ Hero (السطر 497) وتحريك `CommercePassport` إلى قسم `#for-merchants` (السطر 531).
- (ب) قبول `CommercePassport` رسمياً كبديل للإعلان وتحديث الـ baseline صورةً لتعكس الوضع الحالي — هذا قرار يعود لصاحب المنتج.

---

## حالة الفجوات البصرية المستمرة (من تقارير سابقة)

الفجوات التالية لا تزال قائمة دون تغيير، وقد وُثّقت في مواصفات مفتوحة تنتظر Cursor:

| المكوّن | العنصر | الحالة | المرجع |
|---------|--------|--------|--------|
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` ← السطر 237 في `app/page.tsx` | `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | غائب | `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | غائب | `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | غائب | `store-info-trust-badges-2026-06-08.md` |
| Store (mobile) | Sticky Cart Bar | غائب | `sticky-mini-cart-bar-2026-06-15.md` |
| Marketplace footer | StatsBar | غائب | مقبول بقرار التجميد 2026-06-07 |

---

## الخطوة التالية

**الأولوية العاجلة:** تقييم صاحب المنتج لانحرافي الـ Hero:

1. هل يعود شريط البحث إلى داخل الـ Hero؟ (توصية: نعم — تأثير تحويلي مرتفع)
2. هل يُقبل `CommercePassport` بصرياً بديلاً عن المساحة الإعلانية، أم تُعاد هيكلة الـ Hero؟

المواصفات المفتوحة المذكورة أعلاه تنتظر Cursor للتنفيذ — لا تحتاج إجراءً فورياً.

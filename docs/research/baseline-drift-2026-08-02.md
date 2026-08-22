# تقرير انحراف بصري — baseline-drift-2026-08-02

**تاريخ التشغيل:** 2026-08-02 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

**يوجد drift جديد — 2 عناصر بصرية حرجة.** كوميت `013f987` (2026-07-30) أعاد رسم هيكل
الصفحة الرئيسية برمّته: Hero تحوّل إلى شبكة عمودَين وظهر widget جديد "DASM COMMERCE PASSPORT"
لم يكن موجوداً في الـ baseline، وأُضيف قسم "لأصحاب المتاجر" كاملاً بين شريط البحث وشبكة
المنتجات.

**قرار المرحلة:** يوجد drift مانع → لا تكملة للمرحلتين 2 و3 هذه الجولة.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `5f7bf39` | 2026-06-17 | remove duplicate advertise banner | `app/page.tsx` | إزالة بانر إعلان مكرر — إصلاح، لا drift |
| `e65d0a0` | — | make products page discoverable in store nav | `app/[slug]/page.tsx` | روابط تنقل — خارج نطاق baseline المحدد |
| `09dcbe4` | 2026-06-21 | drop duplicate chrome hero for builder stores | `components/store/StoreHeader.tsx` | builder stores فقط — خارج نطاق subdomain-store baseline |
| `8b42fda` | 2026-06-27 | refactor storefront components to tokens | متعدد | إعادة هيكلة CSS tokens — لا تغيير بصري للزائر |
| `013f987` | 2026-07-30 | **elevate DASM Stores marketplace homepage** | `app/page.tsx` | **DRIFT حرج — راجع القسم التالي** |
| `2a9372c` | 2026-07-30 | fix homepage light and dark theme coverage | `app/page.tsx` | تكملة لـ `013f987` — ضمن نفس الـ drift |

---

## ⚠️ عناصر الانحراف الجديدة

### الانحراف 1 — Hero Marketplace: تحوّل إلى شبكة عمودَين مع CommercePassport widget

**الملف:** `app/page.tsx`
**السطر (الحالة الراهنة):** 456–499

**ما كان عليه الـ baseline (marketplace-home.png):**
Hero ذو عمود واحد — نص رئيسي (عنوان + نص فرعي + زرّا CTA) يشغل عرض الصفحة كاملاً دون
أي عنصر جانبي. لا يوجد أي widget أو بطاقة على اليمين.

**ما هو عليه الكود الآن:**
```tsx
// app/page.tsx — line ~456
<div className="relative mx-auto grid max-w-7xl items-center gap-12
                 lg:grid-cols-[1.05fr_.95fr]">
  <div className="max-w-2xl">
    {/* نص الـ hero */}
  </div>
  <CommercePassport storeCount={paginator.total} />
</div>
```
Hero أصبح شبكة عمودَين (`lg:grid-cols-[1.05fr_.95fr]`). العمود الأيسر: نص. العمود الأيمن:
بطاقة داكنة/فاتحة تحمل عنوان "DASM COMMERCE PASSPORT" مع قائمة مرقّمة من 5 خطوات
(هوية المتجر / الكتالوج / إعداد الدفع / الشحن / الوصول للعميل) وعداد للمتاجر.

**تقدير توقيت التغيير:** 2026-07-30 (`013f987`)

**توصية الاسترجاع (كتوصية فقط، لا تنفّذها):**
- **خيار أ — إرجاع للـ baseline:** تغيير `lg:grid-cols-[1.05fr_.95fr]` إلى شبكة أحادية
  العمود وحذف `<CommercePassport storeCount={paginator.total} />` والمكوّن كاملاً
  (السطور 276–331 في الحالة الراهنة).
- **خيار ب — تحديث الـ baseline:** فتح PR بعنوان `baseline-update` للحصول على موافقة
  محمد الزهراني على اعتماد هذا التصميم الجديد كـ baseline رسمي.

---

### الانحراف 2 — قسم "لأصحاب المتاجر" الجديد بين البحث والمنتجات

**الملف:** `app/page.tsx`
**السطر (الحالة الراهنة):** 531–578

**ما كان عليه الـ baseline (marketplace-home.png):**
ترتيب الصفحة كان: Hero → شريط البحث → شبكة المنتجات → متاجر نشطة → الأقسام.
لا يوجد قسم وسيط بين البحث والمنتجات.

**ما هو عليه الكود الآن:**
قسم `id="for-merchants"` أُدرج بين شريط البحث وشبكة المنتجات (السطور 531–578):
- عنوان: "أدوات التشغيل في قصة واحدة مفهومة."
- شبكة 2×2 من بطاقات `merchantCapabilities`:
  1. رابط مستقل لمتجرك
  2. كتالوج قابل للإدارة
  3. تشغيل الطلبات
  4. قراءة الأداء

هذا القسم يفصل المتسوّق عن المنتجات ويتوجّه بالخطاب للبائع، وهو غائب تماماً من
`marketplace-home.png`.

**تقدير توقيت التغيير:** 2026-07-30 (`013f987`)

**توصية الاسترجاع (كتوصية فقط، لا تنفّذها):**
- **خيار أ — إرجاع للـ baseline:** حذف القسم بأكمله (السطور 531–578) أو نقله أسفل
  الصفحة بعد قسم `#categories`.
- **خيار ب — تحديث الـ baseline:** فتح PR بعنوان `baseline-update` لاعتماد القسم كجزء
  رسمي من التصميم.

---

## الفجوات البصرية المستمرة (بدون تغيير منذ 2026-06-16)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | غائب | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | غائب (فقط «مميز» لـ is_featured) | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود (line 237) | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | غائب | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | غائب | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة (موثوق/توصيل سريع) | غائب | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar (15,000 / +1M / 99.6%) | غائب | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | غائب | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## الخطوة التالية

وجود drift جديد يوقف هذه الجولة عند المرحلة 1. المطلوب من صاحب القرار (محمد الزهراني)
اختيار أحد خيارَي الاسترجاع لكل انحراف قبل الجولة القادمة.

**الجولة القادمة:** 2026-08-09

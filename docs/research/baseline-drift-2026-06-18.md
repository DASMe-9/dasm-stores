# تقرير انحراف بصري — baseline-drift-2026-06-18

**تاريخ التشغيل:** 2026-06-18 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**⚠️ وُجد drift مانع.** كوميت #181 أزال قسم "مساحة إعلان بانر واسعة" من الصفحة الرئيسية للسوق — وهو عنصر موجود صراحةً في `marketplace-home.png`.

**قرار المرحلة:** انحراف مانع → إيقاف عند المرحلة 1 — لا تكملة للمرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | الوصف | الملف | التأثير البصري |
|---------|-------|-------|----------------|
| `26cc22e` | feat(theme/templates): redesign 6 store templates | `components/theme/` | قوالب المحرر المرئي — خارج نطاق baseline المتسوق |
| `5f7bf39` | **fix(marketplace): remove duplicate advertise banner** | `app/page.tsx` | **⚠️ drift — حذف عنصر baseline** |
| `2a4698d` | feat(storefront): phase 4c — public storefront visual builder | `app/[slug]/page.tsx`, `lib/storefront-builder.ts` | مشروط (builder-stores فقط) — متاجر بدون builder غير متأثرة |
| `d987a13` | feat(dashboard/theme): phase 4b — visual store builder | `components/theme-editor/` | لوحة تحكم البائع — خارج نطاق baseline |
| `f6d90db` | feat(dashboard/theme): phase 4a — 10 section blocks | `components/theme-editor/` | لوحة تحكم البائع — خارج نطاق baseline |
| `c3bd613` | feat(dashboard/theme): m3 — AI block assistant | `components/theme-editor/` | لوحة تحكم البائع — خارج نطاق baseline |
| `35dece8` | feat(dashboard/theme): m2 — surfaces, visual blocks | `components/theme-editor/` | لوحة تحكم البائع — خارج نطاق baseline |
| `0f685d9` | feat(dashboard/theme): Shopify-style block theme editor | `components/theme-editor/` | لوحة تحكم البائع — خارج نطاق baseline |

---

## تفصيل الانحراف

### المكوّن: قسم الإعلان الثاني في الصفحة الرئيسية

| البند | التفصيل |
|-------|---------|
| **الملف** | `app/page.tsx` |
| **الكوميت** | `5f7bf39` — PR #181 — 2026-06-17 |
| **العنصر المحذوف** | قسم `<section>` مستقل يحتوي بانر "مساحة إعلان بانر واسعة" |
| **الموقع في الـ baseline** | بين قسم "متاجر مميزة" وقسم "تصفح الأقسام" |
| **الموقع في الكود قبل الحذف** | السطر 182 (تقريباً) من `app/page.tsx` |

**الوصف البصري للعنصر المحذوف:**
بانر كامل العرض بخلفية `bg-[#031b1e]` مع تدرج emerald، يحتوي:
- نص عنوان كبير: **"مساحة إعلان بانر واسعة"**
- نص فرعي: "وصل لآلاف العملاء يوميًا على متاجر داسم"
- زر "أعلن الآن" بلون `bg-emerald-500`
- أيقونة `Target` بحجم `h-16 w-16`

**الفرق مع البانر المتبقي:**
البانر الأول "ظهور أوسع بين منتجات المتاجر" (السطر 179) لا يزال موجوداً ومدمجاً داخل قسم المنتجات — مشروط بغياب query البحث. البانر المحذوف كان قسماً مستقلاً ظاهراً دائماً.

**مبرر الفريق (من رسالة الكوميت):**
"The marketplace home showed two أعلن الآن advertise banners. Removes the second standalone one below the featured stores section; the first inline ad under products remains."

---

## مقارنة مع الـ baseline

| العنصر | الـ baseline (`marketplace-home.png`) | الكود الحالي |
|--------|--------------------------------------|--------------|
| بانر "ظهور أوسع بين منتجات المتاجر" | ✅ موجود | ✅ موجود (السطر 179) |
| قسم "متاجر مميزة" | ✅ موجود | ✅ موجود |
| **بانر "مساحة إعلان بانر واسعة"** | **✅ موجود في الـ baseline** | **❌ محذوف** |
| قسم "تصفح الأقسام" | ✅ موجود | ✅ موجود |
| قسم "كل المتاجر" | ✅ موجود | ✅ موجود |

---

## توصية الاسترجاع

إعادة البانر كقسم مستقل بين `#stores` و`#categories` في `app/page.tsx`:

```tsx
{/* بعد قسم #stores وقبل قسم #categories */}
<section className="mx-auto max-w-7xl px-4 pb-8">
  <Link
    href="https://ads.dasm.com.sa/advertise"
    className="relative block overflow-hidden rounded-2xl bg-[#031b1e] px-6 py-5 text-white shadow-lg"
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(45,212,191,.28),transparent_32%),linear-gradient(90deg,rgba(20,184,166,.22),transparent_55%)]" />
    <div className="relative z-10 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-start">
      <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-extrabold">
        أعلن الآن <Megaphone className="h-4 w-4" />
      </span>
      <div>
        <h2 className="text-2xl font-extrabold">مساحة إعلان بانر واسعة</h2>
        <p className="mt-1 text-sm text-emerald-50/75">وصل لآلاف العملاء يوميًا على متاجر داسم</p>
      </div>
      <Target className="hidden h-16 w-16 text-emerald-200 md:block" />
    </div>
  </Link>
</section>
```

**ملاحظة:** هذه توصية فقط — القرار النهائي للفريق حول ما إذا كان الحذف مقصوداً ومقبولاً أو يجب التراجع عنه.

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث يشمل الـ drift الجديد:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Marketplace Home | **بانر "مساحة إعلان بانر واسعة"** | **❌ محذوف** | **⚠️ drift جديد — ينتظر قرار الفريق** |
| Hero (marketplace) | أيقونات مزايا المنصة | غائب | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | غائب | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | غائب | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | غائب | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | غائب | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | غائب | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | غائب | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## ملاحظة: صفحة المتجر الفرعي

كوميت `2a4698d` يضيف مسار `StorefrontBlocks` للمتاجر التي تستخدم المحرر المرئي فقط (`hasBuilderLayout` gate). المتاجر بدون تكوين محرر تحتفظ بالتخطيط الأصلي غير المتغير — لا drift في صفحة subdomain-store.

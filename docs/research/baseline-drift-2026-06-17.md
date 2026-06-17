# تقرير انحراف بصري — baseline-drift-2026-06-17

**تاريخ التشغيل:** 2026-06-17 (جولة أسبوعية — الثلاثاء)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا drift حرج جديد.** الكوميتات الجديدة منذ 2026-06-16 تتضمن إصلاح بنّاء (حذف بانر مكرر) وإضافة مسار جديد لـ StorefrontBlocks للمتاجر التي تستخدم المحرر البصري. المسار التقليدي (baseline) لا يزال سليماً.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | الوصف | الملف | التأثير البصري |
|---------|-------|-------|----------------|
| `5f7bf39` | fix(marketplace): remove duplicate advertise banner (#181) | `app/page.tsx` | إزالة بانر مكرر "مساحة إعلان بانر واسعة" — **تحسين مقصود** |
| `2a4698d` | feat(storefront): phase 4c — public storefront renders the visual builder (hybrid) (#180) | `app/[slug]/page.tsx`, `components/storefront/StorefrontBlocks.tsx` | مسار تصيير جديد للمتاجر ذات المحرر البصري |
| `d987a13` | feat(dashboard/theme): phase 4b — visual store builder (#179) | `components/theme-editor/*`, `pages/dashboard/theme-editor.tsx` | لوحة تحكم فقط — خارج نطاق baseline المتسوق |
| `f6d90db` | feat(dashboard/theme): phase 4a — 10 new section blocks (#178) | `lib/themes/blocks/*`, `pages/dashboard/theme-editor.tsx` | لوحة تحكم فقط — خارج نطاق baseline المتسوق |

---

## تفصيل التحليل

### 1. حذف البانر المكرر (5f7bf39) — تحسين

الكوميت يحذف `<section>` ثانية تحتوي "مساحة إعلان بانر واسعة" كانت تظهر بعد قسم "متاجر مميزة". البانر الأول (تحت قسم المنتجات: "ظهور أوسع بين منتجات المتاجر") لا يزال موجوداً في السطر 179.

**المقارنة مع baseline:** الـ `marketplace-home.png` يُظهر بانراً إعلانياً واحداً في الصفحة. الوضع الحالي بعد الإصلاح = بانر واحد → **متوافق مع baseline**.

**القرار:** لا drift. إصلاح يُقرّب الكود من الـ baseline.

---

### 2. StorefrontBlocks — مسار جديد مشروط (2a4698d) — drift اختياري

`app/[slug]/page.tsx` أضاف مسار تصيير بديل للمتاجر التي تملك `theme_config` بمحرر بصري:

```typescript
if (hasBuilderLayout(data.store.theme_config)) {
  // يُصيّر StorefrontBlocks بدلاً من التخطيط التقليدي
  return <StorefrontBlocks blocks={...} products={...} />;
}
// التخطيط التقليدي للمتاجر بدون محرر
return <div className="space-y-6">...</div>;
```

**المقارنة مع baseline:**

| العنصر | Baseline (subdomain-store.png) | المسار التقليدي | مسار Builder |
|--------|-------------------------------|-----------------|--------------|
| شريط روابط داخلي (كل المنتجات / السلة / الأقسام) | موجود | ✓ موجود (سطر 54–88) | **غائب** — StorefrontBlocks لا تعيد تصييره |
| أقسام المتجر | موجود | ✓ موجود | حسب الـ blocks المكوّنة |
| شبكة المنتجات | موجود | ✓ موجود | موجود إن كان block "product-grid" مُضافاً |
| StoreHeader + StoreTabsNav | موجود | ✓ من layout.tsx | ✓ من layout.tsx |

**الانحراف المرصود:**
- **المسار التقليدي:** لا انحراف — متوافق مع baseline.
- **مسار Builder:** الشريط الداخلي (`<nav aria-label="روابط المتجر">`) غائب. المتاجر التي تختار المحرر البصري لا تحصل على هذا الشريط إلا إذا أضاف التاجر block nav يدويًا.

**التقييم:** الانحراف اختياري وتدريجي (opt-in). لا يُلغي التخطيط التقليدي لمن لم يُفعّل المحرر. **لا يمنع تكملة المراحل.**

**التوصية (لـ Cursor، لا للتنفيذ الآن):** إضافة fallback nav row مدمج في `StorefrontBlocks` يُصيَّر تلقائياً إن لم يكن أي block نوعه `navbar` مدرجاً في الـ layout.

---

## حالة الفجوات البصرية المستمرة (لا تغيير)

جدول محدَّث من 2026-06-16:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| Marketplace header | CTA "افتح متجرك" | **غائب** | محل `home-header-seller-cta-2026-06-16.md` — ينتظر Cursor |
| StorefrontBlocks stores | شريط روابط داخلي | **غائب في Builder mode** | ⬆️ drift جديد W30 — مقبول مؤقتاً (opt-in) |

---

## الخطوة التالية

لا تصحيح عاجل مطلوب. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

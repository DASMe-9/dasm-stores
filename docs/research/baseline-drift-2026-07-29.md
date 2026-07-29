# تقرير انحراف بصري — baseline-drift-2026-07-29

**تاريخ التشغيل:** 2026-07-29 (جولة أسبوعية — الثلاثاء)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**يوجد drift جديد — 3 انحرافات بصرية بين 2026-06-16 واليوم.**

الكوميتان المسببتان: `5f7bf39` (2026-06-17) و `8b42fda` (2026-06-27).

**قرار المرحلة:** drift مانع → تتوقف هذه الجولة عند المرحلة 1. لا تكمل المرحلتين 2 و3.

---

## الكوميتات الجديدة التي أحدثت drift (منذ 2026-06-16)

| الكوميت | التاريخ | الوصف | الملف المتأثر |
|---------|---------|-------|----------------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` |
| `8b42fda` | 2026-06-27 | refactor storefront components to tokens | `components/product/ProductCard.tsx`، `components/store/StoreHeader.tsx` |

---

## الانحرافات البصرية الجديدة

### Drift 1 — حذف بانر الإعلان الثاني من marketplace home
**المكوّن:** قسم الإعلان المستقل بين "متاجر مميزة" و"تصفح الأقسام"
**الملف:** `app/page.tsx` (السطر 182 في النسخة السابقة للكوميت `5f7bf39`)
**الكوميت:** `5f7bf39` — 2026-06-17

**الوصف البصري:**
- **في الـ baseline:** يوجد قسم مستقل ذو خلفية داكنة `#031b1e` يحتوي على:
  - عنوان "مساحة إعلان بانر واسعة"
  - نص "وصل لآلاف العملاء يوميًا على متاجر داسم"
  - زر "أعلن الآن"
  - أيقونة `Target` على اليسار
  - يقع بعد قسم "متاجر مميزة" مباشرة وقبل "تصفح الأقسام"
- **الكود الحالي:** القسم محذوف بالكامل. ما زال بانر الإعلان الأول (داخل قسم المنتجات "ظهور أوسع بين منتجات المتاجر") موجوداً.

**توصية الاسترجاع (كتوصية فقط — لا تُنفَّذ):**
يُضاف بعد سطر `</section>` الخاص بـ `id="stores"` (السطر 181 حالياً) ما يلي:
```tsx
<section className="mx-auto max-w-7xl px-4 pb-8">
  <Link href="https://ads.dasm.com.sa/advertise" className="relative block overflow-hidden rounded-2xl bg-[#031b1e] px-6 py-5 text-white shadow-lg">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(45,212,191,.28),transparent_32%),linear-gradient(90deg,rgba(20,184,166,.22),transparent_55%)]" />
    <div className="relative z-10 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-start">
      <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-extrabold">أعلن الآن <Megaphone className="h-4 w-4" /></span>
      <div><h2 className="text-2xl font-extrabold">مساحة إعلان بانر واسعة</h2><p className="mt-1 text-sm text-emerald-50/75">وصل لآلاف العملاء يوميًا على متاجر داسم</p></div>
      <Target className="hidden h-16 w-16 text-emerald-200 md:block" />
    </div>
  </Link>
</section>
```

---

### Drift 2 — شارة الخصم في ProductCard تحولت من لون صلب إلى شبه شفاف
**المكوّن:** `components/product/ProductCard.tsx` — شارة `خصم X%`
**الملف:** `components/product/ProductCard.tsx`، السطر 38 (الحالي)
**الكوميت:** `8b42fda` — 2026-06-27

**الوصف البصري:**
- **في الـ baseline (subdomain-store.png):** شارة حمراء صلبة (`bg-red-500`) بنص أبيض، عالية التباين — "خصم 33%" بارزة بوضوح على بطاقة المنتج
- **الكود الحالي:** خلفية شبه شفافة مخصصة بـ CSS token `bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))]` بنص ملوّن `text-[var(--c-sale)]`
- **الأثر:** الشارة أصبحت خافتة جداً وتكاد تختفي على خلفيات فاتحة، فاقدةً قيمتها التسويقية كمحفز للشراء

**توصية الاسترجاع:**
السطر 38 الحالي يصبح:
```tsx
<span className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-red-500 px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-white">
  خصم {discountPct}%
</span>
```

---

### Drift 3 — نسبة حجم صورة المنتج تغيرت من مربعة إلى طولية
**المكوّن:** `components/product/ProductCard.tsx` — حاوية الصورة
**الملف:** `components/product/ProductCard.tsx`، السطر 27 (الحالي)
**الكوميت:** `8b42fda` — 2026-06-27

**الوصف البصري:**
- **في الـ baseline:** صور المنتجات مربعة `aspect-square` (1:1)
- **الكود الحالي:** `aspect-[4/5]` (4:5 — طولية أطول بنسبة 25%)
- **الأثر:** تغيّر شكل بطاقات المنتجات في صفحات المتاجر الفرعية؛ المنتجات التي صوّرها التجار بنسبة 1:1 تظهر مقصوصة أو مشوهة؛ التغيير يكسر الشبكة البصرية المتسقة

**توصية الاسترجاع:**
السطر 27 الحالي يصبح:
```tsx
<div className="store-product-card__media relative aspect-square bg-[var(--c-surface-2)]">
```

---

## الفجوات البصرية المستمرة (محدَّثة من التقارير السابقة)

| المكوّن | العنصر | الحالة في الكود | القرار / الإجراء |
|---------|--------|-----------------|-----------------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| Marketplace home | بانر الإعلان الثاني | **محذوف** (Drift 1 هذا التقرير) | ينتظر قرار المالك |
| ProductCard (store pages) | شارة الخصم — لون صلب | شبه شفاف (Drift 2 هذا التقرير) | ينتظر Cursor |
| ProductCard (store pages) | نسبة الصورة 1:1 | `aspect-[4/5]` (Drift 3 هذا التقرير) | ينتظر Cursor |

---

## الخطوة التالية

تتطلب الانحرافات الثلاثة مراجعة بشرية قبل المتابعة:
- **Drift 1:** قرار مقصود من commit 5f7bf39 — هل يُعاد البانر أم يُكتفى بالأول؟
- **Drift 2 + 3:** ناتجان عن refactor تقني (tokens) — يُنصح بإصلاح فوري عبر Cursor بناءً على specs مستقبلية.

لا تكتمل المرحلتان 2 و3 هذه الجولة بسبب وجود drift مانع.

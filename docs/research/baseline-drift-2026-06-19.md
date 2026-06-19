# تقرير انحراف بصري — baseline-drift-2026-06-19

**تاريخ التشغيل:** 2026-06-19 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد آنذاك)

---

## ملخص تنفيذي

**يوجد drift جديد.** حُذف مكوّن **AdSlot (variant: بانر واسع)** من الصفحة الرئيسية للسوق في commit `5f7bf39` (2026-06-17). الـ baseline يوثّق نوعين مختلفين من الـ AdSlot؛ النوع الثاني (البانر المستقل عرض الصفحة الكامل) أُزيل.

**قرار المرحلة:** يوجد drift مانع → لا تكملة للمرحلتين 2 و3 هذه الجولة.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | الوصف | الملف | التأثير البصري |
|---------|-------|-------|----------------|
| `5f7bf39` | fix(marketplace): remove duplicate advertise banner on stores home | `app/page.tsx` | **حذف قسم AdSlot واسع** — drift مباشر على baseline |
| `2a4698d` | feat(storefront): phase 4c — public storefront renders the visual builder (hybrid) | `app/[slug]/page.tsx` | مسار إضافي للمتاجر ذات الـ builder — لا drift للمسار الاعتيادي |
| `d987a13` | feat(dashboard/theme): phase 4b — visual store builder, templates | `components/theme-editor/` | لوحة تحكم البائع — خارج نطاق baseline المتسوق |
| `f6d90db` | feat(dashboard/theme): phase 4a — 10 new section blocks | `components/theme-editor/` | لوحة تحكم البائع — خارج نطاق baseline المتسوق |
| `c3bd613` | feat(dashboard/theme): m3 — AI block assistant | `components/theme-editor/` | لوحة تحكم البائع — خارج نطاق baseline المتسوق |
| `26cc22e` | feat(theme/templates): redesign the 6 store templates | `components/theme/` | قوالب المتجر — خارج نطاق baseline صفحة السوق |

---

## الـ Drift الجديد المكتشف هذه الجولة

### 1. AdSlot "بانر واسع" — مفقود من `app/page.tsx`

| الحقل | القيمة |
|-------|--------|
| **المكوّن** | `AdSlot` — variant: **بانر واسع** (full-width standalone) |
| **الملف** | `app/page.tsx` |
| **السطر المحذوف** | السطر 182 من النسخة السابقة (بين قسم "متاجر مميزة" وقسم "تصفح الأقسام") |
| **تاريخ التغيير** | 2026-06-17، commit `5f7bf39` |
| **الـ Commit Message** | "fix(marketplace): remove duplicate advertise banner on stores home (#181)" |

**الوصف البصري لما تغيّر:**

الـ baseline (`docs/design/baseline/marketplace-home.png` + `docs/design/baseline/components-inventory.md`) يوثّق نوعين مستقلين من الـ AdSlot في السوق:

| النوع | الوصف | الحالة |
|-------|-------|--------|
| **مساحة إعلان مميزة** (variant 1) | بطاقة داكنة مدمجة داخل صف المنتجات (نهاية الـ grid) | ✅ **موجود** في `app/page.tsx` سطر 179 |
| **مساحة بانر واسعة** (variant 2) | شريط مستقل عرض الصفحة الكامل، أيقونة هدف، عنوان "مساحة إعلان بانر واسعة"، نص "وصل لآلاف العملاء" | ❌ **مفقود** — حُذف في `5f7bf39` |

الـ baseline يصف الـ variant 2 في `components-inventory.md`:
> **مساحة بانر واسعة:** شريط عرض كامل بنفس أسلوب التركواز المضيء، أيقونة هدف/تأثير بصري، عنوان، جملة وصل لآلاف العملاء، زر «أعلن الآن».

**محتوى القسم المحذوف:**
```jsx
<section className="mx-auto max-w-7xl px-4 pb-8">
  <Link href="https://ads.dasm.com.sa/advertise" className="relative block overflow-hidden rounded-2xl bg-[#031b1e] px-6 py-5 text-white shadow-lg">
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

**توصية الاسترجاع:**

في `app/page.tsx`، **بعد** قسم "متاجر مميزة" (الـ `<section id="stores">` الذي ينتهي عند سطر ~181) وقبل قسم "تصفح الأقسام" (`<section id="categories">`):

> يُضاف السطر المحذوف أعلاه كاملاً. لا تعديل على الكود المحيط.

**ملاحظة:** وصف الـ commit يصف البانر الثاني بـ"duplicate" — لكن الـ baseline يُصنّف النوعين كـvariants مستقلة (مميزة: داخل شبكة المنتجات، واسعة: قسم standalone). القرار النهائي يعود للمالك.

---

### 2. مسار Visual Builder — ملاحظة (ليس drift)

الـ commit `2a4698d` أضاف مساراً جديداً في `app/[slug]/page.tsx`:

```tsx
if (hasBuilderLayout(data.store.theme_config)) {
  // → StorefrontBlocks (visual builder layout)
}
// else → standard layout (كما في الـ baseline)
```

المسار الاعتيادي (المتاجر غير-builder) لم يتغيّر بصرياً. متاجر الـ builder تعرض layout مخصصاً من إعداد البائع. هذا **ليس drift** على الـ baseline — الـ baseline يمثل متجراً اعتيادياً.

---

## حالة الفجوات البصرية المستمرة (محدّث)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| AdSlot (variant 2) | بانر واسع مستقل | **محذوف** — `5f7bf39` | **⚠️ DRIFT جديد — هذا التقرير** |
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## الخطوة التالية

**مطلوب من محمد الزهراني:** مراجعة حذف البانر الواسع وتحديد أحد الخيارين:

1. **الاسترجاع:** إعادة قسم البانر الواسع بالكود الوارد أعلاه → يُغلق الـ drift
2. **تحديث الـ Baseline:** موافقة صريحة على إزالة الـ variant الثاني من الـ baseline → PR منفصل بعنوان `baseline-update` (وفق شروط `docs/design/baseline/README.md`)

لا تكتمل المرحلتان 2 و3 هذه الجولة — الـ drift قائم.

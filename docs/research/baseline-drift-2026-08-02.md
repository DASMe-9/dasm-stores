# تقرير انحراف بصري — baseline-drift-2026-08-02

**تاريخ التشغيل:** 2026-08-02 (أسبوعي — أحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)
**فجوة زمنية:** 47 يوماً منذ آخر جولة

---

## ملخص تنفيذي

**وُجد drift جديد — المرحلة 2 مُعلَّقة وفق البروتوكول.**

ثلاثة انحرافات بصرية جديدة تم رصدها منذ 2026-06-16:

| # | المكوّن | النوع | الخطورة |
|---|---------|-------|---------|
| 1 | Hero (marketplace) | إعادة هيكلة كاملة — شريط البحث غادر الـ hero | حرج — يستلزم قرار baseline |
| 2 | Hero (marketplace) | إضافة عنصر CommercePassport في العمود الأيمن | إضافة — يستلزم قرار baseline |
| 3 | ProductCard (storefront) | إضافة شارة خصم `خصم X%` أعلى اليسار | إضافة — يُرجَّح قبولها |

إضافةً لذلك: تم **حلّ** انحراف موثَّق من W29 (HomeHeaderActions - CTA للتاجر).

---

## الكوميتات الجديدة المؤثرة بصرياً (منذ 2026-06-16)

| الكوميت | الوصف | الملفات المُلمَسة | التأثير البصري |
|---------|-------|-----------------|----------------|
| `013f987` | elevate DASM Stores marketplace homepage | `app/page.tsx`، `components/home/HomeHeaderActions.tsx` | **حرج** — إعادة هيكلة Hero |
| `2a9372c` | fix homepage light and dark theme coverage | `app/page.tsx` | تكميلي للكوميت السابق |
| `8b42fda` | refactor storefront components to tokens | `components/product/ProductCard.tsx` + 11 ملفاً | شارة خصم جديدة + CSS tokens |
| `5f7bf39` | remove duplicate advertise banner on stores home | `app/page.tsx` | إزالة عنصر إعلاني مكرر — لا أثر على baseline |

---

## تفصيل الانحرافات الجديدة

### 1. إعادة هيكلة قسم الـ Hero الرئيسي

**الملف:** `app/page.tsx` — السطور 452–499 (Hero) و501–529 (قسم البحث)
**الكوميت:** `013f987`

#### الحالة في الـ baseline
- Hero وحيد العمود يضم: العنوان + شريط البحث مدمج + CTA واحد (استكشف المتاجر)
- الخلفية: تدرج زمردي خفيف

#### الحالة الراهنة في الكود
```tsx
// سطر 456 — شبكة عمودين
<div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">

  {/* عمود أيسر: عنوان + أزرار CTA */}
  <div className="max-w-2xl">
    <h1>من متجر سعودي مستقل، إلى سوق أكبر.</h1>
    {/* زران: "أنشئ متجرك" + "استكشف السوق" */}
  </div>

  {/* عمود أيمن: CommercePassport widget — جديد كلياً */}
  <CommercePassport storeCount={paginator.total} />  {/* سطر 497 */}

</div>

{/* قسم بحث مستقل بعد الـ hero — سطر 501 */}
<section className="border-b border-slate-200 bg-[#f4f0e8] px-4 py-5">
  <form action="/" ...>
    <input name="q" placeholder="ابحث عن منتج أو متجر..." />
  </form>
</section>
```

#### الانحراف عن الـ baseline
- شريط البحث **انتقل من داخل الـ hero** إلى قسم منفصل تحته
- **CommercePassport** widget جديد كلياً في العمود الأيمن (لا وجود له في الـ baseline)
- البنية تحوّلت من عمود واحد إلى عمودين على الـ desktop
- لا تزال "شارة مساحة إعلان رئيسية" غائبة (قرار تجميد 2026-06-07 لا يزال سارياً)

#### توقيت التغيير (تقريبي)
الكوميت `013f987` — لا تاريخ متاح لكنه ظهر في الفرع بعد 2026-06-16.

#### توصية الاسترجاع (توصية فقط — لا تنفيذ)
هذا التغيير يبدو **ترقية متعمدة** (commit message: "elevate marketplace homepage")، لا انحداراً.
الخيار المطلوب:
- **Option A (مُوصى به):** تحديث الـ baseline ليعكس الهيكل الجديد → أنشئ `marketplace-home-v2.png` في `docs/design/baseline/`
- **Option B:** الرجوع للهيكل القديم في `app/page.tsx` سطر 456 — استبدال شبكة العمودين بعمود واحد وإعادة البحث للـ hero

---

### 2. إضافة شارة الخصم في ProductCard (صفحات المتاجر)

**الملف:** `components/product/ProductCard.tsx` — السطور 37–41
**الكوميت:** `8b42fda`

#### الحالة في الـ baseline
لا شارة خصم على بطاقة المنتج في صفحات المتاجر.

#### الحالة الراهنة في الكود
```tsx
// سطر 37-41
{discountPct ? (
  <span className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-sale)]">
    خصم {discountPct}%
  </span>
) : null}
```

#### توصية
هذه **إضافة وظيفية** تحسّن تجربة المتسوق. يُوصى بقبولها وتحديث الـ baseline. لا خطر انحدار.

---

## الانحراف المُحلَّق منذ آخر جولة

### HomeHeaderActions — CTA للتاجر (محلول ✓)

**المُلاحَظ في W29 (2026-06-16):** `HomeHeaderActions.tsx` لا يعرض CTA لاستقطاب تاجر جديد.
**spec مُنشأ:** `docs/specs/home-header-seller-cta-2026-06-16.md`

**الحالة الراهنة في الكود** (`components/home/HomeHeaderActions.tsx` سطر 140-143):
```tsx
<Link
  href="/auth/signup"
  className="hidden items-center gap-2 rounded-2xl bg-[#0e7c66] px-4 py-3 text-sm font-bold text-white ..."
>
  <Store className="h-4 w-4" />
  افتح متجرك
</Link>
```

**الحالة:** الـ spec نُفِّذ. الانحراف محلول. ✓

---

## حالة الفجوات المستمرة (بدون تغيير منذ 2026-06-16)

| المكوّن | العنصر | الحالة في الكود | الملف | القرار |
|---------|--------|-----------------|-------|--------|
| ProductTile (marketplace) | زر سلة دائري | `rounded-xl` + `ArrowLeft` icon في سطر 237 | `app/page.tsx:237` | spec: `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | غائب | `app/page.tsx` | spec: `product-tile-wishlist-2026-06-11.md` |
| ProductCard (storefront) | أيقونة قلب (مفضلة) | غائب | `components/product/ProductCard.tsx` | spec: `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة (موثوق/توصيل سريع) | غائب | `components/store/StoreHeader.tsx:197-212` | spec: `store-info-trust-badges-2026-06-08.md` |
| Store (mobile) | Sticky Cart Bar | غائب | `app/[slug]/layout.tsx` | spec: `sticky-mini-cart-bar-2026-06-15.md` |
| Hero (marketplace) | أيقونات مزايا المنصة | غائب | `app/page.tsx` | قرار تجميد 2026-06-07 |
| ProductTile (marketplace) | شارة "ممول" | غائب | `app/page.tsx` | قرار تجميد 2026-06-07 |
| Marketplace footer | StatsBar (15K / 1M / 99.6%) | غائب | `app/page.tsx` | قرار تجميد 2026-06-07 |

---

## قرار المرحلة

**Drift حرج وُجد → المرحلة 2 مُعلَّقة وفق البروتوكول.**

الإجراء المطلوب من صاحب المنتج:
1. **قرار baseline Hero:** Option A (تحديث الـ baseline) أو Option B (الرجوع للهيكل القديم)
2. **قرار شارة الخصم:** يُوصى بالقبول — لا يحتاج مراجعة
3. بعد القرار: تُستأنف المرحلتان 2 و3 في الجولة القادمة

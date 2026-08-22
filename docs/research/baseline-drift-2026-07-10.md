# تقرير انحراف بصري — baseline-drift-2026-07-10

**تاريخ التشغيل:** 2026-07-10 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**تم رصد انحرافَين بصريَّين جديدَين** منذ جولة 2026-06-16. كلاهما ناجم عن كوميتات مقصودة (PR #181 و [codex] refactoring)، لكن الـ baseline لم يُحدَّث بعد. القرار للفريق: تحديث الـ baseline ليعكس الواقع الجديد، أو استرجاع أحد أو كلا التغييرين.

**قرار المرحلة:** drift جديد → إيقاف عند المرحلة 1. لا تكملة للمرحلتين 2 و 3 هذه الجولة.

---

## الانحراف 1 — حذف بانر إعلاني ثانٍ من الصفحة الرئيسية

| الحقل | القيمة |
|-------|--------|
| **المكوّن** | `app/page.tsx` (السطر 182 قبل الكوميت — الـ `<section>` الرابعة في `<main>`) |
| **الكوميت** | `5f7bf39` — Wed Jun 17 2026 — `fix(marketplace): remove duplicate advertise banner on stores home (#181)` |
| **وصف الانحراف البصري** | الـ baseline يُظهر بانرَين أخضرَين داكنَين (`bg-[#031b1e]`) في الصفحة الرئيسية: الأول بعد شبكة المنتجات ("ظهور أوسع بين منتجات المتاجر")، والثاني بين قسم "متاجر مميزة" وقسم "تصفح الأقسام" ("مساحة إعلان بانر واسعة / وصل لآلاف العملاء يوميًا"). الكود الحالي يحتوي على الأول فقط — الثاني حُذف كليًا. |
| **نطاق التأثير** | ما بين `</section id="stores">` و `<section id="categories">` في `app/page.tsx` |
| **مبرر المطوّر** | PR #181 وصفه بـ"نسخة مكررة" (duplicate). |

### توصية الاسترجاع (كتوصية فقط — لا تنفيذ)

إضافة الـ `<section>` المحذوف مجدداً بين قسم المتاجر وقسم الأقسام في `app/page.tsx`:

```jsx
{/* بعد </section> الخاص بـ #stores وقبل <section id="categories"> */}
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

**البديل:** تحديث `docs/design/baseline/marketplace-home.png` لاعتماد التصميم الحالي (بانر واحد فقط) باعتباره الـ baseline الجديد.

---

## الانحراف 2 — إعادة هيكلة شارات ProductCard إلى توكنات (CSS tokens)

| الحقل | القيمة |
|-------|--------|
| **المكوّن** | `components/product/ProductCard.tsx` (السطر 33–38، شارات "مميز" و"خصم X%") |
| **الكوميت** | `8b42fda` — Sat Jun 27 2026 — `[codex] refactor storefront components to tokens` |
| **وصف الانحراف البصري** | ثلاثة تغييرات مرئية عن الـ baseline: |

### أ) شارة "مميز"

| | قبل (baseline) | بعد (الكود الحالي) |
|-|----------------|-------------------|
| الخلفية | صلبة `bg-amber-500` (برتقالي-ذهبي معتم) | `color-mix(in_srgb, var(--c-surface) 88%, transparent)` — شبه شفافة (glass-morphism) |
| النص | `text-white` (أبيض ثابت) | `text-[var(--c-accent)]` — يتبع لون التحديد في الثيم |
| الحد | لا يوجد | `border border-[var(--c-line)]` |
| التأثير | — | `backdrop-blur` |
| الشكل | `rounded-full` (دائري كامل) | `rounded-[var(--r-pill)]` (قد يختلف بحسب الثيم) |

### ب) شارة "خصم X%"

| | قبل (baseline) | بعد (الكود الحالي) |
|-|----------------|-------------------|
| الخلفية | صلبة `bg-red-500` (أحمر معتم) — كما يظهر في `subdomain-store.png` | `color-mix(in_srgb, var(--c-sale) 12%, var(--c-surface))` — شفافة بنسبة 88% |
| النص | `text-white` (أبيض على أحمر) | `text-[var(--c-sale)]` — ملوّن بلون البيع على خلفية فاتحة |

### ج) نسبة الصورة (Image Aspect Ratio)

| | قبل (baseline) | بعد |
|-|----------------|-----|
| النسبة | `aspect-square` (1:1 مربع) | `aspect-[4/5]` (أطول بنسبة 25%) |
| التأثير | بطاقات مربعة | بطاقات أطول — صواريخ تغيير التخطيط في شبكة المنتجات |

**ملاحظة:** التغيير في نسبة الصورة قد يُقرَّب الواقع من الـ baseline لأن بطاقات المتجر في `subdomain-store.png` تبدو أطول من مربع. لكن الشارات (badges) تباعدت بوضوح عن المرجع.

### توصية الاسترجاع (كتوصية فقط — لا تنفيذ)

لاسترجاع شارة "مميز" للمظهر الأصلي (السطر 33 في `components/product/ProductCard.tsx`):
```
من: rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-accent)] shadow-[var(--shadow-sm)] backdrop-blur
إلى: rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white
```

لاسترجاع شارة "خصم X%" (السطر 38):
```
من: rounded-[var(--r-pill)] bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-sale)]
إلى: rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white
```

**البديل:** تحديث `docs/design/baseline/subdomain-store.png` لاعتماد الشارات الجديدة (glass-morphism) باعتبارها التصميم المعتمد.

---

## حالة الفجوات البصرية المستمرة (من تقارير سابقة)

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

---

## الخطوة المطلوبة

**يُطلب قرار من الفريق حول انحراف 1 و2 قبل جولة 2026-07-17:**
1. هل يُحدَّث الـ baseline ليعكس الوضع الحالي (بانر واحد + شارات glass)؟
2. أم يُسترجع التصميم الأصلي في الكود؟

حتى صدور القرار، لن تُولَّد specs جديدة لتجنب التعارض مع وضع التصميم غير المُحسوم.

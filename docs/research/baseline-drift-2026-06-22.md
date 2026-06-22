# تقرير انحراف بصري — baseline-drift-2026-06-22

**تاريخ التشغيل:** 2026-06-22 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift — متابعة فجوات مجمّدة)

---

## ملخص تنفيذي

**وُجد drift جديد.** ثلاثة انحرافات بصرية مرتبطة بتطبيق الـ visual builder، أبرزها زوال بطاقة معلومات المتجر العائمة (الـ floating profile card) من صفحات المتاجر التي تستخدم الـ builder.

**قرار المرحلة:** drift موجود → لا تكملة إلى المرحلتين 2 و3 هذه الجولة.

---

## الكوميتات الجديدة منذ آخر جولة (2026-06-16)

| الكوميت | التاريخ | الوصف | التأثير البصري |
|---------|---------|-------|----------------|
| `5f7bf39` | 2026-06-17 | fix: إزالة بانر إعلان مكرر في الصفحة الرئيسية | إصلاح بصري — لا drift |
| `2a4698d` | قبل 16-06 | feat: phase 4c — storefront يعرض visual builder (hybrid) | أساس الـ drift |
| `d987a13` | قبل 16-06 | feat: phase 4b — visual store builder | أساس الـ drift |
| `5f45ab2` | قبل 16-06 | feat: visual block builder كمصمم رئيسي | أساس الـ drift |
| `26cc22e` | قبل 16-06 | feat: إعادة تصميم 6 templates | أساس الـ drift |
| `8f7b63b` | 2026-06-21 | feat: Salla-style landing — 4-up products + white category tiles | **drift #2 و #3** |
| `09dcbe4` | 2026-06-21 | fix: إزالة chrome hero المكرر لمتاجر Builder | **drift #1 (حرج)** |
| `afd9d71` | 2026-06-21 | fix: image-with-text يُدرج كـ text band عند غياب الصورة | storefront builder فقط |
| `e65d0a0` | 2026-06-22 | fix: إضافة رابط "المنتجات" لنافذة المتجر | إضافة — ليس drift |

---

## تفاصيل الانحرافات

---

### DRIFT #1 — حرج: غياب بطاقة معلومات المتجر العائمة في متاجر Builder

**الملف المعني:**
- `app/[slug]/layout.tsx` — السطر 82
- `components/store/StoreHeader.tsx` — الأسطر 103-136 (compact branch)

**الحالة في الـ baseline (`subdomain-store.png`):**
صفحة المتجر الفرعي تعرض:
1. hero بانر متحرك (ارتفاع `h-36 md:h-52`)
2. بطاقة معلومات عائمة تتداخل مع الـ hero (margin سالب: `-mt-8 md:-mt-10`) تحتوي:
   - شعار المتجر الدائري (64×64 → 80×80)
   - اسم المتجر كـ `<h1>` بخط `text-xl md:text-2xl`
   - اسم المنطقة (الرياض)
   - رقم الهاتف
   - أزرار المشاركة/واتساب/متابعة

**الحالة الراهنة في الكود:**
`app/[slug]/layout.tsx` السطر 82 يمرّر `compact={hasBuilderLayout(store.theme_config)}` إلى `StoreHeader`.

عند `compact=true` (أي أي متجر يستخدم visual builder)، تُعرض شريط رفيع بدلاً من البطاقة:
```
// components/store/StoreHeader.tsx السطر 103
{compact ? (
  <div className="flex flex-wrap items-center gap-x-4 ... text-xs text-muted-foreground">
    {description} · {areaName} · {phone} · [share/whatsapp/follow]
  </div>
) : (
  <>
    {/* hero banner h-36/h-52 */}
    {/* floating card -mt-8/-mt-10 with logo + h1 + area + phone */}
  </>
)}
```

الشريط الرفيع يفتقر إلى: شعار المتجر، اسم المتجر كـ `<h1>` بارز، الارتباط البصري بالـ hero.

**متى تغيّر:** كوميت `09dcbe4` — 2026-06-21

**توصية الاسترجاع (لا تنفيذ):**
في `components/store/StoreHeader.tsx`، في الـ compact branch (الأسطر 103-136)، أضف فوق الـ `div` الحالي:

```tsx
// السطر 103 (قبل الشريط الرفيع) — compact path فقط
<div className="mx-auto w-full max-w-[1280px] px-4 pt-4 sm:px-6 lg:px-8">
  <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-3 shadow-sm backdrop-blur">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]">
      {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <StoreIcon />}
    </div>
    <div className="min-w-0 flex-1">
      <h1 className="truncate text-base font-extrabold text-[var(--foreground)]">{storeName}</h1>
      {/* الشريط الرفيع الحالي (description + area + phone + actions) يُنقل هنا */}
    </div>
  </div>
</div>
```

هذا يحفظ تصميم Salla-style للـ builder (بدون hero مكرر) ويُعيد الهوية البصرية للبطاقة.

---

### DRIFT #2 — متوسط: إعادة تصميم بطاقات الأقسام في builder stores

**الملف المعني:**
- `components/theme-editor/BlockRenderer.tsx` — دالة `Categories`

**الحالة في الـ baseline:**
بطاقات أقسام بخلفية لون المتجر: `h-16`, gradient button, `text-white font-bold`.

**الحالة الراهنة في الكود (بعد كوميت `8f7b63b` — 2026-06-21):**
بطاقات بيضاء Salla-style:
- `h-24` (أطول)
- `border border-zinc-200 bg-white shadow-sm` (بدون لون الـ brand كخلفية)
- أيقونة `Tag` بلون المتجر فوق نص القسم
- hover: `translate-y-0.5 shadow-md`

**ملاحظة:**
هذا التغيير يخص builder stores فقط (`BlockRenderer`). المتاجر غير المُبنية تستخدم `app/[slug]/page.tsx` مباشرة بالـ category chips الحالية — لا تأثير عليها.

**توصية الاسترجاع (لا تنفيذ):**
إذا أُريد إرجاع الـ brand color للبطاقات:
```tsx
// السطر ~133 في BlockRenderer.tsx
// من:
className="... border border-zinc-200 bg-white ..."
// إلى:
className="... h-16 items-center justify-center ..."
style={{ background: `linear-gradient(135deg, ${ctx.primaryColor}, ${ctx.primaryColor}99)` }}
```
لكن التصميم الحالي (Salla-style) أفضل بصرياً — قد يُحتاج تحديث الـ baseline بدلاً من الاسترجاع.

---

### DRIFT #3 — ثانوي: ProductGrid تغيير من 6-up إلى 4-up على الـ desktop

**الملف المعني:**
- `components/product/ProductGrid.tsx` — السطر 20

**الحالة في الـ baseline:**
شبكة منتجات 6 أعمدة على الشاشات الكبيرة (`xl:grid-cols-6`).

**الحالة الراهنة في الكود (بعد كوميت `8f7b63b` — 2026-06-21):**
```tsx
// السطر 20
<div className="store-product-grid grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
```
4 أعمدة على `lg` فما فوق — بطاقات أكبر وأقل ازدحاماً.

**توصية الاسترجاع (لا تنفيذ):**
```tsx
// من:
className="store-product-grid grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
// إلى:
className="store-product-grid grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6"
```
ملاحظة: التغيير قد يكون تحسيناً مقصوداً — يُفضَّل مراجعة مع المصمم قبل الاسترجاع.

---

## حالة الفجوات البصرية المستمرة من الجولات السابقة

| المكوّن | العنصر | الحالة | القرار |
|---------|--------|--------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` | ينتظر Cursor — `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor — `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor — `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة (متجر موثوق/توصيل سريع) | **غائب** | ينتظر Cursor — `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | ينتظر Cursor — `sticky-mini-cart-bar-2026-06-15.md` |

---

## الخطوة التالية

1. **DRIFT #1 (حرج):** تطبيق توصية الاسترجاع على compact branch في `StoreHeader.tsx` — إضافة logo + h1 للشريط الرفيع. Cursor ينفّذ، Guardian يصف.
2. **DRIFT #2:** مراجعة مع المصمم — هل يُحدَّث الـ baseline أم يُسترجع تصميم الأقسام؟
3. **DRIFT #3:** على الأرجح تحسين مقصود — يُوصى بتحديث الـ baseline.
4. المرحلتان 2 و3 (استخبارات منافسين + spec) تُؤجَّل للجولة القادمة (W27 — 2026-06-29).

# Spec: Product Info Accordion — قسم "معلومات المنتج" القابل للطي

**التاريخ:** 2026-08-11
**المصدر:** Dawn 15.5.0 "Product disclosures" section (يونيو 2026) + Salla `salla-fulfillment-methods` (W29)
**الأولوية:** عالية — بيانات الـ API متاحة (`storeData.fulfillment_policy`) · ملف واحد · بدون JS · زيادة الثقة في السوق السعودي

---

## السياق والمبرر

Dawn 15.5.0 (17 يونيو 2026) أضاف قسم "product disclosures" على صفحة المنتج: accordion قابل للطي يعرض
معلومات قانونية/تشغيلية (سياسة الإرجاع، معلومات الشحن، المكوّنات) دون ازدحام الصفحة.

في dasm-stores، بيانات سياسة الإرجاع متاحة فعلاً من الـ API عبر `storeData.fulfillment_policy`
وتُعرض حالياً كبطاقة مسطحة (flat card) في `app/[slug]/products/[productId]/page.tsx` L104–121.
المشكلة: البطاقة الحالية:
- لا تُطوى — تظهر دائماً بحجمها الكامل بين زر الشراء والأزرار الأخرى
- وصف المنتج (L129–133) يُعرض كنص مفتوح بلا بنية، حتى لو كان طويلاً
- لا يوجد قسم واضح للمواصفات أو المعلومات الإضافية

الحل: accordion بـ `<details>/<summary>` (HTML فقط، بدون JS، Server Component) يجمع
سياسة الإرجاع + وصف المنتج في بنية منظمة وقابلة للاستكشاف.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `app/[slug]/products/[productId]/page.tsx` — صفحة تفصيل المنتج (Server Component)

**السلوك الحالي (الكود الذي سيتغير):**

```tsx
// L104–121: flat card للـ fulfillment_policy
{storeData.fulfillment_policy ? (
  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm">
    <p className="font-semibold text-[var(--foreground)]">
      استرجاع المنتج غير المستخدم خلال {storeData.fulfillment_policy.return_window_days} أيام
    </p>
    <p className="mt-1 leading-6 text-[var(--muted-foreground)]">
      العيب أو الخطأ أو التلف...
    </p>
    <div className="mt-2 flex flex-wrap gap-3">
      <Link ...>سياسة الاستبدال والاسترجاع</Link>
      <Link ...>الشحن وإعادة الشحن</Link>
    </div>
  </div>
) : null}

// L129–133: وصف مفتوح
{product.description ? (
  <div className="prose prose-sm max-w-none pt-4 text-[var(--muted-foreground)]">
    <p className="whitespace-pre-wrap">{product.description}</p>
  </div>
) : null}
```

---

## التغيير المقترح

### الهيكل الجديد

استبدال flat card + وصف مفتوح بـ accordion واحد يحتوي على section-ين:

```tsx
{/* --- Product Info Accordion --- */}
{(storeData.fulfillment_policy || product.description) ? (
  <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] text-sm">

    {product.description ? (
      <details className="group">
        <summary className="flex cursor-pointer select-none items-center justify-between gap-3 px-4 py-3 font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition">
          <span>وصف المنتج</span>
          <svg
            className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition group-open:rotate-180"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="px-4 pb-4 pt-2 text-[var(--muted-foreground)] leading-6">
          <p className="whitespace-pre-wrap">{product.description}</p>
        </div>
      </details>
    ) : null}

    {storeData.fulfillment_policy ? (
      <details className="group" open>
        <summary className="flex cursor-pointer select-none items-center justify-between gap-3 px-4 py-3 font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition">
          <span>الشحن والإرجاع</span>
          <svg
            className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition group-open:rotate-180"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="px-4 pb-4 pt-2 space-y-2 text-[var(--muted-foreground)]">
          <p className="font-semibold text-[var(--foreground)]">
            استرجاع المنتج غير المستخدم خلال {storeData.fulfillment_policy.return_window_days} أيام
          </p>
          <p className="leading-6">
            العيب أو الخطأ أو التلف لا يحمّل العميل رسوم الإرجاع أو إعادة الشحن بعد التحقق.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link className="font-semibold text-[var(--primary)] hover:underline" href={`/${slug}/p/returns`}>
              سياسة الاستبدال والاسترجاع
            </Link>
            <Link className="font-semibold text-[var(--primary)] hover:underline" href={`/${slug}/p/shipping`}>
              الشحن وإعادة الشحن
            </Link>
          </div>
        </div>
      </details>
    ) : null}

  </div>
) : null}
```

---

## Variants (لمستقبل الـ API)

| Variant | شرط الظهور | المحتوى |
|---------|-----------|---------|
| `description` | `product.description` غير فارغ | وصف المنتج (مطوي افتراضياً) |
| `returns` | `storeData.fulfillment_policy` موجود | الشحن والإرجاع (**مفتوح** افتراضياً — `open`) |
| `specs` (مستقبلي) | `product.meta_data` يحتوي specs | جدول مواصفات (لم يُضف بعد لحين تحقق API) |

---

## Behavior / States

| الحالة | السلوك |
|--------|--------|
| كلاهما غائب | المكوّن لا يُعرض (`null`) |
| `fulfillment_policy` فقط | accordion بـ section واحدة مفتوحة |
| `description` فقط | accordion بـ section واحدة مطوية |
| كلاهما موجود | accordion بـ section-ين (الإرجاع مفتوحة، الوصف مطوية) |
| وصف قصير (< 100 حرف) | يُعرض مباشرة (لا accordion) — Cursor يقرر الحد |

---

## معايير القبول

- [ ] `<details>/<summary>` HTML نقي — لا `useState`، لا Client Component
- [ ] section الشحن مفتوحة (`open`) بشكل افتراضي
- [ ] section الوصف مطوية بشكل افتراضي
- [ ] أيقونة chevron تدور 180° عند الفتح (`group-open:rotate-180`)
- [ ] الـ flat card القديمة في L104–121 محذوفة كاملاً
- [ ] الوصف المفتوح القديم في L129–133 محذوف كاملاً
- [ ] الـ accordion مُستجيب للـ tokens: `var(--border)`, `var(--muted)`, `var(--primary)`
- [ ] لا تغيير على ProductGallery أو ProductPurchaseSection أو ProductReviews

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `app/[slug]/products/[productId]/page.tsx` | **تعديل** — استبدال L104–121 و L129–133 بـ accordion واحد |

**ملف واحد. لا imports جديدة. لا dependencies. HTML فقط + Tailwind.**

---

## مخاطر التغيير

1. **سلوك Safari مع `<details>`:** مدعوم بالكامل في Safari 6+ — لا مشكلة.

2. **RTL والأيقونة:** التصميم RTL (`dir="rtl"` من الـ store layout). Chevron على اليسار يبدو صحيحاً لأن الـ flex يعكسه تلقائياً.

3. **`open` الافتراضي على "الشحن":** المتسوق يرى المعلومات الأهم (سياسة الإرجاع) دون click — مقصود.

4. **إزالة البطاقة القديمة:** المحتوى الكامل محفوظ في الـ accordion. لا فقدان معلومات.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `tailwind.config` / `styles/globals.css`
- `components/product/ProductPurchaseSection.tsx` — زر "أضف للسلة" خارج نطاق هذا الـ spec
- أي ملف خارج `app/[slug]/products/[productId]/page.tsx`

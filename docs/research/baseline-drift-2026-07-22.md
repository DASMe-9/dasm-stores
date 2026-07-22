# تقرير انحراف بصري — baseline-drift-2026-07-22

**تاريخ التشغيل:** 2026-07-22 (جولة أسبوعية — الأربعاء)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**يوجد drift جديد:** كوميت واحد منذ 2026-06-16 يمس ملفاً بصرياً في الـ baseline.

**المكوّن المتأثر:** `AdSlot variant="wide"` — البانر الإعلاني العريض أسفل قسم "متاجر مميزة".

**قرار المرحلة:** يوجد drift → يُكمل المرحلة 2 (استخبارات المنافسين) ويتوقف دون المرحلة 3 (spec) ريثما يُراجع الـ owner هذا الانحراف.

---

## الكوميتات الجديدة منذ 2026-06-16 التي تمس ملفات baseline

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` | **drift — انظر أدناه** |
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx` | تحسين باتجاه baseline (انظر ملاحظة) |
| `a01b5c5` | — | fix(sso): استقبال sso_token | `pages/auth/` | تدفق تسجيل دخول — خارج نطاق baseline |
| `9e79957` | — | chore(sso): remove legacy raw-token path | `pages/auth/` | تدفق تسجيل دخول — خارج نطاق baseline |

---

## الانحراف المكتشف — AdSlot "بانر واسعة" (حرج)

### المكوّن المنحرف
**الملف:** `app/page.tsx`
**الكوميت:** `5f7bf39` — 2026-06-17

### الوصف البصري
الـ baseline في `docs/design/baseline/marketplace-home.png` يُظهر **نوعين** من AdSlot في الصفحة الرئيسية:

1. **مساحة إعلانية مميزة (inline):** بطاقة داكنة داخل قسم المنتجات — `<Link href="https://ads.dasm.com.sa/advertise" ...>ظهور أوسع بين منتجات المتاجر</Link>` — **تبقى موجودة**.
2. **مساحة بانر واسعة (wide):** شريط عرض كامل أسفل قسم "متاجر مميزة" — **حُذفت**.

### ما تغيّر
السطر الذي حذفه الكوميت `5f7bf39` أزال البانر العريض الثاني تحت الـ `#stores` section. سبب الحذف في رسالة الكوميت: "showed two identical advertise banners — duplicate".

**الحالة في الكود الحالي:** البانر الواسع أسفل المتاجر غير موجود في `app/page.tsx`.

### متى تغيّر
الكوميت `5f7bf39` — 2026-06-17 (غداة آخر تقرير guardian).

### توصية الاسترجاع (كتوصية فقط — لا تنفّذها)
إعادة إضافة بانر إعلاني عريض بعد قسم المتاجر في `app/page.tsx`، بعد السطر الذي يغلق `<section ... id="stores">`:

```tsx
{/* AdSlot wide — مساحة بانر واسعة — موجودة في baseline */}
<section className="mx-auto max-w-7xl px-4 pb-8">
  <Link
    href="https://ads.dasm.com.sa/advertise"
    className="group relative block overflow-hidden rounded-2xl bg-[#031b1e] px-6 py-8 text-white shadow-lg"
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(45,212,191,.3),transparent_40%)]" />
    <div className="relative z-10 flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-start">
      <Target className="h-16 w-16 text-emerald-300 shrink-0" />
      <div>
        <p className="text-sm text-emerald-200">مساحة إعلان بانر</p>
        <h3 className="text-3xl font-extrabold">تواصل مع آلاف العملاء</h3>
      </div>
      <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-base font-extrabold">
        أعلن الآن <Megaphone className="h-5 w-5" />
      </span>
    </div>
  </Link>
</section>
```

**ملاحظة قبل الاسترجاع:** التحقق أولاً مع الـ owner إن كان الحذف قراراً تصميمياً مقصوداً (تبسيط الصفحة) أم خطأ. إن كان مقصوداً → تحديث `docs/design/baseline/components-inventory.md` لإزالة variant "wide" من AdSlot.

---

## ملاحظة: تغيير في ProductCard (ليس drift)

**الكوميت:** `8b42fda` — `components/product/ProductCard.tsx`

تغيير `aspect-square` → `aspect-[4/5]` في صور بطاقة المنتج بصفحات المتجر الفرعي.

**التقييم:** هذا **تحسين باتجاه baseline** وليس انحرافاً عنه. الـ baseline يصف "بطاقة عمودية فاتحة" وهو ما تعكسه نسبة 4:5 بدقة أكبر من المربعة. لا إجراء مطلوب.

---

## حالة الفجوات البصرية المستمرة (لا تغيير)

جدول محدَّث من التقرير السابق — لا تغيير في الحالة:

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
| AdSlot | بانر واسعة أسفل المتاجر | **غائب منذ 5f7bf39** | **drift جديد — هذا التقرير** |

---

## الخطوة التالية

1. **مراجعة بشرية مطلوبة:** هل حذف البانر الواسع قرار تصميمي نهائي أم رجعة مؤقتة؟
   - إن كان قراراً: حدّث `docs/design/baseline/components-inventory.md` وأزل variant "wide" من AdSlot.
   - إن لم يكن: طبّق توصية الاسترجاع أعلاه (Cursor task).
2. لا spec جديد هذه الجولة — الـ drift يسبق توليد spec جديد.
3. جولة المنافسين (المرحلة 2) مكتملة في `docs/research/competitors/2026-30.md`.

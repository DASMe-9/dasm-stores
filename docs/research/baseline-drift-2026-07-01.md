# تقرير انحراف بصري — baseline-drift-2026-07-01

**تاريخ التشغيل:** 2026-07-01 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**وُجد drift جديد.** تم حذف مكوّن `AdSlot (variant: wide)` من `app/page.tsx` في الكوميت `5f7bf39` بتاريخ 2026-06-17.

**قرار المرحلة:** انحراف بصري موثَّق → تتوقف الجولة عند المرحلة 2 (لا spec جديد هذه الجولة وفق التعليمات).

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` | **حذف AdSlot wide** ← drift حرج |
| `56ee40c` | 2026-06-18 | fix(storefront): drop intrusive cart-emptied banner | `components/store/StoreChrome.tsx` | toast بانر — خارج نطاق baseline |
| `60fd4bc` | 2026-06-19 | feat(storefront): standard legal footer + policy pages | `app/[slug]/layout.tsx`, `StoreFooter.tsx` | فوتر قانوني — خارج نطاق baseline |
| `b95d2b6` | 2026-06-20 | [codex] add storefront theme tokens | `app/[slug]/layout.tsx`, `styles/globals.css`, `lib/themes/` | tokens refactor — لا تغيير بصري |
| `8b42fda` | 2026-06-20 | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx`, `StoreHeader.tsx`، وآخرون | token migration — لا تغيير بصري |
| `09dcbe4` | 2026-06-21 | fix(storefront): drop duplicate chrome hero for builder stores | `app/[slug]/layout.tsx`, `StoreHeader.tsx` | compact mode للمتاجر builder فقط — لا تأثير على non-builder |
| `e65d0a0` | 2026-06-22 | fix(storefront): make products page discoverable in store nav | `StoreHeader.tsx`, `StoreTabsNav.tsx` | إضافة رابط nav — خارج baseline |
| `f13b4c1` | 2026-06-22 | fix(themes): drop fake testimonials & newsletter | `lib/themes/blocks/templates.ts` | templates — خارج baseline |
| `8f7b63b` | 2026-06-23 | feat(storefront): Salla-style landing | `ProductGrid.tsx`, `StorefrontBlocks.tsx` | builder landing فقط — خارج baseline |

---

## الانحراف المكتشف — جديد

### AdSlot (variant: wide) — محذوف من الصفحة الرئيسية

| الحقل | التفصيل |
|-------|---------|
| **المكوّن** | `AdSlot variant="wide"` — مساحة إعلان بانر واسعة |
| **الملف** | `app/page.tsx` (السطر ~182 في النسخة السابقة) |
| **الكوميت** | `5f7bf39` — 2026-06-17 |
| **الوصف البصري للتغيير** | القسم كاملاً (شريط عريض داكن بخلفية تركواز متوهجة + أيقونة Target + عنوان "مساحة إعلان بانر واسعة" + نص "وصل لآلاف العملاء يوميًا" + زر "أعلن الآن") اختفى من الصفحة. كان يظهر بين قسم "متاجر مميزة" وقسم "تصفح الأقسام". |
| **ما يظهر في الـ baseline** | `docs/design/baseline/marketplace-home.png`: شريط عرض كامل بأسلوب التركواز المضيء، أيقونة هدف، جملة "وصل لآلاف العملاء"، زر CTA |
| **سبب الحذف (حسب الكوميت)** | "The marketplace home showed two 'أعلن الآن' advertise banners. Removes the second standalone one." |

**ملاحظة:** الـ banner الأول (featured variant داخل قسم المنتجات) لا يزال موجوداً. المحذوف هو الـ wide variant الثاني بين الأقسام.

#### توصية الاسترجاع (للمراجعة فقط — لا تنفيذ)

إعادة إضافة القسم التالي في `app/page.tsx` بعد قسم `#stores` (السطر 183 الحالي) وقبل قسم `#categories`:

```tsx
<section className="mx-auto max-w-7xl px-4 pb-8">
  <Link href="https://ads.dasm.com.sa/advertise" className="relative block overflow-hidden rounded-2xl bg-[#031b1e] px-6 py-5 text-white shadow-lg">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(45,212,191,.28),transparent_32%),linear-gradient(90deg,rgba(20,184,166,.22),transparent_55%)]" />
    <div className="relative z-10 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-start">
      <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-extrabold">أعلن الآن <Megaphone className="h-4 w-4" /></span>
      <div>
        <h2 className="text-2xl font-extrabold">مساحة إعلان بانر واسعة</h2>
        <p className="mt-1 text-sm text-emerald-50/75">وصل لآلاف العملاء يوميًا على متاجر داسم</p>
      </div>
      <Target className="hidden h-16 w-16 text-emerald-200 md:block" />
    </div>
  </Link>
</section>
```

**قرار:** يحتاج مراجعة فريق المنتج — هل الحذف مقصود بشكل دائم (تجميد في الـ baseline الجديد) أم يجب استعادته بتصميم لا يُربك التجربة مع الـ featured variant الأول؟

---

## حالة الفجوات البصرية المستمرة (لا تغيير)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | غائب | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | غائب | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | spec: `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | غائب | spec: `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | غائب | spec: `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | غائب | spec: `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | غائب | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | غائب | spec: `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| **AdSlot (marketplace)** | **wide variant** | **محذوف (5f7bf39)** | **جديد هذه الجولة — يحتاج قرار المنتج** |

---

## الخطوة التالية

- **قرار مطلوب من فريق المنتج:** هل يُعاد `AdSlot wide variant` أم يُحذف رسمياً من الـ baseline؟
- **إن أُعيد:** Cursor ينفذ توصية الاسترجاع أعلاه.
- **إن حُذف نهائياً:** يُحدَّث `docs/design/baseline/components-inventory.md` بإزالة variant="wide" من قسم AdSlot.
- لا spec جديد هذه الجولة (drift مانع وفق قواعد المرحلة 1).

# تقرير انحراف بصري — baseline-drift-2026-07-03

**تاريخ التشغيل:** 2026-07-03 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift)

---

## ملخص تنفيذي

**يوجد drift — مرحلتان 2 و3 متوقفتان بحسب البروتوكول.**

كوميتان جديدتان منذ الجولة الأخيرة (2026-06-16) أحدثتا انحرافاً بصرياً عن الـ baseline في ملفين من ملفات الـ baseline الأساسية.

---

## الكوميتات الجديدة التي تلمس ملفات الـ baseline

| الكوميت | التاريخ | الوصف | الملف |
|---------|---------|-------|-------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner (#181) | `app/page.tsx` |
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx` |
| `09dcbe4` | ~2026-06-20 | fix(storefront): drop duplicate chrome hero for builder stores (#194) | `app/[slug]/layout.tsx` |

---

## الانحراف الأول — حذف بانر "مساحة إعلان بانر واسعة"

**المكوّن:** قسم إعلاني ثانٍ في الصفحة الرئيسية للسوق  
**الملف:** `app/page.tsx` — السطر المحذوف بين قسم `id="stores"` وقسم `id="categories"`  
**الكوميت:** `5f7bf39`

### وصف بصري:
- الـ baseline (`marketplace-home.png`) يُظهر قسماً إعلانياً مستقلاً بين "متاجر مميزة" و"تصفح الأقسام" يحمل:
  - خلفية `#031b1e` مع gradient teal
  - نص "مساحة إعلان بانر واسعة" كعنوان رئيسي
  - عنوان فرعي "وصل لآلاف العملاء يوميًا على متاجر داسم"
  - زر "أعلن الآن" + أيقونة `Target`
- الكود الحالي: القسم محذوف كاملاً

### سبب الحذف (من رسالة الكوميت):
> "The marketplace home showed two 'أعلن الآن' advertise banners. Removes the second standalone one below the featured stores section; the first inline ad under products remains."

**التقييم:** حذف متعمد بدواعي تجنب التكرار. التأثير على الـ baseline موثق ومقبول بقرار متعمد.

### توصية الاسترجاع (إذا طُلب):
إعادة الكتلة المحذوفة بين `</section>` (قسم stores) و`<section ... id="categories">`:
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
**ملاحظة:** هذه توصية فقط — لا تُنفَّذ هنا.

---

## الانحراف الثاني — شارة الخصم في ProductCard (solid → muted)

**المكوّن:** `ProductCard` — شارة خصم النسبة المئوية  
**الملف:** `components/product/ProductCard.tsx` — السطر 38  
**الكوميت:** `8b42fda`

### وصف بصري:
| العنصر | قبل (baseline) | بعد (الكود الحالي) |
|--------|----------------|---------------------|
| خلفية شارة الخصم | `bg-red-500` (أحمر صلب) | `color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))` (tint خفيف 12%) |
| لون النص | `text-white` (أبيض) | `text-[var(--c-sale)]` (لون متغير) |
| نسبة العرض إلى الارتفاع | `aspect-square` (1:1) | `aspect-[4/5]` (أطول بنسبة 25%) |
| شارة "مميز" | `bg-amber-500 text-white` (عنبر صلب) | `backdrop-blur` + `border` + CSS tokens (frosted glass) |

### الأثر البصري:
الـ baseline (`subdomain-store.png`) يُظهر شارات خصم حمراء صلبة بارزة (مثل "خصم 33%"). الكود الجديد يُظهر شارات خفيفة بلون ضعيف قد يُضعف قراءة الخصم. هذا انحراف وظيفي (وضوح المعلومة) ليس فقط جمالياً.

### سبب التغيير:
إعادة هيكلة إلى نظام CSS tokens (كوميت `8b42fda`) — تصميم متعمد لتوحيد المظهر مع الـ theme.

### توصية الاسترجاع (إذا طُلب):
السطر 38 في `components/product/ProductCard.tsx`:
```tsx
// الحالي:
<span className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-sale)]">
// الاسترجاع البصري للـ baseline:
<span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
```
**ملاحظة:** الاسترجاع سيكسر توحيد نظام الـ tokens — قرار تجميع مع Cursor مطلوب.

---

## حالة الفجوات البصرية المستمرة (من تقارير سابقة)

جدول محدَّث — لا تغيير في الحالة على عناصر الـ backlog:

| المكوّن | العنصر | الحالة | القرار |
|---------|--------|--------|--------|
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | ينتظر Cursor — `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | غائب | ينتظر Cursor — `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | غائب | ينتظر Cursor — `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | غائب | ينتظر Cursor — `store-info-trust-badges-2026-06-08.md` |
| Store (mobile) | Sticky Cart Bar | غائب | ينتظر Cursor — `sticky-mini-cart-bar-2026-06-15.md` |
| Header الرئيسية | CTA "افتح متجرك مجاناً" | غائب | ينتظر Cursor — `home-header-seller-cta-2026-06-16.md` |
| مساحة إعلان بانر واسعة | قسم محذوف | **جديد — محذوف 2026-06-17** | موثق أعلاه |
| ProductCard discount badge | solid → muted | **جديد — 2026-06-27** | موثق أعلاه |

---

## القرار

drift موجود → المرحلتان 2 و3 متوقفتان هذه الجولة وفق البروتوكول.
الانحرافان ناتجان عن قرارات متعمدة (تجنب تكرار + توحيد tokens) ولا يستلزمان استرجاعاً تلقائياً.
تنتظران مراجعة صريحة من الفريق قبل أي تصحيح عبر Cursor.

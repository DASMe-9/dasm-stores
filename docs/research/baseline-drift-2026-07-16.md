# تقرير انحراف بصري — baseline-drift-2026-07-16

**تاريخ التشغيل:** 2026-07-16 (جولة أسبوعية — الأربعاء)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**تم رصد drift جديد في مكوّنين.** الانحرافان ناتجان عن تغييرات مقصودة خلال الأسابيع الأربعة الماضية (2026-06-17 إلى 2026-06-21) — أحدهما حذف مكوّن كان موجوداً في الـ baseline، والآخر تغيير تخطيط شبكة المنتجات. كلاهما يستوجب قرار المراجعة: إما استرجاع أو تحديث الـ baseline.

**قرار المرحلة:** drift موجود → تكمل المرحلة 2 فقط، توقف قبل المرحلة 3.

---

## الانحراف الأول — شبكة المنتجات: 6 أعمدة → 4 أعمدة (صفحة المتجر الفرعي)

### التفاصيل

| الحقل | القيمة |
|-------|--------|
| المكوّن | `ProductGrid` |
| الملف | `components/product/ProductGrid.tsx:20` |
| الكوميت | `8f7b63b` — `feat(storefront): Salla-style landing — curated, less card-dominated (#193)` |
| التاريخ | 2026-06-21 |

### وصف الانحراف

**الـ baseline** (`subdomain-store.png`): شبكة المنتجات على صفحة المتجر الفرعي تعرض **6 بطاقات في الصف** على الشاشات الكبيرة (desktop). مثال مرئي: صف "شيرلي لايف" يضم ستة منتجات متجاورة.

**الكود الحالي**: `lg:grid-cols-4` — 4 بطاقات فقط في الصف على desktop.

```diff
- <div className="store-product-grid grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
+ <div className="store-product-grid grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
```

### الأثر البصري

البطاقات أصبحت أكبر وأقل كثافة في الصفحة — هذا قصد التصميم ("bigger, less cramped"). لكنه يعني أن الزائر يرى 4 منتجات فقط في أول fold بدلاً من 6، مما يُقلل الـ discovery density.

### توصية الاسترجاع (للتنفيذ من Cursor فقط)

إذا قُرر الاسترجاع إلى الـ baseline:

```
// components/product/ProductGrid.tsx:20
// من:
lg:grid-cols-4
// إلى:
lg:grid-cols-6
```

إذا قُرر قبول التغيير الجديد → يحتاج تحديث الـ baseline بلقطة جديدة.

---

## الانحراف الثاني — بانر إعلان "مساحة إعلان بانر واسعة" محذوف من الصفحة الرئيسية

### التفاصيل

| الحقل | القيمة |
|-------|--------|
| المكوّن | قسم إعلاني ثانٍ في `app/page.tsx` |
| الملف | `app/page.tsx` (السطر المحذوف كان بين قسم "متاجر مميزة" وقسم "تصفح الأقسام") |
| الكوميت | `5f7bf39` — `fix(marketplace): remove duplicate advertise banner on stores home (#181)` |
| التاريخ | 2026-06-17 |

### وصف الانحراف

**الـ baseline** (`marketplace-home.png`): يظهر بانر إعلاني ثانٍ ذو خلفية داكنة بين قسم "متاجر مميزة" وقسم "تصفح الأقسام":

> "مساحة إعلان بانر واسعة — وصل لآلاف العملاء يوميًا على متاجر داسم" + زر "أعلن الآن"

**الكود الحالي**: هذا القسم غائب تماماً. البانر الأول (بعد المنتجات مباشرة) لا يزال موجوداً.

### العنصر المحذوف

```jsx
// كان موجوداً — محذوف بالكامل:
<section className="mx-auto max-w-7xl px-4 pb-8">
  <Link href="https://ads.dasm.com.sa/advertise" ...>
    <h2>مساحة إعلان بانر واسعة</h2>
    <p>وصل لآلاف العملاء يوميًا على متاجر داسم</p>
  </Link>
</section>
```

### ملاحظة

الكوميت يُسمّي هذا البانر "duplicate" ويعتبر إزالته إصلاحاً. من منظور الـ baseline، هو مكوّن كان حاضراً وأُزيل. القرار المطلوب: هل يُحدَّث الـ baseline ليعكس الوضع الجديد (قسم إعلاني واحد فقط)؟

---

## حالة الفجوات البصرية المستمرة من التقارير السابقة

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

## الكوميتات الجديدة منذ 2026-06-16 (كل الملفات البصرية)

| الكوميت | التاريخ | الوصف | التأثير |
|---------|---------|-------|---------|
| `5f7bf39` | 2026-06-17 | حذف البانر الإعلاني المكرر | ← **drift #2 أعلاه** |
| `2a4698d` | 2026-06-17 | phase 4c: storefront visual builder | builder stores فقط |
| `0f685d9` | 2026-06-18 | Shopify-style block theme editor | dashboard — خارج النطاق |
| `35dece8` | 2026-06-19 | theme editor: surfaces + visual blocks | dashboard — خارج النطاق |
| `c3bd613` | 2026-06-19 | integrated AI block assistant | dashboard — خارج النطاق |
| `d987a13` | 2026-06-20 | visual store builder, templates | dashboard — خارج النطاق |
| `f6d90db` | 2026-06-20 | 10 new section blocks | dashboard — خارج النطاق |
| `26cc22e` | 2026-06-20 | redesign 6 store templates | templates فقط، لا تأثير على baseline store |
| `8f7b63b` | 2026-06-21 | Salla-style landing | ← **drift #1 أعلاه** |
| `afd9d71` | 2026-06-21 | image-with-text block fix | builder blocks — خارج النطاق |
| `09dcbe4` | 2026-06-21 | drop duplicate chrome hero for builder | builder stores فقط |
| `e65d0a0` | 2026-06-21 | products link in store nav | إضافة، لا حذف — مقبولة |
| `60fd4bc` | 2026-06-22 | standard legal footer | footer — خارج نطاق baseline |
| `56ee40c` | 2026-06-22 | drop cart-emptied banner | UX fix — خارج نطاق baseline |
| `b95d2b6` | 2026-07-03 | add storefront theme tokens | CSS refactor — لا تأثير بصري |
| `8b42fda` | 2026-07-03 | refactor storefront to tokens | CSS refactor — لا تأثير بصري |
| `9e79957` | 2026-07-10 | remove legacy SSO raw-token path | auth — خارج النطاق |
| `a01b5c5` | 2026-07-11 | SSO short-lived token | auth — خارج النطاق |
| `b16dbb8` | 2026-07-14 | onboarding name + password | auth — خارج النطاق |
| `9a7dab5` | 2026-07-15 | Google sign-in Socialite | auth — خارج النطاق |
| `d3ece4c` | 2026-07-15 | Google/Apple sign-in | auth — خارج النطاق |

---

## الخطوة التالية

drift موجود → توقف قبل المرحلة 3. القرارات المطلوبة من الفريق:

1. **ProductGrid 4-up**: هل هو قرار نهائي؟ إذا نعم → تحديث baseline بلقطة جديدة.
2. **البانر الإعلاني الثاني**: هل حذفه نهائي؟ إذا نعم → تحديث baseline.

تكملة المرحلة 2 (استخبارات المنافسين) وفق الجدول المعتاد.

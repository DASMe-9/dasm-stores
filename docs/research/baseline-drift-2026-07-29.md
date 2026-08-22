# تقرير انحراف بصري — baseline-drift-2026-07-29

**تاريخ التشغيل:** 2026-07-29 (جولة أسبوعية — الثلاثاء)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

**وُجد drift جديد في موقعين.** الكوميتات منذ الجولة الأخيرة (2026-06-16) أحدثت تغييرين بصريين موثّقين أدناه.

**قرار المرحلة: لا تُولَّد spec هذه الجولة** (وفق القاعدة — drift موجود → المرحلة 3 متوقفة).

---

## الكوميتات الجديدة المؤثرة بصرياً (منذ 2026-06-16)

| الكوميت | التاريخ | الوصف | التأثير |
|---------|---------|-------|---------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner (#181) | حذف البانر الإعلاني الثاني |
| `8f7b63b` | 2026-06-21 | feat(storefront): Salla-style landing (#193) | تغيير شبكة المنتجات |
| `09dcbe4` | 2026-06-21 | fix(storefront): drop duplicate chrome hero for builder stores (#194) | وضع compact للمتاجر ذات الـ builder |
| `8b42fda` | 2026-06-27 | refactor storefront components to tokens | إعادة هيكلة CSS tokens — لا تغيير بصري مرئي |

---

## Drift #1 — حذف البانر الإعلاني الثاني من الصفحة الرئيسية

**المكوّن:** بانر إعلاني ثانٍ في `app/page.tsx`
**الملف + التقريب:** `app/page.tsx` (السطر المحذوف كان بين `#stores` و `#categories`)

**الحالة في الـ baseline:**
`marketplace-home.png` يُظهر بانرَين داكنَين في الصفحة الرئيسية:
1. بانر أول (بعد قسم المنتجات): "ظهور أوسع بين منتجات المتاجر" + زر "أعلن الآن" — **لا يزال موجوداً** ✅
2. بانر ثانٍ (بعد قسم "متاجر مميزة"): "مساحة إعلان بانر واسعة" + زر "أعلن الآن" — **محذوف** ❌

**الحالة في الكود الحالي:**
البانر الثاني غائب. الكوميت `5f7bf39` (PR #181) حذفه بوصف "remove duplicate advertise banner".

**الانحراف البصري:**
الصفحة الرئيسية تفقد مساحة إعلانية ظهرت في الـ baseline تحت "متاجر مميزة".

**توصية الاسترجاع (للمراجعة — لا تنفيذ):**
إعادة إضافة البانر الثاني في `app/page.tsx` بعد قسم `#stores` مباشرةً:
```tsx
<Link href="https://ads.dasm.com.sa/advertise" className="...">
  مساحة إعلان بانر واسعة ...
</Link>
```
**ملاحظة:** الحذف كان متعمداً (PR #181 يصفه بـ "duplicate") — يستلزم قرار المنتج قبل الاسترجاع.

---

## Drift #2 — شبكة المنتجات في صفحة المتجر: 6 أعمدة → 4 أعمدة

**المكوّن:** `ProductGrid` في `app/[slug]/page.tsx`
**الملف:** `components/product/ProductGrid.tsx`

**الحالة في الـ baseline:**
`subdomain-store.png` يُظهر 6 بطاقات منتج في صف واحد على سطح المكتب (grid 6-up).

**الحالة في الكود الحالي:**
الكوميت `8f7b63b` (PR #193 — Salla-style landing) غيّر ProductGrid من 6 columns إلى 4 columns على سطح المكتب:
> "ProductGrid: 6-up → 4-up on desktop. Bigger, less cramped cards."

**الانحراف البصري:**
صفحة المتجر الفرعي تعرض بطاقات أوسع (4 بدل 6 في الصف الواحد) — صفحة أقل كثافة من الـ baseline.

**ملاحظة:** التغيير متعمد ومبرر بصرياً (بطاقات أكبر = تجربة Salla). لكنه انحراف عن الـ baseline المرجعي.

**توصية الاسترجاع (للمراجعة فقط):**
العودة إلى `lg:grid-cols-6` في `ProductGrid.tsx` إن أُريد التوافق مع الـ baseline. الإبقاء على 4 أعمدة إن كان القرار نهائياً → يستلزم تحديث الـ baseline نفسه.

---

## Drift #3 — وضع الهيدر للمتاجر ذات الـ builder (compact mode)

**المكوّن:** `StoreHeader` في `components/store/StoreHeader.tsx`

**الحالة في الـ baseline:**
`subdomain-store.png` يُظهر: hero banner كامل + بطاقة معلومات المتجر العائمة (الشعار + الاسم + وصف + هاتف + أزرار).

**الحالة في الكود الحالي:**
الكوميت `09dcbe4` (PR #194) يجعل المتاجر ذات الـ builder تحصل على وضع `compact=true` في StoreHeader — يظهر شريط هوية خفيف بدلاً من الـ hero الكامل.

**التأثير على الـ baseline:**
يؤثر فقط على المتاجر ذات builder layout. المتاجر غير-builder (كالمتجر المرجعي في الـ baseline "شيرلي لايف" إن لم تكن builder) تحصل على الـ hero الكامل كالمعتاد.

**الانحراف:** محدود — يؤثر على تجربة المتاجر المتقدمة فقط.

---

## حالة الفجوات البصرية المستمرة (من تقارير سابقة)

| المكوّن | العنصر | الـ Spec المرتبط | الحالة |
|---------|--------|-----------------|--------|
| ProductTile (marketplace) | زر سلة دائري vs `rounded-xl` | `product-tile-cart-button-2026-06-14.md` | ينتظر Cursor |
| ProductTile (marketplace) | زر مفضلة | `product-tile-wishlist-2026-06-11.md` | ينتظر Cursor |
| ProductCard (store pages) | زر مفضلة | `product-card-store-wishlist-2026-06-12.md` | ينتظر Cursor |
| StoreInfoCard | وسوم ثقة (موثوق / توصيل سريع) | `store-info-trust-badges-2026-06-08.md` | ينتظر Cursor |
| Store (mobile) | Sticky Cart Bar | `sticky-mini-cart-bar-2026-06-15.md` | ينتظر Cursor |
| HomeHeaderActions | زر "افتح متجرك" للضيف | `home-header-seller-cta-2026-06-16.md` | ينتظر Cursor |

---

## الخطوة التالية

- إجراء Drift #2 يستلزم قرار من المنتج: هل 4 أعمدة هو التصميم النهائي؟ إذا نعم → تحديث الـ baseline.
- إجراء Drift #1 يستلزم قرار من المنتج: إعادة البانر الثاني أم إسقاطه رسمياً من الـ baseline؟
- لا spec جديد هذه الجولة — drift قائم يسبق أولوية الميزات الجديدة.

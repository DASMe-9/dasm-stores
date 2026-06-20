# تقرير انحراف بصري — baseline-drift-2026-06-20

**تاريخ التشغيل:** 2026-06-20 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**تم رصد drift جديد.** الكوميت `5f7bf39` أزال قسم "مساحة إعلان بانر واسعة" من الصفحة الرئيسية للسوق، وهو العنصر الثاني من `AdSlot` الموثّق في `docs/design/baseline/components-inventory.md`.

**قرار المرحلة:** تم توثيق الانحراف أدناه. **لا تكتمل المرحلتان 2 و3 في هذه الجولة** وفق قاعدة الانحراف المانع.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | الوصف | الملف | التأثير البصري |
|---------|-------|-------|----------------|
| `26cc22e` | إعادة تصميم 6 قوالب متاجر للـ builder | `lib/themes/blocks/templates.ts` | builder فقط — لا تأثير على baseline المتسوق |
| `5f7bf39` | **حذف banner واسع مكرر من صفحة السوق** | `app/page.tsx` | **انحراف عن baseline — موثّق أدناه** |
| `2a4698d` | phase 4c — storefront يعرض visual builder (hybrid) | `app/[slug]/page.tsx` | لا drift: `StoreHeader` يُعرض من الـ layout (`app/[slug]/layout.tsx`) لجميع المتاجر |
| `d987a13` | phase 4b — visual store builder, templates, section library | `components/theme-editor/` | builder/dashboard فقط — خارج نطاق baseline المتسوق |
| `f6d90db` | phase 4a — 10 section blocks + design controls | `lib/themes/blocks/` | builder/dashboard فقط |
| `c3bd613` | m3 — AI block assistant (Haiku) | `components/theme-editor/SplitEditor.tsx` | builder/dashboard فقط |
| `35dece8`, `0f685d9` | m2/m1 — visual blocks, live iframe | `components/theme-editor/` | builder/dashboard فقط |

---

## الانحراف الجديد — حرج (مانع للمرحلة 2)

### AdSlot wide variant — محذوف من marketplace home

| الحقل | القيمة |
|-------|--------|
| **الملف** | `app/page.tsx` |
| **الكوميت** | `5f7bf39` (2026-06-17) |
| **السطر المحذوف (قبل)** | `<section className="mx-auto max-w-7xl px-4 pb-8"><Link href="https://ads.dasm.com.sa/advertise" ...><h2 className="text-2xl font-extrabold">مساحة إعلان بانر واسعة</h2><p className="mt-1 text-sm text-emerald-50/75">وصل لآلاف العملاء يوميًا على متاجر داسم</p>...</Link></section>` |
| **الحالة بعد الحذف** | قسم مستقل غائب تماماً؛ يبقى الإعلان المدمج داخل قسم المنتجات (`!q`) |
| **مرجع الـ baseline** | `components-inventory.md` → قسم **AdSlot** يُصرّح بنوعين: 1) مساحة إعلان مميزة 2) **مساحة بانر واسعة** |
| **الوصف البصري للعنصر المحذوف** | شريط عرض كامل العرض بخلفية داكنة مع تدرج تركواز، أيقونة `Target`، عنوان "مساحة إعلان بانر واسعة"، جملة "وصل لآلاف العملاء"، زر "أعلن الآن" |
| **متى تغيّر** | 2026-06-17 10:18 UTC+3 (بعد جولة 2026-06-16) |
| **سبب الحذف (من commit message)** | "The marketplace home showed two 'أعلن الآن' advertise banners. Removes the second standalone one" |

#### توصية الاسترجاع

القسم المحذوف كان المرحلة الثانية (`variant="wide"`) من نمط AdSlot الموثّق في الـ baseline. الانحراف **ليس عرضياً** — قرار مقصود من المطوّر بحذفه كـ "مكرر". الخيارات:

1. **استعادة القسم بمحتوى مختلف** حتى يتمايز عن الإعلان المدمج أسفل المنتجات:
   ```tsx
   // في app/page.tsx — بعد section#stores وقبل section#categories
   // السطر الحالي بعد featuredStores section
   <StoreAdSlot slotKey="home.wide-banner" variant="wide" className="mx-auto max-w-7xl px-4 pb-8" />
   ```
   
2. **تحديث الـ baseline رسمياً** إذا كان قرار الحذف نهائياً: تعديل `components-inventory.md` لإزالة نوع "مساحة بانر واسعة" من `AdSlot`.

**القرار مطلوب من المطوّر** قبل إغلاق هذا الانحراف. الـ baseline الرسمي لا يزال يشترط وجود النوعين.

---

## ملاحظة — phase 4c hybrid rendering (لا drift جديد)

الكوميت `2a4698d` غيّر `app/[slug]/page.tsx` لتقديم المتاجر ذات builder layouts عبر `StorefrontBlocks`. قد يبدو هذا تغييراً في صفحة المتجر الفرعي، لكن `StoreHeader` (الـ Hero + StoreInfoCard العائمة) يُعرض من الـ **layout** (`app/[slug]/layout.tsx` — السطر 75)، وليس من الـ page component. لذلك:
- المتاجر ذات builder: Layout → StoreHeader + StoreTabsNav + **StorefrontBlocks**
- المتاجر بدون builder: Layout → StoreHeader + StoreTabsNav + المحتوى التقليدي

**لا انحراف جديد في صفحة المتجر الفرعي.** الفجوات السابقة (trust badges، primary CTA) لا تزال موثّقة ومُعلّقة.

---

## حالة الفجوات البصرية المستمرة (محدَّثة)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة (موثوق / توصيل سريع) | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| **AdSlot (marketplace)** | **مساحة بانر واسعة** | **محذوف (5f7bf39)** | **🔴 انحراف جديد — قرار مطوّر مطلوب** |

---

## الخطوة التالية

1. **إجراء مطلوب من المطوّر:** قرار بشأن AdSlot wide — استعادة أم تحديث الـ baseline.
2. بمجرد الإغلاق: تكتمل المرحلتان 2 و3 في الجولة القادمة.
3. **الجولة القادمة:** 2026-06-27 (الأحد القادم).

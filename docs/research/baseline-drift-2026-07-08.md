# تقرير انحراف بصري — baseline-drift-2026-07-08

**تاريخ التشغيل:** 2026-07-08 (أول تشغيل للـ Design Guardian الجديد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift)

---

## ملخص تنفيذي

**يوجد drift حرج.** كوميتان صدرا في 2026-06-17 يُنشئان انحرافين بصريين جديدين عن الـ baseline:

1. **إزالة "مساحة إعلان بانر واسعة"** من الصفحة الرئيسية — الـ baseline يصف نوعَي AdSlot، الكود الآن يعرض نوعاً واحداً.
2. **مسار العرض البصري للباني** في صفحة المتجر الفرعي — stores ذات `theme_config.editor` تعرض الآن `StorefrontBlocks` بدلاً من التخطيط المعياري؛ الـ baseline لا يُغطي هذا السطح الجديد.

**قرار المرحلة:** drift مؤكد → لا انتقال إلى Phase 3 (spec). يُكتفى بـ Phase 2 (استخبارات منافسين).

---

## الكوميتات الجديدة منذ 2026-06-16

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` | **drift** — حذف البانر الواسع |
| `2a4698dd` | 2026-06-17 | feat(storefront): phase 4c visual builder hybrid | `app/[slug]/page.tsx` + ملفات جديدة | **drift حرج** — سطح بصري جديد غير مُوثَّق |

---

## الانحراف الأول: إزالة "مساحة إعلان بانر واسعة"

**المكوّن المنحرف:** `AdSlot` — variant `wide`
**الملف والسطر:** `app/page.tsx` (السطر الذي كان يحتوي على `StoreAdSlot variant="wide"` أو ما يعادله تحت قسم `#stores`)
**الوصف البصري:** أزال الكوميت `5f7bf39` الـ standalone wide banner strip تحت قسم "متاجر مميزة". تبقّى البانر الإعلاني الواحد inline داخل قسم المنتجات (`!q ? <Link href="https://ads.dasm.com.sa/advertise" ...>`).
**ما تغيّر:** `components-inventory.md` السطور 79–87 يصف نوعَي AdSlot:
  - نوع 1 "مساحة إعلان مميزة" — **لا يزال موجوداً** (inline ضمن قسم المنتجات)
  - نوع 2 "مساحة بانر واسعة" — **حُذف** (كان يظهر تحت قسم المتاجر المميزة)
**متى تغيّر:** 2026-06-17 بكوميت `5f7bf39`
**طبيعة التغيير:** إصلاح مقصود (إزالة تكرار)، لكنه يُنشئ انحرافاً عن الـ baseline الذي يُوثّق النوعين.
**توصية الاسترجاع أو التحديث:** لا استرجاع مطلوب — التكرار كان خطأ. الإجراء: تحديث `docs/design/baseline/components-inventory.md` السطور 79–87 لحذف وصف variant `wide`، وتحديث صورة الـ baseline إن أمكن.

---

## الانحراف الثاني: مسار العرض البصري للباني (حرج)

**المكوّن المنحرف:** `StoreHomePage` — صفحة المتجر الفرعي
**الملف والسطر:** `app/[slug]/page.tsx` السطور 39–50
**الوصف البصري:** الـ baseline `subdomain-store.png` يصف تخطيطاً ثابتاً (hero بانر + StoreInfoCard عائمة + شبكة منتجات). بعد الكوميت `2a4698dd`، المتاجر التي أعد بها التاجر "Visual Builder" (أي لديها `theme_config.editor`) تُعرض عبر `StorefrontBlocks` بدلاً من التخطيط المعياري:

```tsx
if (hasBuilderLayout(data.store.theme_config)) {
  const { blocks, design } = readBuilderSurface(data.store.theme_config, "landing");
  return <StorefrontBlocks blocks={blocks} ... />;
}
```

`StorefrontBlocks` يُعرض بنية بلوكات مرنة (hero مخصص، sections محتوى، product-grid تفاعلي) تختلف بالكامل عن التخطيط المعياري في الـ baseline.

**ما تغيّر:**
- الـ baseline `subdomain-store.png` لم يعد يُغطي جميع صفحات المتاجر — هو صالح فقط للمتاجر دون builder config
- سطح بصري جديد (المتاجر المُبنية بالمحرر البصري) موجود في الإنتاج بدون baseline توثيقي
- لا screenshot، لا component-inventory، لا visual contract للـ StorefrontBlocks

**متى تغيّر:** 2026-06-17 بكوميت `2a4698dd`
**طبيعة التغيير:** ميزة مقصودة (Phase 4c من roadmap الـ Builder)، لكنها تُنشئ فجوة في التغطية البصرية.

**توصية الاسترجاع:** لا استرجاع — الميزة صحيحة. الإجراء المطلوب:
1. إنشاء `docs/design/baseline/builder-store-landing.png` (لقطة شاشة لمتجر builder نشط)
2. إضافة قسم "StoreHome — Builder Surface" في `docs/design/baseline/components-inventory.md`
3. تحديث وصف `subdomain-store.png` ليُشير صراحةً إلى أنه يخص "المتاجر بدون builder config"

---

## حالة الفجوات البصرية المستمرة (من تقارير سابقة)

| المكوّن | العنصر | الحالة | القرار |
|---------|--------|--------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول — تجميد 2026-06-07 |
| ProductTile | شارة «ممول» | **غائب** | مقبول — تجميد |
| ProductTile | زر سلة دائري | `rounded-xl` لا `rounded-full` | specs `product-tile-cart-button` معلق |
| ProductTile | أيقونة قلب | **غائب** | spec `product-tile-wishlist` معلق |
| ProductCard | أيقونة قلب | **غائب** | spec `product-card-store-wishlist` معلق |
| StoreInfoCard | وسوم ثقة | **غائب** | spec `store-info-trust-badges` معلق |
| Marketplace | StatsBar | **غائب** | مقبول — تجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | spec `sticky-mini-cart-bar` معلق |
| AdSlot | variant wide | **مُحذوف عمداً** | baseline يحتاج تحديث (drift 1 أعلاه) |
| StorefrontBlocks | كل السطح | **لا baseline** | baseline جديد مطلوب (drift 2 أعلاه) |

---

## الخطوة التالية

- **إجراء فوري مطلوب (يدوي):** التقاط screenshot لمتجر builder نشط وإضافته إلى `docs/design/baseline/` + تحديث `components-inventory.md`
- لا spec هذه الجولة — drift مانع يوقف Phase 3 حتى تُحدَّث الـ baseline
- الجولة القادمة: إن تم تحديث الـ baseline، يُعاد تقييم الـ spec المؤجل من W29 (seller CTA في الهيدر)

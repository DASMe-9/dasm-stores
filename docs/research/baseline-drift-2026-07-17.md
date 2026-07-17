# تقرير انحراف بصري — baseline-drift-2026-07-17

**تاريخ التشغيل:** 2026-07-17 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)
**الفترة المشمولة:** 2026-06-17 إلى 2026-07-17 (30 يوماً)

---

## ملخص تنفيذي

**تم اكتشاف انحرافات بصرية جديدة.** ثلاثة تغييرات جوهرية تجاوزت الـ baseline منذ الجولة الأخيرة (2026-06-16). الانحراف الأول حذف عنصر baseline موثّق؛ الانحرافان الآخران تغييرات تحسينية تستوجب التوثيق. **المرحلتان 2 و3 موقوفتان وفق القاعدة** (لا تتجاوز المرحلة 2 عند وجود drift).

---

## الكوميتات المعنية

| الكوميت | التاريخ | الوصف | الملف |
|---------|---------|-------|-------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` |
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx` |
| `e65d0a0` | — | fix(storefront): store nav discovery | `components/store/StoreHeader.tsx` |
| `09dcbe4` | — | fix(storefront): drop duplicate chrome hero for builder | `components/store/StoreHeader.tsx` |

---

## الانحرافات الجديدة

### انحراف 1 — CRITICAL: حذف "مساحة إعلان بانر واسعة" من الصفحة الرئيسية

**الملف:** `app/page.tsx`

**الوصف البصري لما كان:**
قسم كامل عرض الصفحة بخلفية داكنة `#031b1e` وتدرج تركواز، يضم:
- شارة "أعلن الآن" بلون emerald-500
- عنوان كبير "مساحة إعلان بانر واسعة"
- وصف "وصل لآلاف العملاء يوميًا على متاجر داسم"
- أيقونة Target كبيرة على اليمين

**ما تغيّر:** القسم كاملاً حُذف في commit `5f7bf39` بدواعي إزالة التكرار.

**الـ baseline يذكر صراحةً:**
> **مساحة بانر واسعة:** شريط عرض كامل بنفس أسلوب التركواز المضيء، أيقونة هدف/تأثير بصري، عنوان، جملة "وصل لآلاف العملاء"، زر "أعلن الآن"

هذا العنصر كان موثّقاً في baseline كـ `AdSlot variant="wide"` ويمثّل جزءاً من التصميم المرجعي.

**الموقع في الكود (قبل الحذف):**
```
app/page.tsx — السطر 182 (مُزال):
<section className="mx-auto max-w-7xl px-4 pb-8">
  <Link href="https://ads.dasm.com.sa/advertise" ...>
    ...مساحة إعلان بانر واسعة...
  </Link>
</section>
```

**توصية الاسترجاع:**
إعادة المساحة بصيغة مشروطة: تُعرض فقط عند عدم وجود ad حي من `StoreAdSlot`. اقتراح محدد:

```tsx
{/* يُضاف بعد قسم #stores — يظهر فقط كـ fallback عند غياب ad */}
{!q && (
  <section className="mx-auto max-w-7xl px-4 pb-8">
    <Link href="https://ads.dasm.com.sa/advertise"
      className="relative block overflow-hidden rounded-2xl bg-[#031b1e] px-6 py-5 text-white shadow-lg">
      {/* محتوى البانر */}
    </Link>
  </section>
)}
```

هذه توصية فقط — لا تنفيذ من Guardian.

---

### انحراف 2 — NOTICE: نسبة أبعاد صورة المنتج تغيّرت

**الملف:** `components/product/ProductCard.tsx`، السطر 27
**الكوميت:** `8b42fda` (2026-06-27)

**ما تغيّر:**
```diff
- <div className="store-product-card__media relative aspect-square bg-[var(--muted)]">
+ <div className="store-product-card__media relative aspect-[4/5] bg-[var(--c-surface-2)]">
```

**قبل:** نسبة 1:1 (مربعة)
**بعد:** نسبة 4:5 (عمودية — أكثر ملاءمة للمنتجات)

**التقييم:** انحراف تحسيني — لا regression. الـ baseline يصف "صورة منتج كبيرة" دون تحديد نسبة. 4:5 يتوافق مع معايير ecommerce الحديثة (Salla/Shopify).

**قرار:** لا توصية باسترجاع — التغيير مقبول ويُضاف للجدول المستمر.

---

### انحراف 3 — NOTICE: لون شارة "مميز" في ProductCard تغيّر

**الملف:** `components/product/ProductCard.tsx`، السطر 33
**الكوميت:** `8b42fda` (2026-06-27)

**ما تغيّر:**
```diff
- <span className="... bg-amber-500 ... text-white">
+ <span className="... bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] ... text-[var(--c-accent)] ... backdrop-blur">
```

**قبل:** خلفية amber-500 صلبة مع نص أبيض
**بعد:** خلفية شفافة بتأثير blur مع نص بلون accent (تركواز في الثيم الافتراضي)

**التقييم:** انحراف تحسيني — الشارة أصبحت theme-aware بدلاً من hardcoded amber. يتوافق أكثر مع لغة الـ baseline (تركواز).

**قرار:** لا توصية باسترجاع — التغيير مقبول ويُضاف للجدول المستمر.

---

## جدول الفجوات البصرية المستمرة (محدَّث)

| المكوّن | العنصر | الحالة في الكود | الأولوية | القرار |
|---------|--------|-----------------|----------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | منخفضة | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | منخفضة | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري | `rounded-xl` بدل `rounded-full` | متوسطة | spec جاهز `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | متوسطة | spec جاهز `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | متوسطة | spec جاهز `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | **غائب** | متوسطة | spec جاهز `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | **غائب** | منخفضة | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | عالية | spec جاهز `sticky-mini-cart-bar-2026-06-15.md` |
| **AdSlot — marketplace** | **بانر واسع «إعلن الآن»** | **محذوف** | **عالية** | **جديد هذه الجولة — ينتظر قرار** |
| ProductCard | نسبة أبعاد الصورة 4:5 | `aspect-[4/5]` (كان `square`) | — | مقبول (تحسين) |
| ProductCard | لون شارة "مميز" | accent token بدل amber | — | مقبول (تحسين) |

---

## الإجراءات المطلوبة

1. **قرار عاجل** على AnحراF 1 (البانر المحذوف): استرجاع أم تثبيت الحذف رسمياً كقرار تصميم؟
   - إن قُرِّر الاسترجاع: توليد spec `ad-slot-wide-banner-restore` في الجولة القادمة.
   - إن قُرِّر التثبيت: تحديث `docs/design/baseline/components-inventory.md` بحذف `AdSlot variant="wide"`.

2. **Specs معلقة** (تنتظر Cursor منذ أسابيع): `sticky-mini-cart-bar`, `product-tile-cart-button`, `product-tile-wishlist` — الأولوية العالية منها يُذكَّر بها في أقرب sprint.

---

## الخطوة التالية

القاعدة الصارمة مُطبَّقة: وُجد drift → إيقاف المرحلتين 2 و3 هذه الجولة.
الجولة القادمة (الأحد القادم): إن حُسم قرار البانر وتم تحديث الـ baseline أو الكود → استئناف دورة المراحل الكاملة.

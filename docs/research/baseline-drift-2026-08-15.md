# تقرير انحراف بصري — baseline-drift-2026-08-15

**تاريخ التشغيل:** 2026-08-15 (جولة أسبوعية — السبت)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

**⚠️ يوجد drift جديد — جولتان غير مُوثَّقتان (2026-06-17 → 2026-08-15).**

رُصد انحرافان بصريان جوهريان مستحدثان لم تُوثّقهما التقارير السابقة:

1. **إعادة تصميم كاملة لـ Hero (الصفحة الرئيسية)** — كوميت `013f987` بتاريخ 2026-07-30
2. **تغيير وظيفي في زر ProductTile** — نفس الكوميت `013f987`

**قرار المرحلة:** يوجد drift حرج → المرحلتان 2 و3 متوقفتان وفق قواعد التشغيل.

---

## الكوميتات الجديدة على الملفات البصرية منذ 2026-06-16

| الكوميت | التاريخ | الوصف | الملفات المعنية |
|---------|---------|-------|-----------------|
| `2a4698d` | 2026-06-17 | feat(storefront): phase 4c — public storefront renders visual builder (hybrid) | `app/[slug]/page.tsx` |
| `8b42fda` | 2026-07 | refactor storefront components to tokens | `components/` عدة مكوّنات |
| `013f987` | 2026-07-30 | [codex] elevate DASM Stores marketplace homepage | `app/page.tsx`, `components/home/HomeHeaderActions.tsx` |
| `2a9372c` | 2026-07-30 | [codex] fix homepage light and dark theme coverage | `app/page.tsx` |

---

## Drift جديد #1 — إعادة تصميم كاملة للـ Hero (marketplace)

### المكوّن المنحرف
**الملف:** `app/page.tsx` — القسم `<section data-testid="platform-hero">` (السطور 452–499)

### وصف بصري دقيق لما تغيّر

| العنصر | الـ Baseline | الكود الحالي |
|--------|-------------|--------------|
| لون خلفية الـ Hero | داكن `bg-[#021b1f]` مع تأثير ضوئي متوهج | فاتح `bg-[#eaf2f1]` (تركواز فاتح) في الـ light mode، `bg-[#081c2c]` في الـ dark |
| المحتوى البصري | مكوّن `HeroScene` بمجسمات ثلاثية الأبعاد وجسيمات متحركة | مكوّن `CommercePassport` — بطاقة خطوات مسار مع عداد متاجر |
| شريط البحث | مُضمَّن داخل الـ Hero كعنصر positioned أسفله مع تنسيق `rounded-full` | منقول إلى قسم مستقل خارج الـ Hero (`<section className="border-b border-slate-200 bg-[#f4f0e8]">`) |
| إعلان hero | `StoreAdSlot slotKey="store.home.banner" variant="hero"` مضمَّن بداخل الـ Hero | محذوف من الـ Hero تماماً |
| العنوان | "اكتشف متاجر ومنتجات داسم" — عنوان واحد على خلفية داكنة | "من متجر سعودي مستقل، إلى سوق أكبر." — عنوان بلون ثنائي مع subheadline طويل |
| صف مزايا المنصة (شحن / ثقة / أمان / دعم) | موجود تحت البحث في baseline | **غائب** في الكود الحالي (مقبول بقرار التجميد من 2026-06-07 للجولات السابقة، لكن يُعاد رصده مع إعادة التصميم) |

### متى تغيّر
كوميت `013f987` بتاريخ 2026-07-30 — `git log --oneline -- app/page.tsx`

### توصية الاسترجاع (كتوصية فقط — لا تنفّذها)

إعادة التصميم الحالية بُنيت عمداً (سلسلة codex commits). الخيار ليس استرجاع الكود القديم، بل أحد مسارين:

**مسار A — قبول الـ baseline الجديد:**
قرار إداري: تحديث `docs/design/baseline/marketplace-home.png` بلقطة جديدة للـ Hero الحالي وإغلاق هذا الـ drift رسمياً.

**مسار B — إعادة عناصر baseline إلى الـ Hero الجديد:**
إضافة صف مزايا المنصة (4 أيقونات: شحن، ثقة، أمان، دعم) أسفل مجموعة الـ CTAs في `app/page.tsx` السطور 471–486، وذلك داخل نفس الـ `<div className="max-w-2xl">`.

---

## Drift جديد #2 — تغيير وظيفي في زر ProductTile

### المكوّن المنحرف
**الملف:** `app/page.tsx` — داخل دالة `ProductTile`، السطر 235–240

### وصف بصري دقيق لما تغيّر

| العنصر | الـ Baseline | الكود الحالي |
|--------|-------------|--------------|
| الأيقونة | `ShoppingCart` — يدل على "أضف للسلة" | `ArrowLeft` — يدل على "اذهب للمنتج" |
| الوجهة عند النقر | `href="/{storeSlug}/cart"` — سلة المتجر | `href="/{storeSlug}/products/{id}"` — صفحة تفصيل المنتج |
| aria-label | `"فتح سلة {storeName}"` | `"عرض {product.name}"` |
| الـ shape | `rounded-xl` | `rounded-xl` (لا تغيير) |
| اللون | `bg-emerald-50 text-emerald-700` | `bg-emerald-50 text-emerald-700` (لا تغيير) |

**الدلالة البصرية:** الزر لا يزال يبدو بنفس الحجم والشكل، لكن يشير بصرياً لوظيفة مختلفة (تصفح لا شراء). المستخدم يتوقع إضافة للسلة فيجد نفسه في صفحة المنتج.

### متى تغيّر
كوميت `013f987` بتاريخ 2026-07-30.

### توصية الاسترجاع (كتوصية فقط — لا تنفّذها)

في `app/page.tsx` السطر 235–240، استبدال:

```tsx
// الحالي (لا تعدّله — هذا للتوثيق فقط)
<Link
  href={productHref}
  className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 ..."
  aria-label={`عرض ${product.name}`}
>
  <ArrowLeft className="h-4 w-4" />
</Link>
```

بـ:

```tsx
// مقترح Cursor
<Link
  href={`/${product.storeSlug}/cart`}
  className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 ..."
  aria-label={`أضف ${product.name} للسلة`}
>
  <ShoppingCart className="h-4 w-4" />
</Link>
```

ملاحظة: التغيير يجمع تصحيح الـ `rounded-full` (drift سابق من `product-tile-cart-button-2026-06-14.md`) مع استرجاع الـ ShoppingCart — الفرصة لإغلاق spec سابق في آنٍ واحد.

---

## حالة الفجوات البصرية المستمرة (محدَّثة من 2026-06-16)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول 2026-06-07 — يُعاد النظر مع إعادة تصميم الـ Hero |
| Hero (marketplace) | 3D visuals / HeroScene | **غائب بالكامل** | **DRIFT جديد** — هذا التقرير |
| Hero (marketplace) | بحث مُضمَّن | خارج الـ Hero | **DRIFT جديد** — هذا التقرير |
| ProductTile (marketplace) | زر سلة / ShoppingCart | مُستبدَل بـ ArrowLeft | **DRIFT جديد** — هذا التقرير |
| ProductTile (marketplace) | زر سلة `rounded-full` | `rounded-xl` | spec جاهز `product-tile-cart-button-2026-06-14.md` — يُغلَق مع drift #2 |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | spec جاهز `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | spec جاهز `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreCard logo | دائري (`rounded-full`) | `rounded-xl` في `StoreCard.tsx` سطر 35 | ongoing drift |
| StoreInfoCard | وسوم ثقة + بطاقة عائمة | **غائب** من `app/[slug]/page.tsx` | spec جاهز `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | spec جاهز `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## ملاحظة إيجابية — Spec W29 مُنفَّذ

توصية W29 ("زر افتح متجرك في هيدر الصفحة الرئيسية للضيوف") تحققت في كوميت `013f987`:
`components/home/HomeHeaderActions.tsx` — زر `"افتح متجرك"` بـ `bg-[#0e7c66]` مضاف للضيوف.
يمكن إغلاق `docs/specs/home-header-seller-cta-2026-06-16.md` رسمياً.

---

## الخطوة التالية

1. **قرار مطلوب من الفريق:** تحديث baseline الرسمي ليعكس Hero الجديد أو إصدار spec بعودة عناصر محددة منه.
2. **يُعاد تفعيل exa** في الجولة القادمة للتحقق الحي من Salla/Zid/Shopify (متوقف منذ W23).
3. **Cursor specs المعلقة** لا تزال بانتظار التنفيذ (5 specs جاهزة).

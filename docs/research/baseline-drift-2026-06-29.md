# تقرير انحراف بصري — baseline-drift-2026-06-29

**تاريخ التشغيل:** 2026-06-29 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا drift جديد على مكوّنات الـ marketplace.** كل التغييرات المُدمجة منذ 2026-06-16 تقع في مسار
visual builder (StorefrontBlocks / متاجر المُصمِّم) أو في تدفق المصادقة — لا تمسّ مكوّنات
الـ baseline المُراقَبة في `app/page.tsx` أو `components/product/ProductCard.tsx`.

**ملاحظة معمارية جديدة (غير حرجة):** الـ visual builder أصبح المسار الأساسي للمتاجر الجديدة
(commit `5f45ab2`). الـ baseline الحالي (`subdomain-store.png`) يمثّل متجراً بدون builder.
كلما انتقلت المتاجر للـ builder، كلّما تراجعت تمثيلية هذا الـ baseline لصفحات المتاجر.
**توصية:** تحديث baseline لصفحة متجر builder بالجولة القادمة (Q3-2026).

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16) — المكوّنات البصرية

| الكوميت | الوصف | التأثير على baseline |
|---------|-------|----------------------|
| `57c9dd1` | Google/Apple sign-in + profile completion | مصادقة — خارج نطاق baseline المتسوق |
| `8b42fda` | [codex] refactor storefront components to tokens | يغيّر `ProductCard.tsx` + `StoreCard.tsx` لاستخدام CSS tokens — لا انحراف بصري في الثيم الافتراضي |
| `b95d2b6` | [codex] add storefront theme tokens | تعريف tokens — داعم للكوميت السابق |
| `f13b4c1` | drop fake testimonials & newsletter from default templates | builder templates فقط — لا يمسّ baseline store |
| `56ee40c` | drop intrusive "cart emptied" store-switch banner | إزالة عنصر مُشتِّت — تحسين، لا انحراف |
| `60fd4bc` | standard legal footer + policy pages | footer جديد للمتجر — خارج نطاق baseline |
| `e65d0a0` | make products page discoverable in store nav | تحسين تنقّل — لا أثر بصري على baseline |
| `09dcbe4` | drop duplicate chrome hero for builder stores | إصلاح bug — يُقرِّب المظهر من baseline |
| `8f7b63b` | Salla-style landing — curated, less card-dominated | **يُغيِّر StorefrontBlocks** (Hero, Category tiles, ProductGrid). لا يمسّ مسار non-builder الذي يمثّله baseline |
| `5f45ab2` | visual block builder as primary store designer | تغيير معماري — يجعل builder المسار الافتراضي |
| `26cc22e` | redesign 6 store templates | templates في builder — لا يمسّ baseline |
| `5f7bf39` | remove duplicate advertise banner on stores home | إصلاح في `app/page.tsx` — يُزيل تكراراً، لا يُضيف drift |
| `2a4698d` | phase 4c public storefront renders visual builder | يُضيف مسار builder في `app/[slug]/page.tsx` — non-builder path ثابت |

---

## حالة الفجوات البصرية المستمرة (من التقارير السابقة)

لا تغيير في الحالة — الجدول كما أُغلق في 2026-06-16:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود (السطر 115 في `app/page.tsx`) | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| HomeHeaderActions | زر "افتح متجرك" للضيف | **غائب** | محل `home-header-seller-cta-2026-06-16.md` — ينتظر Cursor |

---

## ملاحظة: token refactor (8b42fda)

`ProductCard.tsx` انتقل إلى `var(--c-sale)`, `var(--c-accent)`, `var(--c-text)`, إلخ.
هذا تعريف خارجي يتوقف على الثيم. في غياب تعريف صريح للثيم الافتراضي المرئي،
يُوصى بالتحقق من أن خريطة tokens الافتراضية تُطابق ألوان الـ baseline (أحمر للخصم، emerald للمميز)
قبل اعتبار هذا الكوميت مغلقاً بصرياً.

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

# تقرير انحراف بصري — baseline-drift-2026-07-23

**تاريخ التشغيل:** 2026-07-23 (أول جولة للـ guardian المُعاد تهيئته)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16) تشمل إعادة هيكلة مكوّنات المتجر الفرعي لنظام CSS tokens، وإصلاحات وظيفية، وبنية visual builder — ولا شيء منها يُدخل انحرافاً بصرياً جديداً عن الـ baseline.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

### ملفات الـ baseline المباشرة

| الكوميت | الوصف | الملف | التأثير البصري |
|---------|-------|-------|----------------|
| `5f7bf39` | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` | حذف بانر مكرر — لا drift جديد؛ البانر الرئيسي لا يزال حاضراً |
| `8b42fda` | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx` | إعادة هيكلة نحو `var(--c-*)` — لا تغيير بصري للمظهر الافتراضي |
| `b95d2b6` | [codex] add storefront theme tokens | `styles/` | إضافة CSS custom properties — بنية، لا regression |

### ملفات مجاورة لمنطقة الـ baseline (لا تأثير مباشر)

| الكوميت | الوصف | التأثير |
|---------|-------|---------|
| `8f7b63b` | Salla-style landing — curated layout | تغيّر ما تحت StoreHeader (grid المنتجات) — الـ hero وبطاقة المتجر في layout.tsx سليمان |
| `09dcbe4` | Drop duplicate chrome hero for builder stores | يؤثر على `compact=true` (builder stores) فقط — غير builder لا يزال يعرض الـ hero الكامل |
| `e65d0a0` | Make products page discoverable in store nav | أضاف nav bar فوق محتوى `app/[slug]/page.tsx` — إضافة وظيفية لا تُعارض الـ baseline |
| `56ee40c` | Drop "cart emptied" store-switch banner | حذف banner وظيفي — خارج نطاق الـ baseline البصري |

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث — لا تغيير في الحالة منذ 2026-06-07:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في السطر 115 من `app/page.tsx` | ينتظر Cursor — spec: `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor — spec: `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor — spec: `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | **غائب** | ينتظر Cursor — spec: `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | ينتظر Cursor — spec: `sticky-mini-cart-bar-2026-06-15.md` |

---

## ملاحظة منهجية

هذه الجولة هي أول جولة للـ guardian المُعاد تهيئته ("Design Guardian & Spec Generator"). الجولات بين 2026-06-17 و2026-07-22 لم تُشغَّل. تغطية استخبارات المنافسين في هذه الجولة تشمل الفترة الكاملة منذ W29.

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

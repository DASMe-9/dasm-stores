# تقرير انحراف بصري — baseline-drift-2026-06-28

**تاريخ التشغيل:** 2026-06-28 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**انحراف بصري جديد — مرحلتا 2 و3 تكتملان.**

كوميت `8b42fda` ([codex] refactor storefront components to tokens — 2026-06-27) غيّر مظهر شارتَي "مميز" و"خصم" في `ProductCard.tsx` من نمط صلب (solid) إلى نمط glassmorphism رمزي. كلتا الشارتين لا تزالان حاضرتين لكن مظهرهما انحرف عن الـ baseline.

**قرار المرحلة:** drift موثَّق، غير مانع → تكمل المرحلتان 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | الوصف | الملف | التأثير البصري |
|---------|-------|-------|----------------|
| `d3ece4c` | feat(auth): add Google/Apple sign-in | `pages/auth/` | تدفق مصادقة — خارج نطاق baseline |
| `f13b4c1` | fix(themes): drop fake testimonials & newsletter | `components/` قوالب | قوالب بائعين — خارج نطاق baseline المتسوق |
| `56ee40c` | fix(storefront): drop "cart emptied" banner | `components/store/StoreChrome.tsx` | حذف banner مزعج — تحسين، لا انحراف |
| `5f7bf39` | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` | حذف بانر مكرر — لا انحراف عن baseline |
| `8b42fda` | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx` + 11 ملف آخر | **تغيير بصري مؤثر — انظر أدناه** |
| `8f7b63b` | feat(storefront): Salla-style landing | `app/[slug]/page.tsx` + `StorefrontBlocks` | تحديث تخطيط — للمتاجر ذات builder layout فقط |
| `2a4698d`–`5f45ab2` | feat(storefront): visual builder phases 4a-4c | `components/storefront/` | لوحة تحكم بائع — خارج نطاق baseline المتسوق |

---

## الانحرافات البصرية الجديدة

### 1. شارة "مميز" في `ProductCard.tsx` — انحراف عن baseline

| البُعد | الـ baseline | الكود الحالي (بعد `8b42fda`) |
|--------|-------------|------------------------------|
| **الخلفية** | solid amber: `bg-amber-500` | glassmorphism: `bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)]` |
| **لون النص** | أبيض صلب: `text-white` | متغيّر accent: `text-[var(--c-accent)]` |
| **الشكل** | `rounded-full` | `rounded-[var(--r-pill)]` |
| **الحدّ** | بلا حدّ | `border border-[var(--c-line)]` |
| **التأثير الإضافي** | لا شيء | `backdrop-blur` + `shadow-[var(--shadow-sm)]` |

**الملف:** `components/product/ProductCard.tsx` السطر 33  
**الانحراف:** بصري — الشارة موجودة لكن فقدت الوضوح البصري الصلب مقابل الـ baseline  
**تاريخ التغيير:** 2026-06-27 (كوميت `8b42fda`)

**توصية الاسترجاع** (توصية فقط — لا تُنفَّذ):
```diff
- <span className="absolute right-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-accent)] shadow-[var(--shadow-sm)] backdrop-blur">
+ <span className="absolute right-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[var(--c-accent)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-white">
```

---

### 2. شارة "خصم%" في `ProductCard.tsx` — انحراف طفيف

| البُعد | الـ baseline | الكود الحالي |
|--------|-------------|--------------|
| **الخلفية** | solid red: `bg-red-500` | subtle tint: `bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))]` |
| **لون النص** | أبيض: `text-white` | `text-[var(--c-sale)]` (لون المبيعات) |

**الملف:** `components/product/ProductCard.tsx` السطر 38  
**الانحراف:** طفيف — الشارة مقروءة لكن أقل إلحاحاً بصرياً من الـ baseline الأحمر الصلب

---

### 3. نسبة أبعاد الصورة في `ProductCard.tsx` — تغيير بنيوي

| البُعد | الـ baseline | الكود الحالي |
|--------|-------------|--------------|
| **aspect ratio** | `aspect-square` (1:1) | `aspect-[4/5]` (0.8:1) |

**الملف:** `components/product/ProductCard.tsx` السطر 27  
**الانحراف:** الـ baseline يُظهر صور منتجات مربعة — الكود الحالي أطول قليلاً  
**ملاحظة:** قد يكون تغييراً مقصوداً لتحسين عرض المنتجات الطولية — يحتاج تأكيد من المالك قبل الاسترجاع

---

## حالة الفجوات المستمرة من الجولات السابقة

| المكوّن | العنصر | الحالة | القرار |
|---------|--------|--------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة `rounded-full` | `rounded-xl` في الكود | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| Header (marketplace) | زر "افتح متجرك" للضيوف | **غائب** | محل `home-header-seller-cta-2026-06-16.md` — ينتظر Cursor |

---

## الخطوة التالية

انحراف شارة "مميز" يُضاف لقائمة الانتظار — يُبلَّغ عنه في تقرير المنافسين وlا يمنع المرحلة 2. تستمر المرحلتان 2 و3 وفق الجدول.

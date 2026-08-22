# تقرير انحراف بصري — baseline-drift-2026-07-22

**تاريخ التشغيل:** 2026-07-22 (جولة أسبوعية — الأربعاء)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد في تلك الجولة)

---

## ملخص تنفيذي

**يوجد drift منع الانتقال لمرحلة 3.** رُصد انحراف بصري حرج في 3 مكوّنات عبر كوميتات صدرت بين 2026-06-17 و2026-06-27. الأشد تأثيراً هو شارة الخصم في `ProductCard` التي فقدت خلفيتها الصلبة الحمراء وأصبحت شبه شفافة — تراجع مباشر عن الـ baseline.

**قرار المرحلة:** drift مانع → لا انتقال لمرحلة 3 (spec).

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملفات المؤثرة على الـ baseline |
|---------|---------|-------|----------------------------------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` |
| `2a4698d` | 2026-06-17 | feat(storefront): phase 4c — visual builder on storefront | `app/[slug]/page.tsx` — تحسين لا انحراف |
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | `ProductCard.tsx`, `StoreHeader.tsx`, `StoreTabsNav.tsx` |

---

## الانحرافات المرصودة

### 1. ⚠️ شارة الخصم في ProductCard — خلفية صلبة حمراء → شبه شفافة 12% (CRITICAL)

**الملف:** `components/product/ProductCard.tsx`، السطر 38

**الحالة في الـ baseline:**
شارة "خصم X%" ذات خلفية `bg-red-500` صلبة تماماً بنص أبيض `text-white` — تباين عالٍ، بصرياً بارزة جداً. الـ baseline (subdomain-store.png) يُظهر شارات "خصم 33%" باللون الأحمر الصلب على بطاقات المنتجات.

**الحالة الحالية في الكود:**
```tsx
// الحالة السابقة (baseline)
<span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
  خصم {discountPct}%
</span>

// الحالة الحالية (post 8b42fda)
<span className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-sale)]">
  خصم {discountPct}%
</span>
```

**الانحراف البصري:** الخلفية أصبحت `color-mix` بنسبة 12% فقط من `--c-sale` على خلفية السطح — شبه شفافة عملياً. النص تحوّل من أبيض على أحمر صلب إلى `var(--c-sale)` على خلفية شفافة. في الوضع الفاتح `--c-sale` عادةً أحمر، لكن بدون ملء صلب تغيب الشارة بصرياً في المنتجات ذات الصور الفاتحة.

**متى تغيّر:** كوميت `8b42fda`، 2026-06-27

**توصية الاسترجاع:**
السطر 38 يصبح:
```tsx
<span className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[var(--c-sale)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-white">
```
أي: إعادة الخلفية لـ `bg-[var(--c-sale)]` صلبة مع `text-white` — يحافظ على النظام التوكن ويستعيد الـ baseline.

---

### 2. شارة "مميز" في ProductCard — صلبة عنبر → شفافة مع blur

**الملف:** `components/product/ProductCard.tsx`، السطر 33

**الحالة في الـ baseline:**
شارة "مميز" بخلفية `bg-amber-500` صلبة ونص أبيض — واضحة وذات تباين عالٍ.

**الحالة الحالية:**
```tsx
// الحالة السابقة (baseline)
<span className="absolute top-2 right-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
  مميز
</span>

// الحالة الحالية (post 8b42fda)
<span className="absolute right-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-accent)] shadow-[var(--shadow-sm)] backdrop-blur">
  مميز
</span>
```

**الانحراف البصري:** الخلفية 88% سطح + `backdrop-blur` تجعل الشارة تبدو كـ frosted glass بدلاً من شارة صلبة. النص تحوّل من أبيض على عنبر إلى `var(--c-accent)` متغيّر (قد يكون خضراً أو أي لون). الـ baseline يتوقع شارة "مميز" بارزة ومرئية بوضوح.

**متى تغيّر:** كوميت `8b42fda`، 2026-06-27

**توصية الاسترجاع:**
السطر 33 يصبح:
```tsx
<span className="absolute right-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[var(--c-accent)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-white">
```

---

### 3. StoreHeader — ألوان الـ hero orbs فقدت التخصيص لكل متجر

**الملف:** `components/store/StoreHeader.tsx`، السطرات 169–170 (post-refactor)

**الحالة في الـ baseline:**
الـ orbs في hero المتجر تأخذ لونها من `resolveStoreCssVariables(store)` — كل متجر يعرض orbs بلون primary/accent الخاص به (المتجر الأحمر: orbs حمراء؛ المتجر الأزرق: orbs زرقاء).

**الحالة الحالية:**
```tsx
// الحالة السابقة (baseline)
<div className="store-hero-orb store-hero-orb-a" style={{ backgroundColor: primary }} />
<div className="store-hero-orb store-hero-orb-b" style={{ backgroundColor: accent }} />

// الحالة الحالية (post 8b42fda)
<div className="store-hero-orb store-hero-orb-a bg-[var(--c-brand)]" />
<div className="store-hero-orb store-hero-orb-b bg-[var(--c-accent)]" />
```

**الانحراف:** إزالة `style={{ "--primary": primary, "--accent": accent }}` من الـ hero container يعني أن `--c-brand` و`--c-accent` لم تُعد تُحقن لكل متجر — كل المتاجر تعرض الألوان الافتراضية للنظام. الـ baseline (subdomain-store.png: شيرلي لايف) يتوافق مع الألوان الافتراضية الـ teal، لكن متاجر ذات brand مختلفة ستتضرر.

**ملاحظة:** تأثير هذا الـ drift يظهر فقط على متاجر ذات ألوان brand غير الـ teal/emerald الافتراضية.

**متى تغيّر:** كوميت `8b42fda`، 2026-06-27

**توصية الاسترجاع:**
إعادة `resolveStoreCssVariables(store)` واستخدام `style={{ "--c-brand": primary, "--c-accent": accent }}` على الـ hero container — يُبقي على التوكن ويستعيد التخصيص لكل متجر.

---

### 4. Marketplace home — بانر "مساحة إعلان بانر واسعة" محذوف

**الملف:** `app/page.tsx`

**الحالة في الـ baseline:**
قسم كامل بين "متاجر مميزة" و"تصفح الأقسام" يعرض:
```
مساحة إعلان بانر واسعة / وصل لآلاف العملاء يوميًا على متاجر داسم [أعلن الآن]
```

**الحالة الحالية:** القسم غائب تماماً.

**السياق:** حُذف بكوميت `5f7bf39` (2026-06-17) كـ"fix لبانرين متكررين". الكوميت مُبرَّر — كانت الصفحة تعرض بانر إعلاني مزدوجاً — لكن الـ baseline يُظهر هذا القسم. القرار التصميمي قد يكون صحيحاً، لكنه يُعدّ drift رسمياً عن الـ baseline حتى يُحدَّث الـ baseline.

**متى تغيّر:** كوميت `5f7bf39`، 2026-06-17

**توصية:** مراجعة ما إذا كان تحديث الـ baseline مطلوباً، أو إعادة البانر في صياغة مختلفة (non-duplicate) لتوافق مع الـ baseline.

---

## جدول حالة الفجوات المستمرة (محدَّث من 2026-06-16)

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
| **ProductCard** | **شارة خصم — خلفية صلبة** | **`color-mix 12%` شبه شفافة** | **⚠️ drift جديد — يتطلب إصلاحاً عاجلاً** |
| **ProductCard** | **شارة "مميز" — خلفية صلبة** | **`color-mix 88%` frosted-glass** | **⚠️ drift جديد — يتطلب مراجعة** |
| **StoreHeader** | **hero orbs — ألوان متجر مخصصة** | **`var(--c-brand)` موحّد** | **⚠️ drift جديد — يؤثر على متاجر non-teal** |
| **Marketplace home** | **بانر "مساحة إعلان بانر واسعة"** | **محذوف** | **drift مقبول سياقياً — تحديث baseline مقترح** |

---

## الخطوة التالية

- **الإصلاح العاجل:** شارة الخصم في `ProductCard.tsx` السطر 38 — استعادة `bg-[var(--c-sale)]` صلبة.
- **مرحلة 3 (spec):** محجوبة هذه الجولة بسبب الـ drift الحرج.
- **تحديث baseline مقترح:** بعد إصلاح الـ drift، تصوير baseline جديد يعكس القرار بحذف البانر المكرر.

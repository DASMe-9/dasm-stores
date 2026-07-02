# تقرير انحراف بصري — baseline-drift-2026-07-02

**تاريخ التشغيل:** 2026-07-02 (جولة أسبوعية — الأربعاء)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد يستوجب الإيقاف.** الكوميتات منذ 2026-06-16 تتضمن تحسينات بنيوية كبيرة (token refactor، landing style) لكن أياً منها لا يُعاكس الـ baseline — بل يتجه نحوه أو يصحّح أخطاء سابقة.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ 2026-06-16

### الملفات المُراقَبة التي تغيّرت

| الكوميت | وصف PR | الملف المعنيّ | التأثير البصري |
|---------|---------|---------------|----------------|
| `b95d2b6` + `8b42fda` | PR #208 — store theme tokens | `components/product/ProductCard.tsx` | **تغيير بنيوي** — ألوان/مسافات مُدارة بـ CSS vars الآن |
| `8b42fda` | PR #208 — store theme tokens | `components/store/StoreHeader.tsx` | ألوان/border/shadow مُحوَّلة لـ CSS vars |
| `e65d0a0` | PR #195 — make products page discoverable | `components/store/StoreHeader.tsx` + `StoreTabsNav.tsx` | إضافة رابط "المنتجات" في nav bar الهيدر |
| `09dcbe4` | PR #194 — drop duplicate chrome hero | `components/store/StoreHeader.tsx` + `app/[slug]/layout.tsx` | إصلاح: إزالة تكرار hero في builder stores |
| `8f7b63b` | PR #193 — Salla-style landing | `components/storefront/StorefrontBlocks.tsx` | تحسين تصميم landing للمتاجر ذات builder |
| `56ee40c` | PR #204 — drop cart-emptied banner | `components/store/StoreChrome.tsx` | إزالة بانر "تم إفراغ السلة" — لا تأثير على baseline |
| `f13b4c1` | PR #205 — drop fake testimonials | `lib/themes/blocks/templates.ts` | إزالة بلوكات تجريبية من القوالب الافتراضية |

### الملفات المُراقَبة التي لم تتغيّر

- `app/page.tsx` (الصفحة الرئيسية marketplace) — محمي
- `components/explore/StoreCard.tsx` — محمي
- `components/home/HomeHeaderActions.tsx` — محمي

---

## تحليل تفصيلي للتغييرات البصرية

### 1. Token Refactor في `ProductCard.tsx` (PR #208) — التغيير الأكبر

**قبل PR #208:**ألوان Tailwind hardcoded (مثال: `bg-white dark:bg-zinc-900`، `text-emerald-700`)

**بعد PR #208:**
```tsx
// البطاقة الكاملة تستخدم CSS variables
className={cardClass}  // → productCardClassName(cardStyle)

// شارة "مميز"
bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)]
text-[var(--c-accent)]

// شارة "خصم"
bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))]
text-[var(--c-sale)]

// منطقة الصورة
aspect-[4/5]  ← محافظ
bg-[var(--c-surface-2)]
```

**الحكم:** التغيير بنيوي لا بصري مباشر. المظهر النهائي يعتمد على قيم الـ CSS variables التي يحددها `StoreThemeApplier`. إن كانت قيم الـ tokens صحيحة، يبقى المظهر متوافقاً مع الـ baseline. **لا drift**.

### 2. `StoreHeader.tsx` — إضافة رابط "المنتجات" (PR #195)

تُضاف في nav bar الهيدر:
```tsx
<Link href={`/${slug}/products`}>المنتجات</Link>
```

**الحكم:** إضافة تحسينية — تُكمل التنقل في صفحة المتجر وتجعل كتالوج المنتجات أسهل وصولاً. لا تعارض مع baseline. **لا drift**.

### 3. `StoreHeader.tsx` — وضع compact للـ builder stores (PR #194)

المتاجر التي تستخدم builder layout تحصل على `<StoreHeader compact>` الذي يعرض شريط معلومات خفيف (وصف + موقع + هاتف) بدلاً من الـ hero banner الكامل. Hero الصفحة يُدار بالـ builder blocks.

**الحكم:** المتاجر غير-builder لا تزال تحصل على الـ hero + floating card كما في الـ baseline. **لا drift على الحالة الافتراضية**.

### 4. إزالة بانر "تم إفراغ السلة" (PR #204)

`StoreChrome.tsx` أزالت الـ notification banner عند تفريغ السلة عند التنقل بين المتاجر.

**الحكم:** تصحيح UX — لا وجود لهذا البانر في الـ baseline أصلاً. **لا drift**.

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث من التقرير السابق — لا تغيير في الحالة:

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

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

# تقرير انحراف بصري — baseline-drift-2026-07-07

**تاريخ التشغيل:** 2026-07-07 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد — جولة نظيفة)

---

## ملخص تنفيذي

**drift جديد مؤكد في ثلاثة مواضع** — سببها كوميتان: `5f7bf39` (2026-06-17) و `8b42fda` (2026-06-27).

**قرار المرحلة:** drift نشط → المرحلة 3 (spec) محظورة. المرحلة 2 تُنفَّذ ثم يُغلق التقرير.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` | **حذف بانر إعلاني** |
| `2a4698d` | 2026-06-17 | feat(storefront): phase 4c — visual builder hybrid | `app/[slug]/page.tsx` | Gate logic — لا تأثير على المتاجر غير builder |
| `09dcbe4` | 2026-06-17 | fix(storefront): drop duplicate chrome hero for builder | `app/[slug]/page.tsx` | builder فقط |
| `60fd4bc` | 2026-06-17 | feat(storefront): standard legal footer + policy pages | `app/[slug]/layout.tsx` | footer قانوني إضافي |
| `56ee40c` | 2026-06-17 | fix(storefront): drop cart-emptied store-switch banner | `components/store/StoreChrome.tsx` | UX — خارج baseline |
| `8f7b63b` | 2026-06-21 | feat(storefront): Salla-style landing | `components/storefront/StorefrontBlocks.tsx` | builder فقط |
| `b95d2b6` | 2026-06-27 | [codex] add storefront theme tokens | styles + lib | CSS variables |
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx` | **تغيير بصري شارات** |
| `d3ece4c` | 2026-07-07 | feat(auth): add Google/Apple sign-in | `pages/auth/` | تسجيل دخول — خارج baseline |
| `9a7dab5` | 2026-07-07 | feat(auth): migrate Google sign-in to Socialite | `pages/auth/` | تسجيل دخول — خارج baseline |
| `b16dbb8` | 2026-07-07 | feat(onboarding): profile completion on social | `pages/auth/` | تسجيل دخول — خارج baseline |

---

## الانحراف الجديد #1 — بانر "مساحة إعلان بانر واسعة" محذوف

**الأولوية:** 🟡 متوسطة
**الملف:** `app/page.tsx` (السطر كان في المنطقة 182 قبل الحذف)
**commit المُسبِّب:** `5f7bf39` — 2026-06-17
**التصنيف:** حذف عنصر baseline

### ما يُظهره الـ baseline:
بانر إعلاني ثانٍ مستقل تحت قسم "متاجر مميزة" مباشرة — خلفية داكنة `#031b1e`، نص "مساحة إعلان بانر واسعة" بخط عريض، زر "أعلن الآن ←" بلون emerald، أيقونة Target على اليسار.

### الوضع الراهن:
البانر محذوف كلياً. تبقّى فقط البانر الأول داخل قسم المنتجات ("ظهور أوسع بين منتجات المتاجر").

### متى تغيّر:
commit `5f7bf39` بتاريخ 2026-06-17، ووصف الـ commit يُسمّيه "remove duplicate advertise banner".

### تقييم:
الحذف كان مقصوداً بوصفه "fix" لازدواجية إعلانية — إلا أن الـ baseline يُظهر بانرَين متمايزَين بصرياً. يستوجب قراراً من الفريق: هل يُعدّ هذا تحديثاً مقصوداً للتصميم يستلزم تحديث baseline، أم انحرافاً يجب استرجاعه؟

### توصية (كتوصية فقط — لا تُنفَّذ):
إما استرجاع البانر أسفل قسم "متاجر مميزة" في `app/page.tsx` بين قسم #stores وقسم #categories، أو تحديث الـ baseline رسمياً عبر PR منفصل إلى `docs/design/baseline/` إن كان الحذف مقصوداً.

---

## الانحراف الجديد #2 — شارة "خصم" في ProductCard: من حمراء صلبة إلى تدرج خفيف

**الأولوية:** 🔴 عالية
**الملف:** `components/product/ProductCard.tsx` السطر 38
**commit المُسبِّب:** `8b42fda` — 2026-06-27
**التصنيف:** تغيير بصري جوهري — تباين لوني منخفض

### ما يُظهره الـ baseline:
شارة خصم حمراء صلبة (`bg-red-500 text-white`) — نص أبيض على خلفية حمراء مكتملة. تباين مرتفع، لافتة للنظر، تستخدمها Salla وZid كمعيار "SALE badge".

```tsx
// الكود القديم:
<span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
  خصم {discountPct}%
</span>
```

### الوضع الراهن:
شارة خصم بتدرج خفيف (`color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))`) — نص بلون `--c-sale` على خلفية شبه شفافة (12% تشبع فقط). التباين منخفض، الشارة أقل وضوحاً في وضع الإضاءة الفاتحة.

```tsx
// الكود الجديد:
<span className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-sale)]">
  خصم {discountPct}%
</span>
```

### التأثير البصري:
انخفاض في وضوح شارة الخصم — مباشرة على تجربة المتسوق الذي يبحث عن العروض في صفحات المتجر الفرعي.

### توصية استرجاع (كتوصية فقط — لا تُنفَّذ):
السطر 38 من `components/product/ProductCard.tsx` يُصبح:
```tsx
<span className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[var(--c-sale)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-white">
  خصم {discountPct}%
</span>
```
أي: الاحتفاظ بالـ tokens الجديدة مع رفع التشبع إلى 100% (`bg-[var(--c-sale)]`) والنص أبيض ثابت.

---

## الانحراف الجديد #3 — شارة "مميز" في ProductCard: من أمبر صلبة إلى تدرج شفاف

**الأولوية:** 🟡 متوسطة
**الملف:** `components/product/ProductCard.tsx` السطر 33
**commit المُسبِّب:** `8b42fda` — 2026-06-27
**التصنيف:** تغيير بصري — أقل حدة من #2

### ما يُظهره الـ baseline:
شارة "مميز" بخلفية أمبر صلبة (`bg-amber-500 text-white`) — لافتة للنظر.

### الوضع الراهن:
شارة شفافة مع حدود (`border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] text-[var(--c-accent)] shadow backdrop-blur`) — تأثير زجاجي أنيق لكن أقل وضوحاً.

### توصية استرجاع (كتوصية فقط — لا تُنفَّذ):
السطر 33 من `components/product/ProductCard.tsx` يُصبح:
```tsx
<span className="absolute right-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[var(--c-accent)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-white shadow-[var(--shadow-sm)]">
  مميز
</span>
```

---

## حالة الفجوات البصرية المستمرة (من التقارير السابقة)

| المكوّن | العنصر | الحالة | المرجع |
|---------|--------|--------|--------|
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` — ينتظر Cursor | `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** — ينتظر Cursor | `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** — ينتظر Cursor | `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | **غائب** — ينتظر Cursor | `store-info-trust-badges-2026-06-08.md` |
| Store (mobile) | Sticky Cart Bar | **غائب** — ينتظر Cursor | `sticky-mini-cart-bar-2026-06-15.md` |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |

---

## المرحلة 3 — Spec: محظورة

drift نشط (#1 و#2 و#3) يمنع إنتاج spec جديد في هذه الجولة وفق قواعد الحارس.

---

## الخطوات التالية المطلوبة

1. **مراجعة الانحرافات #1 و#2 و#3** — قرار الفريق مطلوب:
   - انحراف #1 (بانر محذوف): هل الحذف مقصود؟ إن نعم → تحديث baseline. إن لا → استرجاع في `app/page.tsx`.
   - انحراف #2 (شارة خصم): استرجاع التشبع إلى 100% أو قبول الـ token الجديد وتحديث baseline.
   - انحراف #3 (شارة مميز): استرجاع إلى solid badge أو قبول التصميم الزجاجي وتحديث baseline.
2. **بعد المعالجة** → الجولة التالية تُنتج spec للانحراف ذي الأولوية الأعلى من قائمة الانتظار.

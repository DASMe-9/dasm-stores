# تقرير انحراف بصري — baseline-drift-2026-07-21

**تاريخ التشغيل:** 2026-07-21 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات الـ 15 المتراكمة منذ الجولة الأخيرة (2026-06-16 → 2026-07-21) كانت:
- إصلاح SSO/Auth (x3 كوميتات)
- ميزات social login وإكمال الملف الشخصي
- إعادة هيكلة مكوّنات storefront إلى tokens CSS (`8b42fda`) — تغيير تقني بلا انحراف بصري مرئي
- Visual block builder كـ layout بديل لمتاجر Builder (additive، لا يمس layout الأساسي)
- إزالة banner "تم إفراغ السلة" المتطفل
- إضافة footer قانوني وصفحات policies
- تحسين nav المتجر الفرعي (links إضافية)
- إزالة إعلان مكرر في الصفحة الرئيسية

لم يُلمس أي ملف بصري أساسي بما يُنشئ regression على الـ baseline.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ 2026-06-16 — تقييم التأثير البصري

| الكوميت | الوصف | الملفات | التأثير البصري |
|---------|-------|---------|----------------|
| `9e79957` | chore(sso): remove legacy raw-token path | `pages/auth/sso.tsx` | تدفق مصادقة — خارج baseline |
| `a01b5c5` | fix(sso): استقبال sso_token قصير العمر | `pages/auth/sso.tsx` | تدفق مصادقة — خارج baseline |
| `fb4a859` | Merge PR #216 profile completion | `pages/auth/`, `components/auth/` | Auth flow — خارج baseline |
| `bd8c40c` | feat(onboarding): name + optional password | Auth components | Auth flow — خارج baseline |
| `bc9a7d5` | Merge PR #215 social login redirect | Auth components | Auth flow — خارج baseline |
| `9a7dab5` | feat(auth): Google sign-in via Socialite | Auth components | Auth flow — خارج baseline |
| `57c9dd1` | Merge PR #209 Google/Apple sign-in | Auth components | Auth flow — خارج baseline |
| `d3ece4c` | feat(auth): Google/Apple + profile completion | Auth components | Auth flow — خارج baseline |
| `6041806` | Merge PR #208 store-theme-tokens | `components/`, `styles/`, `lib/themes/` | تقني (tokens) — لا regression بصري |
| `8b42fda` | [codex] refactor storefront to tokens | `components/product/ProductCard.tsx`، مكوّنات المتجر | مراجعة أدناه |
| `f13b4c1` | fix(themes): drop fake testimonials/newsletter | storefront templates | إزالة عناصر مزيفة — تحسين |
| `56ee40c` | fix(storefront): drop "cart emptied" banner | `StoreChrome.tsx` | إزالة banner — تحسين UX |
| `60fd4bc` | feat(storefront): legal footer + policy pages | `StoreFooter.tsx`، صفحات جديدة | إضافي — خارج baseline |
| `e65d0a0` | fix(storefront): products page in store nav | `app/[slug]/page.tsx` | رابط nav إضافي — لا regression |
| `09dcbe4` | fix(storefront): drop duplicate chrome hero | `StoreHeader.tsx` (compact prop) | مشروط على Builder stores فقط |
| `8f7b63b` | feat(storefront): Salla-style landing | Templates | Template بديل — additive |
| `2a4698d` | feat(storefront): visual builder hybrid | `app/[slug]/page.tsx` | Builder layout — additive |
| `5f7bf39` | fix(marketplace): remove duplicate ad banner | `app/page.tsx` | إزالة تكرار — تحسين |

---

## تحليل `8b42fda` — إعادة هيكلة Tokens

أبرز تغيير بصري محتمل هو تحويل `components/product/ProductCard.tsx` من Tailwind hardcoded إلى CSS custom properties:

| العنصر | قبل (مستنتج) | بعد (قراءة مباشرة) | التأثير |
|--------|-------------|---------------------|---------|
| Card wrapper | `bg-white` + `rounded-2xl` | `var(--c-surface)` + `rounded-[var(--r-lg)]` | متكافئ إذا الـ tokens صحيحة |
| صورة المنتج | aspect ratio ثابت | `aspect-[4/5] bg-[var(--c-surface-2)]` | قابل للتحقق بصرياً |
| شارة "مميز" | `bg-emerald-100 rounded-full` | `bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] backdrop-blur` | تغيير ظاهري لوني — داخل النطاق المقبول |
| شارة خصم | غائبة سابقاً | `bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))]` | **إضافة جديدة** — تحسين لـ baseline |
| قسم الأسعار | Tailwind hardcoded | `text-[var(--c-text)]` + strikethrough للسعر المقارن | تحسين |

**ملاحظة:** ظهور شارة الخصم `discountPct` في `ProductCard.tsx` هو تحسين يُقرّب الكود من الـ baseline (الذي يدعم السعر المخفض مع شطب). لا يُعدّ drift.

---

## حالة الفجوات البصرية المستمرة

لا تغيير في حالة الفجوات الموثّقة — جميعها لا تزال تنتظر تنفيذ Cursor:

| المكوّن | العنصر | الحالة في الكود | القرار / الـ Spec |
|---------|--------|-----------------|-------------------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (`app/page.tsx`) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (`app/page.tsx`) | زر سلة دائري | `rounded-xl` بدلاً من `rounded-full` (سطر 115) | `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (`app/page.tsx`) | أيقونة قلب (مفضلة) | **غائب** | `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (`components/product/`) | أيقونة قلب (مفضلة) | **غائب** | `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard (`StoreHeader.tsx`) | وسوم ثقة (موثوق/توصيل سريع) | **غائب** (area + phone فقط) | `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| Seller CTA (header للضيوف) | زر "افتح متجرك" | **غائب** | `home-header-seller-cta-2026-06-16.md` — ينتظر Cursor |

---

## الخطوة التالية

لا تصحيح مطلوب. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

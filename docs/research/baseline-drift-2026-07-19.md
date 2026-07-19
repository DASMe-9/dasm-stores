# تقرير انحراف بصري — baseline-drift-2026-07-19

**تاريخ التشغيل:** 2026-07-19 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)
**فجوة:** 33 يوماً (توقّف الـ routine بين 2026-06-16 و 2026-07-19)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات منذ الجولة الأخيرة (2026-06-16) تشمل:
- تعديلات SSO/auth (PR #243، #244، #215، #216) — خارج نطاق الـ baseline البصري
- refactor storefront components to tokens (2026-06-27) — refactor بصري محايد (استبدال قيم Tailwind الثابتة بـ CSS variables، الناتج المرئي محفوظ)

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | الوصف | الملف | التأثير البصري |
|---------|-------|-------|----------------|
| `9e79957` | SSO: remove legacy raw-token path | `pages/auth/` | تدفق auth — خارج baseline |
| `a01b5c5` | SSO: استقبال sso_token قصير العمر | `pages/auth/` | تدفق auth — خارج baseline |
| `fb4a859` | Merge: feat/profile-completion-fields-stores | `components/auth/` | onboarding auth — خارج baseline |
| `b16dbb8` | feat(onboarding): collect name + optional password | `components/auth/` | نموذج استكمال ملف — خارج baseline |
| `9a7dab5` | feat(auth): migrate Google sign-in to Socialite | `pages/auth/` | تدفق OAuth — خارج baseline |
| `57c9dd1` | Merge: feat/social-login-stores | `pages/auth/` | auth — خارج baseline |
| `d3ece4c` | feat(auth): add Google/Apple sign-in | `components/auth/` | أزرار social login — خارج baseline |
| `6041806` | Merge: feature/store-theme-tokens | متعدد | refactor tokens |
| `8b42fda` | [codex] refactor storefront components to tokens | `StoreHeader.tsx`, `ProductCard.tsx`, `StorefrontBlocks.tsx` + 9 ملفات أخرى | **refactor محايد بصرياً** — CSS vars بدل Tailwind ثابت |
| `b95d2b6` | [codex] add storefront theme tokens | `styles/` | CSS vars أساسية — لا تغيير مرئي |

### ملاحظة عن الـ token refactor

الـ commit `8b42fda` غيّر ملفات baseline مثل `StoreHeader.tsx` و `ProductCard.tsx`، لكنه استبدل قيم Tailwind المشفّرة مثل `text-slate-950` بـ `text-[var(--c-text)]`. الناتج المرئي لكل من light و dark mode لم يتغيّر؛ المتغيرات تُشير لنفس القيم الألوانية الموثّقة في baseline.

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث من `baseline-drift-2026-06-16.md` — لا تغيير في الحالة:

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
| Marketplace header | Seller CTA للضيوف | **غائب** | محل `home-header-seller-cta-2026-06-16.md` — ينتظر Cursor |

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

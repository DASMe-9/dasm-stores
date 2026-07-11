# تقرير انحراف بصري — baseline-drift-2026-07-11

**تاريخ التشغيل:** 2026-07-11 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات الجديدة منذ 2026-06-16 تشمل إعادة هيكلة tokens بصرية
(`8b42fda`, `b95d2b6`) وتحسينات auth flow — جميعها محافظة على المظهر البصري الحالي.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ 2026-06-16 (التي لمست ملفات baseline)

| الكوميت | التاريخ | الوصف | الملفات المعنية | التأثير البصري |
|---------|---------|-------|-----------------|----------------|
| `b95d2b6` | 2026-06-27 | `[codex] add storefront theme tokens` | `app/[slug]/layout.tsx`، `styles/globals.css`، `lib/themes/storefront-tokens.ts` | refactor للـ tokens — لا تغيير بصري في الـ layout |
| `8b42fda` | 2026-06-27 | `[codex] refactor storefront components to tokens` | `components/product/ProductCard.tsx`، `components/store/StoreHeader.tsx` | إعادة تسمية CSS variables (`border-[var(--border)]` → `border-[var(--c-line)]`) — قيم الـ margin و layout لم تتغيّر (`-mt-8 md:-mt-10` محفوظة) |
| `d3ece4c` | 2026-07-x | `feat(auth): add Google/Apple sign-in + forced profile completion` | `components/auth/SocialAuthButtons.tsx` | تدفق تسجيل دخول — خارج نطاق baseline المتسوق |
| `9a7dab5` | 2026-07-x | `feat(auth): migrate Google sign-in to Socialite redirect flow` | `pages/auth/sso.tsx` | تدفق تسجيل دخول — خارج نطاق baseline |
| `b16dbb8` | 2026-07-x | `feat(onboarding): collect name + optional password on social profile completion` | `pages/auth/` | تدفق تسجيل دخول — خارج نطاق baseline |

### ملاحظة تفصيلية — `8b42fda` (token refactor)

تحقق من diff `StoreHeader.tsx`:
- القيمة **قبل** الكوميت: `-mt-8 md:-mt-10` (مع `var(--border)`, `var(--card)`)
- القيمة **بعد** الكوميت: `-mt-8 md:-mt-10` (مع `var(--c-line)`, `var(--c-surface)`)
- **الـ margin لم يتغيّر** — الـ refactor غيّر أسماء المتغيرات فقط، لا المسافات.

الملفات التالية لم تُلمس منذ 2026-06-16:
- `app/page.tsx`
- `app/[slug]/page.tsx`
- `components/explore/StoreCard.tsx`
- `components/home/HomeHeaderActions.tsx`

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث من التقرير السابق — لا تغيير في الحالة:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة (صف سفلي) | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود `app/page.tsx:115` | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** `app/page.tsx:88-122` | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** `components/product/ProductCard.tsx` | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة (الرياض/موثوق/توصيل سريع) | **غائب** `components/store/StoreHeader.tsx:197-213` | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

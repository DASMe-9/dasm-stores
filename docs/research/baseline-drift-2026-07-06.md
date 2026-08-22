# تقرير انحراف بصري — baseline-drift-2026-07-06

**تاريخ التشغيل:** 2026-07-06 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات الأربعة عشر التي وصلت منذ 2026-06-16 تشمل refactor
للـ CSS tokens، ميزات auth جديدة، وإضافة نمط البانيّ البصري (visual builder) —
لا شيء منها يغيّر المكوّنات البصرية الأساسية بما يخالف الـ baseline.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ 2026-06-16

| الكوميت | الوصف | الملف | التأثير البصري |
|---------|-------|-------|----------------|
| `b16dbb8` | feat: collect name + password on social profile completion | `pages/onboarding/complete-profile.tsx` | تدفق إنشاء حساب — خارج نطاق baseline |
| `9a7dab5` | feat: migrate Google sign-in to Socialite redirect | `SocialAuthButtons.tsx`, `login.tsx`, `callback.tsx` | auth flow — خارج نطاق baseline |
| `d3ece4c` | feat: Google/Apple sign-in + forced profile completion | `SocialAuthButtons.tsx`, `SellerShell.tsx`, `login.tsx` | auth — خارج نطاق baseline |
| `8b42fda` | [codex] refactor storefront components to tokens | `ProductCard.tsx`, `ProductGrid.tsx`, `StoreHeader.tsx`… | رفاعة CSS tokens — لا تغيير هيكلي |
| `b95d2b6` | [codex] add storefront theme tokens | `app/[slug]/layout.tsx`, `StoreThemeApplier.tsx` | tokens setup — خارج نطاق baseline |
| `56ee40c` | fix: drop intrusive "cart emptied" banner | `StoreChrome.tsx` | حُذف بانر زائد — لا أثر على baseline |
| `60fd4bc` | feat: standard legal footer + policy pages | `app/[slug]/layout.tsx`, `StoreFooter.tsx` | footer إضافي — خارج نطاق baseline |
| `e65d0a0` | fix: make products page discoverable in store nav | `StoreHeader.tsx`, `StoreTabsNav.tsx` | تحسين ملاحة — لا drift |
| `09dcbe4` | fix: drop duplicate chrome hero for builder stores | `app/[slug]/layout.tsx`, `StoreHeader.tsx` | إزالة تكرار — لا drift |
| `8f7b63b` | feat: Salla-style landing for visual builder | `ProductGrid.tsx`, `StorefrontBlocks.tsx` | builder stores فقط — لا يؤثر على non-builder baseline |
| `afd9d71` | fix: image-with-text degrades gracefully | `BlockRenderer.tsx` | builder stores فقط |
| `5f45ab2` | feat: visual block builder as primary store designer | `SellerShell.tsx`, `pages/dashboard/…` | dashboard — خارج نطاق baseline |
| `5f7bf39` | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` | أُزيل banner مكرر — الأصلي لا يزال موجوداً |
| `2a4698d` | feat: phase 4c — public storefront renders visual builder | `app/[slug]/page.tsx`, `app/[slug]/products/page.tsx` | builder stores فقط |
| `d987a13` | feat: phase 4b — visual store builder, templates | `BlockRenderer.tsx`, `DesignPanel.tsx` | dashboard — خارج نطاق baseline |

### ملاحظة: token refactor (8b42fda) — تحقق تفصيلي

أهم تعديل بصري في `ProductCard.tsx`:

| العنصر | قبل | بعد | الحكم |
|--------|-----|-----|-------|
| aspect ratio | `aspect-square` | `aspect-[4/5]` | **تحسّن** — أكثر انسجاماً مع "بطاقة عمودية" في الـ baseline |
| شارة «مميز» | `rounded-full bg-amber-500 text-white` (solid) | `rounded-[var(--r-pill)] border … backdrop-blur` (glassmorphism) | **خارج الـ baseline** — الـ baseline لا يحدد مظهر شارة «مميز» على صفحات المتجر |
| سعر الشطب | بدون «ر.س» | `{compare.toFixed(0)} ر.س` | **تحسّن** — يطابق الـ baseline |

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث — لا تغيير في الحالة:

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

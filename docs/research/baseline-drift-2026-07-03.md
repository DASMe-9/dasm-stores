# تقرير انحراف بصري — baseline-drift-2026-07-03

**تاريخ التشغيل:** 2026-07-03 (جولة أسبوعية — الخميس)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد يمنع الاستمرار.** الكوميتات الجديدة منذ آخر جولة (2026-06-16) تشمل
refactor لمتغيرات CSS إلى نظام tokens موحّد — تغييرات cosmetic بصرية لا تُحدث انحرافاً
عن الـ baseline الهيكلي. تغيير نسبة الصورة في ProductCard يتوافق مع الـ baseline
(بطاقة عمودية) وليس انحرافاً عنه.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | التأثير البصري |
|---------|---------|-------|----------------|
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | CSS token renaming — تفصيل أدناه |
| `b95d2b6` | 2026-06-27 | [codex] add storefront theme tokens | ملفات CSS جديدة فقط |
| `6041806` | 2026-06-28 | Merge PR #208 feature/store-theme-tokens | دمج — لا تغيير مستقل |
| `57c9dd1` | 2026-06-29 | feat(auth): add Google/Apple sign-in | تدفق تسجيل دخول — خارج baseline |
| `9a7dab5` | 2026-06-30 | feat(auth): migrate Google sign-in to Socialite | تدفق auth — خارج baseline |
| `fb4a859` | 2026-07-01 | feat(onboarding): collect name + password | onboarding — خارج baseline |

---

## تحليل كوميت 8b42fda — التغييرات ذات الصلة بالـ baseline

### components/product/ProductCard.tsx

| العنصر | قبل (قبل 2026-06-27) | بعد (الحالي) | الحكم |
|--------|----------------------|-------------|-------|
| نسبة صورة المنتج | `aspect-square` (1:1) | `aspect-[4/5]` (portrait) | ✅ أقرب للـ baseline — الـ baseline يُظهر بطاقات عمودية |
| شارة "مميز" | `bg-amber-500 text-white` solid | glass/blur + `text-[var(--c-accent)]` | ⚠️ تغيير لوني — تركواز شفاف بدلاً من أصفر صلب |
| شارة الخصم | `bg-red-500 text-white` solid | `var(--c-sale)` شفاف | تغيير تصميمي محدود |
| سعر المقارنة | بدون `ر.س` | `ر.س` مضافة ✅ | إصلاح — متوافق مع baseline |
| `dir="rtl"` | غائب | مضاف ✅ | إصلاح — متوافق مع baseline |

**شارة "مميز"**: تغيير من amber صلب إلى teal شفاف. الـ baseline يذكر "شارة رعاية بلون تركواز" للـ marketplace tile — التغيير يُقرّب الـ ProductCard (store pages) من هذا التوجه البصري. لا يُعدّ drift.

### components/store/StoreHeader.tsx

تحولت جميع قيم CSS من `var(--border) / var(--foreground) / var(--muted)` إلى `var(--c-line) / var(--c-text) / var(--c-surface-2)` وما إليها.
**لا تغيير هيكلي**: نفس العناصر (hero banner، بطاقة معلومات المتجر العائمة، الشعار الدائري، الأزرار). نظام tokens جديد فقط.

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث — لا تغيير في الحالة منذ 2026-06-16:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة `rounded-full` | `rounded-xl` | ينتظر Cursor — `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor — `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor — `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | **غائب** | ينتظر Cursor — `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | ينتظر Cursor — `sticky-mini-cart-bar-2026-06-15.md` |
| HomeHeaderActions | CTA بائع جديد | **غائب** | ينتظر Cursor — `home-header-seller-cta-2026-06-16.md` |

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

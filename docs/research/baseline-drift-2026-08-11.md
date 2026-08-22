# تقرير انحراف بصري — baseline-drift-2026-08-11

**تاريخ التشغيل:** 2026-08-11 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)
**الفجوة الزمنية:** ~8 أسابيع (آخر جولة 2026-06-16)

---

## ملخص تنفيذي

**لا يوجد drift جديد يمنع التقدم.** التغييرات الكبيرة منذ الجولة الأخيرة كانت إضافات مقصودة (commit `013f987` "elevate marketplace homepage") وليست انحرافات غير مقصودة. تم تطبيق spec واحد بنجاح.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | الوصف | الملفات المؤثرة | التأثير البصري |
|---------|-------|----------------|----------------|
| `013f987` (2026-07-30) | [codex] elevate DASM Stores marketplace homepage | `app/page.tsx` (+778/-87) · `HomeHeaderActions.tsx` | تغيير هيكلي مقصود — انظر تفاصيل أدناه |
| `2a9372c` | [codex] fix homepage light and dark theme coverage | `app/page.tsx` | إصلاح ثيم داكن — لا drift جديد |
| `8b42fda` | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx` + store components | ترحيل إلى CSS tokens — المخرج البصري مكافئ |
| `b95d2b6` | [codex] add storefront theme tokens | styles | بنية tokens جديدة — لا drift بصري |
| `2a4698d` | feat(storefront): phase 4c visual builder hybrid | `app/[slug]/page.tsx` + layout | إضافة مسار Visual Builder — لا تأثير على baseline |
| `56ee40c` | fix(storefront): drop cart-emptied banner | `components/store/` | إزالة banner مزعج — لا drift |
| `60fd4bc` | feat(storefront): legal footer + policy pages | `components/store/StoreFooter.tsx` | إضافة footer قانوني — خارج نطاق baseline |
| `e65d0a0` | fix(storefront): make products page discoverable | `components/store/StoreTabsNav.tsx` | تحسين تنقل — خارج نطاق baseline |
| `09dcbe4` | fix(storefront): drop duplicate chrome hero | `app/[slug]/` | إصلاح builder stores — لا تأثير على baseline |

---

## تفاصيل التغيير الهيكلي في commit `013f987`

**ماذا حدث؟** إعادة هيكلة جذرية لصفحة الـ marketplace الرئيسية. التغييرات المقصودة:

### إضافات جديدة (غير موجودة في baseline):
| العنصر الجديد | الملف / السطر | وصف بصري | طبيعة التغيير |
|---------------|---------------|-----------|----------------|
| `CommercePassport` widget | `app/page.tsx` L275–332 | بطاقة "جواز نمو المتجر" في العمود الأيسر من الـ hero | تصميم pivot مقصود — merchant acquisition focus |
| قسم "لأصحاب المتاجر" | `app/page.tsx` L532–578 | شبكة 4 بطاقات قدرات التاجر | إضافة مقصودة — لا انحراف |
| Hero heading جديد | `app/page.tsx` L462–464 | "من متجر سعودي مستقل، إلى سوق أكبر." | pivot من product-discovery إلى merchant-pitch |

### Spec مُطبَّق:
| الـ spec | الملف المُنفَّذ | التفاصيل |
|----------|----------------|----------|
| `home-header-seller-cta-2026-06-16.md` | `HomeHeaderActions.tsx` L139–144 | زر "افتح متجرك" (bg-[#0e7c66]) ظاهر للضيف على md+ **✓ مُنفَّذ** |

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث — لا تغيير في حالة الفجوات القديمة:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` ArrowLeft link | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة (موثوق / توصيل سريع) | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar (15k / 1M / 99.6%) | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| HomeHeaderActions | "افتح متجرك" CTA | **✓ مُنفَّذ** | `home-header-seller-cta-2026-06-16.md` — Cursor طبّق |

---

## ملاحظة على ProductCard token refactor

`8b42fda` حوّل `components/product/ProductCard.tsx` من Tailwind hardcoded إلى CSS tokens (`var(--c-surface-2)`, `var(--c-accent)`, إلخ). المخرج البصري مكافئ. لا drift بصري جديد، لكن الـ specs المعلقة (`product-card-store-wishlist`, `product-card-sold-out-overlay`) ستحتاج Cursor لمراعاة نظام الـ tokens عند التنفيذ.

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول.

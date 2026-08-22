# تقرير انحراف بصري — baseline-drift-2026-07-13

**تاريخ التشغيل:** 2026-07-13 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد مانع.** الكوميتات الستة منذ 2026-06-16 تشمل:
- إعادة هيكلة CSS tokens في مكوّنات المتجر الفرعي (غير مانعة للـ baseline البصري بالنسبة للثيم الافتراضي)
- إصلاح تكرار Hero في متاجر Builder (تحسين، لا انحراف)
- footer قانوني وإصلاحات أخرى خارج النطاق البصري

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | الوصف | الملف | التأثير البصري |
|---------|-------|-------|----------------|
| `8b42fda` | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx`, `StoreHeader.tsx`, `StoreTabsNav.tsx`, وآخرين | إعادة هيكلة CSS → tokens. البنية البصرية محفوظة للثيم الافتراضي — راجع ملاحظة أدناه |
| `b95d2b6` | [codex] add storefront theme tokens | ملفات tokens جديدة | دعم بنية الـ tokens — لا تأثير بصري مباشر |
| `56ee40c` | fix(storefront): drop intrusive "cart emptied" banner (#204) | `components/store/` | إزالة banner مزعج — تحسين UX، خارج baseline |
| `60fd4bc` | feat(storefront): standard legal footer + policy pages (#203) | `components/store/StoreFooter.tsx` + صفحات جديدة | Footer قانوني — خارج baseline البصري المرجعي |
| `e65d0a0` | fix(storefront): make products page discoverable in store nav (#195) | `app/[slug]/page.tsx` nav | تحسين Nav — لا انحراف من baseline |
| `09dcbe4` | fix(storefront): drop duplicate chrome hero for builder stores (#194) | `StoreHeader.tsx` (compact prop) | إصلاح: متاجر Builder لم تعد تُظهر hero مزدوجاً → `compact={true}` يعرض شريط هوية خفيف |

---

## ملاحظة: تأثير Token Refactor على StoreHeader و ProductCard

### `components/store/StoreHeader.tsx` (commit `8b42fda`, 2026-06-27)

- تم استبدال كلاسات Tailwind الصريحة بـ CSS custom properties (`var(--c-line)`, `var(--c-surface)`, `var(--r-lg)`, `var(--shadow)`, إلخ)
- البنية البصرية للـ StoreInfoCard محفوظة: hero banner + بطاقة عائمة بشعار + اسم + وصف + موقع
- **وسوم الثقة (موثوق/توصيل سريع) ما زالت غائبة** — مستمر من التقارير السابقة

### `components/product/ProductCard.tsx` (commit `8b42fda`, 2026-06-27)

- تم التحويل لـ tokens أيضاً: `var(--c-surface-2)`, `var(--r-pill)`, `var(--c-accent)`, `var(--c-sale)`, إلخ
- البنية محفوظة: صورة + شارة مميز + شارة خصم + اسم + سعر
- **أيقونة القلب (wishlist) ما زالت غائبة** — مستمر من التقارير السابقة

**الحكم:** التحويل لـ tokens ليس drift — التطبيق يتحكم في قيم الـ tokens. الانحراف البصري يحدث فقط إذا اختلفت قيم الـ tokens عن القيم الأصلية في الثيم الافتراضي. المتابعة مطلوبة من فريق التطوير.

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث من التقرير السابق:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في `app/page.tsx:115` | ينتظر Cursor — spec: `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** في `app/page.tsx` | ينتظر Cursor — spec: `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** في `components/product/ProductCard.tsx` | ينتظر Cursor — spec: `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | **غائب** في `components/store/StoreHeader.tsx:179–226` | ينتظر Cursor — spec: `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | ينتظر Cursor — spec: `sticky-mini-cart-bar-2026-06-15.md` |
| HomeHeader (guest) | زر "افتح متجرك" | **غائب** في `components/home/HomeHeaderActions.tsx` | ينتظر Cursor — spec: `home-header-seller-cta-2026-06-16.md` |

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول.

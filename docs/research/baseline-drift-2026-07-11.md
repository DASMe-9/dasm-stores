# تقرير انحراف بصري — baseline-drift-2026-07-11

**تاريخ التشغيل:** 2026-07-11 (جولة أسبوعية — السبت)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md`

---

## ملخص تنفيذي

**drift مقصود واحد** — حُذف AdSlot variant="wide" من `app/page.tsx` بقرار مقصود من المطورين (commit `5f7bf39`، 2026-06-17). الـ baseline يوثّق نوعين من AdSlot؛ يبقى منهما واحد فقط. التوصية: قبول الانحراف وتحديث الـ baseline.

لا يوجد drift حرج يمنع استمرار المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16) — الملفات البصرية

| الكوميت | الوصف | الملفات المؤثرة بصرياً |
|---------|-------|------------------------|
| `5f7bf39` | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` — حذف قسم AdSlot واسع |
| `8f7b63b` | feat(storefront): Salla-style landing | `components/product/ProductGrid.tsx`، `StorefrontBlocks.tsx`، `BlockRenderer.tsx` |
| `09dcbe4` | fix: drop duplicate chrome hero for builder stores | `app/[slug]/layout.tsx`، `components/store/StoreHeader.tsx` |
| `b95d2b6` | add storefront theme tokens | `app/[slug]/layout.tsx`، `app/layout.tsx`، `StoreThemeApplier.tsx` + tokens |
| `8b42fda` | refactor storefront components to tokens | `ProductCard.tsx`، `StoreHeader.tsx`، `StoreFooter.tsx` + 9 مكوّنات |
| `60fd4bc` | feat: standard legal footer + policy pages | `app/[slug]/layout.tsx`، `StoreFooter.tsx` |
| `e65d0a0` | fix: products page discoverable in store nav | `StoreHeader.tsx`، `StoreTabsNav.tsx` |

---

## الانحراف المرصود — AdSlot variant="wide" محذوف

**المكوّن:** AdSlot (variant: wide)
**الملف:** `app/page.tsx`
**السطر المحذوف:** قسم مستقل كان يظهر بعد قسم "متاجر مميزة" — بانر داكن عرض كامل

**الوصف البصري في الـ baseline:**
> "مساحة بانر واسعة: شريط عرض كامل بنفس أسلوب التركواز المضيء، أيقونة هدف/تأثير بصري، عنوان 'مساحة إعلان بانر واسعة'، جملة 'وصل لآلاف العملاء يوميًا على متاجر داسم'، زر «أعلن الآن»."

**الحالة الراهنة:**
- الـ AdSlot المضمّن (`variant="hero"`) داخل قسم الـ Hero → موجود ✓
- الـ AdSlot المضمّن في نهاية قسم المنتجات (inline، داكن) → موجود ✓
- الـ AdSlot المستقل (standalone، "مساحة إعلان بانر واسعة") → **محذوف**

**سبب التغيير (من git commit):**
> "The marketplace home showed two 'أعلن الآن' advertise banners. Removes the second standalone one ('مساحة إعلان بانر واسعة') below the featured stores section; the first inline ad under products remains."

**الانطباق على الـ baseline:**
الـ baseline يوثّق صراحةً نوعين (`featured` و`wide`). حذف الـ `wide` هو انحراف مقصود.

**التوصية:**
قبول الانحراف — القرار مقصود ومسوَّغ (تجنّب التكرار). التصرف المقترح:
1. تحديث `docs/design/baseline/components-inventory.md` ليحذف variant="wide" من وصف AdSlot.
2. تصوير baseline جديد لـ `marketplace-home.png` إن أُريد التوثيق البصري الدقيق.

→ **لا استرجاع مطلوب. لا تعديل على كود.**

---

## المكوّنات المُتغيّرة — تقييم بصري

### Storefront Theme Tokens (commit `8b42fda`)

**ما تغيّر:** كافة مكوّنات المتجر الفرعي (ProductCard، StoreHeader، StoreFooter…) تحولت من ألوان Tailwind مشفّرة إلى CSS variables (`var(--foreground)`، `var(--background)`، `var(--border)`…).

**التأثير البصري:** لا انحراف — الألوان تُحلّل بنفس القيم الافتراضية (`slate-950 = var(--foreground)` في dark/light). المكوّنات تبدو متطابقة مع الـ baseline.

**القرار:** لا drift بصري، التحويل للـ tokens مقبول.

---

## حالة الفجوات البصرية المستمرة (من الجولات السابقة)

| المكوّن | العنصر | الحالة | القرار |
|---------|--------|--------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة (شحن/ثقة/أمان/دعم) | غائب | مقبول — تجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» تركواز | غائب | مقبول — تجميد |
| ProductTile (marketplace) | زر سلة `rounded-full` | `rounded-xl` في الكود | ينتظر Cursor — `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب مفضلة | غائب | ينتظر Cursor — `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب مفضلة | غائب | ينتظر Cursor — `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | غائب | ينتظر Cursor — `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | غائب | مقبول — تجميد |
| Store (mobile) | Sticky Cart Bar | غائب | ينتظر Cursor — `sticky-mini-cart-bar-2026-06-15.md` |
| Home header | زر "افتح متجرك" للضيف | غائب | ينتظر Cursor — `home-header-seller-cta-2026-06-16.md` |
| Marketplace | AdSlot variant="wide" | محذوف مقصود | **جديد هذه الجولة** — مقبول بقرار المطوّر |

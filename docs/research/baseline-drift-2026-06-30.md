# تقرير انحراف بصري — baseline-drift-2026-06-30

**تاريخ التشغيل:** 2026-06-30 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

**تم اكتشاف drift جديد — توقّف إلزامي قبل المرحلة 2.**

الكوميت `8b42fda` (2026-06-27) المعنون "refactor storefront components to tokens" غيّر أسلوب شارة الخصم في `ProductCard` من **bold solid أحمر** إلى **12% tinted بالغ الخفوت**، وهو انحراف بصري واضح عن baseline الذي يُظهر شارات خصم بارزة عالية التباين.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `2a4698d` | 2026-06-17 | feat: public storefront renders the visual builder (hybrid) | `app/[slug]/page.tsx` | builder stores → خارج نطاق baseline المباشر |
| `5f7bf39` | 2026-06-17 | fix: remove duplicate advertise banner on stores home | `app/page.tsx` | إصلاح تكرار — لا انحراف |
| `09dcbe4` | 2026-06-21 | fix: drop duplicate chrome hero for builder stores | `app/[slug]/layout.tsx` | إصلاح تكرار — لا انحراف |
| `e65d0a0` | 2026-06-21 | fix: make the products page discoverable in store nav | `app/[slug]/page.tsx` | تحسين تنقل — لا انحراف |
| `8f7b63b` | 2026-06-21 | feat: Salla-style landing — curated, less card-dominated | `components/theme-editor/BlockRenderer.tsx` | builder stores فقط — خارج نطاق baseline المباشر |
| `60fd4bc` | 2026-06-25 | feat: standard legal footer + policy pages | `app/[slug]/layout.tsx` | footer قانوني — خارج نطاق baseline |
| `b95d2b6` | 2026-06-27 | [codex] add storefront theme tokens | `styles/`, tokens | refactor tokens — لا انحراف مستقل |
| **`8b42fda`** | **2026-06-27** | **[codex] refactor storefront components to tokens** | **`components/product/ProductCard.tsx`** | **⚠️ انحراف بصري مؤكد** |

---

## الانحراف المؤكد — شارة الخصم في ProductCard

### الملف والسطر
`components/product/ProductCard.tsx` السطر 38-40

### الوصف البصري الدقيق

**الـ baseline (subdomain-store.png):** شارة خصم بارزة (`"خصم 33%"`) بخلفية لون صلبة عالية التباين فوق صورة المنتج، تعطي إشارة تجارية قوية وواضحة.

**الحالة قبل كوميت 8b42fda:**
```tsx
<span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
  خصم {discountPct}%
</span>
```
→ خلفية حمراء صلبة `bg-red-500`، نص أبيض — تباين عالٍ، مرئية بوضوح.

**الحالة بعد كوميت 8b42fda (الكود الحالي):**
```tsx
<span className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-sale)]">
  خصم {discountPct}%
</span>
```
→ خلفية `color-mix` بنسبة 12% فقط من لون الخصم — بالغة الخفوت، تكاد لا تُرى فوق صور المنتجات المعتدلة الإضاءة.

### متى تغيّر
الكوميت `8b42fda` — 2026-06-27، ضمن عملية tokenization شاملة.

### شدة الانحراف
**عالية** — شارة الخصم إشارة تجارية حرجة (conversion signal). إخفاؤها يضر بمعدل النقر وبالأمانة البصرية مع baseline.

### توصية الاسترجاع المحددة (توصية فقط — لا تنفيذ)
السطر 38 في `components/product/ProductCard.tsx` يصبح:
```tsx
<span className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[var(--c-sale)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-white">
  خصم {discountPct}%
</span>
```
→ الإبقاء على tokens الجديدة لكن باستخدام `bg-[var(--c-sale)]` solid بدلاً من 12% mix، ونص أبيض `text-white`.

---

## الفجوات البصرية المستمرة من الجولات السابقة

لا تغيير في حالتها:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | غائب | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | غائب | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` | ينتظر Cursor — `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | غائب | ينتظر Cursor — `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | غائب | ينتظر Cursor — `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | غائب | ينتظر Cursor — `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | غائب | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | غائب | ينتظر Cursor — `sticky-mini-cart-bar-2026-06-15.md` |

---

## قرار المرحلة

**انحراف جديد مؤكد → التوقّف الإلزامي قبل المرحلتين 2 و3.**

الانحراف يستدعي إنشاء spec لاسترجاع شارة الخصم إذا كانت الجولة التالية ستمضي. هذه الجولة تتوقف عند المرحلة 1.

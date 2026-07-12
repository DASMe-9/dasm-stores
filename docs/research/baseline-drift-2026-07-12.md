# تقرير انحراف بصري — baseline-drift-2026-07-12

**تاريخ التشغيل:** 2026-07-12 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

**تم رصد drift جديد في StoreHeader.**
انحراف بصري واحد لم يُوثَّق سابقاً: إضافة رابط «المنتجات» في شريط التنقل المركزي للهيدر على متاجر الـ subdomain.

**قرار المرحلة:** drift موثَّق → **لا تكملة لمرحلتي 2 و3 هذه الجولة**.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | الوصف | الملفات المؤثرة بصرياً | التأثير |
|---------|-------|----------------------|---------|
| `8f7b63b` | feat: Salla-style landing | `StorefrontBlocks.tsx`, `ProductGrid.tsx` | متاجر Builder فقط — خارج baseline |
| `09dcbe4` | fix: drop duplicate chrome hero for builder stores | `StoreHeader.tsx`, `app/[slug]/layout.tsx` | يُضيف `compact` prop — لا يؤثر على المتاجر العادية |
| `e65d0a0` | fix: make products page discoverable in store nav | `StoreHeader.tsx`, `StoreTabsNav.tsx` | **⚠ drift جديد** — راجع التفاصيل أدناه |
| `60fd4bc` | feat: standard legal footer + policy pages | `StoreFooter.tsx`, `app/[slug]/layout.tsx` | فوتر قانوني — خارج نطاق baseline الحالي |
| `56ee40c` | fix: drop cart-emptied banner | `StoreChrome.tsx` | سلوك فقط، لا drift بصري |
| `f13b4c1` | fix: drop fake testimonials from templates | `lib/themes/blocks/templates.ts` | مكتبة templates — خارج baseline |
| `8b42fda` | refactor: storefront components to tokens | `ProductCard.tsx`, `StoreHeader.tsx`, وآخرون | إعادة هيكلة CSS tokens — يحافظ على المخرج البصري |
| `b95d2b6` | add storefront theme tokens | `styles/globals.css`, `lib/themes/*` | infrastructure — لا drift بصري |

---

## الـ Drift الجديد الموثَّق

### StoreHeader — رابط «المنتجات» في شريط التنقل المركزي

| الحقل | القيمة |
|-------|--------|
| **المكوّن** | `StoreHeader` |
| **الملف** | `components/store/StoreHeader.tsx` |
| **السطر** | 79–91 (كتلة `<nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">`) |
| **الكوميت المُسبب** | `e65d0a0` — "fix(storefront): make the products page discoverable in store nav (#195)" |
| **التاريخ التقريبي** | بعد 2026-06-16 (بعد آخر تقرير drift) |

**الوصف البصري الدقيق:**

- **قبل الكوميت (`5e4d605`):** الشريط العلوي اللاصق يحتوي على: [شعار + اسم المتجر] — [فراغ مركزي] — [أزرار auth + theme toggle]. شريط التنقل المركزي كان يعرض «الرئيسية» و«← متاجر داسم» فقط (رابط الرئيسية كان موجوداً قبل آخر تقرير baseline وتم قبوله ضمنياً).
- **بعد الكوميت (`e65d0a0`):** أُضيف رابط ثالث «المنتجات» في المنتصف بين «الرئيسية» و«← متاجر داسم». الرابط مرئي فقط على شاشات `md+` (مخفي على الموبايل).
- **baseline:** لا يظهر رابط «المنتجات» منفصلاً في هيدر المتجر الفرعي. الـ baseline (`docs/design/baseline/subdomain-store.png`) يُظهر الهيدر بدون nav مركزي لروابط المنتجات.

**توصية الاسترجاع (لـ Cursor — للتنفيذ فقط إن قُرِّر إعادة المحاذاة مع baseline):**

في `components/store/StoreHeader.tsx`، احذف السطر:
```
<Link href={`/${slug}/products`} className="rounded-[var(--r-pill)] px-[var(--space-3)] py-[var(--space-2)] font-semibold text-[var(--c-text)] transition hover:bg-[var(--c-surface-2)]">
  المنتجات
</Link>
```
(السطر 79-82 في الكود الحالي بعد tokens refactor)

**ملاحظة مهمة:** هذا التغيير هو **تحسين قصدي** لاكتشافية المتجر، وليس انحداراً. التوصية الأرجح هي **تحديث الـ baseline** ليقبل هذا الرابط كجزء من التصميم الجديد، بدلاً من الحذف.

---

## حالة الفجوات البصرية المستمرة (محدَّثة)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | spec `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | spec `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | spec `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | spec `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | spec `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| **StoreHeader (desktop)** | **رابط «المنتجات» مركزي** | **جديد في الكود** | **drift جديد — هذا التقرير** |

---

## الخطوة التالية

- drift موثَّق → لا تكملة لمرحلتي 2 و3 هذه الجولة.
- القرار المطلوب من المراجعة: هل يُحدَّث الـ baseline ليقبل رابط «المنتجات» في الهيدر، أم يُرجَع للحالة السابقة؟
- عند القرار بالقبول: تحديث `docs/design/baseline/subdomain-store.png` واعتبار الفجوة مُغلقة في التقرير التالي.

# تقرير انحراف بصري — baseline-drift-2026-06-28

**تاريخ التشغيل:** 2026-06-28 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات منذ 2026-06-16 تغطي:
- SSO / Google+Apple sign-in (`pages/auth/`)
- إعادة هيكلة رموز CSS للـ storefront إلى tokens (`var(--c-brand)` وما شابه)
- تحسينات visual block builder (مغلق خلف `hasBuilderLayout` — لا تأثير على المتاجر العادية)
- إصلاحات سلوكية (إزالة banner "تم إفراغ السلة"، إزالة hero مكرر في builder stores)

لم يُلمس أي مكوّن من مكوّنات الـ baseline البصري خارج نطاق التجميد المعتمد.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات المراجَعة منذ 2026-06-16

| الكوميت | الوصف | الملفات الحرجة | تأثير baseline |
|---------|-------|----------------|----------------|
| `d3ece4c` | feat(auth): Google/Apple sign-in + profile completion | `pages/auth/` | خارج نطاق baseline |
| `8b42fda` | refactor storefront components to tokens | `components/store/*.tsx` | tokens فقط — لا تغيير هيكلي |
| `b95d2b6` | add storefront theme tokens | `styles/`, `tailwind.config` | إضافة — لا حذف |
| `56ee40c` | fix: drop cart-emptied banner | `components/store/StoreChrome.tsx` | خارج نطاق baseline |
| `60fd4bc` | feat: standard legal footer + policy pages | `components/store/StoreFooter.tsx` | خارج نطاق baseline |
| `e65d0a0` | fix: products page discoverable in store nav | `app/[slug]/page.tsx` nav | خارج نطاق baseline |
| `09dcbe4` | fix: drop duplicate chrome hero for builder stores | `StoreHeader.tsx` compact mode | لا يؤثر على المتاجر العادية |
| `8f7b63b` | feat: Salla-style landing curated | `app/[slug]/page.tsx` | تخطيط صفحة المتجر — خارج Hero/Card baseline |
| `5f7bf39` | fix: remove duplicate advertise banner | `app/page.tsx` | StoreAdSlot في hero لا يزال موجوداً |
| `5f45ab2` | feat: visual block builder as primary designer | `lib/storefront-builder.ts` | مغلق خلف hasBuilderLayout |

---

## حالة الفجوات البصرية المستمرة

لا تغيير في الحالة منذ 2026-06-16:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود (line 115 `app/page.tsx`) | spec جاهز `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | spec جاهز `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | spec جاهز `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة (متجر موثوق / توصيل سريع) | **غائب** | spec جاهز `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar (15,000 متجر / +1 مليون / 99.6%) | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | spec جاهز `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## ملاحظة: compact mode في StoreHeader

commit `09dcbe4` أضاف `compact={true}` لـ StoreHeader في builder stores. هذا يُخفي hero banner + بطاقة المعلومات العائمة ويعرض شريط هوية نحيف بدلاً. هذا تصميم مقصود للـ builder stores (التي تملك Hero خاصاً في blocks الخاصة بها) ولا يمثل drift على المتاجر العادية التي تعرض hero كامل كما في baseline.

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول.

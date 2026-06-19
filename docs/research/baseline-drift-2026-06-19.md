# تقرير انحراف بصري — baseline-drift-2026-06-19

**تاريخ التشغيل:** 2026-06-19 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift حرج جديد.** الكوميتات المنشورة منذ 2026-06-16 تقع في ثلاث فئات:

1. **إزالة بانر إعلاني مكرر** (`5f7bf39`) — يُصحّح تكراراً غير مقصود، لا يُحدث drift من الـ baseline.
2. **Visual Builder hybrid rendering** (`2a4698d`) — يفتح مسار تصيير بديل للمتاجر التي تمتلك تهيئة بانية. المتاجر بدون تهيئة بانية تُصيَّر كما كانت بالضبط.
3. **إعادة تصميم قوالب المتجر** (`26cc22e`) — تعديل على `lib/themes/blocks/templates.ts` فقط؛ لا مكوّنات UI مسّها.

**قرار المرحلة:** لا انحراف مانع → تكتمل المرحلتان 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملفات | التأثير البصري على baseline |
|---------|---------|-------|---------|---------------------------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` (‏−1 سطر) | **لا drift** — تُزال النسخة المكررة من البانر الواسع؛ النسخة الأصلية تحت قسم المنتجات تبقى كما هي في baseline |
| `2a4698d` | 2026-06-17 | feat(storefront): visual builder hybrid rendering | `app/[slug]/page.tsx` + `components/storefront/StorefrontBlocks.tsx` + `lib/storefront-builder.ts` | **انحراف معماري مُتحكَّم** (انظر أدناه) |
| `26cc22e` | 2026-06-17 | feat(theme/templates): redesign 6 store templates | `lib/themes/blocks/templates.ts` | **لا drift** — لا مكوّنات UI مُعدَّلة |

---

## تفصيل كوميت `2a4698d` — الانحراف المعماري المُتحكَّم

### ما الذي تغيّر؟

`app/[slug]/page.tsx` أضافت gate:
```tsx
if (hasBuilderLayout(data.store.theme_config)) {
  return <StorefrontBlocks blocks={...} products={...} ... />;
}
// else: نفس الـ JSX القديم — لا تغيير
```

### تأثيره على الـ baseline

| نوع المتجر | المسار | التأثير |
|-----------|--------|---------|
| متاجر بدون Visual Builder | المسار القديم (JSX الأصلي) | **لا تغيير** — baseline محفوظ تماماً |
| متاجر Visual Builder (اختارت التهيئة) | `<StorefrontBlocks>` | التخطيط يختلف عن baseline عن قصد (فيتشر منشور) |

**الخلاصة:** الـ baseline ينطبق على المتاجر غير المخصّصة (الغالبية العظمى). المتاجر Builder-enabled خارج نطاق baseline بحكم التصميم.

### ملاحظة للمراجعة

إذا كانت "Cheerly Life" (المتجر المرجعي في الـ baseline) تمتلك تهيئة builder، فسيظهر الـ subdomain-store.png مختلفاً. **الإجراء المقترح:** التحقق من `data.store.theme_config` لـ Cheerly Life في جولة قادمة.

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث من التقرير السابق — لا تغيير في الحالة:

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

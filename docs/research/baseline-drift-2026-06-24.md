# تقرير انحراف بصري — baseline-drift-2026-06-24

**تاريخ التشغيل:** 2026-06-24 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا drift غير مقصود.** الكوميتات الثمانية منذ 2026-06-16 جميعها تغييرات معمارية مقصودة أو إصلاحات موثّقة. وُجد **تحديث بصري جديد واحد** يستحق التسجيل: إضافة رابط "المنتجات" في شريط تنقل المتجر (StoreHeader) لجميع المتاجر.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ 2026-06-16

| الكوميت | الوصف | الملفات الجوهرية | التأثير البصري |
|---------|-------|-----------------|----------------|
| `935f6c8` | guardian: weekly drift+competitor+spec (16 يونيو) | `docs/` | مستندات — خارج النطاق |
| `5f7bf39` | fix(marketplace): إزالة البانر الإعلاني المكرر (#181) | `app/page.tsx` | يُصحّح تكراراً — يقترب من الـ baseline |
| `26cc22e` | feat(theme/templates): إعادة تصميم 6 قوالب متجر (#182) | قوالب CSS/config | يؤثر على متاجر تستخدم presets — مقصود |
| `5f45ab2` | feat(stores/theme): جعل Block Builder محور تصميم المتجر (#190) | dashboard، lib/themes | تغيير توجيه في لوحة التحكم — لا أثر على واجهة المتسوق |
| `afd9d71` | fix(storefront): image-with-text يتحول لنص نقي بلا صورة (#192) | `BlockRenderer.tsx` | builder stores — مقصود |
| `8f7b63b` | feat(storefront): Salla-style landing (#193) | `ProductGrid.tsx`, `StorefrontBlocks.tsx`, `BlockRenderer.tsx` | builder stores فقط (تفصيل أدناه) |
| `09dcbe4` | fix(storefront): إزالة hero مكرر لـ builder stores (#194) | `StoreHeader.tsx`, `layout.tsx` | builder stores فقط (تفصيل أدناه) |
| `e65d0a0` | fix(storefront): إضافة "المنتجات" في nav المتجر (#195) | `StoreHeader.tsx`, `StoreTabsNav.tsx` | **تحديث بصري جديد — جميع المتاجر** |

---

## تفاصيل التحديثات البصرية

### 1. رابط "المنتجات" في شريط التنقل — جديد (e65d0a0)

**الملف:** `components/store/StoreHeader.tsx` السطر 87
**الأثر:** جميع المتاجر (builder وغير builder)
**التغيير:** أُضيف رابط "المنتجات" بين "الرئيسية" و"متاجر داسم" في شريط التنقل العلوي.

```
قبل:  [الرئيسية]  [متاجر داسم →]
بعد:  [الرئيسية]  [المنتجات]  [متاجر داسم →]
```

**التقييم:** إضافة إيجابية لصالح قابلية الاكتشاف. لا تُعدّ انحرافاً ضاراً. الـ baseline الأصلي لا يُظهر هذا الرابط صراحةً. يُسجَّل كـ delta للتوثيق فقط.

**أيضاً في الكوميت نفسه:** إعادة تسمية تبويب "الكل" ← "كل المنتجات" في `StoreTabsNav.tsx`.

---

### 2. تغييرات builder stores (8f7b63b + 09dcbe4)

**المتأثرون:** المتاجر التي تستخدم Block Builder (hasBuilderLayout = true)
**لا أثر على:** المتاجر التقليدية بما فيها مرجع الـ baseline ("شيرلي لايف")

| التغيير | الملف | الحالة |
|---------|-------|--------|
| Hero chrome + floating card مُزالة → slim identity strip | `StoreHeader.tsx` (compact mode) | مقصود — Builder يملك الهيرو عبر blocks |
| ProductGrid 6-up → 4-up (desktop) | `ProductGrid.tsx` | يتوافق مع baseline subdomain-store.png (4 أعمدة) |
| Category tiles: ألوان مُشبعة → بطاقات بيضاء بأيقونة accent | `BlockRenderer.tsx` | مقصود — Salla-style aesthetic |
| Hero: طباعة أكبر + عمق radial | `BlockRenderer.tsx` | مقصود |

---

### 3. إزالة البانر الإعلاني المكرر (5f7bf39)

كان `app/page.tsx` يعرض بانرين "أعلن الآن". الكوميت أزال الثاني. **النتيجة تُقرّب الكود من الـ baseline** (بانر واحد). لا drift.

---

## حالة الفجوات البصرية المستمرة

جدول موحّد — لا تغيير في الحالة منذ W29:

| المكوّن | العنصر | الحالة في الكود | الحالة |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول — قرار تجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول — قرار تجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود (السطر 115) | ينتظر Cursor: `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor: `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor: `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة (متجر موثوق / توصيل سريع) | **غائب** | ينتظر Cursor: `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar (15,000 متجر / +1 مليون) | **غائب** | مقبول — قرار تجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | ينتظر Cursor: `sticky-mini-cart-bar-2026-06-15.md` |
| Marketplace header | CTA "افتح متجرك مجاناً" للضيوف | **غائب** | ينتظر Cursor: `home-header-seller-cta-2026-06-16.md` |

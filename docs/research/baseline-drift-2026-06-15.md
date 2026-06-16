# تقرير انحراف بصري — baseline-drift-2026-06-15

**تاريخ التشغيل:** 2026-06-15 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-11.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات الثلاثة الجديدة منذ الجولة الأخيرة (2026-06-12) تقتصر على ملفات seller dashboard وصفحة التسجيل — خارج نطاق الـ baseline البصري للمتسوق.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-12)

| الكوميت | الوصف | الملف | التأثير البصري |
|---------|-------|-------|----------------|
| `5589c30` | Improve store import dashboard UX | `pages/dashboard/import.tsx` | لوحة تحكم البائع — خارج نطاق baseline |
| `ad1943b` | chore(signup): trim store-owner form | `pages/auth/signup.tsx` | نموذج تسجيل — خارج نطاق baseline |
| `bce531b` | feat(stores): complete Salla OAuth import | `pages/dashboard/import.tsx` | لوحة تحكم البائع — خارج نطاق baseline |

لم يُلمس أي ملف من الملفات التالية:
- `app/page.tsx`
- `app/[slug]/page.tsx`
- `app/[slug]/layout.tsx`
- `components/product/ProductCard.tsx`
- `components/explore/StoreCard.tsx`
- `components/home/HomeHeaderActions.tsx`

---

## حالة الفجوات البصرية المستمرة

جدول الفجوات المعروفة — محدَّث من التقرير السابق:

| المكوّن | العنصر المذكور في baseline README | الحالة في الكود | القرار |
|---------|-----------------------------------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة (شحن/ثقة/أمان/دعم) | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» (رعاية) | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة (موثوق/توصيل/رياض) | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar (15,000 متجر / +1 مليون / 99.6% رضا) | **غائب** | مقبول بقرار التجميد |
| Store pages (mobile) | Sticky Cart Bar | **غائب** | محل spec هذه الجولة (W28) |

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

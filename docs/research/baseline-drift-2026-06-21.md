# تقرير انحراف بصري — baseline-drift-2026-06-21

**تاريخ التشغيل:** 2026-06-21 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد يمنع المتابعة.** عشرة كوميتات منذ الجولة الأخيرة (2026-06-16) تنقسم إلى:
- لوحة تحكم بائع (theme editor / visual builder) — خارج نطاق baseline المتسوق
- متاجر builder — مسار جديد لا يلمس non-builder path الذي يمثّل الـ baseline

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | التأثير على baseline |
|---------|---------|-------|----------------------|
| `0f685d9` | 2026-06-16 | feat: theme editor block (phase 4a) | لوحة تحكم — خارج النطاق |
| `35dece8` | 2026-06-16 | feat: m2 visual blocks + live iframe | لوحة تحكم — خارج النطاق |
| `c3bd613` | 2026-06-17 | feat: m3 AI block assistant | لوحة تحكم — خارج النطاق |
| `d987a13` | 2026-06-17 | feat: phase 4b visual builder + templates | لوحة تحكم — خارج النطاق |
| `2a4698d` | 2026-06-17 | feat: phase 4c public storefront hybrid | `app/[slug]/page.tsx` — مسار builder فقط، non-builder بلا تغيير |
| `5f7bf39` | 2026-06-17 | fix: remove duplicate advertise banner | `app/page.tsx` حذف بانر مكرر — تفصيل أدناه |
| `5f45ab2` | 2026-06-21 | feat: visual builder → primary designer | لوحة تحكم — خارج النطاق |
| `afd9d71` | 2026-06-21 | fix: image-with-text degrades to text band | `StorefrontBlocks.tsx` — builder فقط |
| `8f7b63b` | 2026-06-21 | feat: Salla-style landing | `ProductGrid.tsx`, `StorefrontBlocks.tsx`, `BlockRenderer.tsx` — تفصيل أدناه |
| `09dcbe4` | 2026-06-21 | fix: drop duplicate chrome hero for builder stores | `StoreHeader.tsx` + `layout.tsx` — تفصيل أدناه |
| `e65d0a0` | 2026-06-21 | fix: products page discoverable in store nav | `app/[slug]/page.tsx` — nav link إضافي، لا أثر بصري على baseline |

---

## تحليل التغييرات ذات الصلة بالـ baseline

### 1. حذف بانر إعلان مكرر — `app/page.tsx` (كوميت `5f7bf39`)

**ما تغيّر:** حُذف شريط "مساحة بانر واسعة" الثانوي أسفل قسم المتاجر المميزة.

**تقييم baseline:** كتالوج المكوّنات يذكر `AdSlot variant="wide"` كنوع ثانٍ. الكود الحالي لا يزال يحتوي على كتلة الإعلان الإلكترونية داخل قسم المنتجات (`{!q ? <Link href="...advertise"> ... </Link> : null}`). الحذف طال نسخة مكررة لا الكتلة الرئيسية.

**الحكم:** ليس drift يمنع المتابعة. يُسجَّل كملاحظة: variant=wide لم يعد مستقلاً.

---

### 2. `StoreHeader.tsx` — إضافة `compact` prop (كوميت `09dcbe4`)

**ما تغيّر:** الهيدر اكتسب prop جديد `compact?: boolean`. عند `compact=true` (متاجر builder) يُعرض شريط هوية نحيل. عند `compact=false` (الافتراضي — non-builder) يبقى المسار الكامل: hero banner متحرك + بطاقة معلومات المتجر العائمة.

**تحقق الـ baseline:** تم قراءة `StoreHeader.tsx` كاملاً. الأسطر 139-237 (المسار `compact=false`) بدون أي تغيير عن الـ baseline المرصود:
- Hero banner بالأنيميشن والأيقونات المتحركة ✓
- بطاقة المتجر العائمة (`-mt-8`) بالشعار وخطوط الوصف والمنطقة والهاتف ✓

**الحكم:** لا drift. builder stores هي مسار جديد خارج نطاق الـ baseline.

---

### 3. `ProductGrid.tsx` — تغيير عمود الشبكة (كوميت `8f7b63b`)

**ما تغيّر:** عمود الشبكة على desktop من `xl:grid-cols-6` إلى `lg:grid-cols-4`. الحالة الحالية: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`.

**تقييم baseline:** كتالوج المكوّنات لا يحدد عدد أعمدة صفحة المنتجات في المتجر الفرعي. يذكر "شبكة منتجات" دون تفصيل للأعمدة.

**الحكم:** تطور أسلوبي، ليس drift من الـ baseline الموثّق.

---

## حالة الفجوات البصرية المستمرة

لا تغيير في الحالة مقارنةً بتقرير 2026-06-16:

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

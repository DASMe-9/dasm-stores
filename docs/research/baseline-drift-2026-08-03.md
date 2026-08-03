# تقرير انحراف بصري — baseline-drift-2026-08-03

**تاريخ التشغيل:** 2026-08-03 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج — 7 فجوات مفتوحة)
**فجوة في الجولات:** انقطعت الجولات بين 2026-06-16 و2026-08-03 (7 أسابيع)

---

## ملخص تنفيذي

**لا يوجد drift جديد يمنع الانتقال.** الكوميتات المؤثرة بصرياً منذ آخر جولة أحدثت تحسيناً (homepage elevation، dark mode) وليس انحرافاً. جدير بالتسجيل:
- **فجوة مغلقة:** `home-header-seller-cta-2026-06-16.md` نُفّذت (زر "افتح متجرك" للضيوف)
- **تناقض بصري داخلي جديد:** قسم "متاجر نشطة" في `app/page.tsx` يعرض "زيارة المتجر" وشعار `rounded-2xl`؛ `StoreCard` في القسم المجاور يفتقرهما — يُعزز أولوية `store-card-visit-cta-2026-06-13.md`

**قرار المرحلة:** لا drift مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات المؤثرة بصرياً منذ 2026-06-16

| الكوميت | التاريخ | الوصف | الملفات | التأثير البصري |
|---------|---------|-------|---------|----------------|
| `013f987` | 30 يوليو 2026 | [codex] elevate DASM Stores marketplace homepage | `app/page.tsx`، `components/home/HomeHeaderActions.tsx` | تحسين جوهري للـ homepage (CommercePassport، typography، أقسام جديدة) + إضافة "افتح متجرك" للضيوف |
| `2a9372c` | 30 يوليو 2026 | [codex] fix homepage light and dark theme coverage | `app/page.tsx` | إصلاح تغطية dark mode على جميع عناصر الصفحة الرئيسية |
| `8b42fda` | أبريل/مايو 2026 | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx`، `components/store/StoreHeader.tsx` | إعادة هيكلة أنماط ProductCard إلى CSS tokens (var(--c-sale) إلخ) — no visual regression |

كوميتات أخرى (`4edbdeb`، `aee89fd`، `ce5e8e2`) تخص لوحة التاجر والمورّدين والنصوص — خارج نطاق baseline المتسوق.

---

## نتائج مقارنة الـ baseline مكوّناً بمكوّن

### Hero (marketplace) — `app/page.tsx` السطر 452

| المحور | الـ baseline | الكود الحالي | التقييم |
|--------|-------------|--------------|---------|
| الخلفية | داكنة + تدرج تركواز | `bg-[#eaf2f1] / dark:bg-[#081c2c]` + radial-gradient | مقبول — تناسق ثيم محلي ✓ |
| العنوان الرئيسي | موجود، بارز | "من متجر سعودي مستقل، إلى سوق أكبر." السطر 463 | ✓ |
| شريط البحث | حقل أبيض كبير + قائمة نطاق | موجود السطر 503 — **بلا قائمة نطاق** | فجوة صغيرة، موثّقة سابقاً |
| أيقونات مزايا المنصة | صف أيقونات تحت الـ hero | **غائب** | **مقبول بقرار التجميد 2026-06-07** |
| العنصر الأيمن | صور ثلاثية الأبعاد | `CommercePassport` (مرئي، قيّم) | تطور مقبول عن البديل الأصلي |

### ProductTile (marketplace) — `app/page.tsx` السطر 191

| المحور | الـ baseline | الكود الحالي | التقييم |
|--------|-------------|--------------|---------|
| صورة المنتج | aspect عمودي | `aspect-[1.18]` أفقي قليلاً | فجوة بسيطة — موثّقة |
| شارة "مميز" | ✓ | ✓ السطر 214 `rounded-full` | ✓ |
| شارة "ممول" | ✓ في السوق | **غائب** | **مقبول بقرار التجميد** |
| شارة الخصم % | ✓ | **غائب** في ProductTile | **فجوة مفتوحة** — `product-tile-discount-badge-2026-06-07.md` |
| أيقونة قلب (مفضلة) | ✓ | **غائب** | **فجوة مفتوحة** — `product-tile-wishlist-2026-06-11.md` |
| زر سلة/تنقل | دائري `rounded-full` | `rounded-xl` — السطر 237 | **فجوة مفتوحة** — `product-tile-cart-button-2026-06-14.md` |
| السعر بـ"ر.س" | ✓ | ✓ "ر.س" السطر 233 | ✓ |

### StoreCard — `components/explore/StoreCard.tsx` السطر 35

| المحور | الـ baseline | الكود الحالي | التقييم |
|--------|-------------|--------------|---------|
| شعار دائري | `rounded-full` | `rounded-xl` السطر 35 | **فجوة مفتوحة** — `store-card-visit-cta-2026-06-13.md` |
| زر "زيارة المتجر" | ✓ بحدود تركواز | **غائب** | **فجوة مفتوحة** — spec سابق |

**⚠️ تناقض بصري جديد (مُلاحَظ لأول مرة):**
قسم "متاجر نشطة" في `app/page.tsx` (السطر 663) يعرض `<span>"زيارة المتجر"</span>` وشعار `rounded-2xl`، بينما `<StoreCard>` في القسم المجاور يخلو منهما. المتسوق يرى تجربتين مختلفتين لعرض المتاجر على نفس الصفحة. هذا التناقض يعزز أولوية تنفيذ `store-card-visit-cta-2026-06-13.md`.

### ProductCard (store pages) — `components/product/ProductCard.tsx`

| المحور | الـ baseline | الكود الحالي | التقييم |
|--------|-------------|--------------|---------|
| شارة الخصم % | ✓ | ✓ السطر 37 (أُضيفت في `8b42fda`) | ✓ **فجوة مغلقة منذ W23** |
| أيقونة قلب (مفضلة) | ✓ | **غائب** | **فجوة مفتوحة** — `product-card-store-wishlist-2026-06-12.md` |
| زر "أضف للسلة" سريع | ✓ | **غائب** | **فجوة مفتوحة** — `product-card-quick-add-2026-06-13.md` |

### StoreHeader / StoreInfoCard — `components/store/StoreHeader.tsx` السطر 179

| المحور | الـ baseline | الكود الحالي | التقييم |
|--------|-------------|--------------|---------|
| وسوم الثقة (موثوق/توصيل سريع) | ✓ | **غائب** (area + phone فقط) | **فجوة مفتوحة** — `store-info-trust-badges-2026-06-08.md` |
| بيانات المتجر (موقع + وصف) | ✓ | ✓ السطر 199، 192 | ✓ |
| أزرار ثانوية (مشاركة، واتساب) | ✓ | ✓ السطر 215-222 | ✓ |

### HomeHeaderActions — `components/home/HomeHeaderActions.tsx`

| المحور | الـ baseline | الكود الحالي | التقييم |
|--------|-------------|--------------|---------|
| زر "افتح متجرك" للضيوف | خارج baseline | ✓ السطر 138-144 | ✅ **نُفّذت spec `home-header-seller-cta-2026-06-16.md`** — commit `013f987` |

---

## الفجوات البصرية المستمرة — جدول محدَّث

| # | المكوّن | العنصر | الحالة | الـ spec |
|---|---------|--------|--------|---------|
| 1 | ProductTile (marketplace) | شارة خصم % | **مفتوح** | `product-tile-discount-badge-2026-06-07.md` |
| 2 | ProductTile (marketplace) | أيقونة قلب | **مفتوح** | `product-tile-wishlist-2026-06-11.md` |
| 3 | ProductTile (marketplace) | زر دائري `rounded-full` | **مفتوح** | `product-tile-cart-button-2026-06-14.md` |
| 4 | ProductCard (store pages) | أيقونة قلب | **مفتوح** | `product-card-store-wishlist-2026-06-12.md` |
| 5 | ProductCard (store pages) | Quick Add | **مفتوح** | `product-card-quick-add-2026-06-13.md` |
| 6 | StoreCard | شعار دائري + CTA | **مفتوح** | `store-card-visit-cta-2026-06-13.md` |
| 7 | StoreHeader | وسوم ثقة | **مفتوح** | `store-info-trust-badges-2026-06-08.md` |
| 8 | Store (mobile) | Sticky Cart Bar | **مفتوح** | `sticky-mini-cart-bar-2026-06-15.md` |

**الفجوات المغلقة:**
- ~~HomeHeaderActions زر "افتح متجرك"~~ → ✅ نُفّذت (commit `013f987`، 30 يوليو 2026)
- ~~ProductCard discount badge (store pages)~~ → ✅ نُفّذت (commit `8b42fda`)
- الـ StatsBar: مقبول بقرار التجميد 2026-06-07

**المقبول بقرار التجميد:** StatsBar، أيقونات مزايا المنصة في Hero، شارة "ممول" في ProductTile.

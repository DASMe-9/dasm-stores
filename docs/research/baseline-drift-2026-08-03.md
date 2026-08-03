# تقرير انحراف بصري — baseline-drift-2026-08-03

**تاريخ التشغيل:** 2026-08-03 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift حرج جديد.** الكوميتات المؤثرة على ملفات الـ baseline منذ 2026-06-16 كانت تحسيناً إيجابياً وإعادة هيكلة محايدة بصرياً. جميع الفجوات الموثَّقة سابقاً لا تزال في انتظار Cursor.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات ذات التأثير البصري منذ 2026-06-16

| الكوميت | الوصف | الملف | التأثير البصري |
|---------|-------|-------|----------------|
| `013f987` | [codex] elevate DASM Stores marketplace homepage | `components/home/HomeHeaderActions.tsx` | إضافة زر "افتح متجرك" للضيف — **تحسين إيجابي، ليس drift** |
| `8b42fda` | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx` | إعادة هيكلة CSS variables — لا تغيير بصري مرئي |

لم يُلمس أي ملف من الملفات التالية في الفترة نفسها:
- `app/page.tsx`
- `app/[slug]/page.tsx`
- `components/explore/StoreCard.tsx`
- `components/store/StoreChrome.tsx`

---

## HomeHeaderActions — تحديث إيجابي (spec مُنجَز)

تم تنفيذ الـ spec الذي أنشأه Guardian في جولة W29 (`home-header-seller-cta-2026-06-16.md`).

**الحالة الجديدة للضيف في الكود:**
- زر أساسي "افتح متجرك" (→ `/auth/signup`) بخلفية `#0e7c66` مع أيقونة `Store`
- زر ثانوي "تسجيل الدخول" (→ `/auth/login?returnUrl=/dashboard`) بحدود فاتحة
- كلا الزرَّين يختفيان بعد تسجيل الدخول ويُستبدلان بقائمة "حسابي"

يطابق التوصية تماماً. الملف المرجعي للمقارنة: `components/home/HomeHeaderActions.tsx` (السطور 137–153).

---

## ProductCard — إعادة هيكلة tokens (محايد)

**التغيير:** استُبدلت قيم Tailwind المباشرة بـ CSS variables (`var(--c-surface-2)`، `var(--c-accent)`، `var(--c-sale)`، `var(--c-text)`، `var(--c-muted)`، `var(--space-*)`, `var(--r-pill)`).

**التأثير البصري:** لا تغيير مرئي في الحالة الافتراضية — الـ tokens تحكي نفس القيم السابقة عبر `tailwind.config`. الفجوات السابقة (قلب، سلة) لا تزال قائمة بنفس الحالة.

---

## حالة الفجوات البصرية المستمرة

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | زر عرض `ArrowLeft` بـ`rounded-xl` | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| HomeHeaderActions | زر "افتح متجرك" للضيف | **مُنفَّذ ✓** | `home-header-seller-cta-2026-06-16.md` — مكتمل |

---

## الخطوة التالية

لا تصحيح drift مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

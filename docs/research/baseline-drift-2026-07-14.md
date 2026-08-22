# تقرير انحراف بصري — baseline-drift-2026-07-14

**تاريخ التشغيل:** 2026-07-14 (جولة أسبوعية — الاثنين)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات العشرة الجديدة منذ 2026-06-16 تشمل: إعادة تسمية متغيرات CSS إلى نظام tokens، إصلاح Hero المكرر لمتاجر builder، وتدفقات تسجيل الدخول الاجتماعي — جميعها خارج نطاق الـ baseline البصري للمتسوق أو تحسينات إضافية (additive) لا تُزيل عناصر موجودة.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ 2026-06-16 المؤثرة على ملفات baseline

| الكوميت | الوصف | الملف | التأثير البصري |
|---------|-------|-------|----------------|
| `8b42fda` | [codex] refactor storefront components to tokens | `components/store/StoreHeader.tsx`، `ProductCard.tsx`، إلخ | إعادة تسمية CSS variables فقط (`var(--border)` → `var(--c-line)`) — لا تغيير بنيوي |
| `e65d0a0` | fix: make products page discoverable in store nav | `components/store/StoreHeader.tsx` | إضافة رابط "المنتجات" للقائمة العلوية — إضافي (لم يُزل شيئاً من الـ baseline) |
| `09dcbe4` | fix: drop duplicate chrome hero for builder stores | `app/[slug]/layout.tsx` | أضاف `compact` prop؛ المتاجر غير-builder (وهي baseline المقاسة) تبقى بدون تغيير |
| `fb4a859` / `b16dbb8` / `9a7dab5` / `d3ece4c` | Social login + profile completion | `pages/auth/` | تدفق مصادقة — خارج نطاق baseline المتسوق |
| `f13b4c1` | drop fake testimonials & newsletter from default templates | `lib/themes/blocks/templates.ts` | قوالب theme builder — لا يؤثر على السوق أو صفحة المتجر الرئيسية |
| `56ee40c` | drop cart emptied store-switch banner | `components/cart/` | إزالة banner مزعج — تحسين لا drift |
| `60fd4bc` | standard legal footer + policy pages | `app/[slug]/p/` | صفحات سياسة جديدة — خارج نطاق baseline |

---

## نتيجة المقارنة المكوّن بمكوّن

### Hero (marketplace) — `app/page.tsx` lines 71–86 و 178

| العنصر في baseline | الحالة في الكود | الحكم |
|-------------------|-----------------|-------|
| خلفية داكنة `#021b1f` | `bg-[#021b1f]` ✅ | مطابق |
| أيقونات ShoppingBag/Headphones/FlaskConical/BadgeCheck/ShoppingCart | `HeroScene` component ✅ | مطابق |
| عنوان "اكتشف متاجر ومنتجات داسم" | `h1` line 178 ✅ | مطابق |
| شريط بحث أبيض مدوّر في الأسفل | `form` absolute bottom ✅ | مطابق |
| صف مزايا المنصة (شحن/ثقة/أمان/دعم) | **غائب** | مجمّد بقرار 2026-06-07 |

### ProductTile (marketplace) — `app/page.tsx` lines 88–122

| العنصر في baseline | الحالة في الكود | الحكم |
|-------------------|-----------------|-------|
| صورة المنتج | `img` block ✅ | مطابق |
| شارة "مميز" (featured) | `is_featured` span ✅ | مطابق |
| السعر بـ"ر.س" | `{price.toFixed(0)} ر.س` ✅ | مطابق |
| زر سلة دائري | `rounded-xl` في الكود | ينتظر `product-tile-cart-button-2026-06-14.md` |
| أيقونة قلب (مفضلة) | **غائب** | ينتظر `product-tile-wishlist-2026-06-11.md` |
| شارة "ممول" (رعاية) | **غائب** | مجمّد بقرار 2026-06-07 |

### StoreCard (all stores section) — `components/explore/StoreCard.tsx`

| العنصر في baseline | الحالة في الكود | الحكم |
|-------------------|-----------------|-------|
| بانر خلفية المتجر | `h-32 banner_url` ✅ | مطابق |
| شعار دائري/مربع المتجر | `rounded-xl` logo ✅ | مطابق بصرياً |
| اسم المتجر + وصف + عداد المنتجات | lines 44–70 ✅ | مطابق |
| زر "زيارة المتجر" | **غائب** في StoreCard.tsx | مطابق للتصميم — StoreCard بدون CTA button مخصصة، يُغطيه `store-card-visit-cta-2026-06-13.md` |

### صفحة المتجر الفرعي — `StoreHeader.tsx` (non-compact mode)

| العنصر في baseline | الحالة في الكود | الحكم |
|-------------------|-----------------|-------|
| hero banner متحرك | `store-hero-motion` + أيقونات ✅ | مطابق |
| بطاقة معلومات المتجر العائمة (-mt-8 overlap) | lines 179–226 ✅ | مطابق |
| شعار متجر دائري في البطاقة | `h-16 w-16 rounded-[var(--r)]` ✅ | مطابق |
| اسم المتجر + وصف + هاتف + موقع | lines 191–213 ✅ | مطابق |
| أزرار مشاركة + واتساب + متابعة | `ShareButton + WhatsAppButton + ProfileFollowButton` ✅ | مطابق |
| وسوم ثقة (رياض/موثوق/توصيل سريع) | **غائب** | ينتظر `store-info-trust-badges-2026-06-08.md` |

---

## حالة الفجوات البصرية المستمرة (محدَّث)

| المكوّن | العنصر | الحالة | القرار |
|---------|--------|--------|--------|
| Hero (marketplace) | صف مزايا المنصة | **غائب** | مجمّد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مجمّد 2026-06-07 |
| ProductTile (marketplace) | زر سلة `rounded-full` | `rounded-xl` | ينتظر Cursor — `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب | **غائب** | ينتظر Cursor — `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب | **غائب** | ينتظر Cursor — `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | **غائب** | ينتظر Cursor — `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | **غائب** | مجمّد 2026-06-07 |
| Store pages (mobile) | Sticky Cart Bar | **غائب** | ينتظر Cursor — `sticky-mini-cart-bar-2026-06-15.md` |

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

# تقرير انحراف بصري — baseline-drift-2026-06-27

**تاريخ التشغيل:** 2026-06-27 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**وُجد drift حرج.** كوميتان صدرا اليوم (2026-06-27) أحدثا 4 انحرافات بصرية عن الـ baseline المجمّد (2026-06-07):
ثلاثة في `ProductCard` (صفحات المتاجر الفرعية)، وانحراف رابع في لوحة الألوان الافتراضية للمنصة.

**قرار المرحلة:** drift مانع — **لا تكتمل المرحلتان 2 و3 هذه الجولة.**

---

## الكوميتات المسبِّبة

| الكوميت | التاريخ | الوصف | الملفات المتأثرة |
|---------|---------|-------|-----------------|
| `b95d2b6` | 2026-06-27 | `[codex] add storefront theme tokens` | `styles/globals.css`, `app/[slug]/layout.tsx`, `lib/themes/storefront-tokens.ts` |
| `8b42fda` | 2026-06-27 | `[codex] refactor storefront components to tokens` | `components/product/ProductCard.tsx`, `components/store/StoreHeader.tsx` وآخرين |

---

## تفصيل الانحرافات

### Drift 1 — نسبة الصورة في ProductCard (المتاجر الفرعية)

| الحقل | القيمة |
|-------|--------|
| **المكوّن** | `ProductCard` — صفحات المتاجر الفرعية (`subdomain-store.png`) |
| **الملف + السطر** | `components/product/ProductCard.tsx` — السطر 27 |
| **الكوميت** | `8b42fda` |
| **الحالة في الـ baseline** | `aspect-square` (نسبة 1:1) |
| **الحالة الحالية** | `aspect-[4/5]` (نسبة عمودية — بورتريه) |
| **الوصف البصري** | صور المنتجات في المتاجر الفرعية أصبحت أطول مما هو ظاهر في لقطة الـ baseline. شبكة المنتجات تبدو مختلفة بصرياً — بطاقات أطول وأكثر كثافة. |
| **توصية الاسترجاع** | السطر 27 يعود إلى: `<div className="store-product-card__media relative aspect-square bg-[var(--c-surface-2)]">` |

---

### Drift 2 — شارة "مميز" في ProductCard

| الحقل | القيمة |
|-------|--------|
| **المكوّن** | `ProductCard` — شارة is_featured (`subdomain-store.png`) |
| **الملف + السطر** | `components/product/ProductCard.tsx` — السطر 33 |
| **الكوميت** | `8b42fda` |
| **الحالة في الـ baseline** | `bg-amber-500 text-white rounded-full` (خلفية عنبرية صلبة، نص أبيض، شكل حبة) |
| **الحالة الحالية** | `rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(...var(--c-surface)_88%,...)] text-[var(--c-accent)] backdrop-blur` (شفاف/زجاجي، لون العلامة التجارية) |
| **الوصف البصري** | الشارة تحوّلت من حبة عنبرية صلبة بارزة إلى تأثير زجاجي (frosted glass) خفيف — أقل بروزاً بكثير. |
| **توصية الاسترجاع** | السطر 33 يعود إلى: `<span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">` |

---

### Drift 3 — شارة الخصم في ProductCard

| الحقل | القيمة |
|-------|--------|
| **المكوّن** | `ProductCard` — شارة الخصم (`subdomain-store.png`) |
| **الملف + السطر** | `components/product/ProductCard.tsx` — السطر 38 |
| **الكوميت** | `8b42fda` |
| **الحالة في الـ baseline** | `bg-red-500 text-white rounded-full` (خلفية حمراء صلبة، نص أبيض) |
| **الحالة الحالية** | `bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))] text-[var(--c-sale)]` (خلفية شبه شفافة وردية خفيفة) |
| **الوصف البصري** | شارة الخصم تحوّلت من حمراء صلبة واضحة إلى مؤشر خفيف مكتفٍ بلون النص — أقل حدة بصرياً وأقل جذباً للانتباه. |
| **توصية الاسترجاع** | السطر 38 يعود إلى: `<span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">` |

---

### Drift 4 — لوحة الألوان الافتراضية (globals.css)

| الحقل | القيمة |
|-------|--------|
| **المكوّن** | CSS variables الافتراضية — `StoreCard`، `StoreHeader` وأي مكوّن يستخدم `var(--primary)` / `var(--accent)` / `var(--background)` |
| **الملف** | `styles/globals.css` |
| **الكوميت** | `b95d2b6` |
| **الحالة في الـ baseline** | `--primary: #0f766e` (فيروزي/teal) ، `--accent: #0284c7` (أزرق)، `--background: #fafafa` (أبيض بارد) |
| **الحالة الحالية** | `--primary → var(--c-brand) = #1C3A33` (أخضر داكن/forest)، `--accent → var(--c-accent) = #A8763E` (ذهبي/amber)، `--background → var(--c-bg) = #F3F0EA` (بيج دافئ) |
| **التأثير على marketplace-home.png** | شارة نوع المالك في `StoreCard` تحوّلت من فيروزية إلى أخضر غامق؛ خلفية بعض عناصر الصفحة أصبحت أدفأ لوناً. |
| **التأثير على subdomain-store.png** | هيدر المتجر، روابط التنقل، خلفية الصفحة كلها بلوحة ألوان مختلفة تماماً. يؤثر على المتاجر التي **لا** تمتلك theme مخصصاً. المتاجر ذات الـ theme المخصص تبقى كما هي عبر `StoreThemeApplier`. |
| **ملاحظة** | الأثر على الـ marketplace أقل حدة لأن `app/page.tsx` يستخدم classes Tailwind مباشرة (`bg-emerald-*`, `text-slate-*`) لمعظم عناصره. `StoreCard` فقط هو المتأثر من عناصر الـ marketplace. |
| **توصية الاسترجاع** | استرجاع `:root` في `styles/globals.css` إلى القيم القديمة أو اعتماد الـ baseline الجديد رسمياً عبر PR مخصص. |

---

## حالة الفجوات البصرية المستمرة (من التقارير السابقة)

لا تغيير في الحالة عن آخر تقرير — جميعها ما زالت "تنتظر Cursor":

| المكوّن | العنصر | الـ Spec | الحالة |
|---------|--------|---------|--------|
| ProductTile (marketplace) | شارة «ممول» | — | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | زر سلة دائري | `product-tile-cart-button-2026-06-14.md` | ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب | `product-tile-wishlist-2026-06-11.md` | ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب | `product-card-store-wishlist-2026-06-12.md` | ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | `store-info-trust-badges-2026-06-08.md` | ينتظر Cursor |
| Marketplace footer | StatsBar | — | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | `sticky-mini-cart-bar-2026-06-15.md` | ينتظر Cursor |

---

## الخطوة التالية

يُوصى بأحد خيارين:

**الخيار أ — استرجاع (Revert):**
التراجع عن التغييرات البصرية في `ProductCard.tsx` (الـ drifts 1-3) وفتح PR منفصل يحمل عنوان `baseline-update` للحصول على موافقة محمد الزهراني على لوحة الألوان الجديدة (Drift 4).

**الخيار ب — تجديد الـ baseline:**
اعتبار نظام الـ tokens الجديد تحسيناً مقصوداً، وفتح PR بعنوان `baseline-update` يحمل لقطات شاشة محدثة للمرجعين ويحصل على موافقة محمد الزهراني — ثم تُجمَّد الـ baseline الجديدة.

**في كلا الخيارين:** لا إجراء من هذا الراوت. الراوت يوثّق ولا ينفّذ.

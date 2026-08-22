# تقرير انحراف بصري — baseline-drift-2026-07-14

**تاريخ التشغيل:** 2026-07-14 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد.** الكوميتات السبعة الجديدة منذ الجولة الأخيرة (2026-06-16) تشمل
إعادة هيكلة CSS tokens وإصلاحات storefront — دون مساس بالعقد البصري للمتسوق.

**قرار المرحلة:** لا انحراف مانع → تكملة المرحلتين 2 و3.

---

## الكوميتات الجديدة منذ 2026-06-16

| الكوميت | الوصف | الملف الأبرز | التأثير البصري |
|---------|-------|-------------|----------------|
| `fb4a859` | feat: profile completion fields | `pages/auth/` | تدفق auth — خارج نطاق baseline |
| `9a7dab5` | feat: Google sign-in Socialite redirect | `pages/auth/` | تدفق auth — خارج نطاق baseline |
| `d3ece4c` | feat: Google/Apple sign-in + profile | `pages/auth/` | تدفق auth — خارج نطاق baseline |
| `8b42fda` | [codex] refactor storefront to tokens | `components/store/StoreHeader.tsx`, `ProductCard.tsx` | إعادة هيكلة Tailwind → CSS vars — لا drift بصري |
| `b95d2b6` | [codex] add storefront theme tokens | `components/` | إضافة tokens — لا drift هيكلي |
| `f13b4c1` | fix: drop fake testimonials & newsletter | `components/` (templates) | إزالة محتوى مزوّر من templates — خارج baseline |
| `56ee40c` | fix: drop cart emptied banner | `components/store/StoreChrome.tsx` | إزالة banner مزعج — سلوك لا بصر مرجعي |
| `60fd4bc` | feat: standard legal footer | `components/store/StoreFooter.tsx` | إضافة روابط قانونية في footer — خارج baseline |
| `e65d0a0` | fix: products page discoverable in nav | `app/[slug]/page.tsx` | إضافة تبويب nav — مقبول |
| `09dcbe4` | fix: drop duplicate chrome hero for builders | `app/[slug]/layout.tsx` | compact mode للـ builder — لا يمس non-builder flow |
| `5f7bf39` | fix: remove duplicate advertise banner | `app/page.tsx` | حذف banner مكرر (إصلاح ازدواجية لا حذف ميزة) |

---

## تحليل التغييرات ذات الصلة بالـ baseline

### 1. إعادة هيكلة CSS tokens (8b42fda + b95d2b6)

كافة ألوان المكوّنات انتقلت من Tailwind hardcoded إلى `var(--c-*)`:
- `ProductCard.tsx`: `bg-emerald-100 text-emerald-700` → `bg-[color-mix(in_srgb,var(--c-accent)_12%,...)] text-[var(--c-accent)]`
- `StoreHeader.tsx`: ألوان Hero ورسوم الجسيمات تعتمد على tokens

**التقييم:** تغيير tokenization لا drift بصري. الألوان التركواز/emerald التي يصفها الـ baseline هي القيم الافتراضية لـ `--c-accent` — المظهر النهائي محفوظ.

### 2. حذف banner مكرر من marketplace (5f7bf39)

أزال PR #181 نسخة ثانية مكررة من "أعلن الآن" كانت تظهر بعد قسم المتاجر. الـ baseline الأصلي يصف `AdSlot variant="featured"` في نهاية منتجات (موجود) و`variant="wide"` كشريط عريض (كان مكرراً - أُزيل كتصحيح خطأ). الإزالة مقصودة، لا drift.

### 3. compact mode للـ builder stores (09dcbe4)

`StoreHeader` الآن له mode مختصر (`compact=true`) لمتاجر builder لتجنب hero مكرر. لمتاجر non-builder: Hero + StoreInfoCard تعمل كما في الـ baseline — لا تغيير.

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث — لا تغيير في الحالة منذ 2026-06-16:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة (شحن/ثقة/أمان) | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| Hero (marketplace) | قائمة نطاق البحث ("الكل") | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | شارة «ممول» تركواز | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة (موثوق/توصيل سريع) | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar (15K متجر / مليون منتج / 99.6%) | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| Marketplace header | زر "افتح متجرك مجاناً" للضيوف | **غائب** | محل `home-header-seller-cta-2026-06-16.md` — ينتظر Cursor |

---

## الخطوة التالية

لا تصحيح مطلوب لهذه الجولة. انعدام الـ drift منذ 4 أسابيع يشير لاستقرار بصري. تكتمل المرحلتان 2 و3 وفق الجدول المعتاد.

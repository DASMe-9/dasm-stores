# تقرير انحراف بصري — baseline-drift-2026-08-10

**تاريخ التشغيل:** 2026-08-10 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md`
**قرار المرحلة:** **drift حرج مُكتشَف → لا انتقال للمرحلة 2**

---

## ملخص تنفيذي

اكتُشف **انحراف هيكلي جديد** في بنية الـ Hero للصفحة الرئيسية، ناتج عن
كوميت `013f987` بتاريخ 2026-07-30 ("elevate DASM Stores marketplace homepage").

التغيير أزال `HeroScene` (البطاقة الداكنة مع الجسيمات والأيقونات المعلقة) ونقل
شريط البحث إلى قسم مستقل، ما يُشكّل انحرافاً مزدوجاً عن الـ baseline بصرياً.

اكتُشف أيضاً انحراف غير موثّق سابقاً في `StoreCard` (شكل حاوية الشعار).

---

## الانحرافات الجديدة — مُكتشَفة هذه الجولة

### 1. Hero (marketplace) — إزالة HeroScene وتبديل الخلفية

| البند | التفصيل |
|-------|---------|
| **الملف** | `app/page.tsx` — القسم بأكمله (سطر 452–499) |
| **الـ baseline** | بطاقة داكنة `bg-[#021b1f]` بعرض محدود داخل الصفحة، تحتوي على: جسيمات ضوئية (`home-hero-light-a/b`)، أيقونات منتجات معلقة (`HeroScene`: ShoppingBag, BadgeCheck, Headphones, FlaskConical, ShoppingCart)، شرارات متحركة (`home-hero-spark-a/b/c`) |
| **الحالة الراهنة** | القسم أصبح شريطاً عريضاً بعرض الصفحة بخلفية **فاتحة** `bg-[#eaf2f1]` (light) / `dark:bg-[#081c2c]` (dark). `HeroScene` أُزيل كلياً. الجانب الأيمن أصبح `CommercePassport` (ويدجت جديد) |
| **متى تغيّر** | كوميت `013f987` — 2026-07-30، ثم `2a9372c` — 2026-07-30 |
| **توصية الاسترجاع** | استعادة الـ `HeroScene` function (سطور 74–92 في الكوميت قبل `013f987`) وإعادة لف الـ hero section بـ `rounded-3xl overflow-hidden bg-[#021b1f]`. **ملاحظة:** قبل التنفيذ، تحقق مع الفريق إن كانت الـ elevation قرار تصميمي مُعتمد يستوجب تحديث الـ baseline بدلاً من الاسترجاع. |

---

### 2. Hero (marketplace) — شريط البحث انتقل خارج الـ Hero

| البند | التفصيل |
|-------|---------|
| **الملف** | `app/page.tsx` — سطر 501–529 |
| **الـ baseline** | شريط البحث `position: absolute` داخل بطاقة الـ Hero (في الجزء السفلي منها، `inset-x-5 bottom-7`) |
| **الحالة الراهنة** | شريط البحث في قسم مستقل خارج الـ hero تماماً، بخلفية `bg-[#f4f0e8]` بين الـ hero وقسم المنتجات |
| **متى تغيّر** | كوميت `013f987` — 2026-07-30 |
| **توصية الاسترجاع** | إعادة نقل `<form action="/">` داخل `<section data-testid="platform-hero">` وضبطه `absolute` في أسفل الـ hero card. **تحفّظ:** إذا كان فصل البحث قراراً UX مقصوداً، يُحدَّث الـ baseline |

---

### 3. Hero (marketplace) — CommercePassport widget جديد (غير موجود في الـ baseline)

| البند | التفصيل |
|-------|---------|
| **الملف** | `app/page.tsx` — function `CommercePassport` سطر 276–332، استخدام في سطر 497 |
| **الـ baseline** | لا يوجد ويدجت في الجانب الأيمن من الـ hero في الـ baseline |
| **الحالة الراهنة** | بطاقة "DASM COMMERCE PASSPORT" تعرض مراحل نمو المتجر وعداد المتاجر، تملأ الجانب الأيمن في layout شبكي `lg:grid-cols-[1.05fr_.95fr]` |
| **متى تغيّر** | كوميت `013f987` — 2026-07-30 |
| **توصية الاسترجاع** | إزالة `CommercePassport` من الـ hero عند الاسترجاع. أو تحديث الـ baseline إن اعتُمد التصميم الجديد |

---

### 4. StoreCard — حاوية الشعار مستطيلة لا دائرية [انحراف غير موثّق سابقاً]

| البند | التفصيل |
|-------|---------|
| **الملف** | `components/explore/StoreCard.tsx` — سطر 35 |
| **الـ baseline** | "أيقونة/شعار دائري على يمين البطاقة في تخطيط RTL" |
| **الحالة الراهنة** | `<div className="mb-2 flex h-14 w-14 ... rounded-xl border-2 ...">` — مستطيل بزوايا دائرية `rounded-xl`، لا `rounded-full` |
| **متى تغيّر** | غير محدد (لم يُوثَّق في الجولات السابقة — على الأرجح موجود منذ البداية) |
| **توصية الاسترجاع** | في سطر 35: استبدال `rounded-xl` بـ `rounded-full`. الكود المستهدف: `className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--card)] bg-[var(--card)] shadow"` |

---

## حالة الفجوات البصرية المستمرة — مُحدَّثة

جدول محدَّث من التقرير السابق:

| المكوّن | العنصر | الحالة في الكود | الحالة |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة (شحن/ثقة/أمان/دعم) | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| Hero (marketplace) | HeroScene (جسيمات + أيقونات معلقة) | **غائب** → كان موجوداً، أُزيل 013f987 | **جديد ← يتطلب قرار فريق** |
| Hero (marketplace) | شريط البحث داخل الـ Hero | **منقول** خارج الـ hero | **جديد ← يتطلب قرار فريق** |
| Hero (marketplace) | CommercePassport (عنصر جديد) | **موجود** — غير في الـ baseline | **جديد ← يتطلب قرار فريق** |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود، سطر 236 | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreCard (all-stores grid) | شعار دائري | `rounded-xl` (StoreCard.tsx:35) | **جديد** (غير موثّق) — ينتظر spec |
| StoreInfoCard (store subdomain) | وسوم ثقة (موثوق/توصيل سريع) | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| StoreInfoCard (store subdomain) | زر سلة أساسي | **غائب** (ShareButton, WhatsApp, Follow موجودة) | لم يُوثَّق سابقاً — يُضاف للـ backlog |
| Marketplace footer | StatsBar (15,000 متجر / +1 مليون / 99.6% رضا) | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## ملاحظة: Spec مُنجَز منذ آخر جولة

- `home-header-seller-cta-2026-06-16.md` → **مُنفَّذ** في كوميت `013f987`:
  زر "افتح متجرك" ظاهر الآن في `HomeHeaderActions.tsx` (سطر 140–145) للمستخدم الضيف ✓

---

## قرار المرحلة

انتقال المرحلة 2 (استخبارات المنافسين) **متوقف** لحين قرار الفريق:

1. هل تعيد Cursor تطبيق HeroScene القديمة وشريط البحث الداخلي؟ أم
2. هل تعتمد هذا التصميم رسمياً وتُحدِّث `docs/design/baseline/marketplace-home.png`؟

للمراجعة المرئية: الـ baseline في `docs/design/baseline/marketplace-home.png` لا يتطابق
مع الحالة الراهنة في الكود. أولوية التحديث لهذا الـ baseline أو استرجاع الكود — قرار فريق.

---

## الملفات المرجعية

- `git show 013f987^:app/page.tsx` — نسخة ما قبل التعديل
- `app/page.tsx` — النسخة الراهنة (817 سطر)
- `components/explore/StoreCard.tsx` — سطر 35 (logo shape)
- `components/store/StoreHeader.tsx` — subdomain hero (متطابق مع baseline ✓ باستثناء وسوم الثقة)

# تقرير انحراف بصري — baseline-drift-2026-08-18

**تاريخ التشغيل:** 2026-08-18 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**تم رصد 4 انحرافات بصرية جديدة** ناتجة عن commit `013f987` (2026-07-30) "elevate DASM Stores marketplace homepage".
هذه الانحرافات حرجة لأنها تمس المكوّنات الجوهرية في الـ baseline: الـ Hero وبطاقة المنتج.

**قرار المرحلة:** يوجد drift جديد → لا تكتمل المرحلة 3 (توليد spec) هذه الجولة.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `013f987` | 2026-07-30 | elevate DASM Stores marketplace homepage | `app/page.tsx` | ✅ حرج — يُفصّل أدناه |
| `f48a3f3` | 2026-07-30 | Merge PR #271 | — | merge فقط |
| `2a9372c` | 2026-07-30 | fix homepage light and dark theme coverage | `app/page.tsx` | تعديل ألوان dark/light |
| `8b42fda` | 2026-06-27 | refactor storefront components to tokens | `styles/globals.css`, layouts | توكينز — لا drift بنيوي |
| `b16dbb8` | 2026-06-30 | feat(onboarding): collect name + optional password | `pages/auth/…` | تدفق مصادقة — خارج نطاق baseline |
| `9a7dab5` | 2026-06-29 | feat(auth): migrate Google sign-in | `pages/auth/…` | خارج نطاق baseline |
| `fd402fd` | 2026-07-26 | fix: harden storefront conversion tracking | `components/store/…` | تتبع — لا تأثير بصري |
| `4edbdeb` | 2026-07-29 | feat(ads): نتائج الإعلانات في لوحة التاجر | `pages/dashboard/…` | خارج نطاق baseline |
| `93972b7` | 2026-08-13 | feat(stores): add governed growth assistant workspace | `components/…` | خارج نطاق baseline |

---

## الانحرافات الجديدة

### Drift 1 — Hero (marketplace): إزالة HeroScene (صور المنتجات الثلاثية الأبعاد)

| البند | القيمة |
|-------|--------|
| الملف | `app/page.tsx` |
| قبل (commit `147dc17`) | مكوّن `HeroScene` يعرض أيقونات منتجات عائمة متحركة (ShoppingBag، Headphones، FlaskConical، BadgeCheck، ShoppingCart) داخل Hero بخلفية داكنة `bg-[#021b1f]` |
| بعد (commit `013f987`) | مكوّن `CommercePassport` موجّه للتجار داخل Hero — لا صور منتجات عائمة |
| مرجع baseline | "صور منتجات/أغراض معلقة ثلاثية الأبعاد" في وصف Hero marketplace |
| توصية الاسترجاع | إعادة `HeroScene` إلى جانب الـ `CommercePassport` أو نسخة من الأنيماشن في العمود الأيسر (السطر ~497 في `app/page.tsx`) |

---

### Drift 2 — Hero (marketplace): نقل شريط البحث خارج الـ Hero

| البند | القيمة |
|-------|--------|
| الملف | `app/page.tsx` |
| قبل | شريط البحث مضمّن داخل قسم الـ Hero (`absolute` في أسفله، `rounded-full`) |
| بعد | `<section>` منفصل بخلفية `bg-[#f4f0e8]` بعد الـ Hero (السطور 501–529) |
| مرجع baseline | "حقل بحث أبيض كبير مع قائمة نطاق" كعنصر داخل الـ Hero |
| توصية الاسترجاع | نقل `<form>` البحث إلى داخل قسم `platform-hero` (السطر ~453) في أسفله، بدلاً من قسم مستقل |

---

### Drift 3 — Hero (marketplace): تغيير لون الخلفية في الوضع الفاتح

| البند | القيمة |
|-------|--------|
| الملف | `app/page.tsx`، السطر 453 |
| قبل | `bg-[#021b1f]` (داكن دائماً — يطابق baseline "شريط علوي داكن") |
| بعد | `bg-[#eaf2f1]` في light mode / `bg-[#081c2c]` في dark mode |
| مرجع baseline | "شريط علوي داكن بعرض الصفحة، تدرج تركواز/سائل" |
| توصية الاسترجاع | استخدام خلفية داكنة دائمة في Hero (مثل `bg-[#021b1f]` أو `dark:bg-[#081c2c]` مع `bg-[#021b1f]` للـ light) أو إضافة كلاس `dark` يجبر الوضع الداكن داخل قسم Hero |

---

### Drift 4 — ProductTile (marketplace): تغيير أيقونة زر الإجراء من ShoppingCart إلى ArrowLeft

| البند | القيمة |
|-------|--------|
| الملف | `app/page.tsx`، السطر 235–243 |
| قبل | `<ShoppingCart>` (أيقونة سلة)، ينتقل إلى `/${storeSlug}/cart` — دلالة "إضافة/عرض السلة" |
| بعد | `<ArrowLeft>` (سهم يسار)، ينتقل إلى صفحة المنتج `/products/{id}` — دلالة "عرض المنتج" |
| مرجع baseline | "زر سلة صغير" (أيقونة سلة) في بطاقة المنتج |
| ملاحظة | زر `rounded-xl` (لا يزال غير مطابق لـ `rounded-full` في الـ baseline — drift سابق موثّق في spec `product-tile-cart-button-2026-06-14.md`) |
| توصية الاسترجاع | استبدال `ArrowLeft` بـ `ShoppingCart` وتوجيه الإجراء نحو إضافة المنتج للسلة (السطر 235–243 في `app/page.tsx`) — تكاملاً مع spec `product-tile-cart-button-2026-06-14.md` |

---

## حالة الفجوات البصرية المستمرة (من التقارير السابقة)

| المكوّن | العنصر | الحالة | القرار |
|---------|--------|--------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` | محل spec `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل spec `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل spec `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | محل spec `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل spec `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## الصفحة الفرعية (subdomain store)

لا drift جديد. الفجوات الموثّقة سابقاً (trust badges، sticky cart bar، product wishlist) لا تزال على حالها.
الـ StoreHeader لا يزال يحتوي على hero banner مع scene متحركة ومكوّن StoreInfoCard مع الشعار والوصف والمنطقة والهاتف — لكن بدون وسوم الثقة وبدون زر CTA أساسي للسلة.

---

## الخطوة التالية

يجب على Cursor معالجة Drift 4 (**أيقونة زر الإجراء**) وتنسيقها مع spec `product-tile-cart-button-2026-06-14.md` الموجودة، ثم Drift 1–3 بالترتيب الأعلى أثراً.
لا spec جديد يُنشأ هذه الجولة بسبب وجود drift جديد.

# تقرير انحراف بصري — baseline-drift-2026-08-11

**تاريخ التشغيل:** 2026-08-11 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد آنذاك)

---

## ملخص تنفيذي

**تم رصد drift جديد موثوق.** كوميت `013f987` (2026-07-30) أعاد كتابة `app/page.tsx` بشكل جذري
(778+ سطراً) وأحدث ثلاثة انحرافات بصرية عن الـ baseline، أبرزها **استبدال زر السلة في
ProductTile بزر تنقل ArrowLeft** — وهو تراجع عن الحالة الموثقة في التقرير السابق.

**قرار المرحلة: يوجد drift مانع → توقف عند المرحلة 1. لا تكملة للمرحلتين 2 و3.**

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملفات المتأثرة |
|---------|---------|-------|-----------------|
| `013f987` | 2026-07-30 | elevate DASM Stores marketplace homepage | `app/page.tsx` (+778 سطر)، `components/home/HomeHeaderActions.tsx`، `lib/seo.ts` |
| `2a9372c` | 2026-07-30 | fix homepage light and dark theme coverage | `app/page.tsx` (55 سطر معدّلة) |
| `4edbdeb` | 2026-07 | feat(ads): صفحة نتائج الإعلانات في لوحة التاجر | `components/ads/AdBanner.tsx` — خارج نطاق baseline |
| `ce5e8e2` | 2026-08-03 | fix(copy): تعديل نصوص تسويقية فقط | `components/ads/AdBanner.tsx`، `pages/auth/login.tsx` — خارج نطاق baseline |

---

## الانحرافات البصرية الجديدة

### 1. ProductTile (marketplace) — زر السلة استُبدل بزر تنقل ArrowLeft ⚠️ أعلى خطورة

| البند | القيمة |
|-------|--------|
| **الملف** | `app/page.tsx` |
| **السطر** | 235–243 |
| **الكوميت** | `013f987` (2026-07-30) |
| **حالة الـ baseline** | "زر سلة صغير" — ShoppingCart icon |
| **حالة التقرير السابق (2026-06-16)** | زر `rounded-xl` (ShoppingCart مفترض) موثق في spec `product-tile-cart-button-2026-06-14.md` |
| **الحالة الراهنة** | `<Link>` بأيقونة `<ArrowLeft>` وـ`aria-label="عرض {product.name}"` — ليس زر سلة على الإطلاق |

**الوصف البصري للتغيير:** الزر الدائري على يسار بطاقة المنتج في صفحة الـ marketplace كان يفترض أن يكون سلة تسوق (baseline: ShoppingCart)؛ كان في التقرير السابق `rounded-xl` ينتظر تعديل spec. الكوميت `013f987` أبدله تماماً بـ ArrowLeft — رابط تنقل لصفحة المنتج، لا إضافة للسلة. هذا تراجع عن الحالة السابقة.

**توصية الاسترجاع (كتوصية فقط):**
```tsx
// السطر 237 الحالي:
className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ..."
<ArrowLeft className="h-4 w-4" />

// التوصية (يُعدَّل من قبل Cursor بناءً على spec product-tile-cart-button-2026-06-14.md):
className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-700 ..."
<ShoppingCart className="h-4 w-4" />
```
الـ spec الحالي يغطي هذا الملف. يُحدَّث `product-tile-cart-button-2026-06-14.md` ليعكس
أن الزر أصبح ArrowLeft لا ShoppingCart، وأن التوصية تشمل استبدال الأيقونة أيضاً.

---

### 2. Hero (marketplace) — بطاقة CommercePassport تحلّ محلّ المحتوى البصري في يمين الـ hero

| البند | القيمة |
|-------|--------|
| **الملف** | `app/page.tsx` |
| **السطر** | 277–332 (مكوّن `CommercePassport`) + 497 (الاستخدام في الـ hero) |
| **الكوميت** | `013f987` (2026-07-30) |
| **حالة الـ baseline** | جانب يمين الـ hero = صور منتجات ثلاثية الأبعاد مع تأثيرات بصرية |
| **الحالة الراهنة** | بطاقة "DASM COMMERCE PASSPORT" مع 5 خطوات تاجر وعداد متاجر |

**الوصف البصري للتغيير:** بطاقة مصمَّمة بحدود وظل وتدرجات تعرض "جواز نمو المتجر" —
مسار تاجر من 5 خطوات (هوية المتجر، الكتالوج، إعداد الدفع، الشحن، الوصول للعميل) + عداد رقمي
للمتاجر. هذا العنصر لم يكن في الـ baseline ويختلف بصرياً عن أسلوب "3D product showcase"
المعتمد.

**توصية:** هذا تغيير بصري جوهري يتجاوز التحسينات الثانوية. إما:
1. تحديث الـ baseline رسمياً (PR منفصل "baseline-update" بموافقة محمد الزهراني)
2. أو الإبقاء على العنصر بعد مراجعة المالك وتعديل الـ `components-inventory.md` ليعكس
   النمط الجديد (CommercePassport بدل 3D products)

---

### 3. Hero (marketplace) — شريط البحث انتقل إلى قسم مستقل خارج الـ hero

| البند | القيمة |
|-------|--------|
| **الملف** | `app/page.tsx` |
| **السطر** | 501–529 (`<section>` البحث المستقل) |
| **الكوميت** | `013f987` (2026-07-30) |
| **حالة الـ baseline** | "حقل بحث أبيض كبير مع قائمة نطاق" داخل قسم الـ hero |
| **الحالة الراهنة** | شريط بحث في `<section>` مستقلة بخلفية `bg-[#f4f0e8]` بعد الـ hero مباشرة |

**الوصف البصري للتغيير:** في الـ baseline، البحث جزء مدمج من الـ hero السينمائي.
حالياً البحث في شريط خاص به بخلفية بيضاء/كريمية خارج الـ hero. البنية أصبحت:
`[hero] → [search section] → [products] → [stores]` بدلاً من `[hero + search] → [products] → [stores]`.

**توصية:** مقبول وظيفياً (البحث موجود ومرئي)، لكنه يُخالف الـ baseline بصرياً.
يُعرض على المالك مع الانحراف رقم 2 لقرار واحد: هل يُحدَّث الـ baseline أم يُرجع البحث للـ hero؟

---

## حالة الفجوات البصرية المستمرة من التقارير السابقة

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة | **ArrowLeft (تراجع!)** | موثق أعلاه — drift جديد |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| Hero (marketplace) | CommercePassport card | **جديد — غير في الـ baseline** | موثق أعلاه — drift جديد |
| Hero (marketplace) | شريط البحث خارج الـ hero | **جديد** | موثق أعلاه — drift جديد |

---

## ملاحظة إيجابية — Spec مُنفَّذ

كوميت `013f987` نفّذ spec `home-header-seller-cta-2026-06-16.md`:
- زر "افتح متجرك" الآن موجود في `components/home/HomeHeaderActions.tsx` (السطر 140–144)
  لحالة الضيف غير المسجل
- الفرق الطفيف مع الـ spec: يظهر على `md+` (لا `sm+`) وله أيقونة `<Store>`
- هذا يُوثَّق كإنجاز، لا كـ drift

---

## الخطوة التالية

1. **مراجعة الانحرافات الثلاثة مع المالك** (محمد الزهراني):
   - قرار واحد مطلوب: تحديث الـ baseline رسمياً بـ PR "baseline-update" لتعكس
     CommercePassport + search-section، أو الرجوع إلى الـ baseline الحالي
2. **تحديث spec `product-tile-cart-button-2026-06-14.md`** بأن الزر صار ArrowLeft لا ShoppingCart،
   وأن التوصية تشمل الأيقونة والـ class معاً
3. **الجولة القادمة (2026-08-18):** تُستأنف المرحلتان 2 و3 بعد وضوح قرار الـ baseline

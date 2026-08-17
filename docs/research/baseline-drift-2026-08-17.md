# تقرير انحراف بصري — baseline-drift-2026-08-17

**تاريخ التشغيل:** 2026-08-17 (أحد — الجولة الأسبوعية)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift — آخر جولة)

---

## ملخص تنفيذي

**⛔ drift حرج مانع — لا تُكمل المرحلة 3 (spec).**

كوميت `013f987` (2026-07-30) بعنوان "elevate DASM Stores marketplace homepage" أجرى إعادة هيكلة كاملة لـ Hero section في `app/page.tsx` — 778 سطراً مضافاً — بحيث انحرفت الصفحة الرئيسية بصرياً عن الـ baseline على خمسة محاور حرجة في آنٍ واحد.

**قرار المرحلة:** drift حرج مُوثَّق → يُوقف توليد spec في المرحلة 3. تكتمل المرحلة 2 فقط.

---

## الكوميتات المؤثرة منذ آخر جولة (2026-06-16)

| الكوميت | التاريخ | الوصف | التأثير البصري |
|---------|---------|-------|----------------|
| `013f987` | 2026-07-30 | elevate DASM Stores marketplace homepage | **حرج** — أعاد كتابة Hero بالكامل |
| `2a9372c` | 2026-07-30 | fix homepage light and dark theme coverage | مكمّل لـ `013f987`، يُثبّت الألوان في الوضع الداكن |
| `4edbdeb` | ~2026-08 | feat(ads): صفحة نتائج الإعلانات لوحة التاجر | لوحة تحكم بائع — خارج نطاق baseline |
| `ce5e8e2` | ~2026-08 | fix(copy): promise only what the platform can prove | تعديل نصي فقط |

---

## الانحرافات المكتشفة — تفصيل

### ① خلفية Hero — تغيير جذري

| | الـ baseline | الكود الحالي |
|--|-------------|-------------|
| **لون الخلفية** | `bg-[#021b1f]` (داكن — أسود-أخضر) داخل بطاقة `rounded-3xl` | `bg-[#eaf2f1]` (فاتح — أخضر فاتح جداً) نمط full-width |
| **الوضع الداكن** | اللون الداكن هو الأصل (واجهة واحدة) | `dark:bg-[#081c2c]` |
| **الشكل** | بطاقة `rounded-3xl` بظل `shadow-2xl` | قسم full-width بلا حواف مدورة |

**الملف والسطر:** `app/page.tsx` السطر 452-453 (الحالي)

**توصية الاسترجاع (كتوصية — لا تنفّذها):**
السطر 452 يصبح:
```
<section className="px-4 pt-4">
  <div className="relative mx-auto min-h-[280px] max-w-6xl overflow-hidden rounded-3xl bg-[#021b1f] px-5 py-8 text-white shadow-2xl shadow-emerald-950/20 md:min-h-[295px] md:px-10 md:py-10">
```

---

### ② عنوان Hero — قُلب المفهوم

| | الـ baseline | الكود الحالي |
|--|-------------|-------------|
| **العنوان الرئيسي** | "اكتشف متاجر ومنتجات داسم" | "من متجر سعودي مستقل، إلى سوق أكبر." |
| **العنوان الفرعي** | "كل المتاجر والمنتجات في واجهة واحدة" | نص تسويقي مطوّل عن "منظومة داسم" |
| **الـ data-testid** | (لا يوجد) | `data-testid="platform-hero"` |

**الملف والسطر:** `app/page.tsx` السطر 462-470 (الحالي)

**توصية الاسترجاع:**
```
<h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
  اكتشف متاجر ومنتجات داسم
</h1>
<p className="mt-3 text-base text-emerald-50/80 md:text-lg">
  كل المتاجر والمنتجات في واجهة واحدة
</p>
```

---

### ③ شريط البحث — نُقل خارج الـ Hero

| | الـ baseline | الكود الحالي |
|--|-------------|-------------|
| **الموضع** | داخل بطاقة الـ Hero — أسفلها (`position: absolute`) | `<section>` مستقلة بخلفية `bg-[#f4f0e8]` خارج Hero |
| **شكل الزر** | `rounded-full` (دائري تماماً) — `bg-slate-950` | `rounded-xl` (ناعم) — `bg-[#081c2c]` |
| **الخلفية المحيطة** | داخل الـ Hero الداكنة — تباين عالٍ | خلفية بيضاء-بيج منفصلة — تباين منخفض |

**الملف والسطر:** `app/page.tsx` السطر 501-529 (الحالي) — يجب إعادته داخل hero `<div>`.

**توصية الاسترجاع:**
```jsx
{/* داخل بطاقة hero، أسفلها */}
<form action="/" className="absolute inset-x-5 bottom-7 z-10 mx-auto flex max-w-xl items-center gap-3 rounded-full bg-white dark:bg-zinc-800 p-2 shadow-xl md:bottom-8">
  <Search className="mr-4 h-5 w-5 text-slate-500 dark:text-zinc-400" />
  <input name="q" ... className="..." />
  <button className="rounded-full bg-slate-950 dark:bg-zinc-700 px-5 py-3 ...">بحث</button>
</form>
```

---

### ④ HeroScene (الحركة التوضيحية) — حُذفت كلياً

| | الـ baseline | الكود الحالي |
|--|-------------|-------------|
| **العنصر** | مجموعة أيقونات عائمة حول الـ hero: ShoppingBag، BadgeCheck، Headphones، FlaskConical، ShoppingCart — مع `home-hero-spark` | لا يوجد — استُبدلت بـ `<CommercePassport>` |
| **الأثر البصري** | ديناميكية وحيوية تعكس تنوع المنتجات | ويدجت ثابت "جواز نمو المتجر" |

**الملف والسطر:** `app/page.tsx` — `HeroScene` كانت كمكوّن مستقل (حُذف بالكامل)

**توصية الاسترجاع:**
استعادة `<HeroScene />` داخل بطاقة الـ Hero (مكوّن مستقل بـ CSS `home-hero-*`). `CommercePassport` قيّم كعنصر إضافي خارج الـ hero لكنه لا يحلّ محلّ الـ scene البصرية.

---

### ⑤ StoreAdSlot في الـ Hero — أُزيل من موضعه

| | الـ baseline | الكود الحالي |
|--|-------------|-------------|
| **الموضع** | داخل Hero: `<StoreAdSlot slotKey="store.home.banner" variant="hero" />` | خارج Hero في قسم المنتجات: `variant="card"` |
| **العرض التقديري** | شريط إعلان كامل العرض داخل الـ Hero مع زر "أعلن الآن" | بطاقة إعلان متوسطة في منتصف صفحة المنتجات |
| **الدلالة البصرية** | "مساحة إعلان رئيسية" — ظاهرة وبارزة فوق المحتوى | مخفية بين المنتجات — تأثير تجاري أقل |

**الملف والسطر:** `app/page.tsx` السطر 617-621 (الحالي)

**توصية الاسترجاع:**
إعادة `<StoreAdSlot slotKey="store.home.banner" variant="hero" />` داخل بطاقة الـ hero، مع إبقاء أو إزالة `variant="card"` في قسم المنتجات حسب قرار تصميمي.

---

## حالة الفجوات البصرية المستمرة (من التقارير السابقة)

| المكوّن | العنصر | الحالة | الملف |
|---------|--------|--------|-------|
| ProductTile | زر سلة دائري | `rounded-xl` + ArrowLeft بدلاً من `rounded-full` + cart | `app/page.tsx` |
| ProductTile | أيقونة قلب (wishlist) | غائب | `app/page.tsx` |
| ProductCard (متاجر) | أيقونة قلب | غائب | `components/product/ProductCard.tsx` |
| ProductCard | "ممول" badge | غائب — مقبول بقرار التجميد | — |
| Marketplace footer | StatsBar | غائب — مقبول بقرار التجميد | — |
| Store (موبايل) | Sticky Cart Bar | غائب | spec: `sticky-mini-cart-bar-2026-06-15.md` |
| StoreInfoCard | وسوم ثقة | غائب | spec: `store-info-trust-badges-2026-06-08.md` |

*(لا جديد على هذه الفجوات — تنتظر Cursor)*

---

## الخطوة التالية

- **Cursor** — المهمة الحرجة: استعادة Hero إلى baseline داكن (النقاط ①②③④⑤ أعلاه).
- **تجميد المرحلة 3** لهذه الجولة: لن يُولَّد spec جديد حتى يُعالَج الـ drift الحرج.
- الجولة القادمة: إن تمّت الاستعادة → تُكمَل المراحل 2 و3 بشكل طبيعي.

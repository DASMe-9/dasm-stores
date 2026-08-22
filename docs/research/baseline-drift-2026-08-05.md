# تقرير انحراف بصري — baseline-drift-2026-08-05

**تاريخ التشغيل:** 2026-08-05 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

**وُجد drift جديد.** كوميتان أثّرا في `app/page.tsx` منذ الجولة الأخيرة:
- `013f987` — elevate DASM Stores marketplace homepage
- `2a9372c` — fix homepage light and dark theme coverage

تم رصد انحرافين بصريين جديدين لم يُوثَّقا في التقارير السابقة.

**قرار المرحلة: drift موجود → وقف قبل المرحلة 3 (لا spec هذه الجولة).**

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | الوصف | الملفات المتأثرة | التأثير البصري |
|---------|-------|-----------------|----------------|
| `013f987` | elevate DASM Stores marketplace homepage | `app/page.tsx` | **عالي** — بنية Hero و ProductTile تغيّرت |
| `2a9372c` | fix homepage light and dark theme coverage | `app/page.tsx` | تغطية ثيم — متابعة |
| `4edbdeb` | feat(ads): صفحة نتائج الإعلانات | لوحة تحكم بائع | خارج نطاق baseline |
| `aee89fd` | fix(stores): supplier catalog filters | لوحة تحكم بائع | خارج نطاق baseline |
| `ce5e8e2` | fix(copy): promise only what the platform can prove | `app/page.tsx` | نص — لا تأثير بنيوي |

---

## الانحرافات البصرية الجديدة

### 1. ProductTile: أيقونة الزر تحوّلت من ShoppingCart إلى ArrowLeft

| الحقل | التفصيل |
|-------|---------|
| **المكوّن** | `ProductTile` (inline في `app/page.tsx`) |
| **الملف + السطر** | `app/page.tsx:237` |
| **الحالة في baseline** | "زر سلة صغير" — أيقونة عربة تسوق فوق الصورة أو في ركن البطاقة |
| **الحالة في التقرير السابق (06-14)** | أيقونة `ShoppingCart` موجودة لكن `rounded-xl` بدلاً من `rounded-full` — موثّق في `product-tile-cart-button-2026-06-14.md` |
| **الحالة الراهنة في الكود** | `<ArrowLeft className="h-4 w-4" />` داخل `<Link href={productHref}>` — رابط تصفح للمنتج فقط، لا إجراء سلة |
| **متى تغيّر** | commit `013f987` — elevate marketplace homepage |
| **الخطورة** | عالية — الانحراف أعمق مما كان مُتتبَّعاً؛ الـ spec القائم يفترض وجود أيقونة سلة |
| **توصية الاستجاع** | السطر 237: استبدال `<ArrowLeft className="h-4 w-4" />` بـ `<ShoppingCart className="h-4 w-4" />` + تحويل الـ `<Link>` إلى زر `onClick` يضيف للسلة + تطبيق `rounded-full` |

**الكود الحالي (app/page.tsx:235-242):**
```tsx
<Link
  href={productHref}
  className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition hover:bg-emerald-600 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-300"
  aria-label={`عرض ${product.name}`}
>
  <ArrowLeft className="h-4 w-4" />
</Link>
```

**يصبح (توصية فقط، لا تنفيذ):**
```tsx
<button
  className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-700 transition hover:bg-emerald-600 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-300"
  aria-label={`أضف ${product.name} للسلة`}
  onClick={/* addToCart(product) */}
>
  <ShoppingCart className="h-4 w-4" />
</button>
```

---

### 2. Hero: العمود الأيمن أصبح CommercePassport بدلاً من المحتوى البصري

| الحقل | التفصيل |
|-------|---------|
| **المكوّن** | Hero — `section[data-testid="platform-hero"]` في `app/page.tsx` |
| **الملف + السطر** | `app/page.tsx:497` (`<CommercePassport storeCount={paginator.total} />`) |
| **الحالة في baseline** | العمود الأيمن في الـ hero: "صور منتجات/أغراض معلقة ثلاثية الأبعاد" — تجربة بصرية سينمائية |
| **الحالة السابقة (قرار التجميد 06-07)** | المحتوى ثلاثي الأبعاد غائب — مقبول مؤقتاً |
| **الحالة الراهنة في الكود** | `<CommercePassport>` — بطاقة جواز المتجر بخطوات التأهيل الخمس وعدداد المتاجر الحي |
| **متى تغيّر** | commit `013f987` — elevate marketplace homepage |
| **الخطورة** | متوسطة — تغيير وظيفي متعمّد (يبدو) لكنه ينحرف عن العقد البصري المُجمَّد |
| **توصية** | **لا استرجاع — قرار مطلوب:** هل تُحدَّث الـ baseline لتعكس توجه CommercePassport؟ يحتاج PR مستقل من مالك المنتج |

---

## حالة الفجوات البصرية المستمرة (محدَّثة)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| **ProductTile (marketplace)** | **زر سلة دائري** | **ArrowLeft بدلاً من ShoppingCart** | **جديد 2026-08-05 — يُعيق `product-tile-cart-button-2026-06-14.md`** |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor — `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor — `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | **غائب** | ينتظر Cursor — `store-info-trust-badges-2026-06-08.md` |
| StoreCard | زر «زيارة المتجر» | **غائب في StoreCard** | ينتظر Cursor — `store-card-visit-cta-2026-06-13.md` |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | ينتظر Cursor — `sticky-mini-cart-bar-2026-06-15.md` |
| **Hero (marketplace)** | **CommercePassport يحل محل 3D** | **جديد 2026-08-05** | **قرار مالك المنتج مطلوب — هل يُحدَّث baseline؟** |

---

## الإجراء المطلوب

1. **فوري:** مراجعة `product-tile-cart-button-2026-06-14.md` — تحديث الـ spec ليعكس أن أيقونة السلة مفقودة كلياً (ليس فقط border-radius خاطئة).
2. **قريب:** قرار مالك المنتج حول CommercePassport في Hero — هل يستمر؟ إن نعم → PR لتحديث `docs/design/baseline/`.
3. **الجولة القادمة:** لا spec يُولَّد هذه الجولة. تُستأنف المرحلة 3 بعد حل الانحراف أو قرار baseline.

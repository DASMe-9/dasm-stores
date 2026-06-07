# تقرير انحراف بصري — baseline-drift-2026-06-05

**تاريخ التشغيل:** 2026-06-05  
**مرجع الـ baseline:** `docs/design/baseline/screenshots/marketplace-home.png` و `subdomain-store.png`  
**المسار الفعلي للصور:** `docs/design/baseline/screenshots/` (وليس `docs/design/baseline/` مباشرة — ملاحظة للصيانة)

---

## ملخص تنفيذي

وُجد **6 انحرافات بصرية** عن الـ baseline الرسمي. أعلاها أثراً:
- شريط الإحصائيات (StatsBar) غائب كلياً عن الصفحة الرئيسية
- صف مزايا الـ Hero (trust badges) غائب
- زر المفضلة (heart) مفقود من بطاقات المنتج في السوق والمتجر الفرعي

وفق قواعد الحارس: لا تُكمل المرحلة 2 (منافسين) حتى يُعالج هذا التقرير.

---

## الانحراف 1 — Hero: صف مزايا المنصة مفقود

**الأولوية:** 🔴 عالية  
**الملف:** `app/page.tsx` — السطر 156 (داخل قسم `<section>` الـ hero)  
**المكوّن:** Hero (marketplace)

**الـ baseline يُظهر:**  
صف أفقي أسفل حقل البحث بأربعة عناصر: «شحن سريع» / «متاجر موثوقة» / «تجربة شراء آمنة» / «دعم 24/7» — كل عنصر بأيقونة وتسمية نصية.  
(موثّق في `docs/design/baseline/components-inventory.md` — سطر 9: «وتحته صف أيقونات قصيرة لمزايا المنصة»)

**الوضع الراهن:**  
الـ hero ينتهي بحقل البحث مباشرة. لا صف مزايا. الكود النافذ (السطر 156):
```
<form action="/" className="absolute inset-x-5 bottom-7 z-10 ...">
  <Search .../>
  <input name="q" ... />
  <button ...>بحث</button>
</form>
```
لا يوجد عنصر بعد الـ form داخل الـ hero.

**متى تغيّر تقريباً:**  
commit `3a1c699` — `fix(stores): compact home banner and wire hero ad slot`  
هذا الـ commit "ضغط" الـ hero ويُرجَّح أنه حذف الصف عند إعادة الهيكلة.

**توصية الاسترجاع:**  
أضف داخل الـ `<div className="relative z-10 ...">` في الـ hero، بعد الـ `<form>` مباشرة، عنصر صف مزايا مستقل:
```tsx
<div className="absolute bottom-1 inset-x-0 z-10 flex justify-center gap-6 text-xs text-emerald-100/70 pb-2">
  <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> شحن سريع</span>
  <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> متاجر موثوقة</span>
  <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> تجربة شراء آمنة</span>
  <span className="flex items-center gap-1"><Headphones className="h-3.5 w-3.5" /> دعم 24/7</span>
</div>
```
ملاحظة: الأيقونات (Truck, ShieldCheck, Lock) تحتاج import إضافي من lucide-react.

---

## الانحراف 2 — Hero: قائمة نطاق البحث «الكل» مفقودة

**الأولوية:** 🟡 متوسطة  
**الملف:** `app/page.tsx` — السطر 156 (داخل `<form>`)  
**المكوّن:** Hero (marketplace)

**الـ baseline يُظهر:**  
حقل البحث يحتوي dropdown «الكل» على يساره (في تخطيط RTL: عنصر يظهر يميناً) للتصفية بنطاق المنتج أو المتجر.  
(موثّق في `components-inventory.md` — سطر 9: «قائمة نطاق (مثل «الكل»)»)

**الوضع الراهن:**  
حقل بحث بسيط بدون selector:
```tsx
<input name="q" defaultValue={q} placeholder="ابحث عن منتج أو متجر..." ... />
```
لا يوجد `<select name="scope">` أو ما يعادله.

**متى تغيّر تقريباً:**  
commit `3a1c699` — نفس commit الـ compact.

**توصية الاسترجاع:**  
أضف قبل `<input>` في الـ form:
```tsx
<select name="scope" className="bg-transparent text-sm font-bold text-slate-700 dark:text-zinc-300 pr-2 border-r border-slate-200 dark:border-zinc-600 outline-none">
  <option value="">الكل</option>
  <option value="products">منتجات</option>
  <option value="stores">متاجر</option>
</select>
```

---

## الانحراف 3 — StatsBar: غائب كلياً

**الأولوية:** 🔴 عالية  
**الملف:** `app/page.tsx` — القسم بأكمله مفقود  
**المكوّن:** StatsBar

**الـ baseline يُظهر:**  
شريط سفلي مقسّم بأعمدة: «+15,000 متجر نشط» / «+1 مليون منتج» / «99.6% رضا العملاء».  
(موثّق في `components-inventory.md` — السطر 69: «شريط سفلي مقسّم إلى أعمدة؛ كل عمود أيقونة رمادية، رقم كبير مع لواحق نصية عربية»)

**الوضع الراهن:**  
لا يوجد أي `<section>` أو `<div>` يحتوي هذه الأرقام في `app/page.tsx`. البحث في الملف عن الكلمات المفتاحية (15,000 / مليون / 99) لا يُعيد نتيجة.

**متى تغيّر تقريباً:**  
غير محدد بدقة. commit `3a1c699` هو المرشح الأقوى لأن وصفه يتضمن «compact home».

**توصية الاسترجاع:**  
أضف `<section>` قبل الـ `<footer>`:
```tsx
<section className="border-t border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
  <div className="mx-auto grid max-w-7xl grid-cols-3 gap-8 px-4 py-10 text-center">
    <div><p className="text-3xl font-extrabold text-emerald-700">+15,000</p><p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">متجر نشط</p></div>
    <div><p className="text-3xl font-extrabold text-emerald-700">+1 مليون</p><p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">منتج متاح</p></div>
    <div><p className="text-3xl font-extrabold text-emerald-700">99.6%</p><p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">رضا العملاء</p></div>
  </div>
</section>
```

---

## الانحراف 4 — ProductTile (السوق): زر المفضلة مفقود

**الأولوية:** 🟡 متوسطة  
**الملف:** `app/page.tsx` — السطر 82-108 (`ProductTile` component)  
**المكوّن:** ProductCard (marketplace variant)

**الـ baseline يُظهر:**  
أيقونة قلب (♥) فوق صورة المنتج في الزاوية اليسرى العليا أو العليا في بطاقات "منتجات مميزة".  
(موثّق في `components-inventory.md` — سطر 40: «أيقونة قلب للمفضلة»)

**الوضع الراهن:**  
الـ `ProductTile` في `app/page.tsx` يحتوي فقط على badge «مميز» إن توفر. لا heart button:
```tsx
{product.is_featured ? (
  <span className="absolute right-3 top-3 ...">مميز</span>
) : null}
// لا heart button
```

**متى تغيّر تقريباً:**  
`ProductTile` لم يُعدَّل منذ commit `3a1c699`. لا يوجد دليل على أن الـ heart أُضيف ثم حُذف — يُرجَّح أنه لم يُنفَّذ أصلاً.

**توصية الاسترجاع:**  
أضف داخل `<div className="relative aspect-[1.18] ...">` بعد شارة «مميز»:
```tsx
<button
  className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur text-slate-500 hover:text-rose-500 transition"
  aria-label="أضف للمفضلة"
>
  <Heart className="h-4 w-4" />
</button>
```
يتطلب import `Heart` من lucide-react.

---

## الانحراف 5 — ProductTile (السوق): زر السلة مستطيل بدلاً من دائري

**الأولوية:** 🟢 منخفضة  
**الملف:** `app/page.tsx` — السطر 102  
**المكوّن:** ProductCard (marketplace variant)

**الـ baseline يُظهر:**  
زر سلة دائري (pill/circle) في الزاوية أو أسفل البطاقة.

**الوضع الراهن:**  
```tsx
<Link ... className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 ...">
```
`rounded-xl` يعطي زوايا ناعمة مستطيلة، وليس دائرة كاملة.

**توصية الاسترجاع:**  
السطر 102 يصبح:
```
rounded-xl  →  rounded-full
```

---

## الانحراف 6 — ProductCard (المتجر الفرعي): زر المفضلة مفقود

**الأولوية:** 🟡 متوسطة  
**الملف:** `components/product/ProductCard.tsx` — السطر 22-67  
**المكوّن:** ProductCard (store variant)

**الـ baseline يُظهر (subdomain-store.png):**  
أيقونة قلب (♥) فوق كل صورة منتج في شبكة المنتجات بصفحة المتجر الفرعي.  
(موثّق في `components-inventory.md` — سطر 42: «في المتجر الفرعي يظهر القلب فوق الصورة»)

**الوضع الراهن:**  
الـ `ProductCard` يحتوي badge «مميز» وbadge «خصم» فقط. لا heart:
```tsx
<div className="store-product-card__media relative aspect-square bg-[var(--muted)]">
  {/* صورة */}
  {product.is_featured ? <span ...>مميز</span> : null}
  {discountPct ? <span ...>خصم {discountPct}%</span> : null}
  {/* لا heart */}
</div>
```

**متى تغيّر تقريباً:**  
آخر commit لهذا الملف: `56e7281 fix(routes): remove /store/ prefix`. الـ heart لم يُنفَّذ.

**توصية الاسترجاع:**  
أضف داخل `<div className="store-product-card__media ...">`:
```tsx
<button
  className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-[var(--card)]/80 backdrop-blur text-[var(--muted-foreground)] hover:text-rose-500 transition z-10"
  aria-label="أضف للمفضلة"
  onClick={(e) => e.preventDefault()}
>
  <Heart className="h-4 w-4" />
</button>
```
يتطلب: (1) import `Heart` من lucide-react، (2) تحويل `<article>` إلى client component أو نقل الزر لمكوّن client منفصل.

---

## ملخص الانحرافات

| # | المكوّن | الملف | الأولوية | نوع الانحراف |
|---|---------|-------|----------|--------------|
| 1 | Hero features row | `app/page.tsx:156` | 🔴 عالية | عنصر مفقود كلياً |
| 2 | Hero search dropdown | `app/page.tsx:156` | 🟡 متوسطة | عنصر مفقود |
| 3 | StatsBar | `app/page.tsx` | 🔴 عالية | قسم مفقود كلياً |
| 4 | ProductTile heart | `app/page.tsx:82-108` | 🟡 متوسطة | عنصر مفقود |
| 5 | ProductTile cart shape | `app/page.tsx:102` | 🟢 منخفضة | فرق CSS |
| 6 | ProductCard heart | `components/product/ProductCard.tsx:22-67` | 🟡 متوسطة | عنصر مفقود |

---

## الخطوة التالية المطلوبة

وفق قواعد الحارس: لا تُكمل المرحلة 2 (استخبارات منافسين) حتى يُوثَّق هذا التقرير ويُراجعه الفريق.  
التنفيذ الفعلي للتوصيات أعلاه يتم عبر Cursor بناءً على هذا الملف — الحارس لا يُعدّل كود الإنتاج.

# تقرير انحراف بصري عن الـ baseline — 2026-07-09

**تاريخ الفحص:** 2026-07-09  
**المرجع البصري:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`  
**الأساس التوثيقي:** `docs/design/baseline/components-inventory.md`  
**حالة الـ baseline:** موجود ✅ — الفحص اكتمل

---

## ملخص تنفيذي

تم رصد **7 انحرافات بصرية** عن الـ baseline الرسمي. أبرزها: StatsBar مفقود كلياً، زر القلب غائب عن ProductTile، وزر "زيارة المتجر" غائب عن StoreCard.

---

## الانحراف 1 — StatsBar غائب كلياً

| الحقل | القيمة |
|-------|--------|
| المكوّن | StatsBar |
| الملف | `app/page.tsx` |
| السطر | غير موجود — لم يُنفَّذ |
| متى تغيّر | مجهول — لا أثر في `git log app/page.tsx` لإضافة ثم حذف |

**الوصف البصري:** الـ baseline يحدد شريطاً إحصائياً سفلياً يحتوي على أعمدة (15,000 متجر / +1 مليون منتج / 99.6% رضا) مع أيقونات رمادية وأرقام كبيرة. الكود الحالي لا يحتوي على أي شريط إحصائيات — الفوتر يعرض روابط نصية فقط.

**توصية الاسترجاع:** إضافة section جديدة قبل `<footer>` في `app/page.tsx`:
```
<section className="border-t border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
  <div className="mx-auto grid max-w-7xl grid-cols-3 gap-6 px-4 py-8">
    {/* col: 15,000+ متجر */}
    {/* col: +1 مليون منتج */}
    {/* col: 99.6% رضا */}
  </div>
</section>
```
هذه توصية فقط — لا تنفيذ.

---

## الانحراف 2 — ProductTile: شارة "ممول" → "مميز" (نص مختلف)

| الحقل | القيمة |
|-------|--------|
| المكوّن | ProductTile (الصفحة الرئيسية) |
| الملف | `app/page.tsx` |
| السطر | 106 |
| متى تغيّر | آخر تعديل في commit `5f7bf39` (fix marketplace advertise banner) |

**الوصف البصري:** الـ baseline يحدد شارة **"ممول"** بلون تركواز على بطاقة المنتج في السوق (sponsored badge). الكود الحالي يعرض **"مميز"** عند `is_featured=true` بلون أخضر فاتح (`bg-emerald-100`). المعنيان مختلفان: "مميز" = featured، "ممول" = sponsored.

**توصية الاسترجاع:**
- السطر 106 يصبح: `<span className="... bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300">ممول</span>`
- يستوجب وجود حقل `is_sponsored` في بيانات المنتج أو تعديل الشرط
- هذه توصية فقط — لا تنفيذ.

---

## الانحراف 3 — ProductTile: زر القلب (المفضلة) مفقود

| الحقل | القيمة |
|-------|--------|
| المكوّن | ProductTile (الصفحة الرئيسية) |
| الملف | `app/page.tsx` |
| السطر | دالة ProductTile، السطور 88-122 |
| متى تغيّر | لا أثر لحذف — ربما لم يُنفَّذ أصلاً |

**الوصف البصري:** الـ baseline يحدد أيقونة قلب للمفضلة فوق صورة المنتج أو بجانب السعر. الكود الحالي لا يحتوي على أي زر قلب أو wishlist في ProductTile.

**توصية الاسترجاع:** إضافة زر قلب داخل `.relative.aspect-[1.18]`:
```
<button className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/80 backdrop-blur" aria-label="إضافة للمفضلة">
  <Heart className="h-4 w-4 text-slate-500" />
</button>
```
هذه توصية فقط — لا تنفيذ. الـ spec الكامل موجود في `docs/specs/product-tile-wishlist-2026-06-11.md` (إن وُجد).

---

## الانحراف 4 — StoreCard: شعار مربع لا دائري

| الحقل | القيمة |
|-------|--------|
| المكوّن | StoreCard |
| الملف | `components/explore/StoreCard.tsx` |
| السطر | 35 |
| متى تغيّر | غير موثّق في git log المتاح |

**الوصف البصري:** الـ baseline يحدد "شعار دائري" (`rounded-full`). الكود الحالي يستخدم `rounded-xl` (مربع بزوايا ناعمة).

**توصية الاسترجاع:**
- السطر 35: تغيير `rounded-xl` → `rounded-full`
- هذه توصية فقط — لا تنفيذ.

---

## الانحراف 5 — StoreCard: زر "زيارة المتجر" مفقود

| الحقل | القيمة |
|-------|--------|
| المكوّن | StoreCard |
| الملف | `components/explore/StoreCard.tsx` |
| السطر | دالة StoreCard — لا يوجد CTA |
| متى تغيّر | غير موثّق — ربما لم يُنفَّذ |

**الوصف البصري:** الـ baseline يحدد زر نصي "زيارة المتجر" بحدود تركواز داخل بطاقة المتجر. الكود الحالي: البطاقة كاملها رابط لكن لا يوجد عنصر نصي CTA مرئي. المقارنة: المتاجر المميزة في `app/page.tsx` تعرض زر "زيارة المتجر" لكن `StoreCard.tsx` المستخدمة في قسم "كل المتاجر" لا تعرضه.

**توصية الاسترجاع:** إضافة span داخل `.mt-3.flex`:
```
<span className="mr-auto rounded-full border border-teal-200 px-3 py-1 text-xs font-bold text-teal-700">
  زيارة المتجر
</span>
```
هذه توصية فقط — لا تنفيذ.

---

## الانحراف 6 — StoreHeader: وسوم الموثوقية/التوصيل مفقودة

| الحقل | القيمة |
|-------|--------|
| المكوّن | StoreHeader / StoreInfoCard |
| الملف | `components/store/StoreHeader.tsx` |
| السطر | 197-213 |
| متى تغيّر | آخر تعديل في `8b42fda` ([codex] refactor storefront components to tokens) |

**الوصف البصري:** الـ baseline يحدد "صف وسوم (موقع، موثوقية، توصيل)" في بطاقة معلومات المتجر العائمة. الكود الحالي يعرض الموقع (`areaName`) والهاتف فقط، دون وسوم "متجر موثوق" أو "توصيل سريع".

**توصية الاسترجاع:** إضافة صف وسوم بعد السطر 213 في `StoreHeader.tsx`:
```
{store.is_verified ? (
  <span className="flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-700">
    <BadgeCheck className="h-3 w-3" /> متجر موثوق
  </span>
) : null}
{store.has_delivery ? (
  <span className="...">توصيل سريع</span>
) : null}
```
يتوقف على وجود حقلَي `is_verified` و `has_delivery` في الـ API (يحتاج تحقق).
هذه توصية فقط — لا تنفيذ.

---

## الانحراف 7 — Hero: صف أيقونات المزايا مفقود

| الحقل | القيمة |
|-------|--------|
| المكوّن | Hero (الصفحة الرئيسية) |
| الملف | `app/page.tsx` |
| السطر | دالة `ExplorePage`، السطر 178 |
| متى تغيّر | غير موثّق — ربما لم يُنفَّذ |

**الوصف البصري:** الـ baseline يحدد "صف أيقونات قصيرة لمزايا المنصة (شحن، ثقة، أمان، دعم)" تحت شريط البحث. الكود الحالي لا يحتوي على هذا الصف.

**توصية الاسترجاع:** إضافة صف أسفل شريط البحث (داخل الـ `<section>` الأولى):
```
<div className="absolute inset-x-5 bottom-1 z-10 flex justify-center gap-6 text-xs text-emerald-200/70">
  <span>🚚 شحن سريع</span>
  <span>🔒 دفع آمن</span>
  <span>✅ متاجر موثوقة</span>
  <span>🎧 دعم مستمر</span>
</div>
```
هذه توصية فقط — لا تنفيذ.

---

## الإجراء المطلوب

بسبب وجود انحرافات بصرية متعددة، **لن يُنتَج spec جديد في هذه الجولة** (المرحلة 3 مُعطَّلة وفق البروتوكول). الخطوات المقترحة:
1. مراجعة هذا التقرير مع فريق التصميم
2. تحديد الأولوية (يُقترح: StatsBar أولاً ثم زر القلب)
3. تكليف Cursor بالإصلاحات استناداً للتوصيات أعلاه
4. إعادة الفحص في الجولة القادمة للتحقق من الاسترجاع

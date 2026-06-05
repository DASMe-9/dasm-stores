# Baseline Drift Report — 2026-06-05

**المرجع:** `docs/design/baseline/` (تجميد 2026-05-16)
**الفرع الفحوص:** `claude/relaxed-cray-6Fz8u`

---

## ملخص الحالة

وُجد **5 انحرافات بصرية** عن الـ baseline الرسمي. لا تعيق الوظيفة لكنها تُبعد التنفيذ عن العقد البصري المتفق عليه.

---

## الانحراف 1 — صف مزايا المنصة مفقود من Hero السوق

**المكوّن:** `Hero (marketplace)`
**الملف:** `app/page.tsx` — قسم الـ Hero (السطر 156)
**وصف الانحراف:**
الـ baseline يُظهر صفاً من الأيقونات أسفل شريط البحث يحمل مزايا المنصة: شحن / ثقة / أمان / دعم (4 عناصر). التنفيذ الحالي لا يحتوي هذا الصف.
**تقدير التغيير:** commit `3a1c699` (2026-06-04) — "fix(stores): compact home banner" — يُرجَّح أن التضغيط أزاله أو أسقطه.
**توصية الاسترجاع:**
أضف داخل `<section>` الـ Hero مباشرة بعد `</div>` الذي يحوي `</form>` صفاً صغيراً:
```tsx
<div className="absolute inset-x-5 bottom-[-28px] z-10 flex justify-center gap-4 text-xs text-white/70">
  <span>✓ شحن سريع</span>
  <span>✓ دفع آمن</span>
  <span>✓ متاجر موثوقة</span>
  <span>✓ دعم 7/24</span>
</div>
```
ملاحظة: هذه توصية فقط — لا تنفّذها هنا.

---

## الانحراف 2 — أيقونة القلب (المفضلة) مفقودة من ProductCard

**المكوّن:** `ProductCard / ProductTile`
**الملف:** `app/page.tsx` — component `ProductTile` (السطر ~87-108)
**وصف الانحراف:**
الـ baseline يُظهر أيقونة قلب صغيرة فوق صورة المنتج للمفضلة. `ProductTile` الحالي يحتوي فقط على زر السلة في أسفل البطاقة، دون زر قلب.
**تقدير التغيير:** لم يُضف قط في هذا المكوّن (الصفحة الرئيسية) — الدمج من المتجر الفرعي لم يحدث.
**توصية الاسترجاع:**
أضف في `div.relative` داخل صورة المنتج (السطر ~87):
```tsx
<button aria-label="أضف للمفضلة" className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-slate-500 shadow hover:text-rose-500">
  <Heart className="h-4 w-4" />
</button>
```
توصية فقط — لا تنفّذها.

---

## الانحراف 3 — زر السلة في ProductCard مستطيل لا دائري

**المكوّن:** `ProductCard / ProductTile`
**الملف:** `app/page.tsx` السطر 102
**وصف الانحراف:**
الـ baseline يصف "زر سلة صغير **دائري**". التنفيذ الحالي: `rounded-xl` بدلاً من `rounded-full`.
**السطر الحالي:**
```
className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 ..."
```
**توصية الاسترجاع:** استبدل `rounded-xl` بـ `rounded-full` في السطر 102.

---

## الانحراف 4 — StatsBar مفقود من أسفل الصفحة الرئيسية

**المكوّن:** `StatsBar`
**الملف:** `app/page.tsx` — قسم الـ footer (السطر 164)
**وصف الانحراف:**
الـ baseline يُظهر شريط إحصائيات أسفل الصفحة: **15,000 متجر / +1 مليون منتج / 99.6% رضا العملاء**. الـ footer الحالي يحتوي روابط فقط دون أي StatsBar.
**تقدير التغيير:** غير موجود في أي commit — لم يُنفَّذ بعد أو حُذف قبل الـ baseline.
**توصية الاسترجاع:** أضف `<section>` قبل الـ `<footer>` يحتوي صف إحصائيات بثلاثة أعمدة.

---

## الانحراف 5 — وسوم الثقة والتوصيل مفقودة من StoreInfoCard

**المكوّن:** `StoreInfoCard` / `StoreHeader`
**الملف:** `components/store/StoreHeader.tsx` السطر ~157-163
**وصف الانحراف:**
الـ baseline يُظهر وسوم: "الرياض" + "متجر موثوق" + "توصيل سريع" أسفل وصف المتجر. التنفيذ الحالي يعرض MapPin و contact_phone فقط — لا توجد شارات "موثوق" أو "توصيل سريع".
**تقدير التغيير:** غير موجود في التنفيذ — الحقول الداعمة (`is_verified`, `shipping_enabled`) قد تكون متاحة في API.
**توصية الاسترجاع:**
```tsx
{store.is_verified && <span className="badge-trust">موثوق ✓</span>}
{store.shipping_enabled && <span className="badge-shipping">توصيل سريع 🚚</span>}
```

---

## قرار المرحلة

وُجد drift → **لا تتجاوز المرحلة 2** بدون إشعار.

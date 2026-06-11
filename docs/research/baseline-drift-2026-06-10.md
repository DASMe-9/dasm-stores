# تقرير انحراف بصري — baseline-drift-2026-06-10

**تاريخ التشغيل:** 2026-06-10 (جولة أسبوعية — الثلاثاء)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**commit الـ baseline:** `30f691d` (2026-06-07 14:52)
**التقرير السابق:** `docs/research/baseline-drift-2026-06-07.md` (✅ محلول)

---

## ملخص تنفيذي

**وُجد انحرافان جديدان** ناتجان عن كوميتَين بعد تجميد الـ baseline.

وفق قواعد الحارس: **المرحلة 2 و3 مؤجَّلتان** حتى مراجعة هذا التقرير من المالك.

ملاحظة: تقرير 2026-06-07 المسائي أشار إلى أن `0f1fb42` "فحصت ولم تُنتج انحرافات جديدة"، غير أن المقارنة الفعلية مع الـ baseline الحالي (`30f691d`) تُثبت أن التغيير البصري حقيقي. لا يوجد commit ثانٍ لإعادة تجميد الـ baseline بعد `0f1fb42`.

---

## الانحراف 1 — StoreHeader: كارت معلومات المتجر مضغوط بشكل غير مقصود

**الأولوية:** 🔴 عالية
**الملف:** `components/store/StoreHeader.tsx:147`
**commit المُسبِّب:** `0f1fb42` — `fix(storefront): compact store info card` (2026-06-07 18:39)

### الوصف البصري

بطاقة هوية المتجر العائمة (التي تظهر أسفل بانر الـ hero في صفحة كل متجر) قُلِّصت تقليصاً ملحوظاً في جميع أبعادها:

| العنصر | الـ baseline (`30f691d`) | الحالة الراهنة |
|--------|--------------------------|----------------|
| تداخل البطاقة مع الـ hero | `-mt-12 md:-mt-16` | `-mt-8 md:-mt-10` |
| الحشو الداخلي | `p-5 md:p-6` | `p-3 md:p-4` |
| شعار المتجر | `h-24 w-24 rounded-3xl border-4` | `h-16 w-16 md:h-20 md:w-20 rounded-2xl border-2` |
| عنوان المتجر | `text-2xl md:text-3xl` | `text-xl md:text-2xl` |
| وصف المتجر | `line-clamp-2 text-sm` | `line-clamp-1 text-xs md:text-sm` |
| فجوة بين العناصر | `gap-5` | `gap-3` |
| عرض الحاوية | `max-w-[1600px] pb-4` | `max-w-[1280px] pb-3` |

**الأثر:** فقدان الثقل البصري لهوية المتجر، وتقليص ظهور الشعار بنسبة ~33%، وبتر الوصف إلى سطر واحد.

### توصية الاسترجاع

السطر 147 في `components/store/StoreHeader.tsx`:
```
-        <div className="-mt-8 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-3 shadow-lg shadow-black/5 backdrop-blur md:-mt-10 md:flex-row md:items-center md:p-4">
+        <div className="-mt-12 flex flex-col gap-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-5 shadow-xl shadow-black/5 backdrop-blur md:-mt-16 md:flex-row md:items-center md:p-6">
```
السطر 148 (الشعار):
```
-          <div className="order-1 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[var(--card)] bg-[var(--muted)] shadow md:order-none md:h-20 md:w-20">
+          <div className="order-1 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-[var(--card)] bg-[var(--muted)] shadow md:order-none">
```
السطر 158 (عنوان):
```
-            <h1 className="text-xl font-extrabold text-[var(--foreground)] md:text-2xl">{storeName}</h1>
+            <h1 className="text-2xl font-extrabold text-[var(--foreground)] md:text-3xl">{storeName}</h1>
```
السطر 160-161 (وصف):
```
-              <p className="mt-0.5 line-clamp-1 text-xs text-[var(--muted-foreground)] md:text-sm">
+              <p className="mt-1 line-clamp-2 text-sm text-[var(--muted-foreground)]">
```
الحاوية الخارجية (السطر 146):
```
-      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 pb-3 pt-0 sm:px-6 lg:px-8">
+      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-4 pt-0 sm:px-6 lg:px-8">
```

**تنبيه:** هذه توصيات فقط. لا تنفّذها — مرّرها لـ Cursor.

---

## الانحراف 2 — Home: قسم "تتبع الطلب" محذوف

**الأولوية:** 🟡 متوسطة
**الملف:** `app/page.tsx`
**commit المُسبِّب:** `be75d87` — `fix(stores): remove home tracking block` (2026-06-09 06:56)

### الوصف البصري

ثلاثة عناصر حُذفت دفعةً واحدة:

1. **رابط nav العلوي:** حُذف رابط "تتبع الطلب" (`href="#track-order"`) من شريط التنقل العلوي (كان آخر رابط في nav الـ desktop).

2. **قسم "تتبع طلبك من المتجر"** (`#track-order`): بطاقة كاملة أسفل "كل المتاجر" تشرح آلية التتبع وتحتوي زر "اختر المتجر" للتوجيه.
   ```html
   <!-- المحتوى المحذوف -->
   <section id="track-order" ...>
     <h2>تتبع طلبك من المتجر</h2>
     <p>التتبع يعمل من داخل صفحة كل متجر عبر رقم الطلب...</p>
     <Link href="#stores">اختر المتجر <PackageCheck /></Link>
   </section>
   ```

3. **رابط الـ footer:** حُذف رابط "تتبع الطلب" من قسم "روابط سريعة" في الـ footer.

**الأثر:** مستخدم يبحث عن تتبع طلبه لا يجد نقطة إرشادية واضحة على الصفحة الرئيسية.

### توصية الاسترجاع

في `app/page.tsx`:

استرجاع رابط nav (أضف كآخر `<Link>` في الـ `nav`):
```tsx
<Link href="#track-order" className="hover:text-emerald-700">تتبع الطلب</Link>
```

استرجاع القسم (أضف قبل `</main>`):
```tsx
<section id="track-order" className="mx-auto max-w-7xl px-4 pb-12">
  <div className="grid gap-4 rounded-3xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
    <div>
      <h2 className="text-xl font-extrabold">تتبع طلبك من المتجر</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">التتبع يعمل من داخل صفحة كل متجر عبر رقم الطلب. افتح المتجر ثم استخدم رابط التتبع الخاص به.</p>
    </div>
    <Link href="#stores" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 dark:bg-zinc-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">
      اختر المتجر <PackageCheck className="h-4 w-4" />
    </Link>
  </div>
</section>
```

استرجاع رابط الـ footer (أضف في "روابط سريعة"):
```tsx
<Link href="#track-order">تتبع الطلب</Link>
```

---

## المرحلة 2 — استخبارات المنافسين: مؤجلة

**السبب:** وجود drift نشط يمنع المتابعة وفق قواعد الحارس.

**حالة exa:** لا تزال تتطلب OAuth — انظر `docs/research/competitors/2026-25.md` للتفاصيل.

---

## المرحلة 3 — Spec: محظورة

وجود drift نشط يمنع إنتاج spec جديد في هذه الجولة.

---

## الخطوة التالية المطلوبة

1. **معالجة الانحرافَين 1 و2** عبر Cursor باستخدام توصيات الاسترجاع أعلاه — أو تحديث الـ baseline رسمياً إن كانت التغييرات مقصودة.
2. **تفعيل exa OAuth** في Connectors → exa لتمكين استخبارات المنافسين الحية.
3. بعد المعالجة → الجولة التالية تتجاوز إلى المرحلة 2 وتنتج spec.

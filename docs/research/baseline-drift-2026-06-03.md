# تقرير انحراف بصري عن الـ Baseline
**تاريخ الفحص:** 2026-06-03  
**المرجع:** `docs/design/baseline/screenshots/` + `docs/design/baseline/components-inventory.md`  
**الفرع المفحوص:** `claude/relaxed-cray-qxUEy`  
**الحالة:** 🔴 وُجد انحراف — لا تتجاوز هذا التقرير قبل الاسترجاع

---

## ملخص الانحرافات

| # | المكوّن | نوع الانحراف | الأثر |
|---|---------|-------------|-------|
| 1 | `StatsBar` | **غائب تماماً** | ثقة منصة — حرج |
| 2 | `ProductCard` | زر مفضلة (قلب) + زر سلة مفقودان | تحويل — حرج |
| 3 | `StoreCard` | شعار مربع بدلاً من دائري + زر "زيارة المتجر" مفقود | بصري — متوسط |
| 4 | `StoreInfoCard` | نصوص الوسوم انحرفت عن لغة الثقة | رسالة — خفيف |

---

## الانحراف 1 — StatsBar: غائب تماماً

**الملف المعني:** `app/page.tsx`  
**السطر:** لا يوجد — المكوّن كله محذوف  

**الوصف البصري للـ baseline:**  
شريط سفلي أفقي مقسّم إلى 4 أعمدة: كل عمود يحمل أيقونة، رقماً كبيراً بلواحق عربية، وتسمية تحتية.  
الأرقام المحددة في التصميم: **15,000 متجر / +1 مليون منتج / 99.6% رضا عملاء**.

**آخر تعديل على الملف:** `b90e100` — feat(stores): integrate dasm-ads exchange  
**تقدير التغيير:** أُزيل ضمن إعادة هيكلة `app/page.tsx` في دورة تكامل الإعلانات.

**توصية الاسترجاع:**  
أضف قبل `<footer>` في `app/page.tsx` (بعد سطر 166):

```tsx
<section className="border-t border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
  <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4">
    {[
      { icon: <Store className="h-6 w-6" />, value: "15,000+", label: "متجر نشط" },
      { icon: <ShoppingBag className="h-6 w-6" />, value: "+1 مليون", label: "منتج" },
      { icon: <BadgeCheck className="h-6 w-6" />, value: "99.6%", label: "رضا العملاء" },
      { icon: <Headphones className="h-6 w-6" />, value: "24/7", label: "دعم" },
    ].map((stat) => (
      <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
        <span className="text-slate-400 dark:text-zinc-500">{stat.icon}</span>
        <span className="text-2xl font-extrabold text-slate-950 dark:text-zinc-100">{stat.value}</span>
        <span className="text-xs text-slate-500 dark:text-zinc-400">{stat.label}</span>
      </div>
    ))}
  </div>
</section>
```

---

## الانحراف 2 — ProductCard: زر المفضلة وزر السلة مفقودان

**الملف المعني:** `components/product/ProductCard.tsx`  
**السطر:** 24–66 (كامل جسم البطاقة)  

**الوصف البصري للـ baseline:**  
- أيقونة قلب (♡) فوق صورة المنتج في الزاوية العلوية اليسرى
- زر سلة صغير دائري في قسم التفاصيل (بجانب السعر)

**الحالة الراهنة في الكود:**  
- سطر 22–66: لا `Heart` icon، لا `ShoppingCart` button
- آخر تعديل: `56e7281` — fix(routes): remove /store/ prefix
- شارة "ممول" (`isSponsored`) غائبة أيضاً — الـ `is_featured` يعرض "مميز" فقط

**توصية الاسترجاع:**  

في `components/product/ProductCard.tsx` سطر 37 (بعد بلوك الصورة الشرطي)، أضف:
```tsx
{/* زر مفضلة */}
<button
  aria-label="أضف للمفضلة"
  className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/80 dark:bg-zinc-900/80 shadow backdrop-blur hover:bg-emerald-50"
>
  <Heart className="h-4 w-4 text-slate-500 hover:text-emerald-600" />
</button>
```

في `store-product-card__body` (سطر 56، بجانب السعر)، أضف:
```tsx
<button
  aria-label={`أضف ${product.name} للسلة`}
  className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition"
>
  <ShoppingCart className="h-4 w-4" />
</button>
```

---

## الانحراف 3 — StoreCard: شعار مربع + زر "زيارة المتجر" مفقود

**الملف المعني:** `components/explore/StoreCard.tsx`  
**السطر الأول:** 35 (بلوك الشعار)  
**السطر الثاني:** 52–70 (منطقة الأزرار — لا زر مستقل)

**الوصف البصري للـ baseline:**  
- شعار **دائري** (`rounded-full`)
- زر واضح بنص "زيارة المتجر" بحدود تركواز

**الحالة الراهنة:**  
- سطر 35: `rounded-xl` — مربع مستدير الزوايا، ليس دائرياً
- لا يوجد زر "زيارة المتجر" — البطاقة كلها رابط لكن لا تتضمن عنصراً بصرياً يُحث الزائر

**توصية الاسترجاع:**

سطر 35 يصبح:
```tsx
<div className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--card)] bg-[var(--card)] shadow">
```

وأضف داخل `mt-3 flex flex-wrap items-center gap-3` (سطر 52) بعد span عداد المنتجات:
```tsx
<span
  className="inline-flex rounded-lg px-3 py-1 text-xs font-bold"
  style={{
    backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)",
    color: "var(--primary)",
  }}
>
  زيارة المتجر
</span>
```

---

## الانحراف 4 — StoreInfoCard: نصوص الوسوم

**الملف المعني:** `components/store/StoreHeader.tsx`  
**السطور:** 154–161

**الوصف البصري للـ baseline:**  
وسوم ثقة واضحة: **"متجر موثوق"** و**"توصيل سريع"**

**الحالة الراهنة:**  
- سطر 157: `"واجهة متجر على داسم"` — لغة تقنية/إدارية لا تقنع المتسوق
- سطر 160: `"خيارات التوصيل حسب المتجر"` — وصفي لا مشجّع

**آخر تعديل:** `af0f69e` — feat(storefront): site-wide light/dark theme toggle  

**توصية الاسترجاع:**  
- سطر 157 يصبح: `متجر موثوق`
- سطر 160 يصبح: `توصيل سريع`

---

## القرار

🛑 **الانحرافات 1 و2 حرجة** — يجب اسـتعادتها قبل إضافة أي ميزة جديدة.  
⚠️ **الانحرافان 3 و4** قابلان للتأجيل لبعد sprint التصحيح.

**الإجراء المطلوب:**  
Cursor ينفّذ التوصيات أعلاه بهذا الترتيب:  
1. استعادة `StatsBar` في `app/page.tsx`  
2. إضافة Heart + Cart buttons في `ProductCard`  
3. تصحيح `rounded-xl` → `rounded-full` + إضافة "زيارة المتجر" في `StoreCard`  
4. تصحيح النصوص في `StoreHeader`  

لا تُدمج هذه التغييرات حتى تُوافق بصرياً على لقطات شاشة جديدة مقارنةً بـ `docs/design/baseline/screenshots/`.

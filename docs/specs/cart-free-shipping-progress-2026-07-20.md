# Spec: شريط تقدّم الشحن المجاني داخل سلة التسوق

## السياق والمبرر

Salla Twilight v2.14.501 (2026-07-15) أطلقت "gap cart recommendations" — شريط يوضّح الفجوة بين مجموع السلة وعتبة الشحن المجاني، مع توصيات منتجات لسدّ الفجوة. النمط أصبح معياراً واضحاً في Salla وZid ويُعزّز معدل تحويل السلة.

حالياً في dasm-stores: `components/cart/CartDrawer.tsx` لا يعرض أي مؤشر بصري لعتبة الشحن. المتسوق لا يعرف كم تبقّى للحصول على شحن مجاني.

**المصدر التنافسي:** `docs/research/competitors/2026-30.md` — بند 1 (Salla gap cart)  
**الأثر:** عالٍ — يُحفّز المتسوق على إضافة منتجات  
**الجهد:** منخفض — مكوّن عرض بحت، بيانات متوفرة من `useCartStore`

---

## الحالة الراهنة في dasm-stores

### الملفات المعنية
- `components/cart/CartDrawer.tsx` — الـ drawer الجانبي للسلة
- `store/cartStore.ts` — Zustand store يحسب `total()`

### السلوك الحالي
- `CartDrawer.tsx` السطر 107-120: فوتر يعرض الإجمالي + زر "عرض السلة"
- لا يوجد أي ذكر لعتبة شحن مجاني
- `total()` محسوب ومتاح عبر `useCartStore((s) => s.total())`

---

## التغيير المقترح

### المكوّن الجديد: `FreeShippingBar`

```typescript
// داخل CartDrawer.tsx — مكوّن محلي

const FREE_SHIPPING_THRESHOLD = 199; // ر.س — قيمة أولية ثابتة، تُستبدل بقيمة ديناميكية من API لاحقاً

type FreeShippingBarProps = {
  total: number;
  threshold?: number; // افتراضي: FREE_SHIPPING_THRESHOLD
};
```

### الحالات (States)

| الحالة | الشرط | العرض البصري |
|--------|--------|--------------|
| `empty` | السلة فارغة | مخفي (لا يظهر الشريط) |
| `near` | `total < threshold` (الفجوة > 0) | شريط تقدّم أزرق/أخضر + نص "أضف X ر.س للشحن المجاني" |
| `reached` | `total >= threshold` | شريط ممتلئ أخضر + نص "🎉 حصلت على شحن مجاني!" |

### التصميم البصري

```
┌─────────────────────────────────────────┐
│  أضف 49 ر.س للحصول على شحن مجاني ✈️   │
│ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░  │
│ 150 ر.س  من  199 ر.س                   │
└─────────────────────────────────────────┘
```

- شريط تقدّم: `<progress>` أو `<div>` بـ `width: (total/threshold * 100)%`
- الألوان: يستخدم `var(--c-brand)` للشريط و`var(--c-surface-2)` للخلفية
- موضع الإدراج: قبل `<footer>` في `CartDrawer.tsx` (السطر 107)، ظاهر فقط عند وجود عناصر في السلة

### واجهة التعديل في CartDrawer.tsx

```diff
// السطر 14 (بعد تعريف total)
+ const FREE_SHIPPING_THRESHOLD = 199;
+ const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
+ const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

// السطر 105 (بعد </div> نهاية قائمة العناصر وقبل <footer>)
+ {items.length > 0 && (
+   <div className="px-4 pb-3">
+     <div className="rounded-xl border border-[var(--c-line)] bg-[var(--c-surface-2)] p-3 text-xs">
+       {remaining > 0 ? (
+         <>
+           <p className="mb-2 font-semibold text-[var(--c-text)]">
+             أضف <span className="text-[var(--c-brand)]">{remaining.toFixed(0)} ر.س</span> للشحن المجاني ✈️
+           </p>
+           <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--c-line)]">
+             <div
+               className="h-full rounded-full bg-[var(--c-brand)] transition-all duration-500"
+               style={{ width: `${progress}%` }}
+             />
+           </div>
+         </>
+       ) : (
+         <p className="font-semibold text-emerald-600 dark:text-emerald-400">🎉 حصلت على شحن مجاني!</p>
+       )}
+     </div>
+   </div>
+ )}
```

---

## معايير القبول

- [ ] الشريط مخفي عند السلة الفارغة
- [ ] `remaining` يُحسب صحيحاً: `max(0, 199 - total)`
- [ ] شريط التقدّم يملأ تدريجياً مع إضافة منتجات
- [ ] الرسالة تتغير من "أضف X ر.س" إلى "حصلت على شحن مجاني!" عند بلوغ 199 ر.س
- [ ] التصميم يستخدم CSS custom properties (`var(--c-brand)`, `var(--c-line)`) ليتوافق مع ثيمات المتجر
- [ ] لا يظهر في السلة الفارغة (الحالة `empty`)
- [ ] RTL صحيح: اتجاه الشريط من اليمين لليسار
- [ ] لا يُكسر layout الـ drawer على الموبايل (max-w-md)

---

## الملفات التي سيلمسها Cursor

| الملف | التعديل |
|-------|---------|
| `components/cart/CartDrawer.tsx` | إضافة ثابت `FREE_SHIPPING_THRESHOLD`، حساب `remaining` و`progress`، إدراج مكوّن `FreeShippingBar` مضمَّن |

**ملاحظة:** لا حاجة لملف مكوّن منفصل في هذه المرحلة — المكوّن مضمَّن داخل `CartDrawer.tsx` بسبب صغر حجمه. يُفصَل لملف منفصل فقط إذا احتاج إلى إعادة استخدام في `CartPageClient.tsx`.

---

## مخاطر التغيير

| المخاطرة | الاحتمال | التخفيف |
|----------|----------|---------|
| قيمة الـ threshold ثابتة (199 ر.س) لا تعكس إعدادات المتجر الفعلية | متوسط | تُستبدل بقيمة من API في المرحلة التالية؛ الـ 199 ر.س مناسبة للسوق السعودي |
| قد تختلف عتبة الشحن بين المتاجر | عالٍ | الـ prop `threshold` قابل للتمرير مستقبلاً من `StorePublic` |
| الشريط يضيف ارتفاعاً (~60px) قد يضغط محتوى السلة على الموبايل | منخفض | الـ `flex-1 overflow-y-auto` يتكيّف تلقائياً |

---

## استثناء: لا تمس

- الملفات في `docs/design/baseline/`
- `tailwind.config` (إلا بنص صريح)
- `store/cartStore.ts` (الـ spec لا يتطلب تعديل الـ store)

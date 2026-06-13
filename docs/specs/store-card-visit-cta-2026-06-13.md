# Spec: زر "زيارة المتجر" — StoreCard

**التاريخ:** 2026-06-13
**المصدر:** baseline `components-inventory.md` + تحليل Shopify Dawn multi-vendor (W28)
**الأولوية:** عالية — الـ baseline يُصرّح بالزر صراحةً: "زر «زيارة المتجر» بحدود تركواز"

---

## السياق والمبرر

`components-inventory.md` يُحدد في وصف StoreCard:
> "زر «زيارة المتجر» بحدود تركواز؛ قد تظهر أيقونة قلب جانبية"

حالياً البطاقة كلها رابط (`<Link>`) لكن لا يوجد زر CTA مرئي صريح يُوضّح للمستخدم أن الضغط = "زيارة المتجر". هذا يخفض معدل النقر إذ لا يوجد مؤشر بصري واضح للـ action.

Shopify Dawn community (W28): البطاقات التي تضم زر CTA نصياً صريحاً تحقق معدلات نقر أعلى من البطاقات التي تعتمد على hover فقط.

---

## الحالة الراهنة في dasm-stores

**الملف الرئيسي:** `components/explore/StoreCard.tsx`

```
StoreCard (Link كامل → /${store.slug})
  ├── banner (h-32, gradient overlay)
  ├── logo (h-14 w-14 rounded-xl)
  ├── اسم المتجر (text-base font-bold)
  ├── وصف المتجر (line-clamp-2, اختياري)
  └── صف meta (نوع المتجر + موقع + عدد المنتجات)
  // لا يوجد زر CTA مرئي
```

**الملفات ذات الصلة:**
- `components/explore/StoreCard.tsx` — الملف الوحيد المتأثر
- `app/page.tsx` — يستخدم `<StoreCard>` في قسم "كل المتاجر"

---

## التغيير المقترح

### تعديل `components/explore/StoreCard.tsx`

**الإضافة:** صف يحتوي على صف meta (موقع، عدد منتجات) + زر CTA على اليسار.

**قبل التغيير (السطر 52–68):**
```tsx
<div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
  <span className="rounded-full px-2 py-0.5 font-medium" style={...}>
    {ownerLabel(store.owner_type)}
  </span>
  {areaName ? (
    <span className="flex items-center gap-1">
      <MapPin className="h-3 w-3" /> {areaName}
    </span>
  ) : null}
  <span className="flex items-center gap-1">
    <Package className="h-3 w-3" /> {store.products_count ?? 0} منتج
  </span>
</div>
```

**بعد التغيير:**
```tsx
<div className="mt-3 flex items-center justify-between gap-2">
  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
    <span
      className="rounded-full px-2 py-0.5 font-medium"
      style={{
        backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)",
        color: "var(--primary)",
      }}
    >
      {ownerLabel(store.owner_type)}
    </span>
    {areaName ? (
      <span className="flex items-center gap-1">
        <MapPin className="h-3 w-3" /> {areaName}
      </span>
    ) : null}
    <span className="flex items-center gap-1">
      <Package className="h-3 w-3" /> {store.products_count ?? 0} منتج
    </span>
  </div>
  <span
    className="shrink-0 rounded-lg border px-3 py-1 text-xs font-bold transition group-hover:text-white"
    style={{
      borderColor: "var(--primary)",
      color: "var(--primary)",
    }}
    onMouseEnter... // لا يلزم — group-hover يكفي
  >
    زيارة المتجر
  </span>
</div>
```

**ملاحظة تقنية:** الزر `<span>` وليس `<button>` لأن البطاقة بأكملها هي `<Link>` — لا يجوز تداخل `<a>` داخل `<a>`. يُحقق نفس التأثير البصري.

**تأثير hover:** يستخدم class `group` الموجود مسبقاً على `<Link>` الجذر. يُضاف:
```
group-hover:bg-[var(--primary)] group-hover:text-white group-hover:border-[var(--primary)]
```

---

## الواجهة (TypeScript signature)

لا تغيير في props — التعديل بصري فقط داخل العرض.

```typescript
// لا تغيير على:
export function StoreCard({ store }: { store: ExploreStoreItem })
```

---

## معايير القبول

- [ ] زر "زيارة المتجر" ظاهر في الزاوية اليسرى السفلية (RTL) من صف المعلومات
- [ ] حدود بلون `var(--primary)` (تركواز في الثيم الافتراضي)
- [ ] نص "زيارة المتجر" بنفس لون `var(--primary)`
- [ ] عند hover على البطاقة: خلفية الزر تصبح `var(--primary)` والنص أبيض
- [ ] الزر لا يكسر layout على شاشات الجوال (يستخدم `shrink-0`)
- [ ] الزر `<span>` — لا `<button>` أو `<a>` داخلي لتجنب تداخل الروابط
- [ ] يحترم الثيمات الديناميكية عبر `var(--primary)` (لا قيم hex مُثبَّتة)
- [ ] لا تغيير في ارتفاع البطاقة أو layout الكارت على شاشة الموبايل

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/explore/StoreCard.tsx` | **تعديل** — إضافة زر CTA داخل صف المعلومات |

---

## مخاطر التغيير

1. **تداخل `<a>/<a>`**: الزر يجب أن يكون `<span>` لا `<a>` أو `<button>`. إذا استُخدم `<button>` داخل `<Link>`، ينبّه React بـ hydration warning.

2. **layout ضيق**: على شاشات صغيرة (`w-[280px]`) قد يتزاحم الزر مع meta طويل. الحل: إضافة `shrink-0` على الزر، و`min-w-0` على صف meta.

3. **تأثير الثيم**: الثيم الافتراضي `var(--primary)` = teal (`#0f766e`). المتاجر ذات الثيمات الملوّنة ستُطبّق لون ثيمها تلقائياً — هذا مقصود وليس خطأً.

4. **الزر في الكاروسيل**: `components-inventory.md` يذكر "عرض واحد في الكاروسيل" — الزر يعمل بنفس الطريقة بدون تعديل إضافي.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `styles/globals.css` (@theme)
- `lib/themes/` أو أي ملف theme
- `app/page.tsx` (الـ featured stores inline section لها CTA مختلف — لا داعي للتوحيد الآن)

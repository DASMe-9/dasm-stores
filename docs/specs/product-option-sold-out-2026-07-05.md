# Spec: مؤشر "نافد" المسبق على أزرار خيارات المنتج

**التاريخ:** 2026-07-05
**المصدر:** Salla Twilight v2.14.467 — out-of-stock option pre-selection indicator (2026-06-15)
**الأولوية:** عالية — يمنع إحباط المتسوق عند اختيار تشكيلة غير متوفرة

---

## السياق والمبرر

في صفحة تفصيل المنتج، المتسوق يرى قائمة أزرار الخيارات (مقاس / لون / ...). حاليًا، **جميع الأزرار تبدو متطابقة** حتى لو كانت بعض القيم لا تُفضي إلى أي تشكيلة متوفرة. يكتشف المتسوق المشكلة فقط بعد اختيار كل الخيارات — تظهر رسالة "هذه التشكيلة غير متوفرة حاليًا" (السطر 183).

Salla أطلقت في v2.14.467 (يونيو 2026) نمطًا صار معياريًا: الخيار النافد يبدو مختلفًا بصريًا قبل أي نقر — strikethrough أو opacity منخفض — فيعرف المتسوق فورًا ما المتاح.

---

## الحالة الراهنة في dasm-stores

### الملفات المعنية
- `components/product/ProductPurchaseSection.tsx` — السطر 157-179 (أزرار الخيارات)

### السلوك الحالي

كل زر خيار في `opt.values.map(...)` يُعرض بزر متطابق بصريًا — فقط "مختار / غير مختار":

```tsx
<button
  className={`... ${isSelected ? "border-primary bg-primary/10 text-primary ..." : "border-border bg-card text-muted-foreground ..."}`}
>
  {val}
</button>
```

**المشكلة:** قيمة `XL` قد تكون غير متوفرة في أي تشكيلة active لكنها تبدو بالضبط كـ `M` المتوفرة.

### منطق التحقق المتاح

الكود يمتلك بالفعل:
- `activeVariants` — قائمة التشكيلات الفعّالة (السطر 26-28)
- `selections` — الخيارات المختارة حاليًا (السطر 52)
- `selectedVariant` — التشكيلة المطابقة للاختيار الكامل (السطر 68-78)

---

## التغيير المقترح

### دالة مساعدة جديدة

تُضاف داخل المكوّن، قبل الـ return statement:

```typescript
function isOptionValueAvailable(optionName: string, value: string): boolean {
  // خيار متاح إن وُجدت تشكيلة active تحمل هذه القيمة
  // وتتوافق مع باقي الاختيارات الحالية (الخيارات الأخرى)
  return activeVariants.some((v) => {
    if (!v.option_values) return false;
    const vOpts = v.option_values as Record<string, string>;
    // يجب أن تتطابق قيمة الخيار الحالي
    if (String(vOpts[optionName]) !== String(value)) return false;
    // يجب أن تتوافق مع باقي الاختيارات الحالية (ما عدا optionName نفسه)
    for (const [key, sel] of Object.entries(selections)) {
      if (key === optionName) continue;
      if (String(vOpts[key]) !== String(sel)) return false;
    }
    return true;
  });
}
```

### تعديل زر الخيار

```tsx
{opt.values.map((val) => {
  const isSelected = selections[opt.name] === val;
  const isAvailable = isOptionValueAvailable(opt.name, val);  // ← جديد

  return (
    <button
      key={val}
      type="button"
      onClick={() => isAvailable && handleSelect(opt.name, val)}  // ← لا نقر لو نافد
      disabled={!isAvailable}                                      // ← جديد
      aria-disabled={!isAvailable}                                 // ← جديد
      className={`relative overflow-hidden rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all duration-300 ${
        !isAvailable
          ? "border-border/40 bg-card text-muted-foreground/40 cursor-not-allowed line-through"  // ← حالة نافد
          : isSelected
            ? "border-primary bg-primary/10 text-primary shadow-sm transform scale-[1.02]"
            : "border-border bg-card text-muted-foreground hover:border-border hover:bg-muted hover:scale-105"
      }`}
    >
      {isSelected && isAvailable && (
        <Check className="absolute top-1 left-1 w-3 h-3 text-primary opacity-50" />
      )}
      {val}
    </button>
  );
})}
```

### Variants

| الحالة | المظهر البصري |
|--------|---------------|
| متاح + غير مختار | حد رمادي، خلفية بطاقة، نص عادي |
| متاح + مختار | حد primary، خلفية primary/10، نص primary، check mark |
| **نافد (جديد)** | حد شفاف 40%، نص مبهت 40%، strikethrough، cursor not-allowed |

---

## معايير القبول

- [ ] خيار لا يُفضي لأي تشكيلة active يظهر بـ `line-through` + opacity مخففة
- [ ] النقر على خيار نافد لا يغيّر الـ state (onClick مقيّد بـ `isAvailable`)
- [ ] خيار نافد عند تبديل اختيار آخر يُعاد تقييمه فوريًا (reactive)
- [ ] إن كانت **جميع** قيم option نافدة، تظهر كلها كنافدة ولا يُفعَّل الزر الرئيسي
- [ ] لا تغيير على منطق المحذوفة (`isUnavailableCombination`) في السطر 182 — تبقى fallback
- [ ] Accessible: `disabled` + `aria-disabled` على الأزرار النافدة
- [ ] لا تأثير على المنتجات بدون variants (حالة `options.length === 0`)

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/product/ProductPurchaseSection.tsx` | **تعديل** — دالة `isOptionValueAvailable` + className حالة `!isAvailable` على زر الخيار |

**ملف واحد. لا dependencies خارجية جديدة.**

---

## مخاطر التغيير

1. **أداء:** `isOptionValueAvailable` تُستدعى لكل قيمة عند كل render. عدد الـ variants عادةً < 50 — الأداء مقبول بدون memo. إن وصل لـ 100+ variant، تُلف بـ `useMemo` مع variants كـ dependency.

2. **منطق غير صحيح عند selections فارغة:** في `useEffect` التهيئة، تُحدَّث `selections` بأول تشكيلة. المستخدم الذي لم يختر بعد يرى الخيارات "متاحة" بشكل صحيح لأن `Object.entries(selections)` فارغ في `isOptionValueAvailable`.

3. **strikethrough على العملة العربية:** لا مشكلة — الـ `line-through` يطبَّق على الـ text كلها بما فيها العربي بشكل صحيح.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `tailwind.config` / `styles/globals.css`
- أي ملف آخر خارج `ProductPurchaseSection.tsx`

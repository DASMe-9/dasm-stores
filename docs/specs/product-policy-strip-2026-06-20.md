# Spec: ProductPolicyStrip — شريط سياسة المنتج على صفحة التفصيل

**التاريخ:** 2026-06-20
**المصدر:** Shopify Dawn 15.5.0 — Product Disclosures section (2026-06-17) + نمط ثقة المتسوق
**الأولوية:** عالية — المتسوق لا يجد أي معلومة عن سياسة الإرجاع أو الضمان قبل الشراء؛ لا اعتماد على API

---

## السياق والمبرر

Shopify Dawn 15.5.0 أطلق قسم "Product Disclosures" المستقل على صفحة المنتج: accordion يعرض
سياسة الإرجاع والضمان ومتطلبات الامتثال مباشرةً أسفل معلومات المنتج.

في dasm-stores، صفحة تفصيل المنتج (`app/[slug]/products/[productId]/page.tsx`) لا تعرض أي
سياسة: المتسوق يرى السعر وزر "أضف للسلة" فقط، بلا ضمانات مرئية.

**أثر النمط:**
- يرفع ثقة المتسوق قبل الضغط على "أضف للسلة"
- يُقلل مخاوف ما قبل الشراء بدون تعقيد تقني (لا API جديد)
- لا يُزاحم `ProductPurchaseSection` — يُكمله

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `app/[slug]/products/[productId]/page.tsx` — صفحة تفصيل المنتج (Server Component)

**التخطيط الحالي لصفحة المنتج (grid العمود الأيمن):**
```
h1 (اسم المنتج)
SKU (اختياري)
<ProductPurchaseSection /> ← السعر + variants + زر السلة
[WhatsApp] [Share]
وصف المنتج (prose)
```

لا يوجد قسم سياسة، ضمان، أو إرجاع.

---

## التغيير المقترح

### TypeScript signature للمكوّن الجديد

```typescript
// components/product/ProductPolicyStrip.tsx
type PolicyItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
};

export function ProductPolicyStrip(): React.JSX.Element
```

لا props — المحتوى ثابت على مستوى المنصة (ليس per-store).

### تصميم المكوّن

```tsx
import { RefreshCcw, ShieldCheck, Truck } from "lucide-react";

const items: PolicyItem[] = [
  {
    icon: RefreshCcw,
    label: "إرجاع مجاني",
    detail: "خلال 14 يوم من الاستلام",
  },
  {
    icon: ShieldCheck,
    label: "دفع آمن",
    detail: "معاملات مشفّرة ومؤمّنة",
  },
  {
    icon: Truck,
    label: "توصيل سريع",
    detail: "يُشحن خلال 1–3 أيام عمل",
  },
];

export function ProductPolicyStrip() {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex flex-col items-center gap-1.5 text-center">
            <Icon className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-xs font-bold text-[var(--foreground)]">{item.label}</span>
            <span className="text-[10px] leading-tight text-[var(--muted-foreground)]">{item.detail}</span>
          </div>
        );
      })}
    </div>
  );
}
```

### الموضع في `app/[slug]/products/[productId]/page.tsx`

يُضاف بين `ProductPurchaseSection` وأزرار [WhatsApp / Share]:

```tsx
<ProductPurchaseSection ... />

{/* شريط سياسة المنتج — ثابت، لا API */}
<ProductPolicyStrip />

<div className="flex flex-wrap gap-2">
  <WhatsAppButton ... />
  <ShareButton ... />
</div>
```

### variants

| الحالة | السلوك |
|--------|--------|
| كل المنتجات | يظهر دائماً — محتوى ثابت، لا يتغير بالـ product data |
| موبايل | `grid-cols-3` يعمل من `xs` بسبب النصوص القصيرة |
| ثيمات مختلفة | يستخدم `var(--primary)`, `var(--card)`, `var(--border)` — يتكيف تلقائياً |

---

## معايير القبول

- [ ] المكوّن يظهر على جميع صفحات المنتج بغض النظر عن بيانات المنتج
- [ ] ثلاثة عناصر في شبكة أفقية (إرجاع / دفع / توصيل) — أيقونة + عنوان + وصف
- [ ] الأيقونات بلون `var(--primary)` — تتكيف مع ثيمات المتجر
- [ ] البطاقة تستخدم `var(--card)` و`var(--border)` — لا ألوان hardcoded
- [ ] الموضع: بعد `ProductPurchaseSection`، قبل أزرار WhatsApp/Share
- [ ] لا API calls إضافية — Server Component بدون data fetching
- [ ] `tsc --noEmit` نظيف بعد الإضافة

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/product/ProductPolicyStrip.tsx` | **إنشاء** — مكوّن جديد |
| `app/[slug]/products/[productId]/page.tsx` | **تعديل** — إضافة `<ProductPolicyStrip />` في الموضع المحدد |

**ملفان. مكوّن واحد جديد. import واحد.**

---

## مخاطر التغيير

1. **تضارب مع ثيمات المتجر:** مُعالَج — جميع الألوان عبر CSS variables (`--primary`, `--card`, `--border`).
2. **صحة المحتوى:** المحتوى ثابت يمثّل سياسة منصة متاجر داسم العامة، لا سياسة متجر فردي. إن احتاج تخصيص per-store لاحقاً، يُحوَّل لـ spec منفصل.
3. **RTL:** الكود يستخدم `text-center` + `flex-col` — RTL-safe.
4. **الزحام على الموبايل:** `grid-cols-3` بنصوص قصيرة (10px) — مناسب حتى `320px`.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `tailwind.config`
- `components/product/ProductCard.tsx` — مكوّن منفصل للكتالوج
- `components/product/ProductPurchaseSection.tsx` — لا تعديل على منطق السلة

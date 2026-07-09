# Spec: Product Disclosure Block — بلوك الإفصاح والثقة على صفحة المنتج

**تاريخ الإنشاء:** 2026-07-09 (W30)
**المصدر التنافسي:** Shopify Dawn 15.5.0 — Product Disclosures (2026-06-19)
**الأولوية:** عالية (فجوة ثقة مباشرة أمام زر الشراء)

---

## السياق والمبرر

Shopify Dawn 15.5.0 أضاف "product disclosures" — قسماً مخصصاً لعرض معلومات الشفافية والثقة مباشرةً على صفحة تفصيل المنتج، أسفل زر "إضافة للسلة". أثبتت الدراسات (Baymard Institute) أن عرض ضمانات الإرجاع والأصالة قرب CTA يرفع معدل التحويل 8-15%. dasm-stores لا تعرض حالياً أي معلومات ثقة على صفحة المنتج.

---

## الحالة الراهنة في dasm-stores

### الملفات المعنية

- `app/[slug]/products/[productId]/page.tsx` — صفحة تفصيل المنتج
- `components/product/` — مجلد مكوّنات المنتج (إن لزم مكوّن منفصل)

### السلوك الحالي

صفحة المنتج تعرض: صور المنتج، الاسم، السعر، الوصف، الـ variants، وزر "إضافة للسلة". لا يوجد أي قسم للثقة أو الإفصاح.

---

## التغيير المقترح

### واجهة TypeScript

```typescript
type DisclosureItem = {
  icon: "return" | "authentic" | "warranty" | "shipping";
  label: string;
};

type ProductDisclosureBlockProps = {
  items?: DisclosureItem[];
  className?: string;
};
```

### Variants

| variant | الوصف |
|---------|-------|
| `default` | 3 عناصر أفقية أيقونة + نص، بدون حد |
| `bordered` | نفس العناصر محاطة ببوردر خفيف وخلفية `var(--card)` |

### عناصر الإفصاح الافتراضية

```typescript
const DEFAULT_DISCLOSURES: DisclosureItem[] = [
  { icon: "return",    label: "إرجاع مجاني خلال 7 أيام" },
  { icon: "authentic", label: "منتج أصلي مضمون" },
  { icon: "shipping",  label: "توصيل سريع لجميع المناطق" },
];
```

### سلوك الـ States

| الحالة | السلوك |
|--------|--------|
| `default` | يعرض 3 عناصر افتراضية دائماً (static content، لا يحتاج API) |
| `loading` | لا loading state — المحتوى ثابت، يُعرض دائماً |
| `empty` | لا يُعرض البلوك إن كانت `items` مصفوفة فارغة |

---

## معايير القبول

- [ ] يظهر البلوك أسفل زر "إضافة للسلة" مباشرةً على `app/[slug]/products/[productId]/page.tsx`
- [ ] يعرض 3 عناصر افتراضية (إرجاع / أصلي / توصيل) مع أيقونة Lucide مناسبة لكل عنصر
- [ ] يدعم RTL بشكل صحيح — الأيقونة على اليمين، النص على اليسار
- [ ] يستخدم CSS design tokens (`var(--c-muted)`, `var(--c-surface)`, `var(--c-brand)`) لا ألوان hardcoded
- [ ] يتكيّف مع الـ dark mode عبر الـ tokens
- [ ] لا يُكسر أي layout قائم — يُضاف كـ `<section>` مستقل
- [ ] حجم النص `text-xs` والأيقونة `h-4 w-4` لضمان عدم التنافس مع زر CTA

---

## الملفات التي سيلمسها Cursor

```
app/[slug]/products/[productId]/page.tsx   ← إضافة <ProductDisclosureBlock /> بعد زر السلة
components/product/ProductDisclosureBlock.tsx  ← مكوّن جديد (إن لم يدمجه Cursor inline)
```

---

## مخاطر التغيير

| الخطر | التقييم | التخفيف |
|-------|---------|---------|
| تعارض مع builder stores التي تملك layout مخصصاً | منخفض | تحقق من `hasBuilderLayout` قبل العرض — لا تضف للـ builder path |
| المحتوى الافتراضي قد لا يتطابق مع سياسة كل متجر | متوسط | ابدأ بمحتوى عام صادق ("إرجاع حسب سياسة المتجر") أو اجعله store-configurable في مرحلة ثانية |
| ثقل بصري يُبعد عن زر الشراء | منخفض | حجم xs + لون مuted يضمن الهدوء البصري |

---

## استثناء: لا تمس

- الملفات في `docs/design/baseline/`
- tokens في `tailwind.config` (إلا بنص صريح)
- `components/store/StoreHeader.tsx` (خارج نطاق هذا الـ spec)
- أي ملف في `pages/dashboard/` (لوحة تحكم البائع)

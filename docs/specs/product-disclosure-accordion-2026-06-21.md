# Spec: قسم إفصاح المنتج (Product Disclosure Accordion)

## السياق والمبرر

Shopify Dawn أضاف في يونيو 2026 section وblock مخصصَين لعرض "product disclosures" على صفحة تفصيل المنتج — نص قانوني/تنظيمي اختياري يُعرض في accordion قابل للطي تحت الوصف. البيئة السعودية تتطلب هذا بشكل متزايد: عطور (مكوّنات)، مستلزمات طبية (موافقة SFDA)، مواد غذائية (صلاحية، مصدر)، وإلكترونيات (ضمان، كفالة). صفحة المنتج الحالية في dasm-stores لا تتيح أي حقل إفصاح.

## الحالة الراهنة في dasm-stores

### الملفات المعنية
- `app/[slug]/products/[productId]/page.tsx` — صفحة تفصيل المنتج (server component)
- `components/product/ProductPurchaseSection.tsx` — قسم الشراء الذي يحتوي الوصف والأزرار

### السلوك الحالي
صفحة المنتج تعرض: صورة، اسم، سعر، وصف (`product.description`)، وزر إضافة للسلة. لا يوجد حقل منفصل للمعلومات التنظيمية أو الإفصاح.

## التغيير المقترح

### الواجهة (TypeScript)

```typescript
// component جديد — داخل ProductPurchaseSection.tsx أو ملف منفصل
interface ProductDisclosureProps {
  /** نص الإفصاح كـ HTML أو نص عادي — مُخزَّن في product.notes أو حقل مخصص */
  disclosure: string;
  /** عنوان القسم — افتراضي: "معلومات المنتج الإضافية" */
  label?: string;
}
```

### المكوّن

قسم `<details>/<summary>` أصيل (أو `<button>` + `aria-expanded` لتوافق أشمل) يظهر أسفل وصف المنتج مباشرةً وفوق زر الإضافة للسلة:

```
[ معلومات المنتج الإضافية ▼ ]
─────────────────────────────
محتوى الإفصاح (نص أو HTML موثوق) يُعرض عند النقر
```

### Variants

| variant | متى يُستخدم |
|---------|-------------|
| مطوي افتراضياً | الحالة الوحيدة لتجنب إخفاء زر الشراء |

### سلوك States

| الحالة | السلوك |
|--------|--------|
| `disclosure` فارغ أو null | المكوّن لا يُعرض (conditional render) |
| مفتوح | المحتوى مرئي، يحتفظ بالتمرير |
| مغلق | المحتوى مخفي، `aria-expanded="false"` |
| loading | لا ينطبق — البيانات تأتي مع المنتج (SSR) |

## معايير القبول

- [ ] يظهر الـ accordion فقط إذا كان `product.notes` أو الحقل البديل غير فارغ
- [ ] مغلق افتراضياً، يفتح بنقرة واحدة
- [ ] يُعرض أسفل الوصف الرئيسي وفوق زر "أضف للسلة"
- [ ] يدعم RTL (النص ومتجه السهم)
- [ ] يُراعي accessibility: `role="button"`, `aria-expanded`, `aria-controls`
- [ ] لا يكسر التصميم إذا كان المحتوى طويلاً (max-height + overflow-y-auto)
- [ ] متوافق مع dark mode عبر CSS variables الموجودة

## الملفات التي سيلمسها Cursor

1. `components/product/ProductPurchaseSection.tsx` — إضافة المكوّن بعد `product.description`
2. `app/[slug]/products/[productId]/page.tsx` — تمرير `notes` أو الحقل المناسب من `product` API

## مخاطر التغيير

- **حقل API**: تأكد أن `StoreProductCard` في `lib/api-server.ts` يُعرّض `notes` أو حقلاً مناسباً. إن لم يُعرَّض، أضفه للـ type فقط وأعد التحقق.
- **HTML injection**: إذا كان المحتوى HTML، استخدم `dangerouslySetInnerHTML` فقط بعد التأكد أن البيانات تأتي من الـ API (ليست من المستخدم مباشرةً) أو مرّرها عبر sanitizer. إن كان نصاً عادياً دائماً، استخدم `{text}` مباشرةً.
- **التأثير على CLS**: كون القسم مطوياً افتراضياً يمنع أي layout shift.

## استثناء: لا تمس

- `docs/design/baseline/` — ملفات الـ baseline ثابتة
- `styles/globals.css` — الـ tokens و CSS variables الموجودة، عدّل عليها فقط إن كان ضرورياً لـ accordion state

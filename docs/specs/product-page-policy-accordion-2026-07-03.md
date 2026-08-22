# Spec: قسم سياسات المتجر على صفحة المنتج

**تاريخ الإصدار:** 2026-07-03
**المرجع التنافسي:** Shopify Dawn 15.5.0 — "Product Disclosures" section & block (2026-06-19)
**الأولوية:** أثر عالٍ / جهد منخفض

---

## السياق والمبرر

Shopify Dawn 15.5.0 أضافت قسماً رسمياً لعرض "product disclosures" — إفصاحات المنتج (سياسة الإرجاع، الضمان، تحذيرات، محتوى قانوني) مباشرة على صفحة المنتج أسفل زر "أضف للسلة". هذا النمط أصبح معياراً في منصات E-commerce الكبرى: المتسوق يريد معرفة شروط الإرجاع **في لحظة القرار**، لا بعد الشراء.

dasm-stores حالياً لا يعرض أي معلومة عن سياسة الإرجاع أو الضمان على صفحة المنتج. المتسوق مضطر للبحث عن هذه المعلومات في مكان آخر — وهو ما يرفع معدل التردد عند الشراء.

---

## الحالة الراهنة في dasm-stores

### الملفات المعنية

- `app/[slug]/products/[productId]/page.tsx` — صفحة تفصيل المنتج (server component)
- `lib/api-server.ts` — يحتوي على `getStore()` الذي يُعيد بيانات المتجر بما فيها `refund_policy` إن وُجدت

### السلوك الحالي

صفحة المنتج تعرض:
1. `ProductGallery` — معرض الصور
2. اسم المنتج + السعر + وصف
3. `ProductPurchaseSection` — زر إضافة للسلة + الخيارات
4. `ShareButton` + `WhatsAppButton`
5. `ProductReviews` — التقييمات

**لا يوجد** أي قسم يعرض سياسة الإرجاع أو الضمان أو معلومات التوصيل.

---

## التغيير المقترح

### الواجهة (TypeScript signature)

```tsx
// مكوّن جديد: components/store/StorePolicyAccordion.tsx
interface PolicyItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}

interface StorePolicyAccordionProps {
  /** نص سياسة الإرجاع من المتجر — يُعرض كما هو */
  refundPolicy?: string | null;
  /** نص الضمان أو شروط الخدمة — اختياري */
  warrantyPolicy?: string | null;
  /** اسم المتجر لعرض "سياسة [اسم المتجر]" */
  storeName: string;
}

export function StorePolicyAccordion(props: StorePolicyAccordionProps): JSX.Element
```

### Variants

| الـ variant | متى يُستخدم |
|-------------|-------------|
| `full` | المتجر لديه `refund_policy` من الـ API |
| `default` | لا توجد سياسة محددة — يعرض نصاً افتراضياً عاماً |

### سلوك States

| الحالة | السلوك |
|--------|--------|
| `refund_policy` موجودة | يعرض accordion مع النص الفعلي للمتجر |
| `refund_policy` غائبة | يعرض 3 بنود ثابتة: إرجاع خلال 7 أيام / منتج بحالته / التواصل مع المتجر |
| المتجر لديه `contact_whatsapp` | يضيف رابط WhatsApp في ذيل القسم |
| loading | لا loading state — server component يُقدَّم مكتملاً |

### التصميم البصري

```
┌─────────────────────────────────────────────┐
│ ▼ سياسة الإرجاع والضمان                    │ ← accordion header (مغلق افتراضياً)
└─────────────────────────────────────────────┘

عند الفتح:
┌─────────────────────────────────────────────┐
│ ▲ سياسة الإرجاع والضمان                    │
├─────────────────────────────────────────────┤
│ ↩ الإرجاع: [نص سياسة المتجر أو الافتراضي] │
│ ✓ الضمان: [نص ضمان أو "تواصل مع المتجر"] │
│ 📞 للاستفسار: [رابط WhatsApp إن وُجد]      │
└─────────────────────────────────────────────┘
```

- border رفيع `var(--c-line)` على الـ accordion
- icons من lucide-react: `RotateCcw`، `ShieldCheck`، `MessageCircle`
- `<details>/<summary>` HTML native للـ accordion — لا JavaScript مطلوب (server component)
- نص `text-xs text-[var(--c-muted)]` داخل الـ body

---

## معايير القبول

- [ ] يظهر القسم على صفحة تفصيل كل منتج في أي متجر
- [ ] عند وجود `refund_policy` في بيانات المتجر تُعرض السياسة الفعلية
- [ ] عند غياب `refund_policy` يُعرض نص افتراضي عام (لا يُعرض فراغ)
- [ ] الـ accordion مغلق افتراضياً، يُفتح بالضغط
- [ ] لا JavaScript مطلوب للتشغيل (`<details>/<summary>`)
- [ ] يعمل مع جميع ثيمات المتجر (يستخدم CSS tokens)
- [ ] يعمل في وضع RTL
- [ ] لا يتعارض مع `ProductReviews` المجاور

---

## الملفات التي سيلمسها Cursor

1. **إنشاء جديد:** `components/store/StorePolicyAccordion.tsx`
2. **تعديل:** `app/[slug]/products/[productId]/page.tsx`
   - استيراد `StorePolicyAccordion`
   - تمرير `storeData.store.refund_policy` و`storeData.store.name`
   - إضافة المكوّن بين `ProductPurchaseSection` و`ProductReviews`

**قراءة الـ API أولاً:** تحقق من حقل `refund_policy` الفعلي في استجابة `getStore()` بقراءة `lib/api-server.ts` — قد يكون `return_policy` أو `policies` أو غيره. إن لم يُوجد، استخدم النص الافتراضي فقط.

---

## مخاطر التغيير

| الخطر | الاحتمال | التخفيف |
|-------|----------|---------|
| حقل `refund_policy` غير موجود في الـ API | متوسط | النص الافتراضي يُغطي هذه الحالة دون إظهار فراغ |
| تعارض بصري مع بعض ثيمات المتجر | منخفض | الاستخدام الكامل لـ CSS tokens يضمن التوافق |
| إطالة صفحة المنتج بشكل مفرط | منخفض | accordion مغلق افتراضياً — لا يُضيف ارتفاعاً مرئياً |

---

## استثناء: لا تمس

- ملفات `docs/design/baseline/`
- tokens في `tailwind.config` (إلا بنص صريح)
- `ProductPurchaseSection.tsx` — منطق السلة والخيارات خارج نطاق هذا الـ spec

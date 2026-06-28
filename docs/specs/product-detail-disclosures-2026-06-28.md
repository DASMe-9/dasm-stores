# Spec: قسم إفصاحات المنتج على صفحة التفصيل

## السياق والمبرر

Shopify Dawn أضافت في 2026-06-17 قسم "Product Disclosures" مستقلاً أسفل معلومات المنتج. النمط يُمكّن التاجر من عرض إفصاحات قانونية، معلومات ضمان، أو شروط خاصة بالمنتج مباشرة لمتسوق مستعد للشراء. يزيد الثقة ويُقلّل مخاطر المرتجعات الناجمة عن التوقعات غير المُدارة.

المصدر التنافسي: `docs/research/competitors/2026-30.md` — Delta #1

---

## الحالة الراهنة في dasm-stores

### الملفات المعنية
- `app/[slug]/products/[productId]/page.tsx` — صفحة تفصيل المنتج (Server Component)
- مكوّن مقترح جديد: `components/product/ProductDisclosure.tsx`

### السلوك الحالي
`app/[slug]/products/[productId]/page.tsx` يعرض:
1. معرض صور (`ProductGallery`)
2. قسم الشراء (`ProductPurchaseSection`)
3. أزرار واتساب / مشاركة
4. وصف المنتج (`product.description`)
5. مراجعات (`ProductReviews`)

**لا يوجد** أي قسم لإفصاحات/سياسات/معلومات ضمان. التاجر لا يملك وسيلة لإيصال هذه المعلومات للمتسوق على صفحة المنتج.

---

## التغيير المقترح

### ما يظهر للمتسوق

قسم collapsible أسفل وصف المنتج (قبل المراجعات) يحمل عنوان "إفصاحات وشروط" أو "معلومات إضافية". يظهر فقط إذا كان التاجر قد ملأ حقلاً مخصصاً لهذا الغرض في إعدادات المتجر.

### مصدر البيانات المقترح

**الخيار الأفضل (أقل جهداً):** حقل نصي حر من `storeData.store.notes` أو `storeData.store.meta.disclosures` إذا كان موجوداً في الـ API. يحتاج Cursor التحقق من `getStore()` response type في `@/lib/api-server`.

**الخيار البديل إذا لم يتوفر حقل مناسب:** عرض سياسة الإرجاع العامة للمتجر إن توفرت (`store.return_policy` أو ما يقابلها).

### الواجهة (TypeScript signature)

```typescript
// components/product/ProductDisclosure.tsx
interface ProductDisclosureProps {
  text: string;          // نص الإفصاح الخام
  title?: string;        // عنوان القسم — افتراضي: "معلومات إضافية"
  defaultOpen?: boolean; // هل ينفتح افتراضياً — افتراضي: false
}

export function ProductDisclosure({
  text,
  title = "معلومات إضافية",
  defaultOpen = false,
}: ProductDisclosureProps): JSX.Element
```

### Variants

| الـ variant | الوصف | متى يُستخدم |
|-------------|--------|-------------|
| `collapsed` (default) | عنوان + أيقونة سهم، ينفتح عند النقر | النص طويل (> 120 حرفاً) |
| `expanded` | يعرض النص مباشرة بلا toggle | النص قصير |

### States

| الحالة | السلوك |
|--------|--------|
| `empty` (نص فارغ أو null) | المكوّن لا يُعرض (return null) |
| `short text` (< 120 حرف) | يعرض النص مباشرة بلا collapsible |
| `long text` (≥ 120 حرف) | collapsible — مطوي افتراضياً |
| `expanded` | النص الكامل ظاهر مع زر "إخفاء" |

---

## معايير القبول

- [ ] المكوّن لا يُعرض إذا كان النص فارغاً أو null
- [ ] عند وجود نص، يظهر القسم بعد `product.description` وقبل `ProductReviews`
- [ ] النص القصير (< 120 حرف) يُعرض مباشرة بلا toggle
- [ ] النص الطويل يبدأ مطوياً وينفتح عند النقر على العنوان أو السهم
- [ ] النص يُعرض باتجاه RTL ويحافظ على whitespace/줄바꿈
- [ ] لا يُطبّق أي تنسيق HTML خارجي على النص (نص خام `whitespace-pre-wrap`)
- [ ] يُطبَّق `var(--c-text)` للعنوان و`var(--c-muted)` لجسم النص
- [ ] يستجيب للـ dark/light mode عبر CSS tokens

---

## الملفات التي سيلمسها Cursor

```
components/product/ProductDisclosure.tsx        # مكوّن جديد — إنشاء
app/[slug]/products/[productId]/page.tsx        # إضافة <ProductDisclosure> بعد prose block
```

**قبل التنفيذ:** تحقق من نوع `StorePublic` في `@/lib/api-server.ts` للعثور على الحقل المناسب (بحث عن: `notes`, `disclosure`, `return_policy`, `policy`, `meta`).

---

## مخاطر التغيير

| المخاطرة | الاحتمالية | التخفيف |
|----------|-----------|---------|
| الحقل غير موجود في API | متوسطة | المكوّن يتلقى نصاً خارجياً — إذا لم يتوفر حقل API مناسب، يُضاف الطلب للـ backlog |
| نص تاجر طويل جداً يُشوّه التخطيط | منخفضة | `line-clamp-6` قبل التوسعة + overflow-y-auto بعدها |
| تداخل مع `product.description` الطويل | منخفضة | الفصل البصري بخط أو spacing كافٍ (mt-6 + pt-6 border-t) |

---

## استثناء: لا تمس

- ملفات `docs/design/baseline/`
- tokens في `tailwind.config` (إلا بنص صريح)
- `ProductPurchaseSection.tsx` — منطق الشراء لا يُعدَّل
- `ProductReviews.tsx` — الترتيب: Disclosure يسبق Reviews، لا يحل محلها

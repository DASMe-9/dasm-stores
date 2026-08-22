# Spec: ملخص توزيع النجوم في رأس قسم التقييمات

**تاريخ الإنشاء:** 2026-07-19
**المصدر التنافسي:** Salla Twilight v2.14.490 (2026-07-08) — multi-factor ratings & detailed review breakdowns
**الأولوية:** أثر عالٍ / جهد منخفض / بيانات متاحة من API الحالي

---

## السياق والمبرر

Salla أطلقت في v2.14.490 دعماً لـ "multi-factor ratings, detailed review breakdowns" — أبرز عنصر هو ملخص توزيع النجوم المرئي في رأس قسم التقييمات (الدرجة الكلية + شريط نسبة كل درجة من 1 إلى 5). هذا النمط صار معياراً في Amazon، Shopify، وZid. يرفع ثقة المتسوق ويختصر استعراض التقييمات الفردية.

---

## الحالة الراهنة في dasm-stores

### الملفات المعنية

| الملف | الدور |
|-------|-------|
| `components/product/ProductReviews.tsx` | المكوّن الوحيد الذي يعرض التقييمات |
| `lib/api-server.ts` (سطر 229) | نوع `StoreReview` — يحتوي: `id`, `rating`, `title`, `body`, `customer_name`, `created_at` |

### السلوك الحالي

`ProductReviews.tsx` يعرض قائمة مسطّحة:
- 5 نجوم (fill/empty) + اسم المتسوق
- عنوان التقييم (اختياري)
- نص التقييم (اختياري)

لا يوجد:
- الدرجة الكلية المجمّعة
- عدد التقييمات
- توزيع النجوم (كم مراجعة بـ 5 نجوم؟ بـ 4؟ ...)
- تاريخ التقييم (الحقل `created_at` موجود في الـ type لكن غير مُعروض)

---

## التغيير المقترح

### الواجهة (TypeScript signature)

```typescript
// لا تغيير في الـ props الخارجية:
export function ProductReviews({ reviews }: { reviews: StoreReview[] | undefined })
```

### مكوّن ReviewSummaryHeader (داخلي، داخل نفس الملف)

```typescript
function ReviewSummaryHeader({ reviews }: { reviews: StoreReview[] }) {
  // average: مجموع التقييمات / العدد
  // distribution: { 5: count, 4: count, 3: count, 2: count, 1: count }
}
```

### التخطيط البصري المقترح

```
┌─────────────────────────────────────────────────┐
│ التقييمات                              (12 تقييم) │
│                                                   │
│   ★ 4.3        5★ ████████████░░░░  8            │
│  (12 تقييم)    4★ ████░░░░░░░░░░░  3            │
│                3★ █░░░░░░░░░░░░░░  1            │
│                2★ ░░░░░░░░░░░░░░░  0            │
│                1★ ░░░░░░░░░░░░░░░  0            │
└─────────────────────────────────────────────────┘
```

**ملاحظات التنفيذ:**
- الدرجة الكلية: `(sum of ratings / count).toFixed(1)` — تُعرض مع نجمة واحدة كبيرة
- شريط كل درجة: `width: (countForLevel / total * 100)%` — شريط CSS بسيط
- الألوان: `var(--c-brand)` للشريط المملوء، `var(--c-surface-2)` للخلفية
- تاريخ التقييم الفردي: `new Date(r.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' })`

### الـ states

| الحالة | السلوك |
|--------|--------|
| لا تقييمات (`reviews.length === 0`) | الحالة الحالية — "لا توجد تقييمات بعد." بدون header |
| تقييم واحد | يُعرض الـ header (avg = الدرجة الوحيدة) بدون شريط توزيع (أو يُخفى الشريط إذا كان count < 3) |
| تقييمات متعددة | الـ header الكامل + شريط توزيع |
| `rating` خارج 1-5 | `Math.min(5, Math.max(1, rating))` — دفاعي |

---

## معايير القبول

- [ ] يظهر ملخص الدرجة الكلية (X.X ★ / N تقييم) في أعلى قسم التقييمات إذا كان `reviews.length > 0`
- [ ] تُعرض أشرطة توزيع النجوم (5 → 1) مع العدد لكل مستوى
- [ ] عرض تاريخ كل تقييم فردي (`created_at`) بجانب اسم المتسوق
- [ ] لا يتغيّر عرض قائمة التقييمات الفردية
- [ ] الحالة الفارغة (`reviews.length === 0`) تبقى كما هي
- [ ] لا يتعطل المكوّن إذا كان `created_at` فارغاً أو `undefined`
- [ ] الـ layout يعمل بـ RTL

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التعديل |
|-------|-------------|
| `components/product/ProductReviews.tsx` | إضافة `ReviewSummaryHeader` + عرض `created_at` |

**فقط هذا الملف.** لا تعديل على `lib/api-server.ts` أو أي ملف آخر.

---

## مخاطر التغيير

| الخطر | الاحتمال | التخفيف |
|-------|----------|---------|
| الدرجة الكلية تظهر لمتجر ليس لديه تقييمات | منخفض | المكوّن يُعيد `null` مبكراً إذا `reviews.length === 0` |
| `created_at` بصيغ مختلفة من الـ API | متوسط | استخدام `try/catch` حول `new Date(...)` |
| الشريط يتجاوز حدود `div` في mobile | منخفض | `max-w-full` على `div` الشريط |

---

## استثناء: لا تمس

- `docs/design/baseline/` — لا تعديل
- `tailwind.config` — لا تعديل على الـ tokens
- أي ملف خارج `components/product/ProductReviews.tsx`

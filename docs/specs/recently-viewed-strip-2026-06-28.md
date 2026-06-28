# Spec: شريط «شاهدتها مؤخراً» على صفحة تفاصيل المنتج

**التاريخ:** 2026-06-28
**المصدر:** Salla changelog — «حوّل اهتمام عميلك إلى طلب مكتمل» (W30)
**الأولوية:** عالية — أثر تحويل مباشر، صفر API calls إضافية، localStorage فقط

---

## السياق والمبرر

Salla أطلقت ميزة «شاهدتها مؤخراً» التي تحفظ تلقائياً المنتجات التي أطّلع عليها الزائر وتعرضها
أسفل صفحة تفاصيل أي منتج آخر. الهدف: استعادة الاهتمام، رفع متوسط قيمة السلة، وتقليل الـ bounce.

dasm-stores يملك `ProductViewTracker` لكنه يكتب للـ analytics فقط (لا localStorage). لا يوجد
أي شريط «شاهدتها مؤخراً» في أي صفحة في المنصة.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `app/[slug]/products/[productId]/page.tsx` — صفحة تفاصيل المنتج (Server Component)
- `components/store/ProductViewTracker.tsx` — يكتب للـ analytics فقط (`trackViewContent`)

**السلوك الحالي:**
```
صفحة المنتج:
  [Gallery]  [Purchase Section]  [Reviews]
  ← لا شريط «شاهدتها مؤخراً»
```

---

## التغيير المقترح

### بنية المكوّنات الجديدة

**1. `components/product/RecentlyViewedTracker.tsx`** — Client Component
يحفظ بيانات المنتج الحالي في localStorage عند تحميل الصفحة.

```typescript
// واجهة العنصر المحفوظ في localStorage
interface RecentlyViewedItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  storeSlug: string;
}

// المفتاح: dasm_rv_{storeSlug}
// بنية: RecentlyViewedItem[]  (الأحدث أولاً، max 8 عناصر)
```

**2. `components/product/RecentlyViewedStrip.tsx`** — Client Component
يقرأ من localStorage ويعرض شريطاً أفقياً.

```typescript
export function RecentlyViewedStrip({
  storeSlug,
  currentProductId,
}: {
  storeSlug: string;
  currentProductId: string;
}): JSX.Element | null
```

### منطق التخزين في RecentlyViewedTracker

```typescript
const STORAGE_KEY = `dasm_rv_${storeSlug}`;
const MAX_ITEMS = 8;

// عند التركيب:
const existing: RecentlyViewedItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
const filtered = existing.filter(item => item.id !== currentProductId);
const updated = [currentItem, ...filtered].slice(0, MAX_ITEMS);
localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
```

### منطق العرض في RecentlyViewedStrip

- يقرأ `dasm_rv_{storeSlug}` من localStorage
- يستثني `currentProductId` من القائمة
- يعرض فقط إذا بقي عنصر واحد أو أكثر
- يُعيد `null` إن كانت القائمة فارغة

### States

| الحالة | السلوك |
|--------|--------|
| localStorage فارغ أو كل العناصر هي المنتج الحالي | الشريط مخفي تماماً (لا فراغ) |
| 1–7 منتجات محفوظة | يعرض الشريط بعدد العناصر المتاحة |
| 8 منتجات | يعرض أحدث 7 (بعد استثناء الحالي) بـ overflow-x-auto |
| localStorage غير متاح (SSR / private mode) | يُعيد null بصمت (try/catch حول localStorage) |

### الموضع في صفحة تفاصيل المنتج

يُضاف **بعد** `<ProductReviews>` مباشرة:

```tsx
// في app/[slug]/products/[productId]/page.tsx
// ...بعد ProductViewTracker...
<RecentlyViewedTracker
  storeSlug={slug}
  productId={String(product.id)}
  productName={product.name}
  price={Number(product.price)}
  imageUrl={primaryImageUrl ?? null}
/>

// ...بعد ProductReviews...
<RecentlyViewedStrip
  storeSlug={slug}
  currentProductId={String(product.id)}
/>
```

### تصميم الشريط (بصري)

```
── شاهدتها مؤخراً ───────────────────────────────────
[img] اسم   [img] اسم   [img] اسم   [img] اسم  →scroll
  سعر رس      سعر رس      سعر رس      سعر رس
```

- كل بطاقة: صورة مربعة 80×80px + اسم مقتصر سطر + سعر
- Scroll أفقي على الموبايل (`overflow-x-auto scrollbar-hide`)
- كل بطاقة تأخذ `w-36 shrink-0` أو `w-40`
- ألوان: متسقة مع token `var(--c-surface-2)` / `var(--c-brand)`

---

## معايير القبول

- [ ] شراء/زيارة 3 منتجات مختلفة في نفس المتجر → يظهر الشريط على المنتج الثالث
- [ ] يُستثنى المنتج الحالي دائماً من الشريط
- [ ] الشريط مخفي عند الزيارة الأولى (localStorage فارغ) — لا فراغ أو placeholder
- [ ] لا SSR error — كلا المكوّنين `"use client"` ويستخدمان `useEffect` للوصول للـ localStorage
- [ ] يعمل في وضع التصفح الخاص (Private) بصمت — try/catch يمنع crash
- [ ] الانتقال لمنتج من الشريط يحدّث localStorage ويُزيل المنتج المنتقَل إليه من القائمة

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/product/RecentlyViewedTracker.tsx` | **جديد** — Client Component يحفظ في localStorage |
| `components/product/RecentlyViewedStrip.tsx` | **جديد** — Client Component يقرأ ويعرض الشريط |
| `app/[slug]/products/[productId]/page.tsx` | **تعديل** — استيراد وإضافة المكوّنين الجديدين |

**ثلاثة ملفات. لا تعديل على API. لا dependencies جديدة.**

---

## مخاطر التغيير

1. **Hydration mismatch:** كلا المكوّنين Client Components تستخدم `useEffect` — لا خطر SSR mismatch.

2. **localStorage quota:** كل عنصر ~200 bytes × 8 عناصر = ~1.6 KB/متجر. مساحة آمنة جداً.

3. **مزامنة tabs متعددة:** إن فتح المستخدم منتجات في tabs متعددة قد يكون الترتيب غير دقيق. مقبول — هذا سلوك معتاد في كل تطبيقات recently-viewed.

4. **تعارض مع ProductViewTracker:** لا تعارض — `RecentlyViewedTracker` يكمل `ProductViewTracker`، لا يستبدله. كلاهما يُركَّب في نفس الصفحة بشكل مستقل.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `tailwind.config` أو `styles/globals.css`
- `components/store/ProductViewTracker.tsx` — لا تعدّل عليه، فقط أضف مكوّنين جديدين بجانبه
- أي ملف خارج الثلاثة المذكورة أعلاه

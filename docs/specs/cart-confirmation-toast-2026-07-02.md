# Spec: Cart Confirmation Toast

## السياق والمبرر

Salla رسّمت في أبريل 2026 (مقالة "Theme design options") نافذة تأكيد خفيفة بعد الإضافة للسلة كخيار تصميمي قياسي لصفحات المنتج. النمط السائد في السوق السعودي الآن هو **toast/popup خفيف** يؤكد الإضافة ويمنح المتسوق خياري "تابع التسوق" أو "انتقل للسداد" — بدلاً من فتح drawer كامل يُعيق تصفح المنتجات.

الحالة الراهنة في dasm-stores: كل إضافة للسلة تفتح `CartDrawer` الكامل (`components/cart/CartDrawer.tsx`) عبر `cartStore.openDrawer()`. هذا يقاطع تجربة التصفح ويُبطئ المتسوق الذي يجمع أكثر من منتج.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `store/cartStore.ts` — `openDrawer()` يُستدعى عند كل إضافة ناجحة للسلة
- `components/cart/CartDrawer.tsx` — الـ drawer الكامل (موجود ومستقل، يبقى كما هو)
- `app/[slug]/products/[productId]/page.tsx` — صفحة تفصيل المنتج (موقع الإضافة الأساسي)
- `components/product/ProductGrid.tsx` — شبكة المنتجات (quick-add مستقبلي)

**السلوك الحالي:**
```ts
// في store/cartStore.ts
addItem(item) {
  // ... إضافة للـ state
  get().openDrawer()  // ← يفتح CartDrawer الكامل دائماً
}
```

---

## التغيير المقترح

### المفهوم

بدلاً من فتح الـ drawer تلقائياً عند كل إضافة: يظهر toast خفيف لمدة 3–4 ثوانٍ يمنح المتسوق خيار "تابع التسوق" (التوست يُغلق) أو "عرض السلة" (يفتح الـ CartDrawer). الـ CartDrawer يبقى في مكانه — يُفتح بزر السلة في الهيدر أو من التوست.

### الواجهة (TypeScript signature)

```ts
// components/cart/CartToast.tsx
type CartToastProps = {
  /** اسم المنتج المُضاف */
  productName: string;
  /** السعر بـ ر.س */
  price: number;
  /** رابط صورة المنتج (اختياري) */
  imageSrc?: string | null;
  /** عدد العناصر الحالي في السلة (يُعرض في زر "عرض السلة") */
  cartCount: number;
  /** callback لفتح CartDrawer */
  onViewCart: () => void;
  /** callback عند إغلاق التوست */
  onDismiss: () => void;
};
```

```ts
// إضافة لـ store/cartStore.ts
type CartToastState = {
  productName: string;
  price: number;
  imageSrc?: string | null;
} | null;

// الحالة الجديدة
toast: CartToastState;
showToast: (data: CartToastState) => void;
dismissToast: () => void;
```

### Variants

| variant | الوصف |
|---------|-------|
| `default` | صورة + اسم منتج + سعر + زران |
| `no-image` | بدون صورة (صورة المنتج غير متاحة) |

### سلوك States

| الحالة | السلوك |
|--------|--------|
| **إضافة ناجحة** | يظهر التوست مع اسم المنتج والسعر — auto-dismiss بعد 4 ثوانٍ |
| **ضغط "عرض السلة"** | يُغلق التوست، يفتح CartDrawer |
| **ضغط "تابع التسوق"** | يُغلق التوست، لا شيء آخر |
| **auto-dismiss** | يختفي بـ fade-out بعد 4 ثوانٍ بدون تفاعل |
| **إضافة جديدة أثناء ظهور توست سابق** | يُحدَّث التوست للمنتج الجديد، يُعاد عدّ الـ 4 ثوانٍ |
| **خطأ في الإضافة** | لا يظهر التوست — معالجة الخطأ منفصلة |

---

## معايير القبول

- [ ] يظهر التوست في الركن الأسفل يسار الشاشة (RTL: يسار = بداية) عند إضافة أي منتج بنجاح
- [ ] يعرض: اسم المنتج (line-clamp-1) + السعر بـ "ر.س" + عداد عناصر السلة الحالية
- [ ] يختفي تلقائياً بعد 4 ثوانٍ أو عند الضغط على "تابع التسوق"
- [ ] "عرض السلة" يفتح CartDrawer الكامل
- [ ] لا يتراكم توستات متعددة — توست واحد فقط
- [ ] يعمل على الموبايل والـ desktop
- [ ] **CartDrawer لا يُفتح تلقائياً عند الإضافة** (السلوك الحالي يُحذف من `addItem`)
- [ ] CartDrawer يُفتح عند ضغط أيقونة السلة في الهيدر (السلوك الحالي يبقى)

---

## الملفات التي سيلمسها Cursor

| الملف | التعديل |
|-------|---------|
| `components/cart/CartToast.tsx` | **جديد** — مكوّن التوست كاملاً |
| `store/cartStore.ts` | إضافة `toast`, `showToast`, `dismissToast` + حذف `openDrawer()` من داخل `addItem` |
| `app/[slug]/layout.tsx` | تركيب `<CartToast>` جانب `<CartDrawer>` (client island) |

---

## مخاطر التغيير

| الخطر | الاحتمال | التخفيف |
|-------|---------|---------|
| المتسوق لا يلاحظ أن المنتج أُضيف للسلة (التوست يُقفل سريعاً) | متوسط | مدة 4 ثوانٍ + اهتزاز أيقونة السلة في الهيدر |
| تعارض مع Sticky Cart Bar المستقبلي (`sticky-mini-cart-bar-2026-06-15.md`) | منخفض | التوست في الأسفل، الـ sticky bar في الأعلى — لا تعارض |
| السلوك القديم (drawer يفتح) مُرتبط بـ quick-add specs المعلقة | منخفض | specs quick-add لم تُنفَّذ بعد — Cursor يطبق التوست أولاً |

---

## استثناء: لا تمس

- `components/cart/CartDrawer.tsx` — لا تعديل على الـ drawer نفسه
- الملفات في `docs/design/baseline/`
- tokens في `tailwind.config` أو `lib/themes/storefront-tokens.ts`

# Spec: CartToast — تأكيد إضافة منتج للسلة

**التاريخ:** 2026-08-03
**المصدر:** Salla `salla-cart-summary-card` v2.14.490 (W31) + ideas-backlog 2026-06-15
**الأولوية:** عالية — كل عملية إضافة للسلة تفتح الآن درار كامل؛ التأكيد الخفيف يُعيد التحكم للمتسوق

---

## السياق والمبرر

عند إضافة أي منتج للسلة في متاجر داسم، يُفتح `CartDrawer.tsx` (درار جانبي كامل). هذا السلوك:

1. **يُقاطع** تجربة التصفح — المتسوق مضطر لإغلاق الدرار قبل الاستمرار
2. **ثقيل بصرياً** للإضافة العادية (خاصة عند التصفح السريع لمنتجات متعددة)
3. **مخالف للمعيار السائد:** Salla شحنت `salla-cart-summary-card` في v2.14.490، Shopify يعتمد Quick Buy Toast — كلاهما يعرض تأكيداً خفيفاً يختفي تلقائياً بدون مقاطعة التصفح

الحل: `CartToast` — نافذة صغيرة تظهر أسفل اليسار (RTL: أسفل اليمين) تعرض المنتج المُضاف، تُغلق تلقائياً بعد 4 ثوانٍ أو بنقرة المتسوق.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**

| الملف | الدور الحالي |
|-------|-------------|
| `store/cartStore.ts` | Zustand store — يحتوي `cartItems`, `addItem()`, `removeItem()` إلخ |
| `components/cart/CartDrawer.tsx` | يُفتح عند كل إضافة للسلة |
| `components/store/StoreChrome.tsx` | يُرنّدر `CartDrawer` — نقطة مثالية لإضافة `CartToast` |

**السلوك الحالي:**
```
addItem() → CartDrawer فتح كامل → المتسوق يُغلق الدرار → يعود للتصفح
```

**السلوك المستهدف:**
```
addItem() → CartToast يظهر (4 ثوانٍ) → يختفي تلقائياً / المتسوق يختار: "السلة" أو X
```
CartDrawer يبقى كما هو — يُفتح فقط عند النقر على "عرض السلة" في الـ toast أو على أيقونة السلة.

---

## التغيير المقترح

### 1. TypeScript — إضافة state للـ cartStore

```typescript
// في store/cartStore.ts — إضافة state فقط:
interface CartStore {
  // ... (الحقول القائمة)
  lastAddedProduct: { id: string; name: string; price: number; imageUrl?: string } | null;
  clearLastAdded: () => void;
}

// في create():
lastAddedProduct: null,
clearLastAdded: () => set({ lastAddedProduct: null }),

// في addItem() — بعد منطق الإضافة الحالي:
set({ lastAddedProduct: { id, name, price, imageUrl } });
```

### 2. مكوّن `CartToast` — جديد

**الملف:** `components/cart/CartToast.tsx`

```typescript
"use client";

interface CartToastProps {
  product: { name: string; price: number; imageUrl?: string };
  storeSlug: string;
  onDismiss: () => void;
}
```

**Variants:**

| الحالة | السلوك |
|--------|--------|
| ظاهر | أنيميشن من الأسفل (translate-y-0) + backdrop خفيف |
| إغلاق تلقائي | بعد 4000ms — `setTimeout` يستدعي `onDismiss()` |
| إغلاق يدوي | زر × أو النقر على "عرض السلة" يستدعي `onDismiss()` |
| غائب | `null` — لا وجود في DOM (مشروط على `lastAddedProduct`) |

**التخطيط البصري:**
```
┌────────────────────────────────────┐
│  [صورة]  اسم المنتج          ×   │
│  [img]   ٨٥.٠٠ ر.س               │
│  ─────────────────────────────    │
│  [عرض السلة ←]  متابعة التسوق    │
└────────────────────────────────────┘
موضع: fixed، bottom-4 start-4 (RTL: أسفل اليمين)
عرض: max-w-xs sm:max-w-sm
```

**Tailwind classes الأساسية:**
```
fixed bottom-4 start-4 z-50 w-80 rounded-2xl border border-[var(--c-line)]
bg-[var(--c-surface)] shadow-[var(--shadow-lg)] p-4
```

### 3. تعديل `StoreChrome.tsx`

```typescript
// استيراد:
import { CartToast } from "@/components/cart/CartToast";
import { useCartStore } from "@/store/cartStore";

// داخل المكوّن:
const { lastAddedProduct, clearLastAdded } = useCartStore();

// في الـ JSX — بعد `<CartDrawer>`:
{lastAddedProduct ? (
  <CartToast
    product={lastAddedProduct}
    storeSlug={slug}
    onDismiss={clearLastAdded}
  />
) : null}
```

---

## معايير القبول

- [ ] الـ toast يظهر فور استدعاء `addItem()` أياً كانت الصفحة (catalog، product detail، homepage)
- [ ] يختفي تلقائياً بعد 4 ثوانٍ دون أي تفاعل
- [ ] زر × يُغلقه فوراً
- [ ] "عرض السلة" يفتح `CartDrawer` (أو ينتقل لـ `/${slug}/cart`) ويُغلق الـ toast
- [ ] "متابعة التسوق" يُغلق الـ toast فقط
- [ ] لا يُفتح `CartDrawer` تلقائياً بعد إضافة المنتج (الدرار يبقى مغلقاً إلا بنقرة صريحة)
- [ ] يدعم dark mode عبر `var(--c-surface)` و`var(--c-line)`
- [ ] لا يتراكم — إضافة منتج جديد تُعيد ضبط الـ timer وتُحدّث محتوى الـ toast
- [ ] accessible: `role="status" aria-live="polite"`، زر الإغلاق مع `aria-label`
- [ ] لا يظهر على صفحة الـ checkout (`/${slug}/checkout`)

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `store/cartStore.ts` | **تعديل** — إضافة `lastAddedProduct` state + `clearLastAdded()` |
| `components/cart/CartToast.tsx` | **جديد** — مكوّن standalone |
| `components/store/StoreChrome.tsx` | **تعديل** — استدعاء `CartToast` + ربط الـ state |

**3 ملفات. لا تعديل على `CartDrawer.tsx` (يبقى كما هو للاستخدام المتعمد).**

---

## مخاطر التغيير

1. **التداخل مع CartDrawer:** يجب أن تتوقف `CartDrawer` عن الفتح التلقائي بعد `addItem()`. إن كان `CartDrawer` يستمع لتغيير `cartItems.length` للفتح، يلزم نقل هذا المنطق لزر صريح. تحقق من `StoreChrome.tsx` قبل التنفيذ.

2. **Race condition مع إضافات متعددة:** إضافة منتجين بسرعة تُعيد toast واحد (آخر منتج). هذا سلوك مقبول — الـ timer يُعاد ضبطه مع كل إضافة.

3. **الموضع على الموبايل:** `start-4 bottom-4` قد يتعارض مع Sticky Cart Bar إن نُفّذت مستقبلاً. الحل: إضافة `bottom-16` عند وجودها (props أو media query).

4. **صورة المنتج:** `imageUrl` اختياري — عرض `fallback` (أيقونة package) إن لم تتوافر صورة.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `tailwind.config` / `styles/globals.css`
- `components/cart/CartDrawer.tsx` — لا تُعدّل سلوكه الداخلي
- أي ملف في `app/` خارج تعديل `StoreChrome` إن كان ضرورياً

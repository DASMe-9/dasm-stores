# Spec: Cart Add Toast — تأكيد خفيف عند إضافة منتج للسلة

**التاريخ:** 2026-06-17
**المصدر:** تحليل Salla Quick Buy trends (W30) + ideas-backlog 2026-06-15
**الأولوية:** عالية — كل إضافة منتج تعرض drawer كامل؛ النمط ثقيل لتفاعل سريع

---

## السياق والمبرر

عندما يضغط المتسوق على "أضف للسلة" في `ProductPurchaseSection.tsx`، تُستدعى `openDrawer()` مباشرة →
يفتح `CartDrawer` بعرض كامل وخلفية داكنة وتمرير المحتوى خلفه.

هذا السلوك مناسب لمراجعة السلة، لكنه **ثقيل جداً** كتأكيد لعملية إضافة فردية. المتسوق الذي يُضيف
منتجاً واحداً ثم يريد مواصلة التصفح يُجبَر على إغلاق الـ drawer أولاً.

كل المنافسين الرئيسيين (Salla، Zid، Shopify Dawn) انتقلوا لنموذج "toast خفيف" → "اعرض السلة" عند الحاجة.
Salla تُعزز هذا التوجه بـ Quick Buy (bypass cart) مما يعكس رغبة في تدفق شراء أخف.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `components/product/ProductPurchaseSection.tsx` — السطر 124: `openDrawer()` يُستدعى مباشرة بعد `addItem()`
- `store/cartStore.ts` — لا يوجد `toastItem` state أو آلية toast
- `components/store/StoreChrome.tsx` — يحتوي CartDrawer + WhatsAppFab + (قريباً) StickyCartBar

**السلوك الحالي:**

```
handleAdd() في ProductPurchaseSection:
  ensureStoreSlug(slug)
  addItem({ ... })
  trackAddToCart(...)
  openDrawer()  ← يفتح CartDrawer كاملاً فوراً
```

```
CartDrawer:
  fixed inset-0 z-50  ← يغطي الشاشة كاملاً
  backdrop-blur-sm    ← يُعتم الخلفية
  max-w-md sidebar    ← يظهر من يمين الشاشة
```

---

## التغيير المقترح

### 1. إضافة toast state إلى `store/cartStore.ts`

```typescript
// إضافة للـ CartState type:
toastItem: CartItem | null;
showToast: (item: CartItem) => void;
dismissToast: () => void;

// إضافة للـ implementation:
toastItem: null,

showToast: (item: CartItem) => {
  set({ toastItem: item });
  // Auto-dismiss بعد 4 ثوانٍ
  setTimeout(() => set({ toastItem: null }), 4000);
},

dismissToast: () => set({ toastItem: null }),
```

**ملاحظة:** `toastItem` لا يُضاف لـ `partialize` — لا يُخزَّن في localStorage (session-only).

### 2. ملف جديد — `components/cart/CartAddToast.tsx`

```typescript
'use client';

import { useCartStore } from "@/store/cartStore";
import { ShoppingBag, X, ShoppingCart } from "lucide-react";

export function CartAddToast({ slug }: { slug: string })
```

**منطق الظهور:**
- يظهر عندما `toastItem !== null`
- يختفي تلقائياً بعد 4 ثوانٍ (timeout في `showToast`)
- يختفي فور ضغط X أو "عرض السلة"

**واجهة الـ state من cartStore:**

```typescript
const item    = useCartStore((s) => s.toastItem);
const dismiss = useCartStore((s) => s.dismissToast);
const open    = useCartStore((s) => s.openDrawer);
```

**الحالات:**

| الحالة | السلوك |
|--------|--------|
| `toastItem === null` | `return null` — لا شيء |
| `toastItem !== null` | Toast يظهر بـ `animate-in slide-in-from-bottom-4` |
| بعد 4 ثوانٍ | يختفي تلقائياً |
| ضغط X | `dismissToast()` |
| ضغط "عرض السلة" | `dismissToast()` ثم `openDrawer()` |

**البنية البصرية:**

```
fixed bottom-20 left-1/2 -translate-x-1/2   ← فوق StickyCartBar
sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0  ← bottom-right على desktop
z-50
w-[calc(100%-2rem)] max-w-sm
rounded-2xl border border-[var(--border)]
bg-[var(--card)] shadow-xl
p-3
```

محتوى الـ toast (RTL):

```tsx
<div className="flex items-center gap-3">
  {/* صورة مصغّرة للمنتج */}
  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--muted)]">
    {item.image ? (
      <img src={item.image} alt="" className="h-full w-full object-cover" />
    ) : (
      <div className="flex h-full items-center justify-center">
        <ShoppingBag className="h-6 w-6 text-[var(--muted-foreground)]" />
      </div>
    )}
  </div>

  {/* النص */}
  <div className="min-w-0 flex-1">
    <p className="text-xs font-bold text-[var(--muted-foreground)]">أُضيف للسلة ✓</p>
    <p className="line-clamp-1 text-sm font-semibold text-[var(--foreground)]">{item.name}</p>
    <p className="text-xs text-[var(--muted-foreground)]">{item.price.toFixed(0)} ر.س</p>
  </div>

  {/* أزرار */}
  <div className="flex shrink-0 flex-col items-end gap-1.5">
    <button onClick={dismiss} aria-label="إغلاق" className="rounded-lg p-1 hover:bg-[var(--muted)]">
      <X className="h-4 w-4 text-[var(--muted-foreground)]" />
    </button>
    <button
      onClick={() => { dismiss(); open(); }}
      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition hover:opacity-90"
      style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
    >
      <ShoppingCart className="h-3.5 w-3.5" />
      عرض السلة
    </button>
  </div>
</div>
```

### 3. تعديل `components/product/ProductPurchaseSection.tsx`

```typescript
// استبدال:
import { useCartStore } from "@/store/cartStore";
// إضافة استخدام showToast بدلاً من openDrawer في handleAdd:

const showToast = useCartStore((s) => s.showToast);
// حذف:
// const openDrawer = useCartStore((s) => s.openDrawer);

// في handleAdd() — السطر 124:
// قبل:
openDrawer();
// بعد:
showToast({
  productId: product.id,
  variantId: selectedVariant?.id,
  name: product.name + (selectedVariant ? ` - ${selectedVariant.name}` : ""),
  price: unitPrice,
  quantity: 1,
  image: primaryImage,
});
```

### 4. تعديل `components/store/StoreChrome.tsx`

```tsx
import { CartAddToast } from "@/components/cart/CartAddToast";

// داخل return:
<>
  {/* ... المكوّنات الحالية ... */}
  <CartDrawer slug={slug} />
  <WhatsAppFab phone={whatsapp} />
  <StickyCartBar slug={slug} />     {/* من spec سابق */}
  <CartAddToast slug={slug} />      {/* الجديد */}
</>
```

---

## معايير القبول

- [ ] Toast يظهر فور ضغط "أضف للسلة" (لا تأخير ملحوظ)
- [ ] Toast يحتوي صورة المنتج، اسمه، وسعره
- [ ] Toast يختفي تلقائياً بعد 4 ثوانٍ
- [ ] زر X يُغلق Toast فوراً
- [ ] زر "عرض السلة" يُغلق Toast ويفتح CartDrawer
- [ ] CartDrawer لا يفتح تلقائياً عند الإضافة (الـ drawer يُفتح فقط بـ "عرض السلة")
- [ ] Toast لا يتعارض بصرياً مع StickyCartBar على الموبايل (يظهر فوقه)
- [ ] Toast على desktop يظهر أسفل يمين الشاشة (bottom-right)
- [ ] `toastItem` لا يُخزَّن في localStorage — يختفي عند تحديث الصفحة
- [ ] لا hydration mismatch — `return null` حتى client mount

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `store/cartStore.ts` | **تعديل** — إضافة `toastItem`, `showToast`, `dismissToast` |
| `components/cart/CartAddToast.tsx` | **إنشاء جديد** (Client Component) |
| `components/store/StoreChrome.tsx` | **تعديل** — إضافة `<CartAddToast slug={slug} />` |
| `components/product/ProductPurchaseSection.tsx` | **تعديل** — استبدال `openDrawer()` بـ `showToast(item)` |

---

## مخاطر التغيير

1. **Hydration mismatch:** `toastItem` يُقرأ من Zustand client-side. يجب `return null` حتى mount. نفس نمط `CartBadge.tsx` و`StickyCartBar`.

2. **Auto-dismiss timeout leak:** الـ `setTimeout` داخل `showToast` يجب أن يُلغى إذا فُتح toast جديد قبل انتهاء الـ 4 ثوانٍ. حل: استخدام `clearTimeout(prev)` قبل `setTimeout` الجديد:
   ```typescript
   let _toastTimer: ReturnType<typeof setTimeout> | null = null;
   showToast: (item) => {
     if (_toastTimer) clearTimeout(_toastTimer);
     set({ toastItem: item });
     _toastTimer = setTimeout(() => set({ toastItem: null }), 4000);
   },
   ```

3. **CartDrawer الحالي:** يُفتح الـ drawer عبر `openDrawer()` في أماكن أخرى (CartBadge، StickyCartBar). هذه المسارات **لا تتأثر** — التعديل محصور في `ProductPurchaseSection.handleAdd()` فقط.

4. **تعارض z-index:** Toast بـ `z-50` يجب أن يكون مرئياً فوق StickyCartBar (`z-40`) ولكن تحت CartDrawer (`z-50`). استخدام `z-[55]` للـ toast يضمن الترتيب.

5. **RTL والموقع:** على الشاشات الصغيرة يُمركز Toast أفقياً (`left-1/2 -translate-x-1/2`) لتجنب اقتصاص النص في RTL.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `styles/globals.css`
- `components/cart/CartDrawer.tsx` — لا تعديل على الـ drawer نفسه
- `store/cartStore.ts` — يُسمح بالإضافة فقط، لا حذف لـ actions القائمة
- `app/[slug]/cart/page.tsx` — لا تعديل على صفحة السلة

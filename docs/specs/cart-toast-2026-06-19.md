# Spec: CartToast — إشعار خفيف عند إضافة منتج للسلة

**التاريخ:** 2026-06-19
**المصدر:** نمط Salla cart UX + Twilight 2.14.420 loyalty interaction (W30) + ideas-backlog 2026-06-15
**الأولوية:** عالية — يُغلق فجوة UX أساسية: المتسوق لا يتلقى تأكيداً فورياً عند الإضافة إلا عبر فتح Drawer كامل

---

## السياق والمبرر

عند استدعاء `addItem()` في `store/cartStore.ts`، يُفتح `CartDrawer` بالكامل (`openDrawer()`). هذا يقاطع التجربة — المتسوق الذي يُضيف عدة منتجات متتالية يُجبر على إغلاق Drawer يدوياً بين كل إضافة.

Salla تستخدم toast خفيفاً (2–3 ث) يظهر في الزاوية مع اسم المنتج وعدد السلة وزر "عرض السلة". الـ Drawer يبقى مغلقاً حتى ينقر المتسوق "عرض السلة" أو أيقونة السلة.

الفارق: **addItem → Drawer** يُعيق التسوق المتواصل؛ **addItem → Toast** يُتيحه.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**

| الملف | الحالة |
|-------|--------|
| `store/cartStore.ts` | يحتوي `openDrawer` / `closeDrawer` / `drawerOpen` + `addItem` |
| `components/cart/CartDrawer.tsx` | يُعرض عند `drawerOpen === true` |

**السلوك الحالي لـ `addItem`:**

لا يوجد `toastItem` state في الـ store. عند الإضافة، يُفتح الـ Drawer مباشرة (يُستدعى `openDrawer` من المكوّن الذي يستدعي `addItem`).

**المشكلة:** إضافة منتجين متتاليين تفتح Drawer بعد الأولى مما يُعيق نقر الثانية.

---

## التغيير المقترح

### 1. إضافة `toastItem` state إلى `cartStore.ts`

```typescript
// إضافات على CartState type:
toastItem: CartItem | null;
showToast: (item: CartItem) => void;
dismissToast: () => void;
```

```typescript
// القيم الابتدائية:
toastItem: null,

showToast: (item) => set({ toastItem: item }),
dismissToast: () => set({ toastItem: null }),
```

**ملاحظة:** لا تغيير على `openDrawer`، `closeDrawer`، أو `drawerOpen`. الـ Drawer يبقى كما هو للمستخدمين الذين ينقرون أيقونة السلة.

### 2. مكوّن `components/cart/CartToast.tsx` (جديد)

```typescript
interface CartToastProps {
  storeSlug: string;
}
```

**السلوك:**
- يقرأ `toastItem` و `count` من `useCartStore`
- إن كان `toastItem !== null`، يُعرض overlay ثابت في الزاوية العلوية-اليسرى (RTL: يسار = end)
- بعد 2.8 ث من الظهور، يستدعي `dismissToast()` تلقائياً
- النقر على "عرض السلة" يستدعي `openDrawer()` ثم `dismissToast()`
- النقر على × يستدعي `dismissToast()` فقط

**TypeScript signature:**
```typescript
export function CartToast({ storeSlug }: CartToastProps): JSX.Element | null
```

**variants:**

| الحالة | السلوك |
|--------|--------|
| `toastItem === null` | يُعيد `null` — لا DOM |
| `toastItem !== null` | يُعرض toast مع animation slide-in |
| انتهاء 2.8 ث | auto-dismiss بـ `dismissToast()` |
| نقر "عرض السلة" | `openDrawer()` ثم `dismissToast()` |
| نقر × | `dismissToast()` |

**بنية JSX المقترحة:**
```tsx
<div
  role="status"
  aria-live="polite"
  className="fixed end-4 top-20 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 animate-slide-in-right"
>
  <div className="flex items-start gap-3">
    {/* صورة مصغرة أو أيقونة ShoppingCart */}
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
      <ShoppingCart className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">أُضيف للسلة</p>
      <p className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-zinc-100">
        {toastItem.name}
      </p>
      <p className="text-xs text-slate-500 dark:text-zinc-400">
        {count()} {count() === 1 ? "منتج" : "منتجات"} في السلة
      </p>
    </div>
    <button onClick={dismissToast} aria-label="إغلاق" className="...">
      <X className="h-4 w-4" />
    </button>
  </div>
  <Link
    href={`/${storeSlug}/cart`}
    onClick={() => { openDrawer(); dismissToast(); }}
    className="mt-3 block w-full rounded-xl bg-slate-950 py-2 text-center text-xs font-bold text-white dark:bg-zinc-700 hover:bg-emerald-700"
  >
    عرض السلة
  </Link>
</div>
```

### 3. تعديل استدعاء `addItem` في المكوّنات

أي مكوّن يستدعي حالياً `addItem()` ثم `openDrawer()` يُعدَّل ليستدعي `showToast(item)` بدلاً من `openDrawer()`.

الملفات الأكثر احتمالاً لاحتواء `openDrawer()` بعد `addItem()`:
- `components/product/AddToCartButton.tsx` (إن وجد)
- أي مكوّن `"use client"` يستدعي `useCartStore`

---

## معايير القبول

- [ ] بعد `addItem` يظهر toast في الزاوية العلوية بدلاً من فتح Drawer
- [ ] Toast يختفي تلقائياً بعد 2.8 ث دون تدخل المستخدم
- [ ] نقر × يُخفي Toast فوراً
- [ ] نقر "عرض السلة" يفتح CartDrawer ويُخفي Toast
- [ ] إضافة منتج ثانٍ أثناء ظهور Toast: يُحدَّث Toast بالمنتج الجديد (timer يُعاد تشغيله)
- [ ] `role="status"` و `aria-live="polite"` موجودان للـ accessibility
- [ ] لا ظهور على `xs` إن أعاق التفاعل — اختبار على الموبايل الصغير
- [ ] `drawerOpen` يبقى `false` حتى ينقر المستخدم "عرض السلة" أو أيقونة السلة في الهيدر

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `store/cartStore.ts` | **تعديل** — إضافة `toastItem`, `showToast`, `dismissToast` |
| `components/cart/CartToast.tsx` | **جديد** — المكوّن كاملاً |
| مكوّن(ات) تستدعي `openDrawer` بعد `addItem` | **تعديل** — استبدال `openDrawer()` بـ `showToast(item)` |
| `app/[slug]/layout.tsx` أو الـ Chrome | **تعديل** — mount لـ `<CartToast storeSlug={slug} />` |

---

## مخاطر التغيير

1. **فقدان إشعار الإضافة على الموبايل الصغير:** إن كان Toast مخفياً على `xs`، يفقد المتسوق التأكيد. الحل: إبقاء Toast على الموبايل مع تقليص العرض (`w-60` بدلاً من `w-72`).

2. **تعارض مع `storeSwitchNotice`:** الـ store لديه بالفعل `storeSwitchNotice` banner. لا تعارض — `toastItem` و`storeSwitchNotice` حالتان مستقلتان.

3. **Timer Leak:** `useEffect` للـ timer يجب أن يُلغى عند unmount أو عند تغيير `toastItem`. استخدام `clearTimeout` في cleanup.

4. **تكرار إضافة نفس المنتج:** كل استدعاء `showToast` يُحدَّث `toastItem` بغض النظر عن القيمة السابقة. Timer يُعاد تشغيله. السلوك صحيح.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `tailwind.config`
- `CartDrawer.tsx` نفسه — يبقى كما هو للاستخدام عبر أيقونة السلة في الهيدر
- `store/cartStore.ts`: لا تغيير على الـ state القائم (`items`, `drawerOpen`, `ensureStoreSlug`, إلخ) — إضافات فقط

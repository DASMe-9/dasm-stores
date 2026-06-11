# Spec: زر المفضلة (Heart) في ProductTile — marketplace

## السياق والمبرر

`docs/design/baseline/components-inventory.md` يُحدد صراحةً أن `ProductCard` في السوق يجب أن يحتوي على "أيقونة قلب للمفضلة". الـ `ProductTile` الحالي في `app/page.tsx` يُقدّم زر سلة فقط دون مفضلة. تحليل المنافسين (W23–W26) يُؤكد أن زر المفضلة معيار راسخ في Salla وZid وShopify — ثلاثتها توفره في بطاقة المنتج داخل الـ marketplace. الفجوة مذكورة في كل تقارير الاستخبارات السابقة ولم تُعالَج.

## الحالة الراهنة في dasm-stores

**الملف المعني:**
- `app/page.tsx` — دالة `ProductTile` (السطر 88–122)

**السلوك الحالي (السطر 113–117):**
```tsx
<div className="flex items-center justify-between gap-3">
  <span className="text-sm font-extrabold text-slate-950 dark:text-zinc-100">
    {price.toFixed(0)} ر.س
  </span>
  <Link href={`/${product.storeSlug}/cart`}
    className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 
               text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-600 hover:text-white"
    aria-label={`فتح سلة ${product.storeName}`}>
    <ShoppingCart className="h-4 w-4" />
  </Link>
</div>
```

الغائب: لا أيقونة قلب، لا state مفضلة.

## التغيير المقترح

### الواجهة (TypeScript)

```typescript
// ملف جديد: components/home/WishlistButton.tsx
// "use client"
interface WishlistButtonProps {
  productKey: string;  // `${storeSlug}-${productId}` — مفتاح فريد للتخزين
  className?: string;
}
```

**آلية الاستمرارية:** `localStorage` بمفتاح `"dasm_wishlist"` → مصفوفة `string[]` من `productKey`. لا API جديد، لا تغيير في الـ schema.

### Variants

| الحالة | المظهر |
|--------|--------|
| غير مفضّل (افتراضي) | Heart outline، خلفية رمادية فاتحة، لون رمادي |
| مفضّل (toggled) | Heart filled، خلفية حمراء/وردية فاتحة، لون أحمر |
| hover (غير مفضّل) | Heart outline + خلفية خضراء خفيفة |

### States

- **loading:** لا ينطبق — التبديل فوري (localStorage).
- **empty:** الحالة الافتراضية (غير مفضّل).
- **error:** التجاهل الصامت إن كان `localStorage` غير متاح (SSR / private mode).

### التعديل على ProductTile (السطر 113–117)

```tsx
<div className="flex items-center justify-between gap-3">
  <span className="text-sm font-extrabold text-slate-950 dark:text-zinc-100">
    {price.toFixed(0)} ر.س
  </span>
  <div className="flex items-center gap-1.5">
    <WishlistButton productKey={`${product.storeSlug}-${product.id}`} />
    <Link
      href={`/${product.storeSlug}/cart`}
      className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 
                 text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-600 hover:text-white"
      aria-label={`فتح سلة ${product.storeName}`}
    >
      <ShoppingCart className="h-4 w-4" />
    </Link>
  </div>
</div>
```

### تعريف WishlistButton (ملف جديد)

```tsx
"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "dasm_wishlist";

function readWishlist(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) as string[] : []);
  } catch {
    return new Set();
  }
}

function writeWishlist(set: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch { /* noop */ }
}

export function WishlistButton({ productKey, className }: { productKey: string; className?: string }) {
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setWishlisted(readWishlist().has(productKey));
  }, [productKey]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const wl = readWishlist();
    if (wl.has(productKey)) wl.delete(productKey);
    else wl.add(productKey);
    writeWishlist(wl);
    setWishlisted(wl.has(productKey));
  }

  return (
    <button
      onClick={toggle}
      className={`grid h-9 w-9 place-items-center rounded-xl transition
        ${wishlisted
          ? "bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100"
          : "bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
        } ${className ?? ""}`}
      aria-label={wishlisted ? "إزالة من المفضلة" : "إضافة للمفضلة"}
      aria-pressed={wishlisted}
    >
      <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
    </button>
  );
}
```

## معايير القبول

- [ ] يظهر Heart outline رمادي في الحالة الافتراضية بجانب زر السلة.
- [ ] النقر على Heart يحوّله إلى filled أحمر فوراً (بدون reload).
- [ ] النقر مرة ثانية يُعيد الـ Heart لحالته الرمادية.
- [ ] تحديث الصفحة (F5) يُعيد عرض القلوب المفضّلة بشكل صحيح.
- [ ] النقر على Heart لا يفتح صفحة المنتج (e.preventDefault + e.stopPropagation).
- [ ] الوضع الليلي: خلفية الحالتين (افتراضي ومفضّل) تستخدم متغيرات dark:.
- [ ] SSR: لا خطأ hydration — القلب يظهر رمادياً أثناء التحميل حتى يُقرأ localStorage.
- [ ] لا يمس app/page.tsx إلا في موضع إضافة WishlistButton وtag الـ import.

## الملفات التي سيلمسها Cursor

```
components/home/WishlistButton.tsx    ← ملف جديد
app/page.tsx                          ← السطر 7 (إضافة Heart للـ import)
                                      ← السطر 113–117 (استبدال div الأزرار)
                                      ← إضافة import { WishlistButton }
```

## مخاطر التغيير

- **منخفض:** localStorage فقط، لا backend.
- **Hydration mismatch:** القيمة الأولية `false` حتى `useEffect` — Heart يبدو رمادياً للحظة عند أول تحميل. مقبول في MVP.
- **ProductTile هو Server Component:** `WishlistButton` يكون "use client" منفصلاً — لا تعديل على طبيعة `ProductTile` ذاتها.
- **Impact على bundle:** إضافة ملف client صغير (~1.5KB gzipped) — لا تأثير ملموس.

## استثناء: لا تمس

- ملفات `docs/design/baseline/`
- `components/product/ProductCard.tsx` (متجر فرعي) — spec منفصل إن طُلب لاحقاً
- tokens في `tailwind.config`
- `components/store/StoreHeader.tsx`

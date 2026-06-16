# Spec: Sticky Mini-Cart Bar للموبايل

**التاريخ:** 2026-06-15
**المصدر:** تحليل Salla theme-raed + Shopify Dawn 2026 (W28)
**الأولوية:** عالية — 70% من التسوق السعودي على الموبايل؛ CartBadge يختفي عند scroll

---

## السياق والمبرر

على الموبايل، يختفي `CartBadge` في هيدر المتجر فور أن يسحب المتسوق للأسفل. يُضيع هذا المستخدمَ في شبكة المنتجات بدون إشارة واضحة لمحتوى سلته أو إجماليه. كلٌّ من Salla وShopify Dawn يحلّان هذا بـ **sticky bar ثابت في الأسفل** يظهر حين تكون السلة غير فارغة.

`StoreChrome.tsx` هو المكان المثالي لإضافة هذا المكوّن: هو بالفعل Client Component يحتوي CartDrawer وWhatsApp FAB.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `components/store/StoreChrome.tsx` — يحتوي CartDrawer + WhatsApp FAB، لا sticky bar
- `components/store/CartBadge.tsx` — مُدمج في الهيدر (`md:hidden` للزر، `hidden md:inline-flex` للـ link)
- `store/cartStore.ts` — يُصدّر `count()`, `total()`, `openDrawer()`

**السلوك الحالي:**
```
StoreChrome
  ├── storeSwitchNotice (banner مؤقت)
  ├── CartDrawer (drawer كامل)
  └── WhatsAppFab (FAB أسفل يمين)
```

عند scroll لأسفل: **لا يوجد أي مؤشر للسلة** على الموبايل.

---

## التغيير المقترح

### 1. ملف جديد — `components/store/StickyCartBar.tsx`

```typescript
'use client';

interface StickyCartBarProps {
  slug: string;
}

export function StickyCartBar({ slug }: StickyCartBarProps): JSX.Element | null
```

**منطق الظهور:**
- يظهر فقط على `sm` وأصغر (موبايل)
- يظهر فقط عندما `count() > 0`
- مخفي افتراضياً حتى hydration (لا SSR flash)

**واجهة الـ state من cartStore:**
```typescript
const count  = useCartStore((s) => s.count());
const total  = useCartStore((s) => s.total());
const open   = useCartStore((s) => s.openDrawer);
```

**الحالات:**
| الحالة | السلوك |
|--------|--------|
| `count === 0` | مخفي تماماً (`null`) |
| `count > 0` | يظهر بـ `translate-y-0 opacity-100` |
| transition | `transition-all duration-300 ease-in-out` |

### 2. بنية المكوّن البصرية

```
fixed bottom-0 inset-x-0 z-40
sm:hidden                    ← موبايل فقط
bg-[var(--card)]
border-t border-[var(--border)]
shadow-[0_-4px_16px_rgba(0,0,0,0.08)]
px-4 py-3
safe-area-inset-bottom       ← لـ iPhone notch
```

محتوى الـ bar (RTL):
```
[أيقونة سلة + العدد]  [المجموع: X ر.س]  [زر «عرض السلة»]
```

```tsx
<div className="flex items-center justify-between gap-3">
  {/* اليمين: أيقونة + العدد */}
  <span className="flex items-center gap-2 text-sm font-bold">
    <ShoppingCart className="h-5 w-5" style={{ color: 'var(--primary)' }} />
    <span>{count} {count === 1 ? 'منتج' : 'منتجات'}</span>
  </span>

  {/* الوسط: الإجمالي */}
  <span className="text-sm font-extrabold" style={{ color: 'var(--foreground)' }}>
    {total().toFixed(0)} ر.س
  </span>

  {/* اليسار: زر الفعل */}
  <button
    onClick={() => open()}
    className="rounded-xl px-5 py-2.5 text-sm font-bold transition hover:opacity-90"
    style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
  >
    عرض السلة
  </button>
</div>
```

### 3. تعديل `components/store/StoreChrome.tsx`

```tsx
import { StickyCartBar } from "./StickyCartBar";

// داخل return:
<>
  {/* ... الـ storeSwitchNotice الحالي ... */}
  <CartDrawer slug={slug} />
  <WhatsAppFab phone={whatsapp} />
  <StickyCartBar slug={slug} />
</>
```

**ملاحظة تعارض WhatsApp FAB:** `WhatsAppFab` في `bottom-6 right-4`. الـ sticky bar بـ `z-40`. إضافة `pb-16` على `StickyCartBar` تُبقي الـ FAB مرئية فوق الـ bar.

بديل: إخفاء `WhatsAppFab` عند ظهور الـ bar (`count > 0`) — لكن هذا تعديل إضافي. يُؤجَّل.

---

## معايير القبول

- [ ] الـ bar غير ظاهر على `md` وأكبر
- [ ] الـ bar غير ظاهر عند `count === 0`
- [ ] الـ bar يظهر تلقائياً فور إضافة أول منتج للسلة (optimistic من Zustand)
- [ ] الضغط على «عرض السلة» يفتح CartDrawer (لا يُحوّل للصفحة)
- [ ] `count` و`total` محدّثان في الوقت الفعلي مع كل تعديل في السلة
- [ ] لا hydration mismatch — قيمة أولية `null` حتى client mount
- [ ] يأخذ `safe-area-inset-bottom` لـ iPhone notch
- [ ] لا يتعارض بصرياً مع WhatsApp FAB (يبقى مرئياً)
- [ ] الـ z-index أدنى من CartDrawer (لا يحجب الـ drawer عند فتحه)

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/store/StickyCartBar.tsx` | **إنشاء جديد** (Client Component) |
| `components/store/StoreChrome.tsx` | **تعديل** — إضافة `<StickyCartBar slug={slug} />` |

---

## مخاطر التغيير

1. **Hydration flash:** `count()` يقرأ Zustand الذي يُهيأ client-side. يجب render `null` حتى hydration. نمط `useSyncExternalStore` من `CartBadge.tsx` يحل هذا.

2. **تعارض z-index:** WhatsApp FAB بـ z-index عالٍ. إضافة `bottom-20` على الـ FAB عند ظهور الـ bar (أو `pb-16` على الـ bar container) تمنع التداخل.

3. **Safe area على iPhone:** بدون `pb-safe` أو `env(safe-area-inset-bottom)` يُخفى الـ bar جزئياً خلف الـ home indicator. استخدم `style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}`.

4. **تكرار المعلومات:** المستخدم يرى count في CartBadge (هيدر) وفي الـ sticky bar. هذا التكرار مقصود — المنافسون يتبعون نفس النمط.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `tailwind.config`
- `store/cartStore.ts` — لا تعديل على منطق السلة
- `components/cart/CartDrawer.tsx` — الـ bar يفتح الـ drawer الحالي دون تعديله

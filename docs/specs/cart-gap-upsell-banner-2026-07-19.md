# Spec: Cart Gap Progress Banner — شريط مؤشر الهدف في السلة

## السياق والمبرر

Salla (Twilight v2.14.501، 2026-07-15) وZid (tiered discounts، يونيو 2026) أطلقا كلاهما نمط "gap cart" في نفس الأسبوع: مؤشر بصري يُظهر للمتسوق كم يحتاج لإضافته للوصول لهدف محدد — شحن مجاني أو خصم تصاعدي. التأكيد المزدوج من منافسَين رئيسيَّين في نفس الفترة يرفع أولوية هذا النمط عن غيره.

`CartDrawer.tsx` حالياً يعرض مجموع السلة وزر "إتمام الطلب" فقط — لا يوجد أي مؤشر للهدف التالي. هذا يُفوّت فرصة رفع متوسط قيمة الطلب (AOV) بتحفيز المتسوق على إضافة منتج إضافي قبل الإتمام.

**المصادر:**
- `docs/research/competitors/2026-30.md` — Delta #1 (Salla) و Delta #4 (Zid)

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `components/cart/CartDrawer.tsx` — السلة العائمة (client component)
- `store/cartStore.ts` — state السلة وحساب `total()`

**السلوك الحالي:**
- `CartDrawer` يعرض: header → قائمة items → مجموع كلي → زر checkout
- `cartStore.total()` يحسب `Σ(qty × price)` لكل عنصر
- لا يوجد منطق لمقارنة المجموع بـ threshold أو tier

**فجوة API:**
- غير معروف حالياً إن كان `getStore()` يُعيد `free_shipping_threshold` أو tier data
- الـ spec مصمَّم بـ defensive rendering: يظهر فقط إذا وُجدت البيانات؛ يُخفى بصمت إن غابت
- **أول خطوة لـ Cursor:** فحص `lib/api-server.ts` لتحديد الحقل المتاح

## التغيير المقترح

### واجهة TypeScript

```typescript
// components/cart/CartGapBanner.tsx
type CartGapBannerProps = {
  currentTotal: number;     // مجموع السلة الحالي (ر.س)
  threshold: number;        // قيمة الهدف
  thresholdLabel: string;   // "شحن مجاني" | "خصم ١٠%" | "هدية مجانية"
  currency?: string;        // default: "ر.س"
};
```

### المكوّن الجديد: `CartGapBanner`

```
┌───────────────────────────────────────────────┐
│  أضف ٣٥ ر.س فقط للحصول على شحن مجاني         │
│  [████████████░░░░░░░░] ٦٥ / ١٠٠ ر.س          │
└───────────────────────────────────────────────┘
```

يوضع فوق مجموع السلة في `CartDrawer.tsx`.

### Variants

| variant | الشرط | العرض |
|---------|-------|-------|
| `progress` (default) | `0 < total < threshold` | شريط تقدم + "أضف X ر.س لـ {label}" |
| `achieved` | `total >= threshold` | رسالة نجاح خضراء: "تأهلت للشحن المجاني ✓" |
| `hidden` | `threshold` = null أو 0 | لا يرندر شيء |

### سلوك الـ states

| الحالة | السلوك |
|--------|--------|
| loading | لا يظهر (يُعرض بعد تحميل السلة) |
| empty cart | لا يظهر |
| no threshold data | `hidden` variant — لا خطأ، لا placeholder |
| threshold achieved | `achieved` variant |
| threshold = 0 | يُعامَل كـ `hidden` |

## معايير القبول

- [ ] يظهر `CartGapBanner` في `CartDrawer` عند: `items.length > 0` AND `threshold > 0` AND `total < threshold`
- [ ] شريط التقدم `width = (total / threshold) * 100%`، لا يتجاوز 100% حتى لو تجاوز الـ total الـ threshold
- [ ] النص العربي RTL صحيح: "أضف **X** ر.س للحصول على **{thresholdLabel}**" مع حساب `gap = threshold - total` مقرَّباً لـ رقم صحيح
- [ ] عند `total >= threshold`: يظهر `achieved` variant مكان `progress`
- [ ] إذا `threshold` = null أو 0: `CartGapBanner` لا يُرندَر (بدون error، بدون layout shift)
- [ ] الـ banner لا يُسبب layout shift في الـ drawer (ارتفاع محدد أو `min-h`)
- [ ] يعمل في dark mode عبر `var(--c-surface-2)` و `var(--c-brand)` — لا hardcoded colors

## الملفات التي سيلمسها Cursor

```
components/cart/CartDrawer.tsx        # إضافة <CartGapBanner> فوق قسم المجموع
components/cart/CartGapBanner.tsx     # مكوّن جديد (inline إن كان < 50 سطر)
lib/api-server.ts                     # قراءة فقط — التحقق من free_shipping_threshold أو ما يقابله
store/cartStore.ts                    # قراءة فقط — استخدام total() الموجود
```

**قرار Cursor:** إذا وُجد `free_shipping_threshold` في `StorePublic` type، مرِّره عبر props للـ drawer. إن غاب، اترك `threshold = null` وسيُخفى الـ banner تلقائياً حتى يُضيفه الـ backend.

## مخاطر التغيير

- **منخفضة:** المكوّن conditional بالكامل — إذا غابت بيانات threshold، لا شيء يتغير
- **edge case:** threshold = 0 → `hidden` variant (منعاً لقسمة على صفر في شريط التقدم)
- **تحذير:** `CartDrawer` هو client component — لا تجلب بيانات API إضافية بداخله مباشرة. مرِّر الـ threshold كـ prop من المكوّن الأب أو من `cartStore` إن كان متاحاً

## استثناء: لا تمس

- `docs/design/baseline/` — مرجع بصري للمقارنة فقط
- tokens في `tailwind.config.ts` — لا تعدّل إلا بنص صريح

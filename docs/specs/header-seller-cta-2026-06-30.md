# Spec: زر "افتح متجرك مجاناً" في هيدر الصفحة الرئيسية

## السياق والمبرر

Shopify يعرض زر "Start free trial" بارزاً في الهيدر لغير المسجلين، بجانب زر "تسجيل الدخول"، ويختفي بعد الدخول. هذا النمط يحوّل كل زيارة للسوق إلى فرصة اكتساب بائع جديد دون أن يُعيق تجربة المتسوق. dasm-stores يفتقر لأي CTA استقطاب بائعين في الهيدر — زر الدخول الوحيد يوجّه للـ dashboard (للمسجلين فعلاً).

المرجع التنافسي: `docs/research/competitors/2026-29.md` — Delta #4 (Shopify header CTA).

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `components/home/HomeHeaderActions.tsx` — السطور 136–144

**السلوك الحالي (guest state):**
```tsx
// السطر 137 — حالة الضيف: زر واحد فقط
<Link href="/auth/login?returnUrl=/dashboard" className="hidden ... sm:inline-flex">
  <User className="h-4 w-4" />
  تسجيل الدخول
</Link>
```

لا CTA لاستقطاب بائع جديد. الضيف يرى فقط: ThemeToggle + زر تسجيل الدخول + أيقونة السلة.

## التغيير المقترح

### الواجهة (TypeScript signature)

لا تغيير في signature الـ component — `HomeHeaderActions({ shoppingHref })` يبقى كما هو.

### المكوّنات البصرية الجديدة

في حالة `authState === "guest"` فقط، أضف زراً ثانياً قبل زر تسجيل الدخول:

```tsx
{/* CTA البائع — يظهر للضيوف فقط، مخفي على الموبايل */}
<Link
  href="/auth/signup"
  className="hidden items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 sm:inline-flex"
>
  <Store className="h-4 w-4" />
  افتح متجرك
</Link>
```

### Variants

| الحالة | السلوك |
|--------|--------|
| `authState === "guest"` | يظهر زر "افتح متجرك" (emerald مملوء) + زر "تسجيل الدخول" (outlined) |
| `authState === "auth"` | لا يظهر الزر — يُستبدل بقائمة الحساب الموجودة |
| `authState === "checking"` | skeleton موجود بالفعل — لا تغيير |

### سلوك الـ states

- **loading (checking):** الـ skeleton الحالي (`h-11 w-28 rounded-2xl`) يغطي مكان الزرين معاً — اتساع الـ skeleton يمكن ضبطه إلى `w-44` إن أريد تجنب layout shift.
- **empty:** لا ينطبق.
- **error:** لا ينطبق — الـ component يعتمد على localStorage/cookie فقط، لا طلبات شبكة.

## معايير القبول

- [ ] زر "افتح متجرك" يظهر للضيوف فقط (حالة `guest`)
- [ ] الزر مخفي على الموبايل (`hidden sm:inline-flex`) — يحافظ على layout الهاتف
- [ ] الزر يختفي تلقائياً عند تسجيل الدخول (state يتحدث عبر `storage` event)
- [ ] الزر يُوجّه إلى `/auth/signup`
- [ ] اللون emerald-600 يميّزه بوضوح عن زر الدخول outlined
- [ ] الزر يتضمن أيقونة `Store` من `lucide-react` (مستوردة بالفعل في page.tsx، تُضاف إلى imports الـ component)
- [ ] لا يُؤثر على حالة `auth` أو `checking`

## الملفات التي سيلمسها Cursor

```
components/home/HomeHeaderActions.tsx
```

**ملف واحد فقط.** الزر يُضاف داخل الـ `else` branch (السطور 136–144) في دالة `HomeHeaderActions`.

## الاستيراد المطلوب

أضف `Store` إلى imports من `lucide-react`:
```tsx
import { ChevronDown, LayoutDashboard, LogOut, ShoppingCart, Store, User } from "lucide-react";
```

## مخاطر التغيير

| الخطر | الاحتمال | الإجراء |
|-------|----------|---------|
| تجاوز العرض في الهيدر على شاشات صغيرة | منخفض | الزر `hidden sm:inline-flex` — لا يظهر على الموبايل |
| تعارض مع skeleton width عند التحميل | منخفض جداً | الـ skeleton ثابت الحجم، الزر يظهر فقط بعد resolve |
| إرباك المتسوق (ليس بائعاً) | منخفض | النص "افتح متجرك" — واضح للجمهور المستهدف |

## استثناء: لا تمس

- `docs/design/baseline/` — لقطات المرجع لا تُعدَّل
- `tailwind.config` — لا tokens جديدة مطلوبة (الألوان emerald-600/700 مُعرَّفة بالفعل)
- أي ملف آخر غير `components/home/HomeHeaderActions.tsx`

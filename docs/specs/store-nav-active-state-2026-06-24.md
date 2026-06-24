# Spec: Store Navigation Active State

## السياق والمبرر

منذ كوميت `e65d0a0` (2026-06-21) أصبح في المتجر الفرعي مستويان من التنقل:
1. **StoreHeader nav** — رابط "الرئيسية" / "المنتجات" / "متاجر داسم" في الشريط العلوي الثابت
2. **StoreTabsNav** — pills قابلة للتمرير (كل المنتجات + التبويبات المخصصة) تحت الـ banner

كلا المكوّنين يعرض روابطه متماثلة بصرياً بدون مؤشر للصفحة الحالية. المستخدم لا يعرف أين هو داخل المتجر. Salla وZid وShopify Dawn 11+ جميعها تُشير للرابط النشط بوضوح (خلفية + لون primary). غياب الـ active state هو UX debt مباشر بعد إضافة رابط "المنتجات" الجديد.

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `components/store/StoreTabsNav.tsx` (السطور 14-35)
- `components/store/StoreHeader.tsx` (السطور 83-94)

**السلوك الحالي:**

في `StoreTabsNav.tsx`:
```tsx
// كل الروابط تأخذ نفس className بدون استثناء
className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-[var(--muted)]"
```

في `StoreHeader.tsx:83-94`:
```tsx
// nav desktop: ثلاثة روابط متماثلة بصرياً
<Link href={`/${slug}`} className="rounded-full px-3 py-2 font-semibold ...">الرئيسية</Link>
<Link href={`/${slug}/products`} className="rounded-full px-3 py-2 font-semibold ...">المنتجات</Link>
<Link href="/" className="... text-xs ...">متاجر داسم</Link>
```

لا `aria-current`، لا تفريق بصري بين النشط والغير نشط.

## التغيير المقترح

### الواجهة (TypeScript)

كلا المكوّنين server components. لقراءة الـ pathname في server component يتطلب Next.js App Router تمرير المعلومة من الـ layout عبر props. البديل الأبسط: تحويل كل مكوّن لـ `"use client"` واستخدام `usePathname()`.

**StoreTabsNav — interface مقترح:**
```tsx
"use client";
import { usePathname, useSearchParams } from "next/navigation";

// داخل المكوّن:
const pathname = usePathname();
const sp = useSearchParams();
const currentTab = sp.get("tab");

// حساب isActive لكل رابط:
// "كل المنتجات" نشط عندما: pathname === `/${slug}/products` && !currentTab
// تبويب مخصص نشط عندما: currentTab === t.slug
```

**StoreHeader nav — interface مقترح:**
```tsx
"use client";
import { usePathname } from "next/navigation";

const pathname = usePathname();
// "الرئيسية" نشط: pathname === `/${slug}`
// "المنتجات" نشط: pathname.startsWith(`/${slug}/products`)
```

### Variants

| الحالة | الـ className المضاف للرابط النشط |
|--------|-----------------------------------|
| Active في StoreTabsNav | `bg-[var(--primary)]/10 text-[var(--primary)] font-bold` + `border-[var(--primary)]/40` |
| Active في StoreHeader nav | `bg-[var(--muted)] font-bold text-[var(--foreground)]` بدلاً من `font-semibold` |

### سلوك States

| الحالة | السلوك |
|--------|--------|
| loading | لا تأثير — الـ pathname قابل للقراءة فوراً من الـ hook |
| empty (لا تبويبات) | `StoreTabsNav` يُعيد `null` — لا تغيير |
| خطأ في useSearchParams | يُغلف في `<Suspense>` كما تشترطه Next.js |

## معايير القبول

- [ ] رابط "كل المنتجات" في `StoreTabsNav` يبرز بصرياً عند الوجود على `/[slug]/products` بدون `?tab=`
- [ ] التبويب المخصص يبرز عند `/[slug]/products?tab=<slug>`
- [ ] رابط "الرئيسية" في StoreHeader nav يبرز عند `/[slug]`
- [ ] رابط "المنتجات" في StoreHeader nav يبرز عند `/[slug]/products` وما تحتها
- [ ] `aria-current="page"` مضاف للرابط النشط
- [ ] الروابط غير النشطة تحتفظ بـ hover effect المعتاد
- [ ] لا regression على Dark mode (الـ CSS variables تتولى ذلك)

## الملفات التي سيلمسها Cursor

```
components/store/StoreTabsNav.tsx
components/store/StoreHeader.tsx
```

لا ملفات أخرى. لا تعديل على layout أو صفحات.

## مخاطر التغيير

| الخطر | الاحتمال | التخفيف |
|-------|----------|---------|
| `useSearchParams()` يتطلب `<Suspense>` wrapper | متوسط | تغليف `StoreTabsNav` بـ Suspense في layout أو استخدام `useSearchParams` داخل client boundary موجودة |
| تحويل server → client يزيد bundle size | منخفض | المكوّنان صغيران (<2KB) |
| `usePathname` في StoreHeader قد يتعارض مع Builder compact mode | منخفض | compact mode لا يغير الـ pathname، لا تعارض |

## استثناء: لا تمس

- ملفات في `docs/design/baseline/`
- tokens في `tailwind.config` (الألوان هنا تعتمد CSS variables فقط)
- `components/store/StoreChrome.tsx` — خارج نطاق هذا الـ spec

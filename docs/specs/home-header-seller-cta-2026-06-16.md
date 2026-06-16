# Spec: زر "افتح متجرك مجاناً" في هيدر الصفحة الرئيسية

**التاريخ:** 2026-06-16
**المصدر:** تحليل Shopify homepage header 2026 + نمط Salla/Zid seller acquisition (W29)
**الأولوية:** عالية — المتسوق الضيف في الـ marketplace هو أيضاً بائع مستهدف؛ لا CTA حالياً يقوده للتسجيل

---

## السياق والمبرر

`HomeHeaderActions.tsx` يعرض للضيف غير المسجل:
```
[ThemeToggle]  [تسجيل الدخول]  [أيقونة سلة → #stores]
```

لا يوجد أي مسار واضح للبائع الجديد. كل المنافسين الرئيسيين — Shopify ("Start free trial")،
Salla ("أنشئ متجرك مجاناً")، Zid ("ابدأ مجاناً") — يضعون زر استقطاب البائع بجانب تسجيل
الدخول مباشرة في الهيدر. هذا المسار يغيب كليًا عن متاجر داسم.

الـ marketplace (`/`) هي أكثر صفحة زيارةً. كل زيارة ضيف بلا CTA = فرصة بائع ضائعة.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `components/home/HomeHeaderActions.tsx` — Client Component يعرض ThemeToggle + auth state + cart link

**السلوك الحالي لـ authState === "guest":**
```tsx
<>
  <ThemeToggle />
  <Link href="/auth/login?returnUrl=/dashboard" ...>
    <User className="h-4 w-4" />
    تسجيل الدخول
  </Link>
  <Link href={shoppingHref} aria-label="التسوق" ...>
    <ShoppingCart className="h-4 w-4" />
  </Link>
</>
```

لا زر للتسجيل كبائع أو أي CTA لفتح متجر.

---

## التغيير المقترح

### TypeScript signature (لا تغيير على الـ props)

```typescript
export function HomeHeaderActions({ shoppingHref }: { shoppingHref: string })
```

### التعديل على حالة `authState === "guest"`

إضافة زر "افتح متجرك" **قبل** زر تسجيل الدخول، يظهر فقط على `sm` وأكبر:

```tsx
{/* CTA للبائع الجديد — يظهر فقط لغير المسجلين على sm+ */}
<Link
  href="/auth/signup"
  className="hidden sm:inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
>
  افتح متجرك
</Link>
```

**الترتيب النهائي لـ guest state:**
```
[ThemeToggle]  [افتح متجرك ←]  [تسجيل الدخول]  [أيقونة سلة]
```

### states

| الحالة | السلوك |
|--------|--------|
| `authState === "checking"` | لا تغيير — skeleton placeholder كما هو |
| `authState === "guest"` | يظهر زر "افتح متجرك" بلون emerald-600 |
| `authState === "auth"` | مخفي تماماً — البائع المسجل لا يحتاجه |

---

## معايير القبول

- [ ] الزر مخفي عند `authState !== "guest"` (لا يظهر للمسجلين)
- [ ] الزر مخفي على `xs` (موبايل صغير) — يظهر على `sm` فما فوق فقط
- [ ] النقر يوجه إلى `/auth/signup` (صفحة إنشاء حساب)
- [ ] لون الزر `emerald-600` / hover `emerald-700` — متسق مع ثيم المنصة
- [ ] لا hydration mismatch — الـ authState يبدأ بـ "checking" (skeleton) ويُحدَّث client-side كما هو قائم
- [ ] الزر يظهر قبل "تسجيل الدخول" في الترتيب المرئي (أيمن من Login في RTL)
- [ ] لا تغيير على سلوك ThemeToggle أو قائمة المستخدم المسجل

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/home/HomeHeaderActions.tsx` | **تعديل** — إضافة `<Link href="/auth/signup">` في حالة guest فقط |

**ملف واحد. تغيير واحد. لا dependencies جديدة.**

---

## مخاطر التغيير

1. **Hydration flash:** لا خطر — الزر يعتمد على `authState` الذي يبدأ بـ `"checking"` ويعرض skeleton. نفس النمط القائم.

2. **ازدحام الهيدر على الشاشات الصغيرة:** الزر مخفي على `xs` تحاشيًا للازدحام. على `sm+` يوجد مساحة كافية.

3. **رسالة تسويقية:** النص "افتح متجرك" يفترض أن `/auth/signup` يوجه لتسجيل البائع. إن كانت صفحة `/auth/signup` مشتركة للمتسوق والبائع، يُعدَّل النص إلى "تسجيل" مع `returnUrl=/dashboard`.

4. **تعارض مع نص التنقل:** الـ `<nav>` في `app/page.tsx` لا يعرض "افتح متجرك" — الزر في الـ header actions فقط. تناسق مقبول.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `tailwind.config` / `styles/globals.css`
- `app/page.tsx` — لا تعديل على الـ header JSX أو nav links
- أي مكوّن خارج `HomeHeaderActions.tsx`

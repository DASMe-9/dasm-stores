# Spec: زر "افتح متجرك مجاناً" في هيدر الصفحة الرئيسية للضيوف

## السياق والمبرر

رُصد في W29 أن Shopify تعرض زر "Start free trial" بارزاً في الهيدر لغير المسجلين، وأن dasm-stores لا يعرض أي CTA لاستقطاب البائعين الجدد من الصفحة الرئيسية. الأولوية: **أثر عالٍ / جهد منخفض** — تغيير في مكوّن موجود دون مسّ بنيته الأساسية.

## الحالة الراهنة في dasm-stores

**الملف المعني:** `components/home/HomeHeaderActions.tsx`

**الـ props الحالية:** `{ shoppingHref: string }`

**السلوك الحالي للضيف (`authState === "guest"`):**
```
ThemeToggle | [تسجيل الدخول] | [سلة]
```
- زر "تسجيل الدخول" يوجّه إلى `/auth/login?returnUrl=/dashboard`
- لا يوجد CTA مرئي لفتح متجر جديد

**الحالة المحددة في الكود:**
```tsx
// components/home/HomeHeaderActions.tsx:137-143
<Link href="/auth/login?returnUrl=/dashboard" ...>
  <User className="h-4 w-4" />
  تسجيل الدخول
</Link>
```

## التغيير المقترح

### الواجهة (TypeScript signature)

لا تغيير في الـ props — التعديل داخلي في الـ `guest` branch فقط.

### المنطق البصري للضيف بعد التعديل

```
ThemeToggle | [افتح متجرك مجاناً ←] | [تسجيل الدخول] | [سلة]
```

- زر "افتح متجرك مجاناً": رابط لـ `/stores/new` أو مسار إنشاء متجر، بخلفية `emerald-600`، يظهر على `sm:` فأعلى فقط
- زر "تسجيل الدخول": يبقى كما هو

### السلوك التفصيلي

| الحالة | ما يُعرض |
|--------|----------|
| `checking` | skeleton واحد بعرض `w-28` (كما الآن) |
| `guest` (sm+) | زر "افتح متجرك مجاناً" بارز + زر "تسجيل الدخول" خطوط |
| `guest` (xs) | زر "افتح متجرك مجاناً" فقط (يخفي "تسجيل الدخول") |
| `auth` | قائمة الحساب + "لوحتي" + "خروج" (لا تغيير) |

### المظهر البصري للزر الجديد

```tsx
<Link
  href="/stores/new"
  className="hidden items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 sm:inline-flex"
>
  <Store className="h-4 w-4" />
  افتح متجرك مجاناً
</Link>
```

- **اللون:** `bg-emerald-600` / `hover:bg-emerald-700` — يبرز عن زر "تسجيل الدخول" البيضاء
- **الشكل:** `rounded-2xl` — يتوافق مع style النظام القائم
- **الأيقونة:** `Store` من `lucide-react` (مستوردة بالفعل في `app/page.tsx`)
- **الدارك مود:** لا تعديل خاص — `emerald-600` مقبول في كلا الثيمين

## معايير القبول

- [ ] يظهر الزر للضيف على شاشات `sm:` (≥640px) بجانب زر "تسجيل الدخول"
- [ ] على `xs` يظهر الزر الأخضر ويختفي "تسجيل الدخول"
- [ ] للمستخدم المسجل: لا يظهر الزر الجديد
- [ ] في حالة `checking`: لا يظهر (skeleton موجود)
- [ ] الضغط على الزر يوجّه إلى `/stores/new`
- [ ] الزر مرئي في كلا الثيمين (فاتح وداكن)
- [ ] لا تغيير في `ThemeToggle` أو قائمة "حسابي" أو زر السلة

## الملفات التي سيلمسها Cursor

```
components/home/HomeHeaderActions.tsx   ← التعديل الوحيد
```

يُضاف `import { Store } from "lucide-react"` إن لم يكن موجوداً.

## مخاطر التغيير

- **ضيقة:** الهيدر قد يضيق على شاشات `sm` الصغيرة — اختبر على 640px.
- **RTL:** تأكد من أن الزر الجديد يظهر يمين "تسجيل الدخول" (سياق RTL — سيكون أقرب لليسار بصرياً في تخطيط LTR، لكن الكود لا يستخدم `dir` صريحاً هنا).
- **مسار `/stores/new`:** الـ route موجود في `pages/stores/new.tsx` — تأكد من صلاحية الوصول للضيف.

## استثناء: لا تمس

- ملفات في `docs/design/baseline/`
- tokens في `tailwind.config`
- أي ملف خارج `components/home/HomeHeaderActions.tsx`

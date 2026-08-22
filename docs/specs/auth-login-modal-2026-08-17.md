# Spec: Auth Login Modal للضيوف في الهيدر

**تاريخ الإنشاء:** 2026-08-17
**المصدر التنافسي:** Zid Vitrin — "Customer Login as a Pop-up"
**الجولة:** W34

---

## السياق والمبرر

الضيوف الذين يتصفحون السوق الرئيسية ويريدون تسجيل الدخول يُحوَّلون حالياً إلى `/auth/login?returnUrl=/dashboard` — تنقل كامل للصفحة يفقدهم موضع التمرير وسياق الاستعراض.

Zid Vitrin أطلق في 2026 نمط "Login as a Pop-up" الذي يُبقي المتسوق في صفحته مع overlay بسيط لإدخال بيانات الدخول.

التطبيق على dasm-stores: تحويل الضغط على "تسجيل الدخول" من Link للتنقل إلى زر يفتح modal — مع الإبقاء على مسار `/auth/login` كـ fallback للحالات التي لا يعمل فيها JS.

---

## الحالة الراهنة في dasm-stores

### الملفات المعنية

- `components/home/HomeHeaderActions.tsx` (السطر 145-152 — حالة الضيف)
- `/auth/login` — صفحة تسجيل الدخول القائمة (تبقى دون تعديل)

### السلوك الحالي

```tsx
// HomeHeaderActions.tsx — حالة الضيف، السطر 137-153
<Link
  href="/auth/login?returnUrl=/dashboard"
  className="hidden items-center gap-2 rounded-2xl border ..."
>
  <User className="h-4 w-4" />
  تسجيل الدخول
</Link>
```

الضغط على "تسجيل الدخول" = تنقل كامل بعيداً عن الصفحة الرئيسية.

---

## التغيير المقترح

### الواجهة (TypeScript interface)

```tsx
// components/home/AuthLoginModal.tsx — مكوّن جديد

interface AuthLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthLoginModal({ open, onClose, onSuccess }: AuthLoginModalProps)
```

### التعديل على HomeHeaderActions.tsx

```tsx
// حالة الضيف — بعد التعديل
const [loginModalOpen, setLoginModalOpen] = useState(false);

// الزر يفتح modal بدل التنقل
<button
  type="button"
  onClick={() => setLoginModalOpen(true)}
  className="hidden items-center gap-2 rounded-2xl border ..."
>
  <User className="h-4 w-4" />
  تسجيل الدخول
</button>

<AuthLoginModal
  open={loginModalOpen}
  onClose={() => setLoginModalOpen(false)}
  onSuccess={() => {
    setLoginModalOpen(false);
    setAuthState("auth");
    setAccountName(readAccountName());
  }}
/>
```

### Variants

| الـ variant | الوصف |
|------------|--------|
| `idle` | نموذج جاهز — حقلا بريد + كلمة مرور + زر "دخول" |
| `loading` | الزر في حالة spinner — الحقول معطّلة |
| `error` | رسالة خطأ حمراء تحت الحقول (بيانات غير صحيحة أو خطأ شبكة) |
| `success` | لا حاجة لها — `onSuccess()` يُغلق Modal مباشرة |

### سلوك States

**loading:** تعطيل input + إظهار spinner في مكان نص "دخول".

**error:** رسالة `"بيانات تسجيل الدخول غير صحيحة، أو حاول مرة أخرى."` تظهر فوق زر الدخول، حمراء، دون مسح الحقول.

**success:** استدعاء `onSuccess()` → يُغلق الـ modal → `HomeHeaderActions` يُحدّث حالة المصادقة محلياً عبر `setAuthState("auth")`.

**fallback:** إن أغلق المستخدم الـ modal دون دخول → لا تغيير في الحالة.

### Auth Integration

يستخدم نفس نقطة النهاية التي تستخدمها صفحة `/auth/login` الحالية.
بعد النجاح: يُكتب `stores_token` في `localStorage` بنفس منطق `HomeHeaderActions.readAccountName()`.
لا يحتاج WishlistContext أو state خارجي — `onSuccess` callback يكفي.

---

## معايير القبول

- [ ] الضغط على "تسجيل الدخول" يفتح modal دون تنقل للصفحة
- [ ] الـ modal يحتوي: حقل بريد إلكتروني، حقل كلمة مرور، زر "دخول"، زر إغلاق ×
- [ ] Escape key وbackdrop click يُغلقان الـ modal
- [ ] حالة loading تعطّل الحقول وتُظهر مؤشر انتظار
- [ ] حالة error تُظهر رسالة دون مسح الحقول
- [ ] بعد نجاح تسجيل الدخول: الـ modal يُغلق وهيدر الصفحة يتحول لحالة "auth" (يظهر اسم الحساب)
- [ ] رابط "ليس لديك حساب؟ أنشئ متجرك" يُوجه لـ `/auth/signup` ويُغلق الـ modal
- [ ] "نسيت كلمة المرور؟" يُوجه لـ `/auth/forgot-password` ويُغلق الـ modal
- [ ] `focus-trap` داخل الـ modal (Tab لا يخرج منه)
- [ ] ARIA: `role="dialog"`, `aria-modal="true"`, `aria-label="تسجيل الدخول"`

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التعديل |
|-------|------------|
| `components/home/AuthLoginModal.tsx` | **جديد** — المكوّن الكامل |
| `components/home/HomeHeaderActions.tsx` | تعديل — حالة الضيف: Link → button + modal |

لا تعديل على:
- `app/auth/login/page.tsx` أو أي صفحة auth قائمة
- أي ملف في `docs/design/baseline/`
- `tailwind.config` tokens

---

## مخاطر التغيير

| الخطر | التخفيف |
|-------|---------|
| نقطة النهاية غير معروفة | Cursor يراجع `app/auth/login/page.tsx` أو `lib/auth-token.ts` لاستخراج الـ API endpoint المستخدم |
| CORS على auth endpoint | إن كانت الـ API تمنع طلبات من SPA، يُبقي Cursor على Link كـ fallback |
| SSR/hydration mismatch | `HomeHeaderActions` يستخدم `"use client"` بالفعل — لا مشكلة |
| Scroll lock على body | يُطبق `overflow-hidden` على `<body>` عند فتح الـ modal ويُزيله عند إغلاقه |

---

## استثناء: لا تمس

- الملفات في `docs/design/baseline/`
- tokens في `tailwind.config` (إلا بنص صريح)
- `app/auth/login/page.tsx` — يبقى كـ fallback كامل

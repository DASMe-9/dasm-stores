# Spec: شريط إعلانات المتجر (Store Announcement Bar)

**التاريخ:** 2026-07-11
**المصدر:** Salla Twilight Theme — ميزة "شريط الإعلانات" القياسية (W30)
**الأولوية:** عالية — أثر مرتفع / جهد منخفض. يتيح للتاجر الإعلان عن عروض موسمية وشحن مجاني مباشرة فوق كل صفحة في متجره.

---

## السياق والمبرر

Salla تُقدّم "شريط الإعلانات" (Announcement Bar) كميزة قياسية في كل ثيم — شريط نصي ضيق فوق الهيدر، محتواه يضبطه التاجر. الميزة غائبة كلياً عن `components/store/StoreHeader.tsx`.

الحالة الراهنة: التاجر ليس لديه أي آلية لعرض رسالة موسمية/ترويجية بارزة لزوار متجره. الوحيد المسار هو صور الـ Hero — أبطأ تحديثاً وأصعب تخصيصاً.

الفائدة الرئيسية: إعلان "شحن مجاني فوق 200 ر.س" يرفع متوسط قيمة الطلب دون تعديل على أي صفحة منتج.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `components/store/StoreHeader.tsx` — يبدأ مباشرة بـ `<div className="sticky top-0 z-40 ...">` دون أي مساحة للإعلان

**هيكل الـ sticky nav الحالي:**
```
sticky div (z-40) →
  div (h-16) → [شعار | nav links | auth actions]
```

لا يوجد أي مسار في `resolveStoreTemplateConfig()` يُعيد `announcement_bar`.

---

## التغيير المقترح

### TypeScript interface (إضافة إلى HeroTemplateConfig)

```typescript
type HeroTemplateConfig = {
  // ... existing fields ...
  announcement_bar?: {
    enabled: boolean;
    text: string;
  } | null;
};
```

### السلوك

الشريط يظهر داخل `<div className="sticky top-0 z-40 ...">` كأول عنصر، قبل الـ nav:

```tsx
{announcementBar?.enabled && announcementBar?.text ? (
  <div
    className="flex items-center justify-center border-b border-[var(--c-line)] bg-[var(--c-brand)] px-[var(--space-4)] py-[var(--space-1)] text-center text-xs font-semibold text-white"
    role="banner"
    aria-label="إعلان المتجر"
  >
    <span className="line-clamp-1 max-w-prose">{announcementBar.text}</span>
  </div>
) : null}
```

**الاستخراج من config (في body الدالة StoreHeader):**
```typescript
const announcementBar = (resolveStoreTemplateConfig(store) as HeroTemplateConfig | null)
  ?.announcement_bar ?? null;
```

### variants

| الحالة | السلوك |
|--------|--------|
| `enabled: false` أو `text: ""` | الشريط مخفي تماماً — الهيدر بارتفاعه الاعتيادي |
| `enabled: true` + `text` | شريط `h-8` فوق الـ nav، لون `var(--c-brand)` |
| نص طويل | `line-clamp-1 max-w-prose` — لا overflow |

### states

- **لا loading:** البيانات من `store` الذي يُمرَّر كـ prop (server-side)
- **لا error state:** إن غاب الحقل، لا شريط
- **compact mode:** يظهر الشريط حتى في `compact={true}` (builder stores) — هو فوق الـ nav مباشرة، قبل الـ hero

---

## معايير القبول

- [ ] الشريط لا يظهر إن كان `announcement_bar.enabled === false` أو `text` فارغاً أو `announcement_bar` غير موجود في config
- [ ] الشريط جزء من `sticky top-0` — يبقى ثابتاً عند التمرير
- [ ] لون الخلفية `var(--c-brand)` ليتوافق مع ثيم المتجر الذي اختاره التاجر
- [ ] النص محدود بسطر واحد (`line-clamp-1`) — لا يمدّ ارتفاع الهيدر
- [ ] لا يكسر الهيدر على الموبايل — النص يُقطع بـ `…` عند الضيق
- [ ] الـ HTML يحتوي `role="banner"` و `aria-label` لإمكانية الوصول
- [ ] لا تغيير على حالة `compact={true}` — الشريط يظهر فيها أيضاً

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/store/StoreHeader.tsx` | **تعديل** — قراءة `announcementBar` من config وإضافة الشريط داخل الـ sticky div |
| `lib/themes/storefront-tokens.ts` أو ما يعرّف `HeroTemplateConfig` | **تعديل** — إضافة `announcement_bar` للـ type |

**ملفان فقط. لا مكوّنات جديدة. لا تغيير على API أو DB.**

---

## مخاطر التغيير

1. **ارتفاع الهيدر:** الشريط يضيف ~32px للـ sticky header. إن كان هناك `scroll-margin-top` أو `pt` مُحدَّد بـ `h-16` (64px) في صفحات أخرى، قد يحتاج تعديل. تحقق من: `app/[slug]/layout.tsx`.

2. **لون الخلفية:** `var(--c-brand)` يعمل مع الثيمات المخصصة. إن أراد التاجر لون مختلف للشريط تحديداً، تحتاج المرحلة التالية حقل `bg_color` في الـ config.

3. **RTL/LTR:** النص `text-center` مع `dir` الصفحة (RTL) — لا مشكلة متوقعة.

4. **XSS:** النص يُعرض كـ `{announcementBar.text}` (escaped) — آمن.

---

## استثناء: لا تمس

- `docs/design/baseline/` — لا صور تُعدَّل هنا
- tokens في `tailwind.config` — لا تضيف classes جديدة، استخدم الـ tokens القائمة
- أي صفحة خارج `StoreHeader.tsx` و type definitions

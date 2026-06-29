# Spec: بطاقات الأقسام في الـ marketplace — Salla-style tiles

**التاريخ:** 2026-06-29
**المصدر:** commit `8f7b63b` (Salla-style landing للمتاجر) + نمط Salla category tiles الموثَّق في W28-W30
**الأولوية:** متوسطة-عالية — بسيطة جداً (تعديل CSS فقط)، تُحقق تناسقاً بصرياً بين marketplace وStorefrontBlocks

---

## السياق والمبرر

في commit `8f7b63b` (2026-06-21) طُبِّق أسلوب Salla على بطاقات الأقسام في **StorefrontBlocks** (صفحات المتاجر):
```
Categories: flat full-colour buttons → clean white tiles
  with a tinted accent icon, soft shadow, hover lift
```

بطاقات الأقسام في **الـ marketplace** (`app/page.tsx` → قسم `#categories`) لم تُحدَّث بعد.
الأيقونة لا تزال رمادية (`text-slate-500`), ولا يوجد hover lift, ولا tinted icon background.

نفس المنصة، لغتان بصريتان مختلفتان للأقسام — يُشتَّت المستخدم.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `app/page.tsx` — السطور 182-188 (قسم `#categories`)

**السلوك الحالي:**
```tsx
{categories.map((category) => {
  const Icon = category.icon;
  return (
    <Link key={category.name} href={category.href}
      className="flex items-center justify-between gap-3 rounded-2xl border
        border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4
        shadow-sm transition hover:border-emerald-200 hover:shadow-md"
    >
      <div>
        <p className="text-sm font-extrabold">{category.name}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{category.description}</p>
      </div>
      <Icon className="h-8 w-8 text-slate-500 dark:text-zinc-400" />
    </Link>
  );
})}
```

**المشكلة البصرية:**
- الأيقونة رمادية (`text-slate-500`) — لا تعكس هوية القسم
- لا hover lift (translate-y) — البطاقة ثابتة مقارنة ببطاقات StoreCard وProductTile
- لا tinted background للأيقونة — تبدو باهتة

---

## التغيير المقترح

### TypeScript signature (لا تغيير)

بنية `categories` array و `Link` component تبقى كما هي.

### التعديل البصري فقط

```tsx
{categories.map((category) => {
  const Icon = category.icon;
  return (
    <Link
      key={category.name}
      href={category.href}
      className="flex items-center justify-between gap-3 rounded-2xl border
        border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4
        shadow-sm transition hover:-translate-y-1 hover:border-emerald-200
        hover:shadow-md"
    >
      <div>
        <p className="text-sm font-extrabold">{category.name}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          {category.description}
        </p>
      </div>
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl
        bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300
        transition group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </div>
    </Link>
  );
})}
```

**التغييرات المحددة:**
1. أيقونة: من `<Icon className="h-8 w-8 text-slate-500" />` مباشرة
   إلى wrapper `div.grid.h-10.w-10.rounded-xl.bg-emerald-50` + `<Icon className="h-5 w-5" />`
2. hover lift: إضافة `hover:-translate-y-1` على الـ Link

---

## معايير القبول

- [ ] الأيقونة داخل pill emerald دائري/مربع على الـ light والـ dark mode
- [ ] عند hover: البطاقة ترتفع قليلاً (`-translate-y-1`) + border يتحول لـ emerald
- [ ] لا تغيير في النص أو الروابط أو ترتيب العناصر
- [ ] المظهر متناسق مع hover behavior لـ ProductTile وStoreCard في نفس الصفحة
- [ ] dark mode: `bg-emerald-500/10` + `text-emerald-300` للأيقونة

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `app/page.tsx` | **تعديل** — قسم categories فقط (السطور ≈182-188). تغيير className للـ icon + إضافة wrapper div + hover lift |

**ملف واحد. تغيير CSS فقط. لا logic جديدة.**

---

## مخاطر التغيير

1. **أحجام الأيقونات:** الأيقونة تصغر من `h-8 w-8` إلى `h-5 w-5` داخل wrapper.
   إن بدت صغيرة جداً، يمكن رفعها إلى `h-6 w-6` دون تأثير على الـ wrapper.

2. **RTL:** الـ wrapper div يحل محل الأيقونة في نفس موضعها (flex آخر). لا تأثير على RTL.

3. **Tailwind purge:** كلاس `bg-emerald-500/10` مستخدم في ملفات أخرى — لن يُحذف.

4. **تناسق مع StoreCard hover:** `StoreCard.tsx` يستخدم `hover:shadow-md` بدون translate.
   إضافة translate هنا تجعل categories أكثر تفاعلية — مقبول نظراً لصغر حجم البطاقات.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- `tailwind.config` / `styles/globals.css`
- أي ملف خارج `app/page.tsx`
- الـ `categories` array definition (أعلى الملف)
- مكوّن `HeroScene` أو أي section آخر في الصفحة

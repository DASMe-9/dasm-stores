# Spec: شارات الثقة في StoreInfoCard

## السياق والمبرر

`components-inventory.md` يُحدد صراحةً أن `StoreInfoCard` يجب أن يحتوي على "صف وسوم (موقع، موثوقية، توصيل)". الكود الحالي يعرض الموقع فقط (`MapPin + areaName`) ويغفل شارتَي الثقة. تحليل المنافسين (2026-24، 2026-25) يؤكد أن شارات الثقة معيار راسخ في Salla وZid. الإصلاح لا يحتاج حقل API جديد — يستخدم حقول موجودة في `StorePublic`.

## الحالة الراهنة في dasm-stores

**الملف المعني:**
- `components/store/StoreHeader.tsx` — السطر 164–181

**السلوك الحالي (السطر 164–181):**
```tsx
<div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
  {areaName ? (
    <span className="flex items-center gap-1">
      <MapPin className="h-3.5 w-3.5" />
      {areaName}
    </span>
  ) : null}
  {store.contact_phone ? (
    <a href={`tel:${store.contact_phone}`} ...>
      <Phone className="h-3.5 w-3.5" />
      {store.contact_phone}
    </a>
  ) : null}
</div>
```

الشارتان الغائبتان:
- **موثوق** — تشير إلى تاجر أو معرض (owner_type !== 'user')
- **تواصل متاح** — تشير إلى توفر قناة تواصل (WhatsApp أو هاتف)

## التغيير المقترح

**الواجهة (TypeScript):** لا تغيير في props — يستخدم `store.owner_type` و`store.contact_whatsapp` و`store.contact_phone` الموجودة في `StorePublic`.

**المنطق:**
```tsx
const isTrustedSeller = store.owner_type === 'dealer' || store.owner_type === 'venue_owner';
const hasContact = !!(store.contact_whatsapp || store.contact_phone);
```

**التعديل على div الشارات (السطر 164–181):**
```tsx
<div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
  {areaName ? (
    <span className="flex items-center gap-1">
      <MapPin className="h-3.5 w-3.5" />
      {areaName}
    </span>
  ) : null}
  {isTrustedSeller ? (
    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
      <BadgeCheck className="h-3.5 w-3.5" />
      متجر موثوق
    </span>
  ) : null}
  {hasContact ? (
    <span className="flex items-center gap-1">
      <Headphones className="h-3.5 w-3.5" />
      تواصل متاح
    </span>
  ) : null}
  {store.contact_phone ? (
    <a href={`tel:${store.contact_phone}`} className="flex items-center gap-1 hover:underline"
       style={{ color: "var(--primary-text,var(--primary))" }}>
      <Phone className="h-3.5 w-3.5" />
      {store.contact_phone}
    </a>
  ) : null}
</div>
```

**ملاحظة:** `BadgeCheck` موجود بالفعل في imports من `lucide-react` لكن تحتاج للتحقق — إن لم يكن مستورداً في `StoreHeader.tsx` أضفه للـ import.

**Variants:**
- `dealer / venue_owner` + WhatsApp → شارتا "موثوق" + "تواصل متاح"
- `user` + هاتف فقط → شارة "تواصل متاح" فقط + رقم الهاتف
- `user` + لا تواصل → لا شارات ثقة (يبقى الموقع فقط)
- `dealer` + لا تواصل → "موثوق" فقط

**States:**
- loading: لا تأثير (شرط بيانات ثابتة من SSR)
- empty/error: لا تأثير (المكوّن لا يُعرض)

## معايير القبول

- [ ] متجر بـ `owner_type === 'dealer'` يعرض شارة "متجر موثوق" بأيقونة BadgeCheck خضراء.
- [ ] متجر بـ `owner_type === 'venue_owner'` يعرض نفس الشارة.
- [ ] متجر بـ `owner_type === 'user'` لا يعرض "متجر موثوق".
- [ ] متجر بـ `contact_whatsapp` أو `contact_phone` يعرض شارة "تواصل متاح".
- [ ] الشارتان تظهران في نفس صف الموقع بتباعد `gap-3`.
- [ ] الوضع الليلي: شارة "موثوق" بلون `emerald-400`.
- [ ] رقم الهاتف (إن وجد) يبقى كرابط قابل للنقر بعد إضافة الشارات.
- [ ] الموقع (`areaName`) يبقى في موضعه كأول عنصر في الصف.

## الملفات التي سيلمسها Cursor

```
components/store/StoreHeader.tsx   ← السطر 164–181 فقط (div الشارات)
                                   ← إضافة BadgeCheck للـ import (السطر 5–12) إن لزم
```

## مخاطر التغيير

- **منخفض جداً:** إضافة عناصر عرض شرطية فقط — لا منطق أعمال، لا طلبات API.
- `owner_type` ثابت من SSR — لا حالة async.
- قد تضيف الشارات عرضاً على الشاشات الصغيرة جداً → flex-wrap يعالج التدفق تلقائياً.
- `BadgeCheck` مستخدم بالفعل في `app/page.tsx` — موجود في حزمة lucide ولا تأثير على bundle.

## استثناء: لا تمس

- ملفات `docs/design/baseline/`
- tokens في `tailwind.config`
- `app/page.tsx` — ليس محل هذا الـ spec
- منطق `resolveStoreCssVariables` أو أي ثيم

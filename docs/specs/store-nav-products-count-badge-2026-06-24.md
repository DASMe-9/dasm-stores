# Spec: شارة عدد المنتجات على رابط "المنتجات" في هيدر المتجر

## السياق والمبرر

أُضيف رابط "المنتجات" إلى شريط تنقل المتجر في الكوميت `e65d0a0` (2026-06-22، #195). الرابط يُظهر النص فقط. متاجر Salla تعرض عدد المنتجات بشكل واضح بجوار رابط الكتالوج ("127 منتج") ما يُخبر المتسوق بحجم المخزون قبل النقر. البيانات متاحة في `store.products_count` دون حاجة لأي استدعاء API إضافي.

## الحالة الراهنة في dasm-stores

**الملف المعني:** `components/store/StoreHeader.tsx` السطر 87

```tsx
<Link href={`/${slug}/products`} className="rounded-full px-3 py-2 font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)]">
  المنتجات
</Link>
```

**السلوك الحالي:** رابط نصي "المنتجات" بدون أي مؤشر على حجم المخزون.

## التغيير المقترح

**TypeScript signature:** لا توجد props جديدة — `store.products_count: number | null` موجود في `StorePublic` ومُمرَّر عبر `store` prop.

### التصميم البصري

```tsx
<Link href={`/${slug}/products`} className="rounded-full px-3 py-2 font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)]">
  المنتجات
  {(store.products_count ?? 0) > 0 ? (
    <span
      className="me-1.5 rounded-full px-1.5 py-0.5 text-xs font-semibold"
      style={{
        backgroundColor: "color-mix(in srgb, var(--primary) 15%, transparent)",
        color: "var(--primary-text, var(--primary))",
      }}
    >
      {store.products_count}
    </span>
  ) : null}
</Link>
```

### Variants

| الحالة | العرض |
|--------|-------|
| `products_count >= 1` | "المنتجات" + شارة رقمية بلون `--primary` مخفف |
| `products_count === 0` أو `null` | "المنتجات" فقط — بدون شارة |
| `products_count > 999` | "999+" (تحاشياً لأرقام طويلة تُخرب التخطيط) |

### States

| الحالة | السلوك |
|--------|--------|
| loading | لا يوجد — البيانات مُحمَّلة عبر Server Component |
| empty (0 منتج) | الشارة مخفية — لا يُعرض رقم "0" |
| كثيرة (1000+) | "999+" |

## معايير القبول

- [ ] يعرض الشارة عند `products_count >= 1`
- [ ] يخفي الشارة عند `products_count === 0` أو `null`
- [ ] الشارة تستخدم `color-mix(in srgb, var(--primary) 15%, transparent)` للخلفية — لا ألوان صلبة
- [ ] عند `products_count > 999` يعرض "999+" لا الرقم كاملاً
- [ ] لا تأثير على حجم الشريط — الشارة لا تزيد ارتفاع `h-16` للهيدر
- [ ] يُخفى على `md:hidden` إن ضيّق الرابط المجاور (التحقق بشاشة 768px)

## الملفات التي سيلمسها Cursor

```
components/store/StoreHeader.tsx   ← السطر 87 فقط (الرابط "المنتجات")
```

**لا ملفات أخرى.** لا تغيير على props، لا API جديد، لا schema تعديل.

## مخاطر التغيير

| المخاطرة | الاحتمالية | التخفيف |
|----------|-----------|---------|
| ضغط التخطيط على شاشات صغيرة | منخفضة | إخفاء الشارة عند عرض أقل من 768px |
| عدم تزامن العداد مع المخزون الفعلي | منخفضة | `products_count` يُحدَّث عبر `revalidate = 60` في layout |
| تعارض مع ألوان قوالب داكنة | منخفضة | استخدام `color-mix + var(--primary)` يضمن التوافق مع كل قالب |

## استثناء: لا تمس

- ملفات في `docs/design/baseline/`
- tokens في `tailwind.config` (إلا بنص صريح)
- أي مكوّن غير `StoreHeader.tsx`

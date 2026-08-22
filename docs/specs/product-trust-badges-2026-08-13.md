# Spec: صف وسوم الثقة الثابتة على صفحة تفاصيل المنتج

**التاريخ:** 2026-08-13
**المصدر:** Dawn 15.5.0 "Product Disclosures" section (2026-06-19) + Zid Unaizah Pro sales-optimized PDP (2026-07-06)
**الأولوية:** عالية — يظهر على كل صفحة منتج، مباشرة قبل قرار الشراء. لا يتطلب بيانات جديدة من الـ API.

---

## السياق والمبرر

صفحة تفاصيل المنتج (`app/[slug]/products/[productId]/page.tsx`) تحتوي حالياً على:
- `ProductPurchaseSection` — زر الشراء والسعر
- `fulfillment_policy` block — شرطي، يظهر فقط إن كان المتجر قد ضبط سياسة الإرجاع
- WhatsApp + Share buttons

**الفجوة:** لا يوجد صف ثقة مضمون الظهور لكل المتاجر. المتسوق الذي يزور متجراً بدون `fulfillment_policy` لا يرى أي إشارة للمصداقية بين زر الشراء والوصف.

**البيانات التنافسية:**
- Shopify Dawn 15.5.0 أضافت قسم "Product Disclosures" على صفحة المنتج
- Zid Unaizah Pro يُدار تمييزها التنافسي بشكل رئيسي عبر "sales-optimized PDP" مع trust signals ثابتة
- النمط الصناعي: ثلاثة عناصر دائمة أسفل زر الشراء: أمان الدفع، سياسة الإرجاع، آلية التواصل

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `app/[slug]/products/[productId]/page.tsx` — الصفحة الرئيسية
- `components/product/ProductPurchaseSection.tsx` — قسم الشراء (لا تعديل عليه)

**السلوك الحالي بعد `ProductPurchaseSection`:**
```tsx
{storeData.fulfillment_policy ? (
  <div className="rounded-xl border ...">
    {/* سياسة الإرجاع — يظهر فقط إن توفر */}
  </div>
) : null}
<div className="flex flex-wrap gap-2">
  <WhatsAppButton ... />
  <ShareButton ... />
</div>
```

المتاجر بدون `fulfillment_policy` → صفرُ وسوم ثقة بين زر الشراء والوصف.

---

## التغيير المقترح

### TypeScript signature

```typescript
// components/product/ProductTrustBadges.tsx — مكوّن جديد
interface ProductTrustBadgesProps {
  returnWindowDays?: number | null;
  hasWhatsapp?: boolean;
}

export function ProductTrustBadges({
  returnWindowDays,
  hasWhatsapp,
}: ProductTrustBadgesProps): JSX.Element
```

### هيكل المكوّن

صف أفقي من 3–4 pills: أيقونة + نص قصير. يعرض دائماً بغض النظر عن البيانات.

```tsx
<div className="flex flex-wrap gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
  {/* دفع آمن — دائم */}
  <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
    <ShieldCheck className="h-4 w-4 text-[var(--primary)] shrink-0" />
    دفع آمن
  </span>

  {/* الإرجاع — يعرض المدة إن توفرت، وإلا نصاً عاماً */}
  <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
    <RotateCcw className="h-4 w-4 text-[var(--primary)] shrink-0" />
    {returnWindowDays ? `إرجاع خلال ${returnWindowDays} أيام` : "إرجاع حسب سياسة المتجر"}
  </span>

  {/* واتساب — يظهر فقط إن كان رقم واتساب موجوداً */}
  {hasWhatsapp ? (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
      <MessageCircle className="h-4 w-4 text-[var(--primary)] shrink-0" />
      دعم واتساب
    </span>
  ) : null}

  {/* متجر منصة داسم — دائم */}
  <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
    <BadgeCheck className="h-4 w-4 text-[var(--primary)] shrink-0" />
    متجر في منصة داسم
  </span>
</div>
```

### الموضع في الصفحة

يُوضع مباشرة بعد `ProductPurchaseSection` وقبل الـ `fulfillment_policy` block:

```tsx
// app/[slug]/products/[productId]/page.tsx — الموضع الجديد
<ProductPurchaseSection ... />

<ProductTrustBadges
  returnWindowDays={storeData.fulfillment_policy?.return_window_days ?? null}
  hasWhatsapp={Boolean(storeData.store.contact_whatsapp)}
/>

{storeData.fulfillment_policy ? (
  {/* كتلة الإرجاع التفصيلية — تبقى كما هي */}
) : null}
```

---

## variants

| الحالة | ما يُعرض |
|--------|----------|
| متجر بسياسة إرجاع + واتساب | 4 pills: دفع آمن + إرجاع X أيام + دعم واتساب + داسم |
| متجر بسياسة إرجاع بدون واتساب | 3 pills: دفع آمن + إرجاع X أيام + داسم |
| متجر بدون سياسة إرجاع + واتساب | 3 pills: دفع آمن + إرجاع عام + دعم واتساب + داسم |
| متجر بدون أي منهما | 3 pills: دفع آمن + إرجاع عام + داسم |

---

## معايير القبول

- [ ] المكوّن يُعرض على كل صفحة منتج دون استثناء (لا يعتمد على شرط)
- [ ] `returnWindowDays` ≥ 1 → يعرض العدد بالأيام. `null` أو `undefined` → يعرض "حسب سياسة المتجر"
- [ ] `hasWhatsapp: false` → pill الواتساب مخفية تماماً
- [ ] الأيقونات من lucide-react فقط: `ShieldCheck`، `RotateCcw`، `MessageCircle`، `BadgeCheck`
- [ ] لا يوجد `a` أو `Link` داخل المكوّن — الـ pills معلوماتية فقط، لا تنقل
- [ ] يتكيف مع الثيم الفاتح والداكن عبر CSS tokens (`var(--border)`، `var(--card)`، `var(--primary)`)
- [ ] لا طلبات API داخل المكوّن — البيانات تأتي كـ props
- [ ] يعمل في RTL بشكل صحيح (الأيقونة على اليمين في العرض العربي)

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/product/ProductTrustBadges.tsx` | **إنشاء** — مكوّن جديد |
| `app/[slug]/products/[productId]/page.tsx` | **تعديل** — import + إضافة `<ProductTrustBadges>` في الموضع المحدد |

**ملفان فقط. لا dependencies جديدة — lucide-react موجود مسبقاً.**

---

## مخاطر التغيير

1. **ازدحام بصري:** الصفحة تحتوي بالفعل على `WhatsAppButton` + `ShareButton`. الـ `ProductTrustBadges` يسبقهما في الترتيب — قد يبدو متكرراً مع "دعم واتساب" pill. الحل: إبقاء الـ pill معلوماتياً (لا زر)، وإبقاء `WhatsAppButton` كـ action button منفصل.

2. **تناسق مع fulfillment_policy block:** المكوّن الجديد يعرض "إرجاع X أيام" مختصراً، بينما الـ block الشرطي يعرض تفاصيل أكثر. الأمران مكملان — الـ pill يُشير للوجود، الـ block يُفصّل.

3. **"داسم" كعلامة ثقة:** يفترض أن المستخدم يعرف المنصة. مقبول — الصفحة داخل subdomain متجر داسم بالأصل.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- `components/product/ProductPurchaseSection.tsx` — لا تعديل على قسم الشراء
- `styles/globals.css` و `tailwind.config` — الـ tokens مستخدمة، لا تُعرَّف جديدة
- أي ملف خارج الملفين المذكورين أعلاه

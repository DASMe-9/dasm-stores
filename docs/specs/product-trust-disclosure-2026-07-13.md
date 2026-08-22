# Spec: Trust & Shipping Disclosure Row — صفحة تفصيل المنتج

**التاريخ:** 2026-07-13
**المُلهِم:** Shopify Dawn 15.5.0 (product disclosures section) + Salla `salla-fulfillment-methods`
**الأولوية:** عالية (أثر على كل صفحة منتج) / الجهد: منخفض (لا API جديد)

---

## السياق والمبرر

Shopify Dawn 15.5.0 (June 17, 2026) أضاف نمطاً جديداً: صف إفصاحات/ثقة أسفل زر CTA على صفحة المنتج. الهدف: تقليل التردد قبل الشراء عبر تأكيد الشحن، الأمان، والمرونة دون مغادرة الصفحة. Salla أضافت نمطاً مشابهاً بـ `salla-fulfillment-methods`.

في dasm-stores، `ProductPurchaseSection` (الجزء السفلي من صفحة المنتج) ينتهي بزر "أضف للسلة الآن" دون أي سياق ثقة. بيانات المتجر (موقع، واتساب، وصف) متاحة بالفعل من API الموجود دون طلبات إضافية.

---

## الحالة الراهنة في dasm-stores

### الملفات المعنية

- `components/product/ProductPurchaseSection.tsx` — يُضاف الـ Disclosure Row أسفل `<button>` الـ ATC (السطر 218-234)
- `app/[slug]/products/[productId]/page.tsx` — يُمرَّر `store` prop للـ ProductPurchaseSection

### السلوك الحالي

بعد زر "أضف للسلة الآن" لا يوجد شيء. لا يوجد مؤشر شحن، ثقة، أو تواصل. المتسوق لا يعرف هل الشحن مدفوع؟ هل يمكن التواصل مع البائع؟

---

## التغيير المقترح

### الواجهة (TypeScript signature)

```tsx
// مكوّن داخلي — لا يستدعي API جديد
function TrustDisclosureRow({
  areaName,
  whatsappPhone,
}: {
  areaName?: string | null;
  whatsappPhone?: string | null;
})
```

### المحتوى والترتيب

صف أفقي قابل للالتفاف (`flex-wrap`) من 2-3 عناصر، أسفل زر الـ CTA مباشرة، بعدسة بصرية خافتة (نص صغير، لون muted):

| العنصر | الظهور | البيانات |
|--------|--------|----------|
| "الرياض" مع أيقونة `MapPin` | إذا `store.area?.name_ar` موجود | `store.area.name_ar` |
| "تواصل عبر واتساب" مع أيقونة `MessageCircle` | إذا `store.contact_whatsapp` موجود | `https://wa.me/${store.contact_whatsapp}` |
| "دفع آمن" مع أيقونة `ShieldCheck` | دائماً | نص ثابت |

### variants

- `full`: كل العناصر (3 عناصر) — الوضع الافتراضي
- `minimal`: دفع آمن فقط — للمتاجر بدون بيانات إضافية

### سلوك states

| State | السلوك |
|-------|--------|
| بيانات كاملة (موقع + واتساب) | 3 عناصر في صف |
| موقع فقط | عنصران: موقع + دفع آمن |
| واتساب فقط | عنصران: واتساب + دفع آمن |
| لا بيانات إضافية | عنصر واحد: دفع آمن فقط (لا يختفي أبداً) |

---

## معايير القبول

- [ ] الصف يظهر أسفل زر "أضف للسلة الآن" في جميع حالات المنتج (عادي، خصم، نافد)
- [ ] عنصر الموقع يظهر فقط إذا `store.area?.name_ar` غير فارغ
- [ ] رابط واتساب يُفتح `https://wa.me/` في tab جديد (target="_blank") إذا `store.contact_whatsapp` موجود
- [ ] عنصر "دفع آمن" يظهر دائماً بصرف النظر عن بيانات المتجر
- [ ] الصف لا يُعطّل زر الـ CTA بصرياً (padding فاصل واضح، لون خافت)
- [ ] الصف مخفي عند حالة `outOfStock` (لا داعي لمعلومات الشحن إذا المنتج نافد)
- [ ] لا يكسر اتجاه RTL

---

## الملفات التي سيلمسها Cursor

```
components/product/ProductPurchaseSection.tsx   ← إضافة TrustDisclosureRow داخل المكوّن + تمرير props
app/[slug]/products/[productId]/page.tsx         ← تمرير store.area?.name_ar + store.contact_whatsapp للـ ProductPurchaseSection
```

**ملاحظة:** لا يحتاج Cursor لإنشاء ملفات جديدة. المكوّن صغير ويُضاف inline داخل `ProductPurchaseSection.tsx`.

---

## مخاطر التغيير

| الخطر | التقدير | التخفيف |
|-------|---------|---------|
| كسر تخطيط صفحة المنتج | منخفض — إضافة فقط أسفل الـ CTA | اختبار على store بدون بيانات + store بجميع البيانات |
| ظهور رابط واتساب خاطئ | منخفض — مشروط على وجود الحقل | `if (whatsappPhone)` guard |
| تأثير على Storefront Builder stores | لا — `ProductPurchaseSection` مستقل عن builder |

---

## استثناء: لا تمس

- `docs/design/baseline/` — الصور المرجعية
- `tailwind.config` — لا تغيير في tokens
- أي ملف خارج الملفين المذكورين أعلاه

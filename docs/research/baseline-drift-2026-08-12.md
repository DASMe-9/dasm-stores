# تقرير انحراف بصري — baseline-drift-2026-08-12

**تاريخ التشغيل:** 2026-08-12 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)
**فجوة زمنية:** 8 أسابيع (أطول من المعتاد بسبب تغيير جدولة الراوت)

---

## ملخص تنفيذي

**يوجد drift حرج جديد.** تم إعادة هيكلة صفحة السوق الرئيسية بالكامل في الكوميت `013f987` بتاريخ 2026-07-30.  
التغيير ضخم ومتعمّد ("homepage elevation") لكنه أحدث انحرافاً بصرياً واضحاً عن الـ baseline على محاور متعددة.

**قرار المرحلة:** drift مانع → التوقف بعد المرحلة 1 وفق البروتوكول.

---

## الكوميتات الجديدة المؤثرة على الملفات البصرية (منذ 2026-06-16)

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `013f987` | 2026-07-30 | [codex] elevate DASM Stores marketplace homepage | `app/page.tsx` (+778 سطر) | **حرج** — إعادة هيكلة كاملة للـ Hero والصفحة |
| `2a9372c` | 2026-07-30 | fix homepage light and dark theme coverage | `app/page.tsx` | تصحيح ثيم — مكمّل للسابق |
| `8b42fda` | 2026-06-27 | refactor storefront components to tokens | `components/product/ProductCard.tsx` | إعادة هيكلة CSS tokens — لا تغيير بصري ظاهر |
| `56ee40c` | 2026-06-20 | drop "cart emptied" store-switch banner | `components/store/StoreChrome.tsx` | إزالة Banner — خارج نطاق baseline |
| `5f7bf39` | 2026-06-18 | remove duplicate advertise banner | `app/page.tsx` | إزالة تكرار — خارج نطاق baseline الأساسي |

---

## الانحرافات الجديدة — Hero (marketplace)

### الانحراف 1 — تغيير الأسلوب البصري الكلي للـ Hero

| | الـ Baseline | الكود الحالي |
|--|---|---|
| **الملف** | — | `app/page.tsx` سطر 452-499 |
| **الخلفية** | داكن: `bg-[#021b1f]` — تركواز عميق | فاتح/داكن: `bg-[#eaf2f1]` / `dark:bg-[#081c2c]` |
| **المحتوى البصري** | مشهد ثلاثي الأبعاد: `HeroScene` (ShoppingBag، Headphones، FlaskConical، خطوط ضوء، جسيمات) | CommercePassport card على اليمين — لا مشهد ثلاثي الأبعاد |
| **البحث** | داخل الـ Hero: `rounded-full` بعرض عريض | منقول إلى section منفصل أسفل الـ Hero |
| **الـ CTA** | "اكتشف متاجر ومنتجات داسم" + بحث مباشر | "أنشئ متجرك" + "استكشف السوق" (زرّان بدون بحث في الـ Hero) |

**متى تغيّر:** كوميت `013f987` — 2026-07-30

**توصية الاسترجاع (كتوصية فقط، لا تنفيذ):**  
إما قبول الـ Hero الجديد وتحديث الـ baseline (والإعلان عنه رسمياً)، أو إعادة المشهد البصري السينمائي ضمن الـ Hero الجديد بدمجه كعنصر خلفية مع الحفاظ على الـ CommercePassport.

---

### الانحراف 2 — غياب شريط أيقونات مزايا المنصة (Platform Features Strip)

**المكوّن المنحرف:** Hero (marketplace) — `app/page.tsx`

**الوصف البصري في الـ baseline:**  
شريط أفقي تحت الـ Hero يضم أيقونات قصيرة (شحن، ثقة، أمان، دعم) — `{ icon, label }[]`

**الحالة الراهنة في الكود:**  
لا وجود لأي شريط مزايا في `app/page.tsx`. بعد الـ Hero مباشرة تأتي قسم البحث (`<section>` سطر 501) ثم `#for-merchants`.

**متى تغيّر:** كان غائباً قبل الـ elevation (مقبول بقرار التجميد 2026-06-07)، ولا يزال غائباً في الـ elevation الجديد.

**توصية الاسترجاع:**  
إضافة `PlatformFeatures` component بعد قسم البحث (بين سطري 529 و530) يعرض 4 بطاقات صغيرة: شحن سريع / متاجر موثوقة / دعم عربي / أمان الدفع — بدون منطق — فقط HTML ثابت.

---

### الانحراف 3 — spec `home-header-seller-cta-2026-06-16.md` مُنفَّذ (إغلاق)

**المكوّن:** `components/home/HomeHeaderActions.tsx`

**الحالة:** تم تنفيذ زر "افتح متجرك" للضيوف في كوميت `013f987`. الـ spec من W29 مكتمل.

```tsx
// سطر 138-144 في HomeHeaderActions.tsx — مُضاف في 013f987
<Link href="/auth/signup" className="hidden items-center gap-2 rounded-2xl bg-[#0e7c66] ...">
  <Store className="h-4 w-4" />
  افتح متجرك
</Link>
```

**القرار:** spec مُنجَز — يُرحَّل إلى Cursor للمراجعة وإغلاق الـ spec رسمياً.

---

## حالة الفجوات البصرية المستمرة (لا تغيير منذ 2026-06-16)

| المكوّن | العنصر | الحالة في الكود | الـ Spec |
|---------|--------|-----------------|---------|
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في سطر 237 | `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة (موثوق/توصيل سريع) | **غائب** | `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## الـ Specs السابقة المنفّذة جزئياً (للمراجعة)

| الـ Spec | الحالة |
|---------|--------|
| `home-header-seller-cta-2026-06-16.md` | **مُنفَّذ** في `013f987` — يستحق إغلاقاً رسمياً |

---

## الخطوة التالية

**drift حرج موجود (Hero restructure) → لا تكملة لمرحلتي 2 و3 في هذه الجولة.**

الإجراء المطلوب يدوياً:
1. مراجعة الـ Hero الجديد والبتّ في: تحديث الـ baseline أم استرجاع المشهد البصري؟
2. إغلاق spec `home-header-seller-cta-2026-06-16.md` رسمياً بعد تأكيد التنفيذ.
3. إضافة `PlatformFeatures` strip إن قُرّر إبقاء الـ Hero الجديد.

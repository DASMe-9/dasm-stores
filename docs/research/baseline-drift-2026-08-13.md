# تقرير انحراف بصري — baseline-drift-2026-08-13

**تاريخ التشغيل:** 2026-08-13 (جولة أسبوعية — W33، الخميس)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد — آخر جولة موثّقة)
**الفجوة الزمنية:** ~8 أسابيع منذ آخر تشغيل (W25 → W33)

---

## ملخص تنفيذي

⛔ **يوجد drift جديد وجوهري** في مكوّن Hero للصفحة الرئيسية — تغيير بصري كامل نتيجة PR #271 (2026-07-30). وفق قواعد الحارس: **توقف بعد المرحلة 1، لا تكملة للمرحلتين 2 و3 هذه الجولة.**

**Drifts جديدة (غير موثّقة سابقاً):** 2
**Drifts سابقة مستمرة:** 5 (مُحدَّثة من التقرير السابق بلا تغيير)
**حالة exa:** متاحة الآن عبر MCP (كانت محجوبة 7 جولات متتالية) — تُفعَّل في الجولة القادمة

---

## الكوميتات الجديدة المؤثرة (منذ 2026-06-16)

| الكوميت | التاريخ | الوصف | الملفات المتأثرة |
|---------|---------|-------|-----------------|
| `013f987` | 2026-07-30 | [codex] elevate DASM Stores marketplace homepage | `app/page.tsx` (+778/-87) · `components/home/HomeHeaderActions.tsx` (+25) |
| `2a9372c` | 2026-07-30 | [codex] fix homepage light and dark theme coverage | `app/page.tsx` (+29/-26) |
| `1e9da36` | 2026-07-30 | Merge PR #273 إصلاح الوضع النهاري والليلي | دمج فرع `2a9372c` |
| `f48a3f3` | 2026-07-30 | Merge PR #271 Elevate DASM Stores marketplace homepage | دمج رسمي في main |
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx` (إعادة هيكلة CSS tokens — لا drift بصري مؤكد) |
| `5f7bf39` | قبل 2026-06-16 | fix: remove duplicate advertise banner | لا تأثير على baseline |
| `ce5e8e2` | 2026-08-03 | fix(copy): promise only what the platform can prove (#282) | `components/ads/AdBanner.tsx` · `pages/auth/login.tsx` — نص فقط، لا تغيير هيكلي |

---

## Drift جديد #1 — Hero: تغيير جوهري في التركيب والخلفية

| الحقل | القيمة |
|-------|--------|
| **المكوّن** | Hero (marketplace) |
| **الملف** | `app/page.tsx` |
| **الأسطر المعنية** | 451–499 |
| **تاريخ التغيير** | 2026-07-30 (PR #271 · commit `013f987`) |
| **الخطورة** | عالية — التغيير يطال أعلى مساحة بصرية في المنصة |

### ما كان عليه الـ baseline (docs/design/baseline/marketplace-home.png)

وفق `docs/design/baseline/components-inventory.md` — Hero (marketplace):
- **خلفية:** شريط داكن بعرض الصفحة، تدرج تركواز/سائل مع جسيمات وخطوط ضوء
- **الجانب الأيمن:** صور منتجات/أغراض معلقة ثلاثية الأبعاد
- **المحتوى:** عنوان رئيسي + فرعي + حقل بحث أبيض كبير مع قائمة نطاق + صف أيقونات مزايا المنصة

### ما هو عليه الكود الآن

```tsx
// app/page.tsx سطر 453
className="relative overflow-hidden bg-[#eaf2f1] px-4 py-14 text-[#081c2c] ..."
```

- **الخلفية:** فاتحة خضراء (`#eaf2f1` في Light، `#081c2c` في Dark) — لا جسيمات ولا تدرج ضوئي
- **التخطيط:** عمودان (`lg:grid-cols-[1.05fr_.95fr]`) — نص على اليسار، `CommercePassport` card على اليمين
- **مكوّن `CommercePassport`:** بطاقة تفاعلية تعرض مسار إعداد المتجر بخطوات رقمية (5 خطوات) وعدد المتاجر الحي
- **أزرار:** زر "أنشئ متجرك" (أخضر) + زر "استكشف السوق" (حدودي شفاف) + رابط نصي للشراكات والاستثمار
- **غائب تماماً:** صور منتجات ثلاثية الأبعاد — صف أيقونات مزايا المنصة (شحن، ثقة، أمان، دعم)

### توصية الاسترجاع (للمراجعة — لا تنفيذ)

لإعادة المحاذاة مع الـ baseline البصري، ينبغي أن يكون Hero:

```
سطر 453 className:
  الحالي: "relative overflow-hidden bg-[#eaf2f1] ..."
  المطلوب: خلفية داكنة — مثال: bg-[#081c2c] مع overlay تدرج تركواز
  
سطر 456–495 (العمود الأيمن):
  الحالي: <CommercePassport storeCount={...} />
  المطلوب: حاوية صور منتجات ثلاثية الأبعاد أو وسائط تسويقية مشابهة للـ baseline
```

يُقترح إما:
1. استعادة التصميم الداكن مع إدراج `CommercePassport` كمكوّن ثانوي داخل قسم "لأصحاب المتاجر"
2. تحديث صور الـ baseline لتعكس التوجه الجديد (قرار المالك مطلوب)

---

## Drift جديد #2 — شريط البحث: نقل من داخل Hero إلى قسم مستقل + حذف قائمة النطاق

| الحقل | القيمة |
|-------|--------|
| **المكوّن** | Search Bar (marketplace) |
| **الملف** | `app/page.tsx` |
| **الأسطر المعنية** | 501–529 |
| **تاريخ التغيير** | 2026-07-30 (PR #271 · commit `013f987`) |
| **الخطورة** | متوسطة — التجربة الوظيفية محفوظة لكن السياق البصري للبحث تغيّر |

### ما كان عليه الـ baseline

- حقل البحث **جزء من Hero** — مدمج داخل خلفيته البصرية الداكنة
- يشمل: `<select>` قائمة نطاق (مثل «الكل» / «متاجر» / «منتجات»)
- عرض مساوٍ لعرض الـ Hero مع padding كبير

### ما هو عليه الكود الآن

```tsx
// app/page.tsx سطر 501–529
<section className="border-b border-slate-200 bg-[#f4f0e8] px-4 py-5 ...">
  <form action="/" className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border ...">
    <Search className="..." />
    <input id="marketplace-search" name="q" ... />
    <button>بحث</button>
  </form>
```

- قسم مستقل بخلفية بيج (`#f4f0e8`) منفصل بصرياً عن الـ Hero
- لا `<select>` لنطاق البحث — يبحث في المنتجات فقط (الـ params `q` و `owner_type`)
- `max-w-3xl` بدلاً من العرض الكامل

### توصية الاسترجاع (للمراجعة — لا تنفيذ)

```
خيار أ: إعادة دمج البحث داخل Hero مع قائمة نطاق:
  أضف <select name="scope"> بخيارات: الكل / متاجر / منتجات
  انقل <section> البحث (501-529) داخل Hero بعد الـ headline

خيار ب: قبول الوضع الحالي كقرار تصميمي — تحديث baseline PNG
  (يتطلب موافقة المالك صراحةً)
```

---

## Drifts سابقة مستمرة (من baseline-drift-2026-06-16.md — بلا تغيير في الحالة)

| المكوّن | العنصر | الحالة في الكود | الحالة | المرجع |
|---------|--------|-----------------|--------|--------|
| ProductTile (marketplace) | شارة «ممول» (`is_sponsored`) | `is_featured` فقط — شارة «مميز» | مقبول بقرار 2026-06-07 | — |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | spec ينتظر Cursor | `product-tile-wishlist-2026-06-11.md` |
| ProductTile (marketplace) | زر سلة دائري | `rounded-xl` (سطر 237) | spec ينتظر Cursor | `product-tile-cart-button-2026-06-14.md` |
| StoreCard | شعار دائري (`rounded-full`) | `rounded-xl` (سطر 35) | مستمر | — |
| Hero (marketplace) | صف أيقونات مزايا المنصة | **غائب** | مقبول بقرار 2026-06-07 | — |
| Marketplace footer | StatsBar (15,000 / +1M / 99.6%) | **غائب** | مقبول بقرار 2026-06-07 | — |
| Store (mobile) | Sticky Cart Bar | **غائب** | spec ينتظر Cursor | `sticky-mini-cart-bar-2026-06-15.md` |
| StoreInfoCard | وسوم ثقة (موثوق/توصيل) | **غائب** | spec ينتظر Cursor | `store-info-trust-badges-2026-06-08.md` |

---

## ملاحظة إيجابية — تنفيذ توصية W29

زر «افتح متجرك» في هيدر الصفحة الرئيسية (الذي كان spec مقترح في W29) **نُفِّذ** ضمن PR #271:

```tsx
// components/home/HomeHeaderActions.tsx سطر 138–143
<Link href="/auth/signup"
  className="hidden ... md:inline-flex">
  <Store ... />
  افتح متجرك
</Link>
```

هذا يعني أن `docs/specs/home-header-seller-cta-2026-06-16.md` — إن وُجد — تحقّق فعلياً. ✓

---

## الخطوة التالية

1. **المالك مطلوب:** قرار بين خيارين:
   - **أ)** استعادة Hero الداكن مع الـ assets الثلاثية الأبعاد ← تسليم spec لـ Cursor
   - **ب)** اعتماد التصميم الجديد رسمياً ← تحديث `docs/design/baseline/*.png` و `components-inventory.md`

2. **exa متاحة الآن** (W33 أول جولة بعد 7 جولات توقف) — Phase 2 (استخبارات منافسين) ستُنفَّذ في الجولة القادمة بعد حسم قرار الـ drift.

3. Specs المعلّقة (ProductTile wishlist، cart button، StoreInfoCard trust badges، Sticky cart bar) لا تزال مجمّدة بانتظار Cursor.

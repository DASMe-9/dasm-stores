# تقرير انحراف بصري — baseline-drift-2026-08-06

**تاريخ التشغيل:** 2026-08-06 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md`
**فترة الرصد:** 2026-06-17 → 2026-08-06 (7 أسابيع)

---

## ملخص تنفيذي

**وُجد 4 انحرافات بصرية جديدة.** أبرزها إعادة هيكلة Hero الصفحة الرئيسية للسوق: شريط البحث خرج من داخل قسم Hero إلى section مستقل، وأُضيف مكوّن CommercePassport في العمود الأيسر. كذلك أُضيفت شارة خصم على بطاقة المنتج في صفحات المتجر الفرعي، وأُضيف وضع compact لـ StoreHeader في المتاجر ذات visual builder.

**قرار المرحلة: drift مانع → المرحلتان 2 و3 معلّقتان حتى مراجعة محمد الزهراني.**

---

## الكوميتات الجديدة ذات التأثير البصري منذ 2026-06-16

| الكوميت | التاريخ | الوصف | الملفات المؤثرة |
|---------|---------|-------|-----------------|
| `09dcbe4` | 2026-06-21 | fix(storefront): drop duplicate chrome hero for builder stores | `components/store/StoreHeader.tsx` |
| `8b42fda` | 2026-06-27 | refactor storefront components to tokens | `components/product/ProductCard.tsx` + أخرى |
| `013f987` | 2026-07-30 | [codex] elevate DASM Stores marketplace homepage | `app/page.tsx` + `components/home/HomeHeaderActions.tsx` |
| `2a9372c` | 2026-07-30 | [codex] fix homepage light and dark theme coverage | `app/page.tsx` |

---

## الانحرافات الجديدة (مُرتّبة بالأولوية)

---

### ① Hero (marketplace) — شريط البحث انتقل خارج قسم Hero ⚠️ الأعلى أولوية

**الملف:** `app/page.tsx`
**السطر الحالي للبحث:** 501–529
**قسم Hero:** lines 452–499 (`data-testid="platform-hero"`)

**وصف بصري دقيق:**
الـ baseline يُظهر شريط البحث داخل قسم Hero البصري (الخلفية التركوازية `bg-[#eaf2f1]`). في الكود الحالي، قسم Hero ينتهي عند السطر 499 دون أي شريط بحث بداخله. الشريط انتقل إلى `<section>` مستقل يليه مباشرة (lines 501–529) بخلفية `bg-[#f4f0e8]` (بيج/ذهبي خفيف).

المتسوق يرى الآن تسلسلاً مختلفاً عن الـ baseline:
- **baseline:** Hero (تركوازي، يتضمن بحثاً داخله)
- **حالياً:** Hero (تركوازي، بلا بحث) → Section بحث مستقل (بيج)

**متى تغيّر:** 2026-07-30 — commit `013f987`

**توصية الاسترجاع:**
نقل كتلة `<section>` البحث (lines 501–529) لتكون داخل `<section data-testid="platform-hero">` قبل السطر 499. ستظهر البيج الـ `bg-[#f4f0e8]` داخل الـ hero أو يمكن إزالتها لتندمج في الخلفية التركوازية. **بديل:** تحديث الـ baseline (يحتاج موافقة محمد الزهراني + PR منفصل بعنوان `baseline-update`).

---

### ② Hero (marketplace) — مكوّن CommercePassport جديد في العمود الأيسر

**الملف:** `app/page.tsx`
**مكوّن `CommercePassport`:** lines 275–332
**الاستخدام في Hero:** line 497

**وصف بصري دقيق:**
الـ hero الحالي يعرض شبكة عمودين `lg:grid-cols-[1.05fr_.95fr]`. العمود الثاني (أيسر في RTL) يعرض بطاقة "DASM COMMERCE PASSPORT" بتصميم مميز:
- خلفية بيضاء مع gradient تركوازي/ذهبي
- نص `DASM COMMERCE PASSPORT` بالمونو font وأسفله عنوان "مسار متجر قابل للنمو"
- خطوات 01–05: هوية المتجر، الكتالوج، إعداد الدفع، الشحن، الوصول للعميل
- عداد المتاجر الحي في الأسفل

الـ baseline لا يُظهر أي محتوى في هذا العمود — كان العرض يختلف أو أن الـ hero كان single-column.

**متى تغيّر:** 2026-07-30 — commit `013f987`

**توصية الاسترجاع:**
هذا إضافة مقصودة لتحسين تجربة البائع المحتمل وليس تراجعاً. **التوصية:** إقرار التصميم وتحديث `docs/design/baseline/marketplace-home.png` بلقطة جديدة تشمل العمودين (يحتاج موافقة محمد الزهراني). إن لم يُقرّ، إزالة `<CommercePassport storeCount={paginator.total} />` من line 497.

---

### ③ ProductCard (store pages) — شارة «خصم X%» جديدة في الزاوية العلوية اليسرى

**الملف:** `components/product/ProductCard.tsx`
**السطور:** 37–42

**وصف بصري دقيق:**
أُضيفت شارة `خصم X%` في الزاوية العلوية اليسرى من صورة المنتج عند وجود `compare_at_price > price`. الـ baseline (`subdomain-store.png`) يُظهر ProductCard بشارة "مميز" فقط (إن كان المنتج مميزاً). الكود الحالي يُظهر:
- يمين علوي: شارة "مميز" (موجودة في الـ baseline)
- يسار علوي: شارة "خصم X%" (جديدة، لم تكن في الـ baseline)

```tsx
// المضاف (lines 37-42)
{discountPct ? (
  <span className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)]
    bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))]
    px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-sale)]">
    خصم {discountPct}%
  </span>
) : null}
```

**متى تغيّر:** 2026-06-27 — commit `8b42fda`

**توصية الاسترجاع:**
الشارة بصرياً مرغوبة وتحاكي Salla/Zid. **التوصية:** إقرار هذا التحسين وتحديث الـ baseline. إن رُفض، احذف lines 37–42 من `components/product/ProductCard.tsx`.

---

### ④ StoreHeader (builder stores) — وضع Compact بدلاً من Hero الكامل

**الملف:** `components/store/StoreHeader.tsx`
**السطور:** 95–127 (compact mode branch)

**وصف بصري دقيق:**
المتاجر التي تحتوي `hasBuilderLayout(data.store.theme_config)` تعرض الآن strip نصي بسيط بعد الهيدر اللاصق (وصف + موقع + هاتف + أزرار مشاركة/WhatsApp/متابعة) بدلاً من الـ hero البصري الكامل (banner متحرك بارتفاع h-36/md:h-52 + البطاقة العائمة `-mt-8/-mt-10`). الـ baseline يُظهر دائماً الـ hero الكامل. **المتاجر العادية (غير builder) لم تتأثر — تعرض الـ hero الكامل كما في الـ baseline.**

**متى تغيّر:** 2026-06-21 — commit `09dcbe4`

**توصية الاسترجاع:**
تغيير مقصود لتجنب تضارب بصري بين builder hero والـ chrome. **التوصية:** مقبول — يُضاف توضيح في `docs/design/baseline/README.md` بأن builder stores تعرض compact mode ولا تندرج تحت baseline `subdomain-store.png`. لا تراجع مطلوب.

---

## ملاحظة: HomeHeaderActions — زر «افتح متجرك» مُنفَّذ

الـ spec `docs/specs/home-header-seller-cta-2026-06-16.md` يبدو منفّذاً في commit `013f987`:

```tsx
// components/home/HomeHeaderActions.tsx lines 138-144
<Link href="/auth/signup" className="... bg-[#0e7c66] ...">
  <Store className="h-4 w-4" />
  افتح متجرك
</Link>
```

الزر يظهر للضيوف فقط (authState === "guest"). يُوصى بمراجعة الـ spec والتأكد من تطابق التنفيذ مع جميع معايير القبول قبل أرشفته.

---

## حالة الفجوات البصرية المستمرة (لا تغيير)

| المكوّن | العنصر | الحالة | القرار |
|---------|--------|--------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | spec معلق `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | spec معلق `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | spec معلق `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | **غائب** | spec معلق `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | spec معلق `sticky-mini-cart-bar-2026-06-15.md` |

---

## الخطوات المطلوبة قبل الجولة القادمة

1. **مراجعة** الانحرافات ①–④ مع محمد الزهراني وتحديد:
   - ① هل البحث المنفصل خارج Hero قرار تصميمي دائم؟
   - ② هل CommercePassport widget مُقرّ للـ baseline الجديد؟
   - ③ هل شارة الخصم مُقرّة؟
   - ④ تأكيد أن compact mode لـ builder stores لا تندرج تحت baseline
2. **تحديث الـ baseline** (لكل انحراف مُقرّ) عبر PR منفصل بعنوان `baseline-update`
3. **الجولة القادمة** (2026-08-13): ستتضمن المرحلتين 2 و3 إذا أُغلقت هذه الانحرافات

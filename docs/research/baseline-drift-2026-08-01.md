# تقرير انحراف بصري — baseline-drift-2026-08-01

**تاريخ التشغيل:** 2026-08-01 (جولة أسبوعية — الأحد، W31)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)
**الفجوة الزمنية:** 6.5 أسابيع (آخر جولة 2026-06-16)

---

## ملخص تنفيذي

**⛔ تم رصد drift حرج — المرحلة 2 متوقفة وفق قواعد الحارس.**

commit واحد — `013f987` (elevate DASM Stores marketplace homepage، الخميس 2026-07-30) — أعاد
هيكلة صفحة الـ marketplace الرئيسية بشكل جوهري، مما أنتج انحرافَين بصريَّين مؤكَّدَين عن الـ baseline الرسمي.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملفات |
|---------|---------|-------|---------|
| `013f987` | 2026-07-30 | elevate DASM Stores marketplace homepage | `app/page.tsx`، `components/home/HomeHeaderActions.tsx`، `e2e/marketplace-home.spec.ts`، `lib/seo.ts` |
| `2a9372c` | 2026-07-31 | fix homepage light and dark theme coverage | `app/page.tsx` |
| `fd402fd` | 2026-07 | fix: harden storefront conversion tracking | `app/[slug]/layout.tsx` |
| `8b42fda` | 2026-07 | refactor storefront components to tokens | `components/product/ProductCard.tsx` |
| `b95d2b6` | 2026-07 | add storefront theme tokens | `app/[slug]/layout.tsx` |

---

## الانحراف الأول — Hero (marketplace): بنية كاملة مختلفة عن الـ baseline

### وصف بصري دقيق للتغيير

| العنصر | الـ baseline (marketplace-home.png) | الكود الحالي (بعد `013f987`) |
|--------|-------------------------------------|-------------------------------|
| خلفية Hero | داكن (`#021b1f` / تركوازي عميق) | فاتح (`#eaf2f1`) light mode / داكن (`#081c2c`) dark mode |
| تخطيط Hero | محوري متمركز (عرض كامل) | عمودان: نص يسار + بطاقة يمين |
| العنوان الرئيسي h1 | "اكتشف متاجر ومنتجات داسم" (موجّه للمتسوق) | "من متجر سعودي مستقل، إلى سوق أكبر." (موجّه للبائع) |
| العنوان الفرعي | "كل المتاجر والمنتجات في واجهة واحدة" | "تجمع متاجر داسم هوية المتجر والكتالوج..." |
| HeroScene | عناصر ثلاثية الأبعاد متحركة (ShoppingBag، Headphones، FlaskConical، ShoppingCart، sparks) | **غائب تماماً** |
| شريط البحث | **داخل الـ Hero** (rounded-full، `position: absolute bottom`) | **خارج الـ Hero** في قسم `#f4f0e8` منفصل |
| البطاقة الجانبية | **غير موجودة** | `CommercePassport` (جواز نمو المتجر — خطوات 5) |
| AdSlot في Hero | `StoreAdSlot variant="hero"` | **غائب** |

### التقييم

هذا انحراف **هيكلي كامل** وليس تعديلاً تفصيلياً. الـ hero السابق (المحذوف بـ `013f987`) كان يطابق
`marketplace-home.png` في التوجه المرئي (تسوق، بحث، اكتشاف). الـ hero الحالي يروّج لاستقطاب
البائعين، مما يعكس أولوية مختلفة.

### متى تغيّر (git log)

```
commit 013f987ad4749826123207f27c1897dbc351888c
Author: mazroni9 <zahrma0p@yahoo.com>
Date:   Thu Jul 30 19:28:07 2026 +0300
```

**الملف:** `app/page.tsx`، السطور 451–530 (Hero section)

### توصية الاسترجاع (كتوصية فقط — لا تنفيذ)

**خيار أ — استرجاع البنية السابقة:**
أعِد إدراج `HeroScene` component + Hero الداكن (`bg-[#021b1f]`) مع البحث المضمَّن.
السطور المحذوفة في commit `013f987` (قسم `-` في diff) هي المرجع المباشر.

**خيار ب — تحديث الـ baseline:**
إن كان التوجه الجديد (merchant-acquisition focus) مقصوداً، يستلزم الأمر PR منفصل بعنوان
`baseline-update` وموافقة صريحة من محمد الزهراني قبل اعتبار هذا الـ hero مرجعاً رسمياً جديداً.

---

## الانحراف الثاني — ProductTile (marketplace): زر تصرف → رابط تنقل

### وصف بصري دقيق للتغيير

| العنصر | الـ baseline | التقرير السابق 2026-06-16 | الكود الحالي |
|--------|-------------|--------------------------|-------------|
| زر أسفل يمين بطاقة المنتج | زر سلة دائري (rounded-full) | زر cart action بـ `rounded-xl` | رابط `<Link>` بأيقونة `ArrowLeft` — ينتقل لصفحة المنتج |

**الانحراف مُركَّب:** الـ baseline يتوقع cart button. 2026-06-16 رصد تراجعاً جزئياً (rounded-xl بدل
rounded-full). الآن تراجع كامل — لا cart action على الإطلاق.

### الموقع الدقيق في الكود الحالي

**الملف:** `app/page.tsx`، السطر 235–241

```tsx
// الحالة الراهنة (انحراف)
<Link
  href={productHref}
  className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ..."
  aria-label={`عرض ${product.name}`}
>
  <ArrowLeft className="h-4 w-4" />
</Link>
```

### توصية الاسترجاع (كتوصية فقط — لا تنفيذ)

```tsx
// مطابقة الـ baseline (rounded-full + cart icon)
<button
  type="button"
  className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500 text-white
             transition hover:bg-emerald-600 dark:bg-emerald-500/80"
  aria-label={`أضف ${product.name} للسلة`}
  // onClick: ربط بـ cart state (atoms/store)
>
  <ShoppingCart className="h-4 w-4" />
</button>
```

السطر المعني: `app/page.tsx` السطر 235 (يصبح `<button>` بدل `<Link>`)

---

## حالة الفجوات البصرية المستمرة (من التقارير السابقة)

جدول محدَّث — لا تغيير في الحالة المسجّلة سابقاً لهذه العناصر:

| المكوّن | العنصر | الحالة | المرجع |
|---------|--------|--------|--------|
| ProductTile (marketplace) | شارة «ممول» | غائب (مقبول بقرار 2026-06-07) | — |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | غائب | `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | غائب | `store-info-trust-badges-2026-06-08.md` |
| Store (mobile) | Sticky Cart Bar | غائب | `sticky-mini-cart-bar-2026-06-15.md` |

---

## قرار المرحلة

**⛔ لا تكملة للمرحلتين 2 و3.** الانحراف الأول حرج (تغيير بنية Hero كاملاً) ويستوجب قرار بشري قبل
المتابعة. يُشار إلى ذلك للمراجعة.

**الإجراء المطلوب من الفريق:**
1. تحديد ما إذا كان hero الـ marketplace الجديد (merchant-acquisition) مقصوداً.
2. إن مقصود → فتح PR `baseline-update` + موافقة محمد الزهراني.
3. إن غير مقصود → استرجاع `HeroScene` + hero الداكن + البحث المضمَّن في hero.
4. معالجة ProductTile cart-button regression بصرف النظر عن قرار Hero.

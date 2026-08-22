# تقرير انحراف بصري — baseline-drift-2026-08-14

**تاريخ التشغيل:** 2026-08-14 (جولة أسبوعية — الجمعة)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

⚠️ **drift جديد وجوهري.** كوميت `013f987` بتاريخ 2026-07-30 أعاد هيكلة صفحة الـ marketplace الرئيسية بالكامل وأحدث ثلاثة انحرافات بصرية جديدة عن الـ baseline الرسمي.

**قرار المرحلة: لا تتجاوز المرحلة 2 — تولد Spec محظور هذه الجولة.**

---

## الكوميتات المنتجة للـ drift منذ 2026-06-16

| الكوميت | التاريخ | الوصف | الملفات |
|---------|---------|-------|---------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` |
| `2a4698d` | 2026-06-17 | feat(storefront): visual builder hybrid path | `app/[slug]/page.tsx` |
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx` |
| `013f987` | 2026-07-30 | **[codex] elevate DASM Stores marketplace homepage** | `app/page.tsx` + `components/home/HomeHeaderActions.tsx` |
| `2a9372c` | بعد `013f987` | [codex] fix homepage light and dark theme coverage | `app/page.tsx` |

---

## الانحرافات الجديدة (3 انحرافات)

### Drift #1 — إعادة هيكلة Hero إلى تخطيط عمودين
**الشدة:** عالية — تغيير هيكلي جذري

| البُعد | الـ baseline | الكود الحالي |
|--------|-------------|-------------|
| التخطيط | عمود واحد مركزي | شبكة `grid-cols-[1.05fr_.95fr]` عمودين |
| العنوان الرئيسي | "اكتشف متاجر ومنتجات داسم" | "من متجر سعودي مستقل، إلى سوق أكبر" |
| العمود الأيمن | غائب في baseline | مكوّن `CommercePassport` جديد (passport card + خطوات نمو) |

**الموقع في الكود:** `app/page.tsx` السطر 456–498  
**مُدخَل بكوميت:** `013f987` (2026-07-30)

**توصية الاسترجاع (للمراجعة فقط — لا تنفّذ):**
```
السطر 456: className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]"
→ يصبح: className="relative mx-auto flex max-w-4xl flex-col items-center text-center"
```
ويُزال مكوّن `<CommercePassport .../>` من السطر 497، أو يُنقل لقسم "لأصحاب المتاجر".

---

### Drift #2 — نقل شريط البحث خارج الـ Hero
**الشدة:** متوسطة — تأثير على تدفق الاكتشاف

| البُعد | الـ baseline | الكود الحالي |
|--------|-------------|-------------|
| موقع البحث | ضمن قسم الـ hero أو مباشرةً تحته بخلفية Hero | قسم مستقل (`bg-[#f4f0e8]`) مفصول بفاصل `border-b` |
| بعد البحث عن الـ Hero | متلاصق بصرياً | فجوة بصرية واضحة — hero → فاصل → بحث |

**الموقع في الكود:** `app/page.tsx` السطر 501–529  
**مُدخَل بكوميت:** `013f987` (2026-07-30)

**توصية الاسترجاع:**
```
نقل قسم <form action="/"> من السطر 501 إلى داخل قسم الـ hero (بعد السطر 494 <div className="mt-8 ...">)
وإزالة قسم section المنفصل مع bg-[#f4f0e8]
```

---

### Drift #3 — ProductCard (storefront): تحوّل إلى CSS Tokens
**الشدة:** منخفضة — لا تغيير بصري جوهري للمتسوق

| البُعد | الـ baseline | الكود الحالي |
|--------|-------------|-------------|
| ألوان البطاقة | هاردكود بـ emerald/slate | متغيرات CSS `var(--c-surface-2)` إلخ |
| شارة "مميز" | غائبة في baseline (drift سابق مقبول) | حاضرة كـ "مميز" — لا تغيير |
| زر السلة | غائب (drift قائم، spec معلق) | غائب — لا تغيير |
| زر القلب | غائب (drift قائم، spec معلق) | غائب — لا تغيير |

**الموقع في الكود:** `components/product/ProductCard.tsx`  
**مُدخَل بكوميت:** `8b42fda` (2026-06-27)

**الحكم:** لا drift إضافي بالنسبة للـ baseline — يُسجَّل للتوثيق فقط. المكوّن الآن theme-aware وهذا تحسين هندسي.

---

## ملاحظة: تطبيق Spec سابق

كوميت `013f987` يُدرج زر "افتح متجرك" في `HomeHeaderActions.tsx` للضيوف — وهو ما كان مقترحاً في `docs/specs/home-header-seller-cta-2026-06-16.md`. يُعدّ هذا تطبيقاً ناجحاً للـ spec المعلّق.

---

## حالة الفجوات البصرية الكاملة (محدَّثة)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | تخطيط عمود واحد مركزي | **drift جديد** — عمودين + CommercePassport | محل هذا التقرير — ينتظر قرار المنتج |
| Hero (marketplace) | العنوان "اكتشف متاجر ومنتجات داسم" | **drift جديد** — عنوان مختلف | محل هذا التقرير |
| شريط البحث | ضمن/أسفل Hero | **drift جديد** — قسم مستقل | محل هذا التقرير |
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` + ArrowLeft | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| HomeHeaderActions | زر "افتح متجرك" للضيوف | **مُطبَّق** ✅ | تنفيذ `home-header-seller-cta-2026-06-16.md` |

---

## الإجراء المطلوب

1. **قرار من المنتج** حول Drifts #1 و#2: هل إعادة الهيكلة مقصودة (تحديث للـ baseline) أم خطأ يجب الاسترجاع منه؟
2. **تحديث الـ baseline** إذا تم اعتماد التصميم الجديد رسمياً
3. **لا تولد Spec** هذه الجولة — الـ drift الهيكلي يجب حسمه أولاً قبل إضافة مكوّنات جديدة

---

_أُنشئ تلقائياً بواسطة Design Guardian · الجولة الأسبوعية 2026-08-14_

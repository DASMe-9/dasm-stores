# تقرير انحراف بصري — baseline-drift-2026-08-17

**تاريخ التشغيل:** 2026-08-17 (جولة أسبوعية — الأحد W34)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**لا يوجد drift جديد يمنع المرحلة 2.**

الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16) غيّرت شكل الصفحة الرئيسية بشكل ملحوظ لكن بطريقة تحسين وإضافة — لا تراجع عن عناصر baseline محددة سبق قبولها.

**ملاحظة إيجابية:** spec الـ `home-header-seller-cta-2026-06-16.md` طُبِّق فعلياً — يظهر الآن في `HomeHeaderActions.tsx` زر "افتح متجرك" للضيوف.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16 → 2026-08-17)

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `5f7bf39` | 2026-06-17 | fix: remove duplicate advertise banner | `app/page.tsx` | إزالة بانر إعلاني مكرر — تحسين لا تراجع |
| `2a4698d` | غير محدد | feat: visual builder hybrid storefront | `app/[slug]/page.tsx` | مسار بديل لمتاجر builder — غير مؤثر على الـ fallback layout |
| `8b42fda` | غير محدد | refactor: storefront components to tokens | متاجر فرعية | تحويل CSS hardcoded → design tokens، لا تغيير بصري |
| `013f987` | 2026-07-30 | elevate marketplace homepage | `app/page.tsx` + `HomeHeaderActions.tsx` | تغيير هيكل Hero + إضافة "افتح متجرك" |
| `2a9372c` | 2026-07-30 | fix homepage light/dark theme coverage | `app/page.tsx` | إصلاح تعريفات اللون في الثيمين — لا تراجع بصري |

---

## تحليل التغيّر في Hero (marketplace) — كوميت 013f987

**السابق (قبل Jul 30):** Hero بعمود واحد — نص + أزرار CTA فقط.

**الحالي:** Hero بشبكة عمودين `lg:grid-cols-[1.05fr_.95fr]`:
- يسار: نص + عنوان + وصف + أزرار CTA + رابط الشراكة
- يمين: مكوّن `CommercePassport` — بطاقة تُظهر خطوات إنشاء المتجر وعدد المتاجر الحية

**هل هو drift بصري من baseline؟**
الـ baseline يُظهر Hero تركوازي بصور منتجات ثلاثية الأبعاد. الكود لا يطابقه منذ تجميد 2026-06-07. `CommercePassport` هو مكوّن جديد في الجانب الأيمن بدل الصور الثلاثية — تطور تصميمي إضافي، لا تراجع عن عناصر محددة في baseline.

**قرار:** لا drift جديد مانع. التطور ضمن نطاق القرارات المقبولة سابقاً.

---

## تحليل HomeHeaderActions — تطبيق spec سابق ✅

| العنصر | الحالة السابقة | الحالة الحالية |
|--------|----------------|----------------|
| زر "افتح متجرك" (spec `home-header-seller-cta`) | غائب | **موجود** ✅ — `bg-[#0e7c66]` + أيقونة Store |
| زر "تسجيل الدخول" | موجود منذ البداية | موجود ✅ |

**الخلاصة:** spec W29 طُبِّق. يُغلق من قائمة المعلقة.

---

## ملاحظة: تغيّر دلالي في زر ProductTile

الـ spec `product-tile-cart-button-2026-06-14.md` وثّق أن زر السلة كان `rounded-xl` بدل `rounded-full`.
الكود الحالي (بعد elevation): الزر أصبح `rounded-xl` يحمل `ArrowLeft` ويؤدي إلى صفحة المنتج — لم يعد زر "إضافة للسلة" بل زر "عرض المنتج".

**التأثير على الـ spec:** الفجوة البصرية لا تزال قائمة (الـ baseline يُظهر زر سلة دائري). الـ spec لا يزال سارياً لكنه يحتاج تعديل النطاق: المطلوب إضافة زر سلة دائري، لا تغيير شكل الزر الحالي فقط.

---

## حالة الفجوات البصرية المستمرة (محدَّثة W34)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري | غائب — الزر الحالي تنقل بـ ArrowLeft | spec `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor (نطاق محدَّث: إضافة زر سلة) |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | spec `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | spec `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | spec `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | spec `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| HomeHeaderActions (guest) | "افتح متجرك" CTA | **✅ مطبَّق** | spec `home-header-seller-cta-2026-06-16.md` — منجز |

---

## الخطوة التالية

لا تصحيح مطلوب. تكتمل المرحلتان 2 و3 وفق الجدول.

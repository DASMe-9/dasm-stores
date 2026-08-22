# تقرير انحراف بصري — baseline-drift-2026-07-31

**تاريخ التشغيل:** 2026-07-31 (جولة أسبوعية — الخميس)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md`

---

## ملخص تنفيذي

**⚠️ انحراف جديد حرج — توقف مانع.**  
كوميت `013f987` بتاريخ 2026-07-30 أعاد هيكلة قسم الـ Hero في الصفحة الرئيسية بشكل جذري:
خلفية مختلفة، تخطيط مختلف، عنوان مختلف، البحث خرج من Hero، وبطاقة Commerce Passport أُضيفت.

**قرار المرحلة:** drift مانع موجود → لا تكتمل المرحلتان 2 و3 هذه الجولة.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملفات | التأثير البصري |
|---------|---------|-------|---------|----------------|
| `2a4698d` | 2026-06-17 | feat(storefront): visual builder hybrid | `app/[slug]/page.tsx` | storefront فقط — خارج baseline |
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate ad banner | `app/page.tsx` | إزالة نسخة مكررة من banner — لا drift |
| `56ee40c` | 2026-06-25 | fix(storefront): drop cart-emptied banner | `components/store/` | UX صفحة المتجر — خارج baseline |
| `8b42fda` | 2026-06-27 | refactor storefront components to tokens | `components/product/ProductCard.tsx` + آخرى | CSS variables فقط — لا تغيير بصري |
| `013f987` | **2026-07-30** | **[codex] elevate DASM Stores marketplace homepage** | `app/page.tsx` · `components/home/HomeHeaderActions.tsx` | **⚠️ DRIFT حرج — Hero** |
| `2a9372c` | 2026-07-30 | [codex] fix homepage light and dark theme coverage | `app/page.tsx` | تعديل ألوان dark/light — امتداد للـ drift |

---

## ⚠️ DRIFT جديد — قسم Hero (الصفحة الرئيسية)

### المكوّن المنحرف

| الحقل | القيمة |
|-------|--------|
| الملف | `app/page.tsx` |
| الأسطر | 452–499 (hero section) · 501–529 (search نُقل لخارج hero) |
| الكوميت | `013f987` — 2026-07-30 |

### وصف بصري دقيق للتغيير

| العنصر | الـ Baseline (`marketplace-home.png`) | الحالة الراهنة في الكود |
|--------|---------------------------------------|--------------------------|
| خلفية Hero (light mode) | داكنة — navy/dark teal (#081c2c أو ما يقاربها) | `bg-[#eaf2f1]` — رمادي-أخضر فاتح (السطر 453) |
| خلفية Hero (dark mode) | نفس الداكن | `dark:bg-[#081c2c]` — صحيح في dark فقط |
| تخطيط Hero | عمود واحد مركزي | شبكة عمودين `lg:grid-cols-[1.05fr_.95fr]` (السطر 456) |
| عنوان H1 | "اكتشف متاجر ومنتجات داسم" | "من متجر سعودي مستقل، إلى سوق أكبر." (السطر 462) |
| عبارة الـ Subtitle | "كل المتاجر والمنتجات في واجهة واحدة" | نص pitch تجاري طويل (الأسطر 466–469) |
| شريط البحث | داخل Hero — مدمج في نفس القسم | خرج إلى قسم مستقل أسفل Hero (الأسطر 501–529) |
| العمود الأيمن | غائب | بطاقة `<CommercePassport>` — غير موجودة في baseline (السطر 497) |
| أيقونات فئات / chips داخل Hero | موجودة (أيقونات دائرية) | حُذفت من Hero |

### متى تغيّر (من git log — قراءة فقط)

```
git log --oneline -- app/page.tsx
2a9372c  2026-07-30  [codex] fix homepage light and dark theme coverage
013f987  2026-07-30  [codex] elevate DASM Stores marketplace homepage  ← المُحدِث الأساسي
```

كوميت `013f987` يحتوي `778 insertions, 87 deletions` في `app/page.tsx` وحده — إعادة كتابة شاملة.

### توصية الاسترجاع المحددة (للـ Cursor — توصية فقط، لا تُنفَّذ هنا)

**الخطوة 1 — استعادة خلفية Hero الداكنة** (`app/page.tsx` السطر 453):
```
السطر الحالي:
  className="relative overflow-hidden bg-[#eaf2f1] px-4 py-14 text-[#081c2c] ... dark:bg-[#081c2c] dark:text-white"

التعديل المقترح:
  className="relative overflow-hidden bg-[#081c2c] px-4 py-14 text-white ..."
  (إزالة الفصل light/dark — baseline كانت بخلفية داكنة موحدة)
```

**الخطوة 2 — استعادة التخطيط المركزي** (`app/page.tsx` السطر 456):
```
السطر الحالي:
  className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]"

التعديل المقترح:
  className="relative mx-auto max-w-4xl text-center"
```

**الخطوة 3 — استعادة عنوان H1** (`app/page.tsx` السطر 462):
```
القيمة الحالية:  "من متجر سعودي مستقل، إلى سوق أكبر."
القيمة المقترحة: "اكتشف متاجر ومنتجات داسم"
```

**الخطوة 4 — استعادة Subtitle** (`app/page.tsx` الأسطر 466–469):
```
القيمة الحالية:  "تجمع متاجر داسم هوية المتجر والكتالوج وإعدادات الدفع..."
القيمة المقترحة: "كل المتاجر والمنتجات في واجهة واحدة"
```

**الخطوة 5 — إعادة شريط البحث داخل Hero:**
نقل الـ `<form>` من الأسطر 501–529 إلى داخل قسم `section[data-testid="platform-hero"]`.

**الخطوة 6 — حذف بطاقة Commerce Passport من Hero** (`app/page.tsx` السطر 497):
```
السطر الحالي:  <CommercePassport storeCount={paginator.total} />
التعديل:       حذف هذا السطر (أو نقل البطاقة إلى قسم #for-merchants إن أُريد الاحتفاظ بها)
```

> ملاحظة: مكوّن `CommercePassport` ومحتوى "لأصحاب المتاجر" يمكن الإبقاء عليهما في القسم الموجود
> `section#for-merchants` (الأسطر 531–579) — فقط ينتزع من Hero.

---

## ✅ حل سابق — HomeHeaderActions CTA (مُغلق)

كان زر "افتح متجرك" موثّقاً كـ delta جديد في تقرير W29 (2026-06-16).  
يؤكد الكود الحالي تطبيقه ضمن نفس كوميت `013f987`:

```tsx
// components/home/HomeHeaderActions.tsx — السطر 139–143
<Link
  href="/auth/signup"
  className="hidden items-center gap-2 rounded-2xl bg-[#0e7c66] px-4 py-3 text-sm font-bold text-white ... md:inline-flex"
>
  <Store className="h-4 w-4" />
  افتح متجرك
</Link>
```

الزر يظهر للضيوف فقط، بلون `bg-[#0e7c66]` (أخضر داسم)، مخفي على الموبايل (`md:inline-flex`).  
**الحالة:** مُغلق — delta W29 مُنفَّذ.

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث من التقرير السابق — لا تغيير في الحالة (كل ما يلي لا يزال ينتظر Cursor):

| المكوّن | العنصر | الحالة في الكود | المرجع |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | غائب | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | غائب | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` — السطر 237 | ينتظر Cursor — `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | غائب من `app/page.tsx` | ينتظر Cursor — `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | غائب من `ProductCard.tsx` | ينتظر Cursor — `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | غائب | ينتظر Cursor — `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | غائب | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | غائب | ينتظر Cursor — `sticky-mini-cart-bar-2026-06-15.md` |

---

## الخطوة التالية المطلوبة من المالك

⛔ **قرار مطلوب قبل الجولة القادمة:**

**الخيار A — استرجاع للـ baseline:**  
تطبيق توصيات الاسترجاع (الخطوات 1–6 أعلاه) عبر Cursor وإغلاق الـ drift.

**الخيار B — اعتماد التصميم الجديد baseline معدَّل:**  
التقاط screenshot جديد للـ Hero الحالي وتحديث `docs/design/baseline/marketplace-home.png`
قبل الجولة القادمة حتى يتوقف الـ guardian عن الإبلاغ عن هذا الـ drift.

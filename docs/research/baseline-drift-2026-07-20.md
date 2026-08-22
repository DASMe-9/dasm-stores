# تقرير انحراف بصري — baseline-drift-2026-07-20

**تاريخ التشغيل:** 2026-07-20 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**تم رصد drift جديد في مكوّنين.** الفجوة الزمنية منذ آخر تقرير تمتد 34 يوماً (2026-06-16 → 2026-07-20)، وتضمّ 9 كوميتات جديدة. أبرز تغيّر بصري مؤكّد: شبكة المنتجات في صفحات المتاجر الفرعية انخفضت من 6 أعمدة إلى 4 على الـ desktop، وهو تغيّر مباشر يخالف الـ baseline المُعتمَد.

**قرار المرحلة:** وجود drift مؤكَّد → توقّف عند مرحلة 1 لتوثيق الانحراف؛ استمرار المراحل 2 و3 وفق الروتين.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `2a4698d` | 2026-06-17 | feat: storefront builder hybrid rendering | `app/[slug]/page.tsx` | لا تأثير — غير المتاجر الـ builder stores فقط |
| `5f7bf39` | 2026-06-17 | fix: remove duplicate advertise banner | `app/page.tsx` | تحسين — حذف banner مكرر، بانر واحد ظاهر |
| `8f7b63b` | 2026-06-21 | feat: Salla-style landing, less card-dominated | `components/product/ProductGrid.tsx` | **⚠️ DRIFT** — شبكة المنتجات 6→4 أعمدة |
| `09dcbe4` | ~2026-06-22 | fix: drop duplicate chrome hero for builder stores | `components/store/StoreChrome.tsx` | builder stores فقط |
| `e65d0a0` | ~2026-06-23 | fix: make products page discoverable in store nav | `app/[slug]/layout.tsx` | إضافة رابط — لا تعارض مع baseline |
| `60fd4bc` | 2026-06-25 | feat: standard legal footer + policy pages | `components/store/StoreFooter.tsx` | **⚠️ DRIFT (تحسين)** — توسيع الفوتر |
| `56ee40c` | ~2026-06-26 | fix: drop "cart emptied" store-switch banner | `components/cart/CartDrawer.tsx` | تحسين UX — لا تعارض |
| `b95d2b6` | 2026-06-27 | codex: add storefront theme tokens | `lib/themes/`, `styles/globals.css` | إعادة هيكلة CSS — لا تغيير بصري مقصود |
| `8b42fda` | 2026-06-27 | codex: refactor storefront components to tokens | 12 ملفاً في `components/` | إعادة هيكلة CSS — نتيجة بصرية تعادل السابق |

---

## الانحرافات الجديدة

### 1. شبكة المنتجات: 6 أعمدة → 4 أعمدة [⚠️ DRIFT مؤكَّد]

| البند | التفصيل |
|-------|---------|
| المكوّن | `components/product/ProductGrid.tsx` — السطر 20 |
| الكوميت | `8f7b63b` — 2026-06-21 |
| الحالة في الـ baseline | `lg:grid-cols-6` (2/3/4/6 متجاوبة) |
| الحالة الراهنة في الكود | `lg:grid-cols-4` (2/3/4 متجاوبة) |
| نص الـ baseline المُعتمَد | `docs/design/baseline/README.md` → "شبكة المنتجات: 6 بطاقات في الصف على الويب (متجاوبة 2/3/4/6)" |
| وصف التغيّر | كل شاشة desktop (lg+) تعرض الآن 4 بطاقات منتجات بدلاً من 6 — البطاقات أكبر حجماً، المحتوى أقل |
| التغيّر في الـ baseline | نعم — الـ baseline المُعتمَد في 2026-06-07 ينصّ صراحةً على 6 أعمدة |
| مبرّر المطوّر | "6-up → 4-up on desktop. Bigger, less cramped cards" (من رسالة الكوميت) |
| توصية الاسترجاع | السطر 20 في `ProductGrid.tsx` يصبح: `lg:grid-cols-6` (مع تعديل gap المناسب) |
| **قرار مطلوب** | هل هذا تحديث معتمَد للـ baseline؟ يتطلب موافقة محمد الزهراني عبر PR منفصل بعنوان `baseline-update` |

```diff
// components/product/ProductGrid.tsx : 20
- <div className="store-product-grid grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 sm:gap-[var(--space-4)] lg:grid-cols-4">
+ <div className="store-product-grid grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 sm:gap-[var(--space-4)] lg:grid-cols-6">
```

---

### 2. فوتر المتجر الفرعي: من سطر واحد إلى فوتر كامل [⚠️ DRIFT (تحسين مقصود)]

| البند | التفصيل |
|-------|---------|
| المكوّن | `components/store/StoreFooter.tsx` |
| الكوميت | `60fd4bc` — 2026-06-25 |
| الحالة في الـ baseline | نص واحد: "مدعوم بواسطة متاجر داسم" |
| الحالة الراهنة في الكود | فوتر 3 أعمدة: هوية المتجر + روابط قانونية (6 صفحات) + معلومات تواصل + وسائل دفع |
| وصف التغيّر | إضافة كبيرة في حجم الفوتر. المحتوى الجديد يشمل: من نحن، الشروط والأحكام، سياسة الخصوصية، الاستبدال والاسترجاع، الشحن والتوصيل، اتصل بنا + مدى · Visa · Mastercard · Apple Pay |
| التقييم | تحسين مقصود لمتطلبات KSA القانونية — ليس تراجعاً |
| التوصية | تحديث الـ baseline ليعكس الفوتر الجديد (يتطلب موافقة محمد الزهراني) |

---

## حالة الفجوات البصرية المستمرة (من التقارير السابقة)

| المكوّن | العنصر | الحالة | القرار |
|---------|--------|--------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري `rounded-full` | `rounded-xl` في الكود | spec `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب مفضلة | **غائب** | spec `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب مفضلة | **غائب** | spec `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة (الرياض/موثوق/توصيل) | **غائب** | spec `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | spec `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## الخطوة التالية

- **Drift جديد حرج:** شبكة المنتجات 6→4 — يتطلب قرار الفريق: استرجاع الكود أو تحديث الـ baseline.
- تكملة المراحل 2 و3 وفق الجدول (تقرير منافسين W30 + spec جديد).

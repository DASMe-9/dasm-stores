# تقرير انحراف بصري — baseline-drift-2026-07-15

**تاريخ التشغيل:** 2026-07-15 (جولة أسبوعية — الثلاثاء)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**تم رصد drift جديد.** انحراف واحد مؤكد منذ الجولة الأخيرة: إزالة مكوّن AdSlot من نوع "بانر واسع" من الصفحة الرئيسية للسوق. المرحلتان 2 و3 محجوبتان وفق قاعدة الانحراف المانع.

**قرار المرحلة:** يوجد انحراف مانع → توقّف بعد المرحلة 1.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `2a4698d` | 2026-06-17 | feat(storefront): phase 4c — visual builder hybrid | `app/[slug]/page.tsx` | stores using builder now render StorefrontBlocks — outside marketplace baseline |
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` | **حذف مكوّن AdSlot "واسع" — drift مؤكد** |
| `09dcbe4` | 2026-06-21 | fix(storefront): drop duplicate chrome hero for builder stores | `components/store/StoreHeader.tsx`, `app/[slug]/layout.tsx` | تغيير في subdomain store لـ builder stores فقط — outside baseline path |
| `8f7b63b` | 2026-06-21 | feat(storefront): Salla-style landing | `components/storefront/StorefrontBlocks.tsx`, `components/product/ProductGrid.tsx` | builder stores only — outside baseline path |
| `8b42fda` | 2026-06-27 | refactor storefront components to tokens | `components/product/ProductCard.tsx` + أخرى | refactor CSS tokens — لا تغيّر بصري في الناتج النهائي |
| `f13b4c1` | 2026-06-xx | fix(themes): drop fake testimonials & newsletter | `components/storefront/StorefrontBlocks.tsx` | builder stores only |
| Auth commits | 2026-06 → 07 | SSO / social login | `pages/auth/sso.tsx` + auth pages | تدفق تسجيل دخول — خارج نطاق baseline |

---

## الانحراف المؤكد — drift جديد

### AdSlot "بانر واسع" — مُزال من الصفحة الرئيسية

| الحقل | القيمة |
|-------|--------|
| **المكوّن المنحرف** | `AdSlot` — variant `wide` / "مساحة بانر واسعة" |
| **الملف** | `app/page.tsx` |
| **السطر (قبل الحذف)** | القسم أسفل `#stores` — كان يحتوي شريط عرض كامل العرض بتدرج تركواز |
| **الكوميت** | `5f7bf39` بتاريخ 2026-06-17 |
| **وصف بصري لما تغيّر** | الـ baseline يُوثّق نوعين من الإعلانات في السوق: (1) بطاقة داكنة عمودية في نهاية صف المنتجات، و(2) شريط بانر واسع بعرض كامل بأسلوب التركواز المضيء مع أيقونة هدف ونص "وصّل لآلاف العملاء" وزر "أعلن الآن". النوع (2) أُزيل كلياً من الصفحة. يتبقى فقط النوع (1) (كود inline مباشر في شرط `!q` داخل قسم المنتجات). |
| **الوصف البصري للحالة الحالية** | `app/page.tsx` سطر 179 — يعرض إعلاناً واحداً فقط: بطاقة داكنة `bg-[#031b1e]` بزر "أعلن الآن" و`Target` icon مخفي على الموبايل، تظهر عند `!q` فقط. لا وجود لشريط البانر الواسع أسفل قسم المتاجر المميزة. |
| **توصية الاسترجاع** | أعد إدراج `<StoreAdSlot slotKey="store.home.wide" variant="wide" />` أو كتلة HTML مكافئة في `app/page.tsx` بعد إغلاق `</section>` الخاصة بـ `#stores` (قبل قسم الأقسام `#categories`). الموضع البصري: أسفل سلسلة المتاجر المميزة وعلى امتداد عرض الصفحة. |
| **ملاحظة السياق** | الكوميت وصف الإزالة بـ"duplicate" لأن الصفحة كانت تعرض البانرين متتاليين مما أعطى انطباعاً بالتكرار. توصية بإعادة تموضع البانر الواسع في مكان مناسب (مثلاً أسفل قسم `#categories` أو كـ sticky footer CTA) بدلاً من حذفه كلياً. |

---

## حالة الفجوات البصرية المستمرة (محدَّثة)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة (شحن/ثقة/أمان/دعم) | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | يعرض «مميز» بدلاً منها | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود (سطر 115 `app/page.tsx`) | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة (موثوق/سريع) | **غائب** في `StoreHeader.tsx` — لا trust badges | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar (15,000 متجر / +1 مليون / 99.6% رضا) | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| AdSlot (marketplace) | "مساحة بانر واسعة" — variant wide | **غائب** — حُذف في `5f7bf39` | **drift جديد هذه الجولة ← مانع** |

---

## ملاحظة — Storefront Builder (non-baseline path)

الكوميتات `2a4698d` و`09dcbe4` و`8f7b63b` تُغير سلوك صفحة المتجر الفرعي **للمتاجر التي تستخدم المحرر البصري فقط** (`hasBuilderLayout`). المتاجر الكلاسيكية (غير builder) تحتفظ بالمسار الأصلي: `StoreHeader` مع hero banner + بطاقة المعلومات العائمة (`-mt-8`). لا drift في هذا المسار لهذه الجولة.

`ProductCard.tsx` (كوميت `8b42fda`) — refactor إلى CSS tokens بدون تغيير في الناتج البصري. لا drift جديد.

---

## الخطوة التالية

انحراف مانع مُوثَّق. المراحل 2 و3 محجوبة هذه الجولة.

**للمراجعة:** قرار بإعادة تموضع "مساحة بانر واسعة" أو تحديث الـ baseline رسمياً لحذفه — يحتاج موافقة صاحب المنتج.

# تقرير انحراف بصري — baseline-drift-2026-06-23

**تاريخ التشغيل:** 2026-06-23 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**يوجد drift جديد.** الكوميت `2a4698d` (phase 4c — visual builder hybrid) أضاف شريط تنقل رباعي الروابط إلى أعلى صفحة المتجر الفرعي غير-builder، عنصر بصري لم يكن في الـ baseline ولم يكن في الكود قبل هذا الكوميت.

**قرار المرحلة:** drift جديد موجود → المرحلتان 2 و3 مؤجلتان وفق قواعد الحراسة. لا spec جديد هذه الجولة.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | الوصف | الملفات المتأثرة | التأثير البصري |
|---------|-------|-----------------|----------------|
| `5f7bf39` | fix(marketplace): remove duplicate advertise banner on stores home | `app/page.tsx` | **إيجابي** — حذف بانر إعلاني مكرر؛ لا drift جديد |
| `2a4698d` | feat(storefront): phase 4c — public storefront renders the visual builder (hybrid) | `app/[slug]/page.tsx`، `app/[slug]/products/page.tsx`، `components/storefront/StorefrontBlocks.tsx` | **⚠ DRIFT جديد** — راجع أدناه |
| `09dcbe4` | fix(storefront): drop duplicate chrome hero for builder stores | `app/[slug]/layout.tsx`، `components/store/StoreHeader.tsx` | ملاحظة تصميمية لـ builder فقط — راجع أدناه |
| `e65d0a0` | fix(storefront): make the products page discoverable in store nav | `components/store/StoreTabsNav.tsx`، `components/store/StoreHeader.tsx` | تغيير في تنقل المتجر — خارج نطاق baseline المتسوق الأساسي |

---

## Drift #1 — شريط تنقل رباعي جديد على صفحة المتجر الفرعي (حرج)

| الحقل | القيمة |
|-------|--------|
| **المكوّن** | Store home page — non-builder path |
| **الملف** | `app/[slug]/page.tsx` السطور 54–88 |
| **الكوميت** | `2a4698d` feat(storefront): phase 4c |
| **النطاق** | كل المتاجر التي **لا** تستخدم visual builder |

### الوصف البصري للانحراف

الـ baseline (`subdomain-store.png`) يُظهر أعلى منطقة المحتوى (بعد بطاقة StoreInfoCard):
- شريط بحث + قوائم تبويب وترتيب

الكود الحالي في non-builder path يُظهر:
```html
<nav aria-label="روابط المتجر" class="-mx-4 overflow-x-auto border-y ...">
  كل المنتجات | المنتجات المميزة | السلة | الأقسام
</nav>
```

شريط التنقل الرباعي عنصر **جديد كلياً** — لم يكن في الـ baseline ولم يكن في الكود قبل `2a4698d`. شريط البحث غائب تماماً (فجوة قائمة مستمرة لم تُفتح specs لها بعد).

### توصية الاسترجاع (كتوصية فقط — لا تُنفذ)

**الخيار أ (استرجاع):** حذف السطور 54–88 من `app/[slug]/page.tsx`، إبقاء هيكل المحتوى على الأقسام والمنتجات مباشرة.

**الخيار ب (ترقية مُعتمدة):** الإبقاء على شريط التنقل وإضافة `<input type="search">` له ليُعيد التوافق مع عنصر "بحث" في الـ baseline، مع تحويله لفلتر منتجات بـ URL params كما في `app/page.tsx`. يتطلب موافقة محمد الزهراني وتوثيقاً في `docs/design/baseline/README.md` كـ baseline update.

---

## ملاحظة تصميمية — Builder stores compact header

| الحقل | القيمة |
|-------|--------|
| **الملف** | `app/[slug]/layout.tsx` السطر 82 + `components/store/StoreHeader.tsx` السطور 103–136 |
| **الكوميت** | `09dcbe4` fix(storefront): drop duplicate chrome hero for builder stores |
| **النطاق** | المتاجر التي تستخدم visual builder (`hasBuilderLayout(theme_config) === true`) |

المتاجر ذات visual builder تعرض الآن **compact strip** (شريط هوية مُصغَّر) بدلاً من Hero + StoreInfoCard. هذا **تصميم مقصود** لمسار builder حيث يُنشئ التاجر hero خاصاً به عبر StorefrontBlocks.

**التقييم:** ليس drift على المتاجر العادية — الـ baseline معرَّف لمتاجر standard. المتاجر العادية تحتفظ بـ Hero + StoreInfoCard كما في الـ baseline. **لا إجراء مطلوب** لهذه النقطة.

---

## حالة الفجوات البصرية المستمرة

جدول محدَّث من التقرير السابق مع إضافة الـ drift الجديد:

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| **Store home (non-builder)** | **شريط تنقل رباعي** | **موجود — جديد هذا الأسبوع** | **⚠ drift جديد — ينتظر قرار المالك** |
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## الخطوة التالية

الـ drift الجديد (شريط التنقل الرباعي) يتطلب قرار من محمد الزهراني:

- **استرجاع** شريط التنقل (الخيار أ أعلاه) → يُغلق الـ drift مباشرة، أو
- **اعتماده** كـ baseline update مع إضافة بحث (الخيار ب) → يُوثَّق في `docs/design/baseline/README.md` بـ PR منفصل بعنوان `baseline-update`

المرحلتان 2 و3 (استخبارات منافسين + spec) تُؤجَّلان إلى الجولة القادمة (2026-06-30) أو حتى حسم قرار الـ drift.

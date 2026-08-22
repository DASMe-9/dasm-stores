# تقرير انحراف بصري — baseline-drift-2026-08-07

**تاريخ التشغيل:** 2026-08-07 (جولة أسبوعية — الجمعة)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**يوجد drift جديد — توقف عند المرحلة 1.** الكوميتات منذ آخر جولة (2026-06-16) تضمنت مراجعة جذرية لصفحة الـ marketplace (`013f987` بتاريخ 2026-07-30) أضافت مكوّن **CommercePassport** على الجانب الأيمن من الـ Hero، بديلاً عن محتوى الصورة/العرض البصري الذي يُفترض وجوده في الـ baseline.

**قرار المرحلة:** drift جديد موثَّق → لا تكملة للمرحلتين 2 و3.

---

## الكوميتات المؤثرة منذ 2026-06-16

| الكوميت | التاريخ | الوصف | الملفات | التأثير البصري |
|---------|---------|-------|---------|----------------|
| `5f7bf39` | 2026-07-?? | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` | إزالة banner مكرر — لا drift جديد |
| `013f987` | 2026-07-30 | [codex] elevate DASM Stores marketplace homepage | `app/page.tsx` (+778/-87)، `components/home/HomeHeaderActions.tsx` | **drift جديد** — Hero يمين + CTA الهيدر |
| `2a9372c` | 2026-07-3? | [codex] fix homepage light and dark theme coverage | `app/page.tsx` | تعديل ألوان dark mode — لا drift بنيوي إضافي |

---

## الانحراف الجديد — مُفصَّل

### 1. Hero — الجانب الأيمن: CommercePassport بدلاً من محتوى بصري

| البند | التفصيل |
|-------|---------|
| **المكوّن** | Hero (marketplace) — العمود الأيمن |
| **الملف والسطر** | `app/page.tsx` — دالة `CommercePassport` (السطور 275–331)، يُعرض في السطر 497 |
| **الـ baseline** | صورة/عنصر بصري يعرض منتجات أو أغراض ثلاثية الأبعاد (كما في `marketplace-home.png`) |
| **الحالة الراهنة** | بطاقة **"DASM COMMERCE PASSPORT"** ذات 5 خطوات (هوية المتجر، الكتالوج، إعداد الدفع، الشحن، الوصول للعميل) مع عداد المتاجر |
| **الوصف البصري** | البطاقة داكنة (`dark:bg-[#0d2636]/95`)، تستخدم خطاً مونو مع ترقيم عربي–لاتيني، وخطوط تدرج emerald بين كل خطوة |
| **متى تغيّر** | 2026-07-30 — الكوميت `013f987` ("elevate DASM Stores marketplace homepage") |
| **طبيعة التغيير** | تحويل الجانب الأيمن من showcase بصري سلبي → widget تفاعلي لاستقطاب التجار |

**توصية الاسترجاع (بدون تنفيذ — توصية فقط):**
> في السطر 456 (`<div className="relative mx-auto grid max-w-7xl...">`)، استبدل `<CommercePassport storeCount={paginator.total} />` (السطر 497) بعنصر صورة أو عرض مرئي للمنتجات المميزة/المتاجر وفق baseline. إن كان CommercePassport قراراً منتجاً مقصوداً، يُرفع للمراجعة لتحديث الـ baseline الرسمي.

---

### 2. Drift مُغلَق — تم تنفيذ Spec الهيدر

| البند | التفصيل |
|-------|---------|
| **المكوّن** | HomeHeaderActions — CTA استقطاب التاجر للضيف |
| **الـ spec السابق** | `docs/specs/home-header-seller-cta-2026-06-16.md` |
| **الحالة** | **مُنفَّذ** في الكوميت `013f987` (2026-07-30) |
| **الملف** | `components/home/HomeHeaderActions.tsx` — السطور 138–143 |
| **التفصيل** | زر "افتح متجرك" (`bg-[#0e7c66]`) يظهر للضيف مع أيقونة Store بجانب "تسجيل الدخول" |

---

## جدول الفجوات البصرية المستمرة (من تقارير سابقة — لا تغيير)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | spec ينتظر Cursor: `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | spec ينتظر Cursor: `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | spec ينتظر Cursor: `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | **غائب** | spec ينتظر Cursor: `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | spec ينتظر Cursor: `sticky-mini-cart-bar-2026-06-15.md` |

---

## الخطوة التالية

الـ drift الجديد (CommercePassport) يستدعي أحد مسارين:
1. **مسار الاسترجاع:** توجيه Cursor لاستبدال CommercePassport بعنصر بصري يطابق الـ baseline
2. **مسار تحديث الـ baseline:** مراجعة `docs/design/baseline/marketplace-home.png` وإذا كان CommercePassport قراراً منتجاً نهائياً، يُحدَّث الـ baseline وتُلغى حالة الـ drift

لا تكملة للمرحلتين 2 و3 هذه الجولة.

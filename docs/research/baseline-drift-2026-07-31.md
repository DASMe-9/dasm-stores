# تقرير انحراف بصري — baseline-drift-2026-07-31

**تاريخ التشغيل:** 2026-07-31 (جولة أسبوعية — الجمعة)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**يوجد drift حرج** — commit `013f987` بتاريخ 2026-07-30 ("elevate DASM Stores marketplace homepage")
غيّر بنية الـ Hero ولغته البصرية تغييرًا جوهريًا يخرج عن مرجع الـ baseline.

**قرار المرحلة:** انحراف مانع → لا انتقال للمرحلة 3 (توليد spec). تستكمل المرحلة 2 فقط.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملفات المتأثرة |
|---------|---------|-------|-----------------|
| `5f7bf39` | 2026-06 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` |
| `2a4698d` | 2026-06 | feat(storefront): phase 4c — visual builder hybrid | `app/[slug]/page.tsx` |
| `8b42fda` | 2026-07 | refactor storefront components to tokens | `app/[slug]/page.tsx` + storefront |
| `013f987` | **2026-07-30** | **[codex] elevate DASM Stores marketplace homepage** | `app/page.tsx` + `HomeHeaderActions.tsx` (778+ سطر) |
| `2a9372c` | **2026-07-30** | **[codex] fix homepage light and dark theme coverage** | `app/page.tsx` |

---

## المكوّنات المنحرفة

### 1. Hero (marketplace) — انحراف حرج

**الملف:** `app/page.tsx` — القسم `data-testid="platform-hero"` (السطر ~452)

**وصف ما تغيّر:**

| المحور | الـ baseline | ما قبل elevate (W1–W29) | ما بعد elevate (الآن) |
|--------|-------------|------------------------|-----------------------|
| خلفية Hero | داكنة تركواز `#021b1f` + تدرج سائل | داكنة `#021b1f` | فاتح `#eaf2f1` / داكن `#081c2c` — لون مختلف كليًا |
| مصدر بصري | جسيمات + خطوط ضوء + منتجات 3D معلقة | `HeroScene` (أضواء + أيقونات 3D متحركة) | **مُحذوف** — لا جسيمات ولا عناصر ثلاثية الأبعاد |
| تخطيط | عرض كامل أحادي العمود | عرض كامل أحادي العمود | **شبكة عمودين** `lg:grid-cols-[1.05fr_.95fr]` |
| شريط البحث | داخل Hero (مُطرَّز بـ `rounded-full` أبيض) | داخل Hero (absolute bottom) | **مُنقول** — قسم منفصل تحت Hero بخلفية `#f4f0e8` |
| AdSlot في Hero | `variant="hero"` داخل Hero | `StoreAdSlot slotKey="store.home.banner" variant="hero"` | **مُحذوف** من Hero — انتقل لـ `variant="card"` في قسم المنتجات |
| عنصر جديد | لا يوجد | لا يوجد | `CommercePassport` card (جواز نمو المتجر) — عنصر غير موجود في الـ baseline |

**توصية الاسترجاع:**

خيار A (استرجاع كامل): إعادة `HeroScene` وخلفية `bg-[#021b1f]` مع إعادة البحث إلى داخل الـ hero.

خيار B (هجين): الإبقاء على التخطيط الجديد للنص + CTAs، لكن إعادة لون خلفية داكن (`bg-[#021b1f]` أو `bg-[#0d1f1a]`) وإعادة `StoreAdSlot variant="hero"` داخل الـ hero بدل إزالته.

**ملاحظة:** CommercePassport card مكوّن جديد لم يُدرَج في baseline — قرار إبقائه أو حذفه خارج نطاق هذا التقرير. يُضاف للـ ideas-backlog.

---

### 2. شريط البحث — انتقل خارج Hero

**الملف:** `app/page.tsx:501–529`

**وصف:** انتقل من موقعه المطلق داخل الـ hero `#021b1f` إلى قسم مستقل بخلفية `bg-[#f4f0e8]`.

**التغيير التقريبي:** commit `013f987` — 2026-07-30

**الـ baseline:** يُظهر البحث داخل منطقة الـ hero المحاطة بخلفيتها الداكنة.

**توصية:** إعادة البحث إلى داخل الـ hero أو أسفله المباشر، لا في قسم منفصل بلون خلفية مختلف.

---

### 3. Ad slot (Hero) — مُحذوف

**الملف:** `app/page.tsx` — شريط AdSlot في Hero

**وصف:** `StoreAdSlot slotKey="store.home.banner" variant="hero"` كان داخل الـ hero يُنفّذ "شارة مساحة إعلان رئيسية" الظاهرة في baseline. حُذف من الـ hero وانتقل بـ `variant="card"` إلى قسم المنتجات.

**التغيير:** commit `013f987` — 2026-07-30

**توصية:** استعادة `<StoreAdSlot slotKey="store.home.banner" variant="hero" />` داخل قسم الـ hero.

---

## الفجوات البصرية المستمرة (من تقارير سابقة — بلا تغيير)

| المكوّن | العنصر | الحالة | القرار السابق |
|---------|--------|--------|--------------|
| Hero (marketplace) | صف أيقونات مزايا المنصة | غائب | مقبول — قرار التجميد 2026-06-07 |
| ProductTile | شارة «ممول» (sponsored badge) | غائب — يظهر «مميز» بدلاً منه | مقبول — قرار التجميد |
| ProductTile | زر سلة `rounded-full` | `rounded-xl` في الكود | `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile | أيقونة قلب (wishlist) | غائب | `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store) | أيقونة قلب (wishlist) | غائب | `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard (subdomain) | وسوم ثقة + hero بانر | غائب — صفحة المتجر لا تحتوي hero أو StoreInfoCard | `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Footer | StatsBar | غائب | مقبول — قرار التجميد |
| Store (mobile) | Sticky Cart Bar | غائب | `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## ملاحظة إيجابية — Spec مُنجَز

**`home-header-seller-cta-2026-06-16.md` مُنفَّذ:** commit `013f987` أضاف زر "افتح متجرك"
(Store icon + `bg-[#0e7c66]`) في `HomeHeaderActions.tsx` للضيف غير المسجل — يُطابق الـ spec المكتوب.

---

## الخطوة التالية

- **أولوية قصوى:** مراجعة Hero redesign مع الفريق — هل هو استبدال مقصود للـ baseline أم انحراف غير مقصود؟
- إذا كان الـ baseline الجديد هو التصميم المُعتمَد: يستلزم تحديث `docs/design/baseline/marketplace-home.png` + `docs/design/baseline/components-inventory.md`
- إذا كان انحرافًا غير مقصود: استخدم توصيات الاسترجاع أعلاه كمرجع لـ Cursor
- Specs المعلقة (product-tile-cart-button، wishlist، sticky-cart) لم تُنفَّذ حتى الآن — تبقى في القائمة

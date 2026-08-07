# تقرير انحراف بصري — baseline-drift-2026-08-07

**تاريخ التشغيل:** 2026-08-07 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)
**فترة الفجوة الزمنية:** 2026-06-16 → 2026-08-07 (52 يوم — غياب مفاجئ للجولات W30–W31)

---

## ملخص تنفيذي

**يوجد drift جديد من المستوى الحرج.** أكبر تغيير منفرد منذ تجميد الـ baseline:
`[codex] elevate DASM Stores marketplace homepage` (commit `013f987`، 2026-07-30) أعاد تصميم صفحة السوق الرئيسية بالكامل.
Hero السوق تغيّر من خلفية تركواز سينمائية مع منتجات ثلاثية الأبعاد متحركة إلى تصميم عمودين فاتح مع بطاقة "جواز نمو المتجر".

**قرار المرحلة:** انحراف مانع → لا تتجاوز المرحلة 2 (لا spec هذه الجولة).

---

## الكوميتات الجديدة التي لمست الـ baseline scope (2026-06-16 → 2026-08-07)

| الكوميت | التاريخ | الوصف | الملفات المتأثرة | التأثير البصري |
|---------|---------|-------|-----------------|----------------|
| `b95d2b6` | 2026-06-27 | add storefront theme tokens | `app/[slug]/layout.tsx`, `styles/globals.css`, `lib/themes/` | نظام tokens جديد — تغيير بنيوي في الألوان |
| `8b42fda` | 2026-06-27 | refactor storefront components to tokens | `ProductCard.tsx`, `StoreHeader.tsx`, `StoreCard.tsx` + 9 ملفات | إعادة ترميز ألوان المكوّنات من hardcoded إلى CSS variables |
| `013f987` | 2026-07-30 | elevate DASM Stores marketplace homepage | `app/page.tsx`, `HomeHeaderActions.tsx` | **إعادة تصميم كاملة** للـ Hero + إزالة وإضافة sections |
| `2a9372c` | 2026-07-30 | fix homepage light and dark theme coverage | `app/page.tsx` | تصحيحات ألوان light/dark على التصميم الجديد |

لم يُلمس أي ملف baseline (docs/design/baseline/) في أي من هذه الكوميتات.

---

## Drift جديد — تفصيل مكوّن بمكوّن

### 1. Hero (marketplace) — إعادة تصميم كاملة [حرج]

**المرجع:** `docs/design/baseline/components-inventory.md` قسم "Hero (marketplace)"
**الملف:** `app/page.tsx` الأسطر 452–498

| المحور | الـ baseline | الكود الحالي |
|--------|-------------|-------------|
| الخلفية | داكنة سينمائية `bg-[#021b1f]` + تدرج تركواز | فاتحة `bg-[#eaf2f1]` / `dark:bg-[#081c2c]` |
| العناصر البصرية | مشهد 3D متحرك (`home-hero-commerce-scene`): ShoppingBag, BadgeCheck, Headphones, FlaskConical, ShoppingCart + جسيمات | **مزال** — بدلاً عنه بطاقة `CommercePassport` في عمود الـ right |
| العنوان | "اكتشف متاجر ومنتجات داسم" | "من متجر سعودي مستقل، إلى سوق أكبر." |
| حقل البحث | مدمج داخل الـ Hero (`form` مطلقة الموضع أسفل Hero) | **مزال من Hero** — في section مستقل بخلفية `bg-[#f4f0e8]` |
| صف أيقونات المزايا | شحن / ثقة / أمان / دعم (صف أسفل البحث) | **غائب** (كان مقبولاً بقرار 2026-06-07، لا يزال غائباً) |

**وقت التغيير (تقديري):** commit `013f987` — 2026-07-30 الساعة 19:28 (UTC+3)
**توصية الاسترجاع (Cursor فقط):** قرار مزدوج — إما تحديث الـ baseline رسمياً لتعكس التصميم الجديد (PR منفصل `baseline-update` بموافقة محمد الزهراني)، أو استعادة الخلفية الداكنة مع CommercePassport. **لا تنفّذ شيئاً حتى التوجيه.**

---

### 2. "for-merchants" section — إضافة جديدة لا تعكسها الـ baseline [تحذير]

**الملف:** `app/page.tsx` الأسطر 531–578
**الوصف:** section جديدة تعرض 4 بطاقات (رابط مستقل / كتالوج قابل للإدارة / تشغيل الطلبات / قراءة الأداء) موجهة لأصحاب المتاجر.
**الانطباق على baseline:** هذا المحتوى **غير موجود في الـ baseline**. ليس drift بالمعنى الاسترجاعي؛ لكنه يدل على أن الـ baseline تقادم وبات لا يعكس الصفحة الحالية.
**توصية:** يُضاف لقائمة محتوى baseline-update المرتقب.

---

### 3. Ad Banner الواسع — تغيير في التنفيذ [ملاحظة]

**الملف:** `app/page.tsx` سطر 617–622 (الكود الحالي)

| المحور | الـ baseline | الكود الحالي |
|--------|-------------|-------------|
| بانر عريض (variant=wide) | شريط تركواز متوهج، زر "أعلن الآن"، hardcoded في page.tsx | **مزال** — استُبدل بـ `<StoreAdSlot slotKey="store.home.banner" variant="card">` |

**التأثير:** الـ baseline يذكر نوعين من AdSlot (featured + wide). variant="card" لم يتوافق بصرياً مع "بانر واسعة". تفاصيل عرض variant="card" تعتمد على CMS الإعلانات.

---

### 4. HomeHeaderActions — CTA البائع مُنفَّذ ✅ [حالة إيجابية]

**الملف:** `components/home/HomeHeaderActions.tsx` الأسطر 138–143
**الكود الحالي:** يعرض للضيف زر `<Link href="/auth/signup">افتح متجرك</Link>` + أيقونة Store
**الحالة:** spec `docs/specs/home-header-seller-cta-2026-06-16.md` **مُنفَّذ بالكامل بواسطة commit `013f987`**
**الإجراء:** هذه الفجوة مغلقة ✅ — لا تحتاج Cursor.

---

### 5. Storefront Components → CSS Tokens [بنيوي، ليس drift بصري مباشر]

**الملفات:** `components/product/ProductCard.tsx`, `components/store/StoreHeader.tsx`, `components/store/StoreCard.tsx`
**التغيير:** قيم ألوان hardcoded (`text-emerald-700`, `bg-white` إلخ) استُبدلت بـ CSS variables (`var(--c-brand)`, `var(--c-surface)` إلخ).
**التأثير على baseline:** مشروط بقيم الـ tokens في كل theme. إن كانت قيم الـ tokens تطابق الألوان السابقة → لا drift بصري فعلي. إن اختلفت → drift محتمل لكل theme على حدة.
**توصية:** مراقبة في التشغيل الميداني. لا إجراء حرج الآن.

---

## حالة الفجوات البصرية المستمرة (من التقرير السابق)

| المكوّن | العنصر | الحالة في الكود | قرار/spec |
|---------|--------|-----------------|-----------|
| Hero (marketplace) | ~~أيقونات مزايا المنصة~~ | غائب | مقبول بقرار 2026-06-07 (لا يزال سارياً) |
| Hero (marketplace) | تصميم كامل (خلفية + 3D) | **إعادة تصميم جديدة — drift حرج** | يتطلب قرار baseline-update |
| ProductTile (marketplace) | شارة «ممول» | غائب | مقبول بقرار 2026-06-07 |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` + أيقونة ArrowLeft | `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | غائب | `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | غائب | `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة (موثوق/توصيل/موقع) | فقط `areaName` و`contact_phone` | `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar (15,000 / +1م / 99.6%) | غائب | مقبول بقرار 2026-06-07 |
| Store (mobile) | Sticky Cart Bar | غائب | `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| HomeHeaderActions | CTA «افتح متجرك» للضيف | **مُنفَّذ ✅** | spec مغلق |

---

## الخطوة التالية (إجراء إنسان)

1. **قرار عاجل من محمد الزهراني:** هل التصميم الجديد للـ Hero (commit 013f987) هو المرجع الرسمي الجديد؟
   - إذا نعم → فتح PR باسم `baseline-update` لتحديث `docs/design/baseline/marketplace-home.png` رسمياً.
   - إذا لا → إعادة بناء Hero إلى التصميم الأصلي مع الاحتفاظ بـ CommercePassport.
2. **مراجعة specs المعلقة:** 4 specs جاهزة تنتظر Cursor منذ 4–8 أسابيع.
3. **الأسبوع القادم:** إن تمّ تحديث الـ baseline ← تُعاد الجولة القادمة من نقطة مرجعية نظيفة.

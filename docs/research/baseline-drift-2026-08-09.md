# تقرير انحراف بصري — baseline-drift-2026-08-09

**تاريخ التشغيل:** 2026-08-09 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج في تلك الجولة)

---

## ملخص تنفيذي

**يوجد drift جديد — ثلاثة انحرافات بصرية مؤكّدة منذ 2026-06-16.**

الانحراف الأول حرج: إعادة تصميم كاملة لـ Hero الصفحة الرئيسية (marketplace) — الخلفية الداكنة السينمائية وعناصر الـ 3D اختفت واستُبدلت بخلفية فاتحة ومكوّن `CommercePassport`.

**قرار المرحلة: انحراف حرج → المرحلتان 2 و3 مُعلَّقتان هذه الجولة.**

---

## الكوميتات الجديدة منذ 2026-06-16 (الملفات المعنية فقط)

| الكوميت | التاريخ | الوصف | الملف |
|---------|---------|-------|-------|
| `5f7bf39` | 2026-06-17 | إزالة بانر الإعلان المكرر | `app/page.tsx` |
| `8b42fda` | 2026-06-27 | إعادة هيكلة مكوّنات Storefront للـ tokens | `components/product/ProductCard.tsx` |
| `013f987` | 2026-07-30 | **ترقية الصفحة الرئيسية (marketplace)** — إعادة كتابة شاملة | `app/page.tsx`، `components/home/HomeHeaderActions.tsx` |
| `2a9372c` | 2026-07-30 | إصلاح تغطية light/dark للصفحة الرئيسية | `app/page.tsx` |
| `4edbdeb` | 2026-08-01 | إضافة صفحة نتائج إعلانات | `app/[slug]/layout.tsx` |

---

## الانحرافات الجديدة المُكتشَفة

### 1. Hero (marketplace) — الخلفية الداكنة السينمائية اختفت ✦ حرج

| البند | التفصيل |
|-------|---------|
| **المكوّن** | `data-testid="platform-hero"` — `app/page.tsx`، الأسطر 452–498 |
| **الوصف البصري للـ baseline** | خلفية داكنة واسعة، تدرج تركواز/سائل، جزيئات ضوء، عناصر منتجات ثلاثية الأبعاد (ShoppingBag، Headphones، FlaskConical، ShoppingCart)، شرارات متحركة |
| **الوصف البصري الحالي** | خلفية **فاتحة** (`bg-[#eaf2f1]`) مع تدرجات شعاعية خفيفة (13–16% شفافية). مكوّن `HeroScene` أُزيل كليًا. بدلاً منه مكوّن `CommercePassport` (بطاقة هوية تجارية بمسارات متسلسلة: هوية المتجر، الكتالوج، إعداد الدفع، الشحن، الوصول للعميل) |
| **عناصر اختفت من baseline** | `home-hero-commerce-scene`، `home-hero-light-a/b`، `home-hero-product-*`، `home-hero-cart`، `home-hero-spark-*` |
| **حقل البحث** | انتقل من داخل Hero إلى قسم منفصل أسفله (`bg-[#f4f0e8]`) |
| **التوقيت التقريبي** | 2026-07-30 (`git log` → commit `013f987`) |
| **توصية الاسترجاع** | أحد خيارين — **لا تنفّذ، هذه توصية فقط لـ Cursor/مدير التصميم:** (أ) إعادة `HeroScene` الداكن لو كان الانحراف غير مقصود؛ (ب) تحديث `docs/design/baseline/marketplace-home.png` لو كان القرار استراتيجيًا — الكوميت الضخم (+778 سطر بعنوان "elevate") يُرجّح أنه قرار مقصود |

---

### 2. ProductCard — نسبة الصورة تغيّرت من مربعة إلى بورتريه ✦ متوسط

| البند | التفصيل |
|-------|---------|
| **المكوّن** | `ProductCard` — `components/product/ProductCard.tsx`، السطر 27 |
| **الوصف البصري للـ baseline** | "صورة منتج كبيرة" بدون تحديد نسبة صريحة |
| **السلوك السابق** | `aspect-square bg-[var(--muted)]` |
| **السلوك الحالي** | `aspect-[4/5] bg-[var(--c-surface-2)]` |
| **الأثر البصري** | الصورة أصبحت أطول بنسبة 25% (بورتريه 4:5). قد يقطع الصور المربعة أو يُظهرها بمساحات فراغ في الأعلى والأسفل حسب `object-fit` |
| **التوقيت التقريبي** | 2026-06-27 (commit `8b42fda`) |
| **توصية الاسترجاع** | نسبة 4:5 معيار تجاري سائد وقرار مقبول بصريًا. التوصية: **قبول هذا التغيير** وتوثيق النسبة في البيسلاين لاحقًا |

---

### 3. ProductCard — شارة "مميز" انتقلت من solid amber إلى glass-effect tokens ✦ متوسط

| البند | التفصيل |
|-------|---------|
| **المكوّن** | `ProductCard` — `components/product/ProductCard.tsx`، الأسطر 33–36 |
| **السلوك السابق** | `rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white` (شارة ذهبية صلبة) |
| **السلوك الحالي** | `rounded-[var(--r-pill)] border border-[var(--c-line)] bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-accent)] shadow-[var(--shadow-sm)] backdrop-blur` (شارة زجاجية بنمط tokens) |
| **الأثر البصري** | الشارة أصبحت شفافة جزئيًا تمتزج مع خلفية الصورة — أقل ظهورًا مقارنة بالـ solid badge السابق |
| **التوقيت التقريبي** | 2026-06-27 (commit `8b42fda`) |
| **توصية الاسترجاع** | تقييم من مدير التصميم — النمط الجديد متسق مع نظام الـ tokens لكن يُضعف الظهور على الصور الداكنة. إن أُريد ظهور أوضح: السطر 33 يصبح `className="absolute right-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[var(--c-accent)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-[var(--c-surface)]"` |

---

## ملاحظة إيجابية — spec مُنفَّذ

شارة **`home-header-seller-cta-2026-06-16.md`** تم تنفيذها ضمن commit `013f987`:
- زر "افتح متجرك" (أخضر داكن، أيقونة Store) يظهر للضيوف في الهيدر — `components/home/HomeHeaderActions.tsx`، الأسطر 139–143
- هذا يُنجز الـ spec المُصنَّف "الأثر العالي / الجهد المنخفض" من جولة W29

---

## حالة الفجوات البصرية المستمرة (من التقارير السابقة)

| المكوّن | العنصر | الحالة | القرار السابق |
|---------|--------|--------|--------------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد |
| Hero (marketplace) | **الخلفية الداكنة + HeroScene** | **غائب (جديد)** | يحتاج قرارًا جديدًا ← حرج |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري | `rounded-xl` في الكود | ينتظر Cursor — `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب | **غائب** | ينتظر Cursor — `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب | **غائب** | ينتظر Cursor — `product-card-store-wishlist-2026-06-12.md` |
| ProductCard (store pages) | **نسبة الصورة** | square → 4:5 (جديد) | تُوصى بالقبول |
| ProductCard (store pages) | **شارة "مميز"** | solid → glass (جديد) | يحتاج قرار مدير التصميم |
| StoreInfoCard | وسوم ثقة | **غائب** | ينتظر Cursor — `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | ينتظر Cursor — `sticky-mini-cart-bar-2026-06-15.md` |

---

## الخطوة التالية

1. **مطلوب قرار بشري** على انحراف Hero: (أ) تحديث baseline PNG ليعكس التوجه الجديد، أو (ب) إعادة HeroScene الداكن
2. بعد القرار على Hero → استئناف المرحلتين 2 و3 في الجولة القادمة
3. Cursor: الـ specs المعلقة لا تزال جاهزة للتنفيذ (9 specs في `docs/specs/`)

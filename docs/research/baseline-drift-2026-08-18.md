# تقرير انحراف بصري — baseline-drift-2026-08-18

**تاريخ التشغيل:** 2026-08-18 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد — أوقف تشغيل Guardian لمدة ~9 أسابيع)

---

## ملخص تنفيذي

**يوجد drift جديد.** كوميت `013f987` بتاريخ 2026-07-30 أجرى تحسيناً جوهرياً على الصفحة الرئيسية للسوق. العنصر الجديد **CommercePassport** في العمود الأيمن من Hero لم يُوثَّق سابقاً ولا يطابق الـ baseline المجمَّد.

**قرار المرحلة:** drift جديد موجود → لا تتجاوز المرحلة 2. لا spec هذه الجولة.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

الملفات الواقعة تحت المراقبة البصرية:

| الكوميت | التاريخ | الوصف | الملفات المتأثرة |
|---------|---------|-------|-----------------|
| `013f987` | 2026-07-30 | [codex] elevate DASM Stores marketplace homepage | `app/page.tsx` (+778/-87)، `components/home/HomeHeaderActions.tsx` (+25) |
| `2a9372c` | 2026-07-30 | [codex] fix homepage light and dark theme coverage | `app/page.tsx` (+55/-26) |
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx`، `components/store/StoreHeader.tsx`، 10 ملفات storefront |
| `5f7bf39` | ≤2026-06-16 | fix(marketplace): remove duplicate advertise banner (#181) | `app/page.tsx` |
| `2a4698d` | ≤2026-06-16 | feat(storefront): phase 4c — visual builder hybrid (#180) | `app/[slug]/page.tsx` |

ملفات لم تُلمس بصرياً خارج نطاق التغيير المقصود:
- `components/explore/StoreCard.tsx` — لا تغيير
- `app/[slug]/page.tsx` — تغيير وظيفي (visual builder hybrid) لا بصري مباشر

---

## Drift جديد — يتطلب قرار

### 1. CommercePassport widget في عمود Hero الأيمن

| الحقل | القيمة |
|-------|--------|
| **الملف** | `app/page.tsx` |
| **السطور** | 275–332 (مكوّن `CommercePassport`)، 497 (الاستدعاء داخل Hero) |
| **الكوميت المُدخِل** | `013f987` — 2026-07-30 |
| **الـ baseline** | العمود الأيمن للـ Hero يحتوي صوراً ثلاثية الأبعاد لمنتجات عائمة (بصري ترويجي للمتسوق) |
| **الحالة الراهنة** | بطاقة "DASM COMMERCE PASSPORT" تعرض 5 خطوات تأهيل للتاجر (هوية المتجر، الكتالوج، إعداد الدفع، الشحن، الوصول للعميل) + عداد المتاجر الفعلي |
| **وصف بصري** | بطاقة بيضاء كبيرة بحواف دائرية (`rounded-[1.75rem]`) وظل ثقيل، خلفية متدرجة زمردية/ذهبية، تسمية DASM COMMERCE PASSPORT بخط monospace ذهبي، قائمة مرحلة ب 5 عناصر، كل عنصر له أيقونة ورقم ترتيبي monospace، شريط سفلي لعرض عدد المتاجر بخط كبير monospace |
| **الطابع** | محتوى **تاجر** (merchant onboarding) داخل Hero المصمم أصلاً للمتسوق (shopper) |
| **توصية الاسترجاع** | إما (أ) استبدال `<CommercePassport />` بعرض بصري ترويجي للمتسوق كما في الـ baseline، أو (ب) قبول التغيير وتحديث الـ baseline رسمياً بموافقة محمد الزهراني عبر PR بعنوان `baseline-update` |

> **ملاحظة:** التغيير بدا مقصوداً (كوميت مباشر من حساب المالك). لكن دور Guardian إبلاغ الانحراف لا الحكم على القصد. القرار للمالك.

---

## محاور المقارنة مع الـ baseline

### Hero (marketplace-home)

| المحور | الـ baseline | الحالة الراهنة | الحكم |
|--------|-------------|---------------|-------|
| الخلفية | داكن بتدرج تركواز/سائل | `bg-[#eaf2f1]` فاتح (light) + `bg-[#081c2c]` داكن (dark) | مقبول بقرار التجميد 2026-06-07 |
| العنصر البصري الأيمن | صور 3D منتجات عائمة | CommercePassport widget (تاجر) | **DRIFT جديد** ↑ |
| حقل البحث | داخل الـ Hero، كبير مع قائمة نطاق | قسم منفصل أسفل Hero | مقبول بقرار التجميد |
| أيقونات مزايا المنصة | صف أيقونات (شحن، ثقة، أمان، دعم) | غائب | مقبول بقرار التجميد |

### ProductCard (marketplace — ProductTile)

| المحور | الـ baseline | الحالة الراهنة | الحكم |
|--------|-------------|---------------|-------|
| شارة «ممول» | ظاهرة | غائبة (يظهر «مميز» بدلاً من «ممول») | مقبول بقرار التجميد |
| زر سلة دائري | `rounded-full` | `rounded-xl` (ArrowLeft nav link) | ينتظر Cursor — `product-tile-cart-button-2026-06-14.md` |
| أيقونة قلب (مفضلة) | ظاهرة | غائبة | ينتظر Cursor — `product-tile-wishlist-2026-06-11.md` |

### StoreCard (all-stores section)

| المحور | الـ baseline | الحالة الراهنة | الحكم |
|--------|-------------|---------------|-------|
| شعار/أيقونة | دائري (`rounded-full`) | `rounded-xl` | ينتظر Cursor — `store-card-visit-cta-2026-06-13.md` |
| زر «زيارة المتجر» مع حدود تركواز | ظاهر | غائب في `StoreCard.tsx` (موجود فقط في mini cards بـ `app/page.tsx`) | ينتظر Cursor |

### HomeHeaderActions

| المحور | الـ baseline | الحالة الراهنة | الحكم |
|--------|-------------|---------------|-------|
| زر CTA للضيف («افتح متجرك») | — | **موجود** (`/auth/signup` مع أيقونة Store) | ✅ **محلول** — spec `home-header-seller-cta-2026-06-16.md` مُنفَّذ بكوميت `013f987` |

---

## الفجوات البصرية المستمرة (بلا تغيير)

| المكوّن | العنصر | الحالة | الوثيقة |
|---------|--------|--------|---------|
| ProductCard (store pages) | أيقونة قلب (مفضلة) | ينتظر Cursor | `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة (موثوق/توصيل سريع) | ينتظر Cursor | `store-info-trust-badges-2026-06-08.md` |
| Store (mobile) | Sticky Cart Bar | ينتظر Cursor | `sticky-mini-cart-bar-2026-06-15.md` |
| Marketplace footer | StatsBar | غائب | مقبول بقرار التجميد 2026-06-07 |

---

## الخطوة التالية

1. **مطلوب من المالك (محمد الزهراني):** قرار في CommercePassport widget:
   - **خيار أ:** فتح PR بعنوان `baseline-update` لتحديث `docs/design/baseline/marketplace-home.png` ليشمل CommercePassport الجديد.
   - **خيار ب:** إزالة CommercePassport من Hero والعودة لتصميم بصري ترويجي للمتسوق.
2. الـ specs المعلقة (4 specs) لا تزال تنتظر Cursor — لا تغيير في أولوياتها.
3. Phase 3 (spec جديد) **مؤجلة لهذه الجولة** — drift غير محلول.

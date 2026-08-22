# تقرير انحراف بصري — baseline-drift-2026-08-08

**تاريخ التشغيل:** 2026-08-08 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج في حينه)

---

## ملخص تنفيذي

**تحذير: وُجد drift جديد وجوهري** — إيقاف الجولة عند المرحلة 1 وفق السياسة.

الكوميت `013f987` بتاريخ 2026-07-30 ("elevate DASM Stores marketplace homepage") أعاد هيكلة الصفحة الرئيسية بشكل جذري: غيّر خلفية الـ hero ونقل شريط البحث خارجه. هذه تغييرات بصرية جوهرية تنحرف عن الـ baseline الرسمي.

**قرار المرحلة:** drift موجود → إيقاف فوري، لا تكملة للمراحل 2 و3.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | التأثير البصري |
|---------|---------|-------|----------------|
| `5f7bf39` | 2026-06 | fix(marketplace): remove duplicate advertise banner on stores home | تصحيح، خارج نطاق drift |
| `013f987` | 2026-07-30 | **[codex] elevate DASM Stores marketplace homepage** | **drift جوهري** — تغيير هيكلي في hero و search |
| `2a9372c` | 2026-07-30 | [codex] fix homepage light and dark theme coverage | امتداد للكوميت السابق |

---

## Drift جديد — مُدخَل بكوميت 013f987

### 1. موقع شريط البحث (أولوية حرجة)

| التفصيل | القيمة |
|---------|--------|
| **المكوّن المنحرف** | Hero section — `app/page.tsx` |
| **السطر الحالي** | خارج الـ hero، section مستقل (lines 501–529) |
| **الحالة في الـ baseline** | شريط البحث مضمَّن داخل الـ hero (عنصر `<form>` بـ `absolute inset-x-5 bottom-7`) |
| **الوصف البصري** | الـ baseline يُظهر شريط البحث ملتصقاً بالـ hero أسفله. الكود الحالي يضع الـ hero كتلةً مستقلة، والبحث section مستقل بعده بمسافة |
| **متى تغيّر** | 2026-07-30، كوميت `013f987` |
| **توصية الاسترجاع** | نقل عنصر `<form action="/">` من خارج الـ hero إلى داخله، وجعله `absolute inset-x-5 bottom-7 z-10` مع `rounded-full` كما كان قبل الكوميت |

### 2. خلفية الـ Hero (أولوية عالية)

| التفصيل | القيمة |
|---------|--------|
| **المكوّن المنحرف** | Hero section — `app/page.tsx` line 452 |
| **السطر الحالي** | `className="relative overflow-hidden bg-[#eaf2f1] ..."` |
| **الحالة في الـ baseline** | خلفية داكنة `bg-[#021b1f]` مع تأثير `HeroScene` وأكواد مرئية متحركة |
| **الوصف البصري** | الـ baseline يُظهر hero داكن (تيل/أخضر غامق) بتأثير بصري ديناميكي. الكود الحالي يستخدم خلفية فاتحة رمادية-خضراء `#eaf2f1` مع radial gradients ثابتة |
| **متى تغيّر** | 2026-07-30، كوميت `013f987` |
| **توصية الاسترجاع** | استعادة `bg-[#021b1f]` وعنصر `HeroScene` (أو البديل التوليدي المعادل) للـ hero، أو مراجعة رسمية لتحديث الـ baseline إذا كان الـ rebrand مقصوداً |

---

## تنبيه: spec مُنفَّذ تلقائياً

**home-header-seller-cta-2026-06-16.md** — كانت spec معلقة لإضافة زر "افتح متجرك" في الهيدر للضيوف.
**نُفِّذت في كوميت `013f987`** (الكود الحالي: `HomeHeaderActions.tsx` lines 138–145).

الفارق البسيط بين الـ spec والتنفيذ:
- Spec اقترح: `sm:inline-flex` + `bg-emerald-600`
- التنفيذ الفعلي: `md:inline-flex` + `bg-[#0e7c66]` (أخضر داسم الرسمي) + أيقونة `Store`

الفارق مقبول — النتيجة البصرية متسقة. يمكن إغلاق الـ spec كـ "مُنفَّذ".

---

## حالة الفجوات البصرية المستمرة من التقارير السابقة

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونة مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` + ArrowLeft (line 237) | ينتظر Cursor — `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor — `product-tile-wishlist-2026-06-11.md` |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor — `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة (متجر موثوق/توصيل سريع) | **غائب** | ينتظر Cursor — `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar (15,000/+1 مليون/99.6%) | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | ينتظر Cursor — `sticky-mini-cart-bar-2026-06-15.md` |

---

## الخطوات المطلوبة

1. **قرار معماري مطلوب**: هل تغيير hero `013f987` rebrand مقصود؟
   - إذا نعم → تحديث `docs/design/baseline/marketplace-home.png` بصورة جديدة، وإغلاق هذا التقرير
   - إذا لا → استعادة خلفية الـ hero وموقع شريط البحث وفق توصيات الاسترجاع أعلاه

2. **Specs معلقة**: 5 specs جاهزة في `docs/specs/` تنتظر تنفيذ Cursor — يُنصح بالمراجعة.

3. **Spec `home-header-seller-cta-2026-06-16.md`**: يمكن أرشفتها كـ "مُنفَّذة".

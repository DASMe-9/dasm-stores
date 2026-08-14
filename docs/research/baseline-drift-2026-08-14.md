# تقرير انحراف بصري — baseline-drift-2026-08-14

**تاريخ التشغيل:** 2026-08-14 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift حرج)

---

## ملخص تنفيذي

**⛔ انحراف حرج — توقف قبل المرحلة 2.**

اكتُشف drift جوهري جديد في Hero الصفحة الرئيسية للسوق. الكوميت الرئيسي المتسبب:
`013f987 [codex] elevate DASM Stores marketplace homepage` (2026-07-30).
غيّر هذا الكوميت التكوين البصري الكامل لـ Hero بشكل لم يُعتمد في سجل baseline.
يُضاف إليه انتكاس وظيفي في زر بطاقة المنتج.

**قرار المرحلة:** لا تتجاوز المرحلة 2 — تصحيح أو اعتماد التغيير مطلوب أولاً.

---

## الكوميتات الجديدة منذ 2026-06-16 المؤثرة بصرياً

| الكوميت | التاريخ | الوصف | الملفات المتأثرة | التأثير البصري |
|---------|--------|-------|-----------------|----------------|
| `b95d2b6` | 2026-06-27 | add storefront theme tokens | `app/[slug]/layout.tsx`, `styles/globals.css`, libs | تحويل ألوان storefront لـ CSS tokens — تغيير هندسي، لا drift بصري |
| `8b42fda` | 2026-06-27 | refactor storefront components to tokens | `ProductCard.tsx`, `StoreHeader.tsx`, أخرى | إعادة هيكلة بالـ tokens — تغيير هندسي، لا drift جديد |
| `013f987` | 2026-07-30 | elevate DASM Stores marketplace homepage | `app/page.tsx` (+778 سطر) | **⛔ DRIFT حرج: Hero يتغيّر بالكامل** |
| `2a9372c` | 2026-07-30 | fix homepage light and dark theme coverage | `app/page.tsx` (+55 سطر) | تعديل دعم الثيمات على التغيير أعلاه |

---

## Drift 1 — Hero (marketplace): تغيير تكوين كامل ⛔ حرج

**الملف:** `app/page.tsx` — السطر 453–499 (الحالي)

### الـ baseline (مجمَّد 2026-06-07):
```
الوصف البصري (من components-inventory.md):
شريط علوي داكن بعرض الصفحة، تدرج تركواز/سائل مع جسيمات وخطوط ضوء،
صور منتجات/أغراض معلقة ثلاثية الأبعاد، عنوان رئيسي وفرعي بارز،
حقل بحث أبيض كبير، وتحته صف أيقونات مزايا المنصة.
```

**الحالة قبل 013f987** (كانت مطابقة للـ baseline في المحاور الأساسية):
- خلفية داكنة `bg-[#021b1f]`، `rounded-3xl`
- `<HeroScene />` — جسيمات وخطوط ضوء وأيقونات منتجات متحركة
- `<StoreAdSlot slotKey="store.home.banner" variant="hero" />` داخل Hero
- العنوان: **"اكتشف متاجر ومنتجات داسم"**
- شريط بحث `rounded-full` مُدمَج في أسفل Hero (خلفية داكنة)

**الحالة الراهنة** (بعد 013f987):
- خلفية فاتحة `bg-[#eaf2f1]` ← قطيعة بصرية كاملة مع الـ baseline الداكن
- لا `HeroScene` — لا جسيمات، لا خطوط ضوء، لا أيقونات ثلاثية الأبعاد
- `<CommercePassport>` بطاقة على اليمين بدلاً من محتوى Hero المتمركز
- العنوان: **"من متجر سعودي مستقل، إلى سوق أكبر."** ← نص مختلف كلياً
- لا `StoreAdSlot` في Hero ← نُقل لأسفل صفحة المنتجات

### المحاور المنحرفة:
| المحور | الـ baseline | الحالي | الخطورة |
|--------|-------------|--------|---------|
| لون الخلفية | داكن `#021b1f` | فاتح `#eaf2f1` | عالية |
| نمط الحركة/Animation | `HeroScene` (جسيمات + ضوء) | غياب كامل | عالية |
| موضع شريط البحث | داخل Hero (أسفله) | قسم منفصل تحت Hero | متوسطة |
| AdSlot في Hero | موجود (`variant="hero"`) | مُزال من Hero | متوسطة |
| النص الرئيسي | "اكتشف متاجر ومنتجات داسم" | "من متجر سعودي مستقل، إلى سوق أكبر." | متوسطة |
| التخطيط | متمركز عمودي | ثنائي الأعمدة (نص + بطاقة) | عالية |

### توصية الاسترجاع:
**خيار أ — استرجاع كامل** (يُوصى به):
- السطر 453–499 في `app/page.tsx` يعود لـ Hero داكن بـ `bg-[#021b1f]`
- إعادة `HeroScene` component
- إعادة شريط البحث داخل Hero بـ `rounded-full`
- إعادة `StoreAdSlot slotKey="store.home.banner" variant="hero"` داخل Hero

**خيار ب — اعتماد الـ baseline الجديد**:
- يتطلب PR منفصل بعنوان `baseline-update` + موافقة محمد الزهراني
- تحديث `docs/design/baseline/marketplace-home.png` و`components-inventory.md`

---

## Drift 2 — شريط البحث: خروج من Hero ⛔ مصاحب

**الملف:** `app/page.tsx` — السطر 501–529 (الحالي)

### الـ baseline:
شريط بحث `rounded-full` مُدمَج في أسفل Hero الداكن — جزء لا يتجزأ من لغته البصرية.

### الحالي:
قسم مستقل بـ `bg-[#f4f0e8]`، `rounded-2xl` — خلفية فاتحة مختلفة، فاصل بصري واضح.

### توصية:
يُحَل بالاسترجاع المقترح في Drift 1 أعلاه.

---

## Drift 3 — ProductTile: انتكاس وظيفي في زر الإجراء ⛔ وظيفي

**الملف:** `app/page.tsx` — السطر 235–243 (الحالي)

### الـ baseline:
زر سلة دائري `rounded-full` يضيف المنتج للسلة أو يفتح صفحتها — أيقونة ShoppingCart.

### الحالة السابقة (موثّقة في `product-tile-cart-button-2026-06-14.md`):
```tsx
// قبل 013f987 — كان يُعرّض للاستبدال بـ rounded-full
<Link href={`/${product.storeSlug}/cart`} 
  className="grid h-9 w-9 place-items-center rounded-xl ...">
  <ShoppingCart className="h-4 w-4" />
</Link>
```
الانحراف كان في الشكل (`rounded-xl` بدل `rounded-full`) — تتبّعه spec جاهز.

### الحالة الراهنة (بعد 013f987):
```tsx
// app/page.tsx السطر 235–243 الحالي
<Link href={productHref}   // ← رابط صفحة المنتج، لا السلة
  className="grid h-9 w-9 place-items-center rounded-xl ...">
  <ArrowLeft className="h-4 w-4" />  // ← أيقونة سهم، لا ShoppingCart
</Link>
```
**ما تغيّر**: الرابط يقود لصفحة المنتج (لا السلة)؛ الأيقونة `ArrowLeft` (لا `ShoppingCart`).
هذا انتكاس عن الحالة السابقة التي كانت موثّقة للتصحيح — إضافة لكونه drift عن الـ baseline.

### توصية الاسترجاع:
السطر 235–243 (`app/page.tsx`) يُعاد لشكل ShoppingCart مع الرابط `/cart`:
```tsx
// يصبح (كحد أدنى لاسترجاع الوظيفة)
<Link href={`/${product.storeSlug}/cart`}
  className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 ...">
  <ShoppingCart className="h-4 w-4" />
</Link>
// ثم يُطبَّق spec product-tile-cart-button-2026-06-14.md لتحويله rounded-full
```
توصية فقط — لا تنفيذ.

---

## حالة الفجوات البصرية المستمرة (محدَّثة)

جدول يجمع الدرفت القديم المستمر + الجديد:

| المكوّن | العنصر | الحالة | الأولوية |
|---------|--------|--------|---------|
| Hero (marketplace) | التكوين البصري الكامل | **DRIFT جديد** — commit 013f987 | 🔴 حرج |
| Hero (marketplace) | موضع شريط البحث | **DRIFT جديد** — commit 013f987 | 🔴 حرج |
| ProductTile | زر السلة (وظيفة + شكل) | **انتكاس** — commit 013f987 | 🔴 حرج |
| ProductTile | شارة «ممول» | غائب — مقبول بقرار التجميد 2026-06-07 | 🟡 مُجمَّد |
| ProductTile | زر قلب (مفضلة) | غائب — spec `product-tile-wishlist-2026-06-11.md` | 🟠 ينتظر Cursor |
| ProductCard (store) | زر قلب (مفضلة) | غائب — spec `product-card-store-wishlist-2026-06-12.md` | 🟠 ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | غائب — spec `store-info-trust-badges-2026-06-08.md` | 🟠 ينتظر Cursor |
| Marketplace footer | StatsBar | غائب — مقبول بقرار التجميد | 🟡 مُجمَّد |
| Store (mobile) | Sticky Cart Bar | غائب — spec `sticky-mini-cart-bar-2026-06-15.md` | 🟠 ينتظر Cursor |

---

## الخطوة التالية المطلوبة

1. **مراجعة محمد الزهراني لـ commit 013f987**: هل Hero الجديد قرار تصميمي معتمد؟
   - إن كان **غير معتمد** → استرجاع وفق توصية Drift 1 أعلاه
   - إن كان **معتمداً** → فتح PR `baseline-update` لتحديث الـ baseline الرسمي

2. **Drift 3 (زر ProductTile)** لا يحتاج قرار baseline — انتكاس وظيفي صريح يُصحَّح بغض النظر عن قرار Hero.

3. المراحل 2 و3 مُعلَّقة حتى حسم الـ drift أعلاه.

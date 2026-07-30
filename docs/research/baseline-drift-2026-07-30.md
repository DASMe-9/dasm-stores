# تقرير انحراف بصري — baseline-drift-2026-07-30

**تاريخ التشغيل:** 2026-07-30 (جولة أسبوعية — الأربعاء)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)
**الفجوة الزمنية:** 44 يوماً — أطول فترة بدون فحص

---

## ملخص تنفيذي

**يوجد drift جديد — 2 انحراف بصري مؤكد + 1 مقبول.**
سبب الانحراف: refactor توكينات القالب (commit 8b42fda — 2026-06-27) غيّر أسلوب عرض شارات
المنتجات من ألوان صريحة (solid) إلى تدرجات شفافة (color-mix).

**قرار المرحلة:** drift موجود → لا تجاوز للمرحلة 3. تُكتمل المرحلتان 1 و2 فقط.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

الملفات المُراقبة التي تأثرت:

| الكوميت | التاريخ | الوصف | الملفات المتأثرة |
|---------|---------|-------|------------------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` |
| `2a4698d` | 2026-06-17 | feat(storefront): phase 4c — visual builder hybrid | `app/[slug]/page.tsx` |
| `09dcbe4` | 2026-06-18 | fix: drop duplicate chrome hero for builder stores | `app/[slug]/layout.tsx` |
| `60fd4bc` | 2026-06-19 | feat: standard legal footer + policy pages | `app/[slug]/layout.tsx` |
| `56ee40c` | 2026-06-19 | fix: drop intrusive cart-emptied banner | `components/store/StoreChrome.tsx` |
| `b95d2b6` | 2026-06-25 | add storefront theme tokens | `app/[slug]/layout.tsx` |
| `8b42fda` | 2026-06-27 | **refactor storefront components to tokens** | **`components/product/ProductCard.tsx`** |
| `fd402fd` | 2026-07-xx | fix: harden storefront conversion tracking | `app/[slug]/layout.tsx` |

---

## الانحرافات البصرية الجديدة

### انحراف 1 — شارة خصم % (ProductCard): تحوّل من solid → شفاف

**الملف:** `components/product/ProductCard.tsx` — السطر 38
**الكوميت:** `8b42fda` (2026-06-27)

| العنصر | الحالة السابقة | الحالة الراهنة |
|--------|---------------|----------------|
| خلفية الشارة | `bg-red-500` (أحمر صريح، معتم) | `bg-[color-mix(in_srgb,var(--c-sale)_12%,var(--c-surface))]` (12% تظليل، شبه شفاف) |
| لون النص | `text-white` | `text-[var(--c-sale)]` |

**التوصيف البصري:** الشارة كانت حمراء صريحة ذات تباين عالٍ (نص أبيض على خلفية حمراء) — مطابقة لـ
baseline. الآن أصبحت شبه شفافة (خلفية فاتحة جداً 12% + نص ملوّن). في الثيمات الفاتحة ستبدو باهتة
وأقل جذباً.

**أثر المبيعات:** شارات الخصم هي أقوى حوافز الشراء بصرياً. إضعافها يعني تراجعاً في click-through
على المنتجات ذات الخصم.

**من git log للملف:**
```
git log --oneline -- components/product/ProductCard.tsx
8b42fda 2026-06-27  [codex] refactor storefront components to tokens
b21b9c8 (سابق)
```

**توصية الاسترجاع:**
```tsx
// السطر 38 — يصبح:
<span className="absolute left-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-[var(--c-sale)] px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-white">
  خصم {discountPct}%
</span>
```

---

### انحراف 2 — شارة "مميز" (ProductCard): تحوّل من solid → glassmorphism

**الملف:** `components/product/ProductCard.tsx` — السطر 33
**الكوميت:** `8b42fda` (2026-06-27)

| العنصر | الحالة السابقة | الحالة الراهنة |
|--------|---------------|----------------|
| خلفية الشارة | `bg-amber-500` (برتقالي صريح) | `bg-[color-mix(in_srgb,var(--c-surface)_88%,transparent)]` (88% بيضاء/شفافة) |
| لون النص | `text-white` | `text-[var(--c-accent)]` |
| تأثيرات إضافية | لا شيء | `backdrop-blur border border-[var(--c-line)] shadow-[var(--shadow-sm)]` |

**التوصيف البصري:** الشارة كانت بارزة بلون برتقالي/ذهبي صريح. الآن تبدو كـ "زجاج ضبابي"
(glassmorphism) — أنيقة لكن أقل وضوحاً، خاصةً على خلفيات فاتحة حيث تكاد تختفي.

**من git log للملف:** نفس الكوميت `8b42fda`.

**توصية الاسترجاع:**
```tsx
// السطر 33 — يصبح:
<span className="absolute right-[var(--space-2)] top-[var(--space-2)] rounded-[var(--r-pill)] bg-amber-500 px-[var(--space-2)] py-[var(--space-1)] text-[10px] font-bold text-white">
  مميز
</span>
```

---

### انحراف 3 — البانر الإعلاني الثاني محذوف (مقبول)

**الملف:** `app/page.tsx`
**الكوميت:** `5f7bf39` (2026-06-17) — PR #181

**الوصف:** قسم كامل محذوف كان يعرض "مساحة إعلان بانر واسعة" بين "متاجر مميزة" و"تصفح الأقسام":
```tsx
// محذوف — كان في السطر ~182:
<section className="mx-auto max-w-7xl px-4 pb-8">
  <Link href="https://ads.dasm.com.sa/advertise" ...>
    مساحة إعلان بانر واسعة
  </Link>
</section>
```

**الـ baseline:** يظهر هذا البانر الداكن في `marketplace-home.png` بين قسمي المتاجر والأقسام.

**القرار:** **مقبول — إصلاح تكرار مقصود.** كان هناك بانران إعلانيان — الأول يبقى (بعد منتجات المتجر)،
الثاني المكرر أُزيل عبر PR #181 الذي وثّق السبب صراحةً. لا يستدعي استرجاعاً.

---

## حالة الفجوات البصرية المستمرة (محدّثة)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` | ينتظر Cursor — `product-tile-cart-button-2026-06-14.md` |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor — `product-tile-wishlist-2026-06-11.md` |
| **ProductCard (store pages)** | **شارة خصم % شفافة** | **color-mix 12%** | **جديد — drift حرج — انحراف 1 أعلاه** |
| **ProductCard (store pages)** | **شارة "مميز" glassmorphism** | **backdrop-blur** | **جديد — drift متوسط — انحراف 2 أعلاه** |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | ينتظر Cursor — `product-card-store-wishlist-2026-06-12.md` |
| StoreInfoCard | وسوم ثقة | **غائب** | ينتظر Cursor — `store-info-trust-badges-2026-06-08.md` |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | ينتظر Cursor — `sticky-mini-cart-bar-2026-06-15.md` |
| Marketplace page | بانر "مساحة إعلان" الثاني | **محذوف** | مقبول — إصلاح تكرار (PR #181) |

---

## الخطوة التالية

1. **drift حرج:** شارة الخصم % — تُدمج توصية الاسترجاع مباشرةً في تذكرة Cursor ضمن
   `product-card-sold-out-overlay-2026-06-14.md` أو spec جديد منفصل.
2. **drift متوسط:** شارة "مميز" — يُضاف كملاحظة في نفس الـ spec أو backlog.
3. **لا تجاوز للمرحلة 3** بسبب وجود drift — لا spec جديد هذه الجولة.

# تقرير انحراف بصري — baseline-drift-2026-06-18

**تاريخ التشغيل:** 2026-06-18 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

**يوجد drift جديد — درجة: متوسطة.** كوميت واحد (PR #181 بتاريخ 2026-06-17) أزال مكوّن AdSlot `variant="wide"` من الصفحة الرئيسية للسوق، وهو عنصر موثّق صراحةً في الـ baseline البصري.

**قرار المرحلة:** وُجد drift مانع → توقف عند المرحلة 1. لا تُكمَل المرحلتان 2 و3 هذه الجولة.

---

## الكوميتات الجديدة منذ 2026-06-16

| الكوميت | الوصف | الملف | التأثير البصري |
|---------|-------|-------|----------------|
| `5f7bf39` | fix(marketplace): remove duplicate advertise banner (#181) | `app/page.tsx` | **drift — حذف AdSlot wide** |
| `2a4698d` | feat(storefront): phase 4c — visual builder hybrid (#180) | `app/[slug]/page.tsx` + `components/storefront/StorefrontBlocks.tsx` | مسار تصيير جديد للمتاجر التي تستخدم builder (opt-in) — انظر تنبيه أدناه |
| `26cc22e` | feat(theme/templates): redesign 6 store templates (#182) | `lib/themes/blocks/templates.ts` | قوالب builder فقط — خارج نطاق baseline المتسوق |

---

## المكوّن المنحرف

### AdSlot `variant="wide"` — محذوف من `app/page.tsx`

| الحقل | القيمة |
|-------|--------|
| **المكوّن** | AdSlot `variant="wide"` |
| **الملف** | `app/page.tsx` |
| **السطر قبل الحذف** | السطر 182 (قسم ما بعد "متاجر مميزة" وقبل "تصفح الأقسام") |
| **كوميت الحذف** | `5f7bf39` — 2026-06-17 |
| **PR** | #181 "remove duplicate advertise banner" |

**الوصف البصري لما أُزيل:**
شريط بانر واسع بعرض كامل للصفحة، خلفية داكنة `bg-[#031b1e]`، تدرج تركواز جانبي، أيقونة `Target` على اليمين، عنوان "مساحة إعلان بانر واسعة" بخط كبير، نص "وصل لآلاف العملاء يوميًا على متاجر داسم"، زر "أعلن الآن" بلون emerald.

**المقابل في الـ baseline:**
الـ baseline يوثّق صراحةً `AdSlot variant="wide"` في `docs/design/baseline/components-inventory.md`:
> "شريط عرض كامل بنفس أسلوب التركواز المضيء، أيقونة هدف/تأثير بصري، عنوان، جملة وصل لآلاف العملاء، زر «أعلن الآن»."

**ملاحظة:** رغم وصف الكوميت بأنه "تكرار"، يمثّل هذا المكوّن نوعاً مستقلاً (wide banner) يختلف وظيفياً وبصرياً عن المكوّن الآخر الباقي (بطاقة inline داخل قسم المنتجات). الـ baseline يحدد الاثنين كـ variants مختلفين.

**توصية الاسترجاع (توصية فقط — لا تنفيذ):**
استعادة القسم المحذوف في `app/page.tsx` بعد قسم `id="stores"` وقبل قسم `id="categories"`:

```tsx
<section className="mx-auto max-w-7xl px-4 pb-8">
  <Link
    href="https://ads.dasm.com.sa/advertise"
    className="relative block overflow-hidden rounded-2xl bg-[#031b1e] px-6 py-5 text-white shadow-lg"
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(45,212,191,.28),transparent_32%),linear-gradient(90deg,rgba(20,184,166,.22),transparent_55%)]" />
    <div className="relative z-10 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-start">
      <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-extrabold">
        أعلن الآن <Megaphone className="h-4 w-4" />
      </span>
      <div>
        <h2 className="text-2xl font-extrabold">مساحة إعلان بانر واسعة</h2>
        <p className="mt-1 text-sm text-emerald-50/75">وصل لآلاف العملاء يوميًا على متاجر داسم</p>
      </div>
      <Target className="hidden h-16 w-16 text-emerald-200 md:block" />
    </div>
  </Link>
</section>
```

---

## تنبيه مسار StorefrontBlocks (تحليل — ليس drift حرج)

كوميت #180 أضاف مساراً شرطياً في `app/[slug]/page.tsx`:
- المتاجر **التي استخدمت Visual Builder** (`hasBuilderLayout()` = true): تُصيَّر عبر `StorefrontBlocks` بدلاً من التخطيط الافتراضي.
- المتاجر **دون builder**: لا تغيير — تستمر بالتخطيط الافتراضي.

**التقييم:** ليس drift على الـ baseline الحالي لأن:
1. المتاجر الافتراضية تحتفظ بتخطيطها.
2. `StorefrontBlocks` هو مسار opt-in — لا يؤثر إلا على متاجر اختارت Visual Builder صراحةً.
3. الـ baseline الموجود (`subdomain-store.png`) وُثّق لمتاجر بالتخطيط الافتراضي.

**الإجراء المقترح:** ينبغي توثيق baseline منفصل لصفحة متجر builder-enabled. أُضيف للـ backlog.

---

## حالة الفجوات البصرية المستمرة (محدَّثة)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| **AdSlot** | **`variant="wide"` (بانر واسع)** | **محذوف** | **drift جديد 2026-06-18 — يستلزم قراراً** |
| Hero (marketplace) | أيقونات مزايا المنصة | غائب | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | غائب | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | غائب | `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | غائب | `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | غائب | `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | غائب | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | غائب | `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## الخطوة التالية

1. **قرار مطلوب:** هل حذف AdSlot `variant="wide"` قرار نهائي (تحديث baseline) أم انحراف يستوجب الاسترجاع؟
   - إذا كان قراراً نهائياً: يُحدَّث `docs/design/baseline/components-inventory.md` ويُحذف `variant="wide"` من التوثيق.
   - إذا كان انحرافاً: يُستعاد القسم المحذوف عبر توصية الاسترجاع أعلاه.
2. **توثيق baseline لـ Visual Builder stores:** مطلوب baseline جديد لصفحة متجر builder-enabled.
3. **المرحلتان 2 و3 مؤجلتان** لهذه الجولة — تُستأنفان في الجولة القادمة.

# تقرير انحراف بصري — baseline-drift-2026-06-26

**تاريخ التشغيل:** 2026-06-26 (جولة أسبوعية — الأحد)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

**يوجد drift جديد.** تم حذف مكوّن "مساحة بانر واسعة" (AdSlot — variant: wide) من صفحة السوق الرئيسية في commit 5f7bf39 بتاريخ 17 يونيو 2026. الـ baseline يُدرج هذا البانر كمكوّن مستقل في `docs/design/baseline/components-inventory.md`.

**قرار المرحلة:** تم رصد drift → يُوقف المرور لمرحلة 2 — ينتظر مراجعة محمد الزهراني.

---

## الكوميتات الجديدة منذ الجولة الأخيرة (2026-06-16)

| الكوميت | التاريخ | الوصف | الملف | التأثير البصري |
|---------|---------|-------|-------|----------------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner on stores home | `app/page.tsx` | **DRIFT** — حذف بانر إعلان واسع |
| `2a4698d` | 2026-06-17 | feat(storefront): visual builder hybrid for store pages | `app/[slug]/page.tsx` | هيكل builder فقط — لا تأثير على non-builder baseline |
| `09dcbe4` | 2026-06-17 | fix(storefront): drop duplicate chrome hero for builder stores | `app/[slug]/layout.tsx` + `StoreHeader.tsx` | `compact` mode لـ builder stores فقط — non-builder غير متأثر |
| `e65d0a0` | 2026-06-21 | fix(storefront): make the products page discoverable in store nav | `StoreHeader.tsx` + `StoreTabsNav.tsx` | **إيجابي** — يُقرّب من baseline (يُضاف "المنتجات" للـ nav) |
| `60fd4bc` | 2026-06-22 | feat(storefront): standard legal footer + policy pages | `StoreFooter.tsx` + `app/[slug]/layout.tsx` | تذييل قانوني — خارج نطاق baseline المتسوق |
| `56ee40c` | 2026-06-23 | fix(storefront): drop intrusive cart-emptied banner | `StoreChrome.tsx` | إزالة banner مزعج — لا علاقة بـ baseline |
| `f13b4c1` | 2026-06-25 | fix(themes): drop fake testimonials & newsletter from templates | `lib/themes/blocks/templates.ts` | قوالب builder فقط — خارج نطاق baseline |

---

## الانحراف المكتشف

### AdSlot — مساحة بانر واسعة (variant: wide) — محذوف

| الحقل | التفصيل |
|-------|---------|
| **المكوّن** | AdSlot — variant `wide` (مساحة بانر واسعة) |
| **الملف** | `app/page.tsx` |
| **السطر (قبل الحذف)** | بعد section `id="stores"` (متاجر مميزة)، قبل section `id="categories"` |
| **وصف بصري دقيق** | شريط داكن عرض كامل (`bg-[#031b1e]`) بتأثير radial gradient تركوازي؛ عنوان "مساحة إعلان بانر واسعة"، نص "وصل لآلاف العملاء يوميًا على متاجر داسم"، زر "أعلن الآن" بلون أخضر، أيقونة Target على اليمين |
| **متى تغيّر** | Commit `5f7bf39` — Wed 2026-06-17 10:18 +0300 |
| **سبب الحذف (من رسالة commit)** | "The marketplace home showed two 'أعلن الآن' advertise banners. Removes the second standalone one." |
| **المرجع في baseline** | `docs/design/baseline/components-inventory.md` — قسم AdSlot، variant: "مساحة بانر واسعة: شريط عرض كامل بنفس أسلوب التركواز المضيء، أيقونة هدف/تأثير بصري، عنوان، جملة وصل لآلاف العملاء، زر 'أعلن الآن'." |

**توصية الاسترجاع (كتوصية فقط — لا تُنفَّذ مباشرة):**

في `app/page.tsx`، بعد إغلاق `</section>` لقسم `id="stores"` (السطر الذي يحتوي `المتاجر مميزة`) وقبل قسم `id="categories"`، يُضاف:

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

## تغيير إيجابي يُقرّب من baseline

### إضافة "المنتجات" لـ nav header المتجر الفرعي

| الحقل | التفصيل |
|-------|---------|
| **الملف** | `components/store/StoreHeader.tsx` |
| **الكوميت** | `e65d0a0` — Sun 2026-06-21 |
| **الوصف** | أُضيف رابط "المنتجات" في شريط التنقل العلوي للمتجر الفرعي (بين "الرئيسية" و"← متاجر داسم") |
| **الأثر على baseline** | يُغلق جزئياً فجوة التنقل الموثّقة — الـ nav أصبح: الرئيسية / المنتجات / ← متاجر داسم |

---

## الفجوات البصرية المستمرة (بلا تغيير عن 2026-06-16)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | غائب | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | غائب | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | spec جاهز `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | غائب | spec جاهز `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | غائب | spec جاهز `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | غائب | spec جاهز `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | غائب | مقبول بقرار التجميد |
| AdSlot (marketplace) | مساحة بانر واسعة | **محذوف** (drift جديد) | يتطلب مراجعة مالك → موثّق في هذا التقرير |
| Store (mobile) | Sticky Cart Bar | غائب | spec جاهز `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |

---

## الخطوة التالية

- **إجراء مطلوب (مالك):** مراجعة حذف "مساحة بانر واسعة" — إما الموافقة رسمياً (تحديث baseline README) أو استعادة البانر عبر PR منفصل.
- **المراحل 2 و3:** مُعلّقة حتى حسم قرار البانر.
- **Cursor specs:** 6 specs معلقة جاهزة للتنفيذ متى أعطت الموافقة — لا تغيير في أولوياتها.

# تقرير انحراف بصري — baseline-drift-2026-07-24

**تاريخ التشغيل:** 2026-07-24 (جولة أسبوعية — الخميس، تأخر عن الأحد بسبب انقطاع)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد — جولة W29)

---

## ملخص تنفيذي

**وُجد 2 انحرافَين جديدَين** منذ آخر جولة (2026-06-16). الانحراف الأول إزالة عنصر baseline موثّق (بانر إعلان واسع). الانحراف الثاني تعديل نسبة أبعاد بطاقة المنتج نحو الأفضل بصرياً.

**قرار المرحلة: STOP — لا تكتمل المرحلتان 2 و3 هذه الجولة.**
المرحلة 2 (منافسون) والمرحلة 3 (spec) مؤجلتان للجولة التالية بعد مراجعة الانحرافات.

---

## الكوميتات الجديدة منذ 2026-06-16 التي تمس ملفات baseline

| الكوميت | التاريخ | الوصف | الملفات المعنية |
|---------|---------|-------|-----------------|
| `5f7bf39` | 2026-06-17 | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` |
| `2a4698d` | 2026-06-17 | feat(storefront): phase 4c — visual builder hybrid | `app/[slug]/page.tsx` |
| `09dcbe4` | 2026-06-21 | fix(storefront): drop duplicate chrome hero for builder stores | `components/store/StoreHeader.tsx` + `app/[slug]/layout.tsx` |
| `8b42fda` | 2026-06-27 | [codex] refactor storefront components to tokens | `components/product/ProductCard.tsx` + `components/store/StoreHeader.tsx` |

---

## الانحرافات الجديدة

### DRIFT-1 — إزالة بانر إعلان واسع من الصفحة الرئيسية (حرج)

| الحقل | القيمة |
|-------|--------|
| **المكوّن** | AdSlot variant=`wide` في الصفحة الرئيسية |
| **الملف** | `app/page.tsx` |
| **الكوميت** | `5f7bf39` (2026-06-17) |
| **الوصف البصري** | الـ baseline يوثّق وجود "مساحة بانر واسعة: شريط عرض كامل بنفس أسلوب التركواز المضيء، أيقونة هدف، عنوان، وصل لآلاف العملاء، زر «أعلن الآن»" أسفل قسم المتاجر المميزة. الشريط أُزيل بالكامل. |
| **الحالة الراهنة** | قسم `<section>` كامل حُذف؛ يبقى الإعلان الإنلاين فقط أسفل شبكة المنتجات |
| **سبب التغيير** | commit message: "الصفحة عرضت بانرَي إعلان مكررَين" — قرار تشغيلي، ليس حادثة |
| **التوصية** | إضافة البانر الواسع كخيار مشروط (`showWideBanner` prop أو config flag) بدلاً من إزالته الكاملة. السطر المحذوف استُعيض عنه بـ: `{showWideBanner && <AdvertiseBanner variant="wide" />}`. **لا تُنفّذ — للـ spec فقط.** |

---

### DRIFT-2 — تغيير نسبة أبعاد صورة بطاقة المنتج (إيجابي — أقرب للـ baseline)

| الحقل | القيمة |
|-------|--------|
| **المكوّن** | `ProductCard` (صفحات المتاجر الفرعية) |
| **الملف** | `components/product/ProductCard.tsx` السطر 27 |
| **الكوميت** | `8b42fda` (2026-06-27) |
| **الوصف البصري** | نسبة أبعاد الصورة تغيّرت من `aspect-square` (1:1 — مربعة) إلى `aspect-[4/5]` (4:5 — طولانية). |
| **مقارنة مع baseline** | الـ baseline يصف "بطاقة عمودية فاتحة" (`components-inventory.md`). الانتقال من مربعة (1:1) إلى طولانية (4:5) هو تقارب نحو الـ baseline البصري، ليس ابتعاداً. |
| **الحكم** | **drift إيجابي / تصحيح** — يُوثَّق لمراجعة صاحب المشروع، لا يُعكس. |
| **ملاحظة إضافية** | نفس الكوميت غيّر شارة "مميز" من `bg-amber-500 text-white rounded-full` (برتقالي صريح) إلى شبه شفاف مع backdrop-blur يعتمد token اللون (`var(--c-accent)`). الـ baseline لا يحدد لون الشارة في سياق المتجر الفرعي — مقبول. |

---

## حالة الفجوات البصرية المستمرة (محدَّث)

| المكوّن | العنصر | الحالة في الكود | القرار |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول بقرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول بقرار التجميد |
| ProductTile (marketplace) | زر سلة دائري (`rounded-full`) | `rounded-xl` في الكود | محل `product-tile-cart-button-2026-06-14.md` — ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | محل `product-tile-wishlist-2026-06-11.md` — ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | محل `product-card-store-wishlist-2026-06-12.md` — ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | محل `store-info-trust-badges-2026-06-08.md` — ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول بقرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | محل `sticky-mini-cart-bar-2026-06-15.md` — ينتظر Cursor |
| Marketplace | AdSlot "بانر واسعة" | **مُزال** | **جديد** — DRIFT-1 هذه الجولة — ينتظر مراجعة |
| ProductCard (store) | نسبة أبعاد الصورة | `aspect-[4/5]` (أقرب للـ baseline) | **جديد** — DRIFT-2 — تصحيح إيجابي |

---

## الخطوة التالية

- **مطلوب من صاحب المشروع:** مراجعة DRIFT-1 (إزالة البانر الواسع) وتحديد القرار: إعادته كـ flag مشروط، أو الاعتراف رسمياً بتعديل الـ baseline.
- إن أُقرّ قرار DRIFT-1 في الجولة القادمة → تُحدَّث `components-inventory.md` وينتقل Design Guardian لمرحلتَي المنافسين والـ spec.
- **W30 specs معلقة:** 6 specs تنتظر Cursor منذ W26–W29 — مراجعة حالتها ضرورية قبل توليد spec جديد.

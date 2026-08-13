# تقرير انحراف بصري — baseline-drift-2026-08-13

**تاريخ التشغيل:** 2026-08-13 (جولة أسبوعية — W32)
**مرجع الـ baseline:** `docs/design/baseline/marketplace-home.png` و `docs/design/baseline/subdomain-store.png`
**التقرير السابق:** `docs/research/baseline-drift-2026-06-16.md` (لا drift جديد)

---

## ملخص تنفيذي

**لا يوجد drift جديد يمنع التقدم.** الكوميتات المؤثرة منذ 2026-06-16 جاءت بتحسينات على الـ marketplace (رفع تصميمي — 013f987) لا رجوعاً عن عناصر الـ baseline. الفجوات البصرية المستمرة لم تتغير في وضعها.

**إنجاز بارز:** مواصفة W29 الخاصة بزر "افتح متجرك" تم تنفيذها بنجاح بواسطة Cursor.

---

## الكوميتات الجديدة منذ 2026-06-16

| الكوميت | الوصف | الملفات المعنية | التأثير البصري |
|---------|-------|----------------|----------------|
| `013f987` | [codex] elevate DASM Stores marketplace homepage | `app/page.tsx` (+778 سطر)، `HomeHeaderActions.tsx` (+25 سطر) | تصميمي إيجابي — لا رجوع عن الـ baseline |
| `2a9372c` | [codex] fix homepage light and dark theme coverage | `app/page.tsx` | تصحيح ثيم — خارج نطاق baseline عناصر |
| `4edbdeb` | feat(ads): صفحة نتائج الإعلانات في لوحة التاجر | `app/` seller dashboard | لوحة تاجر — خارج نطاق baseline المتسوق |
| `8b42fda` | [codex] refactor storefront components to tokens | `components/storefront/` | refactor معمارية — لا أثر بصري على baseline |
| `b95d2b6` | [codex] add storefront theme tokens | `styles/` | إضافة tokens — لا أثر على baseline |
| `60fd4bc` | feat(storefront): legal footer + policy pages | `app/[slug]/p/` | صفحات قانونية — خارج نطاق baseline |
| `09dcbe4` | fix(storefront): drop duplicate chrome hero for builder stores | `app/[slug]/page.tsx` | إصلاح bug — لا رجوع عن الـ baseline |
| `5f7bf39` | fix(marketplace): remove duplicate advertise banner | `app/page.tsx` | إزالة تكرار — محايد |

---

## إنجاز مواصفة W29

| المواصفة | الحالة |
|---------|--------|
| `home-header-seller-cta-2026-06-16.md` | ✅ **مُنفَّذة** |

`HomeHeaderActions.tsx` (سطر 138–144) يعرض الآن لغير المسجلين:
```
[ThemeToggle]  [افتح متجرك ←]  [تسجيل الدخول]  [أيقونة سلة]
```

تفصيل التنفيذ مقارنة بالمواصفة:
- النص: "افتح متجرك" ✅ (مطابق)
- الرابط: `/auth/signup` ✅ (مطابق)
- اللون: `bg-[#0e7c66]` بدلاً من `bg-emerald-600` (متكافئ بصرياً)
- حجم الشاشة: `md:inline-flex` بدلاً من `sm:inline-flex` (محافظ أكثر على المساحة)
- أيقونة `<Store>` مُضافة — تحسين غير مطلوب في الـ spec

---

## حالة الفجوات البصرية المستمرة

| المكوّن | العنصر | الحالة في الكود | المرجع |
|---------|--------|-----------------|--------|
| Hero (marketplace) | أيقونات مزايا المنصة | **غائب** | مقبول — قرار التجميد 2026-06-07 |
| ProductTile (marketplace) | شارة «ممول» | **غائب** | مقبول — قرار التجميد |
| ProductTile (marketplace) | زر سلة دائري `rounded-full` | `rounded-xl` (سطر 237) | `product-tile-cart-button-2026-06-14.md` ينتظر Cursor |
| ProductTile (marketplace) | أيقونة قلب (مفضلة) | **غائب** | `product-tile-wishlist-2026-06-11.md` ينتظر Cursor |
| ProductCard (store pages) | أيقونة قلب (مفضلة) | **غائب** | `product-card-store-wishlist-2026-06-12.md` ينتظر Cursor |
| StoreInfoCard | وسوم ثقة | **غائب** | `store-info-trust-badges-2026-06-08.md` ينتظر Cursor |
| Marketplace footer | StatsBar | **غائب** | مقبول — قرار التجميد |
| Store (mobile) | Sticky Cart Bar | **غائب** | `sticky-mini-cart-bar-2026-06-15.md` ينتظر Cursor |

---

## تغييرات بصرية جديدة — ليست drift بل تطوير

### CommercePassport (013f987)
قسم جديد في hero الـ marketplace يعرض خطوات نمو المتجر للتاجر، مع عداد عدد المتاجر.
- ليس في الـ baseline: نعم — إضافة جديدة لم تتطرق لها الـ baseline
- هل هو رجوع عن عنصر baseline؟ لا
- الحكم: تطوير إيجابي، مقبول

### Hero redesign (013f987)
الـ hero الجديد يستخدم تخطيط عمودين مع CommercePassport بدلاً من التصميم القديم أحادي العمود. شريط البحث انتقل إلى section منفصل أسفل الـ hero.
- هل هو رجوع عن baseline؟ لا — التفاصيل التي تغيرت (شريط بحث في الـ hero، شارة إعلان) كانت مقبولة بقرار التجميد
- الحكم: تطوير إيجابي، مقبول

---

## قرار المرحلة

**لا drift جديد.** لا إيقاف. تكتمل المراحل 2 و3.

# تقرير شامل — ما تمت برمجته في مشروع «متاجر داسم» (dasm-stores)

> آخر تحديث: 2026-06-02. الحالة العامة: **قريب من الإطلاق** — المسار الكامل (تصفّح → متجر → سلة → دفع → شحن → تتبّع) يعمل، مع لوحة تاجر، استيراد، كنترول روم، وربط مالي بالليدجر.

المنظومة تمتد على **ثلاثة ريبوهات**:

| الريبو | الدور | التقنية |
|--------|-------|---------|
| `dasm-stores` | واجهة المتاجر (العميل + لوحة التاجر) | Next.js 16.2.7، React 19، Tailwind v4 |
| `DASM-Platform/backend` | الـAPI + جداول المتاجر | Laravel، قاعدة Services (UUID) |
| `DasmAdminPanel` | الكنترول روم (إشراف) | Next.js (Vercel) |

> فصل قواعد البيانات صارم: **كل جداول `store_*` على قاعدة Services** (`pgsql_services`)، والمستخدمون/المناطق/السيارات والليدجر على **Core**. لا مفاتيح أجنبية متقاطعة — العلاقات (`user_id`, `area_id`, `dasm_car_id`) منطقية بالتطبيق. (تفصيل: `docs/stores/STORES_DATABASE.md`، `docs/stores/STORES_LEDGER_AND_AUTH_ARCHITECTURE.md`.)

---

## 1) واجهة العميل (App Router)

صفحات منشورة على `stores.dasm.com.sa`:

| المسار | الوظيفة |
|--------|---------|
| `/` | اكتشاف المتاجر والمنتجات (هيرو + متاجر مميزة + أقسام + كل المتاجر) |
| `/[slug]` | واجهة المتجر (هيدر/هيرو ديناميكي حسب ثيم التاجر + بطاقة بائع + متابعة) |
| `/[slug]/products` + `/products/[productId]` | شبكة المنتجات وتفاصيل المنتج (معرض صور، متغيّرات، مراجعات) |
| `/[slug]/category/[categorySlug]` | تصفّح حسب القسم |
| `/[slug]/cart` | السلة |
| `/[slug]/checkout` | إتمام الطلب (شحن + دفع) |
| `/[slug]/success` | تأكيد الطلب |
| `/[slug]/track/[orderNumber]` | تتبّع الطلب |

**أساسيات الواجهة:**
- **نظام ثيم بالـtokens** (`styles/globals.css` بقيم `:root` + `.dark`) — كل واجهة المتجر تتكيّف تلقائياً مع الوضع الفاتح/الداكن.
- **مبدّل وضع داكن/فاتح على كل الصفحات** (هيدر الرئيسية + هيدر المتجر)، يحترم تفضيل النظام، يحفظ الاختيار (`stores_theme`)، بلا وميض (سكربت قبل الرسم). *(dasm-stores PR #97)*
- **ثيمات التاجر:** `lib/themes` + `StoreThemeApplier` — ألوان/قوالب لكل متجر عبر `theme_config`/`css_variables`.
- **SEO:** sitemap، Open Graph، JSON-LD (`lib/seo.ts`).
- **تتبّع تسويقي:** `lib/marketing-tracking.ts` + `marketing_config` لكل متجر.
- **معاينة المسوّدة:** `?preview=true` لصاحب المتجر فقط (محمي).
- **طبقة بيانات:** `lib/api.ts` (عميل axios same-origin) + `lib/api-server.ts` (server fetch) — عقد موحّد مع `routes/api/stores.php`.

---

## 2) لوحة التاجر (Pages Router — `/dashboard`)

| الصفحة | الوظيفة |
|--------|---------|
| `index` | لوحة التاجر الرئيسية |
| `products` (list/new/[id]) | إدارة المنتجات |
| `import` | ربط/استيراد من Shopify و Salla (OAuth) |
| `payment` | تهيئة الدفع (Paymob) |
| `shipping` | تهيئة الشحن (Tryoto + أسعار ثابتة) |
| `pos` | تكامل نقطة بيع خارجية (POS) |
| `marketing` | إعدادات التتبّع التسويقي |
| `theme` | اختيار/تخصيص ثيم المتجر |
| `settings` | إعدادات المتجر العامة + الحقول البنكية (IBAN) |

لوحة التاجر فيها وضع داكن كامل (مفتاح `stores_theme` مشترك مع واجهة العميل).

---

## 3) الـAPI (Laravel — `routes/api/stores.php`، ~67 مساراً)

**عامة (بلا مصادقة، مع `OptionalSanctumAuthentication` للمعاينة):**
- `GET /stores/public/explore` و `/products/explore` — اكتشاف.
- `GET /stores/public/{slug}` — واجهة المتجر (تتضمّن الآن ملخّص الشحن `shipping` + `has_payment`).
- `GET /stores/public/{slug}/products|categories`.
- `POST /stores/public/{slug}/shipping-rates` — أسعار Tryoto الحيّة.
- `POST /stores/checkout/{slug}` — إنشاء الطلب وبدء الدفع.
- `GET /stores/track/{slug}/{orderNumber}` + `POST /stores/retry-payment/...`.

**التاجر (`auth:sanctum`، prefix `stores/my-store`):** CRUD المتجر/المنتجات/التبويبات/التصنيفات، تهيئة الدفع والشحن، الاستيراد (Shopify/Salla)، POS، التفعيل، الإحصائيات.

---

## 4) الدفع — Paymob (مفعّل)

- البوابة الوحيدة: **Paymob** (لا WooCommerce/WordPress).
- `CheckoutController::createOrder` يتحقق من تهيئة Paymob (متجر أو منصة) ويولّد `payment_url`، والـwebhook يتحقق من **HMAC** (POST + callback) قبل أي معالجة.
- مهيّأ على مستوى المنصة (متغيّرات `PAYMOB_*` على Render).
- أسرار البوابة لا تُعاد أبداً في JSON (`api_key_encrypted`/`secret_key_encrypted` ضمن `$hidden`).

---

## 5) الشحن — Tryoto + أسعار ثابتة (مربوط)

- `ShippingRateController` يُرجع أسعار **Tryoto** الحيّة (سعر الناقل + هامش التاجر + رسوم المنصة + زيادة الوزن)، أو أسعاراً ثابتة من `store_shipping_config`.
- واجهة المتجر تُصدر الآن ملخّص الشحن في `show()` (`tryoto_enabled`, origin city, markup, extra/kg) فتظهر خيارات Tryoto في صفحة الدفع. *(PR #1634)*
- كل سعر يحمل `buyer_shipping_sar` صراحةً. *(PR #1635)*

---

## 6) الاستيراد — Shopify (Cheerly) + Salla (تجريبي)

- OAuth منفصل لكل مزوّد (`SallaOAuthController` / `ShopifyOAuthController`)، يحفظ الربط في `store_import_connections` (التوكنات مشفّرة ومخفيّة).
- واجهة `/dashboard/import` لإدارة الربط.
- التوكنات (`access_token`/`refresh_token`) لا تُعاد أبداً في JSON.

---

## 7) الكنترول روم (DasmAdminPanel + Platform Ops)

- **تبويب المتاجر** في `/admin/platform-ops` (DASM-Platform) و`control-room/stores` (DasmAdminPanel): قائمة، إحصائيات، تفعيل/تعليق، **حذف نهائي** (تأكيد مزدوج + cascade)، جاهزية الاستيراد.
- معرّفات UUID موحّدة + دومين موحّد `stores.dasm.com.sa/{slug}`. *(DasmAdminPanel PR #37)*
- وضع داكن متّسق في تبويب المتاجر. *(DASM-Platform PR #1630)*

---

## 8) الربط المالي (الليدجر — Core فقط)

- تسوية طلب المتجر المدفوع تمرّ عبر `RecordStoreOrderSettlementAction` → `FinancialLedgerService::record()` مع **idempotency** (مفاتيح بيع/عمولة)، ويربطها الـwebhook تلقائياً.
- **شجرة حسابات المتاجر:** `LIAB_STORE_SELLER_PAYABLE` (مستحقات البائع) + `REV_STORE_COMMISSION` (عمولة المنصة)، وقواعد ترحيل **متوازنة** (two-leg) في `LedgerPostingRuleResolver`. *(PR #1633)*
- الليدجر مصدر الحقيقة المالية؛ لا ليدجر/محافظ على Services.

---

## 9) الأمان (مُدقَّق 2026-06-02)

- **RLS مفعّل على كل جداول `store_*` الـ19** على Services.
- **لا تسريب أسرار** في أي استجابة JSON (دفع/استيراد/POS كلها `$hidden` + allowlists عبر `toPublicArray()`/`toAdminSummary()`).
- **لا تسريب مسوّدات:** المتاجر draft/suspended تُرجع 404 لغير المالك؛ المعاينة محمية بتحقق الملكية.

---

## 10) أهم ما أُنجز في موجة العمل الأخيرة (PRs)

**DASM-Platform:** إصلاح 500 تبويب المتاجر (cross-DB owner/area) #1625+#1627 · زر حذف المتجر #1629 · وضع داكن للأدمن #1630 · محاذاة schema المتاجر #1631 (للمراجعة) · حارس أعمدة Services الدفاعي #1632 · COA + posting المتاجر #1633 · ملخّص الشحن في show() #1634 · تحسينات تدقيق P1/P2 #1635 · إصلاح cross-DB للواجهة العامة #1628.

**dasm-stores:** إزالة ودجة DASM Talk العائمة #96 · مبدّل وضع داكن/فاتح على كل الواجهة #97.

**DasmAdminPanel:** UUID + توحيد دومين المتجر في الكنترول روم #37.

---

## 11) متبقٍّ قبل/حول الإطلاق

- **اشتراك المتاجر:** لا إلزام حالياً (قرار المالك) — يُبنى كمشروع منفصل لاحقاً.
- **schema align (PR #1631):** يُراجَع ثم يُدمَج لإسقاط جداول Core الفارغة المكرّرة (آمن — empty-only).
- **تحسينات اختيارية مؤجَّلة:** حارس العنوان الوطني يقبل `pending` (قرار منتج)؛ مطابقة أسماء أنواع الواجهة (cosmetic)؛ تأكيد أن سياسات RLS مقيِّدة فعلاً ودور التطبيق لا يتجاوزها.
- **Smoke إنتاجي موصى به:** ربط Shopify لـ Cheerly، دورة دفع Paymob كاملة على الجوال، واختيار شحن Tryoto في الدفع.

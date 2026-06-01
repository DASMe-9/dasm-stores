# تقرير شامل — ما تمت برمجته في مشروع «متاجر داسم» (dasm-stores)

> **الريبو:** `DASMe-9/dasm-stores` → الإنتاج: `stores.dasm.com.sa`
> **آخر مرجع للكود:** فرع `fix/shopify-import-oauth-ux` (HEAD: `0bf9d54`)
> **تاريخ التقرير:** 2026-06-02
> **الطبيعة:** واجهة (Storefront + لوحة تاجر) — وليست مصدر الحقيقة المالية

---

## 1) نظرة عامة

`dasm-stores` هو تطبيق **Next.js 16** يمثّل طبقة الواجهة لمنصة المتاجر في داسم. يقدّم ثلاث تجارب رئيسية:

1. **واجهة المتجر العامة (Storefront):** صفحات المتجر، المنتجات، السلة، الدفع، تتبع الطلب — عبر **App Router**.
2. **لوحة التاجر (Seller Dashboard):** إدارة المنتجات، الثيم، الدفع، الشحن، التسويق، الاستيراد، ونقاط البيع — عبر **Pages Router**.
3. **شِل الإدارة + المصادقة:** صفحات دخول/تسجيل/تحقق + SSO + لوحة SEO إدارية.

> **القاعدة المعمارية الحاكمة:** `dasm-stores` = **واجهة فقط**. الهوية والطلبات والمدفوعات والليدجر كلها في **DASM-Core (Laravel)**. البيانات التشغيلية للمتاجر في **DASM-services (Supabase)**. لا يوجد جدول مستخدمين ولا ليدجر ولا محافظ داخل هذا الريبو.

---

## 2) الحزمة التقنية (Tech Stack)

| الطبقة | التقنية |
|--------|---------|
| الإطار | Next.js **16.2.2** (App Router + Pages Router هجين) |
| اللغة | TypeScript 5 · React 19.2 |
| التنسيق | Tailwind CSS 4 (`@tailwindcss/postcss`) |
| إدارة الحالة | Zustand 5 (سلة التسوّق) |
| HTTP | Axios + `fetch` المدمج (SSR/ISR) |
| قاعدة بيانات الواجهة | `@supabase/supabase-js` (بيانات تشغيلية فقط عبر DASM-services) |
| الأيقونات | lucide-react |
| الاختبارات | Playwright (E2E) |
| النشر | Vercel (`vercel.json`) |

---

## 3) المعمارية والتكامل

### 3.1 التوجيه الهجين

- **App Router** (`app/`) → كل صفحات الـ storefront العامة (SSR/ISR لتحسين SEO والأداء).
- **Pages Router** (`pages/`) → لوحة التاجر، المصادقة، الإدارة، وروابط `sitemap.xml`.

### 3.2 المصادقة الموحّدة

- كل تسجيل دخول/تسجيل/تحقق يمرّ عبر **Core API** (`POST /api/login`).
- الواجهة تحفظ `stores_token` (Sanctum) وترسل `Authorization: Bearer` لنداءات `/api/stores/*`.
- لا Supabase Auth ولا SSO redirect خارجي — متوافق مع `unified-login-strategy`.
- ربط المتجر بالمستخدم: `stores.user_id = users.id` (عبر قاعدتي بيانات بدون مفاتيح أجنبية متقاطعة).

### 3.3 طبقة الـ API والبروكسي

| الملف | الوظيفة |
|-------|---------|
| `lib/api.ts` / `lib/api-server.ts` | غلاف نداءات الـ Core API (عميل + خادم/ISR) |
| `lib/platform-api-url.ts` | توحيد أصل الـ API على `api.dasm.com.sa` مع fallbacks |
| `lib/auth-token.ts` | إدارة `stores_token` |
| `proxy.ts` | إعادة توجيه `/store/[slug] → /[slug]`، أسماء بديلة (aliases)، ووضع المعاينة (preview) للمتاجر المسوّدة |

### 3.4 قاعدة البيانات (مرجع)

- مشروع Supabase: `DASM-services` — كل جداول المتجر بمفاتيح UUID.
- نقاط النهاية الفعلية للـ API في `DASM-Platform/backend` (Controllers `Store/`، 19 موديل على اتصال `pgsql_services`).

---

## 4) واجهة المتجر العامة (Storefront — App Router)

| المسار | الملف | الوصف |
|--------|-------|-------|
| `/` | `app/page.tsx` | صفحة الاستكشاف — شبكة المتاجر |
| `/[slug]` | `app/[slug]/page.tsx` | الصفحة الرئيسية للمتجر (hero + منتجات مميزة) |
| `/[slug]/products` | `app/[slug]/products/page.tsx` | كتالوج المنتجات + فلاتر + فرز + ترقيم |
| `/[slug]/products/[productId]` | `.../[productId]/page.tsx` | تفاصيل المنتج + معرض صور + variants + تقييمات |
| `/[slug]/category/[categorySlug]` | `.../category/[categorySlug]/page.tsx` | فلترة حسب التصنيف |
| `/[slug]/cart` | `app/[slug]/cart/page.tsx` | السلة |
| `/[slug]/checkout` | `app/[slug]/checkout/page.tsx` | الدفع + ملخص الطلب |
| `/[slug]/success` | `app/[slug]/success/page.tsx` | تأكيد الطلب + رابط التتبع |
| `/[slug]/track/[orderNumber]` | `.../track/[orderNumber]/page.tsx` | تتبع الطلب بدون تسجيل دخول |

**استراتيجية ISR:** explore 120s · المتجر 300s · المنتجات 60s · المنتج 120s · التصنيفات 600s · التتبع `no-store`.

### المكوّنات الداعمة

- **الاستكشاف:** `StoreGrid`, `StoreCard`, `ExploreSearch` (بحث debounced).
- **المتجر:** `StoreHeader`, `StoreTabsNav`, `StoreSidebar`, `StoreChrome`, `StoreThemeApplier` (حقن CSS variables)، `CartBadge`.
- **المنتجات:** `ProductGrid`, `ProductCard`, `ProductGallery`, `ProductReviews`, `ProductsToolbar`, `ProductsPagination`, `ProductPurchaseSection`.
- **مشترك:** `WhatsAppButton`, `ShareButton`, `LoadingGrid`, `PaymentLogos`.

---

## 5) السلة، الدفع، والشحن

- **سلة Zustand** (`store/cartStore.ts`): مرتبطة بمتجر واحد فقط، مع `persist` في localStorage. مكوّنات `CartDrawer`, `CartPageClient`, `CartBadge`.
- **سلوك إضافة للسلة:** إعادة توجيه إلى السلة بعد الإضافة (#38).
- **الدفع (Checkout):** `CheckoutClient` + `lib/actions/checkout-order.ts`؛ نموذج عميل بعنوان مقسّم (مدينة/حي/شارع/رمز بريدي/العنوان الوطني المختصر SPL) (#42).
- **الشحن الحي:** اختيار أسعار **Tryoto/OTO** مباشرة عبر `/api/stores/public/{slug}/shipping-rates`، مع إرسال `shipping_rate_id` و`shipping_cost` و`delivery_option_id` (#39). دعم الشحن الثابت القديم عبر `shipping_config_id`.
- **شعارات وسائل الدفع** تحت ملخص الفاتورة (#40).
- نموذج الدفع **مُدار من المنصة** (لا اعتمادات مزوّد في الواجهة).

---

## 6) لوحة التاجر (Seller Dashboard — Pages Router)

| الصفحة | الملف | الوظيفة |
|--------|-------|---------|
| الرئيسية | `pages/dashboard/index.tsx` | لوحة المعلومات الرئيسية |
| المنتجات | `pages/dashboard/products/index.tsx` · `new.tsx` · `[id].tsx` | قائمة + إضافة + تعديل بنمط Shopify + زر تفعيل |
| الإعدادات | `pages/dashboard/settings.tsx` | صفحة **الجاهزية** الموحّدة (هوية المتجر، التحقق، SPL، الثيم، الشحن، الدفع/الصرف) |
| الثيم | `pages/dashboard/theme.tsx` | منتقي الثيمات (مجاني دائماً) |
| الدفع | `pages/dashboard/payment.tsx` | نموذج الدفع المُدار من المنصة |
| الشحن | `pages/dashboard/shipping.tsx` | إعدادات الشحن |
| التسويق | `pages/dashboard/marketing.tsx` | بكسلات التتبع (TikTok/Snap/…)  |
| الاستيراد | `pages/dashboard/import.tsx` | معالج استيراد Salla/Shopify + CSV |
| نقاط البيع | `pages/dashboard/pos.tsx` | لوحة كاشير POS + تكامل POS خارجي |

### المكوّنات والقشرة

- `components/seller/SellerShell.tsx` — قشرة لوحة التاجر (مع إخفاء الودجات العائمة Talk/Vercel على شِل البائع).
- `components/seller/StoreNewWizard.tsx` — معالج إنشاء متجر بنمط Shopify.
- `components/seller/NationalAddressCard.tsx` — بطاقة العنوان الوطني (SPL) الإلزامية.
- `components/AdminShell.tsx` — قشرة الإدارة.
- مبدّل المتاجر (Store Switcher) لأصحاب المتاجر المتعددة (#68).

---

## 7) نظام الثيمات (Theme System)

- **كتالوج 32 ثيم جاهز** في `lib/themes/presets.ts` (قطاعات: automotive / general / mixed) قابل للتوسّع إلى 100+.
- البنية في `lib/themes/`: `types.ts`, `presets.ts`, `resolve-theme-id.ts`, `resolve-store-theme.ts`, `to-store-theme.ts`, `color-contrast.ts`, `product-card-class.ts`.
- مكوّنات: `ThemePicker`, `ThemePreviewStorefront`, `StoreThemeApplier` (حقن `css_variables` في `:root`).
- يُرسَل `theme_preset` (slug) بدل `theme_id` القديم.
- الثيمات **مجانية للأبد** — سطح جودة وUX وليس سوقاً مدفوعاً.

---

## 8) الاستيراد من المنصّات (Migration / Import)

| المعلم | الميزة |
|--------|--------|
| **M2.4** | صفحة ربط استيراد **Salla** |
| **M2.6** | معاينة تجريبية (dry-run) لاستيراد Salla |
| **M4** | واجهة بائع لاستيراد **Shopify** |
| **M4.1/M4.2** | بكسلات TikTok/Snap + واجهة ترحيل CSV |
| الأحدث | **معالج ترحيل Shopify** على صفحة الاستيراد + تحسينات OAuth/دومين Cheerly |

---

## 9) نقاط البيع (POS)

| المعلم | الميزة |
|--------|--------|
| **M5.0** | لوحة كاشير POS |
| **M5.1** | واجهة تكامل POS خارجي |

---

## 10) التتبع التسويقي و SEO

- **التتبع:** `lib/marketing-tracking.ts` + `StoreTrackingPixels`, `ProductViewTracker`, `CheckoutSuccessTracker` (دعم بكسلات TikTok/Snap).
- **SEO:** أساس متكامل (`lib/seo.ts`) — sitemap (`pages/sitemap.xml.ts`)، robots، JSON-LD (Product/Schema.org)، ميتا افتراضية، وروابط canonical.
- **لوحة SEO إدارية:** `pages/admin/seo.tsx` — أداء Google Search Console لـ `stores.dasm.com.sa`.

---

## 11) تكامل DASM Talk والإعلانات

- **DASM Talk:** `components/TalkStoreContext.tsx` + `components/home/TalkOpenButton.tsx` — وضع نص + صوت، مع حقن `widget.js` (غير حاجب لإنشاء المتجر).
- **DASM Ads:** `components/ads/AdBanner.tsx` — استبدال هيدر اللوحة ببانر ترويجي.
- **التواصل الاجتماعي:** `components/social/ProfileFollowButton.tsx` (مع fallback متوافق مع أصل المنصة).

---

## 12) المصادقة والصفحات الإدارية

| المسار | الملف |
|--------|-------|
| تسجيل الدخول | `pages/auth/login.tsx` (تصميم عمودين + ثيم المتجر) |
| التسجيل | `pages/auth/signup.tsx` (نية واحدة: **صاحب متجر**) |
| التحقق من البريد | `pages/auth/verify-email.tsx` · `pages/verify-email.tsx` |
| إعادة ضبط كلمة المرور | `pages/auth/reset-password.tsx` |
| SSO | `pages/auth/sso.tsx` |
| إنشاء متجر (API) | `pages/api/stores/create.ts` + `pages/stores/new.tsx` |

مكوّنات داعمة: `SyncStoresAuthCookie`, `OwnerPreviewRecovery` (استرجاع معاينة المتجر المسوّد لصاحبه).

---

## 13) الاختبارات والجودة

- **Playwright E2E:** `e2e/cheerlylive-production.spec.ts` (سموك إنتاج لمعاينة المسوّدة) + `e2e/helpers/owner-auth.ts`.
- أوامر: `npm run test:e2e` و `test:e2e:ui`.
- ESLint 9 + `eslint-config-next`.

---

## 14) الجدول الزمني للمعالم (من سجل Git)

```
الأساس        → SEO foundation (sitemap/robots/JSON-LD) · DASM Talk widget · إنشاء متجر + API
التوجيه       → storefront على الجذر /<slug> (إسقاط بادئة /store/)
المتجر        → App Router storefront + Seller Shell + معالج إنشاء + SSO
اللوحة        → توحيد تصميم اللوحة مع منصة داسم · صفحات منتجات · رفع صور · إعدادات دفع
الواجهة       → إعادة تصميم صفحة الاستكشاف (mobile-app) · صفحة منتج · تأكيد طلب
الثيمات       → 32 ثيم جاهز + تنظيف معماري · Theme Builder (/dashboard/theme)
الدفع         → نموذج مُدار من المنصة · شعارات الدفع · عنوان مقسّم + SPL
الشحن         → اختيار سعر Tryoto حي
الجاهزية      → صفحة إعدادات البائع الموحّدة + بطاقة العنوان الوطني (SPL)
M2.4/M2.6     → استيراد Salla (ربط + معاينة تجريبية)
M4/M4.1/M4.2  → استيراد Shopify + بكسلات TikTok/Snap + ترحيل CSV
M5.0/M5.1     → POS كاشير + تكامل POS خارجي
الأحدث        → معالج ترحيل Shopify · توحيد أصل API على api.dasm.com.sa · إصلاحات معاينة المالك
```

---

## 15) الليدجر والحدود (ما لا يفعله هذا الريبو)

وفق `STORES_LEDGER_AND_AUTH_ARCHITECTURE.md`، يُمنع داخل `dasm-stores` / DASM-services:

- ⛔ أي **ليدجر** أو **محافظ** (تبقى في Core؛ الليدجر = مصدر الحقيقة، المحفظة عرض مشتق).
- ⛔ جدول **مستخدمين** موازٍ أو كلمات مرور أو مصدر صلاحيات.
- ⛔ تغييرات اعتمادات مزوّدي الدفع أو migrations مالية من الواجهة.
- الليدجر الفرعي للمتاجر (`store_sale_received`, `store_commission`, `store_payout`) يُنفّذ في **DASM-Core** ويشرف عليه الليدجر العام.

---

## 16) الحالة الحالية والخطوات المقترحة

**مكتمل:** Storefront كامل + لوحة تاجر + 32 ثيم + استيراد Salla/Shopify + POS + شحن Tryoto حي + SEO + تكامل Talk/Ads.

**متبقٍ (على Core أساساً، حسب خطة الترحيل):**

1. توحيد `StoreCommissionService` عبر `FinancialLedgerService` + idempotency.
2. إضافة COA codes للمتاجر (`REV_STORE_COMMISSION`, `LIAB_STORE_SELLER_PAYABLE`).
3. ربط webhook دفع المتجر بمسار تسجيل واحد (بيع + عمولة).
4. عرض رصيد التاجر من projection فقط في اللوحة (لا حساب محلي).
5. النقل التدريجي لجداول `store_*` إلى schema `stores`.

---

---

## 17) جداول قاعدة البيانات ومكان تخزينها

> **مصدر الحقيقة للمخطط:** Migrations في `DASM-Platform/backend/database/migrations/*store*` + الموديلات في `backend/app/Models/Store*.php`.
> **ملاحظة:** Supabase MCP غير متاح في هذه الجلسة، لذا الجدول أدناه مُستخرج من تعريفات الـ migrations والموديلات (وهي مصدر الحقيقة)، وليس من استعلام حيّ على قاعدة الإنتاج. أي تحقق نهائي من الإنتاج يتطلب وصولاً مباشراً للـ DB.

### 17.1 خريطة التخزين العامة

| النطاق | قاعدة البيانات | الاتصال | المفتاح |
|--------|----------------|---------|---------|
| **بيانات المتاجر التشغيلية** (كل جداول `store_*` و`stores`) | **DASM-services** (Supabase: `bmfqfmsxtotdksvcqfrh`) | `pgsql_services` | **UUID** |
| **الهوية** (`users`, `areas`) | **DASM-Core** | `pgsql` (الافتراضي) | bigint |
| **السيارات** (`cars`) للربط `dasm_car_id` | **DASM-Core** | `pgsql` | bigint |
| **الليدجر/المحافظ/التسويات** | **DASM-Core** فقط | `pgsql` | — |

### 17.2 الجداول التشغيلية للمتاجر (19 جدول — كلها على DASM-services / `pgsql_services`)

| # | الجدول | الغرض | حقول رئيسية |
|---|--------|-------|-------------|
| 1 | `store_themes` | كتالوج الثيمات | `slug`, `template_config`, `css_variables`, `category`, `is_free`, `status` |
| 2 | `store_subscription_plans` | باقات الاشتراك | `slug`, `price_monthly/yearly`, `max_products`, `max_tabs`, `features` |
| 3 | `stores` | المتجر | `user_id`(→Core), `name`, `name_ar`, `slug`, `category`, `logo/banner_url`, `theme_id`, `theme_config`, `marketing_config`, `status`, `owner_type`, `area_id`(→Core), شحن Tryoto، حقول بنكية |
| 4 | `store_tabs` | تبويبات المتجر | `store_id`, `name`, `slug`, `icon`, `sort_order`, `is_active` |
| 5 | `store_categories` | تصنيفات هرمية | `store_id`, `tab_id`, `parent_id`, `name`, `slug`, `image_url` |
| 6 | `store_products` | المنتجات | `store_id`, `category_id`, `name`, `slug`, `sku`, `price`, `compare_at_price`, `status`, `track_stock`, `stock_quantity`, `import_provider`, `import_external_id`, `dasm_car_id`(→Core) |
| 7 | `store_product_images` | صور المنتج | `product_id`, `url`, `alt_text`, `is_primary` |
| 8 | `store_product_variants` | متغيرات المنتج | `product_id`, `option_values`, `price`, `stock_quantity` |
| 9 | `store_payment_config` | إعدادات الدفع | `store_id`, `provider`, `api_key_encrypted`, `secret_key_encrypted`, `is_live` |
| 10 | `store_shipping_config` | الشحن الثابت (legacy) | `store_id`, `provider`, `flat_rate`, `free_above_amount`, `estimated_days` |
| 11 | `store_orders` | الطلبات | `store_id`, `order_number`, `import_external_ref`, `customer_*`, `subtotal/total`, `platform_commission`, `seller_amount`, `payment_status`, `shipping_address`(json) |
| 12 | `store_order_items` | بنود الطلب | `order_id`, `product_id`, `variant_id`, `quantity`, `unit/total_price` |
| 13 | `store_reviews` | تقييمات | `store_id`, `product_id`, `rating`, `is_published`, `seller_reply` |
| 14 | `store_coupons` | كوبونات | `store_id`, `code`, `type`, `value`, `usage_limit/count`, `expires_at` |
| 15 | `store_order_status_logs` | تدقيق حالات الطلب | `order_id`, `from/to_status`, `admin_user_id` |
| 16 | `store_import_connections` | ربط Salla/Shopify (OAuth) | `store_id`, `provider`, `external_store_id`, `access/refresh_token`, `last_sync_*` |
| 17 | `store_import_runs` | تشغيلات الاستيراد | `connection_id`, `status`, `products_imported/skipped`, `errors` |
| 18 | `store_marketing_contacts` | جهات تسويق (CSV) | `store_id`, `source`, `email`, `phone`, `accepts_marketing` |
| 19 | `store_pos_integrations` | تكامل POS خارجي | `store_id`, `provider`, `secret_hash`, `secret_prefix`, `is_enabled` |

> **الأمان:** فُعِّل **RLS** على جداول services عبر migrations (`enable_stores_rls_on_services`, `enable_rls_store_tables_services`, `enable_rls_store_import_connections_services`) + RLS على جداول financial في Core (`enable_rls_p3_core_store_financial_tables`). أسرار الدفع/الاستيراد مخزّنة كـ `*_encrypted` / `secret_hash`.

---

## 18) هل الحقول في Postgres مكتملة أم تحتاج إكمال؟

الخلاصة: **المخطط مكتمل وظيفياً لتشغيل المتجر end-to-end**، لكن توجد **فجوات اتساق (consistency) وحقول تحتاج تحقق/إكمال**. مرتّبة بالأولوية:

### 🔴 P0 — فجوات اتساق حقيقية (تحتاج إكمال/توثيق)

| # | المشكلة | التفصيل | الإصلاح المطلوب |
|---|---------|---------|------------------|
| 1 | **bigint مقابل UUID** | migration الإنشاء الأساسي `create_dasm_storefront_tables` يستخدم `$table->id()` (bigint) و`foreignId(...)->constrained()` على الاتصال **الافتراضي (Core)**، بينما جداول الإنتاج على **services** بمفاتيح **UUID** (الموديل: `incrementing=false, keyType=string`؛ راوتس الأدمن `whereUuid`). | توحيد: إمّا migration إنشاء مخصّص لـ services بـ UUID، أو توثيق أن جداول services تُزوّد بمسار منفصل واعتبار الـ migration الأساسي خاصاً بـ Core legacy فقط. |
| 2 | **مفاتيح أجنبية متقاطعة قواعد البيانات** | `stores.user_id → users`, `stores.area_id → areas`, `store_products.dasm_car_id → cars` كلها تشير إلى **Core** بينما الصفوف في **services** → القيد **منطقي فقط** وغير مُنفَّذ على مستوى DB. | لا قيود FK ممكنة عبر قاعدتين؛ يجب ضمان السلامة على مستوى التطبيق + توثيقها صراحة (موجود جزئياً في `STORES_DATABASE.md`). |
| 3 | **`theme_id`: UUID مقابل bigint** | `update()` في `SellerStoreController` يتحقق `theme_id` كـ `uuid`، لكن seed الـ migration الأساسي يزرع `store_themes.id` كأرقام 1..20. | تأكيد أن `store_themes` على services بـ UUID (migration `expand_dasm_store_theme_catalog` يُفترض يوحّدها) — **يحتاج تحقق حيّ**. |

### 🟠 P1 — حقول تحتاج تحقق وجودها على الإنتاج (services)

| الحقل/الجدول | الحالة | ملاحظة |
|--------------|--------|--------|
| `stores.iban` / `bank_name` / `account_holder_name` | معرّفة في migration الأساسي (Core) + `fillable` | **لم تُعَد إضافتها** عبر ALTER على services مثل بقية الحقول → تحقّق أنها موجودة فعلاً على services. |
| `stores.area_id` ↔ `areas` | الأدمن يحل أعمدة `areas` ديناميكياً (`AdminStoreAreaColumnsTest`) لأن إنتاج `areas` فيه `name` فقط (لا `name_ar/name_en`) | سلوك دفاعي صحيح، لكنه يكشف عدم تماثل مخطط `areas` بين البيئات. |
| `stores.subscription_plan_id` | FK لـ `store_subscription_plans` | يُزرع plan واحد فقط (`starter`)؛ لا ربط فعلي إجباري بعد. |

### 🟢 P2 — مكتمل ولا يحتاج عمل

- دورة الحياة الكاملة: `stores → tabs → categories → products → images/variants → orders → order_items → reviews/coupons`.
- المخزون (`track_stock`, `stock_quantity`) + idempotency للاستيراد (`import_provider/external_id`, `import_external_ref`).
- التتبّع التسويقي (`marketing_config` مخفي في الموديل عبر `$hidden`).
- تدقيق حالات الطلب (`store_order_status_logs`) + POS (`store_pos_integrations`).

---

## 19) تفاصيل الباك اند (DASM-Platform)

### 19.1 الموديلات (19) — كلها `protected $connection = 'pgsql_services'`
`Store, StoreTheme, StoreSubscriptionPlan, StoreTab, StoreCategory, StoreProduct, StoreProductImage, StoreProductVariant, StorePaymentConfig, StoreShippingConfig, StoreOrder, StoreOrderItem, StoreReview, StoreCoupon, StoreOrderStatusLog, StoreImportConnection, StoreImportRun, StoreMarketingContact, StorePosIntegration`.

### 19.2 الكنترولرات
- **عامة:** `PublicStoreController` (explore/show/products/productDetail/categories), `ShippingRateController`, `CheckoutController` (createOrder/paymentWebhook/trackOrder/retryPayment).
- **التاجر (`auth:sanctum`):** `SellerStoreController`, `SellerProductController`, `SellerTabController`, `SellerCategoryController`, `SellerOrderController`, `SellerPaymentConfigController`, `SellerShippingConfigController`, `SellerStoreImportController`, `SellerStoreMigrationController`, `SellerMarketingController`, `SellerPosController`.
- **OAuth/Webhooks:** `SallaOAuthController`, `SallaWebhookController`, `ShopifyOAuthController`, `ExternalPosWebhookController`.
- **الأدمن:** `Admin\AdminStoreController` (index/stats/importReadiness/show/createForUser/action).

### 19.3 الخدمات (Services) والوحدات
`StoreCheckoutService`, `StorePaymentGateway`, `StoreCommissionService`, `StoreStockService`, `StorePosService`, `StorePosIntegrationService`, `StoreMarketingConfigService`, `StoreCsvMigrationService`, `StoreImportReadinessService`, `StoreProvisionService` + `Modules\Ledger\...\Stores\RecordStoreOrderSettlementAction` + `Policies\Store\SellerStorePolicy` + `Observers\StoreTalkObserver`.

### 19.4 المسارات (`routes/api/stores.php`)
- `GET stores/public/{explore|products/explore|{slug}|{slug}/products|{slug}/products/{id}|{slug}/categories}` + `POST {slug}/shipping-rates` (middleware: `OptionalSanctumAuthentication`).
- `POST stores/checkout/{slug}` · `POST stores/webhook/payment` · `GET stores/track/{slug}/{orderNumber}` · `POST stores/retry-payment/...`.
- `auth:sanctum` → `stores/my-stores` + مجموعة `stores/my-store/*` (store/products/tabs/categories/orders/payment-config/shipping-config/import/marketing/pos).
- مسارات منصّة OAuth2 (`platform/oauth/token`) + `platform/stores/activation-request`.

---

## 20) صحة الربط بين الفرونت والباك اند

| المسار في الفرونت | endpoint الباك اند | الحالة |
|--------------------|--------------------|--------|
| `app/page.tsx` (explore) | `GET /api/stores/public/explore` | ✅ متطابق |
| `app/[slug]/*` (storefront) | `show/products/productDetail/categories` | ✅ متطابق |
| `CheckoutClient` + `checkout-order.ts` | `POST /api/stores/checkout/{slug}` + `shipping-rates` | ✅ متطابق (عقد Tryoto: `shipping_rate_id/cost/delivery_option_id`) |
| `track/[orderNumber]` | `GET /api/stores/track/{slug}/{orderNumber}` | ✅ متطابق |
| لوحة التاجر (`pages/dashboard/*`) | `auth:sanctum` `stores/my-store/*` عبر `Bearer stores_token` | ✅ متطابق |

**الخلاصة:** الربط الوظيفي **صحيح** ومتطابق العقود. المصادقة موحّدة عبر Core (Bearer)، والـ proxy يتعامل مع المعاينة وإعادة التوجيه.

---

## 21) صحة نشر المتاجر (Publication Flow)

التدفق **صحيح وآمن**:

1. **إنشاء:** `POST stores/my-store` → الحالة `draft`، اشتراك `trial`، تجربة 30 يوم، عمولة 0.02، رسوم 25 ر.س. (لا إنشاء تلقائي لغير `venue_owner`).
2. **تفعيل ذاتي (التاجر):** `POST stores/my-store/activate` يشترط:
   - تسجيل **العنوان الوطني المختصر (SPL)** (`national_address_short` + الحالة `verified`/`pending`).
   - وجود **منتج نشط واحد على الأقل**.
   - عندها فقط → `status = active`.
3. **تفعيل/تعليق إداري:** `POST /api/admin/stores/{id}/action` (`activate|suspend|approve`).
4. **الظهور العام:** `PublicStoreController::show` يخدم المتاجر `active` فقط؛ المسوّدة تظهر لصاحبها عبر **وضع المعاينة** (هيدر `x-dasm-store-preview` من `proxy.ts` + `OwnerPreviewRecovery`).
5. **التزويد:** `venue_owner` → `UserObserver::provisionStore`؛ e-commerce → `AdminStoreController::createForUser` (idempotent) أو معالج `StoreNewWizard`.

✅ النشر سليم. ⚠️ ملاحظة: شرط «منتج نشط واحد» + SPL يمنع نشر متجر فارغ — سلوك مقصود جيّد.

---

## 22) الربط مع الكنترول روم ولوحة المسؤول

**الربط صحيح ويعمل عبر سلسلة proxy:**

```
DasmAdminPanel: pages/admin/control-room/stores.tsx
   → fetch('/api/stores/list' | '/stats' | '/action' | '/import-readiness')   (Next API route)
      → DASM_PLATFORM_API_URL/api/admin/stores[...]  (Core، مع Bearer)
         → Admin\AdminStoreController
```

- صفحات الكنترول روم للمتاجر: `stores.tsx` (إدارة/تفعيل/تعليق + جاهزية الاستيراد + KPIs)، `store-orders.tsx` (طلبات موحّدة)، `ecommerce.tsx`.
- KPIs: إجمالي/نشط/مسودة/موقوف، طلبات اليوم، متصل بسلة، الإيرادات — من `GET /api/admin/stores/stats`.
- بوابة الصلاحيات: `ControlRoomGate` + `access === 'full'` لإظهار أزرار الإجراء؛ صلاحيات الأدمن مزروعة عبر `seed_store_admin_permissions`.

### ⚠️ ملاحظات تحتاج إصلاح في لوحة المسؤول (لا تعطّل التشغيل لكنها مخاطر)

| # | المشكلة | المكان | الأثر |
|---|---------|--------|-------|
| 1 | **نوع `id` خاطئ** | `stores.tsx`: `StoreRow.id: number` و`doAction(id: number)` بينما المعرّفات **UUID (string)** وراوت الأدمن `whereUuid('id')` | يعمل وقت التشغيل (JS يمرّر النص) لكن النوع مضلّل وقد يكسر أي منطق رقمي مستقبلاً → غيّره إلى `string`. |
| 2 | **عدم اتساق الدومين** | `stores.tsx`: `STORES_BASE = "https://store.dasm.com.sa"` (مفرد) ورابط `/store/${slug}` (بادئة legacy) بينما `dasm-stores` يخدم على `stores.dasm.com.sa` (جمع) بالجذر `/${slug}` | الـ proxy يعيد توجيه `/store/<slug>→/<slug>` (308)، لكن مفرد/جمع الدومين خطر التوجيه — وحّد على `stores.dasm.com.sa`. |
| 3 | **`whereUuid` في عدة راوتس** | `admin/stores/{id}` و`{id}/action` | متوافق مع UUID؛ تأكّد أن أي استدعاء من الفرونت يمرّر UUID فعلياً (يفعل). |

---

## 23) برومبتات قوية جاهزة لأي ذكاء صناعي آخر

> انسخ البرومبت كما هو. كلها مكتوبة لتكون مستقلة وقابلة للتنفيذ بأدلة من هذا الريبو.

### 🧩 برومبت 1 — توحيد مخطط bigint/UUID (P0)

```
السياق: منصة DASM. جداول المتاجر (store_*, stores) تعيش على قاعدة DASM-services (اتصال Laravel: pgsql_services) بمفاتيح UUID. الموديلات في backend/app/Models/Store*.php تستخدم incrementing=false و keyType=string، وراوتس الأدمن في routes/api/admin.php تستخدم whereUuid('id'). لكن migration الإنشاء backend/database/migrations/2026_05_23_000001_create_dasm_storefront_tables.php يستخدم $table->id() (bigint) و foreignId()->constrained() على الاتصال الافتراضي (Core).
المطلوب:
1. حدّد بدقة (عبر استعلام معلومات المخطط على pgsql_services) النوع الفعلي لـ id في كل جدول store_* و stores و store_themes.
2. إن كانت UUID فعلاً: أنشئ migration توثيقي/تصحيحي لا يكسر البيانات، يجعل تعريف Laravel متوافقاً (uuid PK + غياب FK المتقاطعة)، واجعل migration الإنشاء الأصلي مشروطاً بأنه Core-only أو احذفه إن لم يَعُد مستخدماً.
3. لا تُنشئ FK متقاطعة بين قاعدتين. وثّق العلاقات المنطقية (user_id, area_id, dasm_car_id) في docs/stores/STORES_DATABASE.md.
قيود: ممنوع لمس الليدجر/المحافظ. اختبر بـ backend/tests/Feature/Store/*. سلّم migration + تحديث docs فقط.
```

### 🧩 برومبت 2 — تدقيق وجود الحقول البنكية وحقول services (P1)

```
على قاعدة DASM-services (pgsql_services) لمنصة DASM، تحقّق من وجود الأعمدة التالية فعلياً على جدول stores: iban, bank_name, account_holder_name, marketing_config, name_ar, category, tryoto_shipping_enabled, shipping_origin_city, shipping_markup_sar, shipping_extra_per_kg_sar, parcel_length_cm/width_cm/height_cm. هذه الحقول معرّفة في الموديل App\Models\Store ($fillable) لكن بعضها (الحقول البنكية) أُضيف فقط في migration الإنشاء على Core ولم يُعَد عبر ALTER على services.
المطلوب: لكل عمود ناقص، أنشئ migration آمن guarded بـ Schema::connection('pgsql_services')->hasColumn(...) يضيفه. لا تكرّر الأعمدة الموجودة. سلّم migration واحد + قائمة بالأعمدة التي كانت ناقصة فعلاً.
```

### 🧩 برومبت 3 — إصلاح نوع المعرّف والدومين في الكنترول روم (P1)

```
في ريبو DasmAdminPanel، ملف pages/admin/control-room/stores.tsx:
1. معرّفات المتاجر UUID (string) وليست أرقام. غيّر النوع StoreRow.id إلى string ودالة doAction(id: string)، وأي مكان يعامل id كرقم.
2. وحّد الدومين: STORES_BASE يجب أن يكون "https://stores.dasm.com.sa" (جمع) ورابط المتجر يجب أن يكون `${STORES_BASE}/${slug}` (بدون بادئة /store/ القديمة) لمطابقة proxy.ts في dasm-stores.
قيود: لا تغيّر منطق الصلاحيات (ControlRoomGate/access). تحقّق بـ tsc/eslint. سلّم diff فقط.
```

### 🧩 برومبت 4 — توحيد StoreCommissionService مع الليدجر العام (P0 على Core)

```
في DASM-Platform، App\Services\Store\StoreCommissionService يكتب FinancialLedgerEntry مباشرة. وفق docs/stores/STORES_LEDGER_AND_AUTH_ARCHITECTURE.md يجب توحيده عبر App\Modules\Ledger\...\FinancialLedgerService::record() مع idempotency، وإضافة COA codes للمتاجر (REV_STORE_COMMISSION, LIAB_STORE_SELLER_PAYABLE) في LedgerCoaCodes + قواعد posting في LedgerPostingRuleResolver. الليدجر يبقى على Core فقط؛ لا ليدجر/محافظ في services.
المطلوب: أعد توجيه التسجيل عبر FinancialLedgerService، أضف COA + posting rules، اربط webhook دفع المتجر بمسار تسجيل واحد (بيع + عمولة) عبر RecordStoreOrderSettlementAction. اكتب اختبارات في tests/Unit/Modules/Ledger/Stores/ و tests/Feature/Internal/DasmStoresSettlementInternalTest.php. لا تكسر التوازن (UnbalancedJournalPostingException).
```

### 🧩 برومبت 5 — تدقيق شامل لجاهزية الإنتاج (Audit)

```
دقّق منظومة متاجر DASM عبر ثلاثة ريبوهات: dasm-stores (واجهة Next.js)، DASM-Platform/backend (Laravel API + جداول services)، DasmAdminPanel (الكنترول روم). تحقّق من:
1. تطابق عقود الـ API بين دوال lib/api*.ts في dasm-stores و routes/api/stores.php.
2. أن كل جداول store_* لها RLS مفعّل على services (migrations enable_rls_*).
3. أن تدفق النشر (draft→active) يفرض SPL + منتج نشط (SellerStoreController::activate) وأن PublicStoreController::show لا يسرّب المسوّدات إلا لصاحبها عبر هيدر المعاينة.
4. أن أسرار الدفع/الاستيراد لا تُعاد أبداً في JSON (api_key_encrypted, secret_hash, access_token).
سلّم تقرير مخاطر مرتّب P0/P1/P2 مع رقم سطر لكل بند، دون تعديل كود.
```

---

## 24) ملخص تنفيذي للحالة

| المحور | الحالة |
|--------|--------|
| الجداول التشغيلية (19) | ✅ مكتملة وظيفياً على services (UUID + RLS) |
| اكتمال الحقول | 🟠 فجوات اتساق bigint/UUID + تحقق حقول بنكية على services |
| الباك اند (controllers/services/routes) | ✅ مكتمل وغني |
| الفرونت ↔ الباك اند | ✅ العقود متطابقة |
| نشر المتاجر | ✅ صحيح وآمن (SPL + منتج نشط + معاينة المالك) |
| الكنترول روم/لوحة المسؤول | ✅ مربوط، ⚠️ نوع id=number خطأ + عدم اتساق دومين |
| الليدجر | 🟠 يحتاج توحيد StoreCommissionService على Core (خارج هذا الريبو) |

---

*أُعدّ هذا التقرير آلياً من مراجعة كود وتوثيق ريبوهات `dasm-stores` + `DASM-Platform/backend` + `DasmAdminPanel`. الجداول والحقول مُستخرجة من الـ migrations والموديلات (مصدر الحقيقة للمخطط). التحقق النهائي من قاعدة الإنتاج يتطلب وصولاً مباشراً لـ Supabase. المرجع المعماري الأعلى في `docs/stores/`.*

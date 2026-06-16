# DASM Stores Platform Bridge

هذا الملف هو المرجع المختصر لربط منصة DASM Core مع واجهة `dasm-stores`.
استخدمه قبل تعديل الدخول، اختيار المتجر، لوحة التاجر، أو الثيمات.

## النطاق

- `dasm-stores` هو واجهة المتاجر المستقلة على `stores.dasm.com.sa`.
- الهوية وصلاحيات المستخدمين تبقى في DASM Core.
- بيانات المتاجر التشغيلية تعيش في DASM-services عبر اتصال Laravel `pgsql_services`.
- لا يوجد جدول مستخدمين مستقل ولا كلمات مرور مستقلة داخل DASM-services.

## عقد الهوية

- الدخول المباشر من صفحة متاجر داسم يستخدم Core API.
- الانتقال من منصة DASM Core إلى المتاجر يستخدم:
  - `GET /auth/sso?token=<core-token>&return_url=/dashboard?store_id=<id>`
  - صفحة `pages/auth/sso.tsx` تتحقق من التوكن عبر Core endpoint:
    - `GET /api/user`
- بعد نجاح التحقق:
  - يحفظ توكن Core في تخزين المتاجر عبر `stores_token`.
  - يحفظ بيانات المستخدم الخفيفة في `stores_user`.
  - يحفظ المتجر المختار في `dasm_selected_store_id` إذا وصل `store_id`.
- أي فشل أو توكن مفقود يجب أن ينظف جلسة المتاجر القديمة قبل التحويل إلى `/auth/login`.

## اختيار المتجر

- المستخدم الواحد قد يملك أكثر من متجر.
- المتجر المختار يحفظ في:
  - localStorage key: `dasm_selected_store_id`
  - request header: `X-DASM-Store-Id`
- `lib/api.ts` يضيف `X-DASM-Store-Id` تلقائيا لطلبات:
  - `/my-store`
  - `/my-stores`
- `components/seller/SellerShell.tsx` يعرض مبدل المتاجر ويستخدم المتجر المحفوظ إذا كان ضمن متاجر المستخدم.

## جسر منصة DASM Core

صفحة Core:

- `frontend/app/dashboard/dasm-stores/page.tsx`

العقد المطلوب:

- تقرأ كل متاجر المستخدم من:
  - `GET /api/stores/my-stores`
- تختار المتجر النشط حسب:
  - `selected_store_id` من backend إن وجد.
  - ثم `dasm_selected_store_id` من المتصفح إن وجد.
  - ثم أول متجر كخيار fallback.
- كل إحصائيات الصفحة تقرأ للمتجر المختار فقط عبر:
  - `GET /api/stores/my-store/stats`
  - مع header `X-DASM-Store-Id`.
- زر فتح لوحة المتاجر يجب أن يكون واحدا وواضحا، ويمرر:
  - `return_url=/dashboard?store_id=<selected-store-id>`

## Core API Endpoints

هذه endpoints يملكها Laravel في DASM Core، وليست داخل `dasm-stores`:

- `GET /api/stores/my-stores`
- `GET /api/stores/my-store`
- `POST /api/stores/my-store`
- `PUT /api/stores/my-store`
- `POST /api/stores/my-store/activate`
- `GET /api/stores/my-store/stats`
- `GET /api/stores/my-store/products`
- `POST /api/stores/my-store/products`
- `GET /api/stores/my-store/orders`
- `GET /api/stores/my-store/payment-config`
- `PUT /api/stores/my-store/payment-config`
- `GET /api/stores/my-store/shipping-config`
- `GET /api/stores/my-store/import`
- `GET /api/stores/my-store/marketing`
- `PUT /api/stores/my-store/marketing`

## قاعدة البيانات

- المشروع التشغيلي: DASM-services.
- اتصال Laravel: `pgsql_services`.
- الربط المنطقي مع Core:
  - `stores.user_id = users.id`
- أهم الجداول التشغيلية:
  - `stores`
  - `store_products`
  - `store_orders`
  - `store_themes`
  - `store_tabs`
  - `store_categories`
  - `store_shipping_configs`
  - `store_payment_configs`

لا تستخدم DASM-services كمصدر هوية، ولا تضف لها ليدجر أو محافظ.

## الثيمات

- صفحة الثيمات في `dasm-stores`:
  - `pages/dashboard/theme.tsx`
- تعتمد على `sellerApi.getMyStore()` و `sellerApi.updateStore()`.
- بما أن `lib/api.ts` يضيف `X-DASM-Store-Id` تلقائيا، فإن حفظ الثيم يجب أن يخص المتجر المختار فقط.
- الثيمات مجانية حاليا ولا توجد marketplace مدفوعة للثيمات.

## قواعد السلامة

- لا تجعل صفحة Core تعرض متجرا واحدا ثابتًا إذا كان المستخدم يملك عدة متاجر.
- لا تمنع مستخدم Core العادي من دخول سطح المتاجر لمجرد أن `type=user`; ملكية المتجر تتحقق من APIs.
- لا تعتمد على متجر افتراضي عشوائي عند الانتقال بين الريبوين.
- لا تنشئ متجرًا تلقائيا لمجرد تسجيل الدخول.
- لا تغير قاعدة البيانات أو الهجرة بدون خطة منفصلة.

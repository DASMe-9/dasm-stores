# Ideas Backlog — dasm-stores

أفكار تحسين يرصدها Design Guardian أثناء مراجعة الكود أو تحليل المنافسين. لا تُنفذ مباشرة؛ تُراجع في sprint planning أو تُحوّل إلى spec منفصل قبل التنفيذ.

| التاريخ | المصدر | الفكرة | الملف المقترح | الأولوية | الحالة |
|---------|--------|--------|---------------|----------|--------|
| 2026-06-11 | competitors/2026-26 | **sold-out في listing pages:** منتجات نافدة تبقى ظاهرة في شبكة ISR حتى انتهاء cache (120ث). Shopify/Salla يُخفونها فور البيع عبر webhook+revalidation. قد يتسبب في تجربة سيئة لمتسوق ينقر منتجاً نافداً. | `app/page.tsx` + `app/api/` (webhook endpoint جديد) | 🟡 متوسطة | مؤجلة |
| 2026-06-12 | competitors/2026-27 | **sold-out overlay على بطاقة المنتج (store pages):** `components/product/ProductCard.tsx` لا يُظهر أي مؤشر بصري للمنتج النافد في شبكة المنتجات. المتسوق يُضغط على بطاقة منتج نافد دون أي إنذار مسبق. الإصلاح: overlay نصي "نفد" أو تعتيم البطاقة عند `product.stock === 0`. | `components/product/ProductCard.tsx` | 🟡 متوسطة | مؤجلة |
| 2026-06-13 | competitors/2026-28 | **Wishlist header badge count:** المفضلة الكاملة تحتاج badge عداد على أيقونة القلب في الهيدر. المفضلة الحالية في specs المعلقة تعتمد localStorage؛ تحويلها إلى state/context مشترك يتيح عرض count في هيدر الرئيسية والمتجر. | `components/home/HomeHeaderActions.tsx` + مكوّن WishlistContext جديد | 🟡 متوسطة | مؤجلة |
| 2026-06-15 | competitors/2026-28 | **Cart Confirmation Popup:** Salla يعرض popup خفيف بعد إضافة منتج للسلة بدلاً من فتح drawer كامل. الفكرة تحتاج مراجعة تدفق التسوق حتى لا تكرر `CartDrawer.tsx`. | `components/cart/CartToast.tsx` + `store/cartStore.ts` | 🟡 متوسطة | مؤجلة |
| 2026-06-16 | competitors/2026-29 | **معلومات شحن/استلام على صفحة تفصيل المنتج:** Salla أضافت مكوّن `salla-fulfillment-methods` يعرض خيارات توصيل/استلام قبل زر "أضف للسلة". dasm-stores لا يعرض أي معلومة شحن على صفحة المنتج. يتوقف على حقول API: يحتاج تحقق من بيانات متاحة في `getProducts()` response. | `app/[slug]/products/[productId]/page.tsx` | 🟡 متوسطة | مؤجلة — تحقق API مطلوب |

| 2026-06-29 | competitors/2026-30 | **Variant swatch → image carousel على بطاقة المنتج:** Salla Twilight 2.14.420 أضافت تغيير صورة المنتج عند النقر على swatch اللون مباشرة على البطاقة (بدون انتقال لصفحة المنتج). `ProductCard.tsx` لا يعرض variant swatches حالياً. يتوقف على: (أ) وجود حقل variants في API payload لـ `getProducts()`، (ب) أن يحمل كل variant صورته الخاصة. | `components/product/ProductCard.tsx` + `lib/api-server.ts` | 🟢 مرتفعة (مشروطة بالـ API) | مؤجلة — تحقق API مطلوب |
| 2026-06-29 | competitors/2026-30 | **اتجاه استراتيجي — Guest checkout friction:** Salla أضافت Apple Pay quick buy للزوار بدون حساب. المتجر الفرعي في dasm-stores يتطلب تسجيل للشراء. تخفيف هذا الـ friction (guest checkout أو express payment) يمثّل فجوة تنافسية متنامية. يستدعي قرار product وبنية checkout. | `app/[slug]/checkout/page.tsx` + auth flow | 🔴 عالية (استراتيجية) | مؤجلة — قرار product مطلوب |
| 2026-06-29 | guardian W30 | **تحديث baseline لصفحة متجر builder:** الـ `subdomain-store.png` يمثّل متجراً بدون visual builder. مع جعل builder المسار الافتراضي (`5f45ab2`)، يصبح الـ baseline قديماً للمتاجر الجديدة. يُوصى بأخذ screenshot جديد لمتجر builder بالقالب الافتراضي وتحديث `docs/design/baseline/subdomain-store.png`. | `docs/design/baseline/subdomain-store.png` | 🟡 متوسطة | مؤجلة — يتطلب screenshot يدوي |

---

> يضاف هنا أي تحسين يكتشفه Design Guardian دون تنفيذ مباشر أو تعديل على كود الإنتاج.

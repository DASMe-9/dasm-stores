# Ideas Backlog — dasm-stores

أفكار تحسين يرصدها Design Guardian أثناء مراجعة الكود أو تحليل المنافسين. لا تُنفذ مباشرة؛ تُراجع في sprint planning أو تُحوّل إلى spec منفصل قبل التنفيذ.

| التاريخ | المصدر | الفكرة | الملف المقترح | الأولوية | الحالة |
|---------|--------|--------|---------------|----------|--------|
| 2026-06-11 | competitors/2026-26 | **sold-out في listing pages:** منتجات نافدة تبقى ظاهرة في شبكة ISR حتى انتهاء cache (120ث). Shopify/Salla يُخفونها فور البيع عبر webhook+revalidation. قد يتسبب في تجربة سيئة لمتسوق ينقر منتجاً نافداً. | `app/page.tsx` + `app/api/` (webhook endpoint جديد) | 🟡 متوسطة | مؤجلة |
| 2026-06-12 | competitors/2026-27 | **sold-out overlay على بطاقة المنتج (store pages):** `components/product/ProductCard.tsx` لا يُظهر أي مؤشر بصري للمنتج النافد في شبكة المنتجات. المتسوق يُضغط على بطاقة منتج نافد دون أي إنذار مسبق. الإصلاح: overlay نصي "نفد" أو تعتيم البطاقة عند `product.stock === 0`. | `components/product/ProductCard.tsx` | 🟡 متوسطة | مؤجلة |
| 2026-06-13 | competitors/2026-28 | **Wishlist header badge count:** المفضلة الكاملة تحتاج badge عداد على أيقونة القلب في الهيدر. المفضلة الحالية في specs المعلقة تعتمد localStorage؛ تحويلها إلى state/context مشترك يتيح عرض count في هيدر الرئيسية والمتجر. | `components/home/HomeHeaderActions.tsx` + مكوّن WishlistContext جديد | 🟡 متوسطة | مؤجلة |
| 2026-06-15 | competitors/2026-28 | **Cart Confirmation Popup:** Salla يعرض popup خفيف بعد إضافة منتج للسلة بدلاً من فتح drawer كامل. الفكرة تحتاج مراجعة تدفق التسوق حتى لا تكرر `CartDrawer.tsx`. | `components/cart/CartToast.tsx` + `store/cartStore.ts` | 🟡 متوسطة | مؤجلة |
| 2026-06-16 | competitors/2026-29 | **معلومات شحن/استلام على صفحة تفصيل المنتج:** Salla أضافت مكوّن `salla-fulfillment-methods` يعرض خيارات توصيل/استلام قبل زر "أضف للسلة". dasm-stores لا يعرض أي معلومة شحن على صفحة المنتج. يتوقف على حقول API: يحتاج تحقق من بيانات متاحة في `getProducts()` response. | `app/[slug]/products/[productId]/page.tsx` | 🟡 متوسطة | مؤجلة — تحقق API مطلوب |

| 2026-06-17 | competitors/2026-30 | **كاروسيل الصور بناءً على خيار اللون/المتغير:** Salla Twilight v2.14.420 أضافت تنقل carousel تلقائي عند تحديد المتسوق خياراً مرئياً (لون/نوع). `ProductPurchaseSection.tsx` في dasm-stores يتعامل مع `selectedVariant` لكن `ProductGallery.tsx` لا تُحدَّث صورها بناءً على الخيار المحدد. الإصلاح: تمرير `selectedVariant` لـ Gallery وتحديد `activeIndex` عند تغير الخيار. | `components/product/ProductGallery.tsx` + `components/product/ProductPurchaseSection.tsx` | 🟡 متوسطة | مؤجلة |
| 2026-06-17 | competitors/2026-30 | **زر "اشترِ الآن" (Quick Buy — تخطي السلة):** Salla تقدم "شراء سريع" ينقل المتسوق لصفحة الدفع مباشرةً دون المرور على صفحة السلة. في dasm-stores لا يوجد مسار مشابه. يتطلب: إنشاء order مؤقت في checkout بمنتج واحد مباشرة، أو تمرير `buy_now=1&product_id=X` لصفحة checkout. يحتاج تحقق من `app/[slug]/checkout/page.tsx` ودعم الـ API للطلب المباشر. | `components/product/ProductPurchaseSection.tsx` + `app/[slug]/checkout/page.tsx` | 🟠 عالية | مؤجلة — تحقق checkout API مطلوب |

---

> يضاف هنا أي تحسين يكتشفه Design Guardian دون تنفيذ مباشر أو تعديل على كود الإنتاج.

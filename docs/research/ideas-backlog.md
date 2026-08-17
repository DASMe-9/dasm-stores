# Ideas Backlog — dasm-stores

أفكار تحسين يرصدها Design Guardian أثناء مراجعة الكود أو تحليل المنافسين. لا تُنفذ مباشرة؛ تُراجع في sprint planning أو تُحوّل إلى spec منفصل قبل التنفيذ.

| التاريخ | المصدر | الفكرة | الملف المقترح | الأولوية | الحالة |
|---------|--------|--------|---------------|----------|--------|
| 2026-06-11 | competitors/2026-26 | **sold-out في listing pages:** منتجات نافدة تبقى ظاهرة في شبكة ISR حتى انتهاء cache (120ث). Shopify/Salla يُخفونها فور البيع عبر webhook+revalidation. قد يتسبب في تجربة سيئة لمتسوق ينقر منتجاً نافداً. | `app/page.tsx` + `app/api/` (webhook endpoint جديد) | 🟡 متوسطة | مؤجلة |
| 2026-06-12 | competitors/2026-27 | **sold-out overlay على بطاقة المنتج (store pages):** `components/product/ProductCard.tsx` لا يُظهر أي مؤشر بصري للمنتج النافد في شبكة المنتجات. المتسوق يُضغط على بطاقة منتج نافد دون أي إنذار مسبق. الإصلاح: overlay نصي "نفد" أو تعتيم البطاقة عند `product.stock === 0`. | `components/product/ProductCard.tsx` | 🟡 متوسطة | مؤجلة |
| 2026-06-13 | competitors/2026-28 | **Wishlist header badge count:** المفضلة الكاملة تحتاج badge عداد على أيقونة القلب في الهيدر. المفضلة الحالية في specs المعلقة تعتمد localStorage؛ تحويلها إلى state/context مشترك يتيح عرض count في هيدر الرئيسية والمتجر. | `components/home/HomeHeaderActions.tsx` + مكوّن WishlistContext جديد | 🟡 متوسطة | مؤجلة |
| 2026-06-15 | competitors/2026-28 | **Cart Confirmation Popup:** Salla يعرض popup خفيف بعد إضافة منتج للسلة بدلاً من فتح drawer كامل. الفكرة تحتاج مراجعة تدفق التسوق حتى لا تكرر `CartDrawer.tsx`. | `components/cart/CartToast.tsx` + `store/cartStore.ts` | 🟡 متوسطة | مؤجلة |
| 2026-06-16 | competitors/2026-29 | **معلومات شحن/استلام على صفحة تفصيل المنتج:** Salla أضافت مكوّن `salla-fulfillment-methods` يعرض خيارات توصيل/استلام قبل زر "أضف للسلة". dasm-stores لا يعرض أي معلومة شحن على صفحة المنتج. يتوقف على حقول API: يحتاج تحقق من بيانات متاحة في `getProducts()` response. | `app/[slug]/products/[productId]/page.tsx` | 🟡 متوسطة | مؤجلة — تحقق API مطلوب |

| 2026-08-17 | competitors/2026-34 | **BNPL badge على صفحة المنتج:** Shopify/Tamara أصبح معياراً في KSA/UAE — يظهر "اشتري الآن وادفع على 3 أشهر" تحت السعر مباشرة على صفحة المنتج. Paymob يدعم Tamara. يتوقف على تحقق حقول API للشحن/التمويل في المتجر. | `app/[slug]/products/[productId]/page.tsx` | 🟡 متوسطة | مؤجلة — تحقق Paymob API مطلوب |
| 2026-08-17 | competitors/2026-34 | **Apple Pay Quick Checkout من كتالوج المنتجات:** Zid Vitrin يدعم الآن Apple Pay Quick Checkout من صفحة الكتالوج مباشرة. يتطلب تكامل Paymob Apple Pay SDK + تعديل CartDrawer. جهد عالٍ. | `components/cart/CartDrawer.tsx` + تكامل Paymob | 🔴 منخفضة (جهد عالٍ) | مؤجلة — يتطلب قرار معماري |
| 2026-08-17 | competitors/2026-34 | **Popup Checkout (إتمام الطلب بدون تحويل صفحة):** Zid Vitrin أضاف checkout داخل modal dialog. تحسّن تجربة شراء ويقلل من الانقطاع. الجهد عالٍ جداً لـ dasm-stores: يتطلب إعادة هيكلة `app/[slug]/checkout/page.tsx`. | `app/[slug]/checkout/page.tsx` + `CartDrawer.tsx` | 🔴 منخفضة (جهد جداً عالٍ) | مؤجلة — قد يكون مناسباً في V2 |

---

> يضاف هنا أي تحسين يكتشفه Design Guardian دون تنفيذ مباشر أو تعديل على كود الإنتاج.

# Ideas Backlog — dasm-stores

أفكار تحسين يرصدها Design Guardian أثناء مراجعة الكود أو تحليل المنافسين. لا تُنفذ مباشرة؛ تُراجع في sprint planning أو تُحوّل إلى spec منفصل قبل التنفيذ.

| التاريخ | المصدر | الفكرة | الملف المقترح | الأولوية | الحالة |
|---------|--------|--------|---------------|----------|--------|
| 2026-06-11 | competitors/2026-26 | **sold-out في listing pages:** منتجات نافدة تبقى ظاهرة في شبكة ISR حتى انتهاء cache (120ث). Shopify/Salla يُخفونها فور البيع عبر webhook+revalidation. قد يتسبب في تجربة سيئة لمتسوق ينقر منتجاً نافداً. | `app/page.tsx` + `app/api/` (webhook endpoint جديد) | 🟡 متوسطة | مؤجلة |
| 2026-06-12 | competitors/2026-27 | **sold-out overlay على بطاقة المنتج (store pages):** `components/product/ProductCard.tsx` لا يُظهر أي مؤشر بصري للمنتج النافد في شبكة المنتجات. المتسوق يُضغط على بطاقة منتج نافد دون أي إنذار مسبق. الإصلاح: overlay نصي "نفد" أو تعتيم البطاقة عند `product.stock === 0`. | `components/product/ProductCard.tsx` | 🟡 متوسطة | مؤجلة |
| 2026-06-13 | competitors/2026-28 | **Wishlist header badge count:** المفضلة الكاملة تحتاج badge عداد على أيقونة القلب في الهيدر. المفضلة الحالية في specs المعلقة تعتمد localStorage؛ تحويلها إلى state/context مشترك يتيح عرض count في هيدر الرئيسية والمتجر. | `components/home/HomeHeaderActions.tsx` + مكوّن WishlistContext جديد | 🟡 متوسطة | مؤجلة |
| 2026-06-15 | competitors/2026-28 | **Cart Confirmation Popup:** Salla يعرض popup خفيف بعد إضافة منتج للسلة بدلاً من فتح drawer كامل. الفكرة تحتاج مراجعة تدفق التسوق حتى لا تكرر `CartDrawer.tsx`. | `components/cart/CartToast.tsx` + `store/cartStore.ts` | 🟡 متوسطة | مؤجلة |
| 2026-06-16 | competitors/2026-29 | **معلومات شحن/استلام على صفحة تفصيل المنتج:** Salla أضافت مكوّن `salla-fulfillment-methods` يعرض خيارات توصيل/استلام قبل زر "أضف للسلة". dasm-stores لا يعرض أي معلومة شحن على صفحة المنتج. يتوقف على حقول API: يحتاج تحقق من بيانات متاحة في `getProducts()` response. | `app/[slug]/products/[productId]/page.tsx` | 🟡 متوسطة | **جزئياً منفَّذ** — كتلة `fulfillment_policy` مضافة في `013f987`. الناقص: ETA للتوصيل + عرض للمتاجر بلا `fulfillment_policy` |
| 2026-08-09 | competitors/2026-32 | **ملخص التقييمات بعوامل تفصيلية:** Salla v2.14.509 تعرض `reviews-summary` بأعمدة (جودة/سعر/توصيل) ونسب مئوية. `<ProductReviews reviews={product.reviews} />` في dasm-stores موجود لكن بلا ملخص. إضافة component `ReviewSummary` أعلى قائمة التقييمات. | `components/product/ProductReviews.tsx` | 🟡 متوسطة | مؤجلة — ينتظر baseline-update |
| 2026-08-09 | competitors/2026-32 | **خيارات المنتج بأسلوب cards أفقية (Zid Unaizah Pro):** عرض خيارات الحجم واللون كـ cards أفقية مع صورة مصغرة بدل dropdown. تجربة iOS-like — يحتاج مراجعة `ProductPurchaseSection.tsx` لتقييم إعادة الاستخدام. | `components/product/ProductPurchaseSection.tsx` | 🔵 منخفضة | مؤجلة |
| 2026-08-09 | baseline-drift-2026-08-09 | **ETA توصيل على صفحة المنتج:** كتلة `fulfillment_policy` (السطر 104-121 في product page) تعرض نافذة الإرجاع لكن لا تعرض ETA للتوصيل. Salla/Shopify يعرضان "يصل خلال 3-5 أيام عمل" قرب زر الشراء. يتطلب حقل ETA في `fulfillment_policy` من API. | `app/[slug]/products/[productId]/page.tsx` | 🟡 متوسطة | مؤجلة — تحقق API مطلوب |

---

> يضاف هنا أي تحسين يكتشفه Design Guardian دون تنفيذ مباشر أو تعديل على كود الإنتاج.

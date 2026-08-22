# Ideas Backlog — dasm-stores

أفكار تحسين يرصدها Design Guardian أثناء مراجعة الكود أو تحليل المنافسين. لا تُنفذ مباشرة؛ تُراجع في sprint planning أو تُحوّل إلى spec منفصل قبل التنفيذ.

| التاريخ | المصدر | الفكرة | الملف المقترح | الأولوية | الحالة |
|---------|--------|--------|---------------|----------|--------|
| 2026-06-11 | competitors/2026-26 | **sold-out في listing pages:** منتجات نافدة تبقى ظاهرة في شبكة ISR حتى انتهاء cache (120ث). Shopify/Salla يُخفونها فور البيع عبر webhook+revalidation. قد يتسبب في تجربة سيئة لمتسوق ينقر منتجاً نافداً. | `app/page.tsx` + `app/api/` (webhook endpoint جديد) | 🟡 متوسطة | مؤجلة |
| 2026-06-12 | competitors/2026-27 | **sold-out overlay على بطاقة المنتج (store pages):** `components/product/ProductCard.tsx` لا يُظهر أي مؤشر بصري للمنتج النافد في شبكة المنتجات. المتسوق يُضغط على بطاقة منتج نافد دون أي إنذار مسبق. الإصلاح: overlay نصي "نفد" أو تعتيم البطاقة عند `product.stock === 0`. | `components/product/ProductCard.tsx` | 🟡 متوسطة | مؤجلة |
| 2026-06-13 | competitors/2026-28 | **Wishlist header badge count:** المفضلة الكاملة تحتاج badge عداد على أيقونة القلب في الهيدر. المفضلة الحالية في specs المعلقة تعتمد localStorage؛ تحويلها إلى state/context مشترك يتيح عرض count في هيدر الرئيسية والمتجر. | `components/home/HomeHeaderActions.tsx` + مكوّن WishlistContext جديد | 🟡 متوسطة | مؤجلة |
| 2026-06-15 | competitors/2026-28 | **Cart Confirmation Popup:** Salla يعرض popup خفيف بعد إضافة منتج للسلة بدلاً من فتح drawer كامل. الفكرة تحتاج مراجعة تدفق التسوق حتى لا تكرر `CartDrawer.tsx`. | `components/cart/CartToast.tsx` + `store/cartStore.ts` | 🟡 متوسطة | مؤجلة |
| 2026-06-16 | competitors/2026-29 | **معلومات شحن/استلام على صفحة تفصيل المنتج:** Salla أضافت مكوّن `salla-fulfillment-methods` يعرض خيارات توصيل/استلام قبل زر "أضف للسلة". dasm-stores لا يعرض أي معلومة شحن على صفحة المنتج. يتوقف على حقول API: يحتاج تحقق من بيانات متاحة في `getProducts()` response. | `app/[slug]/products/[productId]/page.tsx` | 🟡 متوسطة | مؤجلة — تحقق API مطلوب |
| 2026-07-14 | competitors/2026-33 | **Zid tiered discount progress bar:** Zid أضافت خاصية خصومات تصاعدية مع شريط تقدم بصري في صفحة السلة ("أضف 50 ر.س للحصول على خصم 15%"). dasm-stores لا يعرض أي حافز تدريجي في السلة. يتوقف على وجود discount_tiers في API response. | `components/cart/CartDrawer.tsx` أو `app/[slug]/cart/page.tsx` | 🟡 متوسطة | مؤجلة — تحقق API مطلوب |
| 2026-07-14 | competitors/2026-33 | **Salla cart-summary-card pattern:** Salla أضافت `salla-cart-summary-card` لعرض ملخص السلة (subtotal/شحن/إجمالي) كبطاقة منفصلة في أسفل CartDrawer. CartDrawer الحالي يعرض الإجمالي inline بدون فصل بصري واضح. | `components/cart/CartDrawer.tsx` | 🟢 منخفضة | مؤجلة |
| 2026-07-14 | competitors/2026-33 | **Shopify Storefront Events للـ AI cart:** Shopify Dawn 15.5.0 أضافت event API للسلة تتيح لـ AI agents إضافة منتج/تحديث كمية بلا page reload. استراتيجياً: dasm-stores يبني visual block builder — إضافة cart event API مستقبلاً قد تُتيح تجارب AI shopping assistant. | `store/cartStore.ts` (Zustand) | 🔵 استراتيجية | مؤجلة — بعيدة المدى |

---

> يضاف هنا أي تحسين يكتشفه Design Guardian دون تنفيذ مباشر أو تعديل على كود الإنتاج.

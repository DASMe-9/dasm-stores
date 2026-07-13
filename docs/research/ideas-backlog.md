# Ideas Backlog — dasm-stores

أفكار تحسين يرصدها Design Guardian أثناء مراجعة الكود أو تحليل المنافسين. لا تُنفذ مباشرة؛ تُراجع في sprint planning أو تُحوّل إلى spec منفصل قبل التنفيذ.

| التاريخ | المصدر | الفكرة | الملف المقترح | الأولوية | الحالة |
|---------|--------|--------|---------------|----------|--------|
| 2026-06-11 | competitors/2026-26 | **sold-out في listing pages:** منتجات نافدة تبقى ظاهرة في شبكة ISR حتى انتهاء cache (120ث). Shopify/Salla يُخفونها فور البيع عبر webhook+revalidation. قد يتسبب في تجربة سيئة لمتسوق ينقر منتجاً نافداً. | `app/page.tsx` + `app/api/` (webhook endpoint جديد) | 🟡 متوسطة | مؤجلة |
| 2026-06-12 | competitors/2026-27 | **sold-out overlay على بطاقة المنتج (store pages):** `components/product/ProductCard.tsx` لا يُظهر أي مؤشر بصري للمنتج النافد في شبكة المنتجات. المتسوق يُضغط على بطاقة منتج نافد دون أي إنذار مسبق. الإصلاح: overlay نصي "نفد" أو تعتيم البطاقة عند `product.stock === 0`. | `components/product/ProductCard.tsx` | 🟡 متوسطة | مؤجلة |
| 2026-06-13 | competitors/2026-28 | **Wishlist header badge count:** المفضلة الكاملة تحتاج badge عداد على أيقونة القلب في الهيدر. المفضلة الحالية في specs المعلقة تعتمد localStorage؛ تحويلها إلى state/context مشترك يتيح عرض count في هيدر الرئيسية والمتجر. | `components/home/HomeHeaderActions.tsx` + مكوّن WishlistContext جديد | 🟡 متوسطة | مؤجلة |
| 2026-06-15 | competitors/2026-28 | **Cart Confirmation Popup:** Salla يعرض popup خفيف بعد إضافة منتج للسلة بدلاً من فتح drawer كامل. الفكرة تحتاج مراجعة تدفق التسوق حتى لا تكرر `CartDrawer.tsx`. | `components/cart/CartToast.tsx` + `store/cartStore.ts` | 🟡 متوسطة | مؤجلة |
| 2026-06-16 | competitors/2026-29 | **معلومات شحن/استلام على صفحة تفصيل المنتج:** Salla أضافت مكوّن `salla-fulfillment-methods` يعرض خيارات توصيل/استلام قبل زر "أضف للسلة". dasm-stores لا يعرض أي معلومة شحن على صفحة المنتج. يتوقف على حقول API: يحتاج تحقق من بيانات متاحة في `getProducts()` response. | `app/[slug]/products/[productId]/page.tsx` | 🟡 متوسطة | مؤجلة — تحقق API مطلوب |

| 2026-07-13 | competitors/2026-30 | **شريط ثقة/إفصاح على صفحة المنتج:** Shopify Dawn 15.5.0 أضاف "Product Disclosures" section على صفحة تفصيل المنتج. `app/[slug]/products/[productId]/page.tsx` لا يعرض أي شريط ثقة (أيقونات دفع، سياسة الإرجاع، توصيل آمن). لا يحتاج API جديداً — محتوى ثابت أو متجر بيانات. | `app/[slug]/products/[productId]/page.tsx` | 🟢 عالية | مقترح spec لـ W31 بعد حسم baseline-drift-2026-07-13.md |
| 2026-07-13 | competitors/2026-30 | **تقييمات متعددة الأبعاد + رفع صور:** Salla 2.14.490 أضافت محاور تقييم متعددة (جودة، توصيل، التغليف) ورفع صور مع التقييم في `salla-rating-modal`. `ProductReviews.tsx` حالياً لا يدعم هذا. | `components/product/ProductReviews.tsx` | 🟡 متوسطة | مؤجلة |
| 2026-07-13 | competitors/2026-30 | **Cart Summary Card مضمّنة:** Salla أضافت `salla-cart-summary-card` (June 30) لعرض ملخص السلة داخل الصفحة. dasm-stores لها `CartDrawer` لكن لا ملخص مضمّن. فكرة تكملة لـ `sticky-mini-cart-bar-2026-06-15.md` لكن على سطح مختلف (inline vs. sticky). | `app/[slug]/products/[productId]/page.tsx` أو `StoreChrome.tsx` | 🟡 متوسطة | مؤجلة — تُراجع بعد تنفيذ sticky bar أولاً |

---

> يضاف هنا أي تحسين يكتشفه Design Guardian دون تنفيذ مباشر أو تعديل على كود الإنتاج.

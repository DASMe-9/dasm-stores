# Ideas Backlog — dasm-stores

أفكار تحسين يرصدها Design Guardian أثناء مراجعة الكود أو تحليل المنافسين. لا تُنفذ مباشرة؛ تُراجع في sprint planning أو تُحوّل إلى spec منفصل قبل التنفيذ.

| التاريخ | المصدر | الفكرة | الملف المقترح | الأولوية | الحالة |
|---------|--------|--------|---------------|----------|--------|
| 2026-06-11 | competitors/2026-26 | **sold-out في listing pages:** منتجات نافدة تبقى ظاهرة في شبكة ISR حتى انتهاء cache (120ث). Shopify/Salla يُخفونها فور البيع عبر webhook+revalidation. قد يتسبب في تجربة سيئة لمتسوق ينقر منتجاً نافداً. | `app/page.tsx` + `app/api/` (webhook endpoint جديد) | 🟡 متوسطة | مؤجلة |
| 2026-06-12 | competitors/2026-27 | **sold-out overlay على بطاقة المنتج (store pages):** `components/product/ProductCard.tsx` لا يُظهر أي مؤشر بصري للمنتج النافد في شبكة المنتجات. المتسوق يُضغط على بطاقة منتج نافد دون أي إنذار مسبق. الإصلاح: overlay نصي "نفد" أو تعتيم البطاقة عند `product.stock === 0`. | `components/product/ProductCard.tsx` | 🟡 متوسطة | مؤجلة |
| 2026-06-13 | competitors/2026-28 | **Wishlist header badge count:** المفضلة الكاملة تحتاج badge عداد على أيقونة القلب في الهيدر. المفضلة الحالية في specs المعلقة تعتمد localStorage؛ تحويلها إلى state/context مشترك يتيح عرض count في هيدر الرئيسية والمتجر. | `components/home/HomeHeaderActions.tsx` + مكوّن WishlistContext جديد | 🟡 متوسطة | مؤجلة |
| 2026-06-15 | competitors/2026-28 | **Cart Confirmation Popup:** Salla يعرض popup خفيف بعد إضافة منتج للسلة بدلاً من فتح drawer كامل. الفكرة تحتاج مراجعة تدفق التسوق حتى لا تكرر `CartDrawer.tsx`. | `components/cart/CartToast.tsx` + `store/cartStore.ts` | 🟡 متوسطة | مؤجلة |
| 2026-06-16 | competitors/2026-29 | **معلومات شحن/استلام على صفحة تفصيل المنتج:** Salla أضافت مكوّن `salla-fulfillment-methods` يعرض خيارات توصيل/استلام قبل زر "أضف للسلة". dasm-stores لا يعرض أي معلومة شحن على صفحة المنتج. يتوقف على حقول API: يحتاج تحقق من بيانات متاحة في `getProducts()` response. | `app/[slug]/products/[productId]/page.tsx` | 🟡 متوسطة | مؤجلة — تحقق API مطلوب |
| 2026-07-21 | competitors/2026-30 | **AI-Powered Product Recommendations:** Salla v2.14.490 أضافت APIs لتوصيات مخصصة عبر `salla-products-list`. dasm-stores يستخدم `sort:"featured"` ثابت. التنفيذ يتوقف على backend يعيد توصيات مخصصة لكل مستخدم (session-based أو collaborative filtering). | `app/page.tsx` + `app/[slug]/page.tsx` | 🔴 عالية | مؤجلة — تتطلب backend |
| 2026-07-21 | competitors/2026-30 | **Multi-Coupon Cart Support:** Salla v2.14.501 أضافت chips متعددة للكوبونات في السلة. dasm-stores يدعم كوبون واحد فقط. التنفيذ يتطلب تعديل backend لقبول أكثر من كوبون في checkout payload. | `components/cart/CartDrawer.tsx` + API checkout | 🟡 متوسطة | مؤجلة — تتطلب backend |
| 2026-07-21 | competitors/2026-30 | **Cart Gap Recommendations (شرط الشحن المجاني):** Salla v2.14.501 تعرض منتجات مقترحة لسد "الفجوة" نحو الشحن المجاني. يتطلب: (1) حقل `free_shipping_threshold` من API المتجر، (2) توصيات منتجات ذات صلة. | `components/cart/CartDrawer.tsx` | 🟡 متوسطة | مؤجلة — تحقق API مطلوب |
| 2026-07-21 | competitors/2026-30 | **Product Disclosures (إفصاحات المنتج):** Shopify Dawn 15.5.0 أضاف block لعرض إفصاحات المنتج (مكوّنات، شهادات، تحذيرات) مباشرة فوق زر الشراء. مُلهِم لإضافة قسم "معلومات التسليم والضمان" في صفحة تفصيل المنتج. | `app/[slug]/products/[productId]/page.tsx` | 🟡 متوسطة | مؤجلة |
| 2026-07-21 | code-review | **StoreCard — زر "زيارة المتجر" غائب:** `components/explore/StoreCard.tsx` (سطر 18-73) تحوّل من بطاقة أفقية ذات زر "زيارة المتجر" إلى بطاقة عمودية بانر بلا زر. الإصلاح: إضافة `<span>زيارة المتجر</span>` داخل `p-4` div مع تنسيق `text-[var(--primary)]`. | `components/explore/StoreCard.tsx` السطور 52-72 | 🟢 منخفضة | مؤجلة — إضافة بسيطة |

---

> يضاف هنا أي تحسين يكتشفه Design Guardian دون تنفيذ مباشر أو تعديل على كود الإنتاج.

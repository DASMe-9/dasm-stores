# Ideas Backlog — dasm-stores

أفكار تحسين يرصدها Design Guardian أثناء مراجعة الكود أو تحليل المنافسين. لا تُنفذ مباشرة؛ تُراجع في sprint planning أو تُحوّل إلى spec منفصل قبل التنفيذ.

| التاريخ | المصدر | الفكرة | الملف المقترح | الأولوية | الحالة |
|---------|--------|--------|---------------|----------|--------|
| 2026-06-11 | competitors/2026-26 | **sold-out في listing pages:** منتجات نافدة تبقى ظاهرة في شبكة ISR حتى انتهاء cache (120ث). Shopify/Salla يُخفونها فور البيع عبر webhook+revalidation. قد يتسبب في تجربة سيئة لمتسوق ينقر منتجاً نافداً. | `app/page.tsx` + `app/api/` (webhook endpoint جديد) | 🟡 متوسطة | مؤجلة |
| 2026-06-12 | competitors/2026-27 | **sold-out overlay على بطاقة المنتج (store pages):** `components/product/ProductCard.tsx` لا يُظهر أي مؤشر بصري للمنتج النافد في شبكة المنتجات. المتسوق يُضغط على بطاقة منتج نافد دون أي إنذار مسبق. الإصلاح: overlay نصي "نفد" أو تعتيم البطاقة عند `product.stock === 0`. | `components/product/ProductCard.tsx` | 🟡 متوسطة | مؤجلة |
| 2026-06-13 | competitors/2026-28 | **Wishlist header badge count:** المفضلة الكاملة تحتاج badge عداد على أيقونة القلب في الهيدر. المفضلة الحالية في specs المعلقة تعتمد localStorage؛ تحويلها إلى state/context مشترك يتيح عرض count في هيدر الرئيسية والمتجر. | `components/home/HomeHeaderActions.tsx` + مكوّن WishlistContext جديد | 🟡 متوسطة | مؤجلة |
| 2026-06-15 | competitors/2026-28 | **Cart Confirmation Popup:** Salla يعرض popup خفيف بعد إضافة منتج للسلة بدلاً من فتح drawer كامل. الفكرة تحتاج مراجعة تدفق التسوق حتى لا تكرر `CartDrawer.tsx`. | `components/cart/CartToast.tsx` + `store/cartStore.ts` | 🟡 متوسطة | مؤجلة |
| 2026-06-16 | competitors/2026-29 | **معلومات شحن/استلام على صفحة تفصيل المنتج:** Salla أضافت مكوّن `salla-fulfillment-methods` يعرض خيارات توصيل/استلام قبل زر "أضف للسلة". dasm-stores لا يعرض أي معلومة شحن على صفحة المنتج. يتوقف على حقول API: يحتاج تحقق من بيانات متاحة في `getProducts()` response. | `app/[slug]/products/[productId]/page.tsx` | 🟡 متوسطة | مؤجلة — تحقق API مطلوب |

| 2026-07-31 | competitors/2026-31 | **AI product recommendations section:** Salla v2.14.490 أضافت توصيات ذكاء اصطناعي مبنية على تاريخ التصفح. dasm-stores تعرض منتجات `featured`/`newest` فقط. إضافة قسم "قد يعجبك" يستلزم API جديدة من الـ backend — تُدرس في حين تنضج حقول API. | `app/page.tsx` (section جديد) + API layer | 🔵 منخفضة | مؤجلة — تتوقف على API |
| 2026-07-31 | competitors/2026-31 | **Multi-factor ratings على صفحة المنتج:** Salla v2.14.490 أتاحت تقييمات تفصيلية متعددة الأبعاد مع صور ومراجعات قابلة للتعديل/الحذف. صفحة تفصيل المنتج في dasm-stores لا تعرض reviews حاليًا. | `app/[slug]/products/[productId]/page.tsx` | 🟡 متوسطة | مؤجلة — تحقق API مطلوب |
| 2026-07-31 | competitors/2026-31 | **Product Disclosures block:** Shopify Dawn v15.5.0 أضافت block لعرض بيانات/تحذيرات/إفصاحات المنتج تحت زر السلة. ملائم للمنتجات التي تتطلب تعريفات قانونية (مستحضرات، أجهزة). | `app/[slug]/products/[productId]/page.tsx` | 🔵 منخفضة | مؤجلة |
| 2026-07-31 | baseline-drift | **CommercePassport card في Hero:** أضافه commit `013f987` — يعرض "جواز نمو المتجر" بخطوات تسجيل البائع وعداد المتاجر النشطة. عنصر تسويقي مبتكر غير موجود في baseline. قرار الإبقاء عليه أو إدراجه في الـ baseline المحدَّث يعود للفريق. | `app/page.tsx:275–332` | 🔵 منخفضة — قرار تصميمي |
| 2026-07-31 | competitors/2026-31 | **Top Announcement Bar:** Zid أضاف شريطًا علويًا (Top Bar) فوق الهيدر للعروض الموسمية والإعلانات. `app/page.tsx` لا يحتوي على شريط من هذا النوع. التطبيق خفيف: paragraph ثابت أعلى الهيدر مع خيار الإغلاق. | `app/layout.tsx` أو `app/page.tsx` (header section) | 🟡 متوسطة | مؤجلة |

---

> يضاف هنا أي تحسين يكتشفه Design Guardian دون تنفيذ مباشر أو تعديل على كود الإنتاج.

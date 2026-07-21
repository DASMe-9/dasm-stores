# Ideas Backlog — dasm-stores

أفكار تحسين يرصدها Design Guardian أثناء مراجعة الكود أو تحليل المنافسين. لا تُنفذ مباشرة؛ تُراجع في sprint planning أو تُحوّل إلى spec منفصل قبل التنفيذ.

| التاريخ | المصدر | الفكرة | الملف المقترح | الأولوية | الحالة |
|---------|--------|--------|---------------|----------|--------|
| 2026-06-11 | competitors/2026-26 | **sold-out في listing pages:** منتجات نافدة تبقى ظاهرة في شبكة ISR حتى انتهاء cache (120ث). Shopify/Salla يُخفونها فور البيع عبر webhook+revalidation. قد يتسبب في تجربة سيئة لمتسوق ينقر منتجاً نافداً. | `app/page.tsx` + `app/api/` (webhook endpoint جديد) | 🟡 متوسطة | مؤجلة |
| 2026-06-12 | competitors/2026-27 | **sold-out overlay على بطاقة المنتج (store pages):** `components/product/ProductCard.tsx` لا يُظهر أي مؤشر بصري للمنتج النافد في شبكة المنتجات. المتسوق يُضغط على بطاقة منتج نافد دون أي إنذار مسبق. الإصلاح: overlay نصي "نفد" أو تعتيم البطاقة عند `product.stock === 0`. | `components/product/ProductCard.tsx` | 🟡 متوسطة | مؤجلة |
| 2026-06-13 | competitors/2026-28 | **Wishlist header badge count:** المفضلة الكاملة تحتاج badge عداد على أيقونة القلب في الهيدر. المفضلة الحالية في specs المعلقة تعتمد localStorage؛ تحويلها إلى state/context مشترك يتيح عرض count في هيدر الرئيسية والمتجر. | `components/home/HomeHeaderActions.tsx` + مكوّن WishlistContext جديد | 🟡 متوسطة | مؤجلة |
| 2026-06-15 | competitors/2026-28 | **Cart Confirmation Popup:** Salla يعرض popup خفيف بعد إضافة منتج للسلة بدلاً من فتح drawer كامل. الفكرة تحتاج مراجعة تدفق التسوق حتى لا تكرر `CartDrawer.tsx`. | `components/cart/CartToast.tsx` + `store/cartStore.ts` | 🟡 متوسطة | مؤجلة |
| 2026-06-16 | competitors/2026-29 | **معلومات شحن/استلام على صفحة تفصيل المنتج:** Salla أضافت مكوّن `salla-fulfillment-methods` يعرض خيارات توصيل/استلام قبل زر "أضف للسلة". dasm-stores لا يعرض أي معلومة شحن على صفحة المنتج. يتوقف على حقول API: يحتاج تحقق من بيانات متاحة في `getProducts()` response. | `app/[slug]/products/[productId]/page.tsx` | 🟡 متوسطة | **حُوِّلت لـ spec** → `product-policy-strip-2026-07-21.md` (static approach) |
| 2026-07-21 | competitors/2026-30 | **Shopify Semantic Storefront (AI-driven PDP):** Shopify أطلقت طبقة AI تُعيد ترتيب blocks صفحة المنتج ديناميكياً بناءً على source الزيارة، الجهاز، سلوك الجلسة. Early adopters يرون 11-18% lift في ATC. مرحلة مشاهدة فقط لـ dasm-stores — تتطلب بنية تحتية A/B وبيانات سلوكية كافية. | — | 🔵 مراقبة | مؤجلة — H2 2026 أو ما بعده |
| 2026-07-21 | competitors/2026-30 | **Dawn AI Cart Events:** Shopify Dawn 15.5.0 أضاف دعم تفاعلات سلة من AI/apps دون page reload عبر Storefront Events API. يفتح باباً لـ "AI assistant يضيف منتجات للسلة". ينطبق على `components/cart/CartDrawer.tsx` و`store/cartStore.ts` (Zustand). | `store/cartStore.ts` | 🔵 مراقبة | مؤجلة — يتطلب AI integration layer |

---

> يضاف هنا أي تحسين يكتشفه Design Guardian دون تنفيذ مباشر أو تعديل على كود الإنتاج.

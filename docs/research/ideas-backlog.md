# Ideas Backlog — dasm-stores

أفكار تحسين يرصدها Design Guardian أثناء مراجعة الكود أو تحليل المنافسين. لا تُنفذ مباشرة؛ تُراجع في sprint planning أو تُحوّل إلى spec منفصل قبل التنفيذ.

| التاريخ | المصدر | الفكرة | الملف المقترح | الأولوية | الحالة |
|---------|--------|--------|---------------|----------|--------|
| 2026-06-11 | competitors/2026-26 | **sold-out في listing pages:** منتجات نافدة تبقى ظاهرة في شبكة ISR حتى انتهاء cache (120ث). Shopify/Salla يُخفونها فور البيع عبر webhook+revalidation. قد يتسبب في تجربة سيئة لمتسوق ينقر منتجاً نافداً. | `app/page.tsx` + `app/api/` (webhook endpoint جديد) | 🟡 متوسطة | مؤجلة |
| 2026-06-12 | competitors/2026-27 | **sold-out overlay على بطاقة المنتج (store pages):** `components/product/ProductCard.tsx` لا يُظهر أي مؤشر بصري للمنتج النافد في شبكة المنتجات. المتسوق يُضغط على بطاقة منتج نافد دون أي إنذار مسبق. الإصلاح: overlay نصي "نفد" أو تعتيم البطاقة عند `product.stock === 0`. | `components/product/ProductCard.tsx` | 🟡 متوسطة | مؤجلة |
| 2026-06-13 | competitors/2026-28 | **Wishlist header badge count:** المفضلة الكاملة تحتاج badge عداد على أيقونة القلب في الهيدر. المفضلة الحالية في specs المعلقة تعتمد localStorage؛ تحويلها إلى state/context مشترك يتيح عرض count في هيدر الرئيسية والمتجر. | `components/home/HomeHeaderActions.tsx` + مكوّن WishlistContext جديد | 🟡 متوسطة | مؤجلة |
| 2026-06-15 | competitors/2026-28 | **Cart Confirmation Popup:** Salla يعرض popup خفيف بعد إضافة منتج للسلة بدلاً من فتح drawer كامل. الفكرة تحتاج مراجعة تدفق التسوق حتى لا تكرر `CartDrawer.tsx`. | `components/cart/CartToast.tsx` + `store/cartStore.ts` | 🟡 متوسطة | مؤجلة |
| 2026-06-16 | competitors/2026-29 | **معلومات شحن/استلام على صفحة تفصيل المنتج:** Salla أضافت مكوّن `salla-fulfillment-methods` يعرض خيارات توصيل/استلام قبل زر "أضف للسلة". dasm-stores لا يعرض أي معلومة شحن على صفحة المنتج. يتوقف على حقول API: يحتاج تحقق من بيانات متاحة في `getProducts()` response. | `app/[slug]/products/[productId]/page.tsx` | 🟡 متوسطة | مؤجلة — تحقق API مطلوب |

| 2026-08-18 | competitors/2026-34 | **Cart Confirmation Popup (تأكيد مُعزَّز):** exa أكدت النمط الفعلي في Salla (أبريل 2026): popup خفيف بعد إضافة للسلة يحتوي صورة المنتج + زر "إتمام الشراء" + زر "عرض السلة" بدلاً من فتح `CartDrawer` كاملاً. يُرشَّح كـ spec للجولة القادمة بعد حل drift CommercePassport. | `components/cart/CartDrawer.tsx` + `CartToast.tsx` جديد | 🔴 عالية | مؤجلة |
| 2026-08-18 | competitors/2026-34 | **Product Disclosures Section (صفحة المنتج):** Shopify Dawn 15.5.0 أضافت section وblock لعرض إفصاحات المنتج (مواد، منشأ، تحذيرات) بين الصور وزر السلة. dasm-stores لا يعرض أي إفصاح. يتوقف على تحقق من حقول API المنتج. | `app/[slug]/products/[productId]/page.tsx` | 🟡 متوسطة | مؤجلة — تحقق API مطلوب |
| 2026-08-18 | competitors/2026-34 | **AI/Agent Cart Interactions (Storefront Events):** Dawn 15.5.0 يدعم cart mutations من AI agents دون page reload. صلة بـ TalkStoreContext.tsx الموجود في dasm-stores — قد يُتيح مساعد AI يُضيف منتجات للسلة مباشرة. | `components/TalkStoreContext.tsx`، `components/cart/CartDrawer.tsx` | 🟡 متوسطة | مؤجلة |
| 2026-08-18 | competitors/2026-34 | **Builder-First Architecture مرجع Horizon:** Shopify Horizon (10 قوالب مجانية 2026) يُظهر اتجاه block-based storefronts مع AI block generation. صلة بـ VisualBuilder.tsx في dasm-stores — يُراجَع عند تطوير block system جديد. | `components/theme-editor/VisualBuilder.tsx` | 🟢 منخفضة | مرجع معماري |

---

> يضاف هنا أي تحسين يكتشفه Design Guardian دون تنفيذ مباشر أو تعديل على كود الإنتاج.

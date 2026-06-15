# Ideas Backlog — dasm-stores

أفكار تحسين يرصدها Design Guardian أثناء مراجعة الكود أو تحليل المنافسين. لا تُنفذ مباشرة؛ تُراجع في sprint planning أو تُحوّل إلى spec منفصل قبل التنفيذ.

| التاريخ | المصدر | الفكرة | الملف المقترح | الأولوية | الحالة |
|---------|--------|--------|---------------|----------|--------|
| 2026-06-11 | competitors/2026-26 | **sold-out في listing pages:** منتجات نافدة تبقى ظاهرة في شبكة ISR حتى انتهاء cache (120ث). Shopify/Salla يُخفونها فور البيع عبر webhook+revalidation. قد يتسبب في تجربة سيئة لمتسوق ينقر منتجاً نافداً. | `app/page.tsx` + `app/api/` (webhook endpoint جديد) | 🟡 متوسطة | مؤجلة |
| 2026-06-12 | competitors/2026-27 | **sold-out overlay على بطاقة المنتج (store pages):** `components/product/ProductCard.tsx` لا يُظهر أي مؤشر بصري للمنتج النافد في شبكة المنتجات. المتسوق يُضغط على بطاقة منتج نافد دون أي إنذار مسبق. الإصلاح: overlay نصي "نفد" أو تعتيم البطاقة عند `product.stock === 0`. ملاحظة: يتطلب إضافة `stock_quantity` لـ `StoreProductCard` type في API response. | `components/product/ProductCard.tsx` + `lib/api-server.ts` | 🟡 متوسطة | مؤجلة — تتطلب API change |
| 2026-06-15 | competitors/2026-28 | **Cart Confirmation Popup:** Salla يُظهر popup خفيف بعد إضافة منتج للسلة (صورة المنتج + زر «متابعة التسوق» + زر «إتمام الشراء» + الإجمالي). حالياً `CartDrawer.tsx` يُفتح بالكامل — بديل أخف يُقلل friction التسوق. | `components/cart/CartToast.tsx` (جديد) + `store/cartStore.ts` (حدث onItemAdded) | 🟡 متوسطة | مؤجلة |

---

> يضاف هنا أي تحسين يكتشفه Design Guardian دون تنفيذ مباشر أو تعديل على كود الإنتاج.

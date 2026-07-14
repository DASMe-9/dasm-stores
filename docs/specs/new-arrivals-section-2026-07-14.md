# Spec: قسم "وصل حديثاً" على الرئيسية

## السياق والمبرر

Salla أضافت في Twilight 2.14.490 (يوليو 2026) دعم AI-powered product recommendations في الـ themes. النمط المستهدف: قسم اكتشاف ثانٍ على صفحة السوق الرئيسية يُظهر المنتجات الجديدة مستقلاً عن قسم "مميزة" الحالي. هذا يمنح المتسوق طبقتي اكتشاف بدون أي تعديل على الـ API الحالي.

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `app/page.tsx` — الصفحة الرئيسية

**السلوك الحالي:**
- سطر 59-68: `getHomeProducts(q)` تستدعي `getExploreProducts({sort: q ? "newest" : "featured", per_page: 12})`
- عند وجود بحث → `sort: "newest"`, عند لا بحث → `sort: "featured"`
- النتيجة: قسم واحد ("منتجات من متاجر داسم") يجمع المميز والجديد في سطر واحد بدون تمييز
- عند عدم وجود بحث، المتسوق لا يرى المنتجات الجديدة إلا بالتصفية يدوياً

## التغيير المقترح

### المفهوم
إضافة قسم "وصل حديثاً" ثانٍ أسفل القسم الحالي، يستدعي `getExploreProducts({sort: "newest", per_page: 6})` بشكل مستقل. القسم يظهر فقط عند غياب `q` (صفحة الرئيسية الافتراضية، لا نتائج بحث).

### واجهة المكوّن الجديد (TypeScript signature)

```ts
// app/page.tsx — دالة server جديدة
async function getNewArrivals(): Promise<FeaturedProduct[]>

// المكوّن — inline في app/page.tsx (لا component منفصل مطلوب)
function NewArrivalsSection({ products }: { products: FeaturedProduct[] })
```

### المكوّن

```tsx
function NewArrivalsSection({ products }: { products: FeaturedProduct[] }) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8" id="new-arrivals">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-extrabold">
          <Sparkles className="h-5 w-5 text-emerald-600" /> وصل حديثاً
        </h2>
        <Link href="/?sort=newest" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
          عرض الكل <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {products.map((product, index) => (
          <ProductTile key={`new-${product.storeSlug}-${productIdentity(product)}-${index}`} product={product} />
        ))}
      </div>
    </section>
  );
}
```

### التكامل في `ExplorePage`

```tsx
// إضافة data fetch موازٍ في ExplorePage (لا await إضافي — Promise.all)
const [paginator, products, newArrivals] = await Promise.all([
  getExploreStores({ q, per_page: 24 }),
  getHomeProducts(q),
  q ? Promise.resolve([]) : getExploreProducts({ sort: "newest", per_page: 6 })
    .then(r => r.data.filter(p => p.store?.slug).map(p => ({
      ...p, storeSlug: p.store.slug, storeName: getStoreDisplayName(p.store)
    }))),
]);
```

```tsx
// في JSX — يُضاف بعد قسم المنتجات الحالي وقبل قسم المتاجر:
{!q ? <NewArrivalsSection products={newArrivals} /> : null}
```

### الـ variants

| الحالة | السلوك |
|--------|--------|
| بلا بحث (الرئيسية) | يظهر القسم بـ 6 منتجات جديدة |
| مع بحث (`q`) | القسم مخفي — المساحة للنتائج |
| API أعاد صفر منتجات | `if (!products.length) return null` — القسم لا يُعرض |

### سلوك states

- **loading:** الصفحة server component — لا loading state مرئي. `revalidate = 120` يكفي.
- **empty:** المكوّن يُعيد `null` بصمت
- **error (API):** يُلف `getExploreProducts` بـ `try/catch` يُعيد `[]` — لا يكسر الصفحة

## معايير القبول

- [ ] قسم "وصل حديثاً" يظهر على الرئيسية (`/`) بلا query string
- [ ] يعرض 6 منتجات بـ `sort: "newest"` (أحدث تاريخ إضافة)
- [ ] القسم لا يظهر عند `/?\q=...` (حالة البحث)
- [ ] منتجات القسم لا تكرر منتجات القسم الأعلى (فلترة بـ `productKeys` المستخدمة حالياً أو اقتصار على أحدث 6 فقط)
- [ ] الـ layout يتطابق مع `ProductTile` المستخدم في القسم الأول
- [ ] إضافة الـ fetch الجديد موازياً (لا يزيد وقت التحميل)
- [ ] لا يكسر الصفحة عند API timeout أو empty data

## الملفات التي سيلمسها Cursor

```
app/page.tsx   ← وحيد
```

- إضافة `getNewArrivals` helper (أو inline في `Promise.all`)
- إضافة `NewArrivalsSection` component (inline في الملف)
- تعديل `ExplorePage` لإضافة الـ fetch وعرض القسم

## مخاطر التغيير

| الخطر | الاحتمالية | التخفيف |
|-------|------------|---------|
| تكرار منتجات مع القسم الأول | متوسطة | الـ `newest` sort يختلف عن `featured` — تكرار محدود. الفلترة اختيارية |
| زيادة API calls (سرعة) | منخفضة | موازٍ في `Promise.all` — لا تأثير |
| API لا يدعم `sort=newest` لـ explore | منخفضة | `getExploreProducts` يستخدم `sort` حالياً (`newest` موجود في سطر 60) |

## استثناء: لا تمس

- الملفات في `docs/design/baseline/`
- tokens في `tailwind.config` (إلا بنص صريح)
- أي ملف خارج `app/page.tsx`

import Head from "next/head";
import { useEffect, useState, useCallback } from "react";
import { publicApi } from "@/lib/api";
import {
  Search,
  MapPin,
  Package,
  Store,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  ChevronLeft,
  Star,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { AdBanner } from "@/components/ads/AdBanner";

interface StoreItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  banner_url: string;
  owner_type: string;
  area: { name: string; name_ar?: string } | null;
  products_count: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  is_featured: boolean;
  primary_image: { url: string; alt_text: string } | null;
}

interface StoreWithProducts extends StoreItem {
  featured_products: Product[];
}

export default function ExplorePage() {
  const [stores, setStores] = useState<StoreWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadStores();
  }, [search]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.q = search;
      const { data } = await publicApi.explore(params);
      const storeList: StoreItem[] = data.data || [];

      const withProducts = await Promise.all(
        storeList.map(async (s) => {
          try {
            const { data: prodData } = await publicApi.getProducts(s.slug, {
              per_page: "6",
              sort: "featured",
            });
            return { ...s, featured_products: prodData.data || [] };
          } catch {
            return { ...s, featured_products: [] };
          }
        }),
      );
      setStores(withProducts);
    } catch {
      /* skip */
    } finally {
      setLoading(false);
    }
  };

  const ownerLabel = useCallback(
    (type: string) =>
      ({ venue_owner: "معرض", dealer: "تاجر", user: "متجر" }[type] || "متجر"),
    [],
  );

  const totalProducts = stores.reduce((sum, s) => sum + (s.products_count || 0), 0);

  return (
    <>
      <Head>
        <title>تصفح المتاجر — متاجر داسم</title>
        <meta
          name="description"
          content="تصفح جميع المتاجر والمنتجات على منصة متاجر داسم"
        />
        <meta name="theme-color" content="#059669" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>

      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 rtl">
        {/* ── الهيدر الثابت (شريط علوي) ── */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border-b border-zinc-100 dark:border-zinc-800 safe-top">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Store className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                متاجر داسم
              </h1>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                stores.dasm.com.sa
              </p>
            </div>
            <Link
              href="/auth/login"
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              دخول التجار
            </Link>
          </div>
        </header>

        {/* ── البحث ── */}
        <div className="bg-gradient-to-b from-emerald-600 to-emerald-700 dark:from-emerald-900 dark:to-emerald-950 px-4 pb-8 pt-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white">اكتشف المتاجر والمنتجات</h2>
              <p className="text-xs text-emerald-100">
                معارض وتجار وأفراد — كل شيء في مكان واحد
              </p>
            </div>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="search"
                placeholder="ابحث عن متجر أو منتج..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 pr-11 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* ── الإحصائيات السريعة ── */}
        <div className="max-w-7xl mx-auto px-4 -mt-5 relative z-10">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-3 text-center shadow-sm">
              <Store className="h-5 w-5 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {stores.length}
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500">متجر</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-3 text-center shadow-sm">
              <Package className="h-5 w-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {totalProducts}
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500">منتج</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-3 text-center shadow-sm">
              <TrendingUp className="h-5 w-5 mx-auto text-amber-500 dark:text-amber-400 mb-1" />
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                جديد
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                يومياً
              </div>
            </div>
          </div>
        </div>

        {/* ── محتوى المتاجر ── */}
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 pb-28">
          {/* إعلان داسم أدز */}
          <AdBanner placement="stores_explore" />

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-3 w-48 rounded bg-zinc-100 dark:bg-zinc-800/60" />
                    </div>
                  </div>
                  <div className="flex gap-3 overflow-hidden">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="shrink-0 w-36 h-48 rounded-2xl bg-zinc-200 dark:bg-zinc-800"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Store className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
              </div>
              <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                لا توجد متاجر {search && `تطابق "${search}"`}
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                جرّب البحث بكلمات أخرى أو عُد لاحقاً
              </p>
            </div>
          ) : (
            stores.map((store) => (
              <StoreSection
                key={store.id}
                store={store}
                ownerLabel={ownerLabel}
              />
            ))
          )}
        </div>

        {/* ── شريط التنقل السفلي (للجوال) ── */}
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 safe-bottom md:hidden">
          <div className="flex items-center justify-around py-2 px-2">
            <Link
              href="/explore"
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <Store className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                المتاجر
              </span>
            </Link>
            <Link
              href="/explore"
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <Search className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">بحث</span>
            </Link>
            <Link
              href="/explore"
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <ShoppingBag className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                طلباتي
              </span>
            </Link>
            <Link
              href="/auth/login"
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <Sparkles className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                متجري
              </span>
            </Link>
          </div>
        </nav>

        {/* فوتر */}
        <footer className="hidden md:block border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Store className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                متاجر داسم
              </span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              منصة المتاجر المستقلة — مدعومة بمنظومة{" "}
              <a
                href="https://dasm.com.sa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                داسم
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ── قسم متجر واحد مع منتجاته ── */

function StoreSection({
  store,
  ownerLabel,
}: {
  store: StoreWithProducts;
  ownerLabel: (type: string) => string;
}) {
  const areaName = store.area?.name_ar || store.area?.name;

  return (
    <section className="space-y-3">
      {/* هيدر المتجر */}
      <Link
        href={`/${store.slug}`}
        className="flex items-center gap-3 group"
      >
        <div className="h-12 w-12 shrink-0 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm flex items-center justify-center overflow-hidden">
          {store.logo_url ? (
            <img
              src={store.logo_url}
              alt={store.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Store className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
              {store.name}
            </h3>
            <span className="shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
              {ownerLabel(store.owner_type)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            {areaName && (
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {areaName}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Package className="h-3 w-3" />
              {store.products_count} منتج
            </span>
          </div>
        </div>
        <ChevronLeft className="h-5 w-5 text-zinc-300 dark:text-zinc-600 shrink-0 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition" />
      </Link>

      {/* شريط المنتجات الأفقي */}
      {store.featured_products.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {store.featured_products.map((product) => (
            <ExploreProductCard
              key={product.id}
              product={product}
              storeSlug={store.slug}
            />
          ))}
          {store.products_count > 6 && (
            <Link
              href={`/${store.slug}`}
              className="shrink-0 w-28 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 dark:hover:border-emerald-600 transition text-center px-2"
            >
              <ChevronLeft className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-1" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                عرض الكل
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                {store.products_count} منتج
              </span>
            </Link>
          )}
        </div>
      ) : (
        <Link
          href={`/${store.slug}`}
          className="block rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 p-6 text-center"
        >
          <ShoppingBag className="h-8 w-8 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            زُر المتجر لمشاهدة المنتجات
          </p>
        </Link>
      )}

      <div className="border-b border-zinc-100 dark:border-zinc-800" />
    </section>
  );
}

/* ── بطاقة منتج في شريط الاستكشاف ── */

function ExploreProductCard({
  product,
  storeSlug,
}: {
  product: Product;
  storeSlug: string;
}) {
  const price = Number(product.price);
  const compare =
    product.compare_at_price != null ? Number(product.compare_at_price) : null;
  const discountPct =
    compare && compare > price
      ? Math.round(((compare - price) / compare) * 100)
      : null;

  return (
    <Link
      href={`/${storeSlug}/product/${product.id}`}
      className="shrink-0 w-36 group"
    >
      <div className="relative aspect-square rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shadow-sm">
        {product.primary_image?.url ? (
          <img
            src={product.primary_image.url}
            alt={product.primary_image.alt_text || product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Tag className="h-8 w-8 text-zinc-200 dark:text-zinc-700" />
          </div>
        )}
        {product.is_featured && (
          <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
            <Star className="h-2.5 w-2.5" />
            مميز
          </span>
        )}
        {discountPct && (
          <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
            -{discountPct}%
          </span>
        )}
      </div>
      <div className="mt-2 px-0.5 space-y-0.5">
        <h4 className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
          {product.name}
        </h4>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {price.toFixed(0)}
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">ر.س</span>
          {compare && compare > price && (
            <span className="text-[10px] text-zinc-400 line-through mr-auto">
              {compare.toFixed(0)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

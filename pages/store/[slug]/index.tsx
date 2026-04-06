import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import {
  Store as StoreIcon, Search, ShoppingCart, Phone, Mail,
  MapPin, ExternalLink, Star, Tag,
} from "lucide-react";
import Link from "next/link";

interface StoreData {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  banner_url: string;
  contact_phone: string;
  contact_email: string;
  contact_whatsapp: string;
  social_links: Record<string, string>;
  meta_title: string;
  meta_description: string;
  theme_config: any;
  tabs: { id: number; name: string; slug: string; icon: string }[];
  area: { name_ar: string } | null;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  is_featured: boolean;
  primary_image: { url: string; alt_text: string } | null;
  variants: any[];
}

export default function StoreFront() {
  const router = useRouter();
  const { slug, tab } = router.query;

  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [cart, setCart] = useState<{ productId: number; qty: number }[]>([]);

  useEffect(() => {
    if (!slug) return;
    loadStore();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    loadProducts();
  }, [slug, activeTab, search]);

  useEffect(() => {
    if (tab && typeof tab === "string") setActiveTab(tab);
  }, [tab]);

  // تحميل السلة من localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && slug) {
      const saved = localStorage.getItem(`cart_${slug}`);
      if (saved) setCart(JSON.parse(saved));
    }
  }, [slug]);

  const loadStore = async () => {
    try {
      const { data } = await publicApi.getStore(slug as string);
      setStore(data.store);
    } catch {
      /* 404 */
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const params: Record<string, string> = {};
      if (activeTab) params.tab = activeTab;
      if (search) params.q = search;
      const { data } = await publicApi.getProducts(slug as string, params);
      setProducts(data.data || []);
    } catch {
      /* skip */
    }
  };

  const addToCart = (productId: number) => {
    const updated = [...cart];
    const existing = updated.find((c) => c.productId === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      updated.push({ productId, qty: 1 });
    }
    setCart(updated);
    localStorage.setItem(`cart_${slug}`, JSON.stringify(updated));
  };

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400 text-sm">جاري تحميل المتجر...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 rtl">
        <div className="text-center space-y-3">
          <StoreIcon className="w-16 h-16 text-gray-200 mx-auto" />
          <h1 className="text-xl font-bold text-gray-600">المتجر غير موجود</h1>
          <p className="text-sm text-gray-400">تأكد من الرابط أو تصفح المتاجر</p>
          <Link href="/" className="text-emerald-600 text-sm hover:underline">
            تصفح المتاجر
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{store.meta_title || store.name} — متاجر داسم</title>
        <meta name="description" content={store.meta_description || store.description || ""} />
      </Head>

      <div className="min-h-screen bg-gray-50 rtl">
        {/* ── البنر ── */}
        <div className="relative h-48 md:h-64 bg-gradient-to-l from-emerald-600 to-emerald-800 overflow-hidden">
          {store.banner_url && (
            <img src={store.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* ── هيدر المتجر ── */}
        <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row items-start gap-5">
            {/* لوغو */}
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 border-4 border-white shadow flex items-center justify-center overflow-hidden flex-shrink-0">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <StoreIcon className="w-8 h-8 text-emerald-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
              {store.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{store.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                {store.area && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {store.area.name_ar}
                  </span>
                )}
                {store.contact_phone && (
                  <a href={`tel:${store.contact_phone}`} className="flex items-center gap-1 hover:text-emerald-600">
                    <Phone className="w-3 h-3" /> {store.contact_phone}
                  </a>
                )}
              </div>
            </div>

            {/* سلة التسوق */}
            <Link
              href={`/store/${slug}/cart`}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              السلة
              {cartCount > 0 && (
                <span className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ── التابات ── */}
        {store.tabs.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 mt-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setActiveTab(null)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  !activeTab
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                الكل
              </button>
              {store.tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.slug)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                    activeTab === t.slug
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── البحث ── */}
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث في المنتجات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* ── المنتجات ── */}
        <div className="max-w-6xl mx-auto px-4 mt-6 pb-20">
          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Tag className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-sm">لا توجد منتجات</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition group"
                >
                  {/* صورة المنتج */}
                  <Link href={`/store/${slug}/product/${product.id}`}>
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.primary_image ? (
                        <img
                          src={product.primary_image.url}
                          alt={product.primary_image.alt_text || product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tag className="w-10 h-10 text-gray-200" />
                        </div>
                      )}
                      {product.is_featured && (
                        <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          مميز
                        </span>
                      )}
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          خصم {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-3 space-y-2">
                    <Link href={`/store/${slug}/product/${product.id}`}>
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-emerald-600">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-emerald-600">
                        {Number(product.price).toFixed(0)} ر.س
                      </span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-xs text-gray-400 line-through">
                          {Number(product.compare_at_price).toFixed(0)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition"
                    >
                      أضف للسلة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── فوتر بسيط ── */}
        <footer className="border-t border-gray-100 bg-white py-6 text-center">
          <p className="text-xs text-gray-400">
            {store.name} — مدعوم بواسطة{" "}
            <a href="https://dasm.com.sa" target="_blank" rel="noopener" className="text-emerald-600 hover:underline">
              متاجر داسم
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}

import Head from "next/head";
import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import { Store, Search, MapPin, Package } from "lucide-react";
import Link from "next/link";

interface StoreItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  banner_url: string;
  owner_type: string;
  area: { name_ar: string } | null;
  products_count: number;
}

export default function ExplorePage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadStores();
  }, [search]);

  const loadStores = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.q = search;
      const { data } = await publicApi.explore(params);
      setStores(data.data || []);
    } catch {
      /* skip */
    } finally {
      setLoading(false);
    }
  };

  const ownerLabel = (type: string) =>
    ({ venue_owner: "معرض", dealer: "تاجر", user: "متجر" }[type] || "متجر");

  return (
    <>
      <Head>
        <title>تصفح المتاجر — متاجر داسم</title>
        <meta name="description" content="تصفح جميع المتاجر على منصة متاجر داسم" />
      </Head>
      <div className="min-h-screen bg-gray-50 rtl">
        {/* Hero */}
        <div className="bg-gradient-to-l from-emerald-600 to-emerald-800 text-white py-16 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-3xl font-bold">متاجر داسم</h1>
            <p className="text-emerald-100 text-sm">تصفح المتاجر — من المعارض والتجار والأفراد</p>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن متجر..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl bg-white text-gray-900 pr-12 pl-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* بانر تسويقي — الربط مع داسم */}
        <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center justify-center gap-4 text-sm">
            <a
              href="https://dasm.com.sa/auctions"
              target="_blank"
              rel="noopener"
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition font-medium"
            >
              🔨 تصفح المزادات
            </a>
            <a
              href="https://dasm.com.sa/classifieds"
              target="_blank"
              rel="noopener"
              className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition font-medium"
            >
              📋 السوق الكبير (مبوبة)
            </a>
            <a
              href="https://dasm.com.sa"
              target="_blank"
              rel="noopener"
              className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition font-medium"
            >
              🏠 منصة داسم الرئيسية
            </a>
          </div>
        </div>

        {/* المتاجر */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-20 text-gray-400 text-sm">جاري التحميل...</div>
          ) : stores.length === 0 ? (
            <div className="text-center py-20">
              <Store className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد متاجر {search && `تطابق "${search}"`}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {stores.map((s) => (
                <Link
                  key={s.id}
                  href={`/store/${s.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition group"
                >
                  {/* بنر */}
                  <div className="h-32 bg-gradient-to-l from-emerald-500 to-emerald-700 relative overflow-hidden">
                    {s.banner_url && (
                      <img src={s.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    )}
                  </div>
                  {/* معلومات */}
                  <div className="p-4 -mt-8 relative">
                    <div className="w-14 h-14 rounded-xl bg-white border-2 border-gray-100 shadow flex items-center justify-center overflow-hidden mb-2">
                      {s.logo_url ? (
                        <img src={s.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-6 h-6 text-emerald-600" />
                      )}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition">
                      {s.name}
                    </h3>
                    {s.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                        {ownerLabel(s.owner_type)}
                      </span>
                      {s.area && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {s.area.name_ar}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" /> {s.products_count} منتج
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

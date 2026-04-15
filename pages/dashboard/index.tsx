import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Store, Package, ShoppingCart, TrendingUp, Plus } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("stores_token");
    if (!token) {
      router.replace("/auth/login?returnUrl=/dashboard");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        جاري التحميل...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>لوحتي — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen bg-gray-50 rtl">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">م</span>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">متاجر داسم</div>
              <div className="text-xs text-gray-400">DASM Stores</div>
            </div>
          </div>
          <button
            onClick={() => router.push("/stores/new")}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" />
            متجر جديد
          </button>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          {/* إحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "متاجري", value: "—", icon: Store, color: "emerald" },
              { label: "المنتجات", value: "—", icon: Package, color: "blue" },
              { label: "الطلبات", value: "—", icon: ShoppingCart, color: "purple" },
              { label: "المبيعات", value: "—", icon: TrendingUp, color: "orange" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2"
              >
                <stat.icon className="w-5 h-5 text-gray-400" />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* متاجري */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">متاجري</h2>
              <button
                onClick={() => router.push("/stores/new")}
                className="text-sm text-emerald-600 hover:underline"
              >
                + إنشاء متجر
              </button>
            </div>
            <div className="text-center py-12 text-gray-400">
              <Store className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm">لا يوجد متاجر بعد</p>
              <button
                onClick={() => router.push("/stores/new")}
                className="mt-4 px-6 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition"
              >
                أنشئ متجرك الأول
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

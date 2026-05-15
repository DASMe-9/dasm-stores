import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  ExternalLink,
  LayoutDashboard,
  Package,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  TrendingUp,
} from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";

const STORES_URL =
  process.env.NEXT_PUBLIC_STORES_URL || "https://stores.dasm.com.sa";

interface StoreStats {
  total_products: number;
  active_products: number;
  total_orders: number;
  pending_orders: number;
  paid_orders: number;
  total_revenue: number;
}

interface StoreData {
  id: number;
  name: string;
  slug: string;
  status: string;
  logo_url: string | null;
}

export default function SellerDashboardHome() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [store, setStore] = useState<StoreData | null>(null);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("stores_token");
    if (!t) {
      router.replace("/auth/login?returnUrl=/dashboard");
      return;
    }
    setReady(true);
    load();
  }, [router]);

  const load = async () => {
    try {
      const [storeRes, statsRes] = await Promise.allSettled([
        sellerApi.getMyStore(),
        sellerApi.getStats(),
      ]);

      if (storeRes.status === "fulfilled" && storeRes.value.data?.store) {
        setStore(storeRes.value.data.store as StoreData);
      }
      if (statsRes.status === "fulfilled" && statsRes.value.data) {
        setStats(statsRes.value.data as StoreStats);
      }
    } catch {
      /* skip */
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        جاري التحميل...
      </div>
    );
  }

  const storeUrl = store?.slug ? `${STORES_URL}/store/${store.slug}` : null;

  const headerActions = (
    <>
      {store ? (
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          منتج جديد
        </Link>
      ) : null}
      <Link
        href="/dashboard/shipping"
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
      >
        <Truck className="h-4 w-4" />
        شحن Tryoto
      </Link>
      {storeUrl ? (
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
        >
          <ExternalLink className="h-4 w-4" />
          المتجر العام
        </a>
      ) : null}
    </>
  );

  return (
    <>
      <Head>
        <title>لوحتي — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="لوحة التحكم"
        subtitle="نظرة موحّدة على متجرك والمبيعات والشحن"
        icon={LayoutDashboard}
        actions={headerActions}
        hasStore={!!store}
      >
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                label: "متاجري",
                sub: "حالة المتجر",
                value: store?.name ?? "—",
                icon: Store,
                color: "text-emerald-600",
                mono: false,
              },
              {
                label: "المنتجات النشطة",
                sub: "جاهزة للبيع",
                value: loading ? undefined : stats?.active_products,
                icon: Package,
                color: "text-blue-600",
              },
              {
                label: "الطلبات",
                sub: "كل الطلبات",
                value: loading ? undefined : stats?.total_orders,
                icon: ShoppingCart,
                color: "text-violet-600",
              },
              {
                label: "المبيعات",
                sub: "إجمالي المتحقق",
                value:
                  loading || stats?.total_revenue == null
                    ? undefined
                    : `${stats.total_revenue.toLocaleString("ar-SA")} ر.س`,
                icon: TrendingUp,
                color: "text-amber-600",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="rounded-full bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                    {stat.sub}
                  </span>
                </div>
                <div
                  className={`text-lg font-bold text-zinc-900 md:text-xl ${stat.mono === false ? "line-clamp-2 break-words text-base" : ""}`}
                  title={typeof stat.value === "string" ? stat.value : undefined}
                >
                  {loading && stat.value === undefined ? "…" : (stat.value ?? "—")}
                </div>
                <div className="mt-1 text-xs font-medium text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
            <div className="border-b border-zinc-50 px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900">
                <Store className="h-5 w-5 text-emerald-600" />
                متاجري
              </h2>
            </div>

            <div className="p-5 md:p-6">
              {store ? (
                <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-5 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="text-lg font-bold text-zinc-900">{store.name}</div>
                    <div className="truncate font-mono text-xs text-zinc-500" dir="ltr">
                      {STORES_URL}/store/{store.slug}
                    </div>
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        store.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {store.status === "active" ? "نشط" : "مسودة"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {storeUrl ? (
                      <a
                        href={storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        فتح المتجر
                      </a>
                    ) : null}
                    <Link
                      href="/dashboard/products/new"
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
                    >
                      <Plus className="h-4 w-4" />
                      إضافة منتج
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <p className="mb-1 text-sm font-semibold text-zinc-700">لا يوجد متجر بعد</p>
                  <p className="max-w-sm text-xs leading-relaxed text-zinc-500">
                    استخدم «إنشاء متجر جديد» من القائمة الجانبية لبدء متجرك.
                  </p>
                </div>
              )}
            </div>
          </section>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm leading-relaxed text-emerald-900">
            نفس حسابك على داسم يعمل هنا بعد تسجيل الدخول على{" "}
            <span className="rounded bg-emerald-100 px-1 font-mono text-xs" dir="ltr">
              stores.dasm.com.sa
            </span>
            . احفظ هذا الرابط كدخول رئيسي لمتاجر داسم؛ الإنتاج المعتمد هو هذا النطاق فقط ولا يُعرَّض في Next لتحويل نطاقات.
          </div>
        </div>
      </SellerShell>
    </>
  );
}

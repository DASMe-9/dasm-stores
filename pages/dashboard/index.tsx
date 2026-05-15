import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  ExternalLink,
  LayoutDashboard,
  Package,
  Plus,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  TrendingUp,
} from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { AdBanner } from "@/components/ads/AdBanner";
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

interface StoreProduct {
  id: number;
  name: string;
  price: string;
  status: string;
  primary_image?: { url: string } | null;
  images?: { url: string; is_primary?: boolean }[];
  created_at: string;
}

interface StoreData {
  id: number;
  name: string;
  slug: string;
  status: string;
  description: string | null;
  logo_url: string | null;
  owner_type: string;
  contact_phone: string | null;
  contact_email: string | null;
  contact_whatsapp: string | null;
  payment_config: { id: number } | null;
  created_at: string;
}

type TabKey = "overview" | "products" | "info";

export default function SellerDashboardHome() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [store, setStore] = useState<StoreData | null>(null);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

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
    setLoading(true);
    try {
      const [storeRes, statsRes, productsRes] = await Promise.allSettled([
        sellerApi.getMyStore(),
        sellerApi.getStats(),
        sellerApi.getProducts(),
      ]);

      if (storeRes.status === "fulfilled" && storeRes.value.data?.store) {
        setStore(storeRes.value.data.store as StoreData);
      }
      if (statsRes.status === "fulfilled" && statsRes.value.data) {
        setStats(statsRes.value.data as StoreStats);
      }
      if (productsRes.status === "fulfilled") {
        const d = productsRes.value.data;
        setProducts((d?.products ?? d?.data ?? []) as StoreProduct[]);
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

  const headerActions = null;

  return (
    <>
      <Head>
        <title>لوحتي — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="لوحة التحكم"
        subtitle="إدارة متجرك ومنتجاتك وطلباتك"
        icon={LayoutDashboard}
        actions={headerActions}
        hasStore={!!store}
        storeSlug={store?.slug}
        storeName={store?.name}
      >
        <div className="mx-auto max-w-6xl space-y-6">
          {/* ─── Loading ─── */}
          {loading && (
            <div className="space-y-4">
              <div className="h-6 w-32 bg-zinc-200 rounded animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-zinc-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          )}

          {/* ─── لا يوجد متجر ─── */}
          {!loading && !store && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 text-center text-white">
                <Store className="h-16 w-16 mb-4 text-emerald-300/60" />
                <h2 className="text-xl font-bold mb-2">ليس لديك متجر بعد</h2>
                <p className="text-emerald-100 text-sm mb-6 max-w-md">
                  أنشئ متجرك الإلكتروني وأضف منتجاتك وابدأ البيع — الدفع مباشر لحسابك عبر بوابة الدفع
                </p>
                <Link
                  href="/stores/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-sm hover:bg-emerald-50 transition"
                >
                  <Plus className="h-5 w-5" />
                  إنشاء متجر جديد
                </Link>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-700">
                <strong>كيف يعمل؟</strong>
                <ol className="mt-2 list-decimal pr-5 space-y-1 text-xs leading-relaxed">
                  <li>أنشئ متجرك واختر اسمه ورابطه وتصنيفه.</li>
                  <li>اربط بوابة الدفع (PayMob) من إعدادات المتجر.</li>
                  <li>أضف منتجاتك مع الأسعار والصور والأوزان.</li>
                  <li>فعّل المتجر وابدأ استقبال الطلبات!</li>
                </ol>
              </div>
            </div>
          )}

          {/* ─── يوجد متجر ─── */}
          {!loading && store && (
            <>
              {/* بانر إعلاني — DASM Ads */}
              <AdBanner placement="stores_dashboard" />

              {/* الإحصائيات */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: "المنتجات النشطة", total: stats?.total_products, value: stats?.active_products, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "الطلبات", value: stats?.total_orders, icon: ShoppingCart, color: "text-violet-600", bg: "bg-violet-50" },
                  { label: "طلبات معلقة", value: stats?.pending_orders, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
                  { label: "إجمالي المبيعات", value: stats?.total_revenue != null ? `${Number(stats.total_revenue).toLocaleString("ar-SA")} ر.س` : null, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.bg} rounded-2xl border border-zinc-100 p-4 space-y-2`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <div className="text-2xl font-bold text-zinc-900">
                      {stat.value ?? "—"}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {stat.label}
                      {"total" in stat && stat.total != null && (
                        <span className="text-zinc-400"> / {stat.total} إجمالي</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* التبويبات */}
              <div className="border-b border-zinc-200">
                <div className="flex gap-6">
                  {([
                    { key: "overview" as TabKey, label: "نظرة عامة", icon: Store },
                    { key: "products" as TabKey, label: `المنتجات (${products.length})`, icon: Package },
                    { key: "info" as TabKey, label: "معلومات المتجر", icon: Settings },
                  ]).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition ${
                        activeTab === tab.key
                          ? "border-emerald-600 text-emerald-700"
                          : "border-transparent text-zinc-500 hover:text-zinc-700"
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── تبويب: نظرة عامة ── */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {store.status === "draft" && (
                    <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                        <div>
                          <strong>متجرك في وضع المسودة</strong>
                          <p className="mt-1 text-yellow-700">لتفعيل المتجر يجب:</p>
                          <ul className="mt-1 list-disc space-y-0.5 pr-5">
                            <li className={store.payment_config ? "text-yellow-500 line-through" : ""}>
                              ربط بوابة دفع (PayMob)
                            </li>
                            <li className={(stats?.active_products ?? 0) > 0 ? "text-yellow-500 line-through" : ""}>
                              إضافة منتج واحد على الأقل
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {store.status === "active" && (
                    <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <strong>متجرك نشط ويستقبل الطلبات</strong>
                        <p className="mt-0.5 text-xs text-green-600">
                          العملاء يمكنهم تصفح منتجاتك والشراء عبر{" "}
                          <span className="font-mono">{STORES_URL}/{store.slug}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {products.length > 0 ? (
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-900">آخر المنتجات</h3>
                        <button type="button" onClick={() => setActiveTab("products")} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                          عرض الكل
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {products.slice(0, 3).map((p) => (
                          <ProductCard key={p.id} product={p} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-8 text-center">
                      <Package className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
                      <p className="mb-3 text-sm text-zinc-500">لم تضف منتجات بعد</p>
                      <Link
                        href="/dashboard/products/new"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                      >
                        <Plus className="h-4 w-4" />
                        أضف أول منتج
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ── تبويب: المنتجات ── */}
              {activeTab === "products" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-900">
                      جميع المنتجات ({products.length})
                    </h3>
                    <Link
                      href="/dashboard/products/new"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                    >
                      <Plus className="h-4 w-4" />
                      منتج جديد
                    </Link>
                  </div>
                  {products.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {products.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-12 text-center">
                      <Package className="mx-auto mb-3 h-12 w-12 text-zinc-300" />
                      <p className="mb-4 text-zinc-500">لم تضف منتجات بعد</p>
                      <Link
                        href="/dashboard/products/new"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                      >
                        <Plus className="h-4 w-4" />
                        أضف أول منتج
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ── تبويب: معلومات المتجر ── */}
              {activeTab === "info" && (
                <div className="space-y-4">
                  <div className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                    <InfoRow label="اسم المتجر" value={store.name} />
                    <InfoRow label="الرابط" value={`${STORES_URL}/${store.slug}`} mono />
                    <InfoRow
                      label="الحالة"
                      value={store.status === "active" ? "نشط" : "مسودة"}
                      badge
                      badgeColor={store.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
                    />
                    <InfoRow
                      label="نوع المالك"
                      value={
                        store.owner_type === "user" ? "مستخدم"
                        : store.owner_type === "venue_owner" ? "معرض"
                        : store.owner_type === "dealer" ? "تاجر"
                        : store.owner_type
                      }
                    />
                    <InfoRow label="الوصف" value={store.description ?? "—"} />
                    <InfoRow label="هاتف التواصل" value={store.contact_phone ?? "غير محدد"} />
                    <InfoRow label="بريد التواصل" value={store.contact_email ?? "غير محدد"} />
                    <InfoRow label="واتساب" value={store.contact_whatsapp ?? "غير محدد"} />
                    <InfoRow
                      label="بوابة الدفع"
                      value={store.payment_config ? "مربوطة" : "غير مربوطة"}
                      badge
                      badgeColor={store.payment_config ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                    />
                    <InfoRow
                      label="تاريخ الإنشاء"
                      value={store.created_at ? new Date(store.created_at).toLocaleDateString("ar-SA") : "—"}
                    />
                  </div>

                  <Link
                    href="/dashboard/shipping"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                  >
                    <Settings className="h-4 w-4" />
                    تعديل الإعدادات
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </SellerShell>
    </>
  );
}

function ProductCard({ product }: { product: StoreProduct }) {
  const imageUrl = product.primary_image?.url
    ?? product.images?.find((i) => i.is_primary)?.url
    ?? product.images?.[0]?.url;

  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-100 bg-white transition hover:shadow-md">
      {imageUrl ? (
        <div className="h-32 overflow-hidden bg-zinc-100">
          <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center bg-zinc-50">
          <Package className="h-8 w-8 text-zinc-300" />
        </div>
      )}
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <span className="line-clamp-1 text-sm font-semibold text-zinc-900">{product.name}</span>
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] ${
            product.status === "active" ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"
          }`}>
            {product.status === "active" ? "نشط" : "مسودة"}
          </span>
        </div>
        <span className="text-sm font-bold text-emerald-700">
          {Number(product.price).toLocaleString("ar-SA")} ر.س
        </span>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  badge,
  badgeColor,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  badge?: boolean;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-zinc-500">{label}</span>
      {badge ? (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
          {value}
        </span>
      ) : (
        <span className={`text-sm text-zinc-900 ${mono ? "font-mono text-xs" : ""}`} dir={mono ? "ltr" : undefined}>
          {value || "—"}
        </span>
      )}
    </div>
  );
}

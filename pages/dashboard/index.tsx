import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Edit3,
  ExternalLink,
  LayoutDashboard,
  Package,
  Plus,
  Rocket,
  Settings,
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
  const [activating, setActivating] = useState(false);
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

  const canActivate = store?.status === "draft" && !!store.payment_config && (stats?.active_products ?? 0) > 0;

  const activateStore = async () => {
    if (!canActivate) return;
    setActivating(true);
    try {
      await sellerApi.activateStore();
      await load();
    } catch {
      /* skip */
    } finally {
      setActivating(false);
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
              {/* الإحصائيات */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: "المنتجات النشطة", total: stats?.total_products, value: stats?.active_products, icon: Package, color: "text-emerald-700 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-950", bg: "bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-zinc-800 dark:to-zinc-800 border-emerald-100/60 dark:border-zinc-700" },
                  { label: "الطلبات", value: stats?.total_orders, icon: ShoppingCart, color: "text-violet-700 dark:text-violet-400", iconBg: "bg-violet-100 dark:bg-violet-950", bg: "bg-gradient-to-br from-violet-50 to-purple-50/50 dark:from-zinc-800 dark:to-zinc-800 border-violet-100/60 dark:border-zinc-700" },
                  { label: "طلبات معلقة", value: stats?.pending_orders, icon: Clock, color: "text-amber-700 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-950", bg: "bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-zinc-800 dark:to-zinc-800 border-amber-100/60 dark:border-zinc-700" },
                  { label: "إجمالي المبيعات", value: stats?.total_revenue != null ? `${Number(stats.total_revenue).toLocaleString("ar-SA")} ر.س` : null, icon: DollarSign, color: "text-sky-700 dark:text-sky-400", iconBg: "bg-sky-100 dark:bg-sky-950", bg: "bg-gradient-to-br from-sky-50 to-blue-50/50 dark:from-zinc-800 dark:to-zinc-800 border-sky-100/60 dark:border-zinc-700" },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-2xl border p-4 space-y-2 ${stat.bg}`}>
                    <div className={`h-8 w-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {stat.value ?? "—"}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {stat.label}
                      {"total" in stat && stat.total != null && (
                        <span className="text-zinc-400 dark:text-zinc-500"> / {stat.total} إجمالي</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* التبويبات */}
              <div className="border-b border-zinc-200 dark:border-zinc-800">
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
                          ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                          : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
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
                    <div className={`rounded-2xl border p-5 text-sm ${canActivate ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 dark:border-emerald-800" : "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800"}`}>
                      <div className="flex items-start gap-3">
                        {canActivate ? (
                          <Rocket className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
                        )}
                        <div className="flex-1">
                          <strong className={canActivate ? "text-emerald-900 dark:text-emerald-200" : "text-yellow-800 dark:text-yellow-200"}>
                            {canActivate ? "متجرك جاهز للتفعيل!" : "متجرك في وضع المسودة"}
                          </strong>
                          {!canActivate && (
                            <>
                              <p className="mt-1 text-yellow-700 dark:text-yellow-300">لتفعيل المتجر يجب:</p>
                              <ul className="mt-1 list-disc space-y-0.5 pr-5">
                                <li className={store.payment_config ? "text-yellow-500 dark:text-yellow-600 line-through" : "text-yellow-800 dark:text-yellow-200"}>
                                  <Link href="/dashboard/payment" className="hover:underline">ربط بوابة دفع (PayMob)</Link>
                                </li>
                                <li className={(stats?.active_products ?? 0) > 0 ? "text-yellow-500 dark:text-yellow-600 line-through" : "text-yellow-800 dark:text-yellow-200"}>
                                  <Link href="/dashboard/products/new" className="hover:underline">إضافة منتج واحد على الأقل</Link>
                                </li>
                              </ul>
                            </>
                          )}
                          {canActivate && (
                            <p className="mt-1 text-emerald-700 dark:text-emerald-300 text-xs">
                              بوابة الدفع مربوطة ولديك منتج نشط — فعّل متجرك ليظهر للعملاء
                            </p>
                          )}
                        </div>
                        {canActivate && (
                          <button
                            type="button"
                            onClick={activateStore}
                            disabled={activating}
                            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 disabled:opacity-60 transition"
                          >
                            <Rocket className="h-4 w-4" />
                            {activating ? "جاري التفعيل..." : "فعّل المتجر الآن"}
                          </button>
                        )}
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
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">آخر المنتجات</h3>
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
                    <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 py-8 text-center">
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
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
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
                    <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 py-12 text-center">
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
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
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

  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/dashboard/products/${product.id}`} className="group overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition hover:shadow-md block">
      {imageUrl && !imgError ? (
        <div className="h-32 overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
          <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" onError={() => setImgError(true)} />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
            <Edit3 className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition drop-shadow-lg" />
          </div>
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center bg-zinc-50 dark:bg-zinc-800 relative">
          <Package className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
            <Edit3 className="h-5 w-5 text-zinc-400 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>
      )}
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <span className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{product.name}</span>
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] ${
            product.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}>
            {product.status === "active" ? "نشط" : "مسودة"}
          </span>
        </div>
        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
          {Number(product.price).toLocaleString("ar-SA")} ر.س
        </span>
      </div>
    </Link>
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
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      {badge ? (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
          {value}
        </span>
      ) : (
        <span className={`text-sm text-zinc-900 dark:text-zinc-100 ${mono ? "font-mono text-xs" : ""}`} dir={mono ? "ltr" : undefined}>
          {value || "—"}
        </span>
      )}
    </div>
  );
}

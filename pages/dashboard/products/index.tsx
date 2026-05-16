import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Package, Plus, Trash2, Edit3, Eye } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";

interface StoreProduct {
  id: number;
  name: string;
  price: string;
  status: string;
  sku: string | null;
  created_at: string;
  primary_image?: { url: string } | null;
  images?: { url: string; is_primary?: boolean }[];
}

export default function ProductsListPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("stores_token");
    if (!t) {
      router.replace("/auth/login?returnUrl=/dashboard/products");
      return;
    }
    setReady(true);
    load();
  }, [router]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await sellerApi.getProducts();
      const d = res.data;
      setProducts((d?.products ?? d?.data ?? []) as StoreProduct[]);
    } catch {
      /* skip */
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل تريد حذف هذا المنتج؟")) return;
    setDeleting(id);
    try {
      await sellerApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("فشل حذف المنتج");
    } finally {
      setDeleting(null);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-zinc-400 text-sm bg-gray-50 dark:bg-zinc-950">
        جاري التحميل...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>المنتجات — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="المنتجات"
        subtitle="عرض وإدارة جميع منتجاتك"
        icon={Package}
        hasStore
        actions={
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            أضف منتج
          </Link>
        }
      >
        <div className="mx-auto max-w-4xl space-y-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 py-16 text-center">
              <Package className="mx-auto mb-4 h-14 w-14 text-gray-300 dark:text-zinc-600" />
              <p className="mb-2 text-base font-semibold text-gray-700 dark:text-zinc-200">لم تضف منتجات بعد</p>
              <p className="mb-5 text-sm text-gray-400 dark:text-zinc-500">أضف أول منتج لمتجرك وابدأ البيع</p>
              <Link
                href="/dashboard/products/new"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                <Plus className="h-4 w-4" />
                أضف أول منتج
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                  جميع المنتجات ({products.length})
                </h2>
              </div>

              <div className="space-y-3">
                {products.map((product) => {
                  const imageUrl =
                    product.primary_image?.url ??
                    product.images?.find((i) => i.is_primary)?.url ??
                    product.images?.[0]?.url;

                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition hover:shadow-sm"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="h-16 w-16 rounded-xl object-cover bg-gray-100 dark:bg-zinc-800 shrink-0"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800 shrink-0">
                          <Package className="h-6 w-6 text-gray-300 dark:text-zinc-600" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate">
                            {product.name}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              product.status === "active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}
                          >
                            {product.status === "active" ? "نشط" : "مسودة"}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">
                            {Number(product.price).toLocaleString("ar-SA")} ر.س
                          </span>
                          {product.sku && (
                            <span className="text-gray-400 dark:text-zinc-500">SKU: {product.sku}</span>
                          )}
                          <span className="text-gray-400 dark:text-zinc-500">
                            {product.created_at
                              ? new Date(product.created_at).toLocaleDateString("ar-SA")
                              : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="rounded-lg p-2 text-gray-400 dark:text-zinc-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition disabled:opacity-40"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </SellerShell>
    </>
  );
}

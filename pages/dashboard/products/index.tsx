import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Package, Plus, Trash2, Edit3, Eye } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";

interface StoreProduct {
  id: string | number;
  name: string;
  price: string;
  status: string;
  sku: string | null;
  created_at: string;
  primary_image?: { url: string } | null;
  images?: { url: string; is_primary?: boolean }[];
}

interface ProductsPagination {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface PaginatorMeta {
  current_page?: unknown;
  last_page?: unknown;
  per_page?: unknown;
  total?: unknown;
  from?: unknown;
  to?: unknown;
}

interface ProductsPayload extends PaginatorMeta {
  products?: StoreProduct[];
  data?: StoreProduct[];
  meta?: PaginatorMeta;
}

const PRODUCTS_PER_PAGE = 50;

const defaultPagination: ProductsPagination = {
  currentPage: 1,
  lastPage: 1,
  perPage: PRODUCTS_PER_PAGE,
  total: 0,
  from: null,
  to: null,
};

function numberOr(value: unknown, fallback: number): number {
  const next = Number(value);
  return Number.isFinite(next) && next > 0 ? next : fallback;
}

function nullableNumber(value: unknown): number | null {
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

function readPagination(payload: ProductsPayload | undefined, count: number, requestedPage: number): ProductsPagination {
  const meta: PaginatorMeta = payload?.meta ?? payload ?? {};

  return {
    currentPage: numberOr(meta.current_page, requestedPage),
    lastPage: numberOr(meta.last_page, 1),
    perPage: numberOr(meta.per_page, PRODUCTS_PER_PAGE),
    total: Number.isFinite(Number(meta.total)) ? Number(meta.total) : count,
    from: nullableNumber(meta.from),
    to: nullableNumber(meta.to),
  };
}

export default function ProductsListPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState("");
  const [pagination, setPagination] = useState<ProductsPagination>(defaultPagination);

  const load = useCallback(async (requestedPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const storeRes = await sellerApi.getMyStore();
      const store = storeRes.data?.store;
      if (!store) {
        router.replace("/stores/new");
        return;
      }
      setStoreSlug(store.slug || "");

      const res = await sellerApi.getProducts({
        page: requestedPage,
        per_page: PRODUCTS_PER_PAGE,
      });
      const d = res.data as ProductsPayload | undefined;
      const nextProducts = d?.products ?? d?.data ?? [];
      setProducts(nextProducts);
      setPagination(readPagination(d, nextProducts.length, requestedPage));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err.response?.data?.message ?? err.message ?? "تعذر تحميل المنتجات حالياً.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const t = localStorage.getItem("stores_token");
    if (!t) {
      router.replace("/auth/login?returnUrl=/dashboard/products");
      return;
    }
    setReady(true);
    load(1);
  }, [load, router]);

  const handleDelete = async (id: string | number) => {
    if (!confirm("هل تريد حذف هذا المنتج؟")) return;
    setDeleting(id);
    try {
      await sellerApi.deleteProduct(id);
      const nextPage =
        products.length === 1 && pagination.currentPage > 1
          ? pagination.currentPage - 1
          : pagination.currentPage;
      await load(nextPage);
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
        storeSlug={storeSlug}
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
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : null}

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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                  جميع المنتجات ({pagination.total || products.length})
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  عرض {pagination.from ?? 1} - {pagination.to ?? products.length} من {pagination.total || products.length} منتج
                </p>
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
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className="rounded-lg p-2 text-gray-400 dark:text-zinc-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                          title="تعديل"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        {storeSlug ? (
                          <Link
                            href={`/${storeSlug}/products/${product.id}?preview=true`}
                            className="rounded-lg p-2 text-gray-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                            title="معاينة"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        ) : null}
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

              {pagination.lastPage > 1 ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-center text-xs text-gray-500 dark:text-zinc-400 sm:text-start">
                    الصفحة {pagination.currentPage} من {pagination.lastPage} - {pagination.perPage} منتج في كل صفحة
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => load(pagination.currentPage - 1)}
                      disabled={loading || pagination.currentPage <= 1}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      السابقة
                    </button>
                    <button
                      type="button"
                      onClick={() => load(pagination.currentPage + 1)}
                      disabled={loading || pagination.currentPage >= pagination.lastPage}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      التالية
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </SellerShell>
    </>
  );
}

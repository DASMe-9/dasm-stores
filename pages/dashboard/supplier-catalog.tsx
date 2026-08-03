import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Boxes, Check, ChevronLeft, ChevronRight, PackagePlus, RefreshCw, Search } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";

type CatalogProduct = {
  id: string;
  title: string;
  images: string[];
  wholesale_price: string;
  suggested_price?: string | null;
  currency: string;
  stock_quantity: number;
  category?: string | null;
  adopted: boolean;
};

type CatalogResponse = {
  data: CatalogProduct[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    categories: string[];
  };
};

const emptyResponse: CatalogResponse = {
  data: [],
  meta: { current_page: 1, last_page: 1, per_page: 24, total: 0 },
  filters: { categories: [] },
};

function catalogLoadErrorMessage(error: unknown) {
  const typed = error as {
    response?: {
      status?: number;
      data?: { message?: string; code?: string };
    };
  };
  const status = typed.response?.status;
  const response = typed.response?.data;

  if (status === 403 && response?.code === "supplier_catalog_store_suspended") {
    return response.message ?? "لا يمكن استخدام كتالوج الموردين لأن المتجر معلّق حاليًا.";
  }
  if (status === 403 && response?.code === "supplier_catalog_subscription_required") {
    return response.message ?? "يتاح كتالوج الموردين بعد اعتماد المتجر أو خلال الفترة التجريبية السارية.";
  }
  if (status === 422) {
    return "تعذر تطبيق عوامل البحث. حدّث الصفحة ثم حاول مرة أخرى.";
  }
  if (status !== undefined && status >= 500) {
    return "خدمة كتالوج الموردين غير متاحة مؤقتًا. حاول مرة أخرى بعد قليل.";
  }
  if (status === undefined) {
    return "تعذر الاتصال بخدمة كتالوج الموردين. تحقق من اتصالك ثم حاول مرة أخرى.";
  }

  return response?.message ?? "تعذر تحميل كتالوج الموردين حاليًا.";
}

function money(value: string | null | undefined, currency = "SAR") {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: currency || "SAR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export default function SupplierCatalogPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adopting, setAdopting] = useState(false);
  const [catalog, setCatalog] = useState<CatalogResponse>(emptyResponse);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [storeSlug, setStoreSlug] = useState("");
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage((current) => (current?.error ? null : current));
    try {
      const storeResponse = await sellerApi.getMyStore();
      const store = storeResponse.data?.store;
      if (!store) {
        router.replace("/stores/new");
        return;
      }
      setStoreSlug(store.slug || "");

      const response = await sellerApi.getSupplierCatalog({
        q: query || undefined,
        category: category || undefined,
        page,
        per_page: 24,
        in_stock: 1,
      });
      setCatalog(response.data as CatalogResponse);
      setSelected(new Set());
    } catch (error: unknown) {
      setMessage({
        text: catalogLoadErrorMessage(error),
        error: true,
      });
    } finally {
      setLoading(false);
    }
  }, [category, page, query, router]);

  useEffect(() => {
    if (!localStorage.getItem("stores_token")) {
      router.replace("/auth/login?returnUrl=/dashboard/supplier-catalog");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (ready) void load();
  }, [load, ready]);

  const selectableIds = useMemo(
    () => catalog.data.filter((product) => !product.adopted).map((product) => product.id),
    [catalog.data],
  );

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const nextQuery = searchInput.trim();
    setQuery(nextQuery);
    if (page !== 1) setPage(1);
    else if (nextQuery === query) void load();
  }

  function toggleProduct(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function adoptSelected() {
    if (selected.size === 0 || adopting) return;
    setAdopting(true);
    setMessage(null);
    try {
      const response = await sellerApi.adoptSupplierProducts([...selected]);
      const result = response.data?.data as { adopted?: number; unavailable?: number } | undefined;
      setMessage({
        text: `أضيف ${result?.adopted ?? 0} منتج إلى متجرك${result?.unavailable ? `، وتعذر اعتماد ${result.unavailable} غير متاح` : ""}.`,
      });
      await load();
    } catch (error: unknown) {
      const typed = error as { response?: { data?: { message?: string } } };
      setMessage({
        text: typed.response?.data?.message ?? "تعذر إضافة المنتجات المختارة.",
        error: true,
      });
    } finally {
      setAdopting(false);
    }
  }

  if (!ready) {
    return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />;
  }

  return (
    <>
      <Head>
        <title>كتالوج الموردين — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="كتالوج الموردين"
        subtitle="اختر منتجات جاهزة من الموردين المعتمدين وأضفها إلى متجرك دون إدخال يدوي."
        icon={Boxes}
        hasStore
        storeSlug={storeSlug}
        actions={
          <button
            type="button"
            onClick={() => void adoptSelected()}
            disabled={selected.size === 0 || adopting}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {adopting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
            إضافة المحدد ({selected.size})
          </button>
        }
      >
        <div className="mx-auto max-w-7xl space-y-5">
          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 text-sm leading-7 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
            الأسعار المعروضة تساعدك في اختيار هامش البيع، والمخزون يتبع المورد. بعد الإضافة يمكنك تعديل السعر والوصف من صفحة المنتجات.
          </section>

          {message ? (
            <div className={`rounded-xl border px-4 py-3 text-sm ${message.error ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"}`}>
              {message.text}
            </div>
          ) : null}

          <form onSubmit={submitSearch} className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-[1fr_260px_auto]">
            <label className="relative">
              <Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-zinc-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="ابحث باسم المنتج أو رمزه"
                className="h-10 w-full rounded-xl border border-zinc-200 bg-transparent pr-10 pl-3 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700"
              />
            </label>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">كل التصنيفات</option>
              {catalog.filters.categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button type="submit" className="h-10 rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
              بحث
            </button>
          </form>

          <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span>{catalog.meta.total} منتج متاح</span>
            {selectableIds.length > 0 ? (
              <button
                type="button"
                onClick={() => setSelected(new Set(selected.size === selectableIds.length ? [] : selectableIds))}
                className="font-semibold text-emerald-700 dark:text-emerald-300"
              >
                {selected.size === selectableIds.length ? "إلغاء تحديد الصفحة" : "تحديد الصفحة"}
              </button>
            ) : null}
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />)}
            </div>
          ) : catalog.data.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 py-20 text-center text-zinc-500 dark:border-zinc-700">
              لا توجد منتجات مطابقة حاليًا.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {catalog.data.map((product) => {
                const isSelected = selected.has(product.id);
                return (
                  <article key={product.id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition dark:bg-zinc-900 ${isSelected ? "border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900" : "border-zinc-200 dark:border-zinc-800"}`}>
                    <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.title} fill unoptimized className="object-cover" />
                      ) : (
                        <Boxes className="absolute inset-0 m-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                      )}
                      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-zinc-800 shadow-sm dark:bg-zinc-950/90 dark:text-zinc-100">
                        مورد داسم
                      </span>
                    </div>
                    <div className="space-y-3 p-4">
                      <div>
                        <h2 className="line-clamp-2 min-h-12 font-bold text-zinc-900 dark:text-zinc-100">{product.title}</h2>
                        <p className="mt-1 text-xs text-zinc-500">{product.category || "دون تصنيف"} · المخزون {product.stock_quantity}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-950/60">
                        <div>
                          <span className="block text-zinc-500">سعر المورد</span>
                          <strong>{money(product.wholesale_price, product.currency)}</strong>
                        </div>
                        <div>
                          <span className="block text-zinc-500">سعر مقترح</span>
                          <strong className="text-emerald-700 dark:text-emerald-300">{money(product.suggested_price, product.currency)}</strong>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={product.adopted}
                        onClick={() => toggleProduct(product.id)}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${product.adopted ? "cursor-default bg-zinc-100 text-zinc-500 dark:bg-zinc-800" : isSelected ? "bg-emerald-600 text-white" : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300"}`}
                      >
                        {product.adopted ? <><Check className="h-4 w-4" /> مضاف إلى متجرك</> : isSelected ? <><Check className="h-4 w-4" /> تم التحديد</> : "تحديد المنتج"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-4 py-2 text-sm disabled:opacity-40 dark:border-zinc-700"
            >
              <ChevronRight className="h-4 w-4" /> السابق
            </button>
            <span className="text-sm text-zinc-500">صفحة {catalog.meta.current_page} من {catalog.meta.last_page}</span>
            <button
              type="button"
              disabled={page >= catalog.meta.last_page || loading}
              onClick={() => setPage((current) => current + 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-4 py-2 text-sm disabled:opacity-40 dark:border-zinc-700"
            >
              التالي <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SellerShell>
    </>
  );
}

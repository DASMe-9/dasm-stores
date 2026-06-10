import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Package } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";
import { ProductMediaUploader, type MediaItem } from "@/components/seller/ProductMediaUploader";
import { ProductVariationsBuilder, type Variant, type ProductOption } from "@/components/seller/ProductVariationsBuilder";

type ApiErrorShape = {
  response?: {
    status?: number;
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
  message?: string;
};

function firstErrorMessage(error: unknown, fallback: string): string {
  const err = error as ApiErrorShape;
  const fieldErrors = err.response?.data?.errors;
  if (fieldErrors) {
    const firstField = Object.values(fieldErrors).find((items) => Array.isArray(items) && items.length > 0);
    if (firstField?.[0]) return firstField[0];
  }
  return err.response?.data?.message ?? err.message ?? fallback;
}

export default function NewProductPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    sku: "",
    price: "",
    weight_kg: "1",
    status: "active" as "draft" | "active",
  });

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [productVariants, setProductVariants] = useState<Variant[]>([]);

  const init = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const storeRes = await sellerApi.getMyStore();
      if (!storeRes.data?.store) {
        router.replace("/stores/new");
        return;
      }
    } catch {
      setError("تعذّر تحميل بيانات المتجر حالياً. حاول مرة أخرى بعد قليل.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const t = localStorage.getItem("stores_token");
    if (!t) {
      router.replace("/auth/login?returnUrl=/dashboard/products/new");
      return;
    }
    setReady(true);
    init();
  }, [init, router]);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      if (!form.name.trim() || !form.price.trim()) {
        setError("الاسم والسعر مطلوبان.");
        setSaving(false);
        return;
      }

      const numericPrice = Number(form.price);
      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        setError("يرجى إدخال سعر صحيح.");
        setSaving(false);
        return;
      }

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        sku: form.sku.trim() || undefined,
        price: numericPrice,
        weight: Number(form.weight_kg) > 0 ? Number(form.weight_kg) : 1,
        status: form.status,
        product_type: "physical",
        images: media.map((m) => ({ url: m.url, is_primary: m.is_primary })),
        variants: productVariants.length > 0
          ? productVariants.map((v) => ({
              name: v.name,
              price: Number(v.price) || numericPrice,
              option_values: v.option_values,
              stock_quantity: 0,
            }))
          : undefined,
      };

      await sellerApi.createProduct(payload);
      router.push("/dashboard/products");
    } catch (e: unknown) {
      setError(firstErrorMessage(e, "تعذّر إنشاء المنتج حالياً."));
    } finally {
      setSaving(false);
    }
  };

  if (!ready || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        جاري التحميل...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>منتج جديد — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="إضافة منتج"
        subtitle="أضف بيانات المنتج وحدد الوزن ليظهر الشحن للعميل بشكل تلقائي أثناء الطلب"
        icon={Package}
        hasStore
        actions={
          <Link
            href="/dashboard/shipping"
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shadow-sm hover:bg-emerald-50 dark:hover:bg-emerald-950"
          >
            إعدادات الشحن
          </Link>
        }
      >
        <div className="mx-auto max-w-xl space-y-6 pb-20">
          <div className="space-y-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">اسم المنتج</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">السعر (ر.س)</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">الوزن للشحن (كجم)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.weight_kg}
                  onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">الحالة</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value === "draft" ? "draft" : "active",
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
                >
                  <option value="active">نشط</option>
                  <option value="draft">مسودة</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">SKU (اختياري)</label>
                <input
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">صور وفيديوهات المنتج</label>
                <span className="text-[11px] text-gray-400">حتى 10 صور، 2 فيديو</span>
              </div>
              <ProductMediaUploader media={media} setMedia={setMedia} />
            </div>

            <div className="space-y-1.5 pt-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">خيارات المتغيرات</h3>
                  <p className="text-xs text-gray-500 mt-0.5">خصص المتغيرات المتاحة لهذا المنتج (مثل المقاسات أو الألوان).</p>
                </div>
              </div>
              <ProductVariationsBuilder
                basePrice={form.price}
                options={productOptions}
                setOptions={setProductOptions}
                variants={productVariants}
                setVariants={setProductVariants}
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">الوصف</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {error ? <p className="text-xs text-red-600">{error}</p> : null}

            <button
              type="button"
              onClick={() => submit()}
              disabled={saving}
              className="w-full rounded-xl bg-emerald-600 text-white py-2.5 text-sm font-bold hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "جاري الحفظ..." : "حفظ المنتج"}
            </button>
          </div>
        </div>
      </SellerShell>
    </>
  );
}

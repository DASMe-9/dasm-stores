import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Package, Upload, X as XIcon } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi, uploadApi } from "@/lib/api";

export default function NewProductPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tabs, setTabs] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    sku: "",
    price: "",
    weight_kg: "1",
    tab_id: "",
    status: "active" as "draft" | "active",
    primary_image_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = localStorage.getItem("stores_token");
    if (!t) {
      router.replace("/auth/login?returnUrl=/dashboard/products/new");
      return;
    }
    setReady(true);
    init();
  }, [router]);

  const init = async () => {
    setLoading(true);
    try {
      const storeRes = await sellerApi.getMyStore();
      if (!storeRes.data?.store) {
        router.replace("/stores/new");
        return;
      }
      const tabsRes = await sellerApi.getTabs();
      const raw = (tabsRes.data as { tabs?: { id: number; name: string }[] })?.tabs ?? [];
      const mapped = raw.map((x) => ({ id: x.id, name: x.name }));
      setTabs(mapped);
      if (mapped.length) {
        setForm((f) => ({ ...f, tab_id: f.tab_id || String(mapped[0].id) }));
      }
    } catch {
      setError("تعذّر تحميل التابات — أنشئ تاباً من الـ API أو من لوحة لاحقة.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError("حجم الصورة يجب أن يكون أقل من 8 ميقابايت");
      return;
    }

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    setError(null);
    try {
      const { data } = await uploadApi.uploadMedia(file, "store_product_image");
      setForm((f) => ({ ...f, primary_image_url: data.secure_url }));
    } catch {
      setError("فشل رفع الصورة — تأكد من اتصال الإنترنت وحاول مجدداً");
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, primary_image_url: "" }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      if (!form.name.trim() || !form.price.trim()) {
        setError("الاسم والسعر مطلوبان.");
        setSaving(false);
        return;
      }

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        sku: form.sku.trim() || undefined,
        price: Number(form.price),
        weight: Number(form.weight_kg) > 0 ? Number(form.weight_kg) : 1,
        status: form.status,
        product_type: "physical",
      };

      if (form.tab_id) payload.tab_id = parseInt(form.tab_id, 10);

      if (form.primary_image_url.trim()) {
        payload.images = [
          {
            url: form.primary_image_url.trim(),
            is_primary: true,
          },
        ];
      }

      await sellerApi.createProduct(payload);
      router.push("/dashboard");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? "فشل إنشاء المنتج");
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
        subtitle="يُستخدم وزن المنتج مع Tryoto لعرض تكلفة الشحن في الدفع"
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
        <div className="mx-auto max-w-xl space-y-6">
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">التبويب</label>
              <select
                value={form.tab_id}
                onChange={(e) => setForm((f) => ({ ...f, tab_id: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
              >
                {tabs.length === 0 ? (
                  <option value="">— لا توجد تبويبات — أنشئ tab عبر API أولاً</option>
                ) : (
                  tabs.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))
                )}
              </select>
            </div>

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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">صورة المنتج</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={handleFileSelect}
                className="hidden"
              />
              {imagePreview || form.primary_image_url ? (
                <div className="relative w-full aspect-square max-w-[200px] rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700">
                  <img
                    src={imagePreview || form.primary_image_url}
                    alt="معاينة"
                    className="w-full h-full object-cover"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <div className="h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 py-8 text-gray-400 dark:text-zinc-500 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  <Upload className="w-8 h-8" />
                  <span className="text-sm">اضغط لاختيار صورة من جهازك</span>
                  <span className="text-[10px]">JPG, PNG, WebP — حتى 8 ميقابايت</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5">
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

            {tabs.length === 0 ? (
              <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800 rounded-xl p-3">
                لا توجد تبويبات للمتجر بعد. أنشئ تاباً واحداً على الأقل عبر{" "}
                <code className="rounded bg-amber-100 dark:bg-amber-900/30 px-1">POST /api/stores/my-store/tabs</code> ثم أعد
                فتح الصفحة، أو استخدم أداة مثل Postman بتوكنك.
              </p>
            ) : null}
          </div>
        </div>
      </SellerShell>
    </>
  );
}

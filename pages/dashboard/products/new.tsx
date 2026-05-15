import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";

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
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50"
          >
            إعدادات الشحن
          </Link>
        }
      >
        <div className="mx-auto max-w-xl space-y-6">
          <div className="space-y-4 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">اسم المنتج</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">السعر (ر.س)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">الوزن للشحن (كجم)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.weight_kg}
                onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">التبويب</label>
              <select
                value={form.tab_id}
                onChange={(e) => setForm((f) => ({ ...f, tab_id: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white"
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
              <label className="text-sm font-medium text-gray-700">الحالة</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value === "draft" ? "draft" : "active",
                  }))
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white"
              >
                <option value="active">نشط</option>
                <option value="draft">مسودة</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">SKU (اختياري)</label>
              <input
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">صورة رئيسية (URL)</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.primary_image_url}
                onChange={(e) => setForm((f) => ({ ...f, primary_image_url: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-left"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">الوصف</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
                لا توجد تبويبات للمتجر بعد. أنشئ تاباً واحداً على الأقل عبر{" "}
                <code className="rounded bg-amber-100 px-1">POST /api/stores/my-store/tabs</code> ثم أعد
                فتح الصفحة، أو استخدم أداة مثل Postman بتوكنك.
              </p>
            ) : null}
          </div>
        </div>
      </SellerShell>
    </>
  );
}

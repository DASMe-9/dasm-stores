import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";

export default function DashboardShippingSettingsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    tryoto_shipping_enabled: false,
    shipping_origin_city: "",
    shipping_markup_sar: "10",
    shipping_extra_per_kg_sar: "0",
    parcel_length_cm: "",
    parcel_width_cm: "",
    parcel_height_cm: "",
  });

  useEffect(() => {
    const t = localStorage.getItem("stores_token");
    if (!t) {
      router.replace("/auth/login?returnUrl=/dashboard/shipping");
      return;
    }
    setReady(true);
    load();
  }, [router]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await sellerApi.getMyStore();
      const store = res.data?.store;
      if (!store) {
        router.replace("/stores/new");
        return;
      }
      setForm({
        tryoto_shipping_enabled: Boolean(store.tryoto_shipping_enabled),
        shipping_origin_city: store.shipping_origin_city ?? "",
        shipping_markup_sar: String(store.shipping_markup_sar ?? "10"),
        shipping_extra_per_kg_sar: String(store.shipping_extra_per_kg_sar ?? "0"),
        parcel_length_cm: store.parcel_length_cm != null ? String(store.parcel_length_cm) : "",
        parcel_width_cm: store.parcel_width_cm != null ? String(store.parcel_width_cm) : "",
        parcel_height_cm: store.parcel_height_cm != null ? String(store.parcel_height_cm) : "",
      });
    } catch {
      setError("تعذّر تحميل إعدادات المتجر");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await sellerApi.updateStore({
        tryoto_shipping_enabled: form.tryoto_shipping_enabled,
        shipping_origin_city: form.shipping_origin_city.trim() || null,
        shipping_markup_sar: Number(form.shipping_markup_sar),
        shipping_extra_per_kg_sar: Number(form.shipping_extra_per_kg_sar),
        parcel_length_cm: form.parcel_length_cm.trim()
          ? parseInt(form.parcel_length_cm, 10)
          : null,
        parcel_width_cm: form.parcel_width_cm.trim()
          ? parseInt(form.parcel_width_cm, 10)
          : null,
        parcel_height_cm: form.parcel_height_cm.trim()
          ? parseInt(form.parcel_height_cm, 10)
          : null,
      });
      setMessage("تم حفظ إعدادات الشحن والأسعار.");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? "تعذّر الحفظ");
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
        <title>إعدادات الشحن — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="شحن Tryoto (أوتو)"
        subtitle="التجميع من ship.dasm.com.sa — يظهر للعميل في الدفع"
        icon={Truck}
        hasStore
        actions={
          <Link
            href="/dashboard"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50"
          >
            لوحتي
          </Link>
        }
      >
        <div className="mx-auto max-w-xl space-y-6">
          <div className="space-y-5 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.tryoto_shipping_enabled}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tryoto_shipping_enabled: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-semibold text-gray-900">
                تفعيل أسعار الشحن الفورية للعملاء عبر التجميع
              </span>
            </label>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">مدينة الشحن (من مخزنك)</label>
              <input
                placeholder="مثال: الرياض"
                value={form.shipping_origin_city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, shipping_origin_city: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-gray-400">
                يجب مطابقة تسمية المدينة بقدر الإمكان لما تعتمده شبكة التجميع.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">رسوم المنصّة (ر.س / ثابت)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.shipping_markup_sar}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, shipping_markup_sar: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">طبقة وزن (ر.س / كجم فوق الأول)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.shipping_extra_per_kg_sar}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, shipping_extra_per_kg_sar: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(["parcel_length_cm", "parcel_width_cm", "parcel_height_cm"] as const).map((k) => (
                <div key={k} className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-600">
                    {k === "parcel_length_cm" ? "طول سم" : k === "parcel_width_cm" ? "عرض سم" : "ارتفاع سم"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="اختياري"
                    value={form[k]}
                    onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-2 py-2 text-xs"
                  />
                </div>
              ))}
            </div>

            {error ? (
              <p className="text-xs text-red-600">{error}</p>
            ) : null}
            {message ? (
              <p className="text-xs text-emerald-700">{message}</p>
            ) : null}

            <button
              type="button"
              onClick={() => save()}
              disabled={saving}
              className="w-full rounded-xl bg-emerald-600 text-white py-2.5 text-sm font-bold hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </button>

            <p className="text-[11px] leading-relaxed text-gray-500">
              الأسعار تُجلب من <strong>dasm-shipping</strong> (Tryoto). تأكّد أن المتغير{" "}
              <code className="rounded bg-gray-100 px-1">DASM_SHIPPING_URL</code> مضبوطاً على الخادم.
              لا يزال بإمكانك استخدام طرق الشحن الثابتة من لوحة الـ API{" "}
              <code className="rounded bg-gray-100 px-1">shipping-config</code> إلى جانب Tryoto أو بدله.
            </p>
          </div>
        </div>
      </SellerShell>
    </>
  );
}

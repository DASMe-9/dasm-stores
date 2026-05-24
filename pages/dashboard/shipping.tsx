import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";

type StoreShippingConfig = {
  id: number | string;
  provider?: string | null;
  flat_rate?: number | string | null;
  free_above_amount?: number | string | null;
  estimated_days?: number | string | null;
  is_active?: boolean | null;
};

type StoreShippingData = {
  tryoto_shipping_enabled?: boolean | null;
  shipping_origin_city?: string | null;
  shipping_markup_sar?: number | string | null;
  shipping_extra_per_kg_sar?: number | string | null;
  parcel_length_cm?: number | string | null;
  parcel_width_cm?: number | string | null;
  parcel_height_cm?: number | string | null;
  shipping_configs?: StoreShippingConfig[];
  shippingConfigs?: StoreShippingConfig[];
};

const tryotoInitial = {
  tryoto_shipping_enabled: false,
  shipping_origin_city: "",
  shipping_markup_sar: "10",
  shipping_extra_per_kg_sar: "0",
  parcel_length_cm: "",
  parcel_width_cm: "",
  parcel_height_cm: "",
};

const flatInitial = {
  enabled: false,
  flat_rate: "25",
  free_above_amount: "",
  estimated_days: "3",
};

function toOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : Number.NaN;
}

function toOptionalInteger(value: string): number | null {
  const parsed = toOptionalNumber(value);
  if (parsed == null || Number.isNaN(parsed)) return parsed;
  return Math.trunc(parsed);
}

function isInvalid(value: number | null): value is number {
  return Number.isNaN(value);
}

export default function DashboardShippingSettingsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [flatConfigId, setFlatConfigId] = useState<number | string | null>(null);

  const [form, setForm] = useState(tryotoInitial);
  const [flatForm, setFlatForm] = useState(flatInitial);

  const applyFlatConfig = useCallback((configs: StoreShippingConfig[]) => {
    const config =
      configs.find((item) => item.provider === "custom") ??
      configs.find((item) => item.is_active !== false) ??
      configs[0] ??
      null;

    if (!config) {
      setFlatConfigId(null);
      setFlatForm(flatInitial);
      return;
    }

    setFlatConfigId(config.id);
    setFlatForm({
      enabled: config.is_active !== false,
      flat_rate: String(config.flat_rate ?? "25"),
      free_above_amount: config.free_above_amount != null ? String(config.free_above_amount) : "",
      estimated_days: config.estimated_days != null ? String(config.estimated_days) : "3",
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const storeRes = await sellerApi.getMyStore();
      const store = storeRes.data?.store as StoreShippingData | null | undefined;
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

      const configsRes = await sellerApi.getShippingConfigs().catch(() => null);
      const responseConfigs =
        (configsRes?.data as { shipping_configs?: StoreShippingConfig[] } | undefined)
          ?.shipping_configs ?? [];
      applyFlatConfig(responseConfigs.length ? responseConfigs : store.shipping_configs ?? store.shippingConfigs ?? []);
    } catch {
      setError("تعذّر تحميل إعدادات الشحن للمتجر.");
    } finally {
      setLoading(false);
    }
  }, [applyFlatConfig, router]);

  useEffect(() => {
    const token = localStorage.getItem("stores_token");
    if (!token) {
      router.replace("/auth/login?returnUrl=/dashboard/shipping");
      return;
    }
    setReady(true);
    load();
  }, [load, router]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const markup = toOptionalNumber(form.shipping_markup_sar);
      const extraPerKg = toOptionalNumber(form.shipping_extra_per_kg_sar);
      const length = toOptionalInteger(form.parcel_length_cm);
      const width = toOptionalInteger(form.parcel_width_cm);
      const height = toOptionalInteger(form.parcel_height_cm);
      const flatRate = toOptionalNumber(flatForm.flat_rate);
      const freeAbove = toOptionalNumber(flatForm.free_above_amount);
      const estimatedDays = toOptionalInteger(flatForm.estimated_days);

      if (form.tryoto_shipping_enabled && form.shipping_origin_city.trim().length < 2) {
        setError("حدد مدينة الشحن من مخزنك قبل تفعيل Tryoto.");
        return;
      }

      if ([markup, extraPerKg, length, width, height].some(isInvalid)) {
        setError("راجع أرقام Tryoto والأبعاد، يجب أن تكون قيماً صحيحة أو اتركها فارغة.");
        return;
      }

      if ([length, width, height].some((value) => value != null && value < 1)) {
        setError("الأبعاد الاختيارية يجب أن تكون أكبر من صفر.");
        return;
      }

      if (flatForm.enabled && (flatRate == null || isInvalid(flatRate))) {
        setError("حدد سعر الشحن الثابت بشكل صحيح.");
        return;
      }

      if (isInvalid(freeAbove) || isInvalid(estimatedDays)) {
        setError("راجع حد الشحن المجاني وعدد أيام التسليم.");
        return;
      }

      if (estimatedDays != null && estimatedDays < 1) {
        setError("عدد أيام التسليم يجب أن يكون يوماً واحداً على الأقل.");
        return;
      }

      await sellerApi.updateStore({
        tryoto_shipping_enabled: form.tryoto_shipping_enabled,
        shipping_origin_city: form.shipping_origin_city.trim() || null,
        shipping_markup_sar: markup ?? 0,
        shipping_extra_per_kg_sar: extraPerKg ?? 0,
        parcel_length_cm: length,
        parcel_width_cm: width,
        parcel_height_cm: height,
      });

      if (flatForm.enabled) {
        const payload = {
          flat_rate: flatRate ?? 0,
          free_above_amount: freeAbove,
          estimated_days: estimatedDays ?? 3,
          is_active: true,
        };

        if (flatConfigId != null) {
          await sellerApi.updateShippingConfig(Number(flatConfigId), payload);
        } else {
          const { data } = await sellerApi.createShippingConfig({
            provider: "custom",
            ...payload,
          });
          const created = data as { shipping_config?: StoreShippingConfig };
          setFlatConfigId(created.shipping_config?.id ?? null);
        }
      } else if (flatConfigId != null) {
        await sellerApi.updateShippingConfig(Number(flatConfigId), { is_active: false });
      }

      setMessage("تم حفظ إعدادات الشحن وربطها بصفحة الدفع.");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? "تعذّر حفظ إعدادات الشحن.");
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
        <title>إعدادات الشحن - متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="إعدادات الشحن"
        subtitle="اضبط Tryoto والشحن الثابت ليظهر خيار صحيح للعميل في صفحة الدفع"
        icon={Truck}
        hasStore
        actions={
          <Link
            href="/dashboard"
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            لوحتي
          </Link>
        }
      >
        <div className="mx-auto max-w-2xl space-y-5">
          <div className="space-y-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.tryoto_shipping_enabled}
                onChange={(e) =>
                  setForm((current) => ({ ...current, tryoto_shipping_enabled: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                تفعيل أسعار الشحن الفورية عبر Tryoto
              </span>
            </label>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">مدينة الشحن من المخزن</label>
              <input
                placeholder="مثال: الرياض"
                value={form.shipping_origin_city}
                onChange={(e) =>
                  setForm((current) => ({ ...current, shipping_origin_city: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">هامش المتجر على الشحن</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.shipping_markup_sar}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, shipping_markup_sar: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">زيادة لكل كجم إضافي</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.shipping_extra_per_kg_sar}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, shipping_extra_per_kg_sar: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(["parcel_length_cm", "parcel_width_cm", "parcel_height_cm"] as const).map((key) => (
                <div key={key} className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-600 dark:text-zinc-400">
                    {key === "parcel_length_cm" ? "طول سم" : key === "parcel_width_cm" ? "عرض سم" : "ارتفاع سم"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="اختياري"
                    value={form[key]}
                    onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-2 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={flatForm.enabled}
                onChange={(e) => setFlatForm((current) => ({ ...current, enabled: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                تفعيل الشحن الثابت كخيار يدوي أو بديل عند تعذر Tryoto
              </span>
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">السعر الثابت</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={flatForm.flat_rate}
                  onChange={(e) => setFlatForm((current) => ({ ...current, flat_rate: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">مجاني فوق</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="اختياري"
                  value={flatForm.free_above_amount}
                  onChange={(e) => setFlatForm((current) => ({ ...current, free_above_amount: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">أيام التسليم</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={flatForm.estimated_days}
                  onChange={(e) => setFlatForm((current) => ({ ...current, estimated_days: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-gray-500 dark:text-zinc-400">
              الشحن الثابت يظهر في checkout، ويستخدمه النظام تلقائياً كبديل إذا لم ترجع Tryoto أسعاراً متاحة.
            </p>
          </div>

          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          {message ? <p className="text-xs text-emerald-700">{message}</p> : null}

          <button
            type="button"
            onClick={() => save()}
            disabled={saving}
            className="w-full rounded-xl bg-emerald-600 text-white py-2.5 text-sm font-bold hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "جاري الحفظ..." : "حفظ إعدادات الشحن"}
          </button>
        </div>
      </SellerShell>
    </>
  );
}

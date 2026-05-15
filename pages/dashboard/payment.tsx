import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CreditCard, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";

interface PaymentConfig {
  id?: number;
  provider: string;
  api_key: string;
  secret_key: string;
  is_live: boolean;
  is_active: boolean;
}

export default function PaymentSettingsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [storeStatus, setStoreStatus] = useState<string>("draft");
  const [hasProducts, setHasProducts] = useState(false);

  const [form, setForm] = useState<PaymentConfig>({
    provider: "paymob",
    api_key: "",
    secret_key: "",
    is_live: false,
    is_active: true,
  });
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("stores_token");
    if (!t) {
      router.replace("/auth/login?returnUrl=/dashboard/payment");
      return;
    }
    setReady(true);
    load();
  }, [router]);

  const load = async () => {
    setLoading(true);
    try {
      const [configRes, storeRes, statsRes] = await Promise.allSettled([
        sellerApi.getPaymentConfig(),
        sellerApi.getMyStore(),
        sellerApi.getStats(),
      ]);

      if (configRes.status === "fulfilled" && configRes.value.data?.config) {
        const c = configRes.value.data.config;
        setForm({
          provider: c.provider || "paymob",
          api_key: c.api_key || "",
          secret_key: c.secret_key || "",
          is_live: c.is_live ?? false,
          is_active: c.is_active ?? true,
        });
        setConfigured(!!(c.api_key && c.secret_key && c.is_active));
      }

      if (storeRes.status === "fulfilled" && storeRes.value.data?.store) {
        setStoreStatus(storeRes.value.data.store.status);
      }

      if (statsRes.status === "fulfilled" && statsRes.value.data) {
        setHasProducts((statsRes.value.data.active_products ?? 0) > 0);
      }
    } catch {
      /* skip */
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (!form.api_key.trim() || !form.secret_key.trim()) {
        setError("مفتاح API والمفتاح السري مطلوبان");
        setSaving(false);
        return;
      }
      await sellerApi.updatePaymentConfig(form);
      setConfigured(true);
      setSuccess("تم حفظ إعدادات الدفع بنجاح");
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? "فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const handleActivateStore = async () => {
    setActivating(true);
    setError(null);
    setSuccess(null);
    try {
      await sellerApi.activateStore();
      setStoreStatus("active");
      setSuccess("تم تفعيل المتجر بنجاح! متجرك الآن نشط ويستقبل الطلبات");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? "فشل تفعيل المتجر");
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

  const canActivate = configured && hasProducts && storeStatus === "draft";

  return (
    <>
      <Head>
        <title>بوابة الدفع — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="بوابة الدفع"
        subtitle="ربط PayMob لاستقبال المدفوعات مباشرة في حسابك"
        icon={CreditCard}
        hasStore
      >
        <div className="mx-auto max-w-xl space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-zinc-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {storeStatus === "active" && (
                <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <span>متجرك نشط ويستقبل الطلبات</span>
                </div>
              )}

              {storeStatus === "draft" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div>
                      <strong>متجرك في وضع المسودة</strong>
                      <p className="mt-1 text-amber-700">لتفعيل المتجر أكمل الخطوات التالية:</p>
                      <ul className="mt-1 list-disc space-y-0.5 pr-5">
                        <li className={configured ? "text-amber-500 line-through" : ""}>
                          ربط بوابة دفع (PayMob)
                        </li>
                        <li className={hasProducts ? "text-amber-500 line-through" : ""}>
                          إضافة منتج واحد على الأقل
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-sm font-bold text-zinc-900">إعدادات PayMob</h2>
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed">
                  أدخل مفاتيح PayMob من لوحة تحكم PayMob الخاصة بك.
                  المفاتيح تُشفَّر ولا تظهر لأحد.
                </p>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">مفتاح API (API Key)</label>
                  <input
                    type="password"
                    value={form.api_key}
                    onChange={(e) => setForm((f) => ({ ...f, api_key: e.target.value }))}
                    placeholder="pk_live_..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-left focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">المفتاح السري (Secret Key)</label>
                  <input
                    type="password"
                    value={form.secret_key}
                    onChange={(e) => setForm((f) => ({ ...f, secret_key: e.target.value }))}
                    placeholder="sk_live_..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-left focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_live}
                      onChange={(e) => setForm((f) => ({ ...f, is_live: e.target.checked }))}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    وضع الإنتاج (Live)
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    {form.is_live ? "المدفوعات حقيقية" : "وضع الاختبار (Sandbox)"}
                  </span>
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}
                {success && <p className="text-xs text-emerald-600">{success}</p>}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full rounded-xl bg-emerald-600 text-white py-2.5 text-sm font-bold hover:bg-emerald-700 disabled:opacity-60 transition"
                >
                  {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
                </button>
              </div>

              {canActivate && (
                <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center space-y-3">
                  <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-900">كل المتطلبات مكتملة!</h3>
                  <p className="text-sm text-emerald-700">يمكنك الآن تفعيل متجرك وبدء استقبال الطلبات</p>
                  <button
                    type="button"
                    onClick={handleActivateStore}
                    disabled={activating}
                    className="rounded-xl bg-emerald-600 text-white px-8 py-3 text-sm font-bold hover:bg-emerald-700 disabled:opacity-60 transition"
                  >
                    {activating ? "جاري التفعيل..." : "تفعيل المتجر الآن"}
                  </button>
                </div>
              )}

              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-xs text-zinc-500 leading-relaxed">
                <strong className="text-zinc-700">كيف أحصل على مفاتيح PayMob؟</strong>
                <ol className="mt-2 list-decimal pr-5 space-y-1">
                  <li>سجّل في <span className="font-semibold">accept.paymob.com</span></li>
                  <li>فعّل حسابك وأكمل التوثيق</li>
                  <li>من لوحة التحكم → Settings → API Keys</li>
                  <li>انسخ API Key و Secret Key والصقهم هنا</li>
                </ol>
              </div>
            </>
          )}
        </div>
      </SellerShell>
    </>
  );
}

import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  BadgeCheck,
  Calendar,
  CreditCard,
  Landmark,
  Percent,
  ShieldCheck,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";

type StoreFinance = {
  subscription_status: string;
  trial_ends_at: string | null;
  monthly_fee_sar: number;
  commission_rate: number;
  iban: string | null;
  bank_name: string | null;
  account_holder_name: string | null;
  total_sales: number;
  total_commission: number;
  available_balance: number;
};

type PaymentMethodStatus = {
  key: string;
  label?: string;
  label_ar?: string;
  integration_id?: number | null;
  enabled?: boolean;
};

type PlatformPaymobStatus = {
  enabled: boolean;
  base_url?: string;
  checkout_mode?: string;
  has_secret_key?: boolean;
  has_public_key?: boolean;
  has_hmac_secret?: boolean;
  payment_methods?: PaymentMethodStatus[];
};

type StorePaymentConfigStatus = {
  provider?: string | { value?: string; name?: string };
  is_live?: boolean;
  is_active?: boolean;
  has_keys?: boolean;
};

const emptyFinance: StoreFinance = {
  subscription_status: "trial",
  trial_ends_at: null,
  monthly_fee_sar: 25,
  commission_rate: 0.02,
  iban: null,
  bank_name: null,
  account_holder_name: null,
  total_sales: 0,
  total_commission: 0,
  available_balance: 0,
};

function formatSar(value: number) {
  return `${Number(value || 0).toLocaleString("ar-SA")} ر.س`;
}

function methodIcon(key: string): LucideIcon {
  if (key === "applepay" || key === "stcpay") return Smartphone;
  return CreditCard;
}

function methodName(method: PaymentMethodStatus) {
  return method.label_ar || method.label || method.key;
}

export default function PaymentSettingsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [finance, setFinance] = useState<StoreFinance>(emptyFinance);
  const [platformPaymob, setPlatformPaymob] = useState<PlatformPaymobStatus | null>(null);
  const [storePaymentConfig, setStorePaymentConfig] = useState<StorePaymentConfigStatus | null>(null);
  const [ibanForm, setIbanForm] = useState({
    iban: "",
    bank_name: "",
    account_holder_name: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [storeRes, paymentRes] = await Promise.allSettled([
        sellerApi.getMyStore(),
        sellerApi.getPaymentConfig(),
      ]);

      if (storeRes.status === "fulfilled") {
        const store = storeRes.value.data?.store;
        if (!store) {
          router.replace("/stores/new");
          return;
        }

        const nextFinance: StoreFinance = {
          subscription_status: store.subscription_status || "trial",
          trial_ends_at: store.trial_ends_at,
          monthly_fee_sar: Number(store.monthly_fee_sar ?? 25),
          commission_rate: Number(store.commission_rate ?? 0.02),
          iban: store.iban,
          bank_name: store.bank_name,
          account_holder_name: store.account_holder_name,
          total_sales: Number(store.total_sales ?? 0),
          total_commission: Number(store.total_commission ?? 0),
          available_balance: Number(store.available_balance ?? 0),
        };
        setFinance(nextFinance);
        setIbanForm({
          iban: nextFinance.iban || "",
          bank_name: nextFinance.bank_name || "",
          account_holder_name: nextFinance.account_holder_name || "",
        });
      }

      if (paymentRes.status === "fulfilled") {
        setPlatformPaymob(paymentRes.value.data?.platform_paymob ?? null);
        setStorePaymentConfig(paymentRes.value.data?.payment_config ?? null);
      }
    } catch {
      setError("تعذر تحميل إعدادات المالية والدفع.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("stores_token");
    if (!token) {
      router.replace("/auth/login?returnUrl=/dashboard/payment");
      return;
    }
    setReady(true);
    void load();
  }, [load, router]);

  const handleSaveIban = async () => {
    const iban = ibanForm.iban.replace(/\s/g, "").toUpperCase();
    if (!iban) {
      setError("رقم IBAN مطلوب.");
      return;
    }
    if (!iban.startsWith("SA") || iban.length !== 24) {
      setError("رقم IBAN يجب أن يبدأ بـ SA ويتكون من 24 خانة.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await sellerApi.updateStore({
        iban,
        bank_name: ibanForm.bank_name,
        account_holder_name: ibanForm.account_holder_name,
      });
      setSuccess("تم حفظ بيانات الحساب البنكي بنجاح.");
      setFinance((current) => ({
        ...current,
        iban,
        bank_name: ibanForm.bank_name,
        account_holder_name: ibanForm.account_holder_name,
      }));
    } catch {
      setError("فشل حفظ بيانات الحساب البنكي.");
    } finally {
      setSaving(false);
    }
  };

  const trialDaysLeft = finance.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(finance.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0;

  const subscriptionLabel: Record<string, { text: string; className: string }> = {
    trial: {
      text: `فترة تجريبية (${trialDaysLeft} يوم متبقي)`,
      className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
    },
    active: {
      text: "اشتراك نشط",
      className: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200",
    },
    expired: {
      text: "اشتراك منتهي",
      className: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
    },
    cancelled: {
      text: "ملغي",
      className: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
    },
  };

  const subscription = subscriptionLabel[finance.subscription_status] || subscriptionLabel.trial;
  const paymentMethods = platformPaymob?.payment_methods ?? [];
  const enabledMethods = paymentMethods.filter((method) => method.enabled);
  const paymobReady = Boolean(platformPaymob?.enabled);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500 dark:bg-zinc-950 dark:text-zinc-400">
        جاري التحميل...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>المالية والدفع - متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="المالية والدفع"
        subtitle="بوابة الدفع، الحساب البنكي، الاشتراك، وملخص التحصيل"
        icon={CreditCard}
        hasStore
      >
        <div className="mx-auto max-w-4xl space-y-5">
          {loading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
              ))}
            </div>
          ) : (
            <>
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                  {success}
                </div>
              ) : null}

              <section
                className={[
                  "rounded-xl border p-5",
                  paymobReady
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                    : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {paymobReady ? (
                      <ShieldCheck className="mt-0.5 h-6 w-6 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-6 w-6 text-amber-600" />
                    )}
                    <div>
                      <h2 className="text-base font-black text-zinc-950 dark:text-zinc-50">
                        {paymobReady ? "الدفع الإلكتروني مفعل" : "الدفع الإلكتروني غير متاح حالياً"}
                      </h2>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                        {paymobReady
                          ? `الدفع يعمل عبر ${enabledMethods.map(methodName).join("، ")}.`
                          : "سيتم تفعيل الدفع للمتجر بعد اكتمال إعدادات بوابة الدفع."}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-sm font-black text-zinc-950 dark:text-zinc-50">طرق الدفع المفعلة</h2>
                  </div>
                  <div className="grid gap-2">
                    {paymentMethods.map((method) => {
                      const Icon = methodIcon(method.key);
                      return (
                        <div
                          key={method.key}
                          className={[
                            "flex items-center justify-between gap-3 rounded-lg border px-3 py-2",
                            method.enabled
                              ? "border-emerald-100 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"
                              : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400",
                          ].join(" ")}
                        >
                          <span className="flex items-center gap-2 text-sm font-bold">
                            <Icon className="h-4 w-4" />
                            {methodName(method)}
                          </span>
                          <span className="text-xs">
                            {method.enabled ? "مفعل" : "غير متاح"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {storePaymentConfig?.has_keys ? (
                    <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300">
                      يوجد إعداد بوابة خاص بالمتجر، والدفع المركزي يظل المسار الأساسي لطلبات المتجر.
                    </p>
                  ) : null}
                </div>

                <div className={`rounded-xl border p-5 ${subscription.className}`}>
                  <div className="mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <h2 className="text-sm font-black">الاشتراك والعمولة</h2>
                  </div>
                  <p className="text-base font-black">{subscription.text}</p>
                  <p className="mt-2 text-sm opacity-90">
                    {finance.monthly_fee_sar} ر.س / شهر + عمولة {(finance.commission_rate * 100).toFixed(0)}% على كل عملية.
                  </p>
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-100 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
                  <Wallet className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
                  <div className="text-lg font-black text-zinc-950 dark:text-zinc-50">{formatSar(finance.available_balance)}</div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">رصيد قابل للسحب</p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
                  <ArrowDownToLine className="mx-auto mb-2 h-5 w-5 text-blue-600" />
                  <div className="text-lg font-black text-zinc-950 dark:text-zinc-50">{formatSar(finance.total_sales)}</div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">إجمالي المبيعات</p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
                  <Percent className="mx-auto mb-2 h-5 w-5 text-orange-600" />
                  <div className="text-lg font-black text-zinc-950 dark:text-zinc-50">{formatSar(finance.total_commission)}</div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">عمولة المنصة</p>
                </div>
              </section>

              <section className="rounded-xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-sm font-black text-zinc-950 dark:text-zinc-50">حساب السحب IBAN</h2>
                  {finance.iban ? <BadgeCheck className="h-4 w-4 text-emerald-600" /> : null}
                </div>

                {finance.iban ? (
                  <p className="mb-4 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    حساب محفوظ: {finance.iban.slice(0, 4)}...{finance.iban.slice(-4)}
                  </p>
                ) : null}

                <div className="grid gap-3 md:grid-cols-3">
                  <label className="space-y-1.5 md:col-span-3">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">IBAN</span>
                    <input
                      type="text"
                      value={ibanForm.iban}
                      onChange={(event) => setIbanForm((current) => ({ ...current, iban: event.target.value.toUpperCase() }))}
                      placeholder="SA02 8000 0000 6080 1016 7519"
                      dir="ltr"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </label>
                  <label className="space-y-1.5 md:col-span-1">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">اسم البنك</span>
                    <input
                      type="text"
                      value={ibanForm.bank_name}
                      onChange={(event) => setIbanForm((current) => ({ ...current, bank_name: event.target.value }))}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </label>
                  <label className="space-y-1.5 md:col-span-2">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">اسم صاحب الحساب</span>
                    <input
                      type="text"
                      value={ibanForm.account_holder_name}
                      onChange={(event) => setIbanForm((current) => ({ ...current, account_holder_name: event.target.value }))}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSaveIban}
                  disabled={saving}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving ? "جاري الحفظ..." : "حفظ بيانات الحساب البنكي"}
                </button>
              </section>
            </>
          )}
        </div>
      </SellerShell>
    </>
  );
}

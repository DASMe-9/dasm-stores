import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  CreditCard, CheckCircle, AlertCircle, Landmark, Percent,
  Wallet, Calendar, ShieldCheck, ArrowDownToLine,
} from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";

interface StoreFinance {
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
}

export default function PaymentSettingsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [finance, setFinance] = useState<StoreFinance>({
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
  });

  const [ibanForm, setIbanForm] = useState({
    iban: "",
    bank_name: "",
    account_holder_name: "",
  });

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
      const res = await sellerApi.getMyStore();
      const store = res.data?.store;
      if (store) {
        setFinance({
          subscription_status: store.subscription_status || "trial",
          trial_ends_at: store.trial_ends_at,
          monthly_fee_sar: store.monthly_fee_sar ?? 25,
          commission_rate: store.commission_rate ?? 0.02,
          iban: store.iban,
          bank_name: store.bank_name,
          account_holder_name: store.account_holder_name,
          total_sales: store.total_sales ?? 0,
          total_commission: store.total_commission ?? 0,
          available_balance: store.available_balance ?? 0,
        });
        setIbanForm({
          iban: store.iban || "",
          bank_name: store.bank_name || "",
          account_holder_name: store.account_holder_name || "",
        });
      }
    } catch {
      /* skip */
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIban = async () => {
    if (!ibanForm.iban.trim()) {
      setError("رقم IBAN مطلوب");
      return;
    }
    if (!ibanForm.iban.startsWith("SA") || ibanForm.iban.replace(/\s/g, "").length !== 24) {
      setError("رقم IBAN غير صحيح — يجب أن يبدأ بـ SA ويتكون من 24 حرف");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await sellerApi.updateStore({
        iban: ibanForm.iban.replace(/\s/g, ""),
        bank_name: ibanForm.bank_name,
        account_holder_name: ibanForm.account_holder_name,
      });
      setSuccess("تم حفظ بيانات الحساب البنكي بنجاح");
      setFinance((f) => ({
        ...f,
        iban: ibanForm.iban.replace(/\s/g, ""),
        bank_name: ibanForm.bank_name,
        account_holder_name: ibanForm.account_holder_name,
      }));
    } catch {
      setError("فشل حفظ البيانات");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-zinc-400 text-sm bg-gray-50 dark:bg-zinc-950">
        جاري التحميل...
      </div>
    );
  }

  const trialDaysLeft = finance.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(finance.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0;

  const subscriptionLabel: Record<string, { text: string; color: string }> = {
    trial: { text: `فترة تجريبية (${trialDaysLeft} يوم متبقي)`, color: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
    active: { text: "اشتراك نشط", color: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" },
    expired: { text: "اشتراك منتهي", color: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" },
    cancelled: { text: "ملغى", color: "text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700" },
  };

  const sub = subscriptionLabel[finance.subscription_status] || subscriptionLabel.trial;

  return (
    <>
      <Head>
        <title>المالية والدفع — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="المالية والدفع"
        subtitle="إعدادات الدفع والسحب والاشتراك"
        icon={CreditCard}
        hasStore
      >
        <div className="mx-auto max-w-2xl space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* ── حالة الدفع ── */}
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4">
                <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    الدفع الإلكتروني مفعّل تلقائياً
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    متجرك يقبل: مدى، فيزا، ماستركارد، Apple Pay، STC Pay — عبر بوابة داسم المركزية
                  </p>
                </div>
              </div>

              {/* ── ملخص مالي ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-center">
                  <Wallet className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {finance.available_balance.toLocaleString("ar-SA")} <span className="text-xs">ر.س</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">رصيد قابل للسحب</p>
                </div>
                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-center">
                  <ArrowDownToLine className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {finance.total_sales.toLocaleString("ar-SA")} <span className="text-xs">ر.س</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">إجمالي المبيعات</p>
                </div>
                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-center col-span-2 sm:col-span-1">
                  <Percent className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {finance.total_commission.toLocaleString("ar-SA")} <span className="text-xs">ر.س</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">عمولة المنصة (2%)</p>
                </div>
              </div>

              {/* ── الاشتراك ── */}
              <div className={`rounded-2xl border p-4 ${sub.color}`}>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">{sub.text}</p>
                    <p className="text-xs mt-0.5 opacity-80">
                      {finance.subscription_status === "trial"
                        ? `بعد انتهاء التجربة: ${finance.monthly_fee_sar} ر.س/شهر + عمولة ${(finance.commission_rate * 100).toFixed(0)}% على كل عملية`
                        : `${finance.monthly_fee_sar} ر.س/شهر + عمولة ${(finance.commission_rate * 100).toFixed(0)}% على كل عملية`}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── نموذج البنك/IBAN ── */}
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Landmark className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">حساب السحب (IBAN)</h2>
                </div>

                {finance.iban && !error ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>حساب بنكي مسجّل: {finance.iban.slice(0, 4)}...{finance.iban.slice(-4)}</span>
                  </div>
                ) : null}

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  أدخل رقم IBAN الخاص بك لاستلام أرباحك. التحويل يتم تلقائياً عند وصول الحد الأدنى (100 ر.س).
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">رقم IBAN</label>
                    <input
                      type="text"
                      value={ibanForm.iban}
                      onChange={(e) => setIbanForm((f) => ({ ...f, iban: e.target.value }))}
                      placeholder="SA02 8000 0000 6080 1016 7519"
                      className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">اسم البنك</label>
                    <input
                      type="text"
                      value={ibanForm.bank_name}
                      onChange={(e) => setIbanForm((f) => ({ ...f, bank_name: e.target.value }))}
                      placeholder="البنك الأهلي السعودي"
                      className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">اسم صاحب الحساب</label>
                    <input
                      type="text"
                      value={ibanForm.account_holder_name}
                      onChange={(e) => setIbanForm((f) => ({ ...f, account_holder_name: e.target.value }))}
                      placeholder="محمد عبدالله العمري"
                      className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}
                {success && <p className="text-xs text-emerald-600">{success}</p>}

                <button
                  type="button"
                  onClick={handleSaveIban}
                  disabled={saving}
                  className="w-full rounded-xl bg-emerald-600 text-white py-2.5 text-sm font-bold hover:bg-emerald-700 disabled:opacity-60 transition"
                >
                  {saving ? "جاري الحفظ..." : "حفظ بيانات الحساب البنكي"}
                </button>
              </div>

              {/* ── توضيح النظام ── */}
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed space-y-2">
                <strong className="text-zinc-700 dark:text-zinc-300">ك��ف يعمل نظام الدفع؟</strong>
                <ul className="list-disc pr-5 space-y-1">
                  <li>الزبون يدفع عبر بوابة داسم المركزية (مدى، فيزا، Apple Pay، STC Pay)</li>
                  <li>المبلغ يدخل حساب المنصة → تُخصم عمولة 2% → الباقي يُضاف لرصيدك</li>
                  <li>عند وصول رصيدك 100 ر.س أو أكثر يُحوَّل تلقائياً لحسابك البنكي</li>
                  <li>الضريبة (15% VAT) مضمّنة في سعر المنتج ومحسوبة تلقائياً في الفاتورة</li>
                  <li>تقدر تتابع كل العمليات من هذه الصفحة</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </SellerShell>
    </>
  );
}

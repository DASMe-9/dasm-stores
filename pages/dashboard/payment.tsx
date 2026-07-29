import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  BadgeCheck,
  Calendar,
  CircleCheck,
  CircleDashed,
  CreditCard,
  FileCheck2,
  Landmark,
  LockKeyhole,
  Percent,
  Save,
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

type RegistrationType =
  | "individual"
  | "commercial_registration"
  | "freelance_document"
  | "other";

type VatRegistrationStatus = "registered" | "not_registered" | "pending_review";

type StoreFinancialProfile = {
  accounting_entity_id?: number | null;
  legal_name_ar: string;
  legal_name_en?: string | null;
  registration_type: RegistrationType;
  registration_number?: string | null;
  vat_registration_status: VatRegistrationStatus;
  vat_registration_number?: string | null;
  transaction_model?: string | null;
  tax_invoice_issuer?: string | null;
  profile_status: string;
  review_reason?: string | null;
  verified_at?: string | null;
};

type FinancialProfileForm = {
  legal_name_ar: string;
  legal_name_en: string;
  registration_type: RegistrationType;
  registration_number: string;
  vat_registration_status: VatRegistrationStatus;
  vat_registration_number: string;
};

type ProfileStage = "missing" | "draft" | "correction" | "review" | "ready";

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

const emptyFinancialProfileForm: FinancialProfileForm = {
  legal_name_ar: "",
  legal_name_en: "",
  registration_type: "individual",
  registration_number: "",
  vat_registration_status: "pending_review",
  vat_registration_number: "",
};

const registrationTypeOptions: Array<{ value: RegistrationType; label: string }> = [
  { value: "individual", label: "فرد" },
  { value: "commercial_registration", label: "سجل تجاري" },
  { value: "freelance_document", label: "وثيقة عمل حر" },
  { value: "other", label: "وثيقة نظامية أخرى" },
];

const vatStatusOptions: Array<{ value: VatRegistrationStatus; label: string }> = [
  { value: "registered", label: "مسجل في ضريبة القيمة المضافة" },
  { value: "not_registered", label: "غير مسجل في ضريبة القيمة المضافة" },
  { value: "pending_review", label: "لم أحدد بعد" },
];

function financialProfileForm(profile: StoreFinancialProfile | null): FinancialProfileForm {
  if (!profile) return emptyFinancialProfileForm;

  return {
    legal_name_ar: profile.legal_name_ar || "",
    legal_name_en: profile.legal_name_en || "",
    registration_type: profile.registration_type || "individual",
    registration_number: profile.registration_number || "",
    vat_registration_status: profile.vat_registration_status || "pending_review",
    vat_registration_number: profile.vat_registration_number || "",
  };
}

function profileStage(profile: StoreFinancialProfile | null): ProfileStage {
  if (!profile) return "missing";
  if (profile.profile_status === "needs_correction") return "correction";
  if (profile.profile_status !== "complete") return "draft";
  if (!profile.accounting_entity_id || !profile.verified_at) return "review";
  return "ready";
}

function formatSar(value: number) {
  return `${Number(value || 0).toLocaleString("ar-SA")} ر.س`;
}

function apiErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("response" in error)) return null;

  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  return typeof response?.data?.message === "string" ? response.data.message : null;
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
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileLoadFailed, setProfileLoadFailed] = useState(false);
  const [finance, setFinance] = useState<StoreFinance>(emptyFinance);
  const [platformPaymob, setPlatformPaymob] = useState<PlatformPaymobStatus | null>(null);
  const [storePaymentConfig, setStorePaymentConfig] = useState<StorePaymentConfigStatus | null>(null);
  const [profile, setProfile] = useState<StoreFinancialProfile | null>(null);
  const [profileForm, setProfileForm] = useState<FinancialProfileForm>(
    emptyFinancialProfileForm,
  );
  const [ibanForm, setIbanForm] = useState({
    iban: "",
    bank_name: "",
    account_holder_name: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProfileError(null);
    try {
      const [storeRes, paymentRes, profileRes] = await Promise.allSettled([
        sellerApi.getMyStore(),
        sellerApi.getPaymentConfig(),
        sellerApi.getFinancialProfile(),
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

      if (profileRes.status === "fulfilled") {
        const nextProfile =
          (profileRes.value.data?.financial_profile as StoreFinancialProfile | null) ?? null;
        setProfile(nextProfile);
        setProfileForm(financialProfileForm(nextProfile));
        setProfileLoadFailed(false);
      } else {
        setProfileLoadFailed(true);
        setProfileError("تعذر تحميل الملف المالي. أعد المحاولة قبل حفظ بيانات جديدة.");
      }
    } catch {
      setError("تعذر تحميل إعدادات المحاسبة والدفع.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("stores_token");
    if (!token) {
      router.replace("/auth/login?returnUrl=/dashboard/accounting");
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

  const handleSaveFinancialProfile = async () => {
    const legalNameAr = profileForm.legal_name_ar.trim();
    const registrationNumber = profileForm.registration_number.trim();
    const vatNumber = profileForm.vat_registration_number.replace(/\s/g, "");

    if (!legalNameAr) {
      setProfileError("الاسم القانوني بالعربية مطلوب.");
      return;
    }
    if (profileForm.registration_type !== "individual" && !registrationNumber) {
      setProfileError("رقم السجل أو الوثيقة مطلوب لهذا النوع من التسجيل.");
      return;
    }
    if (profileForm.vat_registration_status === "registered" && !/^\d{15}$/.test(vatNumber)) {
      setProfileError("الرقم الضريبي يجب أن يتكون من 15 رقمًا.");
      return;
    }

    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const response = await sellerApi.updateFinancialProfile({
        legal_name_ar: legalNameAr,
        legal_name_en: profileForm.legal_name_en.trim() || null,
        registration_type: profileForm.registration_type,
        registration_number:
          profileForm.registration_type === "individual" ? null : registrationNumber,
        vat_registration_status: profileForm.vat_registration_status,
        vat_registration_number:
          profileForm.vat_registration_status === "registered" ? vatNumber : null,
      });
      const nextProfile =
        (response.data?.financial_profile as StoreFinancialProfile | null) ?? null;
      setProfile(nextProfile);
      setProfileForm(financialProfileForm(nextProfile));
      setProfileSuccess(
        nextProfile?.profile_status === "complete"
          ? "حُفظ الملف وأُرسل للمراجعة الإدارية. يتوقف الدفع حتى اكتمال المراجعة."
          : "حُفظت المسودة. أكمل الحالة الضريبية لإرسال الملف للمراجعة.",
      );
    } catch (saveError: unknown) {
      setProfileError(
        apiErrorMessage(saveError) ||
          "تعذر حفظ الملف المالي. راجع البيانات وحاول مرة أخرى.",
      );
    } finally {
      setSavingProfile(false);
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
  const accountingStage = profileStage(profile);
  const accountingStageIndex = {
    missing: 0,
    draft: 0,
    correction: 0,
    review: 1,
    ready: 3,
  }[accountingStage];
  const profileStatusCopy: Record<ProfileStage, { title: string; body: string; cls: string }> = {
    missing: {
      title: "ابدأ ببيانات المنشأة",
      body: "أدخل الهوية القانونية والحالة الضريبية للمتجر. لن نطلب منك رقم جهة محاسبية.",
      cls: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100",
    },
    draft: {
      title: "الملف محفوظ كمسودة",
      body: "حدد الحالة الضريبية وأكمل بيانات الوثيقة حتى ينتقل الملف للمراجعة.",
      cls: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100",
    },
    correction: {
      title: "الملف يحتاج إلى تصحيح",
      body: "راجع ملاحظة فريق داسم أدناه، صحح البيانات، ثم احفظ الملف لإعادته إلى المراجعة.",
      cls: "border-orange-300 bg-orange-50 text-orange-950 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-100",
    },
    review: {
      title: "بانتظار مراجعة داسم",
      body: "البيانات مكتملة. يراجع الموظف المخول الملف ويربطه بالجهة المحاسبية قبل فتح الدفع.",
      cls: "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100",
    },
    ready: {
      title: "المتجر جاهز محاسبيًا",
      body: "اكتملت مراجعة الهوية المحاسبية. أي تعديل قانوني أو ضريبي يعيد الملف للمراجعة.",
      cls: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100",
    },
  };
  const currentProfileStatus = profileStatusCopy[accountingStage];

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
        <title>المحاسبة والدفع - متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="المحاسبة والدفع"
        subtitle="الهوية القانونية، جاهزية التحصيل، الحساب البنكي، وملخص الدفع"
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

              <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="border-b border-zinc-200 bg-[linear-gradient(135deg,#f0fdf4_0%,#ffffff_62%,#eff6ff_100%)] p-5 dark:border-zinc-800 dark:bg-[linear-gradient(135deg,#052e16_0%,#18181b_62%,#172554_100%)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-emerald-600 p-2.5 text-white shadow-lg shadow-emerald-600/20">
                        <FileCheck2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold tracking-wide text-emerald-700 dark:text-emerald-300">
                          هوية التحصيل والفوترة
                        </p>
                        <h2 className="mt-1 text-lg font-black text-zinc-950 dark:text-white">
                          الملف المالي للمتجر
                        </h2>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                          بيانات قانونية وضريبية يراجعها فريق داسم قبل تفعيل استقبال المدفوعات.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-zinc-700 backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-200">
                      <LockKeyhole className="h-3.5 w-3.5 text-emerald-600" />
                      الربط المحاسبي بيد الموظف المخول
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    {[
                      { label: "بيانات المنشأة", detail: "يدخلها صاحب المتجر" },
                      { label: "مراجعة داسم", detail: "تحقق وربط إداري" },
                      { label: "جاهزية الدفع", detail: "فتح التحصيل" },
                    ].map((step, index) => {
                      const done = accountingStageIndex > index;
                      const active = accountingStageIndex === index;
                      return (
                        <div
                          key={step.label}
                          className={[
                            "flex items-center gap-3 rounded-xl border px-3 py-3 transition",
                            done
                              ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/40"
                              : active
                                ? "border-blue-300 bg-blue-50/90 ring-2 ring-blue-500/10 dark:border-blue-800 dark:bg-blue-950/40"
                                : "border-zinc-200 bg-white/70 dark:border-zinc-800 dark:bg-zinc-950/40",
                          ].join(" ")}
                        >
                          {done ? (
                            <CircleCheck className="h-5 w-5 shrink-0 text-emerald-600" />
                          ) : (
                            <CircleDashed
                              className={[
                                "h-5 w-5 shrink-0",
                                active ? "text-blue-600" : "text-zinc-400",
                              ].join(" ")}
                            />
                          )}
                          <div>
                            <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                              {step.label}
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {step.detail}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  <div className={["rounded-xl border px-4 py-3", currentProfileStatus.cls].join(" ")}>
                    <p className="font-black">{currentProfileStatus.title}</p>
                    <p className="mt-1 text-sm leading-6 opacity-80">{currentProfileStatus.body}</p>
                    {accountingStage === "correction" && profile?.review_reason ? (
                      <div className="mt-3 rounded-lg border border-orange-300/70 bg-white/70 px-3 py-2.5 text-sm leading-6 text-orange-950 dark:border-orange-800 dark:bg-zinc-950/40 dark:text-orange-100">
                        <span className="font-black">ملاحظة المراجعة: </span>
                        {profile.review_reason}
                      </div>
                    ) : null}
                  </div>

                  {profileError ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                      <span>{profileError}</span>
                      {profileLoadFailed ? (
                        <button
                          type="button"
                          onClick={() => void load()}
                          className="font-black underline underline-offset-4"
                        >
                          إعادة المحاولة
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  {profileSuccess ? (
                    <div
                      aria-live="polite"
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                    >
                      {profileSuccess}
                    </div>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        الاسم القانوني بالعربية
                      </span>
                      <input
                        type="text"
                        value={profileForm.legal_name_ar}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            legal_name_ar: event.target.value,
                          }))
                        }
                        placeholder="الاسم في السجل أو الوثيقة"
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        الاسم القانوني بالإنجليزية
                        <span className="mr-1 font-normal text-zinc-400">(اختياري)</span>
                      </span>
                      <input
                        type="text"
                        dir="ltr"
                        value={profileForm.legal_name_en}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            legal_name_en: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        نوع التسجيل
                      </span>
                      <select
                        value={profileForm.registration_type}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            registration_type: event.target.value as RegistrationType,
                            registration_number:
                              event.target.value === "individual"
                                ? ""
                                : current.registration_number,
                          }))
                        }
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                      >
                        {registrationTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    {profileForm.registration_type !== "individual" ? (
                      <label className="space-y-1.5">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          رقم السجل أو الوثيقة
                        </span>
                        <input
                          type="text"
                          dir="ltr"
                          value={profileForm.registration_number}
                          onChange={(event) =>
                            setProfileForm((current) => ({
                              ...current,
                              registration_number: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                        />
                      </label>
                    ) : (
                      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-6 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
                        لا نطلب رقم سجل تجاري عندما يكون نوع التسجيل «فرد».
                      </div>
                    )}

                    <label className="space-y-1.5">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        حالة ضريبة القيمة المضافة
                      </span>
                      <select
                        value={profileForm.vat_registration_status}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            vat_registration_status:
                              event.target.value as VatRegistrationStatus,
                            vat_registration_number:
                              event.target.value === "registered"
                                ? current.vat_registration_number
                                : "",
                          }))
                        }
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                      >
                        {vatStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    {profileForm.vat_registration_status === "registered" ? (
                      <label className="space-y-1.5">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          الرقم الضريبي
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          dir="ltr"
                          maxLength={15}
                          value={profileForm.vat_registration_number}
                          onChange={(event) =>
                            setProfileForm((current) => ({
                              ...current,
                              vat_registration_number: event.target.value.replace(/\D/g, ""),
                            }))
                          }
                          placeholder="15 رقمًا"
                          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                        />
                      </label>
                    ) : (
                      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-6 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
                        لا تُضاف ضريبة قيمة مضافة باسم المتجر ما لم يكن مسجلًا نظاميًا.
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">نموذج العملية</p>
                      <p className="mt-1 font-black text-zinc-900 dark:text-zinc-100">
                        داسم وكيل تحصيل مفصح عنه
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">مصدر الفاتورة</p>
                      <p className="mt-1 font-black text-zinc-900 dark:text-zinc-100">
                        المتجر هو مُصدر الفاتورة للمشتري
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveFinancialProfile}
                    disabled={savingProfile || profileLoadFailed}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-700/15 transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-zinc-900"
                  >
                    <Save className="h-4 w-4" />
                    {savingProfile ? "جاري حفظ الملف..." : "حفظ الملف المالي"}
                  </button>
                </div>
              </section>

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

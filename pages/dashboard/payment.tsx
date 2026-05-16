import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  CreditCard, CheckCircle, AlertCircle, Shield, Building2,
  Zap, ChevronLeft, Landmark,
} from "lucide-react";
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

type ProviderKey = "paymob" | "tap" | "hyperpay" | "bank_transfer";

interface ProviderInfo {
  key: ProviderKey;
  name: string;
  nameEn: string;
  description: string;
  icon: typeof CreditCard;
  color: string;
  fields: { key: "api_key" | "secret_key"; label: string; placeholder: string; type?: string }[];
  guide: string[];
}

const PROVIDERS: ProviderInfo[] = [
  {
    key: "paymob",
    name: "PayMob",
    nameEn: "Paymob",
    description: "بطاقات ائتمان، مدى، STC Pay — الأكثر استخداماً في السعودية",
    icon: CreditCard,
    color: "emerald",
    fields: [
      { key: "api_key", label: "مفتاح API (API Key)", placeholder: "pk_live_..." },
      { key: "secret_key", label: "المفتاح السري (Secret Key)", placeholder: "sk_live_..." },
    ],
    guide: [
      "سجّل في accept.paymob.com",
      "فعّل حسابك وأكمل التوثيق",
      "من لوحة التحكم → Settings → API Keys",
      "انسخ API Key و Secret Key والصقهم هنا",
    ],
  },
  {
    key: "tap",
    name: "Tap Payments",
    nameEn: "Tap",
    description: "بطاقات ائتمان، Apple Pay، مدى — دعم خليجي واسع",
    icon: Zap,
    color: "blue",
    fields: [
      { key: "api_key", label: "المفتاح العام (Public Key)", placeholder: "pk_live_..." },
      { key: "secret_key", label: "المفتاح السري (Secret Key)", placeholder: "sk_live_..." },
    ],
    guide: [
      "سجّل في dashboard.tap.company",
      "أكمل التوثيق وتفعيل الحساب",
      "من goSell → API Keys",
      "انسخ Public Key و Secret Key",
    ],
  },
  {
    key: "hyperpay",
    name: "HyperPay",
    nameEn: "HyperPay",
    description: "بطاقات ائتمان، مدى، STC Pay — شريك SADAD",
    icon: Shield,
    color: "purple",
    fields: [
      { key: "api_key", label: "Access Token", placeholder: "OGE4..." },
      { key: "secret_key", label: "Entity ID", placeholder: "8ac7..." },
    ],
    guide: [
      "تواصل مع فريق HyperPay للحصول على حساب",
      "من لوحة التحكم → Configuration",
      "انسخ Access Token و Entity ID",
    ],
  },
  {
    key: "bank_transfer",
    name: "تحويل بنكي (سريع)",
    nameEn: "Bank Transfer (SARIE)",
    description: "الزبون يحوّل مباشرة لحسابك البنكي — بدون وسيط",
    icon: Landmark,
    color: "amber",
    fields: [
      { key: "api_key", label: "رقم IBAN", placeholder: "SA02 8000 0000 6080 1016 7519", type: "text" },
      { key: "secret_key", label: "اسم المستفيد (اختياري)", placeholder: "محمد عبدالله العمري", type: "text" },
    ],
    guide: [
      "افتح تطبيق البنك الخاص بك",
      "من الحساب الجاري → معلومات الحساب",
      "انسخ رقم IBAN (يبدأ بـ SA)",
      "الزبون سيحوّل عبر سريع ثم تؤكد الاستلام يدوياً",
    ],
  },
];

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

  const [selectedProvider, setSelectedProvider] = useState<ProviderKey | null>(null);
  const [form, setForm] = useState<PaymentConfig>({
    provider: "paymob",
    api_key: "",
    secret_key: "",
    is_live: false,
    is_active: true,
  });
  const [configured, setConfigured] = useState(false);
  const [savedProvider, setSavedProvider] = useState<string | null>(null);

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
        const provider = c.provider || "paymob";
        setForm({
          provider,
          api_key: c.api_key || "",
          secret_key: c.secret_key || "",
          is_live: c.is_live ?? false,
          is_active: c.is_active ?? true,
        });
        const isBankTransfer = provider === "bank_transfer";
        const isConfigured = isBankTransfer
          ? !!(c.api_key && c.is_active)
          : !!(c.api_key && c.secret_key && c.is_active);
        setConfigured(isConfigured);
        if (c.api_key || c.secret_key) {
          setSelectedProvider(provider as ProviderKey);
          setSavedProvider(provider);
        }
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

  const selectProvider = (key: ProviderKey) => {
    setSelectedProvider(key);
    setError(null);
    setSuccess(null);
    if (key !== savedProvider) {
      setForm((f) => ({ ...f, provider: key, api_key: "", secret_key: "" }));
    } else {
      setForm((f) => ({ ...f, provider: key }));
    }
  };

  const handleSave = async () => {
    if (!selectedProvider) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const provider = PROVIDERS.find((p) => p.key === selectedProvider)!;
      const isBankTransfer = selectedProvider === "bank_transfer";

      if (!form.api_key.trim()) {
        setError(isBankTransfer ? "رقم IBAN مطلوب" : "مفتاح API مطلوب");
        setSaving(false);
        return;
      }
      if (!isBankTransfer && !form.secret_key.trim()) {
        setError("المفتاح السري مطلوب");
        setSaving(false);
        return;
      }

      await sellerApi.updatePaymentConfig(form);
      setConfigured(true);
      setSavedProvider(selectedProvider);
      setSuccess(`تم حفظ إعدادات ${provider.name} بنجاح`);
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
  const activeProvider = PROVIDERS.find((p) => p.key === selectedProvider);

  const colorMap: Record<string, { bg: string; border: string; text: string; ring: string; iconBg: string }> = {
    emerald: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", ring: "ring-emerald-500", iconBg: "bg-emerald-100" },
    blue:    { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", ring: "ring-blue-500", iconBg: "bg-blue-100" },
    purple:  { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700", ring: "ring-purple-500", iconBg: "bg-purple-100" },
    amber:   { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", ring: "ring-amber-500", iconBg: "bg-amber-100" },
  };

  return (
    <>
      <Head>
        <title>بوابة الدفع — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="بوابة الدفع"
        subtitle="اختر طريقة استقبال المدفوعات من زبائنك"
        icon={CreditCard}
        hasStore
      >
        <div className="mx-auto max-w-2xl space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {storeStatus === "active" && (
                <div className="flex items-center gap-3 rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4 text-sm text-green-800 dark:text-green-300">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <span>متجرك نشط ويستقبل الطلبات</span>
                </div>
              )}

              {storeStatus === "draft" && (
                <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-300">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div>
                      <strong>متجرك في وضع المسودة</strong>
                      <p className="mt-1 text-amber-700 dark:text-amber-400">لتفعيل المتجر أكمل الخطوات التالية:</p>
                      <ul className="mt-1 list-disc space-y-0.5 pr-5">
                        <li className={configured ? "text-amber-500 line-through" : ""}>
                          ربط بوابة دفع
                        </li>
                        <li className={hasProducts ? "text-amber-500 line-through" : ""}>
                          إضافة منتج واحد على الأقل
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ── اختيار البوابة ── */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">اختر طريقة الدفع</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROVIDERS.map((provider) => {
                    const Icon = provider.icon;
                    const isSelected = selectedProvider === provider.key;
                    const isSaved = savedProvider === provider.key && configured;
                    const colors = colorMap[provider.color];

                    return (
                      <button
                        key={provider.key}
                        type="button"
                        onClick={() => selectProvider(provider.key)}
                        className={`relative text-right rounded-2xl border-2 p-4 transition-all ${
                          isSelected
                            ? `${colors.border} ${colors.bg} shadow-sm`
                            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-sm"
                        }`}
                      >
                        {isSaved && (
                          <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> مفعّل
                          </span>
                        )}
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl ${isSelected ? colors.iconBg : "bg-zinc-100 dark:bg-zinc-800"}`}>
                            <Icon className={`w-5 h-5 ${isSelected ? colors.text : "text-zinc-500 dark:text-zinc-400"}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{provider.name}</div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                              {provider.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── نموذج الإعداد ── */}
              {activeProvider && (
                <div className="space-y-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <activeProvider.icon className={`h-5 w-5 ${colorMap[activeProvider.color].text}`} />
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">إعدادات {activeProvider.name}</h2>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {activeProvider.key === "bank_transfer"
                      ? "أدخل رقم IBAN الخاص بك — سيظهر للزبون عند إتمام الطلب ليحوّل المبلغ مباشرة."
                      : "أدخل مفاتيح الـ API الخاصة بك. المفاتيح تُشفَّر ولا تظهر لأحد."}
                  </p>

                  {activeProvider.fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">{field.label}</label>
                      <input
                        type={field.type || "password"}
                        value={form[field.key]}
                        onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-left text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        dir="ltr"
                      />
                    </div>
                  ))}

                  {activeProvider.key !== "bank_transfer" && (
                    <div className="flex items-center gap-3 pt-2">
                      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.is_live}
                          onChange={(e) => setForm((f) => ({ ...f, is_live: e.target.checked }))}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        وضع الإنتاج (Live)
                      </label>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {form.is_live ? "المدفوعات حقيقية" : "وضع الاختبار (Sandbox)"}
                      </span>
                    </div>
                  )}

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
              )}

              {/* ── تفعيل المتجر ── */}
              {canActivate && (
                <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-6 text-center space-y-3">
                  <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">كل المتطلبات مكتملة!</h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">يمكنك الآن تفعيل متجرك وبدء استقبال الطلبات</p>
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

              {/* ── دليل الإعداد ── */}
              {activeProvider && (
                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  <strong className="text-zinc-700 dark:text-zinc-300">كيف أحصل على بيانات {activeProvider.name}؟</strong>
                  <ol className="mt-2 list-decimal pr-5 space-y-1">
                    {activeProvider.guide.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      </SellerShell>
    </>
  );
}

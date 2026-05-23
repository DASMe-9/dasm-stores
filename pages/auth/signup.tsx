import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import axios, { isAxiosError } from "axios";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardList,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserRound,
} from "lucide-react";

import { platformApiOrigin } from "@/lib/platform-api-url";

const API_URL = platformApiOrigin();
const ARABIC_NAME_RE = /^[\u0600-\u06FF\s]+$/;

type AccountType = "user" | "venue_owner";

type Region = {
  id: number | string;
  name: string;
  code?: string;
};

type SignupFormState = {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  email_confirmation: string;
  phone: string;
  referral_code: string;
  area_id: string;
  account_type: AccountType;
  company_name: string;
  commercial_registry: string;
  address: string;
  password: string;
  password_confirmation: string;
};

type ApiErrorBody = {
  message?: string;
  first_error?: string;
  code?: string;
  suggested_email?: string;
  manual_registration_url?: string;
  errors?: Record<string, string[]>;
};

const initialForm: SignupFormState = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  email_confirmation: "",
  phone: "",
  referral_code: "",
  area_id: "",
  account_type: "venue_owner",
  company_name: "",
  commercial_registry: "",
  address: "",
  password: "",
  password_confirmation: "",
};

const accountTypeLabels: Record<AccountType, string> = {
  user: "مستخدم",
  venue_owner: "صاحب متجر / مالك معرض",
};

const errorPriority = [
  "email",
  "email_confirmation",
  "phone",
  "first_name",
  "middle_name",
  "last_name",
  "password",
  "company_name",
  "commercial_registry",
  "address",
  "area_id",
  "referral_code",
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignupFormState>(initialForm);
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [regionsError, setRegionsError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const businessAccount = form.account_type === "venue_owner";

  const selectedRegion = useMemo(
    () => regions.find((region) => String(region.id) === form.area_id),
    [form.area_id, regions],
  );

  useEffect(() => {
    if (!router.isReady) return;

    const ref =
      typeof router.query.ref === "string"
        ? router.query.ref
        : typeof router.query.referral_code === "string"
          ? router.query.referral_code
          : "";

    if (ref) {
      setForm((current) => ({
        ...current,
        referral_code: ref.toUpperCase().slice(0, 20),
      }));
    }
  }, [router.isReady, router.query.ref, router.query.referral_code]);

  useEffect(() => {
    let cancelled = false;

    async function loadRegions() {
      setRegionsLoading(true);
      setRegionsError("");

      try {
        const response = await axios.get<{ data?: Region[] } | Region[]>(
          `${API_URL}/api/regions`,
          { timeout: 15000 },
        );
        const list = Array.isArray(response.data)
          ? response.data
          : response.data.data ?? [];

        if (!cancelled) {
          setRegions(Array.isArray(list) ? list : []);
        }
      } catch {
        if (!cancelled) {
          setRegionsError("تعذر تحميل مناطق المملكة من المنصة. يمكنك إكمال التسجيل بدون تحديد المنطقة الآن.");
        }
      } finally {
        if (!cancelled) {
          setRegionsLoading(false);
        }
      }
    }

    loadRegions();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField<K extends keyof SignupFormState>(field: K, value: SignupFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validateClientForm() {
    const firstName = form.first_name.trim();
    const middleName = form.middle_name.trim();
    const lastName = form.last_name.trim();
    const email = normalizeEmail(form.email);
    const emailConfirmation = normalizeEmail(form.email_confirmation);
    const referralCode = form.referral_code.trim();

    if (firstName.length < 2 || !ARABIC_NAME_RE.test(firstName)) {
      return "الاسم الأول يجب أن يكون بالعربية وعلى الأقل حرفين.";
    }
    if (middleName && !ARABIC_NAME_RE.test(middleName)) {
      return "الاسم الأوسط يجب أن يكون بالعربية فقط.";
    }
    if (lastName.length < 2 || !ARABIC_NAME_RE.test(lastName)) {
      return "الاسم الأخير يجب أن يكون بالعربية وعلى الأقل حرفين.";
    }
    if (!email || emailHasNonAscii(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "يرجى إدخال بريد إلكتروني صالح بحروف لاتينية.";
    }
    if (email !== emailConfirmation) {
      return "تأكيد البريد الإلكتروني يجب أن يطابق البريد.";
    }
    if (!/^5\d{8}$/.test(form.phone)) {
      return "رقم الهاتف يجب أن يبدأ بـ 5 ويتكون من 9 أرقام بعد كود السعودية.";
    }
    if (referralCode.length > 20) {
      return "كود الإحالة يجب ألا يتجاوز 20 حرفا.";
    }
    if (form.password.length < 8) {
      return "كلمة المرور يجب أن تكون 8 أحرف على الأقل.";
    }
    if (form.password !== form.password_confirmation) {
      return "كلمتا المرور غير متطابقتين.";
    }
    if (businessAccount && form.company_name.trim().length < 3) {
      return "اسم المتجر أو المعرض مطلوب ويجب أن يكون 3 أحرف على الأقل.";
    }
    if (businessAccount && form.commercial_registry.trim().length < 5) {
      return "رقم السجل التجاري مطلوب ويجب أن يكون 5 أحرف على الأقل.";
    }
    if (form.account_type === "venue_owner" && form.address.trim().length < 5) {
      return "عنوان المتجر أو المعرض مطلوب ويجب أن يكون 5 أحرف على الأقل.";
    }

    return "";
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const clientError = validateClientForm();
    if (clientError) {
      setError(clientError);
      return;
    }

    setBusy(true);

    const payload: Record<string, string | undefined> = {
      first_name: form.first_name.trim(),
      middle_name: form.middle_name.trim() || undefined,
      last_name: form.last_name.trim(),
      email: normalizeEmail(form.email),
      email_confirmation: normalizeEmail(form.email_confirmation),
      phone: `+966${form.phone}`,
      password: form.password,
      password_confirmation: form.password_confirmation,
      account_type: form.account_type,
      area_id: form.area_id || undefined,
      area_label: selectedRegion?.name,
      referral_code: form.referral_code.trim().toUpperCase() || undefined,
      company_name: businessAccount ? form.company_name.trim() : undefined,
      commercial_registry: businessAccount ? form.commercial_registry.trim() : undefined,
      address: form.account_type === "venue_owner" ? form.address.trim() : undefined,
    };

    try {
      const response = await axios.post(`${API_URL}/api/register`, payload, {
        timeout: 20000,
        headers: { Accept: "application/json" },
      });

      if (response.data?.status !== "success") {
        setError(response.data?.message || "تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("stores_signup_email", payload.email ?? "");
      }

      setSuccess("تم إنشاء الحساب بنجاح. سننقلك الآن للتحقق من البريد الإلكتروني.");
      setTimeout(() => {
        router.replace(`/auth/verify-email?email=${encodeURIComponent(payload.email ?? "")}`);
      }, 900);
    } catch (caughtError: unknown) {
      setError(resolveApiError(caughtError, "تعذر إنشاء الحساب. يرجى التحقق من البيانات والمحاولة مرة أخرى."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>إنشاء حساب — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen bg-white text-slate-950 dark:bg-gray-950 dark:text-white" dir="rtl">
        <div className="min-h-screen lg:grid lg:grid-cols-[0.92fr_1.08fr]">
          <section className="relative hidden overflow-hidden bg-[#071c12] px-10 py-10 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,#071c12_0%,#0d3320_48%,#123c32_100%)]" />
            <div className="absolute inset-x-10 top-28 h-px bg-gradient-to-l from-transparent via-emerald-300/30 to-transparent" />
            <div className="absolute inset-x-10 bottom-24 h-px bg-gradient-to-l from-transparent via-amber-200/20 to-transparent" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-lg font-extrabold text-white shadow-lg shadow-emerald-950/30">
                م
              </div>
              <div>
                <p className="text-lg font-extrabold leading-none text-white">متاجر داسم</p>
                <p className="mt-1 text-xs font-medium text-emerald-300">DASM Stores</p>
              </div>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-md space-y-8">
              <div className="relative mx-auto aspect-square w-72">
                <div className="absolute inset-x-12 bottom-12 h-28 rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur" />
                <div className="absolute right-12 top-16 grid h-28 w-28 place-items-center rounded-2xl border border-white/15 bg-white/10 text-emerald-100 shadow-2xl backdrop-blur">
                  <Store className="h-12 w-12" strokeWidth={1.7} />
                </div>
                <div className="absolute left-8 top-28 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-white shadow-2xl backdrop-blur">
                  <p className="text-xs text-emerald-200">هوية موحدة</p>
                  <p className="mt-1 text-2xl font-extrabold">DASM</p>
                </div>
                <div className="absolute bottom-16 left-10 right-10 rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-2">
                      <span className="block h-2 w-24 rounded-full bg-emerald-300/80" />
                      <span className="block h-2 w-16 rounded-full bg-emerald-100/35" />
                    </div>
                    <ShieldCheck className="h-9 w-9 text-amber-300" strokeWidth={1.8} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-center">
                <h1 className="text-4xl font-extrabold leading-tight text-white">
                  مرحبا بك في عالم
                  <span className="mt-2 block text-emerald-300">أسواق داسم</span>
                </h1>
                <p className="mx-auto max-w-sm text-sm leading-7 text-emerald-50/75">
                  حساب واحد يعمل عبر المنصة الأم ومتاجر داسم، مع نفس بيانات المستخدم والتحقق الآمن من البريد.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between text-xs text-emerald-100/55">
              <span>متاجر داسم</span>
              <span>stores.dasm.com.sa</span>
            </div>
          </section>

          <section className="flex min-h-screen flex-col px-5 py-7 sm:px-8 lg:px-14">
            <div className="flex items-center justify-between">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 dark:border-gray-800 dark:text-gray-200 dark:hover:border-emerald-800"
              >
                <ArrowLeft className="h-4 w-4" />
                تسجيل الدخول
              </Link>
              <div className="flex items-center gap-3 lg:hidden">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 font-extrabold text-white">
                  م
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">متاجر داسم</p>
                  <p className="text-xs text-emerald-600">DASM Stores</p>
                </div>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-10">
              <div className="mb-8">
                <p className="mb-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">إنشاء حساب جديد</p>
                <h2 className="text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white">
                  بيانات صاحب المتجر
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-gray-400">
                  يتم إنشاء الحساب في جدول المستخدمين الموحد للمنصة، ثم تنتقل للتحقق من البريد الإلكتروني.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <Field id="first_name" label="الاسم الأول" icon={<UserRound className="h-4 w-4" />}>
                    <input
                      id="first_name"
                      value={form.first_name}
                      onChange={(event) => updateField("first_name", event.target.value)}
                      autoComplete="given-name"
                      required
                      className={inputClassName}
                    />
                  </Field>

                  <Field id="middle_name" label="الاسم الأوسط (اختياري)" icon={<UserRound className="h-4 w-4" />}>
                    <input
                      id="middle_name"
                      value={form.middle_name}
                      onChange={(event) => updateField("middle_name", event.target.value)}
                      autoComplete="additional-name"
                      className={inputClassName}
                    />
                  </Field>

                  <Field id="last_name" label="الاسم الأخير" icon={<UserRound className="h-4 w-4" />}>
                    <input
                      id="last_name"
                      value={form.last_name}
                      onChange={(event) => updateField("last_name", event.target.value)}
                      autoComplete="family-name"
                      required
                      className={inputClassName}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field id="email" label="البريد الإلكتروني" icon={<Mail className="h-4 w-4" />}>
                    <input
                      id="email"
                      type="email"
                      dir="ltr"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      autoComplete="email"
                      required
                      placeholder="name@example.com"
                      className={inputClassName}
                    />
                  </Field>

                  <Field id="email_confirmation" label="تأكيد البريد الإلكتروني" icon={<Mail className="h-4 w-4" />}>
                    <input
                      id="email_confirmation"
                      type="email"
                      dir="ltr"
                      value={form.email_confirmation}
                      onChange={(event) => updateField("email_confirmation", event.target.value)}
                      autoComplete="email"
                      required
                      placeholder="name@example.com"
                      className={inputClassName}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field id="phone" label="رقم الهاتف" icon={<Phone className="h-4 w-4" />}>
                    <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-transparent focus-within:ring-2 focus-within:ring-emerald-500 dark:border-gray-700 dark:bg-gray-900">
                      <div className="grid min-w-20 place-items-center border-l border-slate-200 bg-white px-3 text-sm font-extrabold text-emerald-700 dark:border-gray-700 dark:bg-gray-950 dark:text-emerald-400">
                        +966
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        dir="ltr"
                        inputMode="numeric"
                        pattern="5[0-9]{8}"
                        maxLength={9}
                        required
                        value={form.phone}
                        onChange={(event) => updateField("phone", event.target.value.replace(/\D/g, "").slice(0, 9))}
                        placeholder="5XXXXXXXX"
                        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-slate-950 placeholder-slate-400 outline-none dark:text-white"
                      />
                    </div>
                  </Field>

                  <Field id="referral_code" label="كود الإحالة (اختياري)" icon={<ClipboardList className="h-4 w-4" />}>
                    <input
                      id="referral_code"
                      dir="ltr"
                      value={form.referral_code}
                      onChange={(event) => updateField("referral_code", event.target.value.toUpperCase().slice(0, 20))}
                      placeholder="DASM-AB12"
                      className={`${inputClassName} uppercase`}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field id="account_type" label="نوع الحساب" icon={<ShoppingBag className="h-4 w-4" />}>
                    <select
                      id="account_type"
                      value={form.account_type}
                      onChange={(event) => updateField("account_type", event.target.value as AccountType)}
                      className={`${inputClassName} appearance-none`}
                    >
                      {Object.entries(accountTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field id="area_id" label="المنطقة / المدينة" icon={<MapPin className="h-4 w-4" />} hint={regionsError}>
                    <select
                      id="area_id"
                      value={form.area_id}
                      onChange={(event) => updateField("area_id", event.target.value)}
                      disabled={regionsLoading && regions.length === 0}
                      className={`${inputClassName} appearance-none disabled:cursor-wait disabled:opacity-70`}
                    >
                      <option value="">
                        {regionsLoading ? "جار تحميل المناطق..." : "اختر منطقة المملكة"}
                      </option>
                      {regions.map((region) => (
                        <option key={region.id} value={String(region.id)}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {businessAccount && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      id="company_name"
                      label="اسم المتجر / المعرض"
                      icon={<Building2 className="h-4 w-4" />}
                    >
                      <input
                        id="company_name"
                        value={form.company_name}
                        onChange={(event) => updateField("company_name", event.target.value)}
                        required={businessAccount}
                        className={inputClassName}
                      />
                    </Field>

                    <Field id="commercial_registry" label="السجل التجاري" icon={<ClipboardList className="h-4 w-4" />}>
                      <input
                        id="commercial_registry"
                        dir="ltr"
                        value={form.commercial_registry}
                        onChange={(event) => updateField("commercial_registry", event.target.value.replace(/\s+/g, ""))}
                        required={businessAccount}
                        className={inputClassName}
                      />
                    </Field>
                  </div>
                )}

                {form.account_type === "venue_owner" && (
                  <Field id="address" label="عنوان المتجر / المعرض" icon={<MapPin className="h-4 w-4" />}>
                    <input
                      id="address"
                      value={form.address}
                      onChange={(event) => updateField("address", event.target.value)}
                      required
                      placeholder="مثال: الرياض، حي الياسمين"
                      className={inputClassName}
                    />
                  </Field>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <Field id="password" label="كلمة المرور" icon={<LockKeyhole className="h-4 w-4" />}>
                    <PasswordInput
                      id="password"
                      value={form.password}
                      autoComplete="new-password"
                      show={showPassword}
                      onChange={(value) => updateField("password", value)}
                      onToggle={() => setShowPassword((current) => !current)}
                    />
                  </Field>

                  <Field id="password_confirmation" label="تأكيد كلمة المرور" icon={<LockKeyhole className="h-4 w-4" />}>
                    <PasswordInput
                      id="password_confirmation"
                      value={form.password_confirmation}
                      autoComplete="new-password"
                      show={showPasswordConfirm}
                      onChange={(value) => updateField("password_confirmation", value)}
                      onToggle={() => setShowPasswordConfirm((current) => !current)}
                    />
                  </Field>
                </div>

                {error && (
                  <StatusMessage tone="error" icon={<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}>
                    {error}
                  </StatusMessage>
                )}

                {success && (
                  <StatusMessage tone="success" icon={<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}>
                    {success}
                  </StatusMessage>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-700 to-teal-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-950/10 transition hover:from-emerald-800 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-gray-950"
                >
                  {busy ? "جار إنشاء الحساب..." : "إنشاء الحساب"}
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 placeholder-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function emailHasNonAscii(value: string) {
  return /[^\x00-\x7F]/.test(value);
}

function resolveApiError(error: unknown, fallback: string) {
  if (!isAxiosError<ApiErrorBody>(error)) {
    return fallback;
  }

  const body = error.response?.data;
  if (!body) {
    if (error.code === "ECONNABORTED" || /timeout/i.test(error.message)) {
      return "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.";
    }

    return "تعذر الاتصال بخادم داسم. تحقق من الاتصال وحاول مرة أخرى.";
  }

  if (body.first_error) return body.first_error;

  if (body.errors) {
    for (const field of errorPriority) {
      const first = body.errors[field]?.[0];
      if (first) return first;
    }

    const firstField = Object.keys(body.errors)[0];
    const first = firstField ? body.errors[firstField]?.[0] : undefined;
    if (first) return first;
  }

  if (body.code === "email_domain_typo_suggestion" && body.message) {
    return body.suggested_email ? `${body.message} — ${body.suggested_email}` : body.message;
  }

  if (body.code === "registration_domain_not_allowed" && body.message) {
    return body.manual_registration_url ? `${body.message} — ${body.manual_registration_url}` : body.message;
  }

  return body.message || fallback;
}

function Field({
  id,
  label,
  icon,
  hint,
  children,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="block">
      <label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-gray-400">
        <span className="text-emerald-700 dark:text-emerald-400">{icon}</span>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-5 text-amber-600 dark:text-amber-300">{hint}</p>}
    </div>
  );
}

function PasswordInput({
  id,
  value,
  autoComplete,
  show,
  onChange,
  onToggle,
}: {
  id: string;
  value: string;
  autoComplete: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        dir="ltr"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required
        minLength={8}
        className={`${inputClassName} pl-11`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute left-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function StatusMessage({
  tone,
  icon,
  children,
}: {
  tone: "error" | "success";
  icon: ReactNode;
  children: ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/35 dark:text-emerald-300"
      : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/35 dark:text-red-300";

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${toneClass}`}>
      {icon}
      <span>{children}</span>
    </div>
  );
}

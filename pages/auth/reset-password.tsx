import { FormEvent, ReactNode, useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import axios, { isAxiosError } from "axios";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { clearStoresToken } from "@/lib/auth-token";
import { platformApiOrigin } from "@/lib/platform-api-url";

const API_URL = platformApiOrigin();

type ApiMessage = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasToken = token.trim().length > 0;

  useEffect(() => {
    if (!router.isReady) return;
    const queryToken = typeof router.query.token === "string" ? router.query.token : "";
    if (queryToken) {
      setToken(queryToken);
    }
  }, [router.isReady, router.query.token]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (hasToken) {
      await resetPassword();
    } else {
      await requestResetLink();
    }
  }

  async function requestResetLink() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("يرجى إدخال بريد إلكتروني صالح.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/forgot-password`,
        { email: normalizedEmail },
        { timeout: 15000, headers: { Accept: "application/json" } },
      );

      if (response.data?.status !== "success") {
        setError(response.data?.message || "تعذر إرسال رابط إعادة التعيين.");
        return;
      }

      setSuccess(response.data?.message || "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.");
    } catch (caughtError: unknown) {
      setError(resolveApiMessage(caughtError, "تعذر إرسال رابط إعادة التعيين. حاول مرة أخرى بعد قليل."));
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    const cleanToken = extractToken(token);

    if (!cleanToken) {
      setError("رابط إعادة التعيين غير صالح.");
      return;
    }
    if (password.length < 8) {
      setError("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("تأكيد كلمة المرور لا يطابق كلمة المرور الجديدة.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/reset-password`,
        {
          token: cleanToken,
          password,
          password_confirmation: passwordConfirmation,
        },
        { timeout: 15000, headers: { Accept: "application/json" } },
      );

      if (response.data?.status !== "success") {
        setError(response.data?.message || "تعذر إعادة تعيين كلمة المرور.");
        return;
      }

      clearStoresToken();

      setSuccess(response.data?.message || "تم تعيين كلمة المرور الجديدة بنجاح.");
      setTimeout(() => {
        router.replace("/auth/login");
      }, 2200);
    } catch (caughtError: unknown) {
      setError(resolveApiMessage(caughtError, "تعذر إعادة تعيين كلمة المرور. تأكد من الرابط وحاول مرة أخرى."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>إعادة تعيين كلمة المرور — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen bg-white text-slate-950 dark:bg-gray-950 dark:text-white" dir="rtl">
        <div className="min-h-screen lg:grid lg:grid-cols-[0.9fr_1.1fr]">
          <section className="relative hidden overflow-hidden bg-[#062015] px-10 py-10 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,#062015_0%,#0b3b25_48%,#0f5132_100%)]" />
            <div className="absolute inset-x-10 top-28 h-px bg-gradient-to-l from-transparent via-emerald-300/30 to-transparent" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#047857] text-lg font-extrabold text-white">
                م
              </div>
              <div>
                <p className="text-lg font-extrabold leading-none text-white">متاجر داسم</p>
                <p className="mt-1 text-xs font-medium text-emerald-300">DASM Stores</p>
              </div>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-md space-y-8 text-center">
              <div className="mx-auto grid h-44 w-44 place-items-center rounded-[2rem] border border-white/15 bg-white/10 text-emerald-100 shadow-2xl backdrop-blur">
                <ShieldCheck className="h-20 w-20" strokeWidth={1.6} />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold leading-tight text-white">
                  استعد وصولك
                  <span className="mt-2 block text-emerald-300">بأمان</span>
                </h1>
                <p className="mx-auto max-w-sm text-sm leading-7 text-emerald-50/75">
                  كلمة مرور واحدة لحسابك الموحد عبر المنصة الأم ومتاجر داسم.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between text-xs text-emerald-100/55">
              <span>تسجيل دخول موحد</span>
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
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#047857] font-extrabold text-white">
                  م
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">متاجر داسم</p>
                  <p className="text-xs text-emerald-600">DASM Stores</p>
                </div>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-10">
              <div className="mb-8">
                <p className="mb-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  إعادة تعيين كلمة المرور
                </p>
                <h2 className="text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white">
                  {hasToken ? "عيّن كلمة مرور جديدة" : "أرسل رابط إعادة التعيين"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-gray-400">
                  {hasToken
                    ? "أدخل كلمة مرور جديدة لحسابك الموحد في داسم."
                    : "اكتب بريد الحساب وسنرسل رابطا آمنا لإعادة تعيين كلمة المرور."}
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                {!hasToken && (
                  <>
                    <Field id="email" label="البريد الإلكتروني" icon={<Mail className="h-4 w-4" />}>
                      <input
                        id="email"
                        type="email"
                        dir="ltr"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        required
                        placeholder="name@example.com"
                        className={inputClassName}
                      />
                    </Field>

                    <Field id="token" label="لديك رابط أو توكن بالفعل؟" icon={<KeyRound className="h-4 w-4" />}>
                      <input
                        id="token"
                        dir="ltr"
                        value={token}
                        onChange={(event) => setToken(event.target.value)}
                        placeholder="الصق الرابط أو token هنا"
                        className={inputClassName}
                      />
                    </Field>
                  </>
                )}

                {hasToken && (
                  <>
                    <Field id="reset_token" label="رمز إعادة التعيين" icon={<KeyRound className="h-4 w-4" />}>
                      <input
                        id="reset_token"
                        dir="ltr"
                        value={token}
                        onChange={(event) => setToken(event.target.value)}
                        className={inputClassName}
                      />
                    </Field>

                    <Field id="password" label="كلمة المرور الجديدة" icon={<LockKeyhole className="h-4 w-4" />}>
                      <PasswordInput
                        id="password"
                        value={password}
                        show={showPassword}
                        autoComplete="new-password"
                        onChange={setPassword}
                        onToggle={() => setShowPassword((current) => !current)}
                      />
                    </Field>

                    <Field id="password_confirmation" label="تأكيد كلمة المرور" icon={<LockKeyhole className="h-4 w-4" />}>
                      <PasswordInput
                        id="password_confirmation"
                        value={passwordConfirmation}
                        show={showPasswordConfirmation}
                        autoComplete="new-password"
                        onChange={setPasswordConfirmation}
                        onToggle={() => setShowPasswordConfirmation((current) => !current)}
                      />
                    </Field>
                  </>
                )}

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
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#047857] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-[#065f46] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-gray-950"
                >
                  {loading
                    ? hasToken
                      ? "جار تعيين كلمة المرور..."
                      : "جار إرسال الرابط..."
                    : hasToken
                      ? "تعيين كلمة المرور"
                      : "إرسال رابط إعادة التعيين"}
                  {hasToken ? <ShieldCheck className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
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

function extractToken(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    return url.searchParams.get("token")?.trim() || trimmed;
  } catch {
    const match = trimmed.match(/[?&]token=([^&]+)/);
    return match ? decodeURIComponent(match[1]).trim() : trimmed;
  }
}

function resolveApiMessage(error: unknown, fallback: string) {
  if (!isAxiosError<ApiMessage>(error)) {
    return fallback;
  }

  const body = error.response?.data;
  const firstField = body?.errors ? Object.keys(body.errors)[0] : "";
  const firstError = firstField ? body?.errors?.[firstField]?.[0] : undefined;

  if (firstError) return firstError;
  if (body?.message) return body.message;
  if (body?.error) return body.error;

  if (error.code === "ECONNABORTED" || /timeout/i.test(error.message)) {
    return "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.";
  }

  return fallback;
}

function Field({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-gray-400">
        <span className="text-emerald-700 dark:text-emerald-400">{icon}</span>
        {label}
      </label>
      {children}
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

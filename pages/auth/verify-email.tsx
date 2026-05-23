import { FormEvent, ReactNode, useCallback, useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import axios, { isAxiosError } from "axios";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { platformApiOrigin } from "@/lib/platform-api-url";

const API_URL = platformApiOrigin();

type ApiMessage = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [autoAttempted, setAutoAttempted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const verifyToken = useCallback(async (rawToken: string) => {
    const cleanToken = extractToken(rawToken);

    if (!cleanToken) {
      setError("يرجى إدخال رمز التحقق أو فتح الرابط المرسل إلى بريدك.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${API_URL}/api/verify-email`,
        { token: cleanToken },
        { timeout: 15000, headers: { Accept: "application/json" } },
      );

      if (response.data?.status !== "success") {
        setError(response.data?.message || "تعذر التحقق من البريد الإلكتروني.");
        return;
      }

      setToken(cleanToken);
      setSuccess("تم توثيق بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول إلى متاجر داسم.");

      if (typeof window !== "undefined") {
        localStorage.removeItem("stores_signup_email");
      }
    } catch (caughtError: unknown) {
      setError(resolveApiMessage(caughtError, "تعذر التحقق من البريد الإلكتروني. تأكد من الرمز وحاول مرة أخرى."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    const queryEmail = typeof router.query.email === "string" ? router.query.email : "";
    const queryToken = typeof router.query.token === "string" ? router.query.token : "";

    if (queryEmail) {
      setEmail(queryEmail);
    } else if (typeof window !== "undefined") {
      setEmail(localStorage.getItem("stores_signup_email") ?? "");
    }

    if (queryToken && !autoAttempted) {
      setAutoAttempted(true);
      setToken(extractToken(queryToken));
      verifyToken(queryToken);
    }
  }, [autoAttempted, router.isReady, router.query.email, router.query.token, verifyToken]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await verifyToken(token);
  }

  async function resendVerification() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("أدخل بريدك الإلكتروني الصحيح لإعادة إرسال رابط التحقق.");
      return;
    }

    setResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${API_URL}/api/resend-verification`,
        { email: normalizedEmail },
        { timeout: 15000, headers: { Accept: "application/json" } },
      );

      if (response.data?.status !== "success") {
        setError(response.data?.message || "تعذر إرسال رابط تحقق جديد.");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("stores_signup_email", normalizedEmail);
      }

      setSuccess(response.data?.message || "تم إرسال رابط تحقق جديد إلى بريدك الإلكتروني.");
    } catch (caughtError: unknown) {
      setError(resolveApiMessage(caughtError, "تعذر إرسال رابط تحقق جديد. حاول مرة أخرى بعد قليل."));
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      <Head>
        <title>تحقق البريد الإلكتروني — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen bg-white text-slate-950 dark:bg-gray-950 dark:text-white" dir="rtl">
        <div className="min-h-screen lg:grid lg:grid-cols-[0.88fr_1.12fr]">
          <section className="relative hidden overflow-hidden bg-[#071c12] px-10 py-10 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,#071c12_0%,#0d3320_48%,#123c32_100%)]" />
            <div className="absolute inset-x-10 top-28 h-px bg-gradient-to-l from-transparent via-emerald-300/30 to-transparent" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-lg font-extrabold text-white">
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
                  خطوة أمان واحدة
                  <span className="mt-2 block text-emerald-300">وتبدأ رحلتك</span>
                </h1>
                <p className="mx-auto max-w-sm text-sm leading-7 text-emerald-50/75">
                  التحقق من البريد يربط حسابك الموحد بكل خدمات داسم ويحافظ على جلسات الدخول المشتركة.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between text-xs text-emerald-100/55">
              <span>حساب موحد</span>
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

            <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-10">
              <div className="mb-8">
                <p className="mb-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">تحقق البريد الإلكتروني</p>
                <h2 className="text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white">
                  أدخل رمز التحقق أو افتح رابط البريد
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-gray-400">
                  إذا كان الرابط يحتوي على التوكن فسيتم التحقق تلقائيا. ويمكنك لصق الرابط كاملا هنا أيضا.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <Field id="verify_token" label="رمز أو رابط التحقق" icon={<KeyRound className="h-4 w-4" />}>
                  <textarea
                    id="verify_token"
                    dir="ltr"
                    rows={3}
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    placeholder="token أو https://.../verify-email?token=..."
                    className={`${inputClassName} resize-none`}
                  />
                </Field>

                <Field id="email" label="البريد الإلكتروني لإعادة الإرسال" icon={<Mail className="h-4 w-4" />}>
                  <input
                    id="email"
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    className={inputClassName}
                  />
                </Field>

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

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-700 to-teal-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-950/10 transition hover:from-emerald-800 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-gray-950"
                  >
                    {loading ? "جار التحقق..." : "تأكيد البريد"}
                    <ShieldCheck className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={resendVerification}
                    disabled={resending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-extrabold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-800 dark:text-gray-200 dark:hover:border-emerald-800"
                  >
                    {resending ? "جار الإرسال..." : "إعادة الإرسال"}
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
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

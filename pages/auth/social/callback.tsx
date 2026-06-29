import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { persistStoresToken } from "@/lib/auth-token";
import { exchangeSocialCode } from "@/lib/social-auth";

function safeInternalReturnUrl(value: string | null, fallback = "/dashboard") {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  return trimmed;
}

function readStashedReturn(): string {
  try {
    return safeInternalReturnUrl(window.sessionStorage.getItem("stores_post_social_return"));
  } catch {
    return "/dashboard";
  }
}

function clearStashedReturn() {
  try {
    window.sessionStorage.removeItem("stores_post_social_return");
  } catch {
    /* noop */
  }
}

/**
 * Landing page for the Core Socialite (Google) redirect flow. Core bounces the
 * browser here with a single-use ?code, which we exchange for a Stores session.
 */
export default function SocialCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!router.isReady || ranRef.current) return;
    ranRef.current = true;

    const code = typeof router.query.code === "string" ? router.query.code : "";
    const status = typeof router.query.status === "string" ? router.query.status : "";
    const reason = typeof router.query.reason === "string" ? router.query.reason : "";

    if (status === "error" || (!code && status !== "ok")) {
      setError(
        reason === "oauth_denied"
          ? "تم إلغاء تسجيل الدخول عبر Google."
          : "تعذّر إكمال تسجيل الدخول عبر Google. حاول مرة أخرى.",
      );
      return;
    }

    void (async () => {
      const result = await exchangeSocialCode(code);
      if (!result.success || !result.token) {
        setError(
          result.error ||
            (result.linkRequired
              ? "يوجد حساب بهذا البريد. اربط الحساب من منصة داسم الرئيسية ثم عُد."
              : "تعذّر إكمال تسجيل الدخول."),
        );
        return;
      }

      persistStoresToken(result.token);
      if (result.user && typeof window !== "undefined") {
        try {
          const u = result.user as { id?: unknown; name?: unknown; email?: unknown; type?: unknown };
          localStorage.setItem(
            "stores_user",
            JSON.stringify({
              id: u.id,
              name: u.name,
              email: u.email,
              type: u.type,
              profile_completed: !result.needsProfileCompletion,
            }),
          );
        } catch {
          /* localStorage unavailable — token is enough */
        }
      }

      const back = readStashedReturn();
      clearStashedReturn();
      if (result.needsProfileCompletion) {
        const dest = back && back !== "/" ? back : "/dashboard";
        router.replace(`/onboarding/complete-profile?returnUrl=${encodeURIComponent(dest)}`);
        return;
      }
      router.replace(back);
    })();
  }, [router]);

  return (
    <>
      <Head>
        <title>تسجيل الدخول — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-white px-5 dark:bg-gray-950" dir="rtl">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 p-7 text-center shadow-sm dark:border-gray-800">
          {!error ? (
            <div className="flex flex-col items-center gap-3 py-6 text-gray-600 dark:text-gray-300">
              <svg className="h-8 w-8 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p>جارٍ إكمال تسجيل الدخول…</p>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">{error}</p>
              <Link
                href="/auth/login"
                className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 font-bold text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:text-white"
              >
                العودة لتسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

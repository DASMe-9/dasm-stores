import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.dasm.com.sa";

type AuthUser = {
  id?: number | string;
  display_name?: string;
  name?: string;
  email?: string;
  type?: string;
  role?: string;
};

type AuthMeResponse = {
  data?: { user?: AuthUser };
  user?: AuthUser;
};

type AxiosMessageError = {
  response?: { data?: { message?: string } };
};

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosMessageError;
  return axiosError.response?.data?.message ?? fallback;
}

/**
 * SSO handoff from the main DASM platform.
 *
 * Flow: user on www.dasm.com.sa clicks "ادخل متاجر داسم" → redirected here with
 * ?token=<access_token>&return_url=/dashboard. We verify the token via
 * /api/auth/me, store it locally, then redirect. Only venue_owner / dealer /
 * admin roles are allowed to continue into the stores dashboard.
 */
export default function SsoHandoff() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("جاري التحقق من الجلسة...");

  useEffect(() => {
    if (!router.isReady) return;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    const token =
      (typeof router.query.token === "string" ? router.query.token : "") ||
      (typeof window !== "undefined" ? new URL(window.location.href).hash.match(/token=([^&]+)/)?.[1] ?? "" : "");

    const returnUrl =
      typeof router.query.return_url === "string" ? router.query.return_url : "/dashboard";

    if (!token) {
      queueMicrotask(() => {
        setError("لم يصل توكن صالح من المنصة.");
        redirectTimer = setTimeout(() => router.replace("/auth/login"), 2000);
      });
      return () => {
        if (redirectTimer) clearTimeout(redirectTimer);
      };
    }

    window.history.replaceState({}, "", "/auth/sso");

    (async () => {
      try {
        const res = await axios.get<AuthMeResponse | AuthUser>(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const body = res.data as AuthMeResponse & AuthUser;
        const user = body.data?.user ?? body.user ?? body;
        const role = (user?.type ?? user?.role ?? "").toString().toLowerCase();
        const allowed = ["venue_owner", "dealer", "admin", "super_admin"];

        if (!allowed.includes(role)) {
          setError("حسابك ليس مخوّلاً لفتح متجر. يجب أن تكون صاحب معرض أو تاجر.");
          return;
        }

        localStorage.setItem("stores_token", token);
        localStorage.setItem("stores_user", JSON.stringify({
          id: user?.id,
          name: user?.display_name ?? user?.name,
          email: user?.email,
          role,
        }));

        setStatus("تم التحقق، جاري التحويل...");
        router.replace(returnUrl);
      } catch (e: unknown) {
        setError(getErrorMessage(e, "فشل التحقق من الجلسة."));
        redirectTimer = setTimeout(() => router.replace("/auth/login"), 2500);
      }
    })();
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>الدخول التلقائي — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 rtl p-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-sm w-full space-y-4">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-white text-2xl font-bold">م</span>
          </div>
          {error ? (
            <>
              <h2 className="text-base font-bold text-red-600">تعذّر الدخول التلقائي</h2>
              <p className="text-sm text-gray-500">{error}</p>
              <p className="text-xs text-gray-400">جاري التحويل لصفحة تسجيل الدخول...</p>
            </>
          ) : (
            <>
              <h2 className="text-base font-bold text-gray-900">متاجر داسم</h2>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                {status}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

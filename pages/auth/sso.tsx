import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";
import { platformApiOrigin } from "@/lib/platform-api-url";
import { clearStoresToken, persistStoresToken } from "@/lib/auth-token";
import { storeSelection } from "@/lib/api";

const API_URL = platformApiOrigin();

type AuthUser = {
  id?: number | string;
  display_name?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  type?: string;
  role?: string;
};

type AuthMeResponse = {
  data?: { user?: AuthUser } | AuthUser;
  user?: AuthUser;
};

type AxiosMessageError = {
  response?: { data?: { message?: string } };
};

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosMessageError;
  return axiosError.response?.data?.message ?? fallback;
}

function clearSellerSessionCache() {
  sessionStorage.removeItem("store_slug");
  sessionStorage.removeItem("store_name");
  sessionStorage.removeItem("store_user_id");
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith("store_slug:") || key.startsWith("store_name:") || key.startsWith("store_status:"))
    .forEach((key) => sessionStorage.removeItem(key));
}

function clearStoresSession() {
  clearStoresToken();
  localStorage.removeItem("stores_user");
  storeSelection.clear();
  clearSellerSessionCache();
}

function hasNestedUser(value: { user?: AuthUser } | AuthUser): value is { user?: AuthUser } {
  return typeof value === "object" && value !== null && "user" in value;
}

function extractUser(body: AuthMeResponse & AuthUser): AuthUser {
  if (body.data) {
    if (hasNestedUser(body.data)) return body.data.user ?? {};
    return body.data;
  }

  return body.user ?? body;
}

function normalizeReturnUrl(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function selectedStoreIdFromReturnUrl(value: string) {
  try {
    const parsed = new URL(value, "https://stores.dasm.com.sa");
    const storeId = parsed.searchParams.get("store_id");
    return storeId && storeId.trim() ? storeId.trim() : null;
  } catch {
    return null;
  }
}

/**
 * SSO handoff from the main DASM platform.
 *
 * Preferred flow (secure): the platform redirects here with
 * ?sso_token=<short-lived, single-use>&return_url=/dashboard. We exchange it via
 * POST /api/sso/verify, which deletes the SSO token and returns a scoped session
 * token; that session token is what we persist.
 *
 * Legacy flow (being retired): ?token=<raw Sanctum token>. A full-access
 * credential in the URL leaks into history, server logs, and Referer headers.
 * Kept only so logins don't break during the two-repo rollout — remove once the
 * platform sender ships the sso_token path everywhere.
 */
const SSO_PLATFORM = "stores";

export default function SsoHandoff() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("جاري التحقق من الجلسة...");

  useEffect(() => {
    if (!router.isReady) return;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    const readParam = (key: string) =>
      (typeof router.query[key] === "string" ? (router.query[key] as string) : "") ||
      (typeof window !== "undefined"
        ? new URL(window.location.href).hash.match(new RegExp(`${key}=([^&]+)`))?.[1] ?? ""
        : "");

    const ssoToken = readParam("sso_token");
    const legacyToken = readParam("token"); // مسار قديم — يُحذف بعد ترحيل المُرسِل

    const returnUrl =
      typeof router.query.return_url === "string"
        ? normalizeReturnUrl(router.query.return_url)
        : "/dashboard";

    if (!ssoToken && !legacyToken) {
      queueMicrotask(() => {
        clearStoresSession();
        setError("لم يصل توكن صالح من المنصة.");
        redirectTimer = setTimeout(() => router.replace("/auth/login"), 2000);
      });
      return () => {
        if (redirectTimer) clearTimeout(redirectTimer);
      };
    }

    window.history.replaceState({}, "", "/auth/sso");
    clearStoresSession();

    const finishSession = (sessionToken: string, user: AuthUser) => {
      const role = (user?.type ?? user?.role ?? "user").toString().toLowerCase();
      const selectedStoreId = selectedStoreIdFromReturnUrl(returnUrl);
      const composedName = [user?.first_name, user?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();
      const fullName =
        user?.display_name ?? user?.name ?? (composedName || undefined);
      persistStoresToken(sessionToken);
      if (selectedStoreId) storeSelection.set(selectedStoreId);
      localStorage.setItem("stores_user", JSON.stringify({
        id: user?.id,
        name: fullName,
        email: user?.email,
        role,
      }));
      if (user?.id != null) {
        sessionStorage.setItem("store_user_id", String(user.id));
      }
      setStatus("تم التحقق، جاري التحويل...");
      router.replace(returnUrl);
    };

    (async () => {
      try {
        if (ssoToken) {
          // المسار الآمن: استبدل توكن SSO أحادي الاستعمال بتوكن جلسة مقيَّد.
          // الخادم يعيد access_token (30 يوماً) + user — راجع SsoController@verify.
          const verifyRes = await axios.post<{
            success?: boolean;
            data?: { access_token?: string; user?: AuthUser };
          }>(`${API_URL}/api/sso/verify`, {
            sso_token: ssoToken,
            platform: SSO_PLATFORM,
          }, { headers: { Accept: "application/json" } });

          const sessionToken = verifyRes.data?.data?.access_token;
          const verifiedUser = verifyRes.data?.data?.user ?? {};
          if (!sessionToken) {
            throw new Error("لم يُعِد الخادم توكن جلسة صالحاً.");
          }
          finishSession(sessionToken, verifiedUser);
          return;
        }

        // المسار القديم: توكن Sanctum خام — يُتحقّق منه ثم يُخزَّن كما هو (مؤقّت).
        const res = await axios.get<AuthMeResponse | AuthUser>(`${API_URL}/api/user`, {
          headers: { Authorization: `Bearer ${legacyToken}`, Accept: "application/json" },
        });
        const body = res.data as AuthMeResponse & AuthUser;
        finishSession(legacyToken, extractUser(body));
      } catch (e: unknown) {
        clearStoresSession();
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

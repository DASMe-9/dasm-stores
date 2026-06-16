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
 * Flow: user on www.dasm.com.sa clicks "ادخل متاجر داسم" → redirected here with
 * ?token=<access_token>&return_url=/dashboard. We verify the token via
 * /api/user, store it locally, then redirect. Store ownership is enforced by
 * store APIs, so any authenticated Core user can enter the Stores surface.
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
      typeof router.query.return_url === "string"
        ? normalizeReturnUrl(router.query.return_url)
        : "/dashboard";

    if (!token) {
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

    (async () => {
      try {
        const res = await axios.get<AuthMeResponse | AuthUser>(`${API_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const body = res.data as AuthMeResponse & AuthUser;
        const user = extractUser(body);
        const role = (user?.type ?? user?.role ?? "user").toString().toLowerCase();
        const selectedStoreId = selectedStoreIdFromReturnUrl(returnUrl);
        persistStoresToken(token);
        if (selectedStoreId) storeSelection.set(selectedStoreId);
        localStorage.setItem("stores_user", JSON.stringify({
          id: user?.id,
          name: user?.display_name ?? user?.name,
          email: user?.email,
          role,
        }));
        if (user?.id != null) {
          sessionStorage.setItem("store_user_id", String(user.id));
        }

        setStatus("تم التحقق، جاري التحويل...");
        router.replace(returnUrl);
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

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { platformApiBasePath } from "@/lib/platform-api-url";
import { completeProfile } from "@/lib/social-auth";

const API_BASE = platformApiBasePath();

type Region = { id: number; name: string; code: string };

/**
 * Forced profile completion for social-first (Google/Apple) signups on Stores.
 * The account is created with no phone + profile_completed=false, so the user is
 * bounced here before reaching the dashboard. After saving phone (+ area) Core
 * flips the flag and we send them on to the dashboard (or returnUrl).
 */
export default function CompleteProfilePage() {
  const router = useRouter();
  const [regions, setRegions] = useState<Region[]>([]);
  const [phone, setPhone] = useState("");
  const [areaId, setAreaId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnUrl =
    typeof router.query.returnUrl === "string"
      ? safeInternalReturnUrl(router.query.returnUrl)
      : "/dashboard";

  useEffect(() => {
    if (!router.isReady) return;
    if (typeof window !== "undefined" && !localStorage.getItem("stores_token")) {
      router.replace(`/auth/login?returnUrl=${encodeURIComponent("/dashboard")}`);
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const headers: Record<string, string> = { Accept: "application/json" };
        const token =
          typeof window !== "undefined" ? localStorage.getItem("stores_token") : null;
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/regions`, { headers });
        const body = await res.json().catch(() => ({}));
        if (!cancelled) setRegions(body?.data ?? []);
      } catch {
        /* المنطقة اختيارية — نتجاهل فشل التحميل */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = phone.trim();
    if (!trimmed) {
      setError("أدخل رقم هاتفك");
      return;
    }
    setBusy(true);
    setError(null);

    const result = await completeProfile({
      phone: trimmed,
      area_id: areaId ? Number(areaId) : undefined,
    });

    if (result.success) {
      // Clear the "incomplete" flag so SellerShell's guard stops bouncing us.
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("stores_user");
          const parsed = raw ? JSON.parse(raw) : {};
          localStorage.setItem(
            "stores_user",
            JSON.stringify({ ...parsed, profile_completed: true }),
          );
        } catch {
          /* noop */
        }
      }
      router.replace(returnUrl);
      return;
    }

    setError(result.error || "تعذّر حفظ بياناتك. حاول مرة أخرى.");
    setBusy(false);
  };

  return (
    <>
      <Head>
        <title>أكمل بياناتك — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div
        className="min-h-screen flex items-center justify-center px-6 py-10"
        dir="rtl"
        style={{ background: "linear-gradient(145deg, #062015 0%, #0b3b25 48%, #0f5132 100%)" }}
      >
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-950 p-7 sm:p-8 shadow-2xl">
          <div className="mb-6 space-y-1.5">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">أكمل بياناتك 👋</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              خطوة واحدة فقط: أضف رقم هاتفك لتتمكن من إدارة متجرك.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="cp-phone" className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">
                رقم الهاتف
              </label>
              <input
                id="cp-phone"
                type="tel"
                inputMode="tel"
                dir="ltr"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-center text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              <p className="mt-1.5 text-xs text-gray-400">مثال: 05XXXXXXXX أو ‎+9665XXXXXXXX</p>
            </div>

            <div>
              <label htmlFor="cp-area" className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">
                المنطقة <span className="text-gray-400">(اختياري)</span>
              </label>
              <select
                id="cp-area"
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                disabled={busy}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-60"
              >
                <option value="">— اختر منطقتك —</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={busy || !phone.trim()}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: busy ? "#047857" : "linear-gradient(135deg, #059669, #047857)" }}
            >
              {busy ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  جاري الحفظ...
                </>
              ) : (
                <>حفظ ومتابعة ←</>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function safeInternalReturnUrl(value: string, fallback = "/dashboard") {
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  return trimmed;
}

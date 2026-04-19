import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.dasm.com.sa";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnUrl =
    typeof router.query.returnUrl === "string"
      ? router.query.returnUrl
      : "/dashboard";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/api/login`, { email, password });
      const token =
        res.data?.data?.access_token ||
        res.data?.access_token ||
        res.data?.token;
      if (!token) throw new Error("لم يُرجع الخادم توكن");
      localStorage.setItem("stores_token", token);
      router.replace(returnUrl);
    } catch (err: unknown) {
      const resp = (err as { response?: { status?: number; data?: { message?: string; error?: string } } })?.response;
      const backendMsg = resp?.data?.message;
      const backendErr = resp?.data?.error;
      const status = resp?.status;

      let msg = backendMsg || "فشل تسجيل الدخول";
      if (status === 429 || backendErr === "too_many_attempts") {
        msg = backendMsg || "تم تجاوز الحد المسموح من محاولات الدخول. حاول بعد 30 دقيقة.";
      } else if (backendErr === "access_denied") {
        msg = "الوصول محجوب حالياً — تواصل مع الدعم.";
      } else if (status === 401) {
        msg = backendMsg || "البريد أو كلمة المرور غير صحيحة.";
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Head>
        <title>تسجيل الدخول — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 rtl">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-white text-2xl font-bold">م</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">متاجر داسم</h1>
            <p className="text-sm text-gray-500">DASM Stores</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@dasm.com.sa"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition disabled:opacity-60"
            >
              {busy ? "جاري الدخول..." : "دخول"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

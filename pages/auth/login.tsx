import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.dasm.com.sa";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        msg = backendMsg || "تجاوزت الحد المسموح من المحاولات. حاول بعد 30 دقيقة.";
      } else if (backendErr === "access_denied") {
        msg = "الوصول محجوب — تواصل مع الدعم.";
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

      <div className="min-h-screen flex" dir="rtl">
        {/* ── Right: Brand panel ──────────────────────────── */}
        <div
          className="hidden lg:flex flex-col justify-between w-1/2 p-12"
          style={{
            background: "linear-gradient(145deg, #071c12 0%, #0d3320 40%, #0f4a2a 100%)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl"
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
            >
              م
            </div>
            <div>
              <p className="font-extrabold text-white text-lg leading-none">متاجر داسم</p>
              <p className="text-emerald-400 text-xs">DASM Stores</p>
            </div>
          </div>

          {/* Center copy */}
          <div className="space-y-8">
            {/* Store illustration (CSS) */}
            <div className="relative w-64 h-48 mx-auto">
              <div
                className="absolute inset-0 rounded-3xl opacity-20"
                style={{ background: "radial-gradient(circle at 50% 50%, #16a34a, transparent)" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 200 160" className="w-56 h-44 opacity-80">
                  {/* Storefront */}
                  <rect x="30" y="60" width="140" height="90" rx="6" fill="#16a34a" opacity="0.3" />
                  <rect x="30" y="60" width="140" height="90" rx="6" stroke="#4ade80" strokeWidth="2" fill="none" />
                  {/* Awning */}
                  <path d="M20 60 Q100 30 180 60" stroke="#4ade80" strokeWidth="3" fill="#16a34a" opacity="0.5" />
                  {/* Door */}
                  <rect x="80" y="105" width="40" height="45" rx="4" fill="#052e16" stroke="#4ade80" strokeWidth="1.5" />
                  <circle cx="115" cy="130" r="3" fill="#4ade80" />
                  {/* Windows */}
                  <rect x="40" y="75" width="35" height="25" rx="3" fill="#052e16" stroke="#4ade80" strokeWidth="1.5" />
                  <rect x="125" y="75" width="35" height="25" rx="3" fill="#052e16" stroke="#4ade80" strokeWidth="1.5" />
                  {/* Products on shelf */}
                  <rect x="40" y="80" width="10" height="15" rx="2" fill="#86efac" opacity="0.7" />
                  <rect x="54" y="83" width="8" height="12" rx="2" fill="#4ade80" opacity="0.7" />
                  <rect x="65" y="78" width="6" height="17" rx="2" fill="#86efac" opacity="0.5" />
                  {/* Sign */}
                  <rect x="65" y="35" width="70" height="18" rx="4" fill="#16a34a" opacity="0.8" />
                  <text x="100" y="48" textAnchor="middle" fill="#f0fdf4" fontSize="10" fontWeight="bold">DASM</text>
                  {/* Stars / sparkles */}
                  <circle cx="165" cy="45" r="3" fill="#fbbf24" opacity="0.9" />
                  <circle cx="35" cy="50" r="2" fill="#fbbf24" opacity="0.7" />
                  <circle cx="155" cy="30" r="2" fill="#4ade80" opacity="0.8" />
                </svg>
              </div>
            </div>

            <div className="space-y-4 text-center">
              <h1 className="text-4xl font-extrabold text-white leading-tight">
                متجرك الرقمي<br />
                <span className="text-emerald-400">في سوق الملايين</span>
              </h1>
              <p className="text-emerald-200/70 text-base leading-relaxed max-w-xs mx-auto">
                أدِر منتجاتك، تابع طلباتك، وابنِ علامتك التجارية — كل شيء من مكان واحد.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: "🛍️", text: "عرض منتجاتك أمام آلاف المشترين" },
                { icon: "📊", text: "تحليلات مبيعات ومتابعة لحظية" },
                { icon: "🔗", text: "تكامل مع سوق داسم والشحن الذكي" },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <span className="text-xl">{f.icon}</span>
                  <span className="text-emerald-100 text-sm">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-emerald-500/50 text-xs text-center">
            متاجر داسم — منظومة DASM للتجارة الرقمية
          </p>
        </div>

        {/* ── Left: Login form ────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 bg-white dark:bg-gray-950 min-h-screen">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold"
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
            >
              م
            </div>
            <div>
              <p className="font-extrabold text-gray-900 dark:text-white">متاجر داسم</p>
              <p className="text-emerald-600 text-xs">DASM Stores</p>
            </div>
          </div>

          <div className="max-w-sm w-full mx-auto space-y-7">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                أهلاً بعودتك 👋
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                سجّل دخولك لإدارة متجرك ومتابعة مبيعاتك.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@dasm.com.sa"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    كلمة المرور
                  </label>
                  <a
                    href="https://www.dasm.com.sa/auth/forgot-password"
                    className="text-xs text-emerald-600 hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: busy ? "#15803d" : "linear-gradient(135deg, #16a34a, #15803d)" }}
              >
                {busy ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    جاري الدخول...
                  </>
                ) : (
                  <>دخول ←</>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 dark:text-gray-600">
              ليس لديك حساب؟{" "}
              <a href="https://www.dasm.com.sa/auth/register" className="text-emerald-600 font-medium hover:underline">
                أنشئه الآن
              </a>
            </p>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 text-center">
              <a href="https://www.dasm.com.sa" className="text-xs text-gray-400 hover:text-emerald-600 transition">
                ← العودة لمنصة داسم
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

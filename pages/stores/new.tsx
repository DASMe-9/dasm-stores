import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Store, ArrowRight, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  { value: "fashion",      label: "أزياء وملابس" },
  { value: "electronics",  label: "إلكترونيات" },
  { value: "food",         label: "مأكولات ومشروبات" },
  { value: "home",         label: "منزل وديكور" },
  { value: "automotive",   label: "سيارات وقطع غيار" },
  { value: "beauty",       label: "عطور ومستحضرات" },
  { value: "sports",       label: "رياضة ولياقة" },
  { value: "general",      label: "متنوع / أخرى" },
];

export default function NewStore() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [form, setForm] = useState({
    name:        "",
    name_ar:     "",
    category:    "general",
    description: "",
  });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("stores_token");
    if (!t) { router.replace("/auth/login?returnUrl=/stores/new"); return; }
    setToken(t);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stores/create", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "فشل الإنشاء");
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        جاري التحميل...
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 rtl">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-sm w-full space-y-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-bold text-gray-900">تم إرسال طلب التفعيل</h2>
          <p className="text-sm text-gray-500">
            تم إنشاء متجرك وإرسال طلب التفعيل لفريق داسم. سيتم مراجعته قريباً.
          </p>
          <p className="text-xs text-gray-400">سيتم توجيهك للوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>متجر جديد — متاجر داسم</title>
      </Head>
      <div className="min-h-screen bg-gray-50 rtl">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100 transition"
          >
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </button>
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">إنشاء متجر جديد</div>
            <div className="text-xs text-gray-400">متاجر داسم</div>
          </div>
        </header>

        <main className="max-w-xl mx-auto px-6 py-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h1 className="text-base font-bold text-gray-900">بيانات المتجر</h1>

            {/* اسم المتجر بالعربي */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                اسم المتجر بالعربي <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                placeholder="مثال: متجر الهلال"
                value={form.name_ar}
                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* اسم المتجر بالإنجليزي */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                اسم المتجر بالإنجليزي <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                placeholder="e.g. Al-Hilal Store"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left placeholder:text-right"
                dir="ltr"
              />
            </div>

            {/* الفئة */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">تصنيف المتجر</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* وصف مختصر */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">وصف مختصر (اختياري)</label>
              <textarea
                rows={3}
                maxLength={300}
                placeholder="ماذا يبيع متجرك؟"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* ملاحظة */}
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-xs text-emerald-700">
              بعد الإنشاء سيُرسل طلب التفعيل لفريق داسم تلقائياً، وسيتم إشعارك عند قبول متجرك.
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition disabled:opacity-60 text-sm"
            >
              {loading ? "جاري الإرسال..." : "إنشاء المتجر وإرسال طلب التفعيل"}
            </button>
          </form>
        </main>
      </div>
    </>
  );
}

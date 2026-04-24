import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Search, TrendingUp, Globe, FileText,
  RefreshCw, ExternalLink, AlertCircle,
  CheckCircle2, Loader2,
} from "lucide-react";

const API_BASE   = process.env.NEXT_PUBLIC_API_URL || "https://api.dasm.com.sa/api";
const STORE_HOST = "store.dasm.com.sa";

const fmtNum = (n: number) => Number(n || 0).toLocaleString("ar-SA");
const fmtPct = (n: number) => `${Number(n || 0).toFixed(1)}%`;

type Period = 7 | 28 | 90;

export default function StoresSeoPage() {
  const router  = useRouter();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState<Period>(28);
  const [token, setToken]     = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("stores_token") || localStorage.getItem("dasm_token");
    if (!t) { router.replace("/auth/login?returnUrl=/admin/seo"); return; }
    setToken(t);
  }, [router]);

  const load = async (d: Period = period, t = token) => {
    if (!t) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/seo/gsc?days=${d}`, {
        headers: { Authorization: `Bearer ${t}`, Accept: "application/json" },
      });
      const body = await res.json();
      setData(body);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) load(period, token); }, [token, period]);

  const perf      = data?.data?.performance;
  const queries   = data?.data?.top_queries ?? [];
  const pages     = (data?.data?.top_pages ?? []).filter(
    (p: any) => typeof p.page === "string" && p.page.includes(STORE_HOST)
  );
  const countries = data?.data?.by_country ?? [];
  const sitemaps  = data?.data?.sitemaps ?? [];

  return (
    <>
      <Head><title>أداء محرك البحث — متاجر داسم</title></Head>

      <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-[Tajawal,sans-serif]" dir="rtl">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="bg-gradient-to-l from-emerald-800 to-slate-900 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Search className="w-7 h-7" />
                <div>
                  <h1 className="text-2xl font-bold">أداء محرك البحث</h1>
                  <p className="text-white/70 text-sm mt-0.5">Google Search Console — متاجر داسم ({STORE_HOST})</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {([7, 28, 90] as Period[]).map((d) => (
                  <button key={d} onClick={() => setPeriod(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      period === d ? "bg-white text-emerald-800" : "bg-white/10 text-white hover:bg-white/20"
                    }`}>
                    {d === 7 ? "أسبوع" : d === 28 ? "28 يوم" : "3 أشهر"}
                  </button>
                ))}
                <button onClick={() => load(period)} disabled={loading}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Not configured */}
          {data && !data.configured && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-amber-900">يحتاج إعداد — راجع /admin/seo على منصة داسم الأم</h3>
              </div>
              <ol className="space-y-2">
                {(data.setup_steps ?? []).map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-amber-800">
                    <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-700 font-bold flex items-center justify-center shrink-0 text-xs">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          )}

          {!loading && data?.configured && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 flex items-center gap-2">
                <Globe className="w-4 h-4 shrink-0" />
                <span>مؤشرات النقرات والظهور تغطي <strong>كل dasm.com.sa</strong> — الصفحات مفلترة لـ <strong>{STORE_HOST}</strong> فقط.</span>
              </div>

              {/* KPI Cards */}
              {perf && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "إجمالي النقرات",  value: fmtNum(perf.clicks),      icon: TrendingUp, color: "text-blue-600",   bg: "bg-blue-50"   },
                    { label: "إجمالي الظهور",   value: fmtNum(perf.impressions), icon: Globe,      color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "معدل النقر CTR",  value: fmtPct(perf.ctr),         icon: Search,     color: "text-emerald-600",bg: "bg-emerald-50"},
                    { label: "متوسط الترتيب",   value: `#${perf.position}`,      icon: FileText,   color: "text-amber-600",  bg: "bg-amber-50"  },
                  ].map((s) => (
                    <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">{s.label}</span>
                        <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                          <s.icon className={`w-4 h-4 ${s.color}`} />
                        </div>
                      </div>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">آخر {period} يوم</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Queries */}
                {queries.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900">أكثر الكلمات المفتاحية</h3>
                      <p className="text-xs text-gray-500 mt-0.5">ما يبحث عنه الناس للوصول لداسم</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {["الكلمة", "نقرات", "ظهور", "CTR", "ترتيب"].map(h => (
                            <th key={h} className="px-3 py-2 text-right text-xs font-semibold text-gray-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {queries.map((q: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2.5 font-medium text-gray-900 max-w-[160px] truncate">{q.query}</td>
                            <td className="px-3 py-2.5 text-blue-600 font-semibold">{fmtNum(q.clicks)}</td>
                            <td className="px-3 py-2.5 text-gray-500">{fmtNum(q.impressions)}</td>
                            <td className="px-3 py-2.5 text-emerald-600">{fmtPct(q.ctr)}</td>
                            <td className="px-3 py-2.5 text-amber-600 font-mono">#{q.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Top Pages — store only */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">أكثر صفحات المتاجر ظهوراً</h3>
                    <p className="text-xs text-gray-500 mt-0.5">صفحات {STORE_HOST} في نتائج Google</p>
                  </div>
                  {pages.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>لا توجد بيانات لـ {STORE_HOST} بعد</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {["الصفحة", "نقرات", "ظهور", "CTR", "ترتيب"].map(h => (
                            <th key={h} className="px-3 py-2 text-right text-xs font-semibold text-gray-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pages.map((p: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2.5 max-w-[180px]">
                              <a href={p.page} target="_blank" rel="noreferrer"
                                className="text-blue-500 hover:underline text-xs truncate block" dir="ltr">
                                {p.page.replace(/^https?:\/\/[^/]+/, "") || "/"}
                              </a>
                            </td>
                            <td className="px-3 py-2.5 text-blue-600 font-semibold">{fmtNum(p.clicks)}</td>
                            <td className="px-3 py-2.5 text-gray-500">{fmtNum(p.impressions)}</td>
                            <td className="px-3 py-2.5 text-emerald-600">{fmtPct(p.ctr)}</td>
                            <td className="px-3 py-2.5 text-amber-600 font-mono">#{p.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Countries + Sitemaps */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {countries.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3">الزوار حسب الدولة</h3>
                    <div className="space-y-2">
                      {countries.map((c: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="font-mono text-gray-700" dir="ltr">{c.country}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-blue-600">{fmtNum(c.clicks)} نقرة</span>
                            <span className="text-gray-400 text-xs">{fmtNum(c.impressions)} ظهور</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">خرائط الموقع (Sitemaps)</h3>
                    <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                      فتح GSC <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {sitemaps.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>لم يُرسَل أي sitemap بعد</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sitemaps.map((s: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                          <code className="text-xs font-mono text-gray-700" dir="ltr">{s.path}</code>
                          {s.errors > 0
                            ? <span className="text-xs text-red-500">{s.errors} خطأ</span>
                            : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

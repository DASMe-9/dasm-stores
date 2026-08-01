import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { BarChart3, MousePointerClick, ShoppingBag, Eye, Wallet } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";

/**
 * ما تعرضه هذه الصفحة للتاجر: أعداد ومصادر فقط — لا أشخاص.
 * الهُوّيّات مجزّأة في محرّك الإعلانات ولا تصل إلى هنا إطلاقًا.
 */

type Totals = {
  impressions: number;
  clicks: number;
  ctr: number | null;
  spend_sar: number;
  conversions: number;
  conversion_value_sar: number;
  cpa_sar: number | null;
  roas: number | null;
};

type Report = {
  period: { from: string; to: string };
  totals: Totals;
  by_event: Array<{ event: string; conversions: number; value_sar: number }>;
  by_source: Array<{ slot: string; conversions: number }>;
  campaigns: Array<{
    campaign_id: number;
    name: string | null;
    impressions: number;
    clicks: number;
    spend_sar: number;
    conversions: number;
  }>;
};

const RANGES = [
  { days: 7, label: "آخر ٧ أيّام" },
  { days: 30, label: "آخر ٣٠ يومًا" },
  { days: 90, label: "آخر ٩٠ يومًا" },
];

const EVENT_LABELS: Record<string, string> = {
  "store.visit.from_ad": "زيارة المتجر من إعلان",
  "store.product.purchase": "شراء منتج",
  "ad.click.external": "نقرة إلى رابط خارجيّ",
};

function eventLabel(event: string): string {
  return EVENT_LABELS[event] ?? event;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(value);
}

function formatMoney(value: number): string {
  return `${new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 2 }).format(value)} ر.س`;
}

/** النسب الغائبة تُكتب «—» لا «٠٪» — الصفر يُقرأ فشلًا، والغائب مجهول. */
function formatRatio(value: number | null): string {
  if (value === null) return "—";
  return `${new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 2 }).format(value * 100)}٪`;
}

function DashboardAdsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [rangeDays, setRangeDays] = useState(30);

  const load = useCallback(async (days: number) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("stores_token");
      const selectedStore = localStorage.getItem("dasm_selected_store_id");
      const to = new Date();
      const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

      const params = new URLSearchParams({
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
      });

      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      if (selectedStore) headers["X-DASM-Store-Id"] = selectedStore;

      const res = await fetch(`/api/ads/report?${params.toString()}`, { headers });

      if (res.status === 403) {
        setError("لا يوجد متجر مرتبط بحسابك بعد.");
        setReport(null);
        return;
      }

      if (res.status === 503) {
        setError("خدمة الإعلانات غير مهيّأة بعد. تواصل مع الدعم.");
        setReport(null);
        return;
      }

      if (!res.ok) {
        setError("تعذّر تحميل نتائج الإعلانات. حاول بعد قليل.");
        setReport(null);
        return;
      }

      setReport((await res.json()) as Report);
    } catch {
      setError("تعذّر الاتّصال بخدمة الإعلانات.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("stores_token");
    if (!token) {
      router.replace("/auth/login?returnUrl=/dashboard/ads");
      return;
    }

    void load(rangeDays);
  }, [load, rangeDays, router]);

  const totals = report?.totals;
  const hasActivity = Boolean(totals && (totals.impressions > 0 || totals.conversions > 0));

  return (
    <SellerShell
      title="نتائج الإعلانات"
      subtitle="ما حقّقته الإعلانات التي توصل إلى متجرك — أعداد ومصادر، بلا بيانات أشخاص."
      icon={BarChart3}
      actions={
        <div className="flex gap-2">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              onClick={() => setRangeDays(range.days)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                rangeDays === range.days
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      }
    >
      <Head>
        <title>نتائج الإعلانات | داسم متاجر</title>
      </Head>

      <div className="space-y-6" dir="rtl">
        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-xl border border-gray-100 bg-gray-50" />
            ))}
          </div>
        )}

        {!loading && totals && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Eye className="h-5 w-5 text-blue-600" />}
                label="مرّات الظهور"
                value={formatNumber(totals.impressions)}
              />
              <StatCard
                icon={<MousePointerClick className="h-5 w-5 text-indigo-600" />}
                label="النقرات"
                value={formatNumber(totals.clicks)}
                hint={`نسبة النقر ${formatRatio(totals.ctr)}`}
              />
              <StatCard
                icon={<ShoppingBag className="h-5 w-5 text-emerald-600" />}
                label="النتائج"
                value={formatNumber(totals.conversions)}
                hint={`قيمة مقدَّرة ${formatMoney(totals.conversion_value_sar)}`}
              />
              <StatCard
                icon={<Wallet className="h-5 w-5 text-rose-600" />}
                label="الإنفاق"
                value={formatMoney(totals.spend_sar)}
                hint={
                  totals.cpa_sar === null
                    ? "تكلفة النتيجة —"
                    : `تكلفة النتيجة ${formatMoney(totals.cpa_sar)}`
                }
              />
            </div>

            {!hasActivity && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
                لا يوجد نشاط إعلانيّ في هذه المدّة. حين تعمل حملة توصل إلى متجرك، تظهر نتائجها هنا.
              </div>
            )}

            {report && report.by_event.length > 0 && (
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">نوع النتيجة</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-right text-gray-500">
                      <th className="pb-2 font-medium">النتيجة</th>
                      <th className="pb-2 font-medium">العدد</th>
                      <th className="pb-2 font-medium">القيمة المقدَّرة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report.by_event.map((row) => (
                      <tr key={row.event}>
                        <td className="py-2 text-gray-800">{eventLabel(row.event)}</td>
                        <td className="py-2 text-gray-800">{formatNumber(row.conversions)}</td>
                        <td className="py-2 text-gray-800">{formatMoney(row.value_sar)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {report && report.by_source.length > 0 && (
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">مصدر النتيجة</h2>
                <ul className="space-y-2 text-sm">
                  {report.by_source.map((row) => (
                    <li key={row.slot} className="flex items-center justify-between">
                      <span className="text-gray-700">{row.slot}</span>
                      <span className="font-medium text-gray-900">{formatNumber(row.conversions)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {report && report.campaigns.length > 0 && (
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">الحملات</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="text-right text-gray-500">
                        <th className="pb-2 font-medium">الحملة</th>
                        <th className="pb-2 font-medium">الظهور</th>
                        <th className="pb-2 font-medium">النقرات</th>
                        <th className="pb-2 font-medium">النتائج</th>
                        <th className="pb-2 font-medium">الإنفاق</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {report.campaigns.map((row) => (
                        <tr key={row.campaign_id}>
                          <td className="py-2 text-gray-800">{row.name ?? `حملة ${row.campaign_id}`}</td>
                          <td className="py-2 text-gray-800">{formatNumber(row.impressions)}</td>
                          <td className="py-2 text-gray-800">{formatNumber(row.clicks)}</td>
                          <td className="py-2 text-gray-800">{formatNumber(row.conversions)}</td>
                          <td className="py-2 text-gray-800">{formatMoney(row.spend_sar)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </SellerShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
    </div>
  );
}

export default DashboardAdsPage;

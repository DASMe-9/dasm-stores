import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Download, Eye, Link2, RefreshCw, Unplug } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";

type ImportRun = {
  id: number;
  status?: string | null;
  products_imported?: number | null;
  products_skipped?: number | null;
  started_at?: string | null;
  finished_at?: string | null;
};

type ImportConnection = {
  id: number;
  provider: string;
  external_store_id?: string | null;
  connected?: boolean;
  last_sync_at?: string | null;
  last_sync_status?: string | null;
  last_sync_message?: string | null;
  settings?: {
    external_name?: string | null;
    external_domain?: string | null;
  } | null;
  recent_runs?: ImportRun[];
};

type ImportStatusResponse = {
  connections?: ImportConnection[];
  salla_configured?: boolean;
};

function statusLabel(status?: string | null): string {
  switch (status) {
    case "ok":
      return "ناجح";
    case "partial":
      return "جزئي";
    case "failed":
      return "فشل";
    case "running":
      return "جاري";
    default:
      return status || "—";
  }
}

type ImportPreview = {
  total_remote?: number;
  would_import?: number;
  would_skip?: number;
  sample_new_products?: Array<{
    external_id?: string;
    name?: string;
    price?: number;
    sku?: string | null;
    image_url?: string | null;
  }>;
};

function DashboardImportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [data, setData] = useState<ImportStatusResponse | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);

  const sallaConnection = data?.connections?.find((c) => c.provider === "salla");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sellerApi.getImportStatus();
      setData(res.data as ImportStatusResponse);
    } catch {
      setFlash("تعذّر تحميل حالة الاستيراد");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("stores_token");
    if (!token) {
      router.replace("/auth/login?returnUrl=/dashboard/import");
      return;
    }
    void load();
  }, [load, router]);

  useEffect(() => {
    if (!router.isReady) return;
    const salla = router.query.salla;
    const message = router.query.message;
    if (typeof salla === "string") {
      if (salla === "connected") {
        setFlash(typeof message === "string" ? message : "تم ربط Salla بنجاح");
        void load();
      } else if (salla === "error") {
        setFlash(typeof message === "string" ? message : "فشل ربط Salla");
      }
      router.replace("/dashboard/import", undefined, { shallow: true });
    }
  }, [router, load]);

  async function connectSalla() {
    setBusy("connect");
    setFlash(null);
    try {
      const res = await sellerApi.getSallaAuthorizeUrl();
      const url = (res.data as { authorize_url?: string }).authorize_url;
      if (!url) throw new Error("missing authorize_url");
      window.location.href = url;
    } catch {
      setFlash("تعذّر بدء ربط Salla. تأكد أن الخدمة مفعّلة على المنصة.");
      setBusy(null);
    }
  }

  async function runPreview() {
    setBusy("preview");
    setFlash(null);
    setPreview(null);
    try {
      const res = await sellerApi.previewSallaImport({ limit: 200 });
      const payload = (res.data as { data?: ImportPreview }).data;
      setPreview(payload ?? null);
    } catch {
      setFlash("تعذّرت معاينة المنتجات. تأكد أن Salla مربوطة.");
    } finally {
      setBusy(null);
    }
  }

  async function runImport() {
    setBusy("import");
    setFlash(null);
    try {
      await sellerApi.runSallaImport({ limit: 200 });
      setFlash("بدأ استيراد المنتجات في الخلفية. حدّث الصفحة بعد دقيقة.");
      await load();
    } catch {
      setFlash("تعذّر بدء الاستيراد. تأكد أن Salla مربوطة.");
    } finally {
      setBusy(null);
    }
  }

  async function disconnectSalla() {
    if (!window.confirm("فصل Salla؟ لن يُحذف المنتجات المستوردة.")) return;
    setBusy("disconnect");
    setFlash(null);
    try {
      await sellerApi.disconnectSalla();
      setFlash("تم فصل Salla");
      await load();
    } catch {
      setFlash("تعذّر فصل Salla");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <Head>
        <title>استيراد من Salla — متاجر داسم</title>
      </Head>
      <SellerShell
        title="استيراد المنتجات"
        subtitle="اربط متجر Salla واستورد الكatalog إلى متجر داسم"
        icon={Download}
        hasStore
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </button>
        }
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {flash && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100">
              {flash}
            </div>
          )}

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Salla</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  OAuth آمن — لا نخزّن كلمة مرور Salla. الاستيراد الأولي للمنتجات والصور.
                </p>
              </div>
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  sallaConnection?.connected
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
                ].join(" ")}
              >
                {loading ? "…" : sallaConnection?.connected ? "متصل" : "غير مربوط"}
              </span>
            </div>

            {!loading && data?.salla_configured === false && (
              <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                ربط Salla غير مفعّل على الخادم بعد. سجّل تطبيق Salla على Render ثم أعد المحاولة.
              </p>
            )}

            {sallaConnection?.connected && (
              <dl className="mt-4 grid gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                {sallaConnection.settings?.external_name && (
                  <div>
                    <dt className="inline font-medium">المتجر: </dt>
                    <dd className="inline">{sallaConnection.settings.external_name}</dd>
                  </div>
                )}
                {sallaConnection.last_sync_at && (
                  <div>
                    <dt className="inline font-medium">آخر مزامنة: </dt>
                    <dd className="inline">
                      {new Date(sallaConnection.last_sync_at).toLocaleString("ar-SA")} —{" "}
                      {statusLabel(sallaConnection.last_sync_status)}
                    </dd>
                  </div>
                )}
                {sallaConnection.last_sync_message && (
                  <div className="text-zinc-500">{sallaConnection.last_sync_message}</div>
                )}
              </dl>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {!sallaConnection?.connected ? (
                <button
                  type="button"
                  disabled={busy !== null || data?.salla_configured === false}
                  onClick={() => void connectSalla()}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Link2 className="h-4 w-4" />
                  {busy === "connect" ? "جاري التحويل…" : "ربط Salla"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void runPreview()}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                  >
                    <Eye className="h-4 w-4" />
                    {busy === "preview" ? "جاري المعاينة…" : "معاينة قبل الاستيراد"}
                  </button>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void runImport()}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    {busy === "import" ? "جاري البدء…" : "استيراد المنتجات"}
                  </button>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void disconnectSalla()}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300"
                  >
                    <Unplug className="h-4 w-4" />
                    فصل
                  </button>
                </>
              )}
              <Link
                href="/dashboard/products"
                className="inline-flex items-center rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200"
              >
                عرض المنتجات
              </Link>
            </div>

            {preview && (
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">نتيجة المعاينة (dry-run)</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  في Salla: <strong>{preview.total_remote ?? 0}</strong> — جديد:{" "}
                  <strong>{preview.would_import ?? 0}</strong> — موجود مسبقاً:{" "}
                  <strong>{preview.would_skip ?? 0}</strong>
                </p>
                {preview.sample_new_products && preview.sample_new_products.length > 0 && (
                  <ul className="mt-3 space-y-2 text-sm">
                    {preview.sample_new_products.map((item) => (
                      <li
                        key={item.external_id ?? item.name}
                        className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 dark:bg-zinc-900"
                      >
                        <span className="font-medium text-zinc-800 dark:text-zinc-100">{item.name}</span>
                        <span className="text-zinc-500">{item.price ?? 0} ر.س</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {sallaConnection?.recent_runs && sallaConnection.recent_runs.length > 0 && (
              <div className="mt-8 overflow-x-auto">
                <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">آخر عمليات الاستيراد</h3>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-right dark:border-zinc-700">
                      <th className="py-2 pe-4">الحالة</th>
                      <th className="py-2 pe-4">مستورد</th>
                      <th className="py-2 pe-4">متخطّى</th>
                      <th className="py-2">الوقت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sallaConnection.recent_runs.map((run) => (
                      <tr key={run.id} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-2 pe-4">{statusLabel(run.status)}</td>
                        <td className="py-2 pe-4">{run.products_imported ?? 0}</td>
                        <td className="py-2 pe-4">{run.products_skipped ?? 0}</td>
                        <td className="py-2">
                          {run.finished_at
                            ? new Date(run.finished_at).toLocaleString("ar-SA")
                            : run.started_at
                              ? new Date(run.started_at).toLocaleString("ar-SA")
                              : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </SellerShell>
    </>
  );
}

export default DashboardImportPage;

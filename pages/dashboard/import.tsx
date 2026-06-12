import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Eye,
  Link2,
  Palette,
  RefreshCw,
  Settings,
  Unplug,
} from "lucide-react";
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
  token_status?: "connected" | "expired" | "needs_reconnect" | "not_connected" | string | null;
  token_expires_at?: string | null;
  last_sync_at?: string | null;
  last_sync_status?: string | null;
  last_sync_message?: string | null;
  settings?: {
    external_name?: string | null;
    external_domain?: string | null;
    shop_domain?: string | null;
  } | null;
  recent_runs?: ImportRun[];
};

type ImportStatusResponse = {
  connections?: ImportConnection[];
  salla_configured?: boolean;
  salla_config?: {
    configured?: boolean;
    missing_config?: string[];
    redirect_uri?: string | null;
    required_config?: string[];
  };
  shopify_configured?: boolean;
};

function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as { message?: string; missing_config?: string[] } | undefined;
    if (body?.missing_config && body.missing_config.length > 0) {
      return `${body.message ?? fallback} Missing: ${body.missing_config.join(", ")}`;
    }
    if (body?.message) {
      return body.message;
    }
  }

  return fallback;
}

function sallaStatusLabel(connection?: ImportConnection): string {
  if (!connection?.connected) return "غير مربوط";
  if (connection.token_status === "expired") return "Token expired";
  if (connection.token_status === "needs_reconnect") return "Needs reconnect";
  return "متصل";
}

function sallaImportInProgress(connection?: ImportConnection): boolean {
  return Boolean(connection?.recent_runs?.some((run) => run.status === "running"));
}

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

const CHEERLY_SHOPIFY_DOMAIN = "we0crf-q5.myshopify.com";
const CHEERLY_SLUGS = new Set(["cheerlylive", "cheerlylife"]);

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
  const [flashTone, setFlashTone] = useState<"success" | "error">("success");
  const [data, setData] = useState<ImportStatusResponse | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [shopDomain, setShopDomain] = useState("");
  const [shopifyPreview, setShopifyPreview] = useState<ImportPreview | null>(null);
  const [migrationStats, setMigrationStats] = useState<{ imported_orders?: number; marketing_contacts?: number } | null>(null);
  const [csvResult, setCsvResult] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [showThemeGuide, setShowThemeGuide] = useState(false);

  const sallaConnection = data?.connections?.find((c) => c.provider === "salla");
  const shopifyConnection = data?.connections?.find((c) => c.provider === "shopify");
  const sallaConfig = data?.salla_config;
  const sallaMissingConfig = sallaConfig?.missing_config ?? [];
  const sallaNeedsReconnect = sallaConnection?.token_status === "needs_reconnect";
  const sallaRunning = sallaImportInProgress(sallaConnection) || busy === "import";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sellerApi.getImportStatus();
      setData(res.data as ImportStatusResponse);
      try {
        const statsRes = await sellerApi.getMigrationStats();
        setMigrationStats(statsRes.data as { imported_orders?: number; marketing_contacts?: number });
      } catch {
        setMigrationStats(null);
      }
    } catch {
      setFlashTone("error");
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
    if (typeof window === "undefined") return;
    void sellerApi
      .getMyStore()
      .then((res) => {
        const slug = (res.data as { store?: { slug?: string | null } })?.store?.slug;
        if (slug) {
          setStoreSlug(slug);
          if (!shopDomain && CHEERLY_SLUGS.has(slug.toLowerCase())) {
            setShopDomain(CHEERLY_SHOPIFY_DOMAIN);
          }
        }
      })
      .catch(() => {
        /* optional — import still works without slug */
      });
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const shopQuery = router.query.shop;
    if (typeof shopQuery === "string" && shopQuery.trim()) {
      setShopDomain(shopQuery.trim());
    }
  }, [router.isReady, router.query.shop]);

  useEffect(() => {
    if (!router.isReady) return;
    const salla = router.query.salla;
    const shopify = router.query.shopify;
    const message = router.query.message;
    if (typeof salla === "string") {
      if (salla === "connected") {
        setFlashTone("success");
        setFlash(typeof message === "string" ? message : "تم ربط Salla بنجاح");
        void load();
      } else if (salla === "error") {
        setFlashTone("error");
        setFlash(typeof message === "string" ? message : "فشل ربط Salla");
      }
      router.replace("/dashboard/import", undefined, { shallow: true });
      return;
    }
    if (typeof shopify === "string") {
      if (shopify === "connected") {
        setFlashTone("success");
        setFlash(typeof message === "string" ? message : "تم ربط Shopify بنجاح");
        setShowThemeGuide(true);
        void load();
      } else if (shopify === "error") {
        setFlashTone("error");
        setFlash(typeof message === "string" ? message : "فشل ربط Shopify");
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
    } catch (error) {
      setFlashTone("error");
      setFlash(apiErrorMessage(error, "Unable to start Salla connection."));
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
      setBusy(null);
    } catch (error) {
      setFlashTone("error");
      setFlash(apiErrorMessage(error, "Unable to preview Salla products."));
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
      setBusy(null);
    } catch (error) {
      setFlashTone("error");
      setFlash(apiErrorMessage(error, "Unable to start Salla import."));
      setBusy(null);
    }
  }

  async function disconnectSalla() {
    if (!window.confirm("فصل Salla؟ لن يُحذف المنتجات المستوردة.")) return;
    setBusy("disconnect-salla");
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

  async function connectShopify() {
    const shop = shopDomain.trim();
    if (!shop) {
      setFlash("أدخل نطاق متجر Shopify (مثل mystore.myshopify.com)");
      return;
    }
    setBusy("connect-shopify");
    setFlash(null);
    try {
      const res = await sellerApi.getShopifyAuthorizeUrl({ shop });
      const url = (res.data as { authorize_url?: string }).authorize_url;
      if (!url) throw new Error("missing authorize_url");
      window.location.href = url;
    } catch {
      setFlash("تعذّر بدء ربط Shopify. تأكد من النطاق وأن الخدمة مفعّلة على المنصة.");
      setBusy(null);
    }
  }

  async function runShopifyPreview() {
    setBusy("preview-shopify");
    setFlash(null);
    setShopifyPreview(null);
    try {
      const res = await sellerApi.previewShopifyImport({ limit: 200 });
      const payload = (res.data as { data?: ImportPreview }).data;
      setShopifyPreview(payload ?? null);
    } catch {
      setFlash("تعذّرت معاينة منتجات Shopify. تأكد أن المتجر مربوط.");
    } finally {
      setBusy(null);
    }
  }

  async function runShopifyImport() {
    setBusy("import-shopify");
    setFlash(null);
    try {
      await sellerApi.runShopifyImport({ limit: 200 });
      setFlash("بدأ استيراد منتجات Shopify في الخلفية. حدّث الصفحة بعد دقيقة، ثم خصّص الثيم من «تصميم المتجر».");
      setShowThemeGuide(true);
      await load();
    } catch {
      setFlash("تعذّر بدء استيراد Shopify. تأكد أن المتجر مربوط.");
    } finally {
      setBusy(null);
    }
  }

  async function disconnectShopify() {
    if (!window.confirm("فصل Shopify؟ لن تُحذف المنتجات المستوردة.")) return;
    setBusy("disconnect-shopify");
    setFlash(null);
    try {
      await sellerApi.disconnectShopify();
      setFlash("تم فصل Shopify");
      await load();
    } catch {
      setFlash("تعذّر فصل Shopify");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <Head>
        <title>استيراد المنتجات — متاجر داسم</title>
      </Head>
      <SellerShell
        title="استيراد المنتجات"
        subtitle="اربط Shopify رسمياً ثم خصّص واجهة متجر داسم (ألوان، شعار، تصميم) — الاستلهام من Shopify وليس نسخ قالب Theme Store"
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
            <div
              className={
                flashTone === "error"
                  ? "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100"
                  : "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100"
              }
            >
              {flash}
            </div>
          )}

          <section className="rounded-3xl border border-sky-200 bg-gradient-to-b from-sky-50/80 to-white p-6 shadow-sm dark:border-sky-900/50 dark:from-sky-950/30 dark:to-zinc-900">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">مسار ترحيل Shopify → داسم</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              المنتجات والأوصاف تُستورد عبر OAuth الرسمي. الشكل العام (ألوان، شعار، قالب داسم) يُضبط من لوحة التحكم — لا ننسخ
              قوالب Liquid من Shopify.
            </p>
            <ol className="mt-5 space-y-3">
              {[
                {
                  done: shopifyConnection?.connected,
                  title: "ربط متجر Shopify",
                  hint: "أدخل نطاق myshopify.com ووافق على الصلاحيات",
                },
                {
                  done: Boolean(shopifyPreview || shopifyConnection?.last_sync_status),
                  title: "معاينة ثم استيراد المنتجات",
                  hint: "معاينة dry-run ثم «استيراد المنتجات»",
                },
                {
                  done: showThemeGuide || (shopifyConnection?.recent_runs?.some((r) => r.status === "ok") ?? false),
                  title: "تخصيص واجهة متجر داسم",
                  hint: "ألوان وقالب من «تصميم المتجر» — شعار وبيانات من «إعدادات المتجر»",
                },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-3 text-sm">
                  <span
                    className={[
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      step.done
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300",
                    ].join(" ")}
                  >
                    {step.done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{step.title}</p>
                    <p className="text-zinc-600 dark:text-zinc-400">{step.hint}</p>
                  </div>
                </li>
              ))}
            </ol>
            {(showThemeGuide || shopifyConnection?.connected) && (
              <div className="mt-5 flex flex-wrap gap-3 border-t border-sky-100 pt-5 dark:border-sky-900/40">
                <Link
                  href="/dashboard/theme"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <Palette className="h-4 w-4" />
                  تصميم المتجر (ألوان وقالب)
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <Settings className="h-4 w-4" />
                  إعدادات المتجر (شعار، تبويبات، تواصل)
                </Link>
                {storeSlug && (
                  <Link
                    href={`/${storeSlug}?preview=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-200"
                  >
                    معاينة الواجهة
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Salla</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  OAuth آمن — لا نخزّن كلمة مرور Salla. الاستيراد الأولي للمنتجات والصور.
                </p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Invite Salla Merchant: Each Salla merchant must connect their own store to authorize DASM to import their products.
                </p>
              </div>
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  sallaConnection?.connected && !sallaNeedsReconnect
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                    : sallaNeedsReconnect
                      ? "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
                ].join(" ")}
              >
                {loading ? "..." : sallaRunning ? "Import in progress" : sallaStatusLabel(sallaConnection)}
              </span>
            </div>

            {!loading && sallaConfig?.configured === false && (
              <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                <p className="font-semibold">Salla server configuration is incomplete.</p>
                <p className="mt-1">Missing server config: {sallaMissingConfig.length > 0 ? sallaMissingConfig.join(", ") : "unknown"}</p>
                <p className="mt-1 text-xs">Set the missing keys on the API server/Render and make sure the Salla Partner redirect URI matches {sallaConfig?.redirect_uri ?? "the configured callback URL"}.</p>
              </div>
            )}

            {sallaConnection?.connected && (
              <dl className="mt-4 grid gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <div>
                  <dt className="inline font-medium">Connection status: </dt>
                  <dd className="inline">{sallaStatusLabel(sallaConnection)}</dd>
                </div>
                {sallaRunning && (
                  <div className="text-emerald-700 dark:text-emerald-300">Import in progress</div>
                )}
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
              {!sallaConnection?.connected || sallaNeedsReconnect ? (
                <button
                  type="button"
                  disabled={busy !== null || sallaConfig?.configured === false}
                  onClick={() => void connectSalla()}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Link2 className="h-4 w-4" />
                  {busy === "connect" ? "Redirecting..." : sallaNeedsReconnect ? "Reconnect Salla" : "Connect Salla"}
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

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Shopify (الربط الرسمي)</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  OAuth على نطاق متجرك — استيراد المنتجات والأوصاف والصور عبر Admin REST API. بعد الاستيراد، اضبط
                  المظهر من «تصميم المتجر» و«إعدادات المتجر» (لا نستورد قالب Theme Store).
                </p>
              </div>
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  shopifyConnection?.connected
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
                ].join(" ")}
              >
                {loading ? "…" : shopifyConnection?.connected ? "متصل" : "غير مربوط"}
              </span>
            </div>

            {!loading && data?.shopify_configured === false && (
              <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                ربط Shopify غير مفعّل على الخادم بعد. أضف SHOPIFY_CLIENT_ID/SECRET على Render ثم أعد المحاولة.
              </p>
            )}

            {shopifyConnection?.connected && (
              <dl className="mt-4 grid gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                {shopifyConnection.settings?.shop_domain && (
                  <div>
                    <dt className="inline font-medium">النطاق: </dt>
                    <dd className="inline font-mono">{shopifyConnection.settings.shop_domain}</dd>
                  </div>
                )}
                {shopifyConnection.settings?.external_name && (
                  <div>
                    <dt className="inline font-medium">المتجر: </dt>
                    <dd className="inline">{shopifyConnection.settings.external_name}</dd>
                  </div>
                )}
                {shopifyConnection.last_sync_at && (
                  <div>
                    <dt className="inline font-medium">آخر مزامنة: </dt>
                    <dd className="inline">
                      {new Date(shopifyConnection.last_sync_at).toLocaleString("ar-SA")} —{" "}
                      {statusLabel(shopifyConnection.last_sync_status)}
                    </dd>
                  </div>
                )}
              </dl>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {!shopifyConnection?.connected ? (
                <>
                  <input
                    type="text"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    placeholder="we0crf-q5.myshopify.com"
                    className="min-w-[220px] flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    aria-label="نطاق Shopify"
                  />
                  <button
                    type="button"
                    disabled={busy !== null || data?.shopify_configured === false}
                    onClick={() => void connectShopify()}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Link2 className="h-4 w-4" />
                    {busy === "connect-shopify" ? "جاري التحويل…" : "ربط Shopify"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void runShopifyPreview()}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                  >
                    <Eye className="h-4 w-4" />
                    {busy === "preview-shopify" ? "جاري المعاينة…" : "معاينة قبل الاستيراد"}
                  </button>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void runShopifyImport()}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    {busy === "import-shopify" ? "جاري البدء…" : "استيراد المنتجات"}
                  </button>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void disconnectShopify()}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300"
                  >
                    <Unplug className="h-4 w-4" />
                    فصل
                  </button>
                </>
              )}
            </div>

            {shopifyPreview && (
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">معاينة Shopify</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  في Shopify: <strong>{shopifyPreview.total_remote ?? 0}</strong> — جديد:{" "}
                  <strong>{shopifyPreview.would_import ?? 0}</strong> — موجود:{" "}
                  <strong>{shopifyPreview.would_skip ?? 0}</strong>
                </p>
              </div>
            )}

            {shopifyConnection?.recent_runs && shopifyConnection.recent_runs.length > 0 && (
              <div className="mt-8 overflow-x-auto">
                <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">آخر عمليات Shopify</h3>
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
                    {shopifyConnection.recent_runs.map((run) => (
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

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">ترحيل CSV (طلبات + عملاء)</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              بعد إعادة تفعيل Shopify (1 يونيو): صدّر Orders وCustomers من لوحة Shopify وارفع الملفات هنا. الطلبات تظهر للقراءة في لوحتك؛ جهات الاتصال للتسويق فقط (بدون كلمات مرور).
            </p>
            {migrationStats ? (
              <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
                مستورد: <strong>{migrationStats.imported_orders ?? 0}</strong> طلب —{" "}
                <strong>{migrationStats.marketing_contacts ?? 0}</strong> جهة اتصال
              </p>
            ) : null}
            {csvResult ? (
              <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                {csvResult}
              </p>
            ) : null}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <CsvUploadCard
                label="طلبات Shopify (orders_export.csv)"
                busy={busy === "orders-csv"}
                onFile={async (file) => {
                  setBusy("orders-csv");
                  setCsvResult(null);
                  try {
                    const res = await sellerApi.importOrdersCsv(file, "shopify");
                    const body = res.data as { imported?: number; skipped?: number; errors?: string[] };
                    setCsvResult(
                      `طلبات: ${body.imported ?? 0} جديد، ${body.skipped ?? 0} متخطّى` +
                        (body.errors?.length ? ` — ${body.errors.slice(0, 2).join("؛ ")}` : ""),
                    );
                    void load();
                  } catch {
                    setCsvResult("فشل رفع ملف الطلبات");
                  } finally {
                    setBusy(null);
                  }
                }}
              />
              <CsvUploadCard
                label="عملاء Shopify (customers_export.csv)"
                busy={busy === "customers-csv"}
                onFile={async (file) => {
                  setBusy("customers-csv");
                  setCsvResult(null);
                  try {
                    const res = await sellerApi.importCustomersCsv(file, "shopify");
                    const body = res.data as { imported?: number; skipped?: number; errors?: string[] };
                    setCsvResult(
                      `عملاء: ${body.imported ?? 0} جديد، ${body.skipped ?? 0} متخطّى` +
                        (body.errors?.length ? ` — ${body.errors.slice(0, 2).join("؛ ")}` : ""),
                    );
                    void load();
                  } catch {
                    setCsvResult("فشل رفع ملف العملاء");
                  } finally {
                    setBusy(null);
                  }
                }}
              />
            </div>
          </section>
        </div>
      </SellerShell>
    </>
  );
}

export default DashboardImportPage;

function CsvUploadCard({
  label,
  busy,
  onFile,
}: {
  label: string;
  busy: boolean;
  onFile: (file: File) => Promise<void>;
}) {
  return (
    <label className="flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-zinc-300 p-4 text-sm dark:border-zinc-600">
      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{label}</span>
      <input
        type="file"
        accept=".csv,text/csv"
        disabled={busy}
        className="text-xs"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
          e.target.value = "";
        }}
      />
      {busy ? <span className="text-xs text-zinc-500">جاري الرفع…</span> : null}
    </label>
  );
}

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ElementType, ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import {
  Boxes,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  Link2,
  Palette,
  Plug,
  RefreshCw,
  ShieldCheck,
  Store,
  Unplug,
  UploadCloud,
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

const CHEERLY_SHOPIFY_DOMAIN = "we0crf-q5.myshopify.com";
const CHEERLY_SLUGS = new Set(["cheerlylive", "cheerlylife"]);

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
  if (!connection?.connected) return "جاهز للربط";
  if (connection.token_status === "expired") return "انتهت صلاحية الربط";
  if (connection.token_status === "needs_reconnect") return "يحتاج إعادة ربط";
  return "يوجد ربط نشط";
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
      return status || "-";
  }
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("ar-SA");
}

function latestRun(connection?: ImportConnection): ImportRun | undefined {
  return connection?.recent_runs?.[0];
}

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

  const sallaConnection = data?.connections?.find((connection) => connection.provider === "salla");
  const shopifyConnection = data?.connections?.find((connection) => connection.provider === "shopify");
  const sallaConfig = data?.salla_config;
  const sallaMissingConfig = sallaConfig?.missing_config ?? [];
  const sallaRunning = sallaImportInProgress(sallaConnection) || busy === "import";
  const sallaLastRun = latestRun(sallaConnection);
  const shopifyLastRun = latestRun(shopifyConnection);
  const hasAnyConnection = Boolean(sallaConnection?.connected || shopifyConnection?.connected);
  const connectedCount = Number(Boolean(sallaConnection?.connected)) + Number(Boolean(shopifyConnection?.connected));
  const totalImported = (sallaLastRun?.products_imported ?? 0) + (shopifyLastRun?.products_imported ?? 0);
  const totalSkipped = (sallaLastRun?.products_skipped ?? 0) + (shopifyLastRun?.products_skipped ?? 0);
  const shopifyReadyForTheme =
    showThemeGuide || (shopifyConnection?.recent_runs?.some((run) => run.status === "ok") ?? false);

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
      setFlash("تعذر تحميل حالة الاستيراد");
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
          if (CHEERLY_SLUGS.has(slug.toLowerCase())) {
            setShopDomain((current) => current || CHEERLY_SHOPIFY_DOMAIN);
          }
        }
      })
      .catch(() => {
        /* optional: import still works without slug */
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
    } catch (error) {
      setFlashTone("error");
      setFlash(apiErrorMessage(error, "Unable to preview Salla products."));
    } finally {
      setBusy(null);
    }
  }

  async function runImport() {
    setBusy("import");
    setFlash(null);
    try {
      await sellerApi.runSallaImport({ limit: 200 });
      setFlashTone("success");
      setFlash("بدأ استيراد المنتجات في الخلفية. حدث الصفحة بعد دقيقة.");
      await load();
    } catch (error) {
      setFlashTone("error");
      setFlash(apiErrorMessage(error, "Unable to start Salla import."));
    } finally {
      setBusy(null);
    }
  }

  async function disconnectSalla() {
    if (!window.confirm("فصل Salla؟ لن يحذف المنتجات المستوردة.")) return;
    setBusy("disconnect-salla");
    setFlash(null);
    try {
      await sellerApi.disconnectSalla();
      setFlashTone("success");
      setFlash("تم فصل Salla");
      await load();
    } catch {
      setFlashTone("error");
      setFlash("تعذر فصل Salla");
    } finally {
      setBusy(null);
    }
  }

  async function connectShopify() {
    const shop = shopDomain.trim();
    if (!shop) {
      setFlashTone("error");
      setFlash("أدخل نطاق متجر Shopify مثل mystore.myshopify.com");
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
      setFlashTone("error");
      setFlash("تعذر بدء ربط Shopify. تأكد من النطاق وأن الخدمة مفعلة على المنصة.");
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
      setFlashTone("error");
      setFlash("تعذرت معاينة منتجات Shopify. تأكد أن المتجر مربوط.");
    } finally {
      setBusy(null);
    }
  }

  async function runShopifyImport() {
    setBusy("import-shopify");
    setFlash(null);
    try {
      await sellerApi.runShopifyImport({ limit: 200 });
      setFlashTone("success");
      setFlash("بدأ استيراد منتجات Shopify في الخلفية. حدث الصفحة بعد دقيقة، ثم خصص الثيم من تصميم المتجر.");
      setShowThemeGuide(true);
      await load();
    } catch {
      setFlashTone("error");
      setFlash("تعذر بدء استيراد Shopify. تأكد أن المتجر مربوط.");
    } finally {
      setBusy(null);
    }
  }

  async function disconnectShopify() {
    if (!window.confirm("فصل Shopify؟ لن تحذف المنتجات المستوردة.")) return;
    setBusy("disconnect-shopify");
    setFlash(null);
    try {
      await sellerApi.disconnectShopify();
      setFlashTone("success");
      setFlash("تم فصل Shopify");
      await load();
    } catch {
      setFlashTone("error");
      setFlash("تعذر فصل Shopify");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <Head>
        <title>استيراد وترحيل - متاجر داسم</title>
      </Head>
      <SellerShell
        title="استيراد وترحيل"
        subtitle="اربط سلة أو Shopify، عاين المنتجات قبل النقل، ثم أكمل ضبط واجهة المتجر من داسم."
        icon={Download}
        hasStore
        actions={
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <RefreshCw className={["h-4 w-4", loading ? "animate-spin" : ""].join(" ")} />
            تحديث
          </button>
        }
      >
        <div className="mx-auto max-w-6xl space-y-6">
          {flash && (
            <div
              className={[
                "rounded-xl border px-4 py-3 text-sm font-medium",
                flashTone === "error"
                  ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100",
              ].join(" ")}
            >
              {flash}
            </div>
          )}

          <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
              <div className="p-6 md:p-7">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <StatusBadge connected={hasAnyConnection} loading={loading} />
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
                    OAuth آمن
                  </span>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                    معاينة قبل الاستيراد
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-extrabold leading-9 text-zinc-950 dark:text-zinc-50">
                  مركز استيراد احترافي للمنتجات والطلبات
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  استخدم الربط الرسمي لجلب المنتجات والصور والأسعار من سلة أو Shopify. القالب والهوية لا يتم نسخهما من المنصة الخارجية، بل تضبطهما من تصميم وإعدادات متجر داسم.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/products"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <Boxes className="h-4 w-4" />
                    عرض المنتجات
                  </Link>
                  <Link
                    href="/dashboard/theme"
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Palette className="h-4 w-4" />
                    تصميم المتجر
                  </Link>
                  {storeSlug && (
                    <Link
                      href={`/${storeSlug}?preview=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-sky-200 px-4 py-2.5 text-sm font-semibold text-sky-800 hover:bg-sky-50 dark:border-sky-900/60 dark:text-sky-200 dark:hover:bg-sky-950/30"
                    >
                      <Eye className="h-4 w-4" />
                      معاينة الواجهة
                    </Link>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/60 lg:border-r lg:border-t-0">
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <MetricCard icon={Plug} label="المزودات المتصلة" value={`${connectedCount}/2`} />
                  <MetricCard icon={Boxes} label="آخر استيراد منتجات" value={loading ? "..." : String(totalImported)} />
                  <MetricCard icon={Clock3} label="متخطى في آخر تشغيل" value={loading ? "..." : String(totalSkipped)} />
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <ProcessStep done={Boolean(shopifyConnection?.connected || sallaConnection?.connected)} title="اربط المزود" text="اختر سلة أو Shopify وابدأ من OAuth الرسمي." />
            <ProcessStep done={Boolean(preview || shopifyPreview)} title="عاين قبل النقل" text="راجع عدد المنتجات الجديدة والمتكررة قبل التشغيل." />
            <ProcessStep done={shopifyReadyForTheme || Boolean(sallaLastRun || shopifyLastRun)} title="اضبط الواجهة" text="بعد الاستيراد خصص الثيم والشعار وبيانات المتجر." />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <ProviderPanel
              title="Salla"
              description="مناسب للمعارض ومتاجر القطع والإكسسوارات. الربط يتم عبر OAuth بدون تخزين كلمة المرور."
              icon={Store}
              loading={loading}
              connected={Boolean(sallaConnection?.connected)}
              configured={sallaConfig?.configured !== false && data?.salla_configured !== false}
              statusText={sallaRunning ? "استيراد قيد التشغيل" : sallaStatusLabel(sallaConnection)}
              disabledMessage={
                sallaMissingConfig.length > 0
                  ? `إعدادات Salla ناقصة على الخادم: ${sallaMissingConfig.join(", ")}`
                  : `ربط Salla غير مفعل على الخادم بعد. تأكد من رابط التحويل: ${sallaConfig?.redirect_uri ?? "callback URL"}`
              }
              meta={
                <ConnectionMeta
                  storeName={sallaConnection?.settings?.external_name}
                  domain={sallaConnection?.settings?.external_domain}
                  lastSyncAt={sallaConnection?.last_sync_at}
                  lastSyncStatus={sallaConnection?.last_sync_status}
                  lastSyncMessage={sallaConnection?.last_sync_message}
                />
              }
              actions={
                !sallaConnection?.connected ? (
                  <PrimaryButton icon={Link2} disabled={busy !== null || sallaConfig?.configured === false || data?.salla_configured === false} onClick={() => void connectSalla()}>
                    {busy === "connect" ? "جاري التحويل..." : "ربط Salla"}
                  </PrimaryButton>
                ) : (
                  <>
                    <SecondaryButton icon={Eye} disabled={busy !== null} onClick={() => void runPreview()}>
                      {busy === "preview" ? "جاري المعاينة..." : "معاينة المنتجات"}
                    </SecondaryButton>
                    <PrimaryButton icon={Download} disabled={busy !== null || sallaRunning} onClick={() => void runImport()}>
                      {sallaRunning ? "استيراد قيد التشغيل" : "استيراد المنتجات"}
                    </PrimaryButton>
                    <DangerButton disabled={busy !== null} onClick={() => void disconnectSalla()} />
                  </>
                )
              }
              preview={preview ? <PreviewSummary provider="Salla" preview={preview} /> : null}
              runs={<RunsTable runs={sallaConnection?.recent_runs} title="آخر عمليات Salla" />}
            />

            <ProviderPanel
              title="Shopify"
              description="مسار الربط الرسمي للمنتجات والصور والأوصاف. بعد الاستيراد اضبط الهوية من داسم."
              icon={ShieldCheck}
              loading={loading}
              connected={Boolean(shopifyConnection?.connected)}
              configured={data?.shopify_configured !== false}
              disabledMessage="ربط Shopify غير مفعل على الخادم بعد. أضف إعدادات Shopify على الخادم ثم أعد المحاولة."
              meta={
                <ConnectionMeta
                  storeName={shopifyConnection?.settings?.external_name}
                  domain={shopifyConnection?.settings?.shop_domain}
                  lastSyncAt={shopifyConnection?.last_sync_at}
                  lastSyncStatus={shopifyConnection?.last_sync_status}
                  lastSyncMessage={shopifyConnection?.last_sync_message}
                />
              }
              actions={
                !shopifyConnection?.connected ? (
                  <div className="flex w-full flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={shopDomain}
                      onChange={(event) => setShopDomain(event.target.value)}
                      placeholder="we0crf-q5.myshopify.com"
                      className="min-h-11 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left text-sm text-zinc-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-emerald-950"
                      dir="ltr"
                      aria-label="نطاق Shopify"
                    />
                    <PrimaryButton
                      icon={Link2}
                      disabled={busy !== null || data?.shopify_configured === false}
                      onClick={() => void connectShopify()}
                    >
                      {busy === "connect-shopify" ? "جاري التحويل..." : "ربط Shopify"}
                    </PrimaryButton>
                  </div>
                ) : (
                  <>
                    <SecondaryButton icon={Eye} disabled={busy !== null} onClick={() => void runShopifyPreview()}>
                      {busy === "preview-shopify" ? "جاري المعاينة..." : "معاينة المنتجات"}
                    </SecondaryButton>
                    <PrimaryButton icon={Download} disabled={busy !== null} onClick={() => void runShopifyImport()}>
                      {busy === "import-shopify" ? "جاري البدء..." : "استيراد المنتجات"}
                    </PrimaryButton>
                    <DangerButton disabled={busy !== null} onClick={() => void disconnectShopify()} />
                  </>
                )
              }
              preview={shopifyPreview ? <PreviewSummary provider="Shopify" preview={shopifyPreview} /> : null}
              runs={<RunsTable runs={shopifyConnection?.recent_runs} title="آخر عمليات Shopify" />}
            />
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                    <FileSpreadsheet className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">ترحيل CSV للطلبات والعملاء</h2>
                    <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      استخدمه للبيانات التاريخية من Shopify فقط. المنتجات اليومية يفضل ربطها عبر OAuth أعلاه.
                    </p>
                  </div>
                </div>
              </div>
              {migrationStats ? (
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <MiniStat label="طلبات" value={migrationStats.imported_orders ?? 0} />
                  <MiniStat label="جهات اتصال" value={migrationStats.marketing_contacts ?? 0} />
                </div>
              ) : null}
            </div>

            {csvResult ? (
              <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                {csvResult}
              </p>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <CsvUploadCard
                label="طلبات Shopify"
                hint="orders_export.csv"
                busy={busy === "orders-csv"}
                onFile={async (file) => {
                  setBusy("orders-csv");
                  setCsvResult(null);
                  try {
                    const res = await sellerApi.importOrdersCsv(file, "shopify");
                    const body = res.data as { imported?: number; skipped?: number; errors?: string[] };
                    setCsvResult(
                      `طلبات: ${body.imported ?? 0} جديد، ${body.skipped ?? 0} متخطى` +
                        (body.errors?.length ? ` - ${body.errors.slice(0, 2).join("؛ ")}` : ""),
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
                label="عملاء Shopify"
                hint="customers_export.csv"
                busy={busy === "customers-csv"}
                onFile={async (file) => {
                  setBusy("customers-csv");
                  setCsvResult(null);
                  try {
                    const res = await sellerApi.importCustomersCsv(file, "shopify");
                    const body = res.data as { imported?: number; skipped?: number; errors?: string[] };
                    setCsvResult(
                      `عملاء: ${body.imported ?? 0} جديد، ${body.skipped ?? 0} متخطى` +
                        (body.errors?.length ? ` - ${body.errors.slice(0, 2).join("؛ ")}` : ""),
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

function StatusBadge({ connected, loading, label }: { connected: boolean; loading: boolean; label?: string }) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1",
        connected
          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
      ].join(" ")}
    >
      {loading ? "جاري التحقق" : label ?? (connected ? "يوجد ربط نشط" : "جاهز للربط")}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</span>
        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
      </div>
      <div className="mt-2 text-2xl font-extrabold text-zinc-950 dark:text-zinc-50">{value}</div>
    </div>
  );
}

function ProcessStep({ done, title, text }: { done: boolean; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start gap-3">
        <span
          className={[
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
            done
              ? "bg-emerald-600 text-white"
              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300",
          ].join(" ")}
        >
          {done ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
        </span>
        <div>
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{text}</p>
        </div>
      </div>
    </div>
  );
}

function ProviderPanel({
  title,
  description,
  icon: Icon,
  loading,
  connected,
  configured,
  statusText,
  disabledMessage,
  meta,
  actions,
  preview,
  runs,
}: {
  title: string;
  description: string;
  icon: ElementType;
  loading: boolean;
  connected: boolean;
  configured: boolean;
  statusText?: string;
  disabledMessage: string;
  meta: ReactNode;
  actions: ReactNode;
  preview: ReactNode;
  runs: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>
          </div>
        </div>
        <StatusBadge connected={connected} loading={loading} label={statusText} />
      </div>

      {!loading && !configured ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          {disabledMessage}
        </p>
      ) : null}

      {connected ? <div className="mt-4">{meta}</div> : null}

      <div className="mt-5 flex flex-wrap gap-3">{actions}</div>

      {preview ? <div className="mt-5">{preview}</div> : null}

      {runs}
    </section>
  );
}

function ConnectionMeta({
  storeName,
  domain,
  lastSyncAt,
  lastSyncStatus,
  lastSyncMessage,
}: {
  storeName?: string | null;
  domain?: string | null;
  lastSyncAt?: string | null;
  lastSyncStatus?: string | null;
  lastSyncMessage?: string | null;
}) {
  return (
    <dl className="grid gap-2 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-300">
      {storeName ? (
        <div>
          <dt className="inline font-semibold">المتجر: </dt>
          <dd className="inline">{storeName}</dd>
        </div>
      ) : null}
      {domain ? (
        <div>
          <dt className="inline font-semibold">النطاق: </dt>
          <dd className="inline font-mono text-xs">{domain}</dd>
        </div>
      ) : null}
      {lastSyncAt ? (
        <div>
          <dt className="inline font-semibold">آخر مزامنة: </dt>
          <dd className="inline">
            {formatDate(lastSyncAt)} - {statusLabel(lastSyncStatus)}
          </dd>
        </div>
      ) : null}
      {lastSyncMessage ? <div className="text-zinc-500 dark:text-zinc-400">{lastSyncMessage}</div> : null}
    </dl>
  );
}

function PreviewSummary({ provider, preview }: { provider: string; preview: ImportPreview }) {
  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-900/50 dark:bg-sky-950/20">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">معاينة {provider}</h3>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
        <MiniStat label="في المصدر" value={preview.total_remote ?? 0} />
        <MiniStat label="جديد" value={preview.would_import ?? 0} />
        <MiniStat label="موجود" value={preview.would_skip ?? 0} />
      </div>
      {preview.sample_new_products && preview.sample_new_products.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm">
          {preview.sample_new_products.slice(0, 4).map((item) => (
            <li
              key={item.external_id ?? item.name}
              className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 dark:bg-zinc-900"
            >
              <span className="min-w-0 truncate font-medium text-zinc-800 dark:text-zinc-100">{item.name}</span>
              <span className="shrink-0 text-zinc-500">{item.price ?? 0} ر.س</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function RunsTable({ runs, title }: { runs?: ImportRun[]; title: string }) {
  if (!runs || runs.length === 0) return null;

  return (
    <div className="mt-6 overflow-x-auto">
      <h3 className="mb-3 text-sm font-bold text-zinc-800 dark:text-zinc-200">{title}</h3>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-right text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <th className="py-2 pe-4 font-semibold">الحالة</th>
            <th className="py-2 pe-4 font-semibold">مستورد</th>
            <th className="py-2 pe-4 font-semibold">متخطى</th>
            <th className="py-2 font-semibold">الوقت</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id} className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pe-4">{statusLabel(run.status)}</td>
              <td className="py-2 pe-4">{run.products_imported ?? 0}</td>
              <td className="py-2 pe-4">{run.products_skipped ?? 0}</td>
              <td className="py-2">{formatDate(run.finished_at || run.started_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PrimaryButton({
  icon: Icon,
  disabled,
  onClick,
  children,
}: {
  icon: ElementType;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function SecondaryButton({
  icon: Icon,
  disabled,
  onClick,
  children,
}: {
  icon: ElementType;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function DangerButton({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-300"
    >
      <Unplug className="h-4 w-4" />
      فصل
    </button>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">{value}</div>
      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</div>
    </div>
  );
}

function CsvUploadCard({
  label,
  hint,
  busy,
  onFile,
}: {
  label: string;
  hint: string;
  busy: boolean;
  onFile: (file: File) => Promise<void>;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm transition hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-zinc-700 dark:bg-zinc-950/40 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm dark:bg-zinc-900 dark:text-emerald-300">
        <UploadCloud className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-zinc-900 dark:text-zinc-100">{label}</span>
        <span className="block text-xs text-zinc-500 dark:text-zinc-400">{busy ? "جاري الرفع..." : hint}</span>
      </span>
      <input
        type="file"
        accept=".csv,text/csv"
        disabled={busy}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onFile(file);
          event.currentTarget.value = "";
        }}
      />
    </label>
  );
}

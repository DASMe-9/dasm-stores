import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Code2, ExternalLink, Loader2, Save } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { SplitEditor } from "@/components/theme-editor/SplitEditor";
import type { PreviewProduct } from "@/components/theme-editor/BlockRenderer";
import { sellerApi } from "@/lib/api";
import { getStoreDisplayName } from "@/lib/store-display";
import { syncStoresTokenCookie } from "@/lib/auth-token";
import { storefrontUrl } from "@/lib/storefront-url";
import { detectPresetFromThemeConfig } from "@/lib/themes";
import {
  defaultBlockDocument,
  defaultSurfaceSource,
  mergeBlockDocument,
  readBlockDocument,
  BLOCK_EDITOR_VERSION,
} from "@/lib/themes/blocks";
import type { ThemeSurface } from "@/lib/themes/blocks";

const DEFAULT_PRIMARY = "#059669";

type ProductLike = {
  name?: string;
  price?: string | number;
  images?: { url?: string; is_primary?: boolean }[];
};

function toPreviewProduct(p: ProductLike): PreviewProduct {
  const image = p.images?.find((i) => i.is_primary)?.url ?? p.images?.[0]?.url ?? null;
  const price = typeof p.price === "number" ? p.price : Number.parseFloat(String(p.price ?? "0")) || 0;
  return { name: p.name || "منتج", price, image };
}

export default function StoreThemeEditorPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState("");
  const [storeName, setStoreName] = useState("متجر داسم");
  const [storeStatus, setStoreStatus] = useState("");
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [themeConfig, setThemeConfig] = useState<Record<string, unknown>>({});
  const [surfaces, setSurfaces] = useState(defaultBlockDocument().surfaces);
  const [activeSurface, setActiveSurface] = useState<ThemeSurface>("landing");
  const [products, setProducts] = useState<PreviewProduct[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await sellerApi.getMyStore();
      const store = data?.store;
      if (!store) {
        router.replace("/stores/new");
        return;
      }
      setStoreSlug(store.slug || "");
      setStoreName(getStoreDisplayName(store) || "متجر داسم");
      setStoreStatus(store.status || "");
      const config = (store.theme_config || {}) as Record<string, unknown>;
      setThemeConfig(config);
      setSurfaces(readBlockDocument(config).surfaces);
      const preset = detectPresetFromThemeConfig(config);
      if (preset?.colors?.primary) setPrimaryColor(preset.colors.primary);
      // Real products for the preview (best-effort).
      try {
        const res = await sellerApi.getProducts({ per_page: 12 });
        const list = (res.data?.data ?? res.data?.products ?? res.data ?? []) as ProductLike[];
        if (Array.isArray(list)) setProducts(list.map(toPreviewProduct));
      } catch {
        /* preview falls back to sample products */
      }
    } catch {
      setError("تعذّر تحميل بيانات المتجر.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("stores_token") : null;
    if (!t) {
      router.replace("/auth/login?returnUrl=/dashboard/theme-editor");
      return;
    }
    setReady(true);
    load();
  }, [load, router]);

  const activeSource = surfaces[activeSurface];
  const setActiveSource = (next: string) => setSurfaces((prev) => ({ ...prev, [activeSurface]: next }));

  const previewUrl = useMemo(
    () => (storeSlug ? storefrontUrl(storeSlug, { preview: true }) : undefined),
    [storeSlug],
  );

  const handleRestoreDefault = () =>
    setSurfaces((prev) => ({ ...prev, [activeSurface]: defaultSurfaceSource(activeSurface) }));

  const handleGenerate = async (prompt: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("stores_token") : null;
    const res = await fetch("/api/theme/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ prompt, surface: activeSurface }),
    });
    const data = (await res.json().catch(() => ({}))) as { source?: string; message?: string };
    if (!res.ok || !data.source) {
      throw new Error(data.message || "تعذّر توليد التصميم.");
    }
    setSurfaces((prev) => ({
      ...prev,
      [activeSurface]: `${prev[activeSurface].trimEnd()}\n${data.source}\n`,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const doc = { version: BLOCK_EDITOR_VERSION, surfaces };
      await sellerApi.updateStore({ theme_config: mergeBlockDocument(themeConfig, doc) });
      setThemeConfig((prev) => mergeBlockDocument(prev, doc));
      setSuccess("تم حفظ التصميم. قد يستغرق ظهوره على الواجهة دقيقة واحدة.");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message ?? err?.message ?? "تعذّر حفظ التصميم.");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return null;

  return (
    <>
      <Head>
        <title>محرّر الثيم المتقدّم | متاجر داسم</title>
      </Head>
      <SellerShell
        title="محرّر الثيم المتقدّم"
        subtitle="صمّم واجهة متجرك ببلوكات جاهزة — كود على جهة ومعاينة حية على الجهة الأخرى"
        icon={Code2}
        hasStore
        storeSlug={storeSlug}
        storeName={storeName}
        storeStatus={storeStatus}
        themeColor={primaryColor}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/theme"
              className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              معرض القوالب
            </Link>
            {storeSlug ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => syncStoresTokenCookie()}
                className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                فتح المتجر
              </a>
            ) : null}
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              حفظ التصميم
            </button>
          </div>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            جاري التحميل…
          </div>
        ) : (
          <div className="mx-auto max-w-6xl space-y-4">
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                {success}
              </div>
            ) : null}

            <SplitEditor
              source={activeSource}
              onSourceChange={setActiveSource}
              onRestoreDefault={handleRestoreDefault}
              ctx={{ storeName, primaryColor, products }}
              activeSurface={activeSurface}
              onSurfaceChange={setActiveSurface}
              previewUrl={previewUrl}
              onGenerate={handleGenerate}
            />

            <p className="text-center text-[11px] text-zinc-500">
              <Link href="/dashboard" className="underline hover:text-emerald-600">
                العودة للوحة التحكم
              </Link>
            </p>
          </div>
        )}
      </SellerShell>
    </>
  );
}

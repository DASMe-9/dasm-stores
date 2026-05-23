import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, Palette, Save } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { ThemePicker } from "@/components/theme/ThemePicker";
import { ThemePreviewStorefront } from "@/components/theme/ThemePreviewStorefront";
import { sellerApi } from "@/lib/api";
import { SITE } from "@/lib/seo";
import {
  detectPresetFromThemeConfig,
  findPresetById,
  presetToThemeConfig,
  resolvePresetIdFromLegacyThemeId,
} from "@/lib/themes";
import type { ThemeMarket, ThemePreset } from "@/lib/themes/types";

const STORES_URL = process.env.NEXT_PUBLIC_STORES_URL || SITE.url;

export default function StoreThemePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState("");
  const [storeName, setStoreName] = useState("");
  const [marketFilter, setMarketFilter] = useState<ThemeMarket | "all">("all");
  const [selected, setSelected] = useState<ThemePreset | null>(null);

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
      setStoreName(store.name || store.name_ar || "");
      const themeConfig = (store.theme_config || {}) as Record<string, unknown>;
      const fromConfig = detectPresetFromThemeConfig(themeConfig);
      const fromThemeId = findPresetById(resolvePresetIdFromLegacyThemeId(store.theme_id));
      setSelected(fromConfig ?? fromThemeId ?? findPresetById("retail-multi-department") ?? null);
      if (fromConfig?.market === "automotive" || fromConfig?.market === "general") {
        setMarketFilter(fromConfig.market);
      }
    } catch {
      setError("تعذّر تحميل بيانات المتجر.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const t = localStorage.getItem("stores_token");
    if (!t) {
      router.replace("/auth/login?returnUrl=/dashboard/theme");
      return;
    }
    setReady(true);
    load();
  }, [load, router]);

  const previewPreset = useMemo(() => selected, [selected]);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await sellerApi.updateStore({
        theme_config: presetToThemeConfig(selected),
      });
      setSuccess("تم حفظ تصميم المتجر. قد يستغرق ظهوره على الواجهة دقيقة واحدة.");
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
        <title>تصميم المتجر | متاجر داسم</title>
      </Head>
      <SellerShell
        title="تصميم المتجر"
        subtitle="اختر قالباً جاهزاً بجودة قريبة من سلة وزد — مع معاينة فورية"
        icon={Palette}
        hasStore
        storeSlug={storeSlug}
        storeName={storeName}
        actions={
          storeSlug ? (
            <a
              href={`${STORES_URL}/store/${storeSlug}?preview=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              معاينة حية
            </a>
          ) : null
        }
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            جاري التحميل…
          </div>
        ) : (
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-l from-emerald-50 to-white p-5 dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-zinc-900">
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">معرض القوالب</h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                20 قالباً جاهزاً لقطاعات السيارات والتجزئة. التغييرات تُحفظ عبر API المنصة وتنعكس على واجهة
                المتجر العامة فوراً بعد الحفظ.
              </p>
            </div>

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

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
                <ThemePicker
                  selectedId={selected?.id ?? null}
                  onSelect={setSelected}
                  marketFilter={marketFilter}
                  onMarketFilterChange={setMarketFilter}
                />
              </section>

              <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                {previewPreset ? <ThemePreviewStorefront preset={previewPreset} /> : null}
                <button
                  type="button"
                  disabled={!selected || saving}
                  onClick={handleSave}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  حفظ التصميم على المتجر
                </button>
                <p className="text-center text-[11px] text-zinc-500">
                  <Link href="/dashboard" className="underline hover:text-emerald-600">
                    العودة للوحة التحكم
                  </Link>
                </p>
              </aside>
            </div>
          </div>
        )}
      </SellerShell>
    </>
  );
}

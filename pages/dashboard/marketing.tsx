import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Megaphone, Save } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";
import type { MarketingTrackingConfig } from "@/lib/marketing-tracking";

const EMPTY: MarketingTrackingConfig = {
  enabled: false,
  tiktok_pixel_id: "",
  snap_pixel_id: "",
  meta_pixel_id: "",
  google_ads_id: "",
};

function DashboardMarketingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [form, setForm] = useState<MarketingTrackingConfig>(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sellerApi.getMarketingConfig();
      const cfg = (res.data as { marketing_config?: MarketingTrackingConfig }).marketing_config ?? EMPTY;
      setForm({
        enabled: Boolean(cfg.enabled),
        tiktok_pixel_id: cfg.tiktok_pixel_id ?? "",
        snap_pixel_id: cfg.snap_pixel_id ?? "",
        meta_pixel_id: cfg.meta_pixel_id ?? "",
        google_ads_id: cfg.google_ads_id ?? "",
      });
    } catch {
      setFlash("تعذّر تحميل إعدادات التتبع");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("stores_token");
    if (!token) {
      router.replace("/auth/login?returnUrl=/dashboard/marketing");
      return;
    }
    void load();
  }, [load, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFlash(null);
    try {
      await sellerApi.updateMarketingConfig({
        enabled: form.enabled,
        tiktok_pixel_id: form.tiktok_pixel_id?.trim() || null,
        snap_pixel_id: form.snap_pixel_id?.trim() || null,
        meta_pixel_id: form.meta_pixel_id?.trim() || null,
        google_ads_id: form.google_ads_id?.trim() || null,
      });
      setFlash("تم حفظ إعدادات البيكسلات");
      void load();
    } catch {
      setFlash("تعذّر الحفظ — تحقق من صيغة المعرفات");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Head>
        <title>التتبع التسويقي — متاجر داسم</title>
      </Head>
      <SellerShell
        title="التتبع التسويقي"
        subtitle="TikTok وSnap وMeta — انسخ معرفات البيكسل بعد ترحيل Cheerly Live"
        icon={Megaphone}
        hasStore
      >
        <div className="mx-auto max-w-2xl space-y-6">
          {flash ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              {flash}
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-zinc-500">جاري التحميل…</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={Boolean(form.enabled)}
                  onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                تفعيل البيكسلات على واجهة المتجر
              </label>

              <div className="space-y-4">
                <Field
                  label="TikTok Pixel ID"
                  hint="من TikTok Events Manager — مثال: CXXXXXXXXXXXXXXX"
                  value={form.tiktok_pixel_id ?? ""}
                  onChange={(v) => setForm((f) => ({ ...f, tiktok_pixel_id: v }))}
                />
                <Field
                  label="Snap Pixel ID"
                  hint="من Snap Ads Manager"
                  value={form.snap_pixel_id ?? ""}
                  onChange={(v) => setForm((f) => ({ ...f, snap_pixel_id: v }))}
                />
                <Field
                  label="Meta Pixel ID (اختياري)"
                  value={form.meta_pixel_id ?? ""}
                  onChange={(v) => setForm((f) => ({ ...f, meta_pixel_id: v }))}
                />
                <Field
                  label="Google Ads (اختياري)"
                  hint="مثال: AW-123456789"
                  value={form.google_ads_id ?? ""}
                  onChange={(v) => setForm((f) => ({ ...f, google_ads_id: v }))}
                />
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                بعد تفعيل المتجر على داسم، حدّث نطاق التتبع في TikTok/Snap ليشمل متجرك الجديد. الأحداث: ViewContent، AddToCart، Purchase.
              </p>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "جاري الحفظ…" : "حفظ"}
              </button>
            </form>
          )}
        </div>
      </SellerShell>
    </>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{label}</span>
      {hint ? <span className="block text-xs text-zinc-500">{hint}</span> : null}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        dir="ltr"
      />
    </label>
  );
}

export default DashboardMarketingPage;

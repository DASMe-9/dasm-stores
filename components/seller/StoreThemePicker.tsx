"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, Film, Palette, Save } from "lucide-react";
import { sellerApi } from "@/lib/api";
import {
  STORE_THEMES,
  getHeroVideoUrl,
  getStoreTheme,
  getThemeSlug,
  themeToConfig,
  type StoreThemeConfig,
} from "@/lib/store-themes";

type StorePayload = {
  slug: string;
  name: string;
  theme_config?: StoreThemeConfig | null;
};

export function StoreThemePicker() {
  const [store, setStore] = useState<StorePayload | null>(null);
  const [selectedSlug, setSelectedSlug] = useState(STORE_THEMES[0].slug);
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    sellerApi
      .getMyStore()
      .then(({ data }) => {
        if (!active) return;
        const nextStore = data?.store as StorePayload | undefined;
        if (!nextStore) {
          setError("لا يوجد متجر مرتبط بهذا الحساب.");
          return;
        }
        const config = nextStore.theme_config;
        setStore(nextStore);
        setSelectedSlug(getThemeSlug(config));
        setHeroVideoUrl(getHeroVideoUrl(config) ?? "");
      })
      .catch(() => setError("تعذر تحميل إعدادات الثيم."))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedTheme = useMemo(() => getStoreTheme(selectedSlug), [selectedSlug]);
  const previewConfig = themeToConfig(selectedTheme, heroVideoUrl);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await sellerApi.updateStore({
        theme_config: previewConfig,
      });
      setMessage("تم حفظ الثيم وتحديث واجهة المتجر.");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? "تعذر حفظ الثيم.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-2xl bg-white p-6 text-sm text-zinc-500">جاري تحميل الثيمات...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div
          className={`store-hero-motion store-hero-${selectedTheme.heroMotion} relative h-52 overflow-hidden`}
          style={
            {
              "--primary": selectedTheme.primary,
              "--accent": selectedTheme.accent,
            } as CSSProperties
          }
        >
          {heroVideoUrl ? (
            <video
              className="absolute inset-0 z-[1] h-full w-full object-cover"
              src={heroVideoUrl}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : null}
          <div className="absolute inset-0 z-[4] bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <div className="absolute bottom-5 right-5 z-[5] max-w-sm rounded-2xl border border-white/20 bg-white/92 p-4 shadow-xl backdrop-blur">
            <p className="text-xs font-semibold text-zinc-500">معاينة منطقة الفيديو الدعائي</p>
            <h2 className="mt-1 text-xl font-extrabold text-zinc-950">{store?.name ?? "متجر داسم"}</h2>
            <p className="mt-1 text-sm text-zinc-600">
              الثيم يحرك الخلفية باستمرار، وإذا أضفت رابط فيديو يظهر بدل الحركة المجانية.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-emerald-700" />
          <h2 className="text-base font-bold text-zinc-950">الثيمات المجانية</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {STORE_THEMES.map((theme) => {
            const active = theme.slug === selectedSlug;
            return (
              <button
                key={theme.slug}
                type="button"
                onClick={() => setSelectedSlug(theme.slug)}
                className={`overflow-hidden rounded-2xl border text-right transition ${
                  active ? "border-emerald-600 ring-2 ring-emerald-100" : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div
                  className={`store-hero-motion store-hero-${theme.heroMotion} relative h-24`}
                  style={
                    {
                      "--primary": theme.primary,
                      "--accent": theme.accent,
                    } as CSSProperties
                  }
                >
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className="space-y-2 bg-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-zinc-950">{theme.name}</span>
                    {active ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                        <Check className="h-4 w-4" />
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-500">{theme.description}</p>
                  <div className="flex gap-1">
                    <span className="h-4 w-4 rounded-full" style={{ backgroundColor: theme.primary }} />
                    <span className="h-4 w-4 rounded-full" style={{ backgroundColor: theme.accent }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-bold text-zinc-900">
          <Film className="h-4 w-4 text-emerald-700" />
          رابط فيديو الهيرو الدعائي
        </label>
        <input
          type="url"
          value={heroVideoUrl}
          onChange={(event) => setHeroVideoUrl(event.target.value)}
          placeholder="https://.../promo-video.mp4"
          dir="ltr"
          className="mt-3 w-full rounded-xl border border-zinc-200 px-4 py-3 text-left text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          إذا تركته فارغًا سيستخدم المتجر الحركة المجانية الخاصة بالثيم. لاحقًا يمكن ربطه برفع فيديو مباشر أو مكتبة فيديوهات AI.
        </p>
      </section>

      {error ? <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || !store}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "جاري الحفظ..." : "حفظ الثيم"}
        </button>
        {store?.slug ? (
          <a
            href={`/store/${store.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            <ExternalLink className="h-4 w-4" />
            معاينة المتجر
          </a>
        ) : null}
      </div>
    </div>
  );
}

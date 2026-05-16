"use client";

import { useEffect, useState } from "react";
import {
  Store,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Palette,
  Package,
  Rocket,
  Check,
} from "lucide-react";
import { sellerApi } from "@/lib/api";
import { STORE_THEMES, themeToConfig } from "@/lib/store-themes";

export type SellerNavHandlers = {
  replace: (path: string) => void;
  push: (path: string) => void;
  back: () => void;
};

const CATEGORIES = [
  { value: "fashion", label: "أزياء وملابس", emoji: "👗" },
  { value: "electronics", label: "إلكترونيات", emoji: "📱" },
  { value: "food", label: "مأكولات ومشروبات", emoji: "🍽️" },
  { value: "home", label: "منزل وديكور", emoji: "🏠" },
  { value: "automotive", label: "سيارات وقطع غيار", emoji: "🚗" },
  { value: "beauty", label: "عطور ومستحضرات", emoji: "💄" },
  { value: "sports", label: "رياضة ولياقة", emoji: "⚽" },
  { value: "general", label: "متنوع", emoji: "🛍️" },
];

const PALETTES = STORE_THEMES.map((theme) => ({
  key: theme.slug,
  label: theme.name,
  primary: theme.primary,
  accent: theme.accent,
}));

const STEPS = [
  { key: "basics", title: "بيانات المتجر", icon: Store },
  { key: "brand", title: "هوية المتجر", icon: Palette },
  { key: "product", title: "أول منتج", icon: Package },
  { key: "launch", title: "الإطلاق", icon: Rocket },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const RESERVED_SLUGS = new Set([
  "api",
  "auth",
  "dashboard",
  "explore",
  "stores",
  "store",
  "_next",
  "favicon.ico",
  "sitemap.xml",
  "robots.txt",
  "admin",
  "login",
  "signup",
  "register",
  "logout",
  "about",
  "contact",
  "terms",
  "privacy",
]);

export function StoreNewWizard({ nav }: { nav: SellerNavHandlers }) {
  const [token, setToken] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    name_ar: "",
    name: "",
    slug: "",
    category: "general",
    description: "",
    logo_url: "",
    banner_url: "",
    palette: STORE_THEMES[0].slug,
    first_product: { name: "", price: "", image_url: "" },
  });

  useEffect(() => {
    const t = localStorage.getItem("stores_token");
    if (!t) {
      nav.replace("/auth/login?returnUrl=/stores/new");
      return;
    }
    setToken(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- تهيئة مرة واحدة عند التحميل
  }, []);

  const setField = (k: keyof typeof form, v: unknown) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "name" && !f.slug) next.slug = slugify(v as string);
      return next;
    });
  };

  const canNext = () => {
    if (step === 0) {
      return (
        Boolean(form.name_ar.trim()) &&
        Boolean(form.name.trim()) &&
        form.slug.trim().length >= 2 &&
        !RESERVED_SLUGS.has(form.slug)
      );
    }
    if (step === 1) return true;
    if (step === 2) return true;
    return true;
  };

  const slugError =
    form.slug && RESERVED_SLUGS.has(form.slug)
      ? "هذا الرابط محجوز للنظام، اختر رابطاً آخر"
      : form.slug && form.slug.length < 2
        ? "الرابط قصير جداً"
        : null;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const theme = STORE_THEMES.find((p) => p.slug === form.palette) ?? STORE_THEMES[0];
      const payload = {
        name: form.name,
        name_ar: form.name_ar,
        slug: form.slug,
        category: form.category,
        description: form.description || null,
        logo_url: form.logo_url || null,
        banner_url: form.banner_url || null,
        theme_config: themeToConfig(theme),
      };
      await sellerApi.createStore(payload);

      if (form.first_product.name && form.first_product.price) {
        try {
          await sellerApi.createProduct({
            name: form.first_product.name,
            price: Number(form.first_product.price),
            weight: 1,
            status: "active",
            product_type: "physical",
            images: form.first_product.image_url
              ? [{ url: form.first_product.image_url, is_primary: true }]
              : undefined,
          });
        } catch {
          /* غير حاجز */
        }
      }

      setDone(true);
      setTimeout(() => nav.push("/dashboard"), 2500);
    } catch (e: unknown) {
      const err = e as {
        response?: {
          data?: {
            message?: string;
            trace_id?: string;
            errors?: Record<string, string[]>;
          };
        };
        message?: string;
      };
      const data = err?.response?.data;
      const firstValidation =
        data?.errors && typeof data.errors === "object"
          ? Object.values(data.errors).flat().find(Boolean)
          : undefined;
      let msg = data?.message ?? firstValidation ?? err?.message ?? "حدث خطأ";
      const tid = data?.trace_id;
      if (tid) {
        msg = `${msg}\nمعرّف التتبع: ${tid}`;
      }
      setError(msg);
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

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 rtl">
        <div className="bg-white rounded-2xl border border-emerald-100 p-10 text-center max-w-sm w-full space-y-4 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">متجرك جاهز 🎉</h2>
          <p className="text-sm text-gray-500">
            أرسلنا طلب التفعيل لفريق داسم. سيتم إشعارك عند الاعتماد.
          </p>
          <p className="text-xs text-gray-400">جاري توجيهك للوحة التحكم...</p>
        </div>
      </div>
    );
  }

  const active = PALETTES.find((p) => p.key === form.palette)!;

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button
          type="button"
          onClick={() => nav.back()}
          className="p-2 rounded-xl hover:bg-gray-100"
          aria-label="رجوع"
        >
          <ArrowRight className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-900 truncate">إنشاء متجر جديد</div>
            <div className="text-[11px] text-gray-400">متاجر داسم</div>
          </div>
        </div>
        <div className="mr-auto text-xs text-gray-400 hidden md:block">
          الخطوة {step + 1} من {STEPS.length}
        </div>
      </header>

      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          {STEPS.map((s, i) => {
            const stepDone = i < step;
            const current = i === step;
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex-1 flex items-center">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition ${
                      stepDone
                        ? "bg-emerald-600 text-white"
                        : current
                          ? "bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {stepDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs md:text-sm font-medium truncate ${
                      current ? "text-gray-900" : stepDone ? "text-emerald-700" : "text-gray-400"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 md:mx-4 ${i < step ? "bg-emerald-500" : "bg-gray-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">ابدأ بالأساسيات</h2>
                <p className="text-sm text-gray-500 mt-1">اسم متجرك ورابطه على متاجر داسم.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  اسم المتجر بالعربي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="مثال: متجر الهلال"
                  value={form.name_ar}
                  onChange={(e) => setField("name_ar", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  اسم المتجر بالإنجليزي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Al-Hilal Store"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left placeholder:text-right"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  رابط المتجر <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent">
                  <span
                    className="px-3 py-2.5 text-xs text-gray-500 bg-gray-100 border-l border-gray-200"
                    dir="ltr"
                  >
                    stores.dasm.com.sa/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="al-hilal"
                    value={form.slug}
                    onChange={(e) => setField("slug", slugify(e.target.value))}
                    className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>
                {slugError && <p className="text-xs text-red-600 mt-1">{slugError}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">تصنيف المتجر</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setField("category", c.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs transition ${
                        form.category === c.value
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl">{c.emoji}</span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">وصف مختصر (اختياري)</label>
                <textarea
                  rows={2}
                  maxLength={300}
                  placeholder="ماذا يبيع متجرك؟"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">هوية متجرك</h2>
                <p className="text-sm text-gray-500 mt-1">
                  الشعار، الغلاف، واللون الأساسي. يمكنك تعديلها لاحقاً.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">شعار المتجر (Logo URL)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.logo_url}
                  onChange={(e) => setField("logo_url", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                  dir="ltr"
                />
                <p className="text-[11px] text-gray-400">سنضيف رفع مباشر بعد التفعيل.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">غلاف المتجر (Banner URL)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.banner_url}
                  onChange={(e) => setField("banner_url", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">اللون الأساسي</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {PALETTES.map((p) => (
                    <button
                      type="button"
                      key={p.key}
                      onClick={() => setField("palette", p.key)}
                      className={`p-3 rounded-xl border-2 transition ${
                        form.palette === p.key
                          ? "border-gray-900"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex gap-1 mb-2">
                        <div className="w-5 h-5 rounded-full" style={{ background: p.primary }} />
                        <div className="w-5 h-5 rounded-full" style={{ background: p.accent }} />
                      </div>
                      <div className="text-[11px] font-medium text-gray-700">{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 pt-2">
                  معاينة
                </div>
                <div className="p-3">
                  <div className="rounded-xl overflow-hidden bg-white shadow-sm">
                    <div
                      className="h-20 relative"
                      style={{
                        background: `linear-gradient(135deg, ${active.primary}, ${active.accent})`,
                      }}
                    >
                      {form.banner_url && (
                        <img
                          src={form.banner_url}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                      )}
                    </div>
                    <div className="p-3 -mt-8 relative">
                      <div
                        className="w-12 h-12 rounded-xl bg-white border-4 border-white shadow overflow-hidden flex items-center justify-center"
                        style={{ background: active.primary }}
                      >
                        {form.logo_url ? (
                          <img src={form.logo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {form.name_ar?.charAt(0) || "م"}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm font-bold text-gray-900">
                        {form.name_ar || "اسم متجرك"}
                      </div>
                      <div className="text-[11px] text-gray-400" dir="ltr">
                        stores.dasm.com.sa/{form.slug || "your-store"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">أضف أول منتج (اختياري)</h2>
                <p className="text-sm text-gray-500 mt-1">
                  يمكنك تخطّي هذه الخطوة وإضافة منتجات لاحقاً من لوحة التحكم.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">اسم المنتج</label>
                <input
                  type="text"
                  maxLength={120}
                  placeholder="مثال: تيشيرت قطن"
                  value={form.first_product.name}
                  onChange={(e) =>
                    setField("first_product", { ...form.first_product, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">السعر (ر.س)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.first_product.price}
                  onChange={(e) =>
                    setField("first_product", { ...form.first_product, price: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">صورة المنتج (URL)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.first_product.image_url}
                  onChange={(e) =>
                    setField("first_product", { ...form.first_product, image_url: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                  dir="ltr"
                />
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 flex gap-2 items-start">
                <Upload className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  رفع الصور المباشر سيُضاف لاحقاً. الآن استخدم روابط جاهزة.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">راجع وأطلق متجرك</h2>
                <p className="text-sm text-gray-500 mt-1">
                  بعد الإرسال، سيراجع فريق داسم متجرك ويُفعَّل عادة خلال 24 ساعة.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
                <Row label="الاسم بالعربي" value={form.name_ar} />
                <Row label="الاسم بالإنجليزي" value={form.name} />
                <Row label="الرابط" value={`stores.dasm.com.sa/${form.slug}`} />
                <Row label="التصنيف" value={CATEGORIES.find((c) => c.value === form.category)?.label} />
                <Row label="اللون الأساسي" value={active.label} swatch={active.primary} />
                {form.first_product.name ? (
                  <Row
                    label="أول منتج"
                    value={`${form.first_product.name} — ${form.first_product.price || 0} ر.س`}
                  />
                ) : null}
              </div>

              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-700">
                ✓ بعد اعتماد المتجر ستظهر المبيعات في ليدجر حسابك التلقائي على منصة داسم.
              </div>

              {error ? (
                <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-600 whitespace-pre-line">
                  {error}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6 gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-white disabled:opacity-40"
          >
            <ArrowRight className="w-4 h-4" />
            السابق
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition"
            >
              التالي
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={loading}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition"
            >
              {loading ? "جاري الإرسال..." : "إطلاق المتجر"}
              <Rocket className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function Row({
  label,
  value,
  swatch,
}: {
  label: string;
  value?: string | null;
  swatch?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 flex items-center gap-2">
        {swatch ? <span className="w-4 h-4 rounded-full" style={{ background: swatch }} /> : null}
        {value || "—"}
      </span>
    </div>
  );
}

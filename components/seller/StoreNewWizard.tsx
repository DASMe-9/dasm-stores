"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
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
  X,
  Plus,
  Trash2,
  Video,
  Image as ImageIcon
} from "lucide-react";
import { sellerApi, storeSelection, uploadApi } from "@/lib/api";
import { ProductMediaUploader, type MediaItem } from "./ProductMediaUploader";
import { ProductVariationsBuilder, type Variant, type ProductOption } from "./ProductVariationsBuilder";

export type SellerNavHandlers = {
  replace: (path: string) => void;
  push: (path: string) => void;
  back: () => void;
};

const CATEGORIES = [
  { value: "fashion", label: "أزياء وملابس", emoji: "👗", options: ["المقاس", "اللون"] },
  { value: "electronics", label: "إلكترونيات", emoji: "📱", options: ["اللون", "سعة التخزين"] },
  { value: "food", label: "مأكولات ومشروبات", emoji: "🍽️", options: ["الحجم"] },
  { value: "home", label: "منزل وديكور", emoji: "🏠", options: ["اللون", "الخامة"] },
  { value: "automotive", label: "سيارات وقطع غيار", emoji: "🚗", options: [] },
  { value: "beauty", label: "عطور ومستحضرات", emoji: "💄", options: ["الحجم"] },
  { value: "sports", label: "رياضة ولياقة", emoji: "⚽", options: ["المقاس", "اللون"] },
  { value: "general", label: "متنوع", emoji: "🛍️", options: ["النوع"] },
];

const PALETTES = [
  { key: "emerald", label: "أخضر داسم", primary: "#059669", accent: "#10b981" },
  { key: "indigo", label: "أزرق ملكي", primary: "#4f46e5", accent: "#6366f1" },
  { key: "rose", label: "وردي عصري", primary: "#e11d48", accent: "#f43f5e" },
  { key: "amber", label: "ذهبي فاخر", primary: "#d97706", accent: "#f59e0b" },
  { key: "slate", label: "رمادي أنيق", primary: "#0f172a", accent: "#334155" },
];

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
  "api", "auth", "dashboard", "explore", "stores", "store", "_next",
  "favicon.ico", "sitemap.xml", "robots.txt", "admin", "login",
  "signup", "register", "logout", "about", "contact", "terms", "privacy",
]);

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";

const MAX_IMAGE_BYTES = {
  logo: 5 * 1024 * 1024,
  banner: 8 * 1024 * 1024,
  product: 8 * 1024 * 1024,
};
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg", "image/pjpeg", "image/png", "image/webp", "image/heic", "image/heif",
]);
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);

const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const ALLOWED_VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov"]);

type UploadSlot = "logo" | "banner";

function revokeIfObjectUrl(url: string | null | undefined) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

function uploadErrorMessage(error: unknown) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message ?? err.message ?? "تعذّر رفع الملف حالياً.";
}

function isAllowedImageFile(file: File) {
  if (ALLOWED_IMAGE_TYPES.has(file.type)) return true;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_IMAGE_EXTENSIONS.has(extension);
}

function isAllowedVideoFile(file: File) {
  if (ALLOWED_VIDEO_TYPES.has(file.type)) return true;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_VIDEO_EXTENSIONS.has(extension);
}



export function StoreNewWizard({ nav }: { nav: SellerNavHandlers }) {
  const [token, setToken] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const objectUrlsRef = useRef<string[]>([]);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const productVideoInputRef = useRef<HTMLInputElement>(null);
  
  const [previews, setPreviews] = useState<Partial<Record<UploadSlot, string>>>({});
  const [uploading, setUploading] = useState<Record<UploadSlot, boolean>>({
    logo: false,
    banner: false,
  });
  const [uploadErrors, setUploadErrors] = useState<Partial<Record<UploadSlot, string>>>({});

  // Product specific states
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [productVariants, setProductVariants] = useState<Variant[]>([]);

  const [form, setForm] = useState({
    name_ar: "",
    name: "",
    slug: "",
    category: "general",
    description: "",
    logo_url: "",
    banner_url: "",
    palette: "emerald",
    first_product: { name: "", price: "" },
  });

  useEffect(() => () => {
    objectUrlsRef.current.forEach(revokeIfObjectUrl);
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("stores_token");
    if (!t) {
      nav.replace("/auth/login?returnUrl=/stores/new");
      return;
    }
    setToken(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cat = CATEGORIES.find(c => c.value === form.category);
    if (cat && cat.options.length > 0) {
      setProductOptions(cat.options.map(opt => ({ name: opt, values: [] })));
    } else {
      setProductOptions([]);
    }
    setProductVariants([]);
  }, [form.category]);



  const setField = (k: keyof typeof form, v: unknown) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "name" && !f.slug) next.slug = slugify(v as string);
      return next;
    });
  };

  const canNext = () => {
    const uploadInProgress = uploading.logo || uploading.banner || media.some((m) => m.url.startsWith('blob:') || m.url.includes('uploading'));
    if (uploadInProgress) return false;

    if (step === 0) {
      return (
        Boolean(form.name_ar.trim()) &&
        Boolean(form.name.trim()) &&
        form.slug.trim().length >= 2 &&
        !RESERVED_SLUGS.has(form.slug)
      );
    }
    if (step === 1) return true;
    if (step === 2) {
      const productName = form.first_product.name.trim();
      const productPrice = Number(form.first_product.price);
      const hasProductDraft = Boolean(productName || form.first_product.price.trim());
      return !hasProductDraft || (Boolean(productName) && Number.isFinite(productPrice) && productPrice > 0);
    }
    return true;
  };

  const slugError =
    form.slug && RESERVED_SLUGS.has(form.slug)
      ? "هذا الرابط محجوز للنظام، اختر رابطاً آخر"
      : form.slug && form.slug.length < 2
        ? "الرابط قصير جداً"
        : null;

  const handleSubmit = async () => {
    if (uploading.logo || uploading.banner || media.some((m) => m.url.startsWith('blob:') || m.url.includes('uploading'))) {
      setError("انتظر اكتمال رفع الصور أولاً.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const palette = PALETTES.find((p) => p.key === form.palette)!;
      const themeVars = {
        primary: palette.primary,
        accent: palette.accent,
        background: "#fafafa",
        foreground: "#18181b",
        card: "#ffffff",
        border: "#e4e4e7",
        muted: "#f4f4f5",
        "muted-foreground": "#71717a",
        "product-card-style": "rounded-shadow",
        "header-style": "centered-logo",
      };
      const payload = {
        name: form.name,
        name_ar: form.name_ar,
        slug: form.slug,
        category: form.category,
        description: form.description || null,
        logo_url: form.logo_url || null,
        banner_url: form.banner_url || null,
        theme_config: {
          palette: form.palette,
          custom_palette: true,
          primary: palette.primary,
          accent: palette.accent,
          css_variables: themeVars,
          header_style: "centered-logo",
          product_card_style: "rounded-shadow",
          hero_motion: "silk",
          enabled_sections: ["hero", "featured_products", "categories", "promo_banner"],
          preset_version: 1,
        },
      };
      
      const { data: createdStoreData } = await sellerApi.createStore(payload);
      if (createdStoreData?.store?.id != null) {
        storeSelection.set(String(createdStoreData.store.id));
      }

      if (form.first_product.name && form.first_product.price) {
        const productPayload = {
          name: form.first_product.name,
          price: Number(form.first_product.price),
          weight: 1,
          status: "active",
          product_type: "physical",
          images: media.map(m => ({ url: m.url, is_primary: m.is_primary })),
          variants: productVariants.length > 0 ? productVariants.map(v => ({
             name: v.name,
             price: Number(v.price) || Number(form.first_product.price),
             option_values: v.option_values,
             stock_quantity: 0
          })) : undefined
        };
        try {
          await sellerApi.createProduct(productPayload);
        } catch (err: any) {
          console.error("Failed to create first product", err);
          // Not blocking store creation if product fails
        }
      }

      setDone(true);
      setTimeout(() => nav.push("/dashboard"), 2500);
    } catch (e: unknown) {
      const err = e as any;
      const data = err?.response?.data;
      const firstValidation =
        data?.errors && typeof data.errors === "object"
          ? Object.values(data.errors).flat().find(Boolean) as string
          : undefined;
      let msg = data?.message ?? firstValidation ?? err?.message ?? "حدث خطأ";
      if (data?.trace_id) {
        msg = `${msg}\nمعرّف التتبع: ${data.trace_id}`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (slot: UploadSlot, file: File) => {
    if (!isAllowedImageFile(file)) {
      setUploadErrors((current) => ({ ...current, [slot]: "نوع الصورة غير مدعوم. استخدم JPG, PNG, WebP." }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES[slot]) {
      setUploadErrors((current) => ({ ...current, [slot]: `حجم الصورة أكبر من الحد المسموح (${slot === "logo" ? "5" : "8"}MB).` }));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(objectUrl);
    setPreviews((current) => {
      revokeIfObjectUrl(current[slot]);
      return { ...current, [slot]: objectUrl };
    });
    setUploading((current) => ({ ...current, [slot]: true }));
    setUploadErrors((current) => ({ ...current, [slot]: undefined }));

    try {
      const response = slot === "logo" ? await uploadApi.uploadStoreLogo(file) : await uploadApi.uploadStoreBanner(file);
      const secureUrl = response.data?.secure_url;
      if (!secureUrl) throw new Error("لم يرجع الخادم رابط الصورة.");

      if (slot === "logo") setField("logo_url", secureUrl);
      if (slot === "banner") setField("banner_url", secureUrl);
    } catch (caughtError: unknown) {
      setUploadErrors((current) => ({ ...current, [slot]: uploadErrorMessage(caughtError) }));
      if (slot === "logo") setField("logo_url", "");
      if (slot === "banner") setField("banner_url", "");
    } finally {
      setUploading((current) => ({ ...current, [slot]: false }));
    }
  };

  const removeUploadedImage = (slot: UploadSlot) => {
    setPreviews((current) => {
      revokeIfObjectUrl(current[slot]);
      return { ...current, [slot]: undefined };
    });
    setUploadErrors((current) => ({ ...current, [slot]: undefined }));
    if (slot === "logo") setField("logo_url", "");
    if (slot === "banner") setField("banner_url", "");
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
          className="p-2 rounded-xl hover:bg-gray-100 shrink-0"
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
                      current ? "text-gray-900 block" : stepDone ? "text-emerald-700 hidden md:block" : "text-gray-400 hidden md:block"
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
                  رابط المتجر العام <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent">
                  <span
                    className="px-3 py-2.5 text-xs text-gray-500 bg-gray-100 border-b sm:border-b-0 sm:border-l border-gray-200 shrink-0"
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
                <MediaUploadField
                  label="شعار المتجر"
                  hint="ارفع شعاراً واضحاً يظهر في واجهة المتجر."
                  inputRef={logoInputRef}
                  accept={IMAGE_ACCEPT}
                  previewUrl={previews.logo || form.logo_url}
                  uploading={uploading.logo}
                  error={uploadErrors.logo}
                  buttonLabel="اختيار شعار"
                  onSelect={(file) => void uploadImage("logo", file)}
                  onRemove={() => removeUploadedImage("logo")}
                />
              </div>

              <div className="space-y-1.5">
                <MediaUploadField
                  label="غلاف المتجر"
                  hint="يفضل صورة أفقية عريضة لواجهة المتجر."
                  inputRef={bannerInputRef}
                  accept={IMAGE_ACCEPT}
                  previewUrl={previews.banner || form.banner_url}
                  uploading={uploading.banner}
                  error={uploadErrors.banner}
                  buttonLabel="اختيار غلاف"
                  wide
                  onSelect={(file) => void uploadImage("banner", file)}
                  onRemove={() => removeUploadedImage("banner")}
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
                      <div className="text-[11px] text-gray-400 truncate" dir="ltr">
                        stores.dasm.com.sa/{form.slug || "your-store"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">أضف أول منتج (اختياري)</h2>
                <p className="text-sm text-gray-500 mt-1">
                  دعنا نجهز أول منتج ليظهر للعملاء فور اعتماد المتجر. يمكنك تخطي هذه الخطوة والمتابعة لإطلاق متجرك.
                </p>
              </div>

              <div className="space-y-4 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">اسم المنتج</label>
                    <input
                      type="text"
                      maxLength={120}
                      placeholder="مثال: تيشيرت قطن"
                      value={form.first_product.name}
                      onChange={(e) => setField("first_product", { ...form.first_product, name: e.target.value })}
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
                      onChange={(e) => setField("first_product", { ...form.first_product, price: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                   <div className="flex items-center justify-between mb-4">
                     <div>
                       <label className="text-sm font-medium text-gray-700">صور وفيديوهات المنتج</label>
                       <p className="text-[11px] text-gray-400 mt-0.5">حتى 10 صور، 2 فيديو</p>
                     </div>
                   </div>
                   <ProductMediaUploader media={media} setMedia={setMedia} />
                </div>

              {/* Variations Builder */}
              <div className="space-y-4 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">خيارات المنتج</h3>
                    <p className="text-xs text-gray-500 mt-0.5">خصص المتغيرات المتاحة لهذا المنتج (مثل المقاسات أو الألوان).</p>
                  </div>
                </div>
                <ProductVariationsBuilder 
                  basePrice={form.first_product.price}
                  options={productOptions}
                  setOptions={setProductOptions}
                  variants={productVariants}
                  setVariants={setProductVariants}
                />
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
                <Row label="رابط المتجر العام" value={`stores.dasm.com.sa/${form.slug}`} />
                <Row label="التصنيف" value={CATEGORIES.find((c) => c.value === form.category)?.label} />
                <Row label="اللون الأساسي" value={active.label} swatch={active.primary} />
                <Row label="الشعار" value={form.logo_url ? "تم رفع الشعار" : "لم يتم رفع شعار"} />
                <Row label="الغلاف" value={form.banner_url ? "تم رفع الغلاف" : "لم يتم رفع غلاف"} />
                {form.first_product.name ? (
                  <Row
                    label="أول منتج"
                    value={`${form.first_product.name} — ${form.first_product.price || 0} ر.س (${productVariants.length ? productVariants.length + ' متغيرات' : 'بدون متغيرات'})`}
                  />
                ) : null}
                {media.length > 0 ? (
                  <Row label="وسائط المنتج" value={`${media.filter(m => m.type === 'image').length} صور، ${media.filter(m => m.type === 'video').length} فيديو`} />
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
            disabled={step === 0 || loading || uploading.logo || uploading.banner || media.some((m) => m.url.startsWith('blob:') || m.url.includes('uploading'))}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-white disabled:opacity-40 transition"
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
              disabled={loading || uploading.logo || uploading.banner || media.some((m) => m.url.startsWith('blob:') || m.url.includes('uploading'))}
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

function MediaUploadField({
  label,
  hint,
  inputRef,
  accept,
  previewUrl,
  uploading,
  error,
  buttonLabel,
  wide,
  onSelect,
  onRemove,
}: {
  label: string;
  hint?: string;
  inputRef: RefObject<HTMLInputElement | null>;
  accept: string;
  previewUrl?: string;
  uploading?: boolean;
  error?: string;
  buttonLabel: string;
  wide?: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {hint ? <p className="mt-1 text-[11px] leading-5 text-gray-400">{hint}</p> : null}
        </div>
        {previewUrl ? (
          <button
            type="button"
            onClick={onRemove}
            className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label="إزالة الصورة"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.currentTarget.value = "";
          if (file) onSelect(file);
        }}
      />

      {previewUrl ? (
        <div
          className={`relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 ${
            wide ? "aspect-[5/2]" : "aspect-square max-w-[180px]"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- supports blob previews before upload */}
          <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
          {uploading ? (
            <div className="absolute inset-0 grid place-items-center bg-white/75">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition hover:border-emerald-400 hover:bg-emerald-50/60 hover:text-emerald-700 ${
            wide ? "aspect-[5/2]" : "min-h-32"
          }`}
        >
          <Upload className="h-7 w-7" />
          <span className="text-sm font-semibold">{uploading ? "جاري الرفع..." : buttonLabel}</span>
          <span className="text-[10px]">JPG, PNG, WebP, HEIC</span>
        </button>
      )}

      {previewUrl ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-60"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "جاري الرفع..." : "استبدال الصورة"}
        </button>
      ) : null}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 text-sm gap-1 sm:gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-gray-900 flex items-center gap-2 text-right sm:text-left break-all sm:break-normal">
        {swatch ? <span className="w-4 h-4 rounded-full shrink-0" style={{ background: swatch }} /> : null}
        {value || "—"}
      </span>
    </div>
  );
}

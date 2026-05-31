import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Palette,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Truck,
  Upload,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { ThemePicker } from "@/components/theme/ThemePicker";
import { ThemePreviewStorefront } from "@/components/theme/ThemePreviewStorefront";
import { sellerApi, uploadApi } from "@/lib/api";
import { getStoreDisplayName } from "@/lib/store-display";
import { storePath } from "@/lib/storefront-url";
import {
  detectPresetFromThemeConfig,
  findPresetById,
  presetToThemeConfig,
  buildThemeStorePayload,
  resolvePresetIdFromLegacyThemeId,
} from "@/lib/themes";
import type { ThemeMarket, ThemePreset } from "@/lib/themes/types";

type StoreSettingsData = {
  id?: string | number;
  name?: string | null;
  name_ar?: string | null;
  slug?: string | null;
  status?: string | null;
  owner_type?: string | null;
  category?: string | null;
  description?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  subscription_status?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  contact_whatsapp?: string | null;
  social_links?: Record<string, string> | null;
  theme_id?: string | number | null;
  theme?: { slug?: string | null } | null;
  theme_config?: Record<string, unknown> | null;
  paymentConfig?: unknown;
  payment_config?: unknown;
  iban?: string | null;
  bank_name?: string | null;
  account_holder_name?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  tryoto_shipping_enabled?: boolean | null;
  shipping_origin_city?: string | null;
  shipping_markup_sar?: string | number | null;
  shipping_extra_per_kg_sar?: string | number | null;
  parcel_length_cm?: string | number | null;
  parcel_width_cm?: string | number | null;
  parcel_height_cm?: string | number | null;
  shippingConfigs?: StoreShippingConfig[];
  shipping_configs?: StoreShippingConfig[];
};

type VerificationStatus = {
  email_verified?: boolean;
  phone_verified?: boolean;
  national_id_saved?: boolean;
  national_id_verified?: boolean;
};

type NationalAddressStatus = {
  national_address_short?: string | null;
  national_address_status?: string | null;
  national_address_doc_url?: string | null;
  national_address_rejection_reason?: string | null;
  national_address_verified_at?: string | null;
};

type StoreShippingConfig = {
  id: number | string;
  provider?: string | null;
  flat_rate?: number | string | null;
  free_above_amount?: number | string | null;
  estimated_days?: number | string | null;
  is_active?: boolean | null;
};

type PaymentMethodStatus = {
  key: string;
  label?: string;
  label_ar?: string;
  integration_id?: number | null;
  enabled?: boolean;
};

type PlatformPaymobStatus = {
  enabled?: boolean;
  base_url?: string;
  has_secret_key?: boolean;
  has_public_key?: boolean;
  has_hmac_secret?: boolean;
  payment_methods?: PaymentMethodStatus[];
};

type SettingsSection = "identity" | "theme" | "commerce" | "seo" | "verification";

const settingsTabs: { id: SettingsSection; label: string; icon: LucideIcon }[] = [
  { id: "identity", label: "المتجر", icon: Store },
  { id: "theme", label: "الثيم", icon: Palette },
  { id: "commerce", label: "الدفع والشحن", icon: Truck },
  { id: "seo", label: "SEO", icon: Search },
  { id: "verification", label: "التوثيق", icon: ShieldCheck },
];

const emptyForm = {
  name: "",
  name_ar: "",
  slug: "",
  category: "",
  description: "",
  logo_url: "",
  banner_url: "",
  contact_phone: "",
  contact_email: "",
  contact_whatsapp: "",
  instagram: "",
  x: "",
  tiktok: "",
  snapchat: "",
  website: "",
  meta_title: "",
  meta_description: "",
  iban: "",
  bank_name: "",
  account_holder_name: "",
  tryoto_shipping_enabled: false,
  shipping_origin_city: "",
  shipping_markup_sar: "10",
  shipping_extra_per_kg_sar: "0",
  parcel_length_cm: "",
  parcel_width_cm: "",
  parcel_height_cm: "",
};

const emptyFlatForm = {
  enabled: false,
  flat_rate: "25",
  free_above_amount: "",
  estimated_days: "3",
};

function statusLabel(status?: string | null): string {
  if (status === "active") return "منشور";
  if (status === "draft") return "مسودة";
  if (status === "pending") return "قيد المراجعة";
  if (status === "verified") return "موثق";
  if (status === "submitted") return "مُرسل";
  if (status === "rejected") return "مرفوض";
  if (status === "suspended") return "معلق";
  return status || "غير محدد";
}

function readinessText(done: number, total: number): string {
  if (done >= total) return "جاهز";
  if (done >= Math.ceil(total * 0.6)) return "قريب من الجاهزية";
  return "يحتاج إكمال";
}

function stringValue(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function toOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : Number.NaN;
}

function toOptionalInteger(value: string): number | null {
  const parsed = toOptionalNumber(value);
  if (parsed == null || Number.isNaN(parsed)) return parsed;
  return Math.trunc(parsed);
}

function isInvalid(value: number | null): value is number {
  return Number.isNaN(value);
}

function pickFlatConfig(configs: StoreShippingConfig[]): StoreShippingConfig | null {
  return (
    configs.find((item) => item.provider === "custom") ??
    configs.find((item) => item.is_active !== false) ??
    configs[0] ??
    null
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  dir,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  dir?: "rtl" | "ltr";
  disabled?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{label}</span>
      <input
        type={type}
        value={value}
        dir={dir}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:disabled:bg-zinc-800"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{label}</span>
      <textarea
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm leading-6 text-zinc-950 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
    </label>
  );
}

function ToggleRow({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
      />
      <span>
        <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-100">{title}</span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-5 text-zinc-500 dark:text-zinc-400">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-5 w-5 text-emerald-600" />
      <h2 className="text-base font-black text-zinc-950 dark:text-zinc-50">{title}</h2>
    </div>
  );
}

function CheckItem({ ready, title, value }: { ready: boolean; title: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{title}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{value}</p>
        </div>
        {ready ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="h-5 w-5 shrink-0 text-amber-500" />
        )}
      </div>
    </div>
  );
}

export default function StoreSettingsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SettingsSection>("identity");
  const [store, setStore] = useState<StoreSettingsData | null>(null);
  const [verification, setVerification] = useState<VerificationStatus>({});
  const [nationalAddress, setNationalAddress] = useState<NationalAddressStatus>({});
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [addressShort, setAddressShort] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [flatForm, setFlatForm] = useState(emptyFlatForm);
  const [flatConfigId, setFlatConfigId] = useState<number | string | null>(null);
  const [marketFilter, setMarketFilter] = useState<ThemeMarket | "all">("all");
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset | null>(null);
  const [platformPaymob, setPlatformPaymob] = useState<PlatformPaymobStatus | null>(null);

  const setFormValue = useCallback((key: keyof typeof emptyForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const applyStore = useCallback((nextStore: StoreSettingsData) => {
    const social = nextStore.social_links ?? {};
    const configs = nextStore.shipping_configs ?? nextStore.shippingConfigs ?? [];
    const flatConfig = pickFlatConfig(configs);

    setStore(nextStore);
    setForm({
      name: nextStore.name ?? "",
      name_ar: nextStore.name_ar ?? "",
      slug: nextStore.slug ?? "",
      category: nextStore.category ?? "",
      description: nextStore.description ?? "",
      logo_url: nextStore.logo_url ?? "",
      banner_url: nextStore.banner_url ?? "",
      contact_phone: nextStore.contact_phone ?? "",
      contact_email: nextStore.contact_email ?? "",
      contact_whatsapp: nextStore.contact_whatsapp ?? "",
      instagram: social.instagram ?? "",
      x: social.x ?? social.twitter ?? "",
      tiktok: social.tiktok ?? "",
      snapchat: social.snapchat ?? "",
      website: social.website ?? "",
      meta_title: nextStore.meta_title ?? "",
      meta_description: nextStore.meta_description ?? "",
      iban: nextStore.iban ?? "",
      bank_name: nextStore.bank_name ?? "",
      account_holder_name: nextStore.account_holder_name ?? "",
      tryoto_shipping_enabled: Boolean(nextStore.tryoto_shipping_enabled),
      shipping_origin_city: nextStore.shipping_origin_city ?? "",
      shipping_markup_sar: stringValue(nextStore.shipping_markup_sar ?? "10"),
      shipping_extra_per_kg_sar: stringValue(nextStore.shipping_extra_per_kg_sar ?? "0"),
      parcel_length_cm: stringValue(nextStore.parcel_length_cm),
      parcel_width_cm: stringValue(nextStore.parcel_width_cm),
      parcel_height_cm: stringValue(nextStore.parcel_height_cm),
    });

    setFlatConfigId(flatConfig?.id ?? null);
    setFlatForm(
      flatConfig
        ? {
            enabled: flatConfig.is_active !== false,
            flat_rate: stringValue(flatConfig.flat_rate ?? "25"),
            free_above_amount: stringValue(flatConfig.free_above_amount),
            estimated_days: stringValue(flatConfig.estimated_days ?? "3"),
          }
        : emptyFlatForm,
    );

    const themeConfig = nextStore.theme_config ?? {};
    const fromConfig = detectPresetFromThemeConfig(themeConfig);
    const fromThemeSlug = findPresetById(nextStore.theme?.slug ?? null);
    const legacyNumericThemeId =
      typeof nextStore.theme_id === "number"
        ? nextStore.theme_id
        : typeof nextStore.theme_id === "string" && /^\d+$/.test(nextStore.theme_id)
          ? Number(nextStore.theme_id)
          : null;
    const fromThemeId = findPresetById(resolvePresetIdFromLegacyThemeId(legacyNumericThemeId));
    const nextTheme = fromConfig ?? fromThemeSlug ?? fromThemeId ?? findPresetById("retail-multi-department") ?? null;
    setSelectedTheme(nextTheme);
    setMarketFilter(nextTheme?.market === "automotive" || nextTheme?.market === "general" ? nextTheme.market : "all");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [storeRes, verificationRes, addressRes, shippingRes, paymentRes] = await Promise.allSettled([
        sellerApi.getMyStore(),
        sellerApi.getVerificationStatus(),
        sellerApi.getNationalAddress(),
        sellerApi.getShippingConfigs(),
        sellerApi.getPaymentConfig(),
      ]);

      if (storeRes.status === "fulfilled") {
        const nextStore = storeRes.value.data?.store as StoreSettingsData | null;
        if (!nextStore) {
          router.replace("/stores/new");
          return;
        }

        if (shippingRes.status === "fulfilled") {
          nextStore.shipping_configs = shippingRes.value.data?.shipping_configs ?? nextStore.shipping_configs;
        }
        applyStore(nextStore);
      }

      if (verificationRes.status === "fulfilled") {
        setVerification(verificationRes.value.data?.data ?? {});
      }

      if (addressRes.status === "fulfilled") {
        const data = addressRes.value.data?.data ?? {};
        setNationalAddress(data);
        setAddressShort(data.national_address_short ?? "");
      }

      if (paymentRes.status === "fulfilled") {
        setPlatformPaymob(paymentRes.value.data?.platform_paymob ?? null);
      }
    } catch {
      setError("تعذر تحميل إعدادات المتجر.");
    } finally {
      setLoading(false);
    }
  }, [applyStore, router]);

  useEffect(() => {
    const token = localStorage.getItem("stores_token");
    if (!token) {
      router.replace("/auth/login?returnUrl=/dashboard/settings");
      return;
    }
    setReady(true);
    load();
  }, [load, router]);

  const storeName = form.name_ar || form.name || (store ? getStoreDisplayName(store) : "");
  const storefrontHref = store?.slug ? storePath(store.slug, { preview: true }) : "";
  const enabledPaymentMethods = platformPaymob?.payment_methods?.filter((method) => method.enabled) ?? [];
  const hasPaymentConfig = Boolean(store?.paymentConfig ?? store?.payment_config ?? platformPaymob?.enabled);
  const hasAddress = Boolean(addressShort.trim() || nationalAddress.national_address_short);
  const addressStatus = nationalAddress.national_address_status ?? "none";
  const addressReady = hasAddress && ["verified", "pending", "submitted"].includes(addressStatus);
  const contactReady = Boolean(form.contact_phone || form.contact_whatsapp || form.contact_email);
  const paymentReady = Boolean(hasPaymentConfig || form.iban);
  const shippingReady = Boolean(
    (form.tryoto_shipping_enabled && form.shipping_origin_city.trim()) || flatForm.enabled,
  );
  const themeReady = Boolean(selectedTheme);
  const readinessItems = [Boolean(form.slug), contactReady, themeReady, paymentReady, shippingReady, addressReady];
  const doneCount = readinessItems.filter(Boolean).length;
  const readiness = Math.round((doneCount / readinessItems.length) * 100);
  const segmentCode = useMemo(
    () =>
      [
        "STORES",
        String(store?.owner_type || "OWNER").toUpperCase(),
        String(store?.subscription_status || "TRIAL").toUpperCase(),
      ].join("-"),
    [store?.owner_type, store?.subscription_status],
  );

  const uploadMedia = async (kind: "logo" | "banner", file: File | null | undefined) => {
    if (!file) return;
    setUploading(kind);
    setError(null);
    try {
      const response = kind === "logo" ? await uploadApi.uploadStoreLogo(file) : await uploadApi.uploadStoreBanner(file);
      const url = response.data?.secure_url;
      if (!url) throw new Error("upload_failed");
      setFormValue(kind === "logo" ? "logo_url" : "banner_url", url);
    } catch {
      setError("تعذر رفع الصورة. جرّب صورة أخرى أو ضع الرابط مباشرة.");
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!form.name.trim()) {
      setActiveSection("identity");
      setError("اسم المتجر مطلوب.");
      return;
    }

    const iban = form.iban.replace(/\s/g, "").toUpperCase();
    if (iban && (!iban.startsWith("SA") || iban.length !== 24)) {
      setActiveSection("commerce");
      setError("رقم IBAN يجب أن يبدأ بـ SA ويتكون من 24 خانة.");
      return;
    }

    const markup = toOptionalNumber(form.shipping_markup_sar);
    const extraPerKg = toOptionalNumber(form.shipping_extra_per_kg_sar);
    const length = toOptionalInteger(form.parcel_length_cm);
    const width = toOptionalInteger(form.parcel_width_cm);
    const height = toOptionalInteger(form.parcel_height_cm);
    const flatRate = toOptionalNumber(flatForm.flat_rate);
    const freeAbove = toOptionalNumber(flatForm.free_above_amount);
    const estimatedDays = toOptionalInteger(flatForm.estimated_days);

    if (form.tryoto_shipping_enabled && form.shipping_origin_city.trim().length < 2) {
      setActiveSection("commerce");
      setError("حدد مدينة الشحن قبل تفعيل Tryoto.");
      return;
    }

    if ([markup, extraPerKg, length, width, height, flatRate, freeAbove, estimatedDays].some(isInvalid)) {
      setActiveSection("commerce");
      setError("راجع أرقام الشحن والدفع. يجب أن تكون القيم صحيحة أو فارغة.");
      return;
    }

    if ([length, width, height].some((value) => value != null && value < 1)) {
      setActiveSection("commerce");
      setError("أبعاد الطرد يجب أن تكون أكبر من صفر أو فارغة.");
      return;
    }

    if (flatForm.enabled && flatRate == null) {
      setActiveSection("commerce");
      setError("حدد سعر الشحن الثابت.");
      return;
    }

    if (estimatedDays != null && estimatedDays < 1) {
      setActiveSection("commerce");
      setError("عدد أيام التسليم يجب أن يكون يوماً واحداً على الأقل.");
      return;
    }

    const normalizedAddress = addressShort.trim().toUpperCase();
    const currentAddress = (nationalAddress.national_address_short ?? "").trim().toUpperCase();
    const shouldSubmitAddress = Boolean(normalizedAddress && (normalizedAddress !== currentAddress || addressFile));

    if (shouldSubmitAddress && !/^[A-Z]{4}\d{4}$/i.test(normalizedAddress)) {
      setActiveSection("verification");
      setError("صيغة العنوان الوطني المختصر غير صحيحة. مثال: RAAA1234");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const socialLinks = {
        instagram: form.instagram.trim(),
        x: form.x.trim(),
        tiktok: form.tiktok.trim(),
        snapchat: form.snapchat.trim(),
        website: form.website.trim(),
      };
      const cleanSocialLinks = Object.fromEntries(
        Object.entries(socialLinks).filter(([, value]) => value.length > 0),
      );
      await sellerApi.updateStore({
        name: form.name.trim(),
        name_ar: form.name_ar.trim() || null,
        slug: form.slug.trim(),
        category: form.category.trim() || null,
        description: form.description.trim() || null,
        logo_url: form.logo_url.trim() || null,
        banner_url: form.banner_url.trim() || null,
        contact_phone: form.contact_phone.trim() || null,
        contact_email: form.contact_email.trim() || null,
        contact_whatsapp: form.contact_whatsapp.trim() || null,
        social_links: Object.keys(cleanSocialLinks).length ? cleanSocialLinks : null,
        meta_title: form.meta_title.trim() || null,
        meta_description: form.meta_description.trim() || null,
        iban: iban || null,
        bank_name: form.bank_name.trim() || null,
        account_holder_name: form.account_holder_name.trim() || null,
        ...(selectedTheme ? { ...buildThemeStorePayload(selectedTheme), theme_config: presetToThemeConfig(selectedTheme) } : {}),
        tryoto_shipping_enabled: form.tryoto_shipping_enabled,
        shipping_origin_city: form.shipping_origin_city.trim() || null,
        shipping_markup_sar: markup ?? 0,
        shipping_extra_per_kg_sar: extraPerKg ?? 0,
        parcel_length_cm: length,
        parcel_width_cm: width,
        parcel_height_cm: height,
      });

      if (flatForm.enabled) {
        const payload = {
          flat_rate: flatRate ?? 0,
          free_above_amount: freeAbove,
          estimated_days: estimatedDays ?? 3,
          is_active: true,
        };

        if (flatConfigId != null) {
          await sellerApi.updateShippingConfig(flatConfigId, payload);
        } else {
          const { data } = await sellerApi.createShippingConfig({ provider: "custom", ...payload });
          setFlatConfigId(data?.shipping_config?.id ?? null);
        }
      } else if (flatConfigId != null) {
        await sellerApi.updateShippingConfig(flatConfigId, { is_active: false });
      }

      if (shouldSubmitAddress) {
        const formData = new FormData();
        formData.append("national_address_short", normalizedAddress);
        if (addressFile) formData.append("document", addressFile);
        await sellerApi.submitNationalAddress(formData);
        setAddressFile(null);
      }

      setSuccess("تم حفظ إعدادات المتجر.");
      await load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err.response?.data?.message ?? err.message ?? "تعذر حفظ الإعدادات.");
    } finally {
      setSaving(false);
    }
  };

  const activate = async () => {
    setPublishing(true);
    setError(null);
    setSuccess(null);
    try {
      await sellerApi.activateStore();
      setSuccess("تم نشر المتجر.");
      await load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? "تعذر نشر المتجر.");
    } finally {
      setPublishing(false);
    }
  };

  if (!ready) return null;

  return (
    <>
      <Head>
        <title>إعدادات المتجر | متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="إعدادات المتجر"
        subtitle="تعديل مباشر لكل بيانات المتجر من صفحة واحدة"
        icon={Settings}
        hasStore
        storeSlug={store?.slug ?? undefined}
        storeName={storeName}
        storeStatus={store?.status ?? undefined}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {storefrontHref ? (
              <a
                href={storefrontHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                معاينة
              </a>
            ) : null}
            {store?.status !== "active" ? (
              <button
                type="button"
                onClick={activate}
                disabled={publishing}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BadgeCheck className="h-3.5 w-3.5" />}
                نشر المتجر
              </button>
            ) : null}
          </div>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            جاري تحميل الإعدادات...
          </div>
        ) : (
          <div className="mx-auto max-w-7xl space-y-5">
            <section className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <Store className="h-4 w-4" />
                    {statusLabel(store?.status)}
                    <span className="rounded-full bg-zinc-100 px-2 py-1 font-mono text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" dir="ltr">
                      {segmentCode}
                    </span>
                  </div>
                  <h1 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">
                    {storeName || "متجر داسم"}
                  </h1>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {form.slug ? `/${form.slug}` : "حدد رابط المتجر"}
                  </p>
                </div>
                <div className="min-w-[190px] rounded-2xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
                  <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{readiness}%</div>
                  <div className="mt-1 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    {readinessText(doneCount, readinessItems.length)}
                  </div>
                </div>
              </div>
            </section>

            <div className="flex gap-2 overflow-x-auto rounded-2xl border border-zinc-100 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSection(tab.id)}
                    className={[
                      "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition",
                      active
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
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

            {activeSection === "identity" ? (
              <section className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <SectionTitle icon={Store} title="هوية المتجر والتواصل" />
                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="اسم المتجر" value={form.name} onChange={(value) => setFormValue("name", value)} />
                  <Field label="الاسم العربي" value={form.name_ar} onChange={(value) => setFormValue("name_ar", value)} />
                  <Field label="رابط المتجر" dir="ltr" value={form.slug} onChange={(value) => setFormValue("slug", value)} />
                  <Field label="تصنيف المتجر" value={form.category} onChange={(value) => setFormValue("category", value)} placeholder="عطور، سيارات، قهوة..." />
                  <div className="lg:col-span-2">
                    <TextArea label="وصف المتجر" value={form.description} onChange={(value) => setFormValue("description", value)} maxLength={2000} />
                  </div>
                  <Field label="رقم الجوال" dir="ltr" value={form.contact_phone} onChange={(value) => setFormValue("contact_phone", value)} />
                  <Field label="واتساب" dir="ltr" value={form.contact_whatsapp} onChange={(value) => setFormValue("contact_whatsapp", value)} />
                  <Field label="البريد الإلكتروني" dir="ltr" type="email" value={form.contact_email} onChange={(value) => setFormValue("contact_email", value)} />
                  <Field label="الموقع الإلكتروني" dir="ltr" value={form.website} onChange={(value) => setFormValue("website", value)} />
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3 rounded-2xl border border-zinc-100 p-4 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-sm font-black text-zinc-900 dark:text-zinc-100">
                      <ImageIcon className="h-4 w-4 text-emerald-600" />
                      شعار المتجر
                    </div>
                    <Field label="رابط الشعار" dir="ltr" value={form.logo_url} onChange={(value) => setFormValue("logo_url", value)} />
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                      {uploading === "logo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      رفع شعار
                      <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadMedia("logo", event.target.files?.[0])} />
                    </label>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-zinc-100 p-4 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-sm font-black text-zinc-900 dark:text-zinc-100">
                      <ImageIcon className="h-4 w-4 text-emerald-600" />
                      بانر المتجر
                    </div>
                    <Field label="رابط البانر" dir="ltr" value={form.banner_url} onChange={(value) => setFormValue("banner_url", value)} />
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                      {uploading === "banner" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      رفع بانر
                      <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadMedia("banner", event.target.files?.[0])} />
                    </label>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-4">
                  <Field label="Instagram" dir="ltr" value={form.instagram} onChange={(value) => setFormValue("instagram", value)} />
                  <Field label="X" dir="ltr" value={form.x} onChange={(value) => setFormValue("x", value)} />
                  <Field label="TikTok" dir="ltr" value={form.tiktok} onChange={(value) => setFormValue("tiktok", value)} />
                  <Field label="Snapchat" dir="ltr" value={form.snapchat} onChange={(value) => setFormValue("snapchat", value)} />
                </div>
              </section>
            ) : null}

            {activeSection === "theme" ? (
              <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
                <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <SectionTitle icon={Palette} title="ثيم المتجر" />
                  <ThemePicker
                    selectedId={selectedTheme?.id ?? null}
                    onSelect={setSelectedTheme}
                    marketFilter={marketFilter}
                    onMarketFilterChange={setMarketFilter}
                  />
                </div>
                <aside className="lg:sticky lg:top-5 lg:self-start">
                  {selectedTheme ? <ThemePreviewStorefront preset={selectedTheme} /> : null}
                </aside>
              </section>
            ) : null}

            {activeSection === "commerce" ? (
              <section className="grid gap-5 xl:grid-cols-2">
                <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <SectionTitle icon={CreditCard} title="الدفع والسحب" />
                  <div className="grid gap-4">
                    <div
                      className={[
                        "rounded-xl border p-3 text-sm font-bold",
                        platformPaymob?.enabled
                          ? "border-emerald-100 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                          : "border-amber-100 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
                      ].join(" ")}
                    >
                      {platformPaymob?.enabled
                        ? `الدفع المركزي Paymob مفعل: ${enabledPaymentMethods.map((method) => method.label_ar || method.label || method.key).join("، ")}.`
                        : "الدفع الإلكتروني غير متاح حالياً لهذا المتجر."}
                    </div>
                    <Field label="IBAN" dir="ltr" value={form.iban} onChange={(value) => setFormValue("iban", value.toUpperCase())} placeholder="SA02..." />
                    <Field label="اسم البنك" value={form.bank_name} onChange={(value) => setFormValue("bank_name", value)} />
                    <Field label="اسم صاحب الحساب" value={form.account_holder_name} onChange={(value) => setFormValue("account_holder_name", value)} />
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <SectionTitle icon={Truck} title="الشحن" />
                  <div className="space-y-4">
                    <ToggleRow
                      checked={form.tryoto_shipping_enabled}
                      onChange={(checked) => setFormValue("tryoto_shipping_enabled", checked)}
                      title="تفعيل Tryoto"
                      description="أسعار شحن فورية حسب مدينة الإرسال ووزن الطلب."
                    />
                    <Field label="مدينة الشحن" value={form.shipping_origin_city} onChange={(value) => setFormValue("shipping_origin_city", value)} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="هامش الشحن" type="number" value={form.shipping_markup_sar} onChange={(value) => setFormValue("shipping_markup_sar", value)} />
                      <Field label="زيادة لكل كجم" type="number" value={form.shipping_extra_per_kg_sar} onChange={(value) => setFormValue("shipping_extra_per_kg_sar", value)} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label="الطول سم" type="number" value={form.parcel_length_cm} onChange={(value) => setFormValue("parcel_length_cm", value)} />
                      <Field label="العرض سم" type="number" value={form.parcel_width_cm} onChange={(value) => setFormValue("parcel_width_cm", value)} />
                      <Field label="الارتفاع سم" type="number" value={form.parcel_height_cm} onChange={(value) => setFormValue("parcel_height_cm", value)} />
                    </div>
                    <ToggleRow
                      checked={flatForm.enabled}
                      onChange={(checked) => setFlatForm((current) => ({ ...current, enabled: checked }))}
                      title="شحن ثابت"
                      description="خيار يدوي يظهر في checkout كبديل أو خيار مباشر."
                    />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label="السعر" type="number" value={flatForm.flat_rate} onChange={(value) => setFlatForm((current) => ({ ...current, flat_rate: value }))} />
                      <Field label="مجاني فوق" type="number" value={flatForm.free_above_amount} onChange={(value) => setFlatForm((current) => ({ ...current, free_above_amount: value }))} />
                      <Field label="أيام التسليم" type="number" value={flatForm.estimated_days} onChange={(value) => setFlatForm((current) => ({ ...current, estimated_days: value }))} />
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {activeSection === "seo" ? (
              <section className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <SectionTitle icon={Search} title="محركات البحث والمشاركة" />
                <div className="grid gap-4">
                  <Field label="عنوان SEO" value={form.meta_title} onChange={(value) => setFormValue("meta_title", value)} />
                  <TextArea label="وصف SEO" value={form.meta_description} onChange={(value) => setFormValue("meta_description", value)} maxLength={500} />
                  <div className="rounded-2xl border border-zinc-100 p-4 dark:border-zinc-800">
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">معاينة</p>
                    <p className="mt-2 text-base font-black text-blue-700">{form.meta_title || storeName || "متجر داسم"}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {form.meta_description || form.description || "وصف المتجر يظهر هنا عند المشاركة والبحث."}
                    </p>
                  </div>
                </div>
              </section>
            ) : null}

            {activeSection === "verification" ? (
              <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
                <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <SectionTitle icon={ShieldCheck} title="جاهزية وتوثيق" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <CheckItem ready={Boolean(form.slug)} title="رابط المتجر" value={form.slug ? `/${form.slug}` : "لم يتم تحديد الرابط"} />
                    <CheckItem ready={contactReady} title="بيانات التواصل" value={contactReady ? "بيانات التواصل موجودة" : "أضف رقم أو بريد أو واتساب"} />
                    <CheckItem ready={themeReady} title="الثيم" value={selectedTheme?.nameAr ?? "اختر ثيم للمتجر"} />
                    <CheckItem
                      ready={paymentReady}
                      title="الدفع والسحب"
                      value={platformPaymob?.enabled ? "Paymob مفعل للمتجر" : paymentReady ? "IBAN متوفر" : "أضف IBAN للحساب البنكي"}
                    />
                    <CheckItem ready={shippingReady} title="الشحن" value={shippingReady ? "الشحن متاح" : "فعّل Tryoto أو الشحن الثابت"} />
                    <CheckItem ready={addressReady} title="العنوان الوطني" value={hasAddress ? statusLabel(addressStatus) : "أضف العنوان المختصر"} />
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <SectionTitle icon={MapPin} title="العنوان الوطني" />
                  <div className="space-y-4">
                    <Field
                      label="الرقم المختصر"
                      dir="ltr"
                      value={addressShort}
                      onChange={(value) => setAddressShort(value.toUpperCase())}
                      placeholder="RAAA1234"
                    />
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-zinc-300 px-3 py-3 text-sm font-bold text-zinc-600 hover:border-emerald-400 dark:border-zinc-700 dark:text-zinc-300">
                      <Upload className="h-4 w-4" />
                      <span className="truncate">{addressFile ? addressFile.name : "وثيقة سبل PDF أو صورة"}</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(event) => setAddressFile(event.target.files?.[0] ?? null)}
                      />
                    </label>
                    <div className="grid gap-2">
                      <CheckItem ready={Boolean(verification.email_verified)} title="البريد الإلكتروني" value={verification.email_verified ? "موثق" : "غير موثق"} />
                      <CheckItem ready={Boolean(verification.phone_verified)} title="رقم الجوال" value={verification.phone_verified ? "موثق" : "غير موثق"} />
                      <CheckItem
                        ready={Boolean(verification.national_id_saved || verification.national_id_verified)}
                        title="الهوية"
                        value={verification.national_id_verified ? "موثقة" : verification.national_id_saved ? "محفوظة" : "غير مضافة"}
                      />
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            <div className="sticky bottom-3 z-20 rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-xl backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
              <button
                type="button"
                onClick={save}
                disabled={saving || Boolean(uploading)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "جاري الحفظ..." : "حفظ كل الإعدادات"}
              </button>
            </div>
          </div>
        )}
      </SellerShell>
    </>
  );
}

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  MapPin,
  Palette,
  Settings,
  ShieldCheck,
  Store,
  Truck,
  XCircle,
} from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";
import { getStoreDisplayName } from "@/lib/store-display";
import { storePath } from "@/lib/storefront-url";

type StoreSettingsData = {
  id?: string | number;
  name?: string | null;
  name_ar?: string | null;
  slug?: string | null;
  status?: string | null;
  owner_type?: string | null;
  category?: string | null;
  subscription_status?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  contact_whatsapp?: string | null;
  theme_id?: string | number | null;
  theme_config?: Record<string, unknown> | null;
  paymentConfig?: unknown;
  payment_config?: unknown;
  iban?: string | null;
  bank_name?: string | null;
  account_holder_name?: string | null;
  tryoto_shipping_enabled?: boolean | null;
  shipping_origin_city?: string | null;
  shipping_markup_sar?: string | number | null;
  shipping_extra_per_kg_sar?: string | number | null;
  shippingConfigs?: unknown[];
  shipping_configs?: unknown[];
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
  national_address_verified_at?: string | null;
};

type StatItemProps = {
  ready: boolean;
  title: string;
  value: string;
  href?: string;
};

function statusLabel(status?: string | null): string {
  if (status === "active") return "منشور";
  if (status === "draft") return "مسودة";
  if (status === "pending") return "قيد المراجعة";
  if (status === "verified") return "موثق";
  if (status === "submitted") return "مُرسل";
  if (status === "rejected") return "مرفوض";
  return status || "غير محدد";
}

function readinessText(done: number, total: number): string {
  if (done >= total) return "جاهز";
  if (done >= Math.ceil(total * 0.6)) return "قريب من الجاهزية";
  return "يحتاج إكمال";
}

function StatItem({ ready, title, value, href }: StatItemProps) {
  const content = (
    <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm transition hover:border-emerald-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{value}</p>
        </div>
        {ready ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="h-5 w-5 shrink-0 text-amber-500" />
        )}
      </div>
    </div>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}

export default function StoreSettingsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [store, setStore] = useState<StoreSettingsData | null>(null);
  const [verification, setVerification] = useState<VerificationStatus>({});
  const [nationalAddress, setNationalAddress] = useState<NationalAddressStatus>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [storeRes, verificationRes, addressRes] = await Promise.allSettled([
        sellerApi.getMyStore(),
        sellerApi.getVerificationStatus(),
        sellerApi.getNationalAddress(),
      ]);

      if (storeRes.status === "fulfilled") {
        const nextStore = storeRes.value.data?.store ?? null;
        if (!nextStore) {
          router.replace("/stores/new");
          return;
        }
        setStore(nextStore);
      }

      if (verificationRes.status === "fulfilled") {
        setVerification(verificationRes.value.data?.data ?? {});
      }

      if (addressRes.status === "fulfilled") {
        setNationalAddress(addressRes.value.data?.data ?? {});
      }
    } catch {
      setError("تعذّر تحميل إعدادات المتجر.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("stores_token");
    if (!token) {
      router.replace("/auth/login?returnUrl=/dashboard/settings");
      return;
    }
    setReady(true);
    load();
  }, [load, router]);

  const storeName = store ? getStoreDisplayName(store) : "";
  const storefrontHref = store?.slug ? storePath(store.slug, { preview: true }) : "";

  const themePreset = useMemo(() => {
    const presetId = store?.theme_config?.preset_id;
    return typeof presetId === "string" && presetId.trim() ? presetId : store?.theme_id ? `legacy-${store.theme_id}` : "";
  }, [store]);

  const hasPaymentConfig = Boolean(store?.paymentConfig ?? store?.payment_config);
  const hasIban = Boolean(store?.iban);
  const hasTryoto = Boolean(store?.tryoto_shipping_enabled && store?.shipping_origin_city);
  const hasFlatShipping = Boolean((store?.shippingConfigs ?? store?.shipping_configs ?? []).length);
  const addressStatus = nationalAddress.national_address_status ?? "none";
  const hasAddress = Boolean(nationalAddress.national_address_short);
  const addressReady = hasAddress && ["verified", "pending", "submitted"].includes(addressStatus);
  const contactReady = Boolean(store?.contact_phone || store?.contact_whatsapp || store?.contact_email);
  const themeReady = Boolean(themePreset);
  const paymentReady = hasPaymentConfig || hasIban;
  const shippingReady = hasTryoto || hasFlatShipping;
  const readinessItems = [
    Boolean(store?.slug),
    contactReady,
    themeReady,
    paymentReady,
    shippingReady,
    addressReady,
  ];
  const doneCount = readinessItems.filter(Boolean).length;
  const readiness = Math.round((doneCount / readinessItems.length) * 100);
  const segmentCode = [
    "STORES",
    String(store?.owner_type || "OWNER").toUpperCase(),
    String(store?.subscription_status || "TRIAL").toUpperCase(),
  ].join("-");

  if (!ready) return null;

  return (
    <>
      <Head>
        <title>إعدادات المتجر — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="إعدادات المتجر"
        subtitle="مركز جاهزية المتجر للبيع والشحن والدفع والتوثيق"
        icon={Settings}
        hasStore
        storeSlug={store?.slug ?? undefined}
        storeName={storeName}
        storeStatus={store?.status ?? undefined}
        actions={
          storefrontHref ? (
            <a
              href={storefrontHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              معاينة
            </a>
          ) : null
        }
      >
        {loading ? (
          <div className="py-20 text-center text-sm text-zinc-500">جاري تحميل الإعدادات...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <div className="mx-auto max-w-6xl space-y-6">
            <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <Store className="h-4 w-4" />
                    {statusLabel(store?.status)}
                  </div>
                  <h1 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">
                    {storeName || "متجر داسم"}
                  </h1>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    كود الشريحة الحالي: <span className="font-mono" dir="ltr">{segmentCode}</span>
                  </p>
                </div>
                <div className="min-w-[180px] rounded-2xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
                  <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                    {readiness}%
                  </div>
                  <div className="mt-1 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    {readinessText(doneCount, readinessItems.length)}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <StatItem
                ready={Boolean(store?.slug)}
                title="هوية المتجر"
                value={store?.slug ? `الرابط: ${store.slug}` : "أكمل إنشاء المتجر والرابط العام."}
                href="/dashboard"
              />
              <StatItem
                ready={contactReady}
                title="بيانات التواصل"
                value={contactReady ? "يوجد رقم أو بريد أو واتساب للتواصل." : "أضف وسيلة تواصل واضحة للعميل."}
                href="/dashboard"
              />
              <StatItem
                ready={themeReady}
                title="الثيمات المجانية"
                value={themeReady ? "تم اختيار ثيم مجاني للمتجر." : "اختر ثيماً مجانياً من معرض الثيمات."}
                href="/dashboard/theme"
              />
              <StatItem
                ready={addressReady}
                title="العنوان الوطني / سبل"
                value={
                  hasAddress
                    ? `${nationalAddress.national_address_short} — ${statusLabel(addressStatus)}`
                    : "أضف العنوان المختصر من سبل لتسهيل الشحن."
                }
                href="/dashboard"
              />
              <StatItem
                ready={shippingReady}
                title="الشحن والـ checkout"
                value={
                  shippingReady
                    ? hasTryoto
                      ? `Tryoto مفعل من ${store?.shipping_origin_city}`
                      : "يوجد شحن ثابت مفعل."
                    : "فعّل Tryoto أو شحن ثابت حتى يظهر خيار الشحن في checkout."
                }
                href="/dashboard/shipping"
              />
              <StatItem
                ready={paymentReady}
                title="الدفع والسحب"
                value={paymentReady ? "الدفع أو حساب السحب متوفر." : "أكمل بيانات الدفع أو IBAN قبل استقبال الطلبات."}
                href="/dashboard/payment"
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
              <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="flex items-center gap-2 text-base font-bold text-zinc-950 dark:text-zinc-50">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  توثيق صاحب المتجر
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <StatItem ready={Boolean(verification.email_verified)} title="البريد الإلكتروني" value={verification.email_verified ? "موثق" : "يحتاج توثيق من داسم الأم."} />
                  <StatItem ready={Boolean(verification.phone_verified)} title="رقم الجوال" value={verification.phone_verified ? "موثق" : "يحتاج OTP من داسم الأم."} />
                  <StatItem ready={Boolean(verification.national_id_saved || verification.national_id_verified)} title="الهوية" value={verification.national_id_verified ? "موثقة" : verification.national_id_saved ? "محفوظة وتنتظر اعتماداً" : "غير مضافة بعد"} />
                  <StatItem ready={addressReady} title="العنوان الوطني" value={hasAddress ? statusLabel(addressStatus) : "غير مضاف"} />
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50">روابط العمل السريعة</h2>
                <div className="mt-4 space-y-2">
                  <Link className="flex items-center gap-2 rounded-xl border border-zinc-100 px-3 py-2 text-sm font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800" href="/dashboard/theme">
                    <Palette className="h-4 w-4 text-emerald-600" />
                    تحسين الثيم المجاني
                  </Link>
                  <Link className="flex items-center gap-2 rounded-xl border border-zinc-100 px-3 py-2 text-sm font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800" href="/dashboard/shipping">
                    <Truck className="h-4 w-4 text-emerald-600" />
                    إعداد الشحن
                  </Link>
                  <Link className="flex items-center gap-2 rounded-xl border border-zinc-100 px-3 py-2 text-sm font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800" href="/dashboard/payment">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    إعداد الدفع والسحب
                  </Link>
                  <Link className="flex items-center gap-2 rounded-xl border border-zinc-100 px-3 py-2 text-sm font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800" href="/dashboard/products">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                    مراجعة المنتجات
                  </Link>
                </div>
                <div className="mt-4 rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
                  <MapPin className="mb-1 h-4 w-4" />
                  GPS يظهر في صفحة checkout للعميل ويُرسل داخل `shipping_address`. أما عنوان صاحب المتجر الرسمي فمصدره العنوان الوطني من Core.
                </div>
              </div>
            </section>
          </div>
        )}
      </SellerShell>
    </>
  );
}

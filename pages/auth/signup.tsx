import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import axios, { isAxiosError } from "axios";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardList,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";

import { platformApiOrigin } from "@/lib/platform-api-url";

const API_URL = platformApiOrigin();
const ARABIC_NAME_RE = /^[\u0600-\u06FF\s]+$/;
const PHONE_PREFIX = "966";

const SAUDI_REGION_ALIASES: Record<string, string[]> = {
  "منطقة الرياض": ["riyadh", "الرياض"],
  "منطقة مكة المكرمة": ["makkah", "mecca", "jeddah", "taif", "مكة", "مكه", "جدة", "جده", "الطائف"],
  "المنطقة الشرقية": [
    "eastern province",
    "ash sharqiyah",
    "eastern",
    "dammam",
    "khobar",
    "dhahran",
    "jubail",
    "al ahsa",
    "الشرقية",
    "الشرقيه",
    "الدمام",
    "الخبر",
    "الظهران",
    "الجبيل",
    "الأحساء",
    "الاحساء",
  ],
  "منطقة المدينة المنورة": ["madinah", "medina", "al madinah", "المدينة", "المدينه", "ينبع"],
  "منطقة القصيم": ["qassim", "al qasim", "القصيم", "بريدة", "بريده", "عنيزة", "عنيزه"],
  "منطقة عسير": ["asir", "aseer", "abha", "khamis mushait", "عسير", "أبها", "ابها", "خميس مشيط"],
  "منطقة حائل": ["hail", "ha'il", "حائل"],
  "منطقة تبوك": ["tabuk", "تبوك"],
  "منطقة الحدود الشمالية": ["northern borders", "al hudud", "عرعر", "رفحاء", "طريف", "الحدود الشمالية"],
  "منطقة جازان": ["jizan", "jazan", "جازان", "جيزان"],
  "منطقة نجران": ["najran", "نجران"],
  "منطقة الجوف": ["al jawf", "jawf", "sakaka", "الجوف", "سكاكا"],
  "منطقة الباحة": ["al bahah", "baha", "الباحة", "الباحه"],
};

type AccountType = "venue_owner";

type Region = {
  id: number | string;
  name: string;
  code?: string;
};

type GpsStatus = "idle" | "locating" | "success" | "error";

type SignupLocation = {
  city: string;
  region: string;
  accuracyM: number | null;
};

type SignupFormState = {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone: string;
  referral_code: string;
  area_id: string;
  account_type: AccountType;
  company_name: string;
  commercial_registry: string;
  address: string;
  password: string;
  password_confirmation: string;
};

type ApiErrorBody = {
  message?: string;
  first_error?: string;
  code?: string;
  suggested_email?: string;
  manual_registration_url?: string;
  errors?: Record<string, string[]>;
};

function normalizeLocationText(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[^\u0600-\u06FFa-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildAreaLabel(regionName: string, city?: string | null) {
  const cleanCity = (city ?? "").trim();
  return cleanCity ? `${regionName} - ${cleanCity}` : regionName;
}

function findMatchingSaudiRegion(
  regions: Region[],
  regionName?: string | null,
  cityName?: string | null,
  preferredAreaId?: number | string | null,
) {
  if (preferredAreaId !== null && preferredAreaId !== undefined) {
    const direct = regions.find((region) => String(region.id) === String(preferredAreaId));
    if (direct) return direct;
  }

  const candidates = [
    normalizeLocationText(regionName),
    normalizeLocationText(cityName),
  ].filter(Boolean);

  return regions.find((region) => {
    const names = [
      normalizeLocationText(region.name),
      normalizeLocationText(region.code),
      ...(SAUDI_REGION_ALIASES[region.name] ?? []).map(normalizeLocationText),
    ].filter(Boolean);

    return candidates.some((candidate) =>
      names.some((name) => candidate.includes(name) || name.includes(candidate)),
    );
  });
}

const initialForm: SignupFormState = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  phone: "",
  referral_code: "",
  area_id: "",
  account_type: "venue_owner",
  company_name: "",
  commercial_registry: "",
  address: "",
  password: "",
  password_confirmation: "",
};

const errorPriority = [
  "email",
  "phone",
  "first_name",
  "middle_name",
  "last_name",
  "password",
  "company_name",
  "commercial_registry",
  "address",
  "area_id",
  "referral_code",
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignupFormState>(initialForm);
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [regionsError, setRegionsError] = useState("");
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");
  const [gpsError, setGpsError] = useState("");
  const [gpsLocation, setGpsLocation] = useState<SignupLocation | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedRegion = useMemo(
    () => regions.find((region) => String(region.id) === form.area_id),
    [form.area_id, regions],
  );

  const selectedAreaLabel = useMemo(() => {
    if (gpsLocation && selectedRegion) {
      return buildAreaLabel(selectedRegion.name, gpsLocation.city);
    }

    return selectedRegion?.name;
  }, [gpsLocation, selectedRegion]);

  useEffect(() => {
    if (!router.isReady) return;

    const ref =
      typeof router.query.ref === "string"
        ? router.query.ref
        : typeof router.query.referral_code === "string"
          ? router.query.referral_code
          : "";

    if (ref) {
      setForm((current) => ({
        ...current,
        referral_code: ref.toUpperCase().slice(0, 20),
      }));
    }
  }, [router.isReady, router.query.ref, router.query.referral_code]);

  useEffect(() => {
    let cancelled = false;

    async function loadRegions() {
      setRegionsLoading(true);
      setRegionsError("");

      try {
        const response = await axios.get<{ data?: Region[] } | Region[]>(
          `${API_URL}/api/regions`,
          { timeout: 15000 },
        );
        const list = Array.isArray(response.data)
          ? response.data
          : response.data.data ?? [];

        if (!cancelled) {
          setRegions(Array.isArray(list) ? list : []);
        }
      } catch {
        if (!cancelled) {
          setRegionsError("تعذر تحميل مناطق المملكة من المنصة. يمكنك إكمال التسجيل بدون تحديد المنطقة الآن.");
        }
      } finally {
        if (!cancelled) {
          setRegionsLoading(false);
        }
      }
    }

    loadRegions();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField<K extends keyof SignupFormState>(field: K, value: SignupFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleAreaChange(value: string) {
    updateField("area_id", value);
    setGpsStatus("idle");
    setGpsError("");
    setGpsLocation(null);
  }

  function normalizeSaudiPhoneInput(value: string) {
    const raw = value.replace(/\D/g, "");
    const withoutInternationalPrefix = raw.startsWith(PHONE_PREFIX) ? raw.slice(PHONE_PREFIX.length) : raw;
    const withoutLeadingZero = withoutInternationalPrefix.startsWith("05")
      ? withoutInternationalPrefix.slice(1)
      : withoutInternationalPrefix.replace(/^0+/, "");

    return withoutLeadingZero.slice(0, 9);
  }

  function handleDetectRegistrationLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("error");
      setGpsError("المتصفح لا يدعم تحديد الموقع.");
      return;
    }

    if (regionsLoading || regions.length === 0) {
      setGpsStatus("error");
      setGpsError("انتظر تحميل مناطق المملكة ثم حاول تحديد الموقع مرة أخرى.");
      return;
    }

    setGpsStatus("locating");
    setGpsError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const accuracyM = Math.round(position.coords.accuracy);

        try {
          const response = await fetch("/api/reverse-geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          });
          const data = (await response.json().catch(() => ({}))) as {
            area_id?: number | string | null;
            city?: string | null;
            region?: string | null;
          };

          if (!response.ok) {
            throw new Error("reverse_geocode_failed");
          }

          const matchedRegion = findMatchingSaudiRegion(
            regions,
            data.region,
            data.city,
            data.area_id,
          );

          if (!matchedRegion) {
            setGpsStatus("error");
            setGpsError("تم تحديد الموقع، لكن لم نتمكن من مطابقته مع مناطق المملكة. اختر المنطقة يدوياً.");
            return;
          }

          const city = data.city?.trim() || "غير محددة";
          updateField("area_id", String(matchedRegion.id));
          setGpsLocation({
            city,
            region: matchedRegion.name,
            accuracyM,
          });
          setGpsStatus("success");
        } catch {
          setGpsStatus("error");
          setGpsError("تعذر قراءة المدينة من الموقع. اختر المنطقة يدوياً أو حاول مرة أخرى.");
        }
      },
      () => {
        setGpsStatus("error");
        setGpsError("لم يتم السماح بتحديد الموقع أو انتهت المهلة.");
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      },
    );
  }

  function validateClientForm() {
    const firstName = form.first_name.trim();
    const middleName = form.middle_name.trim();
    const lastName = form.last_name.trim();
    const email = normalizeEmail(form.email);
    const referralCode = form.referral_code.trim();

    if (firstName.length < 2 || !ARABIC_NAME_RE.test(firstName)) {
      return "الاسم الأول يجب أن يكون بالعربية وعلى الأقل حرفين.";
    }
    if (middleName && !ARABIC_NAME_RE.test(middleName)) {
      return "الاسم الأوسط يجب أن يكون بالعربية فقط.";
    }
    if (lastName.length < 2 || !ARABIC_NAME_RE.test(lastName)) {
      return "الاسم الأخير يجب أن يكون بالعربية وعلى الأقل حرفين.";
    }
    if (!email || emailHasNonAscii(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "يرجى إدخال بريد إلكتروني صالح بحروف لاتينية.";
    }
    if (!/^5\d{8}$/.test(form.phone)) {
      return "رقم الهاتف يجب أن يبدأ بـ 5 ويتكون من 9 أرقام بعد كود السعودية.";
    }
    if (referralCode.length > 20) {
      return "كود الإحالة يجب ألا يتجاوز 20 حرفا.";
    }
    if (form.password.length < 8) {
      return "كلمة المرور يجب أن تكون 8 أحرف على الأقل.";
    }
    if (form.password !== form.password_confirmation) {
      return "كلمتا المرور غير متطابقتين.";
    }
    if (form.company_name.trim().length < 3) {
      return "اسم المتجر مطلوب ويجب أن يكون 3 أحرف على الأقل.";
    }
    if (form.commercial_registry.trim().length < 5) {
      return "رقم السجل التجاري مطلوب ويجب أن يكون 5 أحرف على الأقل.";
    }
    if (form.address.trim().length < 5) {
      return "عنوان المتجر مطلوب ويجب أن يكون 5 أحرف على الأقل.";
    }

    return "";
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const clientError = validateClientForm();
    if (clientError) {
      setError(clientError);
      return;
    }

    setBusy(true);

    const returnUrl = safeInternalReturnUrl(router.query.returnUrl, "/dashboard");
    const payload: Record<string, string | undefined> = {
      first_name: form.first_name.trim(),
      middle_name: form.middle_name.trim() || undefined,
      last_name: form.last_name.trim(),
      email: normalizeEmail(form.email),
      email_confirmation: normalizeEmail(form.email),
      phone: `+${PHONE_PREFIX}${form.phone}`,
      password: form.password,
      password_confirmation: form.password_confirmation,
      account_type: form.account_type,
      product_context: "stores",
      return_url: returnUrl,
      area_id: form.area_id || undefined,
      area_label: selectedAreaLabel,
      referral_code: form.referral_code.trim().toUpperCase() || undefined,
      company_name: form.company_name.trim(),
      commercial_registry: form.commercial_registry.trim(),
      address: form.address.trim(),
    };

    try {
      const response = await axios.post(`${API_URL}/api/register`, payload, {
        timeout: 20000,
        headers: { Accept: "application/json" },
      });

      if (response.data?.status !== "success") {
        setError(response.data?.message || "تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("stores_signup_email", payload.email ?? "");
      }

      setSuccess("تم إنشاء الحساب بنجاح. سننقلك الآن للتحقق من البريد الإلكتروني.");
      setTimeout(() => {
        router.replace(
          `/auth/verify-email?email=${encodeURIComponent(payload.email ?? "")}&returnUrl=${encodeURIComponent(returnUrl)}`,
        );
      }, 900);
    } catch (caughtError: unknown) {
      setError(resolveApiError(caughtError, "تعذر إنشاء الحساب. يرجى التحقق من البيانات والمحاولة مرة أخرى."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>إنشاء حساب — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen bg-white text-slate-950 dark:bg-gray-950 dark:text-white" dir="rtl">
        <div className="min-h-screen lg:grid lg:grid-cols-[0.9fr_1.1fr]">
          <section className="relative hidden overflow-hidden bg-[#062015] px-10 py-10 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,#062015_0%,#0b3b25_48%,#0f5132_100%)]" />
            <div className="absolute inset-x-10 top-28 h-px bg-gradient-to-l from-transparent via-emerald-300/30 to-transparent" />
            <div className="absolute inset-x-10 bottom-24 h-px bg-gradient-to-l from-transparent via-amber-200/20 to-transparent" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#047857] text-lg font-extrabold text-white shadow-lg shadow-emerald-950/30">
                م
              </div>
              <div>
                <p className="text-lg font-extrabold leading-none text-white">متاجر داسم</p>
                <p className="mt-1 text-xs font-medium text-emerald-300">DASM Stores</p>
              </div>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-md space-y-8">
              <div className="relative mx-auto aspect-square w-72">
                <div className="absolute inset-x-12 bottom-12 h-28 rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur" />
                <div className="absolute right-12 top-16 grid h-28 w-28 place-items-center rounded-2xl border border-white/15 bg-white/10 text-emerald-100 shadow-2xl backdrop-blur">
                  <Store className="h-12 w-12" strokeWidth={1.7} />
                </div>
                <div className="absolute left-8 top-28 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-white shadow-2xl backdrop-blur">
                  <p className="text-xs text-emerald-200">هوية موحدة</p>
                  <p className="mt-1 text-2xl font-extrabold">DASM</p>
                </div>
                <div className="absolute bottom-16 left-10 right-10 rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-2">
                      <span className="block h-2 w-24 rounded-full bg-emerald-300/80" />
                      <span className="block h-2 w-16 rounded-full bg-emerald-100/35" />
                    </div>
                    <ShieldCheck className="h-9 w-9 text-amber-300" strokeWidth={1.8} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-center">
                <h1 className="text-4xl font-extrabold leading-tight text-white">
                  مرحبا بك في عالم
                  <span className="mt-2 block text-emerald-300">أسواق داسم</span>
                </h1>
                <p className="mx-auto max-w-sm text-sm leading-7 text-emerald-50/75">
                  حساب واحد يعمل عبر المنصة الأم ومتاجر داسم، مع نفس بيانات المستخدم والتحقق الآمن من البريد.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between text-xs text-emerald-100/55">
              <span>متاجر داسم</span>
              <span>stores.dasm.com.sa</span>
            </div>
          </section>

          <section className="flex min-h-screen flex-col px-5 py-7 sm:px-8 lg:px-14">
            <div className="flex items-center justify-between">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 dark:border-gray-800 dark:text-gray-200 dark:hover:border-emerald-800"
              >
                <ArrowLeft className="h-4 w-4" />
                تسجيل الدخول
              </Link>
              <div className="flex items-center gap-3 lg:hidden">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#047857] font-extrabold text-white">
                  م
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">متاجر داسم</p>
                  <p className="text-xs text-emerald-600">DASM Stores</p>
                </div>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-10">
              <div className="mb-8">
                <p className="mb-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">إنشاء حساب جديد</p>
                <h2 className="text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white">
                  بيانات صاحب المتجر
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-gray-400">
                  يتم إنشاء الحساب في جدول المستخدمين الموحد للمنصة، ثم تنتقل للتحقق من البريد الإلكتروني.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <Field id="first_name" label="الاسم الأول" icon={<UserRound className="h-4 w-4" />}>
                    <input
                      id="first_name"
                      value={form.first_name}
                      onChange={(event) => updateField("first_name", event.target.value)}
                      autoComplete="given-name"
                      required
                      className={inputClassName}
                    />
                  </Field>

                  <Field id="middle_name" label="الاسم الأوسط (اختياري)" icon={<UserRound className="h-4 w-4" />}>
                    <input
                      id="middle_name"
                      value={form.middle_name}
                      onChange={(event) => updateField("middle_name", event.target.value)}
                      autoComplete="additional-name"
                      className={inputClassName}
                    />
                  </Field>

                  <Field id="last_name" label="الاسم الأخير" icon={<UserRound className="h-4 w-4" />}>
                    <input
                      id="last_name"
                      value={form.last_name}
                      onChange={(event) => updateField("last_name", event.target.value)}
                      autoComplete="family-name"
                      required
                      className={inputClassName}
                    />
                  </Field>
                </div>

                <Field id="email" label="البريد الإلكتروني" icon={<Mail className="h-4 w-4" />}>
                  <input
                    id="email"
                    type="email"
                    dir="ltr"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    autoComplete="email"
                    required
                    placeholder="name@example.com"
                    className={inputClassName}
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field id="phone" label="رقم الهاتف" icon={<Phone className="h-4 w-4" />}>
                    <div className="flex items-center gap-2">
                      <span
                        dir="ltr"
                        className="grid h-12 min-w-20 place-items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-emerald-700 select-none dark:border-gray-700 dark:bg-gray-950 dark:text-emerald-400"
                        title="كود الدولة"
                      >
                        +{PHONE_PREFIX}
                      </span>
                      <input
                        id="phone"
                        type="tel"
                        dir="ltr"
                        inputMode="tel"
                        autoComplete="tel-national"
                        pattern="5[0-9]{8}"
                        maxLength={9}
                        required
                        value={form.phone}
                        onChange={(event) => updateField("phone", normalizeSaudiPhoneInput(event.target.value))}
                        placeholder="5xxxxxxxx"
                        className={`${inputClassName} min-w-0 flex-1`}
                      />
                    </div>
                  </Field>

                  <Field id="referral_code" label="كود الإحالة (اختياري)" icon={<ClipboardList className="h-4 w-4" />}>
                    <input
                      id="referral_code"
                      dir="ltr"
                      value={form.referral_code}
                      onChange={(event) => updateField("referral_code", event.target.value.toUpperCase().slice(0, 20))}
                      placeholder="DASM-AB12"
                      className={`${inputClassName} uppercase`}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field id="account_type_display" label="صفة التسجيل" icon={<Store className="h-4 w-4" />}>
                    <div
                      id="account_type_display"
                      className="flex min-h-[48px] items-center rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                    >
                      صاحب متجر
                    </div>
                  </Field>

                  <Field id="area_id" label="المنطقة / المدينة" icon={<MapPin className="h-4 w-4" />} hint={regionsError}>
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <select
                        id="area_id"
                        value={form.area_id}
                        onChange={(event) => handleAreaChange(event.target.value)}
                        disabled={regionsLoading && regions.length === 0}
                        className={`${inputClassName} min-w-0 appearance-none disabled:cursor-wait disabled:opacity-70`}
                      >
                        <option value="">
                          {regionsLoading ? "جار تحميل المناطق..." : "اختر منطقة المملكة"}
                        </option>
                        {regions.map((region) => (
                          <option key={region.id} value={String(region.id)}>
                            {region.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleDetectRegistrationLocation}
                        disabled={busy || regionsLoading || gpsStatus === "locating"}
                        title="تحديد المنطقة والمدينة من الموقع"
                        className="inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-emerald-600/40 bg-emerald-500/10 px-3 text-xs font-extrabold text-emerald-700 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:text-emerald-300"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        {gpsStatus === "locating" ? "جار التحديد..." : "تحديد الموقع"}
                      </button>
                    </div>

                    {gpsLocation && (
                      <div className="mt-2 grid gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-2.5 text-xs sm:grid-cols-2">
                        <div className="flex items-center justify-between gap-3 rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                          <span className="font-medium">المنطقة</span>
                          <span>{gpsLocation.region}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                          <span className="font-medium">المدينة</span>
                          <span>{gpsLocation.city}</span>
                        </div>
                        {gpsLocation.accuracyM !== null && (
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 sm:col-span-2">
                            دقة الموقع تقريباً ±{gpsLocation.accuracyM}م
                          </p>
                        )}
                      </div>
                    )}

                    {gpsError && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{gpsError}</p>}
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    id="company_name"
                    label="اسم المتجر"
                    icon={<Building2 className="h-4 w-4" />}
                  >
                    <input
                      id="company_name"
                      value={form.company_name}
                      onChange={(event) => updateField("company_name", event.target.value)}
                      required
                      className={inputClassName}
                    />
                  </Field>

                  <Field id="commercial_registry" label="السجل التجاري" icon={<ClipboardList className="h-4 w-4" />}>
                    <input
                      id="commercial_registry"
                      dir="ltr"
                      value={form.commercial_registry}
                      onChange={(event) => updateField("commercial_registry", event.target.value.replace(/\s+/g, ""))}
                      required
                      className={inputClassName}
                    />
                  </Field>
                </div>

                <Field id="address" label="عنوان المتجر" icon={<MapPin className="h-4 w-4" />}>
                  <input
                    id="address"
                    value={form.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    required
                    placeholder="مثال: الرياض، حي الياسمين"
                    className={inputClassName}
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field id="password" label="كلمة المرور" icon={<LockKeyhole className="h-4 w-4" />}>
                    <PasswordInput
                      id="password"
                      value={form.password}
                      autoComplete="new-password"
                      show={showPassword}
                      onChange={(value) => updateField("password", value)}
                      onToggle={() => setShowPassword((current) => !current)}
                    />
                  </Field>

                  <Field id="password_confirmation" label="تأكيد كلمة المرور" icon={<LockKeyhole className="h-4 w-4" />}>
                    <PasswordInput
                      id="password_confirmation"
                      value={form.password_confirmation}
                      autoComplete="new-password"
                      show={showPasswordConfirm}
                      onChange={(value) => updateField("password_confirmation", value)}
                      onToggle={() => setShowPasswordConfirm((current) => !current)}
                    />
                  </Field>
                </div>

                {error && (
                  <StatusMessage tone="error" icon={<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}>
                    {error}
                  </StatusMessage>
                )}

                {success && (
                  <StatusMessage tone="success" icon={<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}>
                    {success}
                  </StatusMessage>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#047857] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-[#065f46] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-gray-950"
                >
                  {busy ? "جار إنشاء الحساب..." : "إنشاء الحساب"}
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 placeholder-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function safeInternalReturnUrl(value: string | string[] | undefined, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  return trimmed;
}

function emailHasNonAscii(value: string) {
  return /[^\x00-\x7F]/.test(value);
}

function resolveApiError(error: unknown, fallback: string) {
  if (!isAxiosError<ApiErrorBody>(error)) {
    return fallback;
  }

  const body = error.response?.data;
  if (!body) {
    if (error.code === "ECONNABORTED" || /timeout/i.test(error.message)) {
      return "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.";
    }

    return "تعذر الاتصال بخادم داسم. تحقق من الاتصال وحاول مرة أخرى.";
  }

  if (body.first_error) return body.first_error;

  if (body.errors) {
    for (const field of errorPriority) {
      const first = body.errors[field]?.[0];
      if (first) return first;
    }

    const firstField = Object.keys(body.errors)[0];
    const first = firstField ? body.errors[firstField]?.[0] : undefined;
    if (first) return first;
  }

  if (body.code === "email_domain_typo_suggestion" && body.message) {
    return body.suggested_email ? `${body.message} — ${body.suggested_email}` : body.message;
  }

  if (body.code === "registration_domain_not_allowed" && body.message) {
    return body.manual_registration_url ? `${body.message} — ${body.manual_registration_url}` : body.message;
  }

  return body.message || fallback;
}

function Field({
  id,
  label,
  icon,
  hint,
  children,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="block">
      <label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-gray-400">
        <span className="text-emerald-700 dark:text-emerald-400">{icon}</span>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-5 text-amber-600 dark:text-amber-300">{hint}</p>}
    </div>
  );
}

function PasswordInput({
  id,
  value,
  autoComplete,
  show,
  onChange,
  onToggle,
}: {
  id: string;
  value: string;
  autoComplete: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        dir="ltr"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required
        minLength={8}
        className={`${inputClassName} pl-11`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute left-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function StatusMessage({
  tone,
  icon,
  children,
}: {
  tone: "error" | "success";
  icon: ReactNode;
  children: ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/35 dark:text-emerald-300"
      : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/35 dark:text-red-300";

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${toneClass}`}>
      {icon}
      <span>{children}</span>
    </div>
  );
}

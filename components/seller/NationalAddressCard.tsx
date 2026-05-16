import { useEffect, useState } from "react";
import { MapPin, CheckCircle, Clock, AlertTriangle, Upload } from "lucide-react";
import { sellerApi } from "@/lib/api";

interface AddressData {
  national_address_short: string | null;
  national_address_status: string;
  national_address_doc_url: string | null;
  national_address_rejection_reason: string | null;
  national_address_verified_at: string | null;
}

export function NationalAddressCard() {
  const [data, setData] = useState<AddressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shortCode, setShortCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await sellerApi.getNationalAddress();
      const d = res.data?.data;
      if (d) {
        setData(d);
        setShortCode(d.national_address_short || "");
      }
    } catch {
      /* skip */
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!shortCode.trim()) {
      setError("الرقم المختصر مطلوب");
      return;
    }
    if (!/^[A-Z]{4}\d{4}$/i.test(shortCode.trim())) {
      setError("صيغة الرقم المختصر غير صحيحة — مثال: RAAA1234");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("national_address_short", shortCode.trim().toUpperCase());
      if (file) {
        formData.append("document", file);
      }
      await sellerApi.submitNationalAddress(formData);
      setSuccess("تم الإرسال بنجاح — سيُراجع من الأدمن");
      setFile(null);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? "فشل الإرسال");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />;
  }

  const status = data?.national_address_status || "none";
  const isVerified = status === "verified";
  const isPending = status === "pending";
  const isRejected = status === "rejected";

  return (
    <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40">
          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">العنوان الوطني (سبل)</h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            إلزامي لتفعيل المتجر — يُسجّل مرة واحدة ويظهر في كل منصات داسم
          </p>
        </div>
      </div>

      {/* حالة التحقق */}
      {isVerified && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          <span>العنوان موثّق ✓ — {data?.national_address_short}</span>
        </div>
      )}

      {isPending && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <Clock className="h-4 w-4" />
          <span>قيد المراجعة — {data?.national_address_short}</span>
        </div>
      )}

      {isRejected && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-700 dark:text-red-400 space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>مرفوض — يرجى التصحيح وإعادة الإرسال</span>
          </div>
          {data?.national_address_rejection_reason && (
            <p className="pr-6 text-red-600 dark:text-red-300">{data.national_address_rejection_reason}</p>
          )}
        </div>
      )}

      {/* نموذج الإدخال */}
      {!isVerified && !isPending && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              الرقم المختصر للعنوان الوطني
            </label>
            <input
              type="text"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value.toUpperCase())}
              placeholder="RAAA1234"
              maxLength={8}
              className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 text-left tracking-widest font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              dir="ltr"
            />
            <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
              تجده في تطبيق سبل أو splonline.com.sa — مثال: RAAA1234
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              وثيقة إثبات العنوان (من سبل)
            </label>
            <div className="mt-1 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-xs text-zinc-600 dark:text-zinc-400 hover:border-blue-400 dark:hover:border-blue-600 transition">
                <Upload className="h-4 w-4" />
                {file ? file.name : "اختر ملف (PDF أو صورة)"}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
              اطبع وثيقة العنوان من تطبيق سبل → ملفي → طباعة العنوان
            </p>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && <p className="text-xs text-emerald-600">{success}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {saving ? "جاري الإرسال..." : "إرسال للتوثيق"}
          </button>
        </div>
      )}

      {/* رابط وثيقة العنوان المحفوظة */}
      {data?.national_address_doc_url && (isVerified || isPending) && (
        <a
          href={data.national_address_doc_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          <Upload className="h-3.5 w-3.5" />
          عرض الوثيقة المرفقة
        </a>
      )}
    </div>
  );
}

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
      setError("صيغة غير صحيحة — مثال: RAAA1234");
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
      setSuccess("تم الإرسال — سيُراجع من الأدمن");
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
    return <div className="h-16 bg-emerald-100/40 dark:bg-zinc-800 rounded-xl animate-pulse mx-3" />;
  }

  const status = data?.national_address_status || "none";
  const isVerified = status === "verified";
  const isPending = status === "pending";
  const isRejected = status === "rejected";

  if (isVerified) {
    return (
      <div className="mx-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 px-3 py-2.5">
        <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
          <span>العنوان موثّق</span>
        </div>
        <div className="mt-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-500 tracking-wider pr-5" dir="ltr">
          {data?.national_address_short}
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="mx-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 px-3 py-2.5">
        <div className="flex items-center gap-2 text-[11px] font-medium text-amber-700 dark:text-amber-400">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>قيد المراجعة</span>
        </div>
        <div className="mt-1 font-mono text-[11px] text-amber-600 dark:text-amber-500 tracking-wider pr-5" dir="ltr">
          {data?.national_address_short}
        </div>
        {data?.national_address_doc_url && (
          <a
            href={data.national_address_doc_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Upload className="h-3 w-3" />
            عرض الوثيقة
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="mx-3 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/10 p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">العنوان الوطني</span>
      </div>

      {isRejected && (
        <div className="flex items-start gap-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 px-2 py-1.5 text-[10px] text-red-600 dark:text-red-400">
          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
          <div>
            <span>مرفوض — أعد الإرسال</span>
            {data?.national_address_rejection_reason && (
              <p className="mt-0.5 text-red-500 dark:text-red-300">{data.national_address_rejection_reason}</p>
            )}
          </div>
        </div>
      )}

      <div>
        <input
          type="text"
          value={shortCode}
          onChange={(e) => setShortCode(e.target.value.toUpperCase())}
          placeholder="RAAA1234"
          maxLength={8}
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 text-left tracking-widest font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
          dir="ltr"
        />
      </div>

      <label className="flex items-center gap-1.5 cursor-pointer rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600 bg-white/60 dark:bg-zinc-800/60 px-2.5 py-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 hover:border-blue-400 dark:hover:border-blue-600 transition">
        <Upload className="h-3 w-3 shrink-0" />
        <span className="truncate">{file ? file.name : "وثيقة سبل (PDF/صورة)"}</span>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>

      {error && <p className="text-[10px] text-red-600">{error}</p>}
      {success && <p className="text-[10px] text-emerald-600">{success}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        className="w-full rounded-lg bg-blue-600 text-white py-1.5 text-[11px] font-bold hover:bg-blue-700 disabled:opacity-60 transition"
      >
        {saving ? "جاري الإرسال..." : "إرسال للتوثيق"}
      </button>
    </div>
  );
}

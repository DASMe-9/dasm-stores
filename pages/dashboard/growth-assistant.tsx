import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  BrainCircuit,
  Check,
  Clock3,
  FileSearch,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import {
  growthAssistantApi,
  type GrowthAssistantOverview,
  type GrowthAssistantQuote,
  type GrowthRecommendation,
  type GrowthReviewDecision,
} from "@/lib/growth-assistant-api";

const EMPTY_OVERVIEW: GrowthAssistantOverview = {
  status: "inactive",
  runtime_enabled: false,
  recommendations: [],
};

const REVIEW_LABELS: Record<string, string> = {
  pending: "بانتظار مراجعتك",
  approved_for_manual_use: "معتمدة للاستخدام اليدوي",
  revision_requested: "طُلب تعديلها",
  rejected: "مرفوضة",
};

function errorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;
  const data = error.response?.data as { reason?: string; message?: string } | undefined;
  if (data?.reason?.includes("disabled") || data?.reason?.includes("not active")) {
    return "المساعد غير مفعّل بعد. لن تُرسل أي بيانات إلى مزوّد خارجي.";
  }
  return data?.message || fallback;
}

function formatCost(micros: number, currency: string): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    maximumFractionDigits: 4,
  }).format(micros / 1_000_000);
}

function GrowthAssistantPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<GrowthAssistantOverview>(EMPTY_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [quoting, setQuoting] = useState(false);
  const [running, setRunning] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [quote, setQuote] = useState<GrowthAssistantQuote | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await growthAssistantApi.getOverview();
      setOverview(data);
      setMessage(null);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        await router.replace("/dashboard");
        return;
      }
      setOverview(EMPTY_OVERVIEW);
      setMessage(errorMessage(error, "تعذّر تحميل مساعد النمو. حاول مرة أخرى."));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("stores_token")) {
      void router.replace("/auth/login?returnUrl=/dashboard/growth-assistant");
      return;
    }
    void load();
  }, [load, router]);

  const pendingCount = useMemo(
    () => overview.recommendations.filter((item) => item.review_status === "pending").length,
    [overview.recommendations],
  );

  async function requestQuote() {
    setQuoting(true);
    setMessage(null);
    try {
      const { data } = await growthAssistantApi.getQuote();
      setQuote(data.quote);
    } catch (error) {
      setMessage(errorMessage(error, "تعذّر إعداد تقدير التحليل."));
    } finally {
      setQuoting(false);
    }
  }

  async function confirmRun() {
    if (!quote) return;
    setRunning(true);
    setMessage(null);
    try {
      await growthAssistantApi.run(quote);
      setQuote(null);
      setMessage("اكتمل التحليل. راجع التوصيات قبل اعتماد أي منها.");
      await load();
    } catch (error) {
      setMessage(errorMessage(error, "تعذّر تشغيل التحليل."));
    } finally {
      setRunning(false);
    }
  }

  async function review(id: string, decision: GrowthReviewDecision) {
    setReviewingId(id);
    setMessage(null);
    try {
      await growthAssistantApi.review(id, decision);
      await load();
    } catch (error) {
      setMessage(errorMessage(error, "تعذّر حفظ قرار المراجعة."));
    } finally {
      setReviewingId(null);
    }
  }

  const runtimeReady = overview.status === "available" && overview.runtime_enabled;

  return (
    <>
      <Head>
        <title>مساعد نمو المتجر — متاجر داسم</title>
        <meta
          name="description"
          content="تحليل محكوم لبيانات الكتالوج مع مراجعة بشرية قبل أي استخدام."
        />
      </Head>

      <SellerShell
        title="مساعد نمو المتجر"
        subtitle="توصيات قابلة للمراجعة مبنية على كتالوج متجرك — بلا نشر أو تعديل تلقائي"
        icon={BrainCircuit}
        hasStore
      >
        <main className="mx-auto max-w-6xl space-y-6" dir="rtl">
          <section className="overflow-hidden rounded-[1.75rem] border border-emerald-900/10 bg-[#123c32] text-white shadow-[0_18px_55px_rgba(6,78,59,0.15)] dark:border-emerald-400/10">
            <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.35fr_0.65fr] lg:px-10 lg:py-10">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
                  <ShieldCheck className="h-4 w-4" />
                  تحليل محكوم بحدود داسم
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                    قرار النمو يبقى بيدك.
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-emerald-50/80 sm:text-base">
                    يقرأ المساعد بيانات الكتالوج العامة، ويعرض اقتراحاته مع مصادرها ودرجة الثقة.
                    لا يغيّر منتجاً، ولا ينشر محتوى، ولا يصرف على إعلان.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void requestQuote()}
                    disabled={!runtimeReady || quoting || running}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-black text-[#123c32] transition hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {quoting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {quoting ? "جاري إعداد التقدير…" : "اطلب تحليلاً جديداً"}
                  </button>
                  <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-xs font-semibold text-emerald-50/80">
                    <LockKeyhole className="h-4 w-4" />
                    يتطلب تأكيد التكلفة قبل التشغيل
                  </span>
                </div>
              </div>

              <div className="border-t border-white/15 pt-6 lg:border-r lg:border-t-0 lg:pr-8 lg:pt-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100/65">حالة التشغيل</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${runtimeReady ? "bg-emerald-300" : "bg-amber-300"}`} />
                  <p className="text-xl font-black">{runtimeReady ? "متاح للتحليل" : "غير مفعّل بعد"}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-emerald-50/70">
                  {runtimeReady
                    ? "يمكنك طلب تقدير ثم تأكيد كل تشغيل بنفسك."
                    : "الواجهة جاهزة، لكن الاتصال بالمزوّد مقفول حتى اكتمال الاعتماد الأمني والقانوني."}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Metric label="كل التوصيات" value={overview.recommendations.length} />
                  <Metric label="بانتظارك" value={pendingCount} />
                </div>
              </div>
            </div>
          </section>

          <section aria-label="حدود عمل المساعد" className="grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-800">
            <Boundary icon={FileSearch} title="يفحص" text="بيانات الكتالوج العامة فقط" />
            <Boundary icon={Sparkles} title="يقترح" text="فرصاً مع مصادر ودرجة ثقة" />
            <Boundary icon={BadgeCheck} title="تراجع" text="كل توصية قبل استخدامها" />
            <Boundary icon={Ban} title="لا ينفّذ" text="لا نشر، لا تعديل، لا إنفاق" />
          </section>

          {message ? (
            <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
              {message}
            </div>
          ) : null}

          {quote ? (
            <section className="rounded-2xl border-2 border-[#a8763e]/35 bg-[#fffaf1] p-5 dark:border-amber-700/40 dark:bg-amber-950/20">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300">تأكيد قبل التشغيل</p>
                  <h2 className="mt-1 text-xl font-black text-zinc-950 dark:text-white">
                    الحد المقدر: {formatCost(quote.estimated_cost_micros, quote.currency)}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                    لن يبدأ التحليل حتى تضغط «تأكيد وتشغيل».
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setQuote(null)} className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-bold dark:border-zinc-700">
                    <X className="h-4 w-4" /> إلغاء
                  </button>
                  <button type="button" onClick={() => void confirmRun()} disabled={running} className="inline-flex items-center gap-2 rounded-xl bg-[#123c32] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                    {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
                    {running ? "جاري التحليل…" : "تأكيد وتشغيل"}
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">سجل القرار</p>
                <h2 className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">التوصيات</h2>
              </div>
              <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-bold dark:border-zinc-800 dark:bg-zinc-900">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> تحديث
              </button>
            </div>

            {loading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {[0, 1].map((item) => <div key={item} className="h-56 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />)}
              </div>
            ) : overview.recommendations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <Clock3 className="mx-auto h-8 w-8 text-zinc-400" />
                <h3 className="mt-4 text-lg font-black">لا توجد توصيات بعد</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">
                  ستظهر هنا نتائج التحليل بعد تفعيل القدرة وتشغيلها بموافقتك. لن نعرض بيانات تجريبية على أنها نتائج حقيقية.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {overview.recommendations.map((item) => (
                  <RecommendationCard key={item.id} item={item} busy={reviewingId === item.id} onReview={review} />
                ))}
              </div>
            )}
          </section>
        </main>
      </SellerShell>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3">
      <p className="text-2xl font-black tabular-nums">{value.toLocaleString("ar-SA")}</p>
      <p className="mt-1 text-xs text-emerald-50/65">{label}</p>
    </div>
  );
}

function Boundary({ icon: Icon, title, text }: { icon: typeof FileSearch; title: string; text: string }) {
  return (
    <div className="bg-white p-4 dark:bg-zinc-900">
      <Icon className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
      <p className="mt-3 text-sm font-black">{title}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{text}</p>
    </div>
  );
}

function RecommendationCard({
  item,
  busy,
  onReview,
}: {
  item: GrowthRecommendation;
  busy: boolean;
  onReview: (id: string, decision: GrowthReviewDecision) => Promise<void>;
}) {
  const pending = item.review_status === "pending";
  return (
    <article className="flex min-h-64 flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {REVIEW_LABELS[item.review_status] ?? item.review_status}
        </span>
        <span className="text-xs font-semibold text-zinc-500">الثقة: {item.confidence}</span>
      </div>
      <h3 className="mt-5 text-xl font-black leading-8 text-zinc-950 dark:text-white">{item.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{item.summary}</p>
      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
        <span>{item.sources.length.toLocaleString("ar-SA")} مصدر</span>
        {item.created_at ? <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString("ar-SA")}</time> : null}
      </div>
      {pending ? (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <ReviewButton icon={Check} label="اعتماد يدوي" disabled={busy} onClick={() => void onReview(item.id, "approved_for_manual_use")} tone="positive" />
          <ReviewButton icon={RefreshCw} label="طلب تعديل" disabled={busy} onClick={() => void onReview(item.id, "revision_requested")} />
          <ReviewButton icon={X} label="رفض" disabled={busy} onClick={() => void onReview(item.id, "rejected")} tone="negative" />
        </div>
      ) : null}
    </article>
  );
}

function ReviewButton({
  icon: Icon,
  label,
  disabled,
  onClick,
  tone = "neutral",
}: {
  icon: typeof Check;
  label: string;
  disabled: boolean;
  onClick: () => void;
  tone?: "positive" | "negative" | "neutral";
}) {
  const tones = {
    positive: "border-emerald-200 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/30",
    negative: "border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30",
    neutral: "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800",
  };
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${tones[tone]}`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

export default GrowthAssistantPage;

import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Ban,
  Check,
  Copy,
  KeyRound,
  Link2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";

type SupplierConnection = {
  id: number;
  name: string;
  key_preview: string;
  is_active: boolean;
  last_used_at?: string | null;
  expires_at?: string | null;
  created_at?: string | null;
};

type OneTimeCredentials = {
  api_key: string;
};

function dateLabel(value?: string | null) {
  if (!value) return "لم يُستخدم بعد";
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function SupplierConnectionsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [connections, setConnections] = useState<SupplierConnection[]>([]);
  const [name, setName] = useState("");
  const [credentials, setCredentials] = useState<OneTimeCredentials | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const storeResponse = await sellerApi.getMyStore();
      if (!storeResponse.data?.store) {
        router.replace("/stores/new");
        return;
      }

      const response = await sellerApi.getSupplierConnections();
      setConnections((response.data?.data ?? []) as SupplierConnection[]);
    } catch (error: unknown) {
      const typed = error as { response?: { data?: { message?: string } } };
      setMessage({
        text: typed.response?.data?.message ?? "تعذّر تحميل اتصالات الموردين.",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!localStorage.getItem("stores_token")) {
      router.replace("/auth/login?returnUrl=/dashboard/supplier-connections");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (ready) void load();
  }, [load, ready]);

  async function createConnection(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || saving) return;

    setSaving(true);
    setCredentials(null);
    setMessage(null);
    try {
      const response = await sellerApi.createSupplierConnection({
        name: name.trim(),
      });
      const data = response.data?.data as {
        api_key: string;
      };
      setCredentials({ api_key: data.api_key });
      setName("");
      setMessage({ text: "تم إنشاء الاتصال. انسخ المفتاح الآن قبل مغادرة الصفحة." });
      await load();
    } catch (error: unknown) {
      const typed = error as { response?: { data?: { message?: string } } };
      setMessage({
        text: typed.response?.data?.message ?? "تعذّر إنشاء اتصال المورد.",
        error: true,
      });
    } finally {
      setSaving(false);
    }
  }

  async function copyValue(value: string, field: string) {
    await navigator.clipboard.writeText(value);
    setCopied(field);
    window.setTimeout(() => setCopied(null), 1800);
  }

  async function revoke(connection: SupplierConnection) {
    if (!connection.is_active) return;
    if (!window.confirm(`إلغاء مفتاح «${connection.name}»؟ سيتوقف المورد عن المزامنة فورًا.`)) return;

    setRevokingId(connection.id);
    setMessage(null);
    try {
      await sellerApi.revokeSupplierConnection(connection.id);
      setConnections((current) =>
        current.map((item) =>
          item.id === connection.id ? { ...item, is_active: false } : item,
        ),
      );
      setMessage({ text: "تم إلغاء المفتاح مع الاحتفاظ بسجل الاتصال." });
    } catch (error: unknown) {
      const typed = error as { response?: { data?: { message?: string } } };
      setMessage({
        text: typed.response?.data?.message ?? "تعذّر إلغاء المفتاح.",
        error: true,
      });
    } finally {
      setRevokingId(null);
    }
  }

  if (!ready) return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />;

  return (
    <>
      <Head>
        <title>ربط مورد خارجي — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="ربط مورد خارجي"
        subtitle="أنشئ مفتاحًا مستقلاً لكل شركة دروب شيبنغ لربط منتجاتها ومخزونها بطلبات متجرك."
        icon={Link2}
        hasStore
      >
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            {[
              [KeyRound, "مفتاح مستقل", "كل اتصال معزول عن بقية الموردين والمتاجر."],
              [ShieldCheck, "صلاحيات محدودة", "منتجات ومخزون وطلبات المورد المدفوعة فقط."],
              [Ban, "إلغاء فوري", "يمكنك إيقاف اتصال المورد فورًا مع الاحتفاظ بسجل التدقيق."],
            ].map(([Icon, title, description]) => {
              const CardIcon = Icon as typeof KeyRound;
              return (
                <div key={String(title)} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <CardIcon className="h-6 w-6 text-emerald-600" />
                  <h2 className="mt-3 font-bold text-zinc-900 dark:text-zinc-50">{String(title)}</h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{String(description)}</p>
                </div>
              );
            })}
          </section>

          {message ? (
            <div className={`rounded-xl border px-4 py-3 text-sm ${message.error ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"}`}>
              {message.text}
            </div>
          ) : null}

          {credentials ? (
            <section className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
              <h2 className="font-bold text-amber-950 dark:text-amber-100">بيانات تظهر مرة واحدة</h2>
              <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-200/80">
                سلّمها للمورد عبر قناة آمنة. لن تُعرض بعد تحديث الصفحة.
              </p>
              <CredentialRow
                label="X-API-Key"
                value={credentials.api_key}
                copied={copied === "api_key"}
                onCopy={() => void copyValue(credentials.api_key, "api_key")}
              />
            </section>
          ) : null}

          <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form onSubmit={createConnection} className="h-fit space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">اتصال جديد</h2>
                <p className="mt-1 text-sm text-zinc-500">أنشئ اتصالاً منفصلاً لكل مورد.</p>
              </div>
              <label className="block text-sm font-medium">
                اسم المورد
                <input
                  required
                  maxLength={120}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="مثال: شركة التوريد الأولى"
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-transparent px-3 outline-none focus:border-emerald-500 dark:border-zinc-700"
                />
              </label>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                إنشاء المفتاح
              </button>
            </form>

            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">الاتصالات الحالية</h2>
                <p className="mt-1 text-sm text-zinc-500">يمكن إلغاء أي مفتاح فورًا دون حذف سجله.</p>
              </div>
              {loading ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : connections.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
                  لم تنشئ أي اتصال مورد بعد.
                </div>
              ) : (
                connections.map((connection) => (
                  <article key={connection.id} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{connection.name}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${connection.is_active ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                            {connection.is_active ? "نشط" : "ملغي"}
                          </span>
                        </div>
                        <code className="mt-2 block text-xs text-zinc-500" dir="ltr">{connection.key_preview}</code>
                        <p className="mt-2 text-xs text-zinc-500">آخر استخدام: {dateLabel(connection.last_used_at)}</p>
                      </div>
                      {connection.is_active ? (
                        <button
                          type="button"
                          disabled={revokingId === connection.id}
                          onClick={() => void revoke(connection)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                        >
                          {revokingId === connection.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                          إلغاء المفتاح
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-zinc-950 p-5 text-zinc-100">
            <h2 className="font-bold">نقطة البداية للمورد</h2>
            <pre className="mt-3 overflow-x-auto text-xs leading-6" dir="ltr">
{`Base URL: https://api.dasm.com.sa/api/v1/supplier
Header: X-API-Key: YOUR_KEY

GET  /store
GET  /products
POST /products
PATCH /products/{externalId}/stock
GET  /orders`}
            </pre>
          </section>
        </div>
      </SellerShell>
    </>
  );
}

function CredentialRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-amber-900 dark:text-amber-100">{label}</p>
      <div className="mt-1 flex items-center gap-2 rounded-xl bg-white p-2 dark:bg-zinc-950">
        <code className="min-w-0 flex-1 break-all text-xs" dir="ltr">{value}</code>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "تم النسخ" : "نسخ"}
        </button>
      </div>
    </div>
  );
}

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Truck,
  User,
} from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | string;

type OrderItem = {
  id?: number | string;
  product_id?: number | string | null;
  product_name?: string | null;
  variant_name?: string | null;
  sku?: string | null;
  quantity?: number | string | null;
  unit_price?: number | string | null;
  total_price?: number | string | null;
  image_url?: string | null;
};

type ShippingAddress = {
  name?: string | null;
  phone?: string | null;
  city?: string | null;
  district?: string | null;
  street?: string | null;
  postal_code?: string | null;
  short_address?: string | null;
  [key: string]: unknown;
};

type StoreOrder = {
  id: number;
  order_number: string;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string | null;
  subtotal?: number | string | null;
  shipping_cost?: number | string | null;
  tax_amount?: number | string | null;
  total?: number | string | null;
  seller_amount?: number | string | null;
  platform_commission?: number | string | null;
  shipping_address?: ShippingAddress | null;
  tracking_number?: string | null;
  carrier?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  items?: OrderItem[];
};

type OrdersPagination = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number | null;
  to: number | null;
};

type PaginatorPayload = {
  data?: StoreOrder[];
  current_page?: unknown;
  last_page?: unknown;
  per_page?: unknown;
  total?: unknown;
  from?: unknown;
  to?: unknown;
};

type StorePayload = {
  store?: {
    slug?: string | null;
    name?: string | null;
    name_ar?: string | null;
    status?: string | null;
  } | null;
};

type StatusFilter = "all" | OrderStatus;
type PaymentFilter = "all" | "paid" | "pending" | "failed";

const ORDERS_PER_PAGE = 50;

const statusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: "confirmed", label: "مؤكد" },
  { value: "processing", label: "قيد التجهيز" },
  { value: "shipped", label: "تم الشحن" },
  { value: "delivered", label: "تم التسليم" },
  { value: "cancelled", label: "ملغى" },
];

const statusLabels: Record<OrderStatus, string> = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغى",
};

const statusBadge: Record<OrderStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
  confirmed: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-200",
  processing: "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200",
  shipped: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-200",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200",
  cancelled: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
};

const paymentLabels: Record<string, string> = {
  pending: "بانتظار الدفع",
  paid: "مدفوع",
  failed: "فشل الدفع",
  refunded: "مسترد",
};

const paymentBadge: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200",
  failed: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
  refunded: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
};

const defaultPagination: OrdersPagination = {
  currentPage: 1,
  lastPage: 1,
  perPage: ORDERS_PER_PAGE,
  total: 0,
  from: null,
  to: null,
};

function numberOr(value: unknown, fallback: number): number {
  const next = Number(value);
  return Number.isFinite(next) && next > 0 ? next : fallback;
}

function nullableNumber(value: unknown): number | null {
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

function readPagination(payload: PaginatorPayload | undefined, count: number, requestedPage: number): OrdersPagination {
  return {
    currentPage: numberOr(payload?.current_page, requestedPage),
    lastPage: numberOr(payload?.last_page, 1),
    perPage: numberOr(payload?.per_page, ORDERS_PER_PAGE),
    total: Number.isFinite(Number(payload?.total)) ? Number(payload?.total) : count,
    from: nullableNumber(payload?.from),
    to: nullableNumber(payload?.to),
  };
}

function formatSar(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0);
  return `${Number.isFinite(amount) ? amount.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"} ر.س`;
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function badgeClass(kind: "status" | "payment", value: string): string {
  const map: Record<string, string> = kind === "status" ? statusBadge : paymentBadge;
  return [
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold",
    map[value] ?? "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
  ].join(" ");
}

function getAddressLine(order: StoreOrder): string {
  const address = order.shipping_address ?? {};
  return [
    address.city,
    address.district,
    address.street,
    address.short_address,
    address.postal_code,
  ]
    .filter(Boolean)
    .join(" - ");
}

function getDisplayName(store: StorePayload["store"]): string | undefined {
  return store?.name_ar || store?.name || undefined;
}

export default function DashboardOrdersPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [storeSlug, setStoreSlug] = useState("");
  const [storeName, setStoreName] = useState<string | undefined>();
  const [storeStatus, setStoreStatus] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [pagination, setPagination] = useState<OrdersPagination>(defaultPagination);
  const [form, setForm] = useState({
    status: "confirmed" as OrderStatus,
    tracking_number: "",
    carrier: "",
    notes: "",
  });

  const load = useCallback(
    async (requestedPage = 1, nextStatus = statusFilter, nextPayment = paymentFilter) => {
      setLoading(true);
      setError(null);
      try {
        const storeRes = await sellerApi.getMyStore();
        const storeData = (storeRes.data as StorePayload).store;
        if (!storeData) {
          router.replace("/stores/new");
          return;
        }

        setStoreSlug(storeData.slug || "");
        setStoreName(getDisplayName(storeData));
        setStoreStatus(storeData.status || undefined);

        const params: Record<string, string | number> = {
          page: requestedPage,
          per_page: ORDERS_PER_PAGE,
        };
        if (nextStatus !== "all") params.status = nextStatus;
        if (nextPayment !== "all") params.payment_status = nextPayment;

        const res = await sellerApi.getOrders(params);
        const payload = res.data as PaginatorPayload;
        const nextOrders = payload.data ?? [];
        setOrders(nextOrders);
        setPagination(readPagination(payload, nextOrders.length, requestedPage));

        setSelectedOrder((current) => {
          if (!current) return nextOrders[0] ?? null;
          return nextOrders.find((order) => order.id === current.id) ?? nextOrders[0] ?? null;
        });
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } }; message?: string };
        setError(err.response?.data?.message ?? err.message ?? "تعذر تحميل طلبات المتجر حالياً.");
      } finally {
        setLoading(false);
      }
    },
    [paymentFilter, router, statusFilter],
  );

  useEffect(() => {
    const token = localStorage.getItem("stores_token");
    if (!token) {
      router.replace("/auth/login?returnUrl=/dashboard/orders");
      return;
    }
    setReady(true);
    void load(1);
  }, [load, router]);

  useEffect(() => {
    if (!selectedOrder) return;
    setForm({
      status: selectedOrder.status === "pending" ? "confirmed" : selectedOrder.status,
      tracking_number: selectedOrder.tracking_number ?? "",
      carrier: selectedOrder.carrier ?? "",
      notes: selectedOrder.notes ?? "",
    });
  }, [selectedOrder]);

  const paidCountOnPage = useMemo(
    () => orders.filter((order) => order.payment_status === "paid").length,
    [orders],
  );

  const selectOrder = async (order: StoreOrder) => {
    setSelectedOrder(order);
    setMessage(null);
    try {
      const res = await sellerApi.getOrder(order.id);
      const detailed = (res.data as { order?: StoreOrder }).order;
      if (detailed) setSelectedOrder(detailed);
    } catch {
      // Keep the list payload visible if the detail endpoint is temporarily unavailable.
    }
  };

  const applyFilters = (nextStatus: StatusFilter, nextPayment: PaymentFilter) => {
    setStatusFilter(nextStatus);
    setPaymentFilter(nextPayment);
    setSelectedOrder(null);
    void load(1, nextStatus, nextPayment);
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        status: form.status,
        tracking_number: form.tracking_number.trim() || null,
        carrier: form.carrier.trim() || null,
        notes: form.notes.trim() || null,
      };
      const res = await sellerApi.updateOrderStatus(selectedOrder.id, payload);
      const updated = (res.data as { order?: StoreOrder }).order;
      if (updated) {
        setSelectedOrder(updated);
        setOrders((current) => current.map((order) => (order.id === updated.id ? { ...order, ...updated } : order)));
      }
      setMessage("تم تحديث حالة الطلب.");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? "تعذر تحديث حالة الطلب.");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
        جاري التحميل...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>الطلبات - متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="الطلبات"
        subtitle="متابعة مبيعات المتجر وتحديث مراحل التنفيذ حتى التسليم"
        icon={ClipboardList}
        hasStore
        storeSlug={storeSlug}
        storeName={storeName}
        storeStatus={storeStatus}
        actions={
          <button
            type="button"
            onClick={() => load(pagination.currentPage)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </button>
        }
      >
        <div className="mx-auto max-w-[1600px] space-y-5">
          <section className="grid gap-3 md:grid-cols-3">
            <SummaryCard label="إجمالي الطلبات" value={pagination.total || orders.length} icon={ClipboardList} />
            <SummaryCard label="مدفوعة في هذه الصفحة" value={paidCountOnPage} icon={CreditCard} />
            <SummaryCard label="المعروض حالياً" value={`${pagination.from ?? 0} - ${pagination.to ?? orders.length}`} icon={Package} />
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
              <div className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                <Truck className="h-4 w-4 text-emerald-600" />
                تعرض الصفحة 50 طلباً في كل صفحة، ويمكن فلترتها حسب مرحلة التنفيذ أو حالة الدفع.
              </div>
              <label className="space-y-1">
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">مرحلة التنفيذ</span>
                <select
                  value={statusFilter}
                  onChange={(event) => applyFilters(event.target.value as StatusFilter, paymentFilter)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  <option value="all">كل المراحل</option>
                  <option value="pending">بانتظار التأكيد</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">حالة الدفع</span>
                <select
                  value={paymentFilter}
                  onChange={(event) => applyFilters(statusFilter, event.target.value as PaymentFilter)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  <option value="all">كل حالات الدفع</option>
                  <option value="paid">مدفوعة</option>
                  <option value="pending">بانتظار الدفع</option>
                  <option value="failed">فشل الدفع</option>
                </select>
              </label>
            </div>
          </section>

          {error ? (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {message}
            </div>
          ) : null}

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-28 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
                  <ClipboardList className="mx-auto mb-4 h-14 w-14 text-zinc-300 dark:text-zinc-600" />
                  <p className="text-base font-bold text-zinc-800 dark:text-zinc-100">لا توجد طلبات مطابقة</p>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">غيّر الفلاتر أو انتظر وصول أول عملية شراء.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <button
                    type="button"
                    key={order.id}
                    onClick={() => selectOrder(order)}
                    className={[
                      "w-full rounded-2xl border bg-white p-4 text-right shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:bg-zinc-900 dark:hover:border-emerald-700",
                      selectedOrder?.id === order.id
                        ? "border-emerald-400 ring-2 ring-emerald-500/15 dark:border-emerald-700"
                        : "border-zinc-200 dark:border-zinc-800",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-black text-zinc-950 dark:text-zinc-50" dir="ltr">
                            {order.order_number}
                          </span>
                          <span className={badgeClass("status", order.status)}>
                            {statusLabels[order.status] ?? order.status}
                          </span>
                          <span className={badgeClass("payment", order.payment_status)}>
                            {paymentLabels[order.payment_status] ?? order.payment_status}
                          </span>
                        </div>
                        <div className="grid gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:grid-cols-3">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {order.customer_name || "عميل"}
                          </span>
                          <span className="flex items-center gap-1" dir="ltr">
                            <Phone className="h-3.5 w-3.5" />
                            {order.customer_phone || "-"}
                          </span>
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-start sm:text-left">
                        <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                          {formatSar(order.total)}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {order.items?.length ?? 0} منتج
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}

              {pagination.lastPage > 1 ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-center text-xs text-zinc-500 dark:text-zinc-400 sm:text-start">
                    الصفحة {pagination.currentPage} من {pagination.lastPage} - {pagination.perPage} طلباً في كل صفحة
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => load(pagination.currentPage - 1)}
                      disabled={loading || pagination.currentPage <= 1}
                      className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      السابقة
                    </button>
                    <button
                      type="button"
                      onClick={() => load(pagination.currentPage + 1)}
                      disabled={loading || pagination.currentPage >= pagination.lastPage}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      التالية
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="xl:sticky xl:top-6 xl:self-start">
              <OrderDetails
                order={selectedOrder}
                storeSlug={storeSlug}
                form={form}
                saving={saving}
                onFormChange={setForm}
                onSave={updateOrderStatus}
              />
            </aside>
          </section>
        </div>
      </SellerShell>
    </>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: typeof ClipboardList;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-black text-zinc-950 dark:text-zinc-50">{value}</div>
      <div className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</div>
    </div>
  );
}

function OrderDetails({
  order,
  storeSlug,
  form,
  saving,
  onFormChange,
  onSave,
}: {
  order: StoreOrder | null;
  storeSlug: string;
  form: {
    status: OrderStatus;
    tracking_number: string;
    carrier: string;
    notes: string;
  };
  saving: boolean;
  onFormChange: (next: {
    status: OrderStatus;
    tracking_number: string;
    carrier: string;
    notes: string;
  }) => void;
  onSave: () => void;
}) {
  if (!order) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <ClipboardList className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">اختر طلباً لعرض تفاصيله</p>
      </div>
    );
  }

  const addressLine = getAddressLine(order);
  const trackHref = storeSlug && order.order_number ? `/${storeSlug}/track/${encodeURIComponent(order.order_number)}` : "";

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-mono text-base font-black text-zinc-950 dark:text-zinc-50" dir="ltr">
            {order.order_number}
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{formatDate(order.created_at)}</p>
        </div>
        <span className={badgeClass("payment", order.payment_status)}>
          {paymentLabels[order.payment_status] ?? order.payment_status}
        </span>
      </div>

      {trackHref ? (
        <Link
          href={trackHref}
          target="_blank"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <ExternalLink className="h-4 w-4" />
          فتح رابط تتبع العميل
        </Link>
      ) : null}

      <div className="grid gap-2 text-sm">
        <InfoLine icon={User} label="العميل" value={order.customer_name || "-"} />
        <InfoLine icon={Phone} label="الجوال" value={order.customer_phone || "-"} ltr />
        <InfoLine icon={MapPin} label="العنوان" value={addressLine || "-"} />
        <InfoLine icon={CreditCard} label="طريقة الدفع" value={order.payment_method || "-"} />
      </div>

      <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
        <h3 className="mb-3 text-sm font-black text-zinc-950 dark:text-zinc-50">المنتجات</h3>
        <div className="space-y-2">
          {(order.items ?? []).length > 0 ? (
            order.items?.map((item, index) => (
              <div key={item.id ?? index} className="flex items-center gap-3 rounded-lg bg-white p-2 dark:bg-zinc-900">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.product_name ?? "منتج"}
                    width={48}
                    height={48}
                    unoptimized
                    className="h-12 w-12 rounded-lg bg-zinc-100 object-cover dark:bg-zinc-800"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <Package className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {item.product_name || "منتج"}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    الكمية {item.quantity ?? 1} - {formatSar(item.total_price)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">لا توجد عناصر مفصلة لهذا الطلب.</p>
          )}
        </div>
      </div>

      <div className="grid gap-2 rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800">
        <AmountLine label="المجموع" value={order.subtotal} />
        <AmountLine label="الشحن" value={order.shipping_cost} />
        <AmountLine label="الضريبة" value={order.tax_amount} />
        <div className="mt-1 flex items-center justify-between border-t border-zinc-200 pt-2 text-base font-black dark:border-zinc-800">
          <span>الإجمالي</span>
          <span className="text-emerald-700 dark:text-emerald-400">{formatSar(order.total)}</span>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
        <h3 className="text-sm font-black text-zinc-950 dark:text-zinc-50">تحديث التنفيذ</h3>
        <label className="space-y-1">
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">المرحلة</span>
          <select
            value={form.status}
            onChange={(event) => onFormChange({ ...form, status: event.target.value as OrderStatus })}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">شركة الشحن</span>
            <input
              value={form.carrier}
              onChange={(event) => onFormChange({ ...form, carrier: event.target.value })}
              placeholder="مثال: سمسا"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">رقم التتبع</span>
            <input
              value={form.tracking_number}
              onChange={(event) => onFormChange({ ...form, tracking_number: event.target.value })}
              placeholder="اختياري"
              dir="ltr"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>
        </div>

        <label className="space-y-1">
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">ملاحظات داخلية</span>
          <textarea
            value={form.notes}
            onChange={(event) => onFormChange({ ...form, notes: event.target.value })}
            rows={3}
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
          {saving ? "جاري الحفظ..." : "حفظ حالة الطلب"}
        </button>
      </div>
    </div>
  );
}

function InfoLine({
  icon: Icon,
  label,
  value,
  ltr,
}: {
  icon: typeof User;
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-950">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
      <div className="min-w-0">
        <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">{label}</div>
        <div className="break-words text-sm font-semibold text-zinc-900 dark:text-zinc-100" dir={ltr ? "ltr" : undefined}>
          {value}
        </div>
      </div>
    </div>
  );
}

function AmountLine({ label, value }: { label: string; value: number | string | null | undefined }) {
  return (
    <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300">
      <span>{label}</span>
      <span>{formatSar(value)}</span>
    </div>
  );
}

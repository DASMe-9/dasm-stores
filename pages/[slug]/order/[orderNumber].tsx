import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState } from "react";
import { checkoutApi } from "@/lib/api";
import {
  CheckCircle, XCircle, Clock, Package, Truck,
  ArrowRight, Copy, Check, Landmark, CreditCard, Loader2,
} from "lucide-react";
import Link from "next/link";

interface OrderData {
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  tracking_number: string | null;
  carrier: string | null;
  total: number;
  created_at: string;
}

interface OrderItem {
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url: string | null;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending:    { label: "بانتظار الدفع", color: "text-amber-600 bg-amber-50", icon: Clock },
  confirmed:  { label: "تم التأكيد", color: "text-blue-600 bg-blue-50", icon: CheckCircle },
  processing: { label: "قيد التجهيز", color: "text-blue-600 bg-blue-50", icon: Package },
  shipped:    { label: "تم الشحن", color: "text-purple-600 bg-purple-50", icon: Truck },
  delivered:  { label: "تم التوصيل", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
  cancelled:  { label: "ملغي", color: "text-red-600 bg-red-50", icon: XCircle },
};

const PAYMENT_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "بانتظار الدفع", color: "text-amber-600" },
  paid:    { label: "مدفوع", color: "text-emerald-600" },
  failed:  { label: "فشل الدفع", color: "text-red-600" },
};

export default function OrderPage() {
  const router = useRouter();
  const { slug, orderNumber } = router.query;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);
  const [bankInfo, setBankInfo] = useState<{ iban: string; beneficiary: string } | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    if (!slug || !orderNumber) return;
    loadOrder();
  }, [slug, orderNumber]);

  const loadOrder = async () => {
    try {
      const { data } = await checkoutApi.trackOrder(slug as string, orderNumber as string);
      setOrder(data.order);
      setItems(data.items || []);
      if (data.bank_info) setBankInfo(data.bank_info);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayNow = async () => {
    if (!slug || !order) return;
    setPaying(true);
    setPayError("");
    try {
      const { data } = await checkoutApi.retryPayment(slug as string, order.order_number);
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        setPayError("لم نتمكن من إنشاء رابط الدفع — تواصل مع المتجر");
      }
    } catch {
      setPayError("حدث خطأ أثناء إنشاء جلسة الدفع");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
        جاري تحميل الطلب...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 rtl">
        <div className="text-center space-y-3">
          <XCircle className="w-16 h-16 text-gray-200 mx-auto" />
          <h1 className="text-xl font-bold text-gray-600">الطلب غير موجود</h1>
          <p className="text-sm text-gray-400">تأكد من رقم الطلب أو تواصل مع المتجر</p>
          <Link href={`/${slug}`} className="text-emerald-600 text-sm hover:underline">
            العودة للمتجر
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const paymentInfo = PAYMENT_MAP[order.payment_status] || PAYMENT_MAP.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <Head>
        <title>طلب {order.order_number} — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 rtl">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <Link href={`/${slug}`} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-sm font-bold text-gray-900">تفاصيل الطلب</h1>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {/* حالة الدفع — الأهم */}
          {order.payment_status === "paid" && (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
              <CheckCircle className="w-10 h-10 text-emerald-600 shrink-0" />
              <div>
                <h2 className="font-bold text-emerald-900">تم الدفع بنجاح!</h2>
                <p className="text-sm text-emerald-700 mt-0.5">شكراً لك — سيتواصل معك التاجر قريباً</p>
              </div>
            </div>
          )}

          {order.payment_status === "failed" && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-10 h-10 text-red-500 shrink-0" />
                <div>
                  <h2 className="font-bold text-red-900">فشل الدفع</h2>
                  <p className="text-sm text-red-700 mt-0.5">يرجى المحاولة مجدداً أو التواصل مع المتجر</p>
                </div>
              </div>
              <button
                onClick={handlePayNow}
                disabled={paying}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {paying ? "جاري التحويل لصفحة الدفع..." : "أعد المحاولة — ادفع الآن"}
              </button>
              {payError && <p className="text-sm text-red-600 text-center">{payError}</p>}
            </div>
          )}

          {order.payment_status === "pending" && !bankInfo && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-10 h-10 text-amber-600 shrink-0" />
                <div>
                  <h2 className="font-bold text-amber-900">بانتظار الدفع</h2>
                  <p className="text-sm text-amber-700 mt-0.5">لم يتم الدفع بعد — أكمل عملية الدفع لتأكيد الطلب</p>
                </div>
              </div>
              <button
                onClick={handlePayNow}
                disabled={paying}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {paying ? "جاري التحويل لصفحة الدفع..." : "ادفع الآن"}
              </button>
              {payError && <p className="text-sm text-red-600 text-center">{payError}</p>}
            </div>
          )}

          {bankInfo && order.payment_status === "pending" && (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Landmark className="w-8 h-8 text-amber-600 shrink-0" />
                <div>
                  <h2 className="font-bold text-amber-900">حوّل المبلغ لإتمام الطلب</h2>
                  <p className="text-sm text-amber-700 mt-0.5">
                    حوّل <strong>{Number(order.total).toFixed(2)} ر.س</strong> عبر سريع (SARIE) للحساب التالي
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 space-y-3 border border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">رقم IBAN</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(bankInfo.iban);
                      setCopiedIban(true);
                      setTimeout(() => setCopiedIban(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-sm font-mono font-bold text-gray-900 hover:text-emerald-600"
                  >
                    {bankInfo.iban}
                    {copiedIban ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {bankInfo.beneficiary && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">اسم المستفيد</span>
                    <span className="text-sm font-semibold text-gray-900">{bankInfo.beneficiary}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">المبلغ المطلوب</span>
                  <span className="text-sm font-bold text-emerald-600">{Number(order.total).toFixed(2)} ر.س</span>
                </div>
              </div>

              <p className="text-xs text-amber-700 leading-relaxed">
                بعد التحويل سيتأكد التاجر من استلام المبلغ ويُحدّث حالة الطلب.
                احتفظ برقم الطلب <strong>{order.order_number}</strong> كمرجع.
              </p>
            </div>
          )}

          {/* رقم الطلب */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">رقم الطلب</span>
              <button
                onClick={copyOrderNumber}
                className="flex items-center gap-1.5 text-sm font-mono font-bold text-gray-900 hover:text-emerald-600"
              >
                {order.order_number}
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">حالة الطلب</span>
              <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full ${statusInfo.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusInfo.label}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">حالة الدفع</span>
              <span className={`text-sm font-semibold ${paymentInfo.color}`}>{paymentInfo.label}</span>
            </div>

            {order.tracking_number && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">رقم التتبع</span>
                <span className="text-sm font-mono text-gray-900">{order.tracking_number}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">التاريخ</span>
              <span className="text-sm text-gray-700">
                {new Date(order.created_at).toLocaleDateString("ar-SA", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* بنود الطلب */}
          {items.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <h3 className="text-sm font-bold text-gray-900">المنتجات</h3>
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product_name}</p>
                    {item.variant_name && (
                      <p className="text-xs text-gray-400">{item.variant_name}</p>
                    )}
                    <p className="text-xs text-gray-500">{item.quantity} × {Number(item.unit_price).toFixed(0)} ر.س</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{Number(item.total_price).toFixed(0)} ر.س</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-900">الإجمالي</span>
                <span className="text-base font-bold text-emerald-600">{Number(order.total).toFixed(2)} ر.س</span>
              </div>
            </div>
          )}

          <Link
            href={`/${slug}`}
            className="block w-full text-center py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm"
          >
            العودة للمتجر
          </Link>
        </main>
      </div>
    </>
  );
}

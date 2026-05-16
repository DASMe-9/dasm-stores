import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState } from "react";
import { publicApi, checkoutApi } from "@/lib/api";
import {
  ShoppingCart, Trash2, Minus, Plus, ArrowRight,
  CreditCard, Truck, MapPin, Loader2, Package,
} from "lucide-react";
import Link from "next/link";
import { PaymentLogos } from "@/components/shared/PaymentLogos";

interface CartItem {
  productId: number;
  variantId?: number;
  qty: number;
}

interface ShippingRate {
  id: string;
  provider: string;
  service_name: string;
  total_price: number;
  carrier_price: number;
  platform_fee: number;
  estimated_delivery?: string;
  estimated_days?: number;
  logo?: string;
  currency: string;
  type: string;
}

export default function CartPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // بيانات العميل
  const [form, setForm] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dasm_checkout_form");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      shipping_address: { city: "", street: "", zip: "" },
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem("dasm_checkout_form", JSON.stringify(form));
    } catch {}
  }, [form]);

  // الشحن
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [citySearched, setCitySearched] = useState("");

  useEffect(() => {
    if (!slug) return;
    const saved = localStorage.getItem(`cart_${slug}`);
    if (saved) {
      const items = JSON.parse(saved);
      setCart(items);
      loadProductDetails(items);
    } else {
      setLoading(false);
    }
  }, [slug]);

  const loadProductDetails = async (items: CartItem[]) => {
    try {
      const params: Record<string, string> = {};
      const token = typeof window !== "undefined" ? localStorage.getItem("stores_token") : null;
      if (token) params.preview = "true";
      const map: Record<number, any> = {};
      for (const item of items) {
        const { data } = await publicApi.getProduct(slug as string, item.productId, params);
        map[item.productId] = data.product;
      }
      setProducts(map);
    } catch {
      /* skip */
    } finally {
      setLoading(false);
    }
  };

  const updateQty = (productId: number, delta: number) => {
    const updated = cart
      .map((c) => (c.productId === productId ? { ...c, qty: Math.max(0, c.qty + delta) } : c))
      .filter((c) => c.qty > 0);
    setCart(updated);
    localStorage.setItem(`cart_${slug}`, JSON.stringify(updated));
  };

  const removeItem = (productId: number) => {
    const updated = cart.filter((c) => c.productId !== productId);
    setCart(updated);
    localStorage.setItem(`cart_${slug}`, JSON.stringify(updated));
  };

  // حساب الوزن الكلي للسلة
  const totalWeight = cart.reduce((sum, item) => {
    const p = products[item.productId];
    return sum + (p?.weight ? Number(p.weight) * item.qty : 0.5 * item.qty);
  }, 0);

  // جلب أسعار الشحن
  const fetchShippingRates = async () => {
    const city = form.shipping_address.city.trim();
    if (!city) return;
    if (city === citySearched && shippingRates.length > 0) return;

    setLoadingRates(true);
    setRatesError(null);
    setSelectedRate(null);
    setShippingRates([]);

    try {
      const { data } = await publicApi.getShippingRates(slug as string, {
        destination_city: city,
        weight_kg: totalWeight || 1,
      });
      const rates = data.rates || [];
      setShippingRates(rates);
      if (rates.length === 1) setSelectedRate(rates[0]);
      setCitySearched(city);
    } catch (err: any) {
      const msg = err.response?.data?.message || "تعذّر جلب أسعار الشحن";
      setRatesError(msg);
    } finally {
      setLoadingRates(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => {
    const p = products[item.productId];
    return sum + (p ? Number(p.price) * item.qty : 0);
  }, 0);
  const shippingCost = selectedRate?.total_price ?? 0;
  const vat = subtotal * 0.15;
  const total = subtotal + vat + shippingCost;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRate) {
      alert("اختر طريقة الشحن أولاً");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await checkoutApi.createOrder(slug as string, {
        ...form,
        items: cart.map((c) => ({
          product_id: c.productId,
          variant_id: c.variantId,
          quantity: c.qty,
        })),
        shipping_rate_id: selectedRate.id,
        shipping_cost: selectedRate.total_price,
        delivery_option_id: selectedRate.type === "tryoto"
          ? parseInt(selectedRate.id.replace("oto_", ""))
          : undefined,
      });

      localStorage.removeItem(`cart_${slug}`);

      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        router.push(`/${slug}/order/${data.order.order_number}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">جاري التحميل...</div>;
  }

  return (
    <>
      <Head>
        <title>إتمام الطلب — متاجر داسم</title>
      </Head>
      <div className="min-h-screen bg-gray-50 rtl">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <Link href={`/${slug}`} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </Link>
          <ShoppingCart className="w-5 h-5 text-emerald-600" />
          <h1 className="text-sm font-bold text-gray-900">إتمام الطلب ({cart.length})</h1>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">السلة فارغة</p>
              <Link
                href={`/${slug}`}
                className="px-6 py-2 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700"
              >
                تصفح المنتجات
              </Link>
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="space-y-6">
              {/* 1. المنتجات */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  المنتجات
                </h2>
                {cart.map((item) => {
                  const p = products[item.productId];
                  if (!p) return null;
                  return (
                    <div key={item.productId} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {p.primary_image?.url ? (
                          <img src={p.primary_image.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{p.name}</h3>
                        <p className="text-sm font-bold text-emerald-600 mt-0.5">{Number(p.price).toFixed(0)} ر.س</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <button type="button" onClick={() => updateQty(item.productId, -1)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                          <button type="button" onClick={() => updateQty(item.productId, 1)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button type="button" onClick={() => removeItem(item.productId)} className="p-1 text-gray-300 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold text-gray-900">
                          {(Number(p.price) * item.qty).toFixed(0)} ر.س
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. بيانات الشحن */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  بيانات التوصيل
                </h2>
                <input
                  required
                  placeholder="الاسم الكامل"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <input
                  required
                  type="tel"
                  placeholder="رقم الجوال"
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني (اختياري)"
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    required
                    placeholder="المدينة (مثال: الرياض)"
                    value={form.shipping_address.city}
                    onChange={(e) => {
                      setForm({ ...form, shipping_address: { ...form.shipping_address, city: e.target.value } });
                      if (e.target.value !== citySearched) {
                        setSelectedRate(null);
                        setShippingRates([]);
                      }
                    }}
                    onBlur={fetchShippingRates}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={fetchShippingRates}
                    disabled={loadingRates || !form.shipping_address.city.trim()}
                    className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {loadingRates ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                    حساب الشحن
                  </button>
                </div>
                <input
                  required
                  placeholder="العنوان / الحي / الشارع"
                  value={form.shipping_address.street}
                  onChange={(e) => setForm({ ...form, shipping_address: { ...form.shipping_address, street: e.target.value } })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* 3. خيارات الشحن */}
              {(shippingRates.length > 0 || loadingRates || ratesError) && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    طريقة الشحن
                  </h2>

                  {loadingRates && (
                    <div className="flex items-center justify-center gap-2 py-6 text-gray-400 text-sm">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري البحث عن أفضل سعر شحن...
                    </div>
                  )}

                  {ratesError && (
                    <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{ratesError}</div>
                  )}

                  {shippingRates.map((rate) => (
                    <label
                      key={rate.id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition ${
                        selectedRate?.id === rate.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping_rate"
                        checked={selectedRate?.id === rate.id}
                        onChange={() => setSelectedRate(rate)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedRate?.id === rate.id ? "border-emerald-500" : "border-gray-300"
                      }`}>
                        {selectedRate?.id === rate.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      {rate.logo && (
                        <img src={rate.logo} alt="" className="w-8 h-8 object-contain shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{rate.service_name || rate.provider}</p>
                        {(rate.estimated_delivery || rate.estimated_days) && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {rate.estimated_delivery || `${rate.estimated_days} أيام عمل`}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-emerald-600 shrink-0">
                        {rate.total_price.toFixed(0)} ر.س
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* 4. ملخص الطلب */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>المجموع الفرعي</span>
                  <span>{subtotal.toFixed(2)} ر.س</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>الشحن</span>
                    <span>{shippingCost.toFixed(2)} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>ضريبة القيمة المضافة (15%)</span>
                  <span>{vat.toFixed(2)} ر.س</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>الإجمالي</span>
                  <span>{total.toFixed(2)} ر.س</span>
                </div>
              </div>

              {/* 5. زر الدفع */}
              <button
                type="submit"
                disabled={submitting || !selectedRate}
                className="w-full py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري إنشاء الطلب...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    {selectedRate ? `ادفع ${total.toFixed(2)} ر.س` : "اختر طريقة الشحن أولاً"}
                  </>
                )}
              </button>

              <PaymentLogos className="mt-4" />
            </form>
          )}
        </main>
      </div>
    </>
  );
}

import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState } from "react";
import { publicApi, checkoutApi } from "@/lib/api";
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";

interface CartItem {
  productId: number;
  variantId?: number;
  qty: number;
  product?: any;
}

export default function CartPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: { city: "", street: "", zip: "" },
  });

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
      const map: Record<number, any> = {};
      for (const item of items) {
        const { data } = await publicApi.getProduct(slug as string, item.productId);
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

  const subtotal = cart.reduce((sum, item) => {
    const p = products[item.productId];
    return sum + (p ? Number(p.price) * item.qty : 0);
  }, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await checkoutApi.createOrder(slug as string, {
        ...form,
        items: cart.map((c) => ({
          product_id: c.productId,
          variant_id: c.variantId,
          quantity: c.qty,
        })),
      });

      // حذف السلة
      localStorage.removeItem(`cart_${slug}`);

      // لو فيه رابط دفع → وجّه المشتري
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        router.push(`/store/${slug}/order/${data.order.order_number}`);
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
        <title>السلة — متاجر داسم</title>
      </Head>
      <div className="min-h-screen bg-gray-50 rtl">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <Link href={`/store/${slug}`} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </Link>
          <ShoppingCart className="w-5 h-5 text-emerald-600" />
          <h1 className="text-sm font-bold text-gray-900">سلة التسوق ({cart.length})</h1>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">السلة فارغة</p>
              <Link
                href={`/store/${slug}`}
                className="px-6 py-2 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700"
              >
                تصفح المنتجات
              </Link>
            </div>
          ) : (
            <>
              {/* العناصر */}
              <div className="space-y-3">
                {cart.map((item) => {
                  const p = products[item.productId];
                  if (!p) return null;
                  return (
                    <div key={item.productId} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {p.primary_image?.url ? (
                          <img src={p.primary_image.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{p.name}</h3>
                        <p className="text-sm font-bold text-emerald-600 mt-1">{Number(p.price).toFixed(0)} ر.س</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => updateQty(item.productId, -1)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.productId, 1)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button onClick={() => removeItem(item.productId)} className="p-1 text-gray-300 hover:text-red-500">
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

              {/* الملخص */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>المجموع الفرعي</span>
                  <span>{subtotal.toFixed(2)} ر.س</span>
                </div>
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

              {/* Checkout */}
              {!checkoutMode ? (
                <button
                  onClick={() => setCheckoutMode(true)}
                  className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  إتمام الطلب
                </button>
              ) : (
                <form onSubmit={handleCheckout} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                  <h2 className="font-bold text-gray-900 text-sm">بيانات الشحن</h2>
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
                  <input
                    required
                    placeholder="المدينة"
                    value={form.shipping_address.city}
                    onChange={(e) => setForm({ ...form, shipping_address: { ...form.shipping_address, city: e.target.value } })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <input
                    required
                    placeholder="العنوان / الشارع"
                    value={form.shipping_address.street}
                    onChange={(e) => setForm({ ...form, shipping_address: { ...form.shipping_address, street: e.target.value } })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition disabled:opacity-60"
                  >
                    {submitting ? "جاري إنشاء الطلب..." : `ادفع ${total.toFixed(2)} ر.س`}
                  </button>
                </form>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

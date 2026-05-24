import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Minus, Plus, Search, ShoppingCart, Trash2, Webhook } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";

type PosVariant = {
  id: number;
  name: string;
  price?: number | string | null;
  stock_quantity?: number | null;
};

type PosProduct = {
  id: number;
  name: string;
  sku?: string | null;
  price: number | string;
  track_stock?: boolean;
  stock_quantity?: number | null;
  image_url?: string | null;
  variants?: PosVariant[];
};

type CartLine = {
  key: string;
  productId: number;
  variantId?: number;
  name: string;
  unitPrice: number;
  quantity: number;
  trackStock: boolean;
  stockAvailable: number | null;
};

function lineKey(productId: number, variantId?: number) {
  return variantId ? `${productId}:${variantId}` : String(productId);
}

type PosIntegration = {
  provider?: string;
  is_enabled?: boolean;
  secret_prefix?: string | null;
  label?: string | null;
  last_used_at?: string | null;
  webhook_url?: string;
  has_secret?: boolean;
};

function DashboardPosPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [lastOrder, setLastOrder] = useState<string | null>(null);
  const [integration, setIntegration] = useState<PosIntegration | null>(null);
  const [plainSecret, setPlainSecret] = useState<string | null>(null);
  const [integrationBusy, setIntegrationBusy] = useState(false);

  const loadIntegration = useCallback(async () => {
    try {
      const res = await sellerApi.getPosIntegration();
      const row = (res.data as { integration?: PosIntegration | null }).integration ?? null;
      setIntegration(row);
    } catch {
      setIntegration(null);
    }
  }, []);

  const loadProducts = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const res = await sellerApi.searchPosProducts(q ? { q } : undefined);
      const list = (res.data as { products?: PosProduct[] }).products ?? [];
      setProducts(list);
    } catch {
      setFlash("تعذّر تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("stores_token");
    if (!token) {
      router.replace("/auth/login?returnUrl=/dashboard/pos");
      return;
    }
    void loadProducts();
    void loadIntegration();
  }, [loadProducts, loadIntegration, router]);

  useEffect(() => {
    const t = setTimeout(() => void loadProducts(query.trim() || undefined), 300);
    return () => clearTimeout(t);
  }, [query, loadProducts]);

  const total = useMemo(
    () => cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [cart],
  );

  function addToCart(product: PosProduct, variant?: PosVariant) {
    const unitPrice = Number(variant?.price ?? product.price);
    const variantId = variant?.id;
    const key = lineKey(product.id, variantId);
    const stockAvailable =
      product.track_stock
        ? variant?.stock_quantity ?? product.stock_quantity ?? null
        : null;

    setCart((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        const nextQty = existing.quantity + 1;
        if (stockAvailable !== null && nextQty > stockAvailable) {
          setFlash(`الكمية المتاحة: ${stockAvailable}`);
          return prev;
        }
        return prev.map((l) => (l.key === key ? { ...l, quantity: nextQty } : l));
      }
      if (stockAvailable !== null && stockAvailable < 1) {
        setFlash("المنتج غير متوفر في المخزون");
        return prev;
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          variantId,
          name: variant ? `${product.name} — ${variant.name}` : product.name,
          unitPrice,
          quantity: 1,
          trackStock: Boolean(product.track_stock),
          stockAvailable,
        },
      ];
    });
    setFlash(null);
    setLastOrder(null);
  }

  function updateQty(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((line) => {
          if (line.key !== key) return line;
          const next = line.quantity + delta;
          if (next < 1) return null;
          if (line.stockAvailable !== null && next > line.stockAvailable) {
            setFlash(`الكمية المتاحة: ${line.stockAvailable}`);
            return line;
          }
          return { ...line, quantity: next };
        })
        .filter(Boolean) as CartLine[],
    );
  }

  async function completeSale() {
    if (cart.length === 0) return;
    setBusy(true);
    setFlash(null);
    try {
      const res = await sellerApi.recordPosSale({
        payment_method: paymentMethod,
        items: cart.map((line) => ({
          product_id: line.productId,
          variant_id: line.variantId,
          quantity: line.quantity,
        })),
      });
      const orderNumber = (res.data as { order?: { order_number?: string } }).order?.order_number;
      setLastOrder(orderNumber ?? null);
      setCart([]);
      setFlash(orderNumber ? `تم البيع — رقم الطلب ${orderNumber}` : "تم تسجيل البيع");
      void loadProducts(query.trim() || undefined);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
          ?.response?.data?.errors?.items?.[0] ??
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "تعذّر إتمام البيع";
      setFlash(String(msg));
    } finally {
      setBusy(false);
    }
  }

  async function regenerateIntegration() {
    if (!window.confirm("إنشاء مفتاح جديد؟ المفتاح الحالي سيتوقف عن العمل.")) return;
    setIntegrationBusy(true);
    setPlainSecret(null);
    try {
      const res = await sellerApi.regeneratePosIntegration({
        provider: integration?.provider ?? "generic",
        label: integration?.label ?? undefined,
      });
      const payload = res.data as { integration?: PosIntegration; plain_secret?: string };
      setIntegration(payload.integration ?? null);
      setPlainSecret(payload.plain_secret ?? null);
      setFlash("تم إنشاء مفتاح POS خارجي — انسخه الآن");
    } catch {
      setFlash("تعذّر إنشاء المفتاح");
    } finally {
      setIntegrationBusy(false);
    }
  }

  async function toggleIntegration(enabled: boolean) {
    setIntegrationBusy(true);
    try {
      const res = await sellerApi.updatePosIntegration({ is_enabled: enabled });
      setIntegration((res.data as { integration?: PosIntegration }).integration ?? null);
    } catch {
      setFlash("تعذّر تحديث الإعداد");
    } finally {
      setIntegrationBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>نقطة البيع — متاجر داسم</title>
      </Head>
      <SellerShell
        title="نقطة البيع"
        subtitle="بيع سريع من المعرض — يخصم المخزون ويُسجّل الطلب"
        icon={ShoppingCart}
        hasStore
      >
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3 space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث بالاسم أو SKU…"
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 ps-10 pe-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            {loading ? (
              <p className="text-sm text-zinc-500">جاري التحميل…</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {products.map((product) => (
                  <li
                    key={product.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">{product.name}</p>
                    <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                      {Number(product.price).toFixed(0)} ر.س
                      {product.track_stock && product.stock_quantity != null ? (
                        <span className="ms-2 text-zinc-500">مخزون: {product.stock_quantity}</span>
                      ) : null}
                    </p>
                    {product.variants && product.variants.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.variants.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => addToCart(product, v)}
                            className="rounded-lg border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="mt-3 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        أضف
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">السلة</h2>
            {flash ? (
              <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                {flash}
              </p>
            ) : null}
            {cart.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">لا توجد بنود بعد</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {cart.map((line) => (
                  <li key={line.key} className="flex items-start justify-between gap-2 text-sm">
                    <div>
                      <p className="font-medium">{line.name}</p>
                      <p className="text-zinc-500">{line.unitPrice.toFixed(0)} ر.س × {line.quantity}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => updateQty(line.key, -1)} className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[1.5rem] text-center">{line.quantity}</span>
                      <button type="button" onClick={() => updateQty(line.key, 1)} className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => setCart((c) => c.filter((l) => l.key !== line.key))} className="rounded p-1 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <p className="flex justify-between text-sm font-bold">
                <span>الإجمالي (بدون ضريبة)</span>
                <span>{total.toFixed(2)} ر.س</span>
              </p>
              <p className="mt-1 text-xs text-zinc-500">يُضاف 15% VAT في الطلب</p>
            </div>

            <div className="mt-4 flex gap-2">
              {(["cash", "card"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`flex-1 rounded-xl border py-2 text-xs font-semibold ${
                    paymentMethod === m
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40"
                      : "border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {m === "cash" ? "نقداً" : "بطاقة"}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={busy || cart.length === 0}
              onClick={() => void completeSale()}
              className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {busy ? "جاري التسجيل…" : "إتمام البيع"}
            </button>

            {lastOrder ? (
              <p className="mt-3 text-center font-mono text-xs text-zinc-600 dark:text-zinc-400">{lastOrder}</p>
            ) : null}
          </aside>
        </div>

        <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start gap-3">
            <Webhook className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">POS خارجي (M5.1)</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                اربط كاشير Zid أو Foodics أو أي نظام يرسل مبيعات عبر HTTP — يخصم المخزون مثل POS داسم.
              </p>

              {integration?.webhook_url ? (
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-zinc-500">Webhook URL</p>
                    <code className="mt-1 block break-all rounded-lg bg-zinc-100 px-3 py-2 text-xs dark:bg-zinc-800">
                      {integration.webhook_url}
                    </code>
                  </div>
                  <p className="text-xs text-zinc-500">
                    المفتاح: {integration.has_secret ? integration.secret_prefix ?? "مُفعّل" : "غير مُنشأ"}
                    {integration.last_used_at ? ` · آخر استخدام ${integration.last_used_at}` : ""}
                  </p>
                  {plainSecret ? (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
                      <p className="text-xs font-semibold text-amber-900 dark:text-amber-100">انسخ المفتاح الآن (لن يُعرض مرة أخرى)</p>
                      <code className="mt-1 block break-all text-xs">{plainSecret}</code>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={integrationBusy}
                      onClick={() => void regenerateIntegration()}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {integration.has_secret ? "تجديد المفتاح" : "إنشاء مفتاح"}
                    </button>
                    {integration.has_secret ? (
                      <button
                        type="button"
                        disabled={integrationBusy}
                        onClick={() => void toggleIntegration(!integration.is_enabled)}
                        className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium dark:border-zinc-700"
                      >
                        {integration.is_enabled ? "تعطيل" : "تفعيل"}
                      </button>
                    ) : null}
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-3 text-[11px] leading-relaxed dark:bg-zinc-800">
{`POST ${integration.webhook_url}
X-DASM-POS-Key: YOUR_DPOS_KEY
Content-Type: application/json

{
  "external_ref": "ZID-12345",
  "items": [{ "sku": "SKU-1", "quantity": 1 }],
  "payment_method": "cash"
}`}
                  </pre>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={integrationBusy}
                  onClick={() => void regenerateIntegration()}
                  className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  إعداد POS خارجي
                </button>
              )}
            </div>
          </div>
        </section>
      </SellerShell>
    </>
  );
}

export default DashboardPosPage;

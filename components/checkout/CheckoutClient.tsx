"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  StoreShippingConfig,
  StoreShippingSummary,
  CheckoutPayload,
} from "@/lib/api-server";
import { submitCheckout } from "@/lib/actions/checkout-order";
import { useCartStore } from "@/store/cartStore";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { PaymentLogos } from "@/components/shared/PaymentLogos";

type TryotoRateRow = {
  delivery_option_id: string;
  carrier: string;
  service_name: string;
  oto_base_sar: number;
  platform_markup_sar: number;
  weight_adjustment_sar: number;
  buyer_shipping_sar: number;
};

function legacyShipPreview(cfg: StoreShippingConfig, subtotal: number): number {
  const freeAbove = Number(cfg.free_above_amount ?? 0);
  if (freeAbove > 0 && subtotal >= freeAbove) return 0;
  return Number(cfg.flat_rate ?? 0);
}

export function CheckoutClient({
  slug,
  whatsapp,
  shippingConfigs,
  hasPayment,
  shippingSummary,
}: {
  slug: string;
  whatsapp: string | null | undefined;
  shippingConfigs: StoreShippingConfig[];
  hasPayment: boolean;
  shippingSummary?: StoreShippingSummary | null;
}) {
  const router = useRouter();
  const ensureStoreSlug = useCartStore((s) => s.ensureStoreSlug);
  const storeSlug = useCartStore((s) => s.storeSlug);
  const items = useCartStore((s) => s.items);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const selectedShippingId = useCartStore((s) => s.selectedShippingId);
  const setShipping = useCartStore((s) => s.setShipping);
  const clearCart = useCartStore((s) => s.clearCart);
  const persistedCoupon = useCartStore((s) => s.coupon);

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

  const [couponLocal, setCouponLocal] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tryotoRates, setTryotoRates] = useState<TryotoRateRow[]>([]);
  const [tryotoWeightKg, setTryotoWeightKg] = useState<number | null>(null);
  const [tryotoLoading, setTryotoLoading] = useState(false);
  const [tryotoError, setTryotoError] = useState<string | null>(null);
  const [selectedTryotoId, setSelectedTryotoId] = useState<string | null>(null);

  const tryotoOn = Boolean(shippingSummary?.tryoto_enabled);
  const legacyOn = shippingConfigs.length > 0;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    ensureStoreSlug(slug);
  }, [slug, ensureStoreSlug]);

  useEffect(() => {
    if (persistedCoupon) setCouponLocal(persistedCoupon);
  }, [persistedCoupon]);

  useEffect(() => {
    if (!shippingConfigs.length) return;
    if (tryotoOn && !legacyOn) return;
    if (selectedShippingId != null) return;
    setShipping(shippingConfigs[0].id);
  }, [shippingConfigs, selectedShippingId, setShipping, tryotoOn, legacyOn]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0),
    [items],
  );

  const fetchTryotoRates = useCallback(async () => {
    const city = form.shipping_address.city.trim();
    if (!city || items.length === 0) {
      setTryotoError("اكتب مدينة الشحن ثم احسب الأسعار.");
      return;
    }
    setTryotoLoading(true);
    setTryotoError(null);
    try {
      const res = await fetch(
        `/api/public-store/${encodeURIComponent(slug)}/shipping-quote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            destination_city: city,
            estimated_order_subtotal: Math.round(subtotal * 100) / 100,
            items: items.map((i) => ({
              product_id: i.productId,
              variant_id: i.variantId,
              quantity: i.quantity,
            })),
          }),
          cache: "no-store",
        },
      );
      const body = (await res.json().catch(() => ({}))) as {
        message?: string;
        rates?: TryotoRateRow[];
        weight_kg?: number;
      };
      if (!res.ok) {
        setTryotoRates([]);
        setTryotoWeightKg(null);
        setSelectedTryotoId(null);
        setTryotoError(typeof body.message === "string" ? body.message : "تعذّر جلب الأسعار");
        return;
      }
      setTryotoRates(Array.isArray(body.rates) ? body.rates : []);
      setTryotoWeightKg(typeof body.weight_kg === "number" ? body.weight_kg : null);
      setSelectedTryotoId(null);
    } catch {
      setTryotoError("تعذّر الاتصال بخدمة الشحن");
      setTryotoRates([]);
    } finally {
      setTryotoLoading(false);
    }
  }, [form.shipping_address.city, items, slug, subtotal]);

  /* تحديث تلقائي للأسعار عند تعديل المدينة أو السلة (مع تأخير بسيط) */
  useEffect(() => {
    if (!tryotoOn || items.length === 0) return;
    const city = form.shipping_address.city.trim();
    if (city.length < 2) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTryotoRates();
    }, 650);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [tryotoOn, items, form.shipping_address.city, fetchTryotoRates]);

  const legacyShippingPreview = useMemo(() => {
    if (selectedTryotoId || selectedShippingId == null) return 0;
    const cfg = shippingConfigs.find((s) => s.id === selectedShippingId);
    if (!cfg) return 0;
    return legacyShipPreview(cfg, subtotal);
  }, [selectedTryotoId, selectedShippingId, shippingConfigs, subtotal]);

  const tryotoShippingPreview = useMemo(() => {
    if (!selectedTryotoId) return 0;
    const row = tryotoRates.find((r) => r.delivery_option_id === selectedTryotoId);
    return row ? Number(row.buyer_shipping_sar) : 0;
  }, [selectedTryotoId, tryotoRates]);

  const shippingPreview = tryotoShippingPreview || legacyShippingPreview;
  const vat = subtotal * 0.15;
  const grand = subtotal + vat + shippingPreview;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (tryotoOn || legacyOn) {
      if (selectedTryotoId == null && (legacyOn ? selectedShippingId == null : true)) {
        setError("اختر خيار الشحن قبل الدفع.");
        return;
      }
      if (tryotoOn && selectedTryotoId == null && !legacyOn) {
        setError("انتظر حساب أسعار الشحن أو حدّث الصفحة.");
        return;
      }
    }

    setBusy(true);
    try {
      const payload: CheckoutPayload = {
        customer_name: form.customer_name,
        customer_email: form.customer_email || undefined,
        customer_phone: form.customer_phone,
        shipping_address: form.shipping_address,
        items: items.map((i) => ({
          product_id: i.productId,
          variant_id: i.variantId,
          quantity: i.quantity,
        })),
        coupon_code: couponLocal.trim() || undefined,
      };

      if (selectedTryotoId) {
        payload.tryoto_delivery_option_id = selectedTryotoId;
      } else if (selectedShippingId != null) {
        payload.shipping_config_id = selectedShippingId;
      }

      const result = await submitCheckout(slug, payload);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setCoupon(couponLocal.trim() || null);
      clearCart();
      if (result.payment_url) {
        window.location.href = result.payment_url;
        return;
      }
      router.push(
        `/store/${slug}/success${result.order_number ? `?order=${encodeURIComponent(result.order_number)}` : ""}`,
      );
    } finally {
      setBusy(false);
    }
  }

  const mismatch = items.length > 0 && storeSlug !== slug;

  if (!hasPayment) {
    return (
      <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">
          هذا المتجر لا يدعم الدفع الإلكتروني حالياً. يمكنك إكمال الطلب عبر واتساب.
        </p>
        <WhatsAppButton phone={whatsapp} label="تواصل مع المتجر" className="justify-center" />
        <div>
          <Link href={`/store/${slug}/cart`} className="text-sm hover:underline">
            العودة للسلة
          </Link>
        </div>
      </div>
    );
  }

  if (mismatch) {
    return (
      <p className="text-sm text-red-600">
        السلة لا تتطابق مع هذا المتجر. ارجع إلى{" "}
        <Link href={`/store/${slug}/products`} className="underline">
          المنتجات
        </Link>
        .
      </p>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">السلة فارغة</p>
        <Link
          href={`/store/${slug}/products`}
          className="mt-4 inline-block text-sm font-semibold hover:underline"
          style={{ color: "var(--primary)" }}
        >
          تصفّح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-bold">بيانات العميل والشحن</h2>
        <input
          required
          placeholder="الاسم الكامل"
          value={form.customer_name}
          onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
          className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
        />
        <input
          required
          type="tel"
          placeholder="رقم الجوال"
          value={form.customer_phone}
          onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
          className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
        />
        <input
          type="email"
          placeholder="البريد الإلكتروني (اختياري)"
          value={form.customer_email}
          onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
          className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
        />
        <input
          required
          placeholder="المدينة (لحساب الشحن الفوري)"
          value={form.shipping_address.city}
          onChange={(e) =>
            setForm({
              ...form,
              shipping_address: { ...form.shipping_address, city: e.target.value },
            })
          }
          className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
        />
        <input
          required
          placeholder="العنوان / الشارع"
          value={form.shipping_address.street}
          onChange={(e) =>
            setForm({
              ...form,
              shipping_address: { ...form.shipping_address, street: e.target.value },
            })
          }
          className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
        />
        <input
          placeholder="الرمز البريدي (اختياري)"
          value={form.shipping_address.zip}
          onChange={(e) =>
            setForm({
              ...form,
              shipping_address: { ...form.shipping_address, zip: e.target.value },
            })
          }
          className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
        />

        {tryotoOn ? (
          <fieldset className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-4">
            <legend className="px-1 text-sm font-semibold">شحن فوري (Tryoto / أوتو)</legend>
            {shippingSummary?.shipping_origin_city ? (
              <p className="text-xs text-[var(--muted-foreground)]">
                شحن من:{" "}
                <span className="font-medium text-[var(--foreground)]">
                  {shippingSummary.shipping_origin_city}
                </span>
                {" — "}يشمل رسوم منصة{" "}
                {Number(shippingSummary.shipping_markup_sar ?? 10).toFixed(0)} ر.س
                {Number(shippingSummary.shipping_extra_per_kg_sar ?? 0) > 0 ? (
                  <>
                    {" "}
                    + طبقة وزن إضافية{" "}
                    {Number(shippingSummary.shipping_extra_per_kg_sar).toFixed(2)} ر.س لكل كجم فوق
                    الأول
                  </>
                ) : null}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fetchTryotoRates()}
                disabled={tryotoLoading}
                className="rounded-xl px-4 py-2 text-xs font-bold text-[var(--primary-foreground)] disabled:opacity-60"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {tryotoLoading ? "جاري الحساب…" : "تحديث أسعار الشحن"}
              </button>
              {tryotoWeightKg != null ? (
                <span className="self-center text-xs text-[var(--muted-foreground)]">
                  وزن الشحنة التقديري:{" "}
                  <strong className="text-[var(--foreground)]">{tryotoWeightKg}</strong> كجم (من أوزان
                  المنتجات)
                </span>
              ) : null}
            </div>
            {tryotoError ? <p className="text-xs text-red-600">{tryotoError}</p> : null}
            {tryotoRates.length > 0 ? (
              <div className="space-y-2">
                {tryotoRates.map((r) => (
                  <label
                    key={r.delivery_option_id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"
                  >
                    <input
                      type="radio"
                      name="tryoto_ship"
                      checked={selectedTryotoId === r.delivery_option_id}
                      onChange={() => {
                        setSelectedTryotoId(r.delivery_option_id);
                        setShipping(null);
                      }}
                    />
                    <span className="text-sm leading-relaxed">
                      <span className="font-semibold">{r.carrier}</span>
                      {r.service_name ? (
                        <span className="text-[var(--muted-foreground)]"> — {r.service_name}</span>
                      ) : null}
                      <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                        شحن للعميل:{" "}
                        <strong className="text-[var(--foreground)]">
                          {Number(r.buyer_shipping_sar).toFixed(2)}
                        </strong>{" "}
                        ر.س (يشمل رسوم المنصة والطبقة الثانية للوزن إن وُجدت)
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)]">
                أسعار الشحن تُحمَّل تلقائياً بعد إدخال المدينة. يمكنك الضغط على «تحديث» إذا لم تظهر.
              </p>
            )}
          </fieldset>
        ) : null}

        {legacyOn ? (
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">
              {tryotoOn ? "أو الشحن الثابت (يدوي)" : "طريقة الشحن"}
            </legend>
            <div className="space-y-2">
              {shippingConfigs.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] p-3"
                >
                  <input
                    type="radio"
                    name="legacy_ship"
                    checked={
                      selectedShippingId === s.id &&
                      (tryotoOn ? selectedTryotoId == null : true)
                    }
                    onChange={() => {
                      setShipping(s.id);
                      setSelectedTryotoId(null);
                    }}
                  />
                  <span className="text-sm">
                    <span className="font-medium">{s.provider ?? `شحن #${s.id}`}</span>
                    {s.estimated_days != null ? (
                      <span className="mr-2 text-[var(--muted-foreground)]">
                        — تقريباً {s.estimated_days} يوم
                      </span>
                    ) : null}
                    <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                      سعر ثابت: {Number(s.flat_rate ?? 0).toFixed(0)} ر.س
                      {s.free_above_amount != null && Number(s.free_above_amount) > 0 ? (
                        <> — مجاني فوق {Number(s.free_above_amount).toFixed(0)} ر.س</>
                      ) : null}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {!tryotoOn && !legacyOn ? (
          <p className="text-xs text-[var(--muted-foreground)]">
            لا توجد طرق شحن مُعرَّفة لهذا المتجر حالياً — سيُكمَل الطلب بـ«شحن صفر» إلى أن يفعّل
            التاجر الشحن.
          </p>
        ) : null}

        <label className="block space-y-1">
          <span className="text-sm font-semibold">كوبون خصم</span>
          <input
            value={couponLocal}
            onChange={(e) => setCouponLocal(e.target.value)}
            placeholder="إن وجد"
            className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl py-3 text-sm font-bold text-[var(--primary-foreground)] disabled:opacity-60"
          style={{ backgroundColor: "var(--primary)" }}
        >
          {busy ? "جاري المعالجة..." : "إتمام الطلب والدفع"}
        </button>
      </div>

      <aside className="h-fit space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h3 className="font-bold">ملخص الطلب</h3>
        <ul className="space-y-2 text-sm">
          {items.map((i) => (
            <li key={`${i.productId}-${i.variantId ?? "x"}`} className="flex justify-between gap-2">
              <span className="line-clamp-1">{i.name}</span>
              <span className="shrink-0">
                ×{i.quantity} — {(Number(i.price) * i.quantity).toFixed(0)}
              </span>
            </li>
          ))}
        </ul>
        <hr className="border-[var(--border)]" />
        <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
          <span>مجموع المنتجات</span>
          <span>{subtotal.toFixed(2)} ر.س</span>
        </div>
        <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
          <span>الشحن (تقدير)</span>
          <span>{shippingPreview.toFixed(2)} ر.س</span>
        </div>
        <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
          <span>الضريبة (تقديرية على المنتجات)</span>
          <span>{vat.toFixed(2)} ر.س</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>الإجمالي التقديري</span>
          <span>{grand.toFixed(2)} ر.س</span>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--muted-foreground)]">
          يتم التحقق من الشحن والضريبة والكوبونات على الخادم عند إنشاء الطلب. إذا اخترت Tryoto يُعاد
          طلب الأسعار للتحقق من السعر.
        </p>
        <Link href={`/store/${slug}/cart`} className="block text-center text-sm hover:underline">
          تعديل السلة
        </Link>
        <PaymentLogos className="mt-3" />
      </aside>
    </form>
  );
}

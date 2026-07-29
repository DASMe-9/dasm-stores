"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Save, ScrollText } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";

type PolicyForm = {
  fulfillment_model: "merchant" | "supplier" | "mixed";
  shipping_scope: "local" | "international" | "both";
  return_window_days: number;
  merchant_response_business_days: number;
  inspection_business_days: number;
  resolution_business_days: number;
  failed_delivery_confirmation_days: number;
  customer_return_shipping: "customer" | "merchant";
  allow_exchange: boolean;
  allow_store_credit: boolean;
  additional_terms: string;
};

const DEFAULT_POLICY: PolicyForm = {
  fulfillment_model: "merchant",
  shipping_scope: "local",
  return_window_days: 7,
  merchant_response_business_days: 2,
  inspection_business_days: 3,
  resolution_business_days: 7,
  failed_delivery_confirmation_days: 3,
  customer_return_shipping: "customer",
  allow_exchange: true,
  allow_store_credit: false,
  additional_terms: "",
};

export default function PoliciesPage() {
  const router = useRouter();
  const [form, setForm] = useState(DEFAULT_POLICY);
  const [storeSlug, setStoreSlug] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const token = localStorage.getItem("stores_token");
    if (!token) {
      router.replace("/auth/login?returnUrl=/dashboard/policies");
      return;
    }

    Promise.all([sellerApi.getMyStore(), sellerApi.getFulfillmentPolicy()])
      .then(([storeResponse, policyResponse]) => {
        const store = storeResponse.data?.store;
        const policy = policyResponse.data?.fulfillment_policy;
        if (store) {
          setStoreSlug(store.slug ?? "");
          setStoreName(store.name_ar || store.name || "");
        }
        if (policy) {
          setForm({
            ...DEFAULT_POLICY,
            ...policy,
            additional_terms: policy.additional_terms ?? "",
          });
        }
      })
      .catch(() => setMessage("تعذر تحميل السياسة. حاول مرة أخرى."))
      .finally(() => setLoading(false));
  }, [router]);

  const update = <K extends keyof PolicyForm>(key: K, value: PolicyForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const response = await sellerApi.updateFulfillmentPolicy(form);
      setForm({
        ...form,
        ...response.data.fulfillment_policy,
        additional_terms: response.data.fulfillment_policy.additional_terms ?? "",
      });
      setMessage("تم حفظ السياسة ونشرها في واجهة المتجر.");
    } catch {
      setMessage("تعذر حفظ السياسة. راجع القيم وحاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SellerShell
      title="سياسة الاسترجاع والتسليم"
      subtitle="خصص طريقة التنفيذ والمدد والرسوم، مع بقاء الحقوق النظامية محفوظة."
      icon={ScrollText}
      hasStore={Boolean(storeSlug)}
      storeSlug={storeSlug}
      storeName={storeName}
      actions={
        <button
          type="button"
          onClick={save}
          disabled={loading || saving || !storeSlug}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "جارٍ الحفظ…" : "حفظ السياسة"}
        </button>
      }
    >
      {loading ? (
        <p className="rounded-2xl border bg-white p-6 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          جارٍ تحميل السياسة…
        </p>
      ) : (
        <div className="space-y-5" dir="rtl">
          {message ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              {message}
            </p>
          ) : null}

          <section className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900">
            <SelectField
              label="من ينفذ الطلب؟"
              value={form.fulfillment_model}
              onChange={(value) => update("fulfillment_model", value as PolicyForm["fulfillment_model"])}
              options={[
                ["merchant", "التاجر"],
                ["supplier", "المورد"],
                ["mixed", "التاجر والمورد"],
              ]}
            />
            <SelectField
              label="نطاق الشحن"
              value={form.shipping_scope}
              onChange={(value) => update("shipping_scope", value as PolicyForm["shipping_scope"])}
              options={[
                ["local", "محلي"],
                ["international", "دولي"],
                ["both", "محلي ودولي"],
              ]}
            />
            <NumberField label="مدة الاسترجاع بالأيام" min={7} max={30} value={form.return_window_days} onChange={(value) => update("return_window_days", value)} />
            <SelectField
              label="رسوم الإرجاع العادي"
              value={form.customer_return_shipping}
              onChange={(value) => update("customer_return_shipping", value as PolicyForm["customer_return_shipping"])}
              options={[
                ["customer", "يتحملها العميل"],
                ["merchant", "يتحملها المتجر"],
              ]}
            />
          </section>

          <section className="grid gap-4 rounded-2xl border bg-white p-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900">
            <NumberField label="الرد خلال أيام عمل" min={1} max={5} value={form.merchant_response_business_days} onChange={(value) => update("merchant_response_business_days", value)} />
            <NumberField label="الفحص خلال أيام عمل" min={1} max={10} value={form.inspection_business_days} onChange={(value) => update("inspection_business_days", value)} />
            <NumberField label="تأكيد الحل خلال أيام عمل" min={1} max={14} value={form.resolution_business_days} onChange={(value) => update("resolution_business_days", value)} />
            <NumberField label="مهلة إعادة الشحن بالأيام" min={1} max={7} value={form.failed_delivery_confirmation_days} onChange={(value) => update("failed_delivery_confirmation_days", value)} />
          </section>

          <section className="space-y-4 rounded-2xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <CheckField label="إتاحة الاستبدال عند توفر البديل" checked={form.allow_exchange} onChange={(value) => update("allow_exchange", value)} />
            <CheckField label="إتاحة رصيد متجر بموافقة العميل" checked={form.allow_store_credit} onChange={(value) => update("allow_store_credit", value)} />
            <label className="block text-sm font-semibold">
              شروط إضافية
              <textarea
                value={form.additional_terms}
                maxLength={1500}
                rows={5}
                onChange={(event) => update("additional_terms", event.target.value)}
                placeholder="اكتب الاستثناءات الخاصة بالمنتجات أو تعليمات التواصل. لا يجوز تقليل الحقوق النظامية."
                className="mt-2 w-full rounded-xl border px-3 py-2 font-normal dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          </section>

          <p className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            عند العيب أو المنتج الخطأ أو التلف لا يتحمل العميل رسوم الإرجاع أو إعادة الشحن بعد التحقق،
            ويبقى التاجر مسؤولاً عن الحل أمام العميل حتى لو نفذ المورد الطلب.
          </p>
        </div>
      )}
    </SellerShell>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2 font-normal dark:border-zinc-700 dark:bg-zinc-950">
        {options.map(([optionValue, text]) => <option key={optionValue} value={optionValue}>{text}</option>)}
      </select>
    </label>
  );
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input type="number" value={value} min={min} max={max} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 w-full rounded-xl border px-3 py-2 font-normal dark:border-zinc-700 dark:bg-zinc-950" />
    </label>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 text-sm font-semibold">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-emerald-700" />
      {label}
    </label>
  );
}

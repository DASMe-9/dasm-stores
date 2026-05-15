"use server";

import { checkout, type CheckoutPayload } from "@/lib/api-server";

export async function submitCheckout(slug: string, payload: CheckoutPayload) {
  const res = await checkout(slug, payload);
  if (!res.ok) {
    const body = res.body as { message?: string } | null;
    const message =
      typeof body?.message === "string" ? body.message : "تعذّر إنشاء الطلب";
    return { ok: false as const, message };
  }

  const body = res.body as {
    payment_url?: string;
    order?: { order_number?: string };
  };

  return {
    ok: true as const,
    payment_url: body.payment_url,
    order_number: body.order?.order_number,
  };
}

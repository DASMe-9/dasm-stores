import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { getStore } from "@/lib/api-server";
import { pickShippingConfigs } from "@/lib/store-utils";
import { notFound } from "next/navigation";

export const revalidate = 300;

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getStore(slug);
  if (!data) notFound();

  const shipping = pickShippingConfigs(data.store);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">إتمام الطلب</h1>
      <CheckoutClient
        slug={slug}
        whatsapp={data.store.contact_whatsapp}
        shippingConfigs={shipping}
        hasPayment={data.has_payment}
        shippingSummary={data.shipping ?? null}
      />
    </div>
  );
}

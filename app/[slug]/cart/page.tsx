import { CartPageClient } from "@/components/cart/CartPageClient";
import { getStore } from "@/lib/api-server";
import { getStorefrontRequestContext } from "@/lib/storefront-preview-server";
import { notFound } from "next/navigation";

export const revalidate = 300;

export default async function CartRoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const requestContext = await getStorefrontRequestContext();
  const data = await getStore(slug, requestContext);
  if (!data) notFound();

  return <CartPageClient slug={slug} />;
}

import { CartPageClient } from "@/components/cart/CartPageClient";
import { getStore } from "@/lib/api-server";
import { getStorefrontRequestContext } from "@/lib/storefront-preview-server";
import { ensurePublicStore } from "@/lib/storefront-guards";

export const revalidate = 300;

export default async function CartRoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const requestContext = await getStorefrontRequestContext();
  const data = await getStore(slug, requestContext);
  if (!ensurePublicStore(data, requestContext)) return null;

  return <CartPageClient slug={slug} />;
}

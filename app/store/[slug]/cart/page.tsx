import { CartPageClient } from "@/components/cart/CartPageClient";
import { getStore } from "@/lib/api-server";
import { notFound } from "next/navigation";

export const revalidate = 300;

export default async function CartRoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getStore(slug);
  if (!data) notFound();

  return <CartPageClient slug={slug} />;
}

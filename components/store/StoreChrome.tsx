"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WhatsAppFab } from "@/components/shared/WhatsAppButton";

/** Client islands mounted once per store segment: cart slug lock + drawer + WhatsApp FAB */
export function StoreChrome({
  slug,
  whatsapp,
}: {
  slug: string;
  whatsapp: string | null | undefined;
}) {
  const ensureStoreSlug = useCartStore((s) => s.ensureStoreSlug);

  useEffect(() => {
    ensureStoreSlug(slug);
  }, [slug, ensureStoreSlug]);

  // The cart still clears silently when switching stores (handled in the cart
  // store); we no longer surface the intrusive "تم إفراغ السلة" banner.
  return (
    <>
      <CartDrawer slug={slug} />
      <WhatsAppFab phone={whatsapp} />
    </>
  );
}

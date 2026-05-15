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
  const storeSwitchNotice = useCartStore((s) => s.storeSwitchNotice);
  const dismissStoreSwitchNotice = useCartStore((s) => s.dismissStoreSwitchNotice);

  useEffect(() => {
    ensureStoreSlug(slug);
  }, [slug, ensureStoreSlug]);

  return (
    <>
      {storeSwitchNotice ? (
        <div
          className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950"
          role="status"
        >
          <span className="inline-flex flex-wrap items-center justify-center gap-2">
            تم إفراغ السلة لأنك انتقلت إلى متجر آخر.
            <button
              type="button"
              className="rounded-lg bg-amber-200 px-3 py-1 text-xs font-semibold hover:bg-amber-300"
              onClick={() => dismissStoreSwitchNotice()}
            >
              حسناً
            </button>
          </span>
        </div>
      ) : null}
      <CartDrawer slug={slug} />
      <WhatsAppFab phone={whatsapp} />
    </>
  );
}

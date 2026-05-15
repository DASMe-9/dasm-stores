"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  StoreNewWizard,
  type SellerNavHandlers,
} from "@/components/seller/StoreNewWizard";

export default function StoresNewAppPage() {
  const router = useRouter();
  const nav = useMemo<SellerNavHandlers>(
    () => ({
      replace: (p) => {
        router.replace(p);
      },
      push: (p) => {
        router.push(p);
      },
      back: () => {
        router.back();
      },
    }),
    [router],
  );

  return <StoreNewWizard nav={nav} />;
}

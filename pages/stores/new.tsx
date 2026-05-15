"use client";

import Head from "next/head";
import { useMemo } from "react";
import { useRouter } from "next/router";
import {
  StoreNewWizard,
  type SellerNavHandlers,
} from "@/components/seller/StoreNewWizard";

/**
 * Pages Router route — seller shell ولوحة التحكم كلها على pages/.
 * الإبقاء على نفس المسار يضمن أن الإنتاج لا يعتمد على مسار App Router
 * قد يُستثنى أو يتعارض مع بناء hybrid قديم على Vercel.
 */
export default function StoresNewPage() {
  const router = useRouter();
  const nav = useMemo<SellerNavHandlers>(
    () => ({
      replace: (p) => void router.replace(p),
      push: (p) => void router.push(p),
      back: () => router.back(),
    }),
    [router],
  );

  return (
    <>
      <Head>
        <title>إنشاء متجر — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <StoreNewWizard nav={nav} />
    </>
  );
}

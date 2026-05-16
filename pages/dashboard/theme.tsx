import Head from "next/head";
import { Palette } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { StoreThemePicker } from "@/components/seller/StoreThemePicker";

export default function DashboardThemePage() {
  return (
    <>
      <Head>
        <title>ثيم المتجر — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell
        title="ثيم المتجر"
        subtitle="اختر شكل الهيرو، الحركة، وألوان واجهة متجرك"
        icon={Palette}
        hasStore
      >
        <div className="mx-auto max-w-6xl">
          <StoreThemePicker />
        </div>
      </SellerShell>
    </>
  );
}

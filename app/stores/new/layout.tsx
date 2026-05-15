import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "إنشاء متجر — متاجر داسم",
  robots: { index: false, follow: false },
};

export default function StoresNewLayout({ children }: { children: ReactNode }) {
  return children;
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** الإنتاج على DNS المعتمد فقط: stores.dasm.com.sa — لا redirects على مستوى Next لهذا المشروع */
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** توحيد النطاق إذا أُضيف alias بالجمع على نفس مشروع Vercel */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "stores.dasm.com.sa" }],
        destination: "https://store.dasm.com.sa/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

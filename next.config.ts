import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** يمنع اختيار جذر خاطئ عند وجود package-lock في مستودع الأم داخل نفس workspace محلياً */
  turbopack: {
    root: rootDir,
  },
  /** الإنتاج على DNS المعتمد فقط: stores.dasm.com.sa — لا redirects على مستوى Next لهذا المشروع */
};

export default nextConfig;

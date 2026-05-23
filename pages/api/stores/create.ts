import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  return res.status(410).json({
    message:
      "تم إيقاف هذا المسار. إنشاء المتجر يتم من Core API عبر /api/stores/my-store حتى تبقى الهوية في DASM Core وبيانات المتجر التشغيلية فقط في DASM-services.",
    code: "stores_creation_moved_to_core",
  });
}

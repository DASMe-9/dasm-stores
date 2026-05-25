import type { NextApiRequest, NextApiResponse } from "next";
import { resolveServerPlatformApiOrigin } from "@/lib/platform-api-url";

const DASM_API_URL = resolveServerPlatformApiOrigin();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const auth = req.headers.authorization?.replace("Bearer ", "");
  if (!auth) return res.status(401).json({ message: "غير مصرح" });

  const { name, name_ar, category, description, slug: customSlug } = req.body ?? {};
  if (!name) {
    return res.status(422).json({ message: "اسم المتجر مطلوب" });
  }

  try {
    // إنشاء المتجر عبر Backend API (Core DB) — يضمن نفس قاعدة البيانات
    const createRes = await fetch(`${DASM_API_URL}/api/stores/my-store`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${auth}`,
      },
      body: JSON.stringify({
        name,
        name_ar: name_ar || name,
        slug: customSlug || undefined,
        description: description ?? null,
      }),
    });

    const data = await createRes.json();

    if (!createRes.ok) {
      console.error("store create error", createRes.status, data);
      return res.status(createRes.status).json({
        message: data.message || "فشل إنشاء المتجر",
        errors: data.errors,
      });
    }

    return res.status(201).json({ success: true, store: data.store });
  } catch (err) {
    console.error("store create exception", err);
    return res.status(500).json({ message: "خطأ في الاتصال بالخادم" });
  }
}

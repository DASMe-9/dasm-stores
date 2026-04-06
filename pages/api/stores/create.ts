import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_SERVICES_URL!,
  process.env.SUPABASE_SERVICES_SERVICE_KEY!
);

const DASM_API_URL    = process.env.DASM_API_URL    ?? "https://api.dasm.com.sa";
const PLATFORM_KEY    = process.env.DASM_PLATFORM_API_KEY!;
const PLATFORM_NAME   = process.env.DASM_PLATFORM_NAME ?? "dasm-stores";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const auth = req.headers.authorization?.replace("Bearer ", "");
  if (!auth) return res.status(401).json({ message: "غير مصرح" });

  // التحقق من التوكن مع داسم
  const meRes = await fetch(`${DASM_API_URL}/api/user`, {
    headers: { Authorization: `Bearer ${auth}`, Accept: "application/json" },
  });
  if (!meRes.ok) return res.status(401).json({ message: "توكن غير صالح" });

  const me = await meRes.json();
  const userId   = me.id   ?? me.user?.id;
  const userType = me.type ?? me.user?.type ?? "user";

  const { name, name_ar, category, description } = req.body ?? {};
  if (!name || !name_ar) {
    return res.status(422).json({ message: "اسم المتجر مطلوب" });
  }

  // إنشاء slug بسيط
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // إدراج المتجر في DASM-services
  const { data: store, error } = await supabase
    .from("stores")
    .insert({
      owner_id:    userId,
      owner_type:  userType,
      name,
      name_ar,
      slug:        `${slug}-${Date.now()}`,
      description: description ?? null,
      category:    category ?? "general",
      status:      "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("store insert error", error);
    return res.status(500).json({ message: "فشل إنشاء المتجر", error: error.message });
  }

  // إرسال طلب التفعيل لداسم (server-to-server)
  try {
    await fetch(`${DASM_API_URL}/api/platform/stores/activation-request`, {
      method:  "POST",
      headers: {
        "Content-Type":    "application/json",
        "Accept":          "application/json",
        "X-Platform-Key":  PLATFORM_KEY,
        "X-Platform-Name": PLATFORM_NAME,
      },
      body: JSON.stringify({
        store_id:   store.id,
        store_name: store.name_ar ?? store.name,
        owner_id:   userId,
        owner_type: userType,
      }),
    });
  } catch (notifyErr) {
    // لا نُوقف العملية لو الإشعار فشل
    console.error("activation-request notify failed", notifyErr);
  }

  return res.status(201).json({ success: true, store });
}

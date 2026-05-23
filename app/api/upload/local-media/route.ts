import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { STOREFRONT_ORIGIN } from "@/lib/storefront-url";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

function safeExtension(name: string, mimeType: string): string {
  const fromMime = MIME_EXTENSION_MAP[mimeType];
  if (fromMime) return fromMime;

  const fromName = path.extname(name).replace(".", "").trim().toLowerCase();
  if (/^[a-z0-9]{2,8}$/.test(fromName)) return fromName;

  return "jpg";
}

function requestOrigin(request: Request): string {
  try {
    return new URL(request.url).origin;
  } catch {
    return STOREFRONT_ORIGIN;
  }
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    if (!authorization.startsWith("Bearer ") || authorization.slice(7).trim() === "") {
      return NextResponse.json(
        { status: "error", message: "غير مصرح." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const context = String(formData.get("context") ?? "").trim();
    if (context && context !== "store_product_image") {
      return NextResponse.json(
        { status: "error", message: "سياق الرفع غير مدعوم." },
        { status: 422 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { status: "error", message: "لم يتم العثور على ملف صالح." },
        { status: 422 },
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { status: "error", message: "نوع الملف غير مدعوم." },
        { status: 422 },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { status: "error", message: "حجم الملف يتجاوز الحد المسموح." },
        { status: 422 },
      );
    }

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const baseDir = path.join(process.cwd(), "public", "uploads", "store-products", year, month);
    await mkdir(baseDir, { recursive: true });

    const extension = safeExtension(file.name, file.type);
    const filename = `${Date.now()}-${randomUUID()}.${extension}`;
    const filePath = path.join(baseDir, filename);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, new Uint8Array(bytes));

    const relativePath = `/uploads/store-products/${year}/${month}/${filename}`;
    const secureUrl = new URL(relativePath, requestOrigin(request)).toString();

    return NextResponse.json({
      status: "ok",
      secure_url: secureUrl,
      context: context || "store_product_image",
      source: "local",
    });
  } catch {
    return NextResponse.json(
      { status: "error", message: "تعذّر رفع الملف حالياً." },
      { status: 500 },
    );
  }
}

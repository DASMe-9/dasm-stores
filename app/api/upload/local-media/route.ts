import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { STOREFRONT_ORIGIN } from "@/lib/storefront-url";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/pjpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/heic-sequence": "heic",
  "image/heif-sequence": "heif",
};
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);

const CONTEXT_CONFIGS: Record<string, { dir: string; maxBytes: number }> = {
  store_product_image: { dir: "store-products", maxBytes: 8 * 1024 * 1024 },
  store_logo: { dir: "store-logos", maxBytes: 5 * 1024 * 1024 },
  store_banner: { dir: "store-banners", maxBytes: 8 * 1024 * 1024 },
};

function safeExtension(name: string, mimeType: string): string {
  const fromMime = MIME_EXTENSION_MAP[mimeType];
  if (fromMime) return fromMime;

  const fromName = path.extname(name).replace(".", "").trim().toLowerCase();
  if (/^[a-z0-9]{2,8}$/.test(fromName)) return fromName;

  return "jpg";
}

function isAllowedImage(file: File): boolean {
  if (ALLOWED_MIME_TYPES.has(file.type)) return true;
  const extension = path.extname(file.name).replace(".", "").trim().toLowerCase();
  return ALLOWED_EXTENSIONS.has(extension);
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
    const context = String(formData.get("context") ?? "store_product_image").trim() || "store_product_image";
    const config = CONTEXT_CONFIGS[context];
    if (!config) {
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

    if (!isAllowedImage(file)) {
      return NextResponse.json(
        { status: "error", message: "نوع الملف غير مدعوم." },
        { status: 422 },
      );
    }

    if (file.size > config.maxBytes) {
      return NextResponse.json(
        { status: "error", message: "حجم الملف يتجاوز الحد المسموح." },
        { status: 422 },
      );
    }

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const baseDir = path.join(process.cwd(), "public", "uploads", config.dir, year, month);
    await mkdir(baseDir, { recursive: true });

    const extension = safeExtension(file.name, file.type);
    const filename = `${Date.now()}-${randomUUID()}.${extension}`;
    const filePath = path.join(baseDir, filename);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, new Uint8Array(bytes));

    const relativePath = `/uploads/${config.dir}/${year}/${month}/${filename}`;
    const secureUrl = new URL(relativePath, requestOrigin(request)).toString();

    return NextResponse.json({
      status: "ok",
      secure_url: secureUrl,
      context,
      source: "local",
    });
  } catch {
    return NextResponse.json(
      { status: "error", message: "تعذّر رفع الملف حالياً." },
      { status: 500 },
    );
  }
}

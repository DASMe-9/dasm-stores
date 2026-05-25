/**
 * أصل API المنصة الموحّد — يُستخدم في auth وSSR وطلبات المتجر.
 * الافتراضي: Render backend (مطابق لـ lib/api.ts). عيّن NEXT_PUBLIC_API_URL في Vercel للإنتاج.
 */
export const DEFAULT_PLATFORM_API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://dasm-laravel.onrender.com";

export function platformApiOrigin(): string {
  return DEFAULT_PLATFORM_API_ORIGIN;
}

export function platformApiBasePath(): string {
  return `${platformApiOrigin()}/api`;
}

/** أصل API من مسارات الخادم (API routes) — يفضّل DASM_API_URL ثم NEXT_PUBLIC_API_URL. */
export function resolveServerPlatformApiOrigin(): string {
  return (
    process.env.DASM_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    DEFAULT_PLATFORM_API_ORIGIN
  );
}

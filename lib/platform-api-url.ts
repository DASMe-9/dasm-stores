/**
 * أصل API المنصة الموحّد — auth، لوحة البائع، ومسارات API على الخادم.
 *
 * الإنتاج الرسمي: https://api.dasm.com.sa (انظر Control Log).
 * لا تستخدم dasm-platform-backend.onrender.com — لا يخدم مسارات Laravel /api/*.
 *
 * في Vercel (stores.dasm.com.sa) عيّن معًا:
 *   NEXT_PUBLIC_API_URL, API_BACKEND_URL, DASM_API_URL → https://api.dasm.com.sa
 */
export const PRODUCTION_PLATFORM_API_ORIGIN = "https://api.dasm.com.sa";

/** يُضمَّن NEXT_PUBLIC_API_URL عند البناء؛ الافتراضي = api.dasm.com.sa */
export function platformApiOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    PRODUCTION_PLATFORM_API_ORIGIN
  );
}

export function platformApiBasePath(): string {
  return `${platformApiOrigin()}/api`;
}

/** مسارات Next API / SSR — يفضّل متغيرات الخادم ثم العامة */
export function resolveServerPlatformApiOrigin(): string {
  return (
    process.env.API_BACKEND_URL?.replace(/\/$/, "") ||
    process.env.DASM_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    PRODUCTION_PLATFORM_API_ORIGIN
  );
}

/** @deprecated استخدم platformApiOrigin() — للتوافق مع الاستيرادات القديمة */
export const DEFAULT_PLATFORM_API_ORIGIN = PRODUCTION_PLATFORM_API_ORIGIN;

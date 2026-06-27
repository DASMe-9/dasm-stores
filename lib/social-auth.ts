/**
 * Social sign-in (Google / Apple) + forced profile completion for DASM Stores.
 *
 * Identity source of truth is DASM Core (api.dasm.com.sa) — same as the rest of
 * the platform. We send the provider id_token to Core, get back a Sanctum
 * access_token, and persist it as `stores_token` (Bearer), matching the existing
 * email/password login. Social-first accounts come back with
 * needs_profile_completion=true and must finish /onboarding/complete-profile
 * before reaching the dashboard.
 */
import { platformApiBasePath } from "./platform-api-url";

const API_BASE = platformApiBasePath(); // → https://api.dasm.com.sa/api

export interface SocialAuthResult {
  success: boolean;
  token?: string;
  user?: Record<string, unknown>;
  needsProfileCompletion?: boolean;
  linkRequired?: boolean;
  error?: string;
}

function firstValidationError(errors: unknown): string | null {
  if (!errors || typeof errors !== "object") return null;
  const first = Object.values(errors as Record<string, unknown>)[0];
  if (Array.isArray(first) && typeof first[0] === "string") return first[0];
  if (typeof first === "string") return first;
  return null;
}

async function loginWithExternalIdToken(
  provider: "google" | "apple",
  idToken: string,
): Promise<SocialAuthResult> {
  try {
    const res = await fetch(`${API_BASE}/auth/${provider}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    });
    const data = await res.json().catch(() => ({}));

    if (data?.status === "link_required") {
      return {
        success: false,
        linkRequired: true,
        error:
          data.message ||
          "يوجد حساب بهذا البريد. اربط الحساب من منصة داسم الرئيسية ثم عُد.",
      };
    }

    if (!res.ok || data?.status === "error") {
      if (data?.message === "Email not verified") {
        return { success: false, error: "يلزمك توثيق بريدك الإلكتروني أولاً." };
      }
      return {
        success: false,
        error:
          data?.message ||
          `تعذّر تسجيل الدخول عبر ${provider === "google" ? "Google" : "Apple"}.`,
      };
    }

    const user = data?.user as { profile_completed?: boolean } | undefined;
    return {
      success: true,
      token: data?.access_token,
      user,
      needsProfileCompletion:
        data?.needs_profile_completion === true || user?.profile_completed === false,
    };
  } catch {
    return { success: false, error: "تعذّر الاتصال بالخادم. حاول خلال لحظات." };
  }
}

export const loginWithGoogleIdToken = (idToken: string) =>
  loginWithExternalIdToken("google", idToken);

export const loginWithAppleIdToken = (idToken: string) =>
  loginWithExternalIdToken("apple", idToken);

export interface CompleteProfileResult {
  success: boolean;
  error?: string;
  resolvedDashboard?: string;
}

export async function completeProfile(payload: {
  phone: string;
  area_id?: number;
}): Promise<CompleteProfileResult> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const token =
      typeof window !== "undefined" ? localStorage.getItem("stores_token") : null;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/auth/complete-profile`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data?.status === "error") {
      return {
        success: false,
        error:
          firstValidationError(data?.errors) ||
          data?.message ||
          "تعذّر حفظ بياناتك. حاول مرة أخرى.",
      };
    }

    return { success: true, resolvedDashboard: data?.data?.resolved_dashboard };
  } catch {
    return { success: false, error: "تعذّر الاتصال بالخادم. حاول خلال لحظات." };
  }
}

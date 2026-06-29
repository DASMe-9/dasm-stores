import { useState } from "react";
import {
  loginWithAppleIdToken,
  startGoogleRedirectLogin,
  type SocialAuthResult,
} from "@/lib/social-auth";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ?? "";

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: object) => void;
        signIn: () => Promise<{ authorization?: { id_token?: string } }>;
      };
    };
  }
}

function loadScript(src: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const current = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (current?.dataset.loaded === "true") return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = current ?? document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    if (!current) document.body.appendChild(script);
  });
}

/**
 * Google + Apple sign-in buttons for DASM Stores. On success it hands the full
 * SocialAuthResult back to the parent (which persists the token and decides
 * whether to route to /onboarding/complete-profile or the dashboard).
 */
export default function SocialAuthButtons({
  onSuccess,
  onError,
  disabled,
  returnUrl,
}: {
  onSuccess: (result: SocialAuthResult) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  /** Intended post-login destination, stashed across the Google round-trip. */
  returnUrl?: string;
}) {
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);

  function onGoogleLogin() {
    if (socialLoading || disabled) return;
    setSocialLoading("google");
    // Leaves the SPA for Google's consent screen (Core Socialite redirect flow).
    startGoogleRedirectLogin(returnUrl);
  }

  async function onAppleLogin() {
    if (!appleClientId || socialLoading || disabled) return;
    setSocialLoading("apple");
    try {
      await loadScript(
        "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js",
      );
      if (!window.AppleID) {
        onError("تعذّر تحميل تسجيل الدخول عبر Apple");
        return;
      }
      window.AppleID.auth.init({
        clientId: appleClientId,
        scope: "name email",
        redirectURI: `${window.location.origin}/auth/login`,
        usePopup: true,
      });
      const response = await window.AppleID.auth.signIn();
      const idToken = response.authorization?.id_token;
      if (!idToken) {
        onError("لم يُستلم رمز Apple");
        return;
      }
      const result = await loginWithAppleIdToken(idToken);
      if (result.success) onSuccess(result);
      else onError(result.error || "تعذّر إكمال تسجيل الدخول عبر Apple");
    } catch {
      onError("تعذّر إكمال تسجيل الدخول عبر Apple");
    } finally {
      setSocialLoading(null);
    }
  }

  if (!googleClientId && !appleClientId) return null;

  return (
    <div className="space-y-3">
      <p className="text-center text-xs font-medium text-gray-400">المتابعة عبر</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {googleClientId && (
          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={disabled || !!socialLoading}
            aria-label="تسجيل الدخول عبر Google"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-900 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-white"
          >
            {socialLoading === "google" ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            )}
            Google
          </button>
        )}
        {appleClientId && (
          <button
            type="button"
            onClick={() => void onAppleLogin()}
            disabled={disabled || !!socialLoading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-black text-sm font-bold text-white transition hover:bg-gray-900 disabled:opacity-60 dark:border-gray-700"
          >
            {socialLoading === "apple" ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.43-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.936 4.45z" />
              </svg>
            )}
            Apple
          </button>
        )}
      </div>
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-100 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-4 text-gray-400 dark:bg-gray-950">أو</span>
        </div>
      </div>
    </div>
  );
}

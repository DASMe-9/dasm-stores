export type MarketingConsentState = "unknown" | "granted" | "denied";
export type MarketingConsentRecord = {
  state: Exclude<MarketingConsentState, "unknown">;
  policy_version: string;
  purposes: ["marketing"];
  decided_at: string;
};

export const MARKETING_CONSENT_EVENT = "dasm:marketing-consent-changed";
export const MARKETING_CONSENT_POLICY_VERSION = "2026-07-26";

const STORAGE_PREFIX = "dasm:marketing-consent:v2:";
const volatileConsent = new Map<string, MarketingConsentState>();

function storageKey(storeSlug: string): string {
  return `${STORAGE_PREFIX}${storeSlug}`;
}

export function getMarketingConsent(storeSlug: string): MarketingConsentState {
  if (typeof window === "undefined") return "unknown";
  const globalPrivacyControl =
    typeof navigator !== "undefined" &&
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl === true;
  if (globalPrivacyControl) return "denied";

  try {
    const stored = window.localStorage.getItem(storageKey(storeSlug));
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<MarketingConsentRecord>;
      if (
        parsed.policy_version === MARKETING_CONSENT_POLICY_VERSION &&
        (parsed.state === "granted" || parsed.state === "denied")
      ) {
        return parsed.state;
      }
    }
    return volatileConsent.get(storeSlug) ?? "unknown";
  } catch {
    return volatileConsent.get(storeSlug) ?? "unknown";
  }
}

export function setMarketingConsent(
  storeSlug: string,
  consent: Exclude<MarketingConsentState, "unknown">,
): void {
  if (typeof window === "undefined") return;

  volatileConsent.set(storeSlug, consent);
  const record: MarketingConsentRecord = {
    state: consent,
    policy_version: MARKETING_CONSENT_POLICY_VERSION,
    purposes: ["marketing"],
    decided_at: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(storageKey(storeSlug), JSON.stringify(record));
  } catch {
    // The in-memory choice still applies when browser storage is unavailable.
  }
  window.dispatchEvent(
    new CustomEvent(MARKETING_CONSENT_EVENT, {
      detail: { storeSlug, consent },
    }),
  );
}

export function resetMarketingConsent(storeSlug: string): void {
  if (typeof window === "undefined") return;

  volatileConsent.delete(storeSlug);
  try {
    window.localStorage.removeItem(storageKey(storeSlug));
  } catch {
    // No persisted choice exists when browser storage is unavailable.
  }
  window.dispatchEvent(
    new CustomEvent(MARKETING_CONSENT_EVENT, {
      detail: { storeSlug, consent: "unknown" },
    }),
  );
}

export function revokeLoadedMarketingConsent(): void {
  if (typeof window === "undefined") return;

  const trackingWindow = window as typeof window & {
    ttq?: { disableCookie?: () => void };
    fbq?: (command: string, action: string) => void;
    gtag?: (command: string, action: string, payload: Record<string, string>) => void;
  };

  trackingWindow.ttq?.disableCookie?.();
  trackingWindow.fbq?.("consent", "revoke");
  trackingWindow.gtag?.("consent", "update", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  const hostname = window.location.hostname;
  const registrableDomain = hostname.endsWith(".com.sa")
    ? hostname.split(".").slice(-3).join(".")
    : hostname.split(".").slice(-2).join(".");
  const marketingCookiePrefixes = [
    "_sc",
    "_fb",
    "_gcl",
    "_ttp",
    "ttcsid",
  ];

  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !marketingCookiePrefixes.some((prefix) => name.startsWith(prefix))) {
      return;
    }

    document.cookie = `${name}=; Max-Age=0; path=/`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=${hostname}`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.${registrableDomain}`;
  });
}

export function hasMarketingConsent(storeSlug: string): boolean {
  return getMarketingConsent(storeSlug) === "granted";
}

export function subscribeToMarketingConsent(
  storeSlug: string,
  callback: () => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handleConsentChange = () => callback();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey(storeSlug)) callback();
  };

  window.addEventListener(MARKETING_CONSENT_EVENT, handleConsentChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(MARKETING_CONSENT_EVENT, handleConsentChange);
    window.removeEventListener("storage", handleStorage);
  };
}

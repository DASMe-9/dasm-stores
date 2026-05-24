const TOKEN_KEY = "stores_token";
const USER_KEY = "stores_user";
const SELECTED_STORE_KEY = "dasm_selected_store_id";
const PREVIEW_SLUG_COOKIE = "stores_preview_slug";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function cookieSecurePart(): string {
  if (typeof window === "undefined") return "";
  return window.location.protocol === "https:" ? "; Secure" : "";
}

export function persistStoresToken(token: string): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE_SECONDS}${cookieSecurePart()}`;
}

export function syncStoresTokenCookie(): void {
  if (typeof window === "undefined") return;

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    persistStoresToken(token);
  }
}

export function clearStoresToken(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SELECTED_STORE_KEY);
  document.cookie = `${TOKEN_KEY}=; Path=/; SameSite=Lax; Max-Age=0${cookieSecurePart()}`;
  document.cookie = `${PREVIEW_SLUG_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0${cookieSecurePart()}`;
}

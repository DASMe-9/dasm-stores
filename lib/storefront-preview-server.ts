import { cookies, headers } from "next/headers";

export type StorefrontRequestContext = {
  preview: boolean;
  token?: string;
};

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function getStorefrontRequestContext(): Promise<StorefrontRequestContext> {
  const headerList = await headers();
  const rawToken = (await cookies()).get("stores_token")?.value;
  const token = rawToken ? decodeCookieValue(rawToken) : undefined;
  const previewHeader = headerList.get("x-dasm-store-preview") === "1";

  // If seller token exists, use owner preview mode by default so draft stores
  // remain visible to their owners even without `?preview=true` in the URL.
  const preview = previewHeader || Boolean(token);
  return { preview, token };
}

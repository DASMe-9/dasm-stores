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

  // Preview is explicit per request. A seller token alone must not turn public
  // storefront visits into owner preview, otherwise sellers cannot browse
  // other active stores as normal shoppers.
  const preview = previewHeader;
  return { preview, token };
}

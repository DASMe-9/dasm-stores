import { notFound } from "next/navigation";
import type { StorefrontRequestContext } from "@/lib/storefront-preview-server";

/** Returns false in owner preview mode so layout can recover; otherwise triggers 404. */
export function ensurePublicStore<T>(
  data: T | null | undefined,
  context: StorefrontRequestContext,
): data is T {
  if (data) return true;
  if (context.preview) return false;
  notFound();
}

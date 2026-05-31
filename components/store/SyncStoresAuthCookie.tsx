"use client";

import { useEffect } from "react";
import { syncStoresTokenCookie } from "@/lib/auth-token";

/** Mirrors dashboard token from localStorage into `stores_token` cookie for App Router SSR. */
export function SyncStoresAuthCookie() {
  useEffect(() => {
    syncStoresTokenCookie();
  }, []);

  return null;
}

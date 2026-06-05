"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { clearStoresToken } from "@/lib/auth-token";

const TOKEN_KEY = "stores_token";

export function StoreAuthActions({ slug }: { slug: string }) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(Boolean(localStorage.getItem(TOKEN_KEY)));
  }, []);

  const logout = () => {
    clearStoresToken();
    setAuthenticated(false);
    window.location.href = `/${slug}`;
  };

  if (!authenticated) {
    return (
      <Link
        href={`/auth/login?returnUrl=/${slug}`}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-bold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--muted)]"
      >
        <LogIn className="h-4 w-4" />
        دخول
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-bold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--muted)]"
      >
        <LayoutDashboard className="h-4 w-4" />
        لوحتي
      </Link>
      <button
        type="button"
        onClick={logout}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-bold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--muted)]"
      >
        <LogOut className="h-4 w-4" />
        خروج
      </button>
    </div>
  );
}

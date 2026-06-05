"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogIn } from "lucide-react";

const TOKEN_KEY = "stores_token";
const USER_KEY = "stores_user";

function readSellerName(): string {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return "صاحب المتجر";
    const parsed = JSON.parse(raw) as {
      name?: string | null;
      display_name?: string | null;
      email?: string | null;
    };
    return parsed.name?.trim() || parsed.display_name?.trim() || parsed.email?.trim() || "صاحب المتجر";
  } catch {
    return "صاحب المتجر";
  }
}

export function StoreAuthActions({ slug }: { slug: string }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [sellerName, setSellerName] = useState("صاحب المتجر");

  useEffect(() => {
    setAuthenticated(Boolean(localStorage.getItem(TOKEN_KEY)));
    setSellerName(readSellerName());
  }, []);

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
    <Link
      href="/dashboard"
      className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] shadow-sm transition hover:bg-[var(--muted)]"
    >
      <LayoutDashboard className="h-4 w-4 shrink-0" />
      <span className="min-w-0 text-start">
        <span className="block max-w-32 truncate text-sm font-extrabold">{sellerName}</span>
        <span className="block text-[11px] font-bold text-[var(--muted-foreground)]">لوحتي</span>
      </span>
    </Link>
  );
}

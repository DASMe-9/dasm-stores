"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, ShoppingCart, User } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

function cookieHasValue(name: string): boolean {
  if (typeof document === "undefined") return false;

  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .some((part) => part.startsWith(`${name}=`) && part.slice(name.length + 1).length > 0);
}

function hasStoresSession(): boolean {
  if (typeof window === "undefined") return false;

  return Boolean(
    localStorage.getItem("stores_token") ||
      cookieHasValue("stores_token"),
  );
}

export function HomeHeaderActions({ shoppingHref }: { shoppingHref: string }) {
  const [authState, setAuthState] = useState<"checking" | "guest" | "auth">("checking");

  useEffect(() => {
    const sync = () => setAuthState(hasStoresSession() ? "auth" : "guest");

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      {authState === "checking" ? (
        <span
          aria-hidden
          className="hidden h-11 w-28 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm sm:inline-flex"
        />
      ) : authState === "auth" ? (
        <Link
          href="/dashboard"
          className="hidden items-center gap-2 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-bold text-slate-900 dark:text-zinc-100 shadow-sm transition hover:border-emerald-200 dark:hover:border-emerald-800 hover:text-emerald-700 dark:hover:text-emerald-300 sm:inline-flex"
        >
          <LayoutDashboard className="h-4 w-4" />
          لوحتي
        </Link>
      ) : (
        <Link
          href="/auth/login?returnUrl=/dashboard"
          className="hidden items-center gap-2 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-bold text-slate-900 dark:text-zinc-100 shadow-sm transition hover:border-emerald-200 dark:hover:border-emerald-800 hover:text-emerald-700 dark:hover:text-emerald-300 sm:inline-flex"
        >
          <User className="h-4 w-4" />
          تسجيل الدخول
        </Link>
      )}

      <Link
        href={shoppingHref}
        className="relative inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-bold text-slate-900 dark:text-zinc-100 shadow-sm transition hover:border-emerald-200 dark:hover:border-emerald-800 hover:text-emerald-700 dark:hover:text-emerald-300"
      >
        <ShoppingCart className="h-4 w-4" />
        ابدأ التسوق
      </Link>
    </div>
  );
}

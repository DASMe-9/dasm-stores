"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, ShoppingCart, User } from "lucide-react";
import { clearStoresToken } from "@/lib/auth-token";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const USER_KEY = "stores_user";

function readAccountName(): string {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return "حسابي";
    const parsed = JSON.parse(raw) as {
      name?: string | null;
      display_name?: string | null;
      email?: string | null;
    };
    return parsed.name?.trim() || parsed.display_name?.trim() || parsed.email?.trim() || "حسابي";
  } catch {
    return "حسابي";
  }
}

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
  const [accountName, setAccountName] = useState("حسابي");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      const authenticated = hasStoresSession();
      setAuthState(authenticated ? "auth" : "guest");
      if (authenticated) {
        setAccountName(readAccountName());
      }
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnOutsidePointer(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsidePointer);
    return () => document.removeEventListener("mousedown", closeOnOutsidePointer);
  }, [menuOpen]);

  const logout = () => {
    clearStoresToken();
    setMenuOpen(false);
    setAuthState("guest");
    window.location.assign("/");
  };

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      {authState === "checking" ? (
        <span
          aria-hidden
          className="hidden h-11 w-28 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm sm:inline-flex"
        />
      ) : authState === "auth" ? (
        <div ref={menuRef} className="relative hidden sm:block">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex max-w-44 items-center gap-2 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-bold text-slate-900 dark:text-zinc-100 shadow-sm transition hover:border-emerald-200 dark:hover:border-emerald-800 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            <span className="max-w-28 truncate">{accountName}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 transition ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute start-0 top-[calc(100%+8px)] z-50 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 text-sm text-slate-900 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <Link
                href="/dashboard"
                role="menuitem"
                className="flex items-center gap-2 rounded-xl px-3 py-2 font-bold transition hover:bg-slate-100 dark:hover:bg-zinc-800"
                onClick={() => setMenuOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                لوحتي
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-start font-bold text-red-500 transition hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                خروج
              </button>
            </div>
          ) : null}
        </div>
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
        aria-label="التسوق"
        title="التسوق"
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-sm transition hover:border-emerald-200 dark:hover:border-emerald-800 hover:text-emerald-700 dark:hover:text-emerald-300"
      >
        <ShoppingCart className="h-4 w-4" />
      </Link>
    </div>
  );
}

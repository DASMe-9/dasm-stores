"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { clearStoresToken } from "@/lib/auth-token";

const TOKEN_KEY = "stores_token";
const USER_KEY = "stores_user";

type SellerAccount = {
  name: string;
  email: string;
};

function readSellerAccount(): SellerAccount {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return { name: "صاحب المتجر", email: "" };
    const parsed = JSON.parse(raw) as {
      name?: string | null;
      display_name?: string | null;
      email?: string | null;
    };
    const email = parsed.email?.trim() ?? "";
    const name = parsed.name?.trim() || parsed.display_name?.trim() || email || "صاحب المتجر";
    return { name, email };
  } catch {
    return { name: "صاحب المتجر", email: "" };
  }
}

export function StoreAuthActions({ slug }: { slug: string }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [sellerAccount, setSellerAccount] = useState<SellerAccount>({ name: "صاحب المتجر", email: "" });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setAuthenticated(Boolean(localStorage.getItem(TOKEN_KEY)));
      setSellerAccount(readSellerAccount());
    });
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
    setAuthenticated(false);
    setMenuOpen(false);
    window.location.assign(`/${slug}`);
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
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
        className="inline-flex min-h-12 max-w-56 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] shadow-sm transition hover:bg-[var(--muted)]"
      >
        <span className="min-w-0 text-start">
          <span className="block max-w-36 truncate text-sm font-extrabold">{sellerAccount.name}</span>
          <span className="block max-w-36 truncate text-[11px] font-bold text-[var(--muted-foreground)]" dir="ltr">
            {sellerAccount.email || "حساب المتجر"}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${menuOpen ? "rotate-180" : ""}`} />
      </button>

      {menuOpen ? (
        <div
          role="menu"
          className="absolute start-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 text-sm text-[var(--foreground)] shadow-xl"
        >
          <Link
            href="/dashboard"
            role="menuitem"
            className="flex items-center gap-2 rounded-lg px-3 py-2 font-bold transition hover:bg-[var(--muted)]"
            onClick={() => setMenuOpen(false)}
          >
            <LayoutDashboard className="h-4 w-4" />
            لوحتي
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start font-bold text-red-500 transition hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </div>
      ) : null}
    </div>
  );
}

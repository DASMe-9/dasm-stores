"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_SYNC_EVENT = "dasm-stores-theme-change";

function getThemeSnapshot() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_SYNC_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_SYNC_EVENT, callback);
  };
}

/**
 * Storefront light/dark toggle. Mirrors the seller dashboard convention
 * (localStorage key "stores_theme") so a user's choice is shared across the
 * whole متاجر داسم surface. Toggling adds/removes `.dark` on <html>, which
 * flips the design tokens defined in styles/globals.css (:root vs .dark).
 *
 * A no-flash inline script in app/layout.tsx applies the saved/system theme
 * before first paint, so this component only needs to reflect + update state.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const dark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => false);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("stores_theme", next ? "dark" : "light");
    } catch {
      /* storage may be unavailable (private mode) — theme still applies for this session */
    }
    window.dispatchEvent(new Event(THEME_SYNC_EVENT));
  };

  // Avoid hydration mismatch: render a stable placeholder until mounted.
  const label = dark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={dark}
      title={label}
      className={`inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-emerald-700 dark:hover:text-emerald-300 ${className || "h-11 w-11"}`}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

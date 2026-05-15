"use client";

import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  CreditCard,
  ExternalLink,
  Eye,
  LayoutDashboard,
  Menu,
  Moon,
  Package,
  Plus,
  ShoppingCart,
  Store,
  Sun,
  Truck,
  X,
} from "lucide-react";
import { SITE } from "@/lib/seo";
import { sellerApi } from "@/lib/api";

function navLinkClass(active: boolean): string {
  return [
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
    active
      ? "bg-white text-emerald-800 shadow-md shadow-emerald-600/10 dark:bg-emerald-950 dark:text-emerald-200 dark:shadow-emerald-400/10"
      : "text-emerald-900/70 hover:bg-white/60 hover:text-emerald-900 hover:shadow-sm dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
  ].join(" ");
}

type NavItem = {
  href: string;
  label: string;
  icon: ElementType;
  match?: (path: string) => boolean;
  badge?: string;
};

const MAIN_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "لوحة التحكم",
    icon: LayoutDashboard,
    match: (p) => p === "/dashboard",
  },
  {
    href: "/dashboard/products",
    label: "المنتجات",
    icon: Package,
    match: (p) => p === "/dashboard/products",
  },
  {
    href: "/dashboard/products/new",
    label: "أضف منتج",
    icon: Plus,
    match: (p) => p === "/dashboard/products/new",
  },
  {
    href: "/dashboard/payment",
    label: "بوابة الدفع",
    icon: CreditCard,
    match: (p) => p === "/dashboard/payment",
  },
  {
    href: "/dashboard/shipping",
    label: "الشحن والتوصيل",
    icon: Truck,
    match: (p) => p.startsWith("/dashboard/shipping"),
  },
];

export function SellerShell({
  title,
  subtitle,
  icon: TitleIcon,
  actions,
  children,
  hasStore,
  storeSlug,
  storeName,
}: {
  title: string;
  subtitle?: string;
  icon?: ElementType;
  actions?: ReactNode;
  children: ReactNode;
  hasStore?: boolean;
  storeSlug?: string;
  storeName?: string;
}) {
  const router = useRouter();
  const pathname = router.pathname || "";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [dark, setDark] = useState(false);
  const [resolvedSlug, setResolvedSlug] = useState(storeSlug || "");
  const [resolvedName, setResolvedName] = useState(storeName || "");

  useEffect(() => {
    const saved = localStorage.getItem("stores_theme");
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    if (storeSlug && storeName) {
      setResolvedSlug(storeSlug);
      setResolvedName(storeName);
      return;
    }
    const cachedSlug = sessionStorage.getItem("store_slug");
    const cachedName = sessionStorage.getItem("store_name");
    if (cachedSlug && cachedName) {
      setResolvedSlug(cachedSlug);
      setResolvedName(cachedName);
      return;
    }
    sellerApi.getMyStore().then(({ data }) => {
      if (data?.store?.slug) {
        setResolvedSlug(data.store.slug);
        setResolvedName(data.store.name || "");
        sessionStorage.setItem("store_slug", data.store.slug);
        sessionStorage.setItem("store_name", data.store.name || "");
      }
    }).catch(() => {});
  }, [storeSlug, storeName]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("stores_theme", next ? "dark" : "light");
  };

  const Icon = TitleIcon ?? LayoutDashboard;

  const sidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-emerald-200/40 dark:border-zinc-800 px-4 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
          <Store className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-emerald-950 dark:text-zinc-100">
            {resolvedName || "متاجر داسم"}
          </div>
          {resolvedSlug ? (
            <a
              href={`${SITE.url}/${resolvedSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
              dir="ltr"
            >
              {SITE.url}/{resolvedSlug}
            </a>
          ) : (
            <div className="text-[11px] text-emerald-700/50 dark:text-zinc-400">لوحة التاجر</div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <div>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-800/40 dark:text-zinc-500">
            القائمة
          </p>
          <div className="space-y-1">
            {MAIN_NAV.map((item) => {
              const active = item.match ? item.match(pathname) : pathname === item.href;
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className={navLinkClass(active)}
                >
                  <ItemIcon className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-800/40 dark:text-zinc-500">
            المتجر
          </p>
          <div className="space-y-1">
            {resolvedSlug && (
              <a
                href={`${SITE.url}/${resolvedSlug}?preview=true`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDrawerOpen(false)}
                className={navLinkClass(false)}
              >
                <Eye className="h-4 w-4 shrink-0 opacity-80" />
                معاينة المتجر
              </a>
            )}
            {!hasStore && (
              <Link
                href="/stores/new"
                onClick={() => setDrawerOpen(false)}
                className={navLinkClass(pathname.startsWith("/stores/new"))}
              >
                <Plus className="h-4 w-4 shrink-0 opacity-80" />
                إنشاء متجر جديد
              </Link>
            )}
            <div
              className={`${navLinkClass(false)} cursor-not-allowed opacity-50 pointer-events-none select-none`}
              aria-disabled
            >
              <ShoppingCart className="h-4 w-4 shrink-0 opacity-80" />
              الطلبات
              <span className="mr-auto rounded-full bg-emerald-100/60 dark:bg-zinc-800 px-2 py-0.5 text-[10px] text-emerald-700/60 dark:text-zinc-400">
                قريباً
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="border-t border-emerald-200/40 dark:border-zinc-800 p-3 space-y-1">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-emerald-900/60 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800 hover:text-emerald-900 dark:hover:text-zinc-100 transition-colors"
        >
          {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          {dark ? "الوضع النهاري" : "الوضع الليلي"}
        </button>
        <a
          href={SITE.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-white/60 dark:hover:bg-emerald-950 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          واجهة العملاء (المتجر العام)
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 rtl flex">
      <aside className="hidden w-[260px] shrink-0 border-l border-emerald-200/50 dark:border-zinc-800 bg-gradient-to-b from-emerald-50 via-teal-50/60 to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 lg:block lg:sticky lg:top-0 lg:h-screen lg:shadow-[4px_0_32px_-8px_rgba(16,185,129,0.12)]">
        {sidebarInner}
      </aside>

      {drawerOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="إغلاق القائمة"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-[min(86vw,280px)] transform bg-gradient-to-b from-emerald-50 via-teal-50/60 to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 shadow-xl transition-transform duration-200 lg:hidden ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end border-b border-emerald-200/40 dark:border-zinc-800 p-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="rounded-lg p-2 text-emerald-700/60 hover:bg-white/60 dark:text-zinc-500 dark:hover:bg-zinc-800"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {sidebarInner}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-lg">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-6">
            <button
              type="button"
              className="rounded-xl p-2 text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-600/25">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {resolvedName || title}
                </h1>
                {resolvedSlug ? (
                  <a
                    href={`${SITE.url}/${resolvedSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                    dir="ltr"
                  >
                    {SITE.url}/{resolvedSlug}
                  </a>
                ) : subtitle ? (
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
                ) : null}
              </div>
            </div>

            {actions ? (
              <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
                {actions}
              </div>
            ) : null}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

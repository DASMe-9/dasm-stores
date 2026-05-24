"use client";

import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  LayoutDashboard,
  Menu,
  Moon,
  Palette,
  Package,
  Plus,
  Settings,
  ShoppingCart,
  Store,
  Sun,
  Truck,
  X,
} from "lucide-react";
import { syncStoresTokenCookie } from "@/lib/auth-token";
import { sellerApi, storeSelection } from "@/lib/api";
import { getStoreDisplayName } from "@/lib/store-display";
import {
  STOREFRONT_ORIGIN,
  browserStorefrontOrigin,
  storePath,
} from "@/lib/storefront-url";
import { NationalAddressCard } from "./NationalAddressCard";

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
  requiresStore?: boolean;
};

type SellerStoreOption = {
  id: string | number;
  name?: string | null;
  name_ar?: string | null;
  slug?: string | null;
  status?: string | null;
};

function getCurrentStoreUserId(): string | null {
  try {
    const raw = localStorage.getItem("stores_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: string | number | null };
    return parsed.id == null ? null : String(parsed.id);
  } catch {
    return null;
  }
}

function sellerCacheKey(userId: string, field: "slug" | "name" | "status") {
  return `store_${field}:${userId}`;
}

const MAIN_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "لوحة التحكم",
    icon: LayoutDashboard,
    match: (p) => p === "/dashboard",
  },
  {
    href: "/dashboard/settings",
    label: "إعدادات المتجر",
    icon: Settings,
    match: (p) => p === "/dashboard/settings",
    requiresStore: true,
  },
  {
    href: "/dashboard/theme",
    label: "تصميم المتجر",
    icon: Palette,
    match: (p) => p === "/dashboard/theme",
    requiresStore: true,
  },
  {
    href: "/dashboard/products",
    label: "المنتجات",
    icon: Package,
    match: (p) => p === "/dashboard/products",
    requiresStore: true,
  },
  {
    href: "/dashboard/import",
    label: "استيراد Salla",
    icon: Download,
    match: (p) => p.startsWith("/dashboard/import"),
    requiresStore: true,
  },
  {
    href: "/dashboard/products/new",
    label: "أضف منتج",
    icon: Plus,
    match: (p) => p === "/dashboard/products/new",
    requiresStore: true,
  },
  {
    href: "/dashboard/payment",
    label: "المالية والدفع",
    icon: CreditCard,
    match: (p) => p === "/dashboard/payment",
    requiresStore: true,
  },
  {
    href: "/dashboard/shipping",
    label: "الشحن والتوصيل",
    icon: Truck,
    match: (p) => p.startsWith("/dashboard/shipping"),
    requiresStore: true,
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
  storeStatus,
}: {
  title: string;
  subtitle?: string;
  icon?: ElementType;
  actions?: ReactNode;
  children: ReactNode;
  hasStore?: boolean;
  storeSlug?: string;
  storeName?: string;
  storeStatus?: string;
}) {
  const router = useRouter();
  const pathname = router.pathname || "";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [dark, setDark] = useState(false);
  const [cachedSlug, setCachedSlug] = useState("");
  const [cachedName, setCachedName] = useState("");
  const [cachedStatus, setCachedStatus] = useState("");
  const [stores, setStores] = useState<SellerStoreOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [storeOrigin, setStoreOrigin] = useState(STOREFRONT_ORIGIN);
  const resolvedSlug = storeSlug || cachedSlug;
  const resolvedName = storeName || cachedName;
  const resolvedStatus = storeStatus || cachedStatus;

  useEffect(() => {
    // Defer theme init to the next microtask so the first paint + hydration settle
    // before we sync React state and the document `dark` class (avoids brief mismatch flicker).
    queueMicrotask(() => {
      syncStoresTokenCookie();
      setStoreOrigin(browserStorefrontOrigin());
      const saved = localStorage.getItem("stores_theme");
      const isDark =
        saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setDark(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    });
  }, []);

  useEffect(() => {
    if (storeSlug && storeName && storeStatus) return;

    let cancelled = false;
    queueMicrotask(() => {
      const userId = getCurrentStoreUserId();
      const savedSlug = userId ? sessionStorage.getItem(sellerCacheKey(userId, "slug")) : null;
      const savedName = userId ? sessionStorage.getItem(sellerCacheKey(userId, "name")) : null;
      const savedStatus = userId ? sessionStorage.getItem(sellerCacheKey(userId, "status")) : null;
      if (savedSlug && savedName && savedStatus) {
        if (!cancelled) {
          setCachedSlug(savedSlug);
          setCachedName(savedName);
          setCachedStatus(savedStatus);
        }
        return;
      }

      sellerApi
        .getMyStore()
        .then(({ data }) => {
          if (cancelled || !data?.store?.slug) return;
          const name = getStoreDisplayName(data.store);
          const status = data.store.status || "";
          setCachedSlug(data.store.slug);
          setCachedName(name);
          setCachedStatus(status);
          const resolvedUserId = getCurrentStoreUserId();
          if (resolvedUserId) {
            sessionStorage.setItem(sellerCacheKey(resolvedUserId, "slug"), data.store.slug);
            sessionStorage.setItem(sellerCacheKey(resolvedUserId, "name"), name);
            sessionStorage.setItem(sellerCacheKey(resolvedUserId, "status"), status);
          }
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
    };
  }, [storeSlug, storeName, storeStatus]);

  useEffect(() => {
    let cancelled = false;
    sellerApi
      .getMyStores()
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data?.stores) ? (data.stores as SellerStoreOption[]) : [];
        setStores(list);
        const stored = storeSelection.get();
        const selected =
          stored && list.some((store) => String(store.id) === stored)
            ? stored
            : list[0]?.id != null
              ? String(list[0].id)
              : "";
        setSelectedStoreId(selected);
        if (selected) {
          storeSelection.set(selected);
          const selectedStore = list.find((store) => String(store.id) === selected);
          if (selectedStore?.slug) {
            const name = getStoreDisplayName(selectedStore);
            const status = selectedStore.status || "";
            setCachedSlug(selectedStore.slug);
            setCachedName(name);
            setCachedStatus(status);
            const resolvedUserId = getCurrentStoreUserId();
            if (resolvedUserId) {
              sessionStorage.setItem(sellerCacheKey(resolvedUserId, "slug"), selectedStore.slug);
              sessionStorage.setItem(sellerCacheKey(resolvedUserId, "name"), name);
              sessionStorage.setItem(sellerCacheKey(resolvedUserId, "status"), status);
            }
          }
        } else {
          storeSelection.clear();
          setCachedSlug("");
          setCachedName("");
          setCachedStatus("");
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const handleStoreChange = (storeId: string) => {
    if (!storeId) return;
    storeSelection.set(storeId);
    setSelectedStoreId(storeId);
    window.location.reload();
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("stores_theme", next ? "dark" : "light");
  };

  const previewStorePath = resolvedSlug ? storePath(resolvedSlug, { preview: true }) : "";

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
          {stores.length > 1 ? (
            <select
              value={selectedStoreId}
              onChange={(event) => handleStoreChange(event.target.value)}
              className="mt-2 w-full rounded-lg border border-emerald-200 bg-white px-2 py-1 text-xs font-semibold text-emerald-900 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              aria-label="اختيار المتجر"
            >
              {stores.map((store) => (
                <option key={String(store.id)} value={String(store.id)}>
                  {getStoreDisplayName(store) || store.slug || String(store.id)}
                </option>
              ))}
            </select>
          ) : null}
          {resolvedSlug ? (
            <a
              href={previewStorePath}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              زيارة المتجر
            </a>
          ) : (
            <div className="text-[11px] text-emerald-700/50 dark:text-zinc-400">لوحة التاجر</div>
          )}
        </div>
      </div>

      <nav className="seller-sidebar-scroll flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <div>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-800/40 dark:text-zinc-500">
            القائمة
          </p>
          <div className="space-y-1">
            {MAIN_NAV.map((item) => {
              const shouldCreateStoreFirst = item.requiresStore && hasStore === false;
              const href = shouldCreateStoreFirst ? "/stores/new" : item.href;
              const active = !shouldCreateStoreFirst && (item.match ? item.match(pathname) : pathname === item.href);
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={href}
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
                href={previewStorePath}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDrawerOpen(false)}
                className={navLinkClass(false)}
              >
                <Eye className="h-4 w-4 shrink-0 opacity-80" />
                معاينة المتجر
              </a>
            )}
            {resolvedSlug && resolvedStatus && resolvedStatus !== "active" ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                المتجر غير منشور بعد
              </div>
            ) : null}
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

      <div className="px-0 pb-3">
        <NationalAddressCard />
      </div>

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
          href={storeOrigin}
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
        <header className="sticky top-0 z-30 flex items-center justify-between bg-zinc-50/95 dark:bg-zinc-950/90 backdrop-blur-lg border-b border-zinc-200/60 dark:border-zinc-800 px-4 py-3 lg:hidden">
          <button
            type="button"
            className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            onClick={() => setDrawerOpen(true)}
            aria-label="القائمة"
          >
            <Menu className="h-5 w-5" />
          </button>
          {actions ? (
            <div className="flex items-center gap-2">{actions}</div>
          ) : null}
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mb-6 hidden items-start justify-between gap-4 lg:flex">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                {TitleIcon ? (
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <TitleIcon className="h-5 w-5" />
                  </span>
                ) : null}
                <div>
                  <h1 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

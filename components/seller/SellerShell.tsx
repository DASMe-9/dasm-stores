"use client";

import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  ExternalLink,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  ShoppingCart,
  Store,
  Truck,
  X,
} from "lucide-react";
import { SITE } from "@/lib/seo";

function navLinkClass(active: boolean): string {
  return [
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
    active
      ? "bg-emerald-50 text-emerald-900 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
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
}: {
  title: string;
  subtitle?: string;
  icon?: ElementType;
  actions?: ReactNode;
  children: ReactNode;
  hasStore?: boolean;
}) {
  const router = useRouter();
  const pathname = router.pathname || "";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const Icon = TitleIcon ?? LayoutDashboard;

  const sidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
          <Store className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-zinc-900">متاجر داسم</div>
          <div className="text-[11px] text-zinc-500">لوحة التاجر</div>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <div>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
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
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            المتجر
          </p>
          <div className="space-y-1">
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
              <span className="mr-auto rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">
                قريباً
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="border-t border-zinc-100 p-3">
        <a
          href={SITE.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          واجهة العملاء (المتجر العام)
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 rtl flex">
      <aside className="hidden w-[260px] shrink-0 border-l border-zinc-200 bg-white lg:block lg:sticky lg:top-0 lg:h-screen lg:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.08)]">
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
        className={`fixed inset-y-0 right-0 z-50 w-[min(86vw,280px)] transform bg-white shadow-xl transition-transform duration-200 lg:hidden ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end border-b border-zinc-100 p-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {sidebarInner}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-6">
            <button
              type="button"
              className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold text-zinc-900">{title}</h1>
                {subtitle ? (
                  <p className="truncate text-xs text-zinc-500">{subtitle}</p>
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

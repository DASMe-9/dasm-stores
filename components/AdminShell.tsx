import Link from "next/link";
import { useRouter } from "next/router";
import {
  Home, Package, ShoppingCart, Users, BarChart3,
  Settings, Palette, Truck, CreditCard, Store, LogOut, Menu, X,
} from "lucide-react";
import { ReactNode, useState } from "react";

const NAV = [
  { href: "/dashboard",             label: "الرئيسية",      icon: Home },
  { href: "/dashboard/orders",      label: "الطلبات",       icon: ShoppingCart },
  { href: "/dashboard/products",    label: "المنتجات",      icon: Package },
  { href: "/dashboard/customers",   label: "العملاء",        icon: Users },
  { href: "/dashboard/analytics",   label: "التحليلات",      icon: BarChart3 },
];

const STORE_SECTION = [
  { href: "/dashboard/storefront",  label: "واجهة المتجر",   icon: Palette },
  { href: "/dashboard/shipping",    label: "الشحن",          icon: Truck },
  { href: "/dashboard/payments",    label: "المدفوعات",      icon: CreditCard },
  { href: "/dashboard/settings",    label: "الإعدادات",      icon: Settings },
];

interface Props {
  children: ReactNode;
  title?: string;
  storeName?: string;
  storeSlug?: string;
}

export default function AdminShell({ children, title, storeName = "متجري", storeSlug }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? router.pathname === href : router.pathname.startsWith(href);

  const NavLink = ({ href, label, icon: Icon }: any) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
        isActive(href)
          ? "bg-emerald-50 text-emerald-700 font-semibold"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-20">
        <button onClick={() => setOpen(true)} className="p-2 hover:bg-gray-50 rounded-lg">
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <div className="text-sm font-bold text-gray-900">{title || "لوحة التحكم"}</div>
        <div className="w-9" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 right-0 h-screen w-64 bg-white border-l border-gray-100 flex flex-col transition-transform z-30 ${
            open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Store header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">{storeName}</div>
                {storeSlug ? (
                  <a
                    href={`/${storeSlug}`}
                    target="_blank"
                    rel="noopener"
                    className="text-[11px] text-emerald-600 hover:underline truncate block"
                  >
                    عرض المتجر ↗
                  </a>
                ) : (
                  <div className="text-[11px] text-gray-400">متاجر داسم</div>
                )}
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="lg:hidden p-1.5 hover:bg-gray-50 rounded-lg">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
            {NAV.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}

            <div className="pt-4 pb-1 px-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                إعدادات المتجر
              </div>
            </div>
            {STORE_SECTION.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={() => {
                localStorage.removeItem("stores_token");
                router.push("/auth/login");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {open && (
          <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/30 z-20 lg:hidden" />
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">
          {title && (
            <div className="hidden lg:block bg-white border-b border-gray-100 px-8 py-5">
              <h1 className="text-lg font-bold text-gray-900">{title}</h1>
            </div>
          )}
          <div className="p-4 lg:p-8 max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

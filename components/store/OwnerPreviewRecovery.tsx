"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { syncStoresTokenCookie } from "@/lib/auth-token";

type Props = {
  slug: string;
};

type Phase = "loading" | "retry" | "login" | "forbidden" | "missing";

/**
 * Draft stores are hidden from anonymous SSR. When the owner opens ?preview=true,
 * sync the Sanctum token cookie and retry via the same-origin public-store proxy.
 */
export function OwnerPreviewRecovery({ slug }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function recover() {
      syncStoresTokenCookie();

      const token =
        typeof window !== "undefined" ? localStorage.getItem("stores_token")?.trim() : "";
      if (!token) {
        if (!cancelled) setPhase("login");
        return;
      }

      try {
        const res = await fetch(
          `/api/public-store/${encodeURIComponent(slug)}?preview=true`,
          { cache: "no-store", credentials: "same-origin" },
        );

        if (cancelled) return;

        if (res.ok) {
          router.refresh();
          return;
        }

        if (res.status === 401 || res.status === 403) {
          setPhase("forbidden");
          return;
        }

        if (res.status === 404) {
          setPhase("missing");
          return;
        }

        setPhase("retry");
        setDetail(`تعذّر تحميل المعاينة (${res.status}).`);
      } catch {
        if (!cancelled) {
          setPhase("retry");
          setDetail("تعذّر الاتصال بالخادم.");
        }
      }
    }

    void recover();

    return () => {
      cancelled = true;
    };
  }, [router, slug]);

  if (phase === "loading") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">جاري تحميل معاينة المتجر…</p>
      </div>
    );
  }

  if (phase === "login") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-bold">معاينة المتجر</h1>
        <p className="max-w-md text-sm text-[var(--muted-foreground)]">
          المتجر في وضع المسودة. سجّل دخولك كمالك المتجر من لوحة التاجر ثم افتح المعاينة مرة أخرى.
        </p>
        <Link
          href={`/auth/login?returnUrl=${encodeURIComponent(`/${slug}?preview=true`)}`}
          className="rounded-xl px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)]"
          style={{ backgroundColor: "var(--primary)" }}
        >
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  if (phase === "forbidden") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-bold">لا يمكن عرض المعاينة</h1>
        <p className="max-w-md text-sm text-[var(--muted-foreground)]">
          الحساب الحالي ليس مالك هذا المتجر. استخدم حساب المالك أو اطلب تفعيل المتجر من الكنترول روم.
        </p>
        <Link href="/dashboard" className="text-sm font-semibold underline">
          لوحة التاجر
        </Link>
      </div>
    );
  }

  if (phase === "missing") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-bold">المتجر غير متاح</h1>
        <p className="max-w-md text-sm text-[var(--muted-foreground)]">
          لم نجد متجراً بهذا الرابط في المنصة ({slug}). إن كان الربط مع Shopify ناجحاً، أكمِل إنشاء المتجر من لوحة
          التاجر ثم راجع الـ slug في الإعدادات.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/stores/new"
            className="rounded-xl px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)]"
            style={{ backgroundColor: "var(--primary)" }}
          >
            إنشاء متجر
          </Link>
          <Link href="/dashboard/import" className="text-sm font-semibold underline">
            استيراد المنتجات
          </Link>
          <Link href="/dashboard/settings" className="text-sm font-semibold underline">
            إعدادات المتجر
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-bold">تعذّر تحميل المعاينة</h1>
      {detail ? <p className="max-w-md text-sm text-[var(--muted-foreground)]">{detail}</p> : null}
      <button
        type="button"
        className="rounded-xl px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)]"
        style={{ backgroundColor: "var(--primary)" }}
        onClick={() => {
          setPhase("loading");
          setDetail(null);
          router.refresh();
        }}
      >
        إعادة المحاولة
      </button>
    </div>
  );
}

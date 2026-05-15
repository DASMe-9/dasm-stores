"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { StoreTab } from "@/lib/api-server";

export function ProductsToolbar({ tabs }: { tabs: StoreTab[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname ?? "/";
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString() ?? "");
  const [pending, startTransition] = useTransition();

  const qParam = params.get("q") ?? "";
  const [localQ, setLocalQ] = useState(qParam);

  useEffect(() => {
    setLocalQ(qParam);
  }, [qParam]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (localQ === qParam) return;
      startTransition(() => {
        const next = new URLSearchParams(params.toString());
        if (localQ.trim()) next.set("q", localQ.trim());
        else next.delete("q");
        next.delete("page");
        const qs = next.toString();
        router.push(qs ? `${basePath}?${qs}` : basePath);
      });
    }, 400);
    return () => clearTimeout(t);
  }, [localQ, qParam, params, basePath, router]);

  const replaceParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      startTransition(() => {
        const next = new URLSearchParams(params.toString());
        Object.entries(updates).forEach(([k, v]) => {
          if (v === undefined || v === "") next.delete(k);
          else next.set(k, v);
        });
        next.delete("page");
        const q = next.toString();
        router.push(q ? `${basePath}?${q}` : basePath);
      });
    },
    [params, basePath, router],
  );

  const tab = params.get("tab") ?? "";
  const sort = params.get("sort") ?? "newest";

  return (
    <div
      className="mb-6 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
      aria-busy={pending}
    >
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
        <label className="flex flex-1 min-w-[140px] flex-col gap-1 text-xs font-medium text-[var(--muted-foreground)]">
          بحث
          <input
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </label>

        <label className="flex min-w-[160px] flex-col gap-1 text-xs font-medium text-[var(--muted-foreground)]">
          تبويب
          <select
            value={tab}
            onChange={(e) => replaceParams({ tab: e.target.value || undefined })}
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <option value="">الكل</option>
            {tabs.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[160px] flex-col gap-1 text-xs font-medium text-[var(--muted-foreground)]">
          ترتيب
          <select
            value={sort}
            onChange={(e) => replaceParams({ sort: e.target.value })}
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <option value="newest">الأحدث</option>
            <option value="featured">المميز</option>
            <option value="price_asc">السعر ↑</option>
            <option value="price_desc">السعر ↓</option>
          </select>
        </label>
      </div>
    </div>
  );
}

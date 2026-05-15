"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

export function ExploreSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setQ(initial);
  }, [initial]);

  const pushQuery = useCallback(
    (value: string) => {
      startTransition(() => {
        const next = new URLSearchParams(params.toString());
        if (value.trim()) next.set("q", value.trim());
        else next.delete("q");
        const s = next.toString();
        router.push(s ? `/?${s}` : "/");
      });
    },
    [params, router],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (q === initial) return;
      pushQuery(q);
    }, 350);
    return () => clearTimeout(t);
  }, [q, initial, pushQuery]);

  return (
    <div className="relative mx-auto max-w-lg">
      <Search className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-[var(--muted-foreground)]" />
      <input
        type="search"
        placeholder="ابحث عن متجر..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] py-3.5 pr-12 pl-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        aria-busy={pending}
      />
    </div>
  );
}

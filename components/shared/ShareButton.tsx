"use client";

import { Share2 } from "lucide-react";
import { useCallback, useState } from "react";

export function ShareButton({
  title,
  url: urlProp,
  className = "",
}: {
  title: string;
  /** إن لم يُمرَّر يُستخدم عنوان الصفحة الحالية عند النقر */
  url?: string;
  className?: string;
}) {
  const [hint, setHint] = useState<string | null>(null);

  const share = useCallback(async () => {
    const url =
      urlProp ?? (typeof window !== "undefined" ? window.location.href : "");
    if (!url) return;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* إلغاء المستخدم أو خطأ — ننتقل للنسخ */
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setHint("تم نسخ الرابط");
      setTimeout(() => setHint(null), 2500);
    } catch {
      setHint("تعذّر نسخ الرابط");
      setTimeout(() => setHint(null), 2500);
    }
  }, [title, urlProp]);

  return (
    <span className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        onClick={share}
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
      >
        <Share2 className="h-4 w-4 shrink-0" aria-hidden />
        مشاركة
      </button>
      {hint ? (
        <span className="text-xs text-[var(--muted-foreground)]" role="status">
          {hint}
        </span>
      ) : null}
    </span>
  );
}

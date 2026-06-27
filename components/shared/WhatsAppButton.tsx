import { MessageCircle } from "lucide-react";

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function WhatsAppButton({
  phone,
  label = "واتساب",
  className = "",
}: {
  phone: string | null | undefined;
  label?: string;
  className?: string;
}) {
  if (!phone) return null;
  const n = digitsOnly(phone);
  if (!n) return null;
  const href = `https://wa.me/${n.startsWith("0") ? `966${n.slice(1)}` : n}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-[var(--space-2)] rounded-[var(--r)] bg-[var(--c-brand)] px-[var(--space-4)] py-[var(--space-3)] text-sm font-semibold text-[var(--c-on-brand)] shadow-[var(--shadow-sm)] transition hover:opacity-95 ${className}`}
    >
      <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </a>
  );
}

export function WhatsAppFab({ phone }: { phone: string | null | undefined }) {
  if (!phone) return null;
  const n = digitsOnly(phone);
  if (!n) return null;
  const href = `https://wa.me/${n.startsWith("0") ? `966${n.slice(1)}` : n}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-[var(--r-pill)] bg-[var(--c-brand)] text-[var(--c-on-brand)] shadow-[var(--shadow-lg)] md:bottom-8 md:left-8"
      aria-label="تواصل عبر واتساب"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

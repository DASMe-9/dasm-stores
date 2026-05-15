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
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-95 ${className}`}
      style={{
        backgroundColor: "var(--primary)",
        color: "var(--primary-foreground)",
      }}
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
      className="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg md:bottom-8 md:left-8"
      style={{ backgroundColor: "#25d366", color: "#fff" }}
      aria-label="تواصل عبر واتساب"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

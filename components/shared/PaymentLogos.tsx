/**
 * Accepted payment brands — matches what Paymob processes in KSA:
 * mada, Visa, Mastercard, Apple Pay. Clean, consistent brand tiles.
 */
export function PaymentLogos({ className = "" }: { className?: string }) {
  const tile =
    "inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm ring-1 ring-black/5 dark:border-zinc-700 dark:bg-zinc-950";

  return (
    <div className={`w-full rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 p-3 text-center ${className}`}>
      <p className="text-[11px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-300">مدفوعات آمنة عبر</p>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {/* mada */}
        <span className={tile}>
          <svg viewBox="0 0 60 24" className="h-5 w-auto" aria-label="mada" role="img">
            <text x="4" y="17" fontFamily="Arial,Helvetica,sans-serif" fontWeight="700" fontSize="15" fill="#1A2B5F">
              mada
            </text>
            <rect x="4" y="19.5" width="34" height="2.2" rx="1.1" fill="#84BD41" />
          </svg>
        </span>

        {/* Visa */}
        <span className={tile}>
          <svg viewBox="0 0 48 16" className="h-3.5 w-auto" aria-label="Visa" role="img">
            <path
              fill="#1A1F71"
              d="M19.5 1.2l-3.2 13.6h-2.6L16.9 1.2h2.6zm13.1 8.8l1.4-3.7.8 3.7h-2.2zm2.9 4.8h2.4L35.8 1.2h-2.2c-.5 0-.9.3-1.1.7l-3.8 12.9h2.7l.5-1.4h3.2l.4 1.4zM28 10.1c0 3.6 5 3.8 5 5.6 0 .5-.5 1-1.5 1-1.3 0-2.3-.5-2.9-.9l-.5 2.3c.7.3 1.9.6 3.2.6 3 0 4.4-1.5 4.4-3.7 0-4.7-5-5-5-5.6 0-.4.4-.9 1.4-.9 1 0 1.9.4 2.4.6l.5-2.2c-.6-.2-1.5-.5-2.7-.5-2.8 0-4.3 1.5-4.3 3.7zM15.4 1.2L11 14.8H8.2l-2-10.9c-.1-.5-.3-.7-.7-.9C4.7 2.6 3.5 2.3 2.4 2l.1-.8h4.3c.5 0 1 .4 1.1 1l1.1 5.6 2.6-6.6h2.8z"
            />
          </svg>
        </span>

        {/* Mastercard */}
        <span className={tile}>
          <svg viewBox="0 0 40 24" className="h-5 w-auto" aria-label="Mastercard" role="img">
            <circle cx="16" cy="12" r="7" fill="#EB001B" />
            <circle cx="24" cy="12" r="7" fill="#F79E1B" />
            <path d="M20 6.6a7 7 0 0 1 0 10.8 7 7 0 0 1 0-10.8z" fill="#FF5F00" />
          </svg>
        </span>

        {/* Apple Pay */}
        <span className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-black shadow-sm ring-1 ring-white/10">
          <svg viewBox="0 0 40 16" className="h-4 w-auto" aria-label="Apple Pay" role="img">
            <path
              fill="#fff"
              d="M8 3.1c-.45.53-1.17.95-1.89.89-.09-.72.26-1.49.67-1.97.45-.54 1.23-.93 1.86-.96.08.75-.21 1.49-.64 2.04zm.63 1.0c-1.04-.06-1.93.59-2.43.59-.5 0-1.27-.56-2.1-.55-1.08.02-2.08.63-2.63 1.6-1.12 1.95-.29 4.83.8 6.42.53.78 1.17 1.66 2 1.63.8-.03 1.1-.52 2.07-.52.96 0 1.24.52 2.09.5.86-.01 1.41-.79 1.94-1.58.61-.9.86-1.78.88-1.83-.02-.01-1.69-.65-1.71-2.58-.01-1.61 1.32-2.38 1.38-2.42-.76-1.11-1.93-1.24-2.34-1.27z"
            />
            <text x="14" y="12" fill="#fff" fontFamily="system-ui,-apple-system,Segoe UI,sans-serif" fontWeight="600" fontSize="9">
              Pay
            </text>
          </svg>
        </span>
      </div>

      <div className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
        <svg
          viewBox="0 0 12 12"
          className="h-3 w-3 text-emerald-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 6.5l2.5 2.5 5.5-5.5" />
        </svg>
        <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-200">دفع آمن ومشفر عبر</span>
        <span className="text-[10px] font-bold text-[#5546FF] dark:text-[#8B82FF]">Paymob</span>
      </div>
    </div>
  );
}

export function PaymentLogos({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <p className="text-[11px] text-gray-400">مدفوعات آمنة عبر</p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {/* Visa */}
        <svg viewBox="0 0 48 16" className="h-6 w-auto" aria-label="Visa">
          <path
            fill="#1A1F71"
            d="M19.5 1.2l-3.2 13.6h-2.6L16.9 1.2h2.6zm13.1 8.8l1.4-3.7.8 3.7h-2.2zm2.9 4.8h2.4L35.8 1.2h-2.2c-.5 0-.9.3-1.1.7l-3.8 12.9h2.7l.5-1.4h3.2l.4 1.4zM28 10.1c0 3.6 5 3.8 5 5.6 0 .5-.5 1-1.5 1-1.3 0-2.3-.5-2.9-.9l-.5 2.3c.7.3 1.9.6 3.2.6 3 0 4.4-1.5 4.4-3.7 0-4.7-5-5-5-5.6 0-.4.4-.9 1.4-.9 1 0 1.9.4 2.4.6l.5-2.2c-.6-.2-1.5-.5-2.7-.5-2.8 0-4.3 1.5-4.3 3.7zM15.4 1.2L11 14.8H8.2l-2-10.9c-.1-.5-.3-.7-.7-.9C4.7 2.6 3.5 2.3 2.4 2l.1-.8h4.3c.5 0 1 .4 1.1 1l1.1 5.6 2.6-6.6h2.8z"
          />
        </svg>

        {/* Mastercard */}
        <svg viewBox="0 0 40 24" className="h-6 w-auto" aria-label="Mastercard">
          <rect width="40" height="24" rx="3" fill="#fff" />
          <circle cx="15" cy="12" r="7" fill="#EB001B" />
          <circle cx="25" cy="12" r="7" fill="#F79E1B" />
          <path
            d="M20 6.8a7 7 0 0 1 2.6 5.2A7 7 0 0 1 20 17.2a7 7 0 0 1-2.6-5.2A7 7 0 0 1 20 6.8z"
            fill="#FF5F00"
          />
        </svg>

        {/* mada */}
        <svg viewBox="0 0 60 20" className="h-5 w-auto" aria-label="mada">
          <text
            x="0"
            y="15"
            fill="#003B71"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fontSize="14"
          >
            mada
          </text>
        </svg>

        {/* Apple Pay */}
        <svg viewBox="0 0 50 20" className="h-5 w-auto" aria-label="Apple Pay">
          <text
            x="0"
            y="15"
            fill="#000"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="600"
            fontSize="12"
          >
            Apple Pay
          </text>
        </svg>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <svg viewBox="0 0 60 18" className="h-4 w-auto" aria-label="Paymob">
          <text
            x="0"
            y="13"
            fill="#6C63FF"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fontSize="12"
          >
            Paymob
          </text>
        </svg>
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5 text-green-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="1" y="3" width="14" height="10" rx="2" />
          <path d="M5 8.5l2 2 4-4" />
        </svg>
        <span className="text-[10px] text-gray-400">دفع آمن ومشفّر</span>
      </div>
    </div>
  );
}

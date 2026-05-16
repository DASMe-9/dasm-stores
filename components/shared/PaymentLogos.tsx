export function PaymentLogos({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <p className="text-[11px] text-gray-400 tracking-wide">مدفوعات آمنة عبر</p>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* mada */}
        <span className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-white border border-gray-200 shadow-sm">
          <svg viewBox="0 0 80 24" className="h-4 w-auto" aria-label="mada">
            <path d="M8.5 6.5c-2.5 0-4.5 2-4.5 4.5v2.5c0 2.5 2 4.5 4.5 4.5h3c2.5 0 4.5-2 4.5-4.5V11c0-2.5-2-4.5-4.5-4.5h-3z" fill="#6DC53A"/>
            <path d="M21 6.5c-2.5 0-4.5 2-4.5 4.5v2.5c0 2.5 2 4.5 4.5 4.5h3c2.5 0 4.5-2 4.5-4.5V11c0-2.5-2-4.5-4.5-4.5h-3z" fill="#003B71"/>
            <text x="32" y="16" fill="#003B71" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="11">mada</text>
          </svg>
        </span>

        {/* Visa */}
        <span className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-white border border-gray-200 shadow-sm">
          <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-label="Visa">
            <path fill="#1A1F71" d="M19.5 1.2l-3.2 13.6h-2.6L16.9 1.2h2.6zm13.1 8.8l1.4-3.7.8 3.7h-2.2zm2.9 4.8h2.4L35.8 1.2h-2.2c-.5 0-.9.3-1.1.7l-3.8 12.9h2.7l.5-1.4h3.2l.4 1.4zM28 10.1c0 3.6 5 3.8 5 5.6 0 .5-.5 1-1.5 1-1.3 0-2.3-.5-2.9-.9l-.5 2.3c.7.3 1.9.6 3.2.6 3 0 4.4-1.5 4.4-3.7 0-4.7-5-5-5-5.6 0-.4.4-.9 1.4-.9 1 0 1.9.4 2.4.6l.5-2.2c-.6-.2-1.5-.5-2.7-.5-2.8 0-4.3 1.5-4.3 3.7zM15.4 1.2L11 14.8H8.2l-2-10.9c-.1-.5-.3-.7-.7-.9C4.7 2.6 3.5 2.3 2.4 2l.1-.8h4.3c.5 0 1 .4 1.1 1l1.1 5.6 2.6-6.6h2.8z"/>
          </svg>
        </span>

        {/* Mastercard */}
        <span className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-white border border-gray-200 shadow-sm">
          <svg viewBox="0 0 40 24" className="h-5 w-auto" aria-label="Mastercard">
            <circle cx="15" cy="12" r="7" fill="#EB001B"/>
            <circle cx="25" cy="12" r="7" fill="#F79E1B"/>
            <path d="M20 6.8a7 7 0 0 1 2.6 5.2A7 7 0 0 1 20 17.2a7 7 0 0 1-2.6-5.2A7 7 0 0 1 20 6.8z" fill="#FF5F00"/>
          </svg>
        </span>

        {/* Apple Pay */}
        <span className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-black shadow-sm">
          <svg viewBox="0 0 50 20" className="h-4 w-auto" aria-label="Apple Pay">
            <path fill="#fff" d="M9.2 3.2c-.5.6-1.3 1-2 1-.1-.8.3-1.6.7-2.1.5-.6 1.3-1 2-1 .1.8-.2 1.5-.7 2.1zm.7 1.1c-1.1-.1-2.1.6-2.6.6-.5 0-1.4-.6-2.3-.6C3.8 4.3 2.7 5 2 6.1.7 8.3 1.6 11.6 2.9 13.4c.6.9 1.4 1.9 2.3 1.9.9 0 1.3-.6 2.4-.6s1.4.6 2.4.6c1 0 1.6-.9 2.2-1.8.7-1 1-2 1-2-.1 0-1.9-.7-1.9-2.8 0-1.8 1.4-2.6 1.5-2.7-.8-1.2-2.1-1.4-2.5-1.4-.1 0-.2 0-.4.1z"/>
            <text x="18" y="14" fill="#fff" fontFamily="system-ui,-apple-system,sans-serif" fontWeight="600" fontSize="9.5">Pay</text>
          </svg>
        </span>

        {/* STC Pay */}
        <span className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-white border border-gray-200 shadow-sm">
          <svg viewBox="0 0 60 20" className="h-4 w-auto" aria-label="STC Pay">
            <text x="0" y="14" fill="#4F008C" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="10">stc</text>
            <text x="22" y="14" fill="#4F008C" fontFamily="Arial,sans-serif" fontWeight="500" fontSize="9">pay</text>
          </svg>
        </span>

        {/* AMEX */}
        <span className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-[#006FCF] shadow-sm">
          <svg viewBox="0 0 50 16" className="h-3.5 w-auto" aria-label="American Express">
            <text x="2" y="12" fill="#fff" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="8">AMEX</text>
          </svg>
        </span>
      </div>

      {/* Paymob badge */}
      <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1">
        <svg viewBox="0 0 12 12" className="h-3 w-3 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6.5l2.5 2.5 5.5-5.5"/>
        </svg>
        <span className="text-[10px] text-gray-500 font-medium">دفع آمن ومشفّر عبر</span>
        <span className="text-[10px] text-[#6C63FF] font-bold">Paymob</span>
      </div>
    </div>
  );
}

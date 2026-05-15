import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">الصفحة غير موجودة</h1>
      <p className="max-w-md text-sm text-[var(--muted-foreground)]">
        الرابط غير صحيح أو لم يعد متاحاً.
      </p>
      <Link
        href="/"
        className="rounded-xl px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)]"
        style={{ backgroundColor: "var(--primary)" }}
      >
        العودة للاستكشاف
      </Link>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { trackOrder } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ slug: string; orderNumber: string }>;
}) {
  const { slug, orderNumber } = await params;
  const data = (await trackOrder(slug, orderNumber)) as {
    order?: {
      order_number?: string;
      status?: string;
      payment_status?: string;
      tracking_number?: string | null;
      carrier?: string | null;
      total?: string | number;
      created_at?: string;
    };
    items?: unknown[];
  } | null;

  if (!data?.order) notFound();

  const o = data.order;

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div>
        <h1 className="text-lg font-bold">تتبع الطلب</h1>
        <p className="mt-1 font-mono text-sm text-[var(--muted-foreground)]">{o.order_number}</p>
      </div>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-2 border-b border-[var(--border)] pb-2">
          <dt className="text-[var(--muted-foreground)]">الحالة</dt>
          <dd className="font-medium">{o.status ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-2 border-b border-[var(--border)] pb-2">
          <dt className="text-[var(--muted-foreground)]">الدفع</dt>
          <dd className="font-medium">{o.payment_status ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-2 border-b border-[var(--border)] pb-2">
          <dt className="text-[var(--muted-foreground)]">الإجمالي</dt>
          <dd className="font-medium">
            {o.total != null ? `${Number(o.total).toFixed(2)} ر.س` : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-2 border-b border-[var(--border)] pb-2">
          <dt className="text-[var(--muted-foreground)]">الشحن</dt>
          <dd className="font-medium">
            {o.carrier ?? "—"}
            {o.tracking_number ? ` — ${o.tracking_number}` : ""}
          </dd>
        </div>
      </dl>
      <Link href={`/store/${slug}`} className="block text-center text-sm hover:underline">
        العودة للمتجر
      </Link>
    </div>
  );
}

import Link from "next/link";
import { CheckoutSuccessTracker } from "@/components/store/CheckoutSuccessTracker";
import { getStore } from "@/lib/api-server";
import { getStorefrontRequestContext } from "@/lib/storefront-preview-server";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const order = sp.order;
  const requestContext = await getStorefrontRequestContext();
  const storeData = await getStore(slug, requestContext);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center space-y-4">
      <CheckoutSuccessTracker
        slug={slug}
        orderNumber={order}
        config={storeData?.marketing_tracking}
      />
      <h1 className="text-xl font-bold">تم استلام الطلب</h1>
      <p className="text-sm text-[var(--muted-foreground)]">
        شكراً لثقتك. إن وُجد رابط دفع فقد تم توجيهك إليه؛ ويمكنك متابعة حالة الطلب من صفحة التتبع.
      </p>
      {order ? (
        <p className="rounded-xl bg-[var(--muted)] px-4 py-2 font-mono text-sm">
          رقم الطلب: {order}
        </p>
      ) : null}
      <div className="flex flex-col gap-2 pt-2">
        {order ? (
          <Link
            href={`/${slug}/track/${encodeURIComponent(order)}`}
            className="rounded-xl py-3 text-sm font-bold text-[var(--primary-foreground)]"
            style={{ backgroundColor: "var(--primary)" }}
          >
            تتبع الطلب
          </Link>
        ) : null}
        <Link href={`/${slug}`} className="text-sm hover:underline">
          العودة للمتجر
        </Link>
      </div>
    </div>
  );
}

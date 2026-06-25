import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/api-server";
import { getStorefrontRequestContext } from "@/lib/storefront-preview-server";
import { ensurePublicStore } from "@/lib/storefront-guards";
import { getStoreDisplayName } from "@/lib/store-display";
import { getPolicyDoc, isPolicyKey } from "@/lib/legal/policies";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string; doc: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, doc } = await params;
  if (!isPolicyKey(doc)) return { title: "صفحة غير موجودة" };
  const requestContext = await getStorefrontRequestContext();
  const storeData = await getStore(slug, requestContext);
  const store = storeData?.store;
  if (!store) return { title: "صفحة غير موجودة" };
  const policy = getPolicyDoc(doc, store);
  return { title: `${policy.title} — ${getStoreDisplayName(store)}` };
}

export default async function StorePolicyPage({ params }: Props) {
  const { slug, doc } = await params;
  if (!isPolicyKey(doc)) notFound();

  const requestContext = await getStorefrontRequestContext();
  const storeData = await getStore(slug, requestContext);
  if (!ensurePublicStore(storeData, requestContext)) return null;

  const store = storeData!.store;
  const policy = getPolicyDoc(doc, store);

  return (
    <article dir="rtl" className="mx-auto w-full max-w-3xl py-2">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">{policy.title}</h1>
      {policy.intro && <p className="mt-3 leading-7 text-[var(--muted-foreground)]">{policy.intro}</p>}

      <div className="mt-6 space-y-6">
        {policy.sections.map((section, i) => (
          <section key={i} className="space-y-2">
            {section.heading && (
              <h2 className="text-lg font-semibold text-[var(--foreground)]">{section.heading}</h2>
            )}
            {section.body.map((paragraph, j) => (
              <p key={j} className="leading-7 text-[var(--muted-foreground)]">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}

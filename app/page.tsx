import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreSearch } from "@/components/explore/ExploreSearch";
import { StoreGrid } from "@/components/explore/StoreGrid";
import { getExploreStores } from "@/lib/api-server";
import { SITE, buildTitle, canonicalUrl, itemListSchema, jsonLdString } from "@/lib/seo";

export const revalidate = 120;

export const metadata: Metadata = {
  title: buildTitle("استكشف المتاجر"),
  description: SITE.defaultDescription,
  alternates: { canonical: canonicalUrl("/") },
};

function ExploreSearchFallback() {
  return (
    <div className="mx-auto h-12 max-w-lg animate-pulse rounded-2xl bg-white/25" aria-hidden />
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const paginator = await getExploreStores({
    q,
    per_page: 24,
  });

  const listLd = itemListSchema(
    "متاجر داسم",
    paginator.data.map((s) => ({
      name: s.name,
      url: `/store/${s.slug}`,
      image: s.logo_url ?? undefined,
    })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(listLd) }}
      />
      <div className="min-h-screen bg-[var(--background)]">
        <section
          className="px-4 pb-10 pt-14 text-[var(--primary-foreground)]"
          style={{
            background: `linear-gradient(to left, var(--primary), var(--accent))`,
          }}
        >
          <div className="mx-auto max-w-4xl text-center space-y-4">
            <h1 className="text-3xl font-extrabold md:text-4xl">متاجر داسم</h1>
            <p className="text-sm opacity-90 md:text-base">
              معارض، تجار، ومتاجر أفراد — في منصة واحدة
            </p>
            <Suspense fallback={<ExploreSearchFallback />}>
              <ExploreSearch />
            </Suspense>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm">
            <a
              href="https://dasm.com.sa/auctions"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl px-4 py-2 font-medium hover:bg-[var(--muted)]"
              style={{ border: "1px solid var(--border)" }}
            >
              تصفّح المزادات
            </a>
            <a
              href="https://dasm.com.sa/classifieds"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl px-4 py-2 font-medium hover:bg-[var(--muted)]"
              style={{ border: "1px solid var(--border)" }}
            >
              السوق الكبير
            </a>
            <a
              href="https://dasm.com.sa"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl px-4 py-2 font-medium hover:bg-[var(--muted)]"
              style={{ border: "1px solid var(--border)" }}
            >
              منصة داسم
            </a>
          </div>

          <StoreGrid stores={paginator.data} />

          {paginator.last_page > 1 ? (
            <p className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
              يوجد المزيد من المتاجر — الترقيم يُضاف لاحقاً.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}

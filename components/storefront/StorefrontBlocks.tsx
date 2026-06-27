/**
 * Public storefront renderer for the visual builder (Phase 4, hybrid).
 *
 * Content/marketing blocks (announcement, hero, features, categories, banners,
 * testimonials, faq, newsletter, …) are rendered through the SAME BlockRenderer
 * used by the editor preview — so the published page looks materially identical
 * to what the merchant saw.
 *
 * Product blocks (featured, product-grid) are rendered with the REAL,
 * interactive <ProductGrid> (links + cart), NOT the preview cards — so shopping
 * keeps working. navbar/footer blocks are skipped because the store chrome
 * (StoreHeader/StoreTabsNav + layout footer) already provides them.
 */

import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BlockRenderer } from "@/components/theme-editor/BlockRenderer";
import type { Block, ThemeDesign } from "@/lib/themes/blocks";
import type { StoreProductCard } from "@/lib/api-server";

const PRODUCT_BLOCKS = new Set(["featured", "product-grid"]);
const CHROME_BLOCKS = new Set(["navbar", "footer"]);

function num(v: unknown, fallback: number): number {
  return typeof v === "number" ? v : fallback;
}
function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function StorefrontBlocks({
  blocks,
  products,
  slug,
  storeName,
  design,
  skipProductBlocks = false,
}: {
  blocks: Block[];
  products: StoreProductCard[];
  slug: string;
  storeName: string;
  design: ThemeDesign;
  /** On the products page the real grid+filters follow, so omit product blocks. */
  skipProductBlocks?: boolean;
}) {
  const ctx = { storeName, primaryColor: "var(--c-brand)", products: [], design };
  const visible = blocks.filter(
    (b) =>
      b.attrs.hidden !== true &&
      !CHROME_BLOCKS.has(b.type) &&
      !(skipProductBlocks && PRODUCT_BLOCKS.has(b.type)),
  );

  // Render in order: flush runs of content blocks through BlockRenderer, and
  // render product blocks with the real interactive grid.
  const out: React.ReactNode[] = [];
  let run: Block[] = [];
  const flush = (key: string) => {
    if (run.length) {
      out.push(<BlockRenderer key={`c-${key}`} blocks={run} ctx={ctx} />);
      run = [];
    }
  };

  visible.forEach((block, i) => {
    if (PRODUCT_BLOCKS.has(block.type)) {
      flush(String(i));
      const limit = num(block.attrs.limit, block.type === "featured" ? 4 : 12);
      const title = str(block.attrs.title);
      out.push(
        <section key={`p-${i}`} className="py-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            {title ? (
              <h2 className="text-lg font-bold text-[var(--c-text)]">{title}</h2>
            ) : (
              <span />
            )}
            <Link
              href={`/${slug}/products`}
              className="whitespace-nowrap text-sm font-semibold text-[var(--c-brand)] hover:underline"
            >
              عرض الكل ←
            </Link>
          </div>
          <ProductGrid products={products.slice(0, limit)} slug={slug} />
        </section>,
      );
    } else {
      run.push(block);
    }
  });
  flush("end");

  return <div className="space-y-[var(--space-4)]">{out}</div>;
}

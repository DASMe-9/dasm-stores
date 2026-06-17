/**
 * "No empty store" default template.
 *
 * Every store is born with this elegant landing surface applied automatically.
 * A lazy/non-technical owner never opens the editor and still gets a polished
 * face instead of a raw product dump. Power users edit from this baseline; a
 * "restore default" action returns here, so the platform is never disfigured.
 */

import type { Block, BlockDocument, ThemeSurface } from "./types";
import { BLOCK_EDITOR_VERSION, DEFAULT_DESIGN } from "./types";
import { serializeBlocks } from "./parse";

export const DEFAULT_BLOCKS: Block[] = [
  { id: "d1", type: "navbar", attrs: { logo: true, links: ["الرئيسية", "المنتجات", "تواصل"], sticky: true } },
  { id: "d2", type: "banner", attrs: { text: "شحن مجاني للطلبات فوق ٢٠٠ ر.س" } },
  {
    id: "d3",
    type: "hero",
    attrs: {
      title: "{{ store.name }}",
      subtitle: "تشكيلة مختارة بعناية — جودة تستحقها",
      cta: "تسوّق الآن",
      style: "aurora",
    },
  },
  { id: "d4", type: "featured", attrs: { title: "الأكثر مبيعاً", limit: 4 } },
  { id: "d5", type: "product-grid", attrs: { title: "كل المنتجات", cols: 3, sort: "newest", limit: 12 } },
  { id: "d6", type: "footer", attrs: { about: "{{ store.name }}", terms: "الشروط والأحكام", social: ["whatsapp", "instagram"] } },
];

export const DEFAULT_SOURCE = `{# الواجهة الافتراضية — عدّل أو احذف أي بلوك #}
${serializeBlocks(DEFAULT_BLOCKS)}`;

/** Products page surface: a focused catalog (navbar + grid + footer). */
export const DEFAULT_PRODUCTS_BLOCKS: Block[] = [
  { id: "p1", type: "navbar", attrs: { logo: true, links: ["الرئيسية", "المنتجات", "تواصل"], sticky: true } },
  { id: "p2", type: "product-grid", attrs: { title: "كل المنتجات", cols: 3, sort: "newest", limit: 24 } },
  { id: "p3", type: "footer", attrs: { about: "{{ store.name }}", terms: "الشروط والأحكام", social: ["whatsapp", "instagram"] } },
];

export const DEFAULT_PRODUCTS_SOURCE = `{# صفحة المنتجات الافتراضية — عدّل أو احذف أي بلوك #}
${serializeBlocks(DEFAULT_PRODUCTS_BLOCKS)}`;

export function defaultSurfaceSource(surface: ThemeSurface): string {
  return surface === "products" ? DEFAULT_PRODUCTS_SOURCE : DEFAULT_SOURCE;
}

export function defaultBlockDocument(): BlockDocument {
  return {
    version: BLOCK_EDITOR_VERSION,
    surfaces: { landing: DEFAULT_SOURCE, products: DEFAULT_PRODUCTS_SOURCE },
    design: { ...DEFAULT_DESIGN },
  };
}

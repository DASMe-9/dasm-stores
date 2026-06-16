/**
 * Read/merge the block document into the existing `theme_config` JSON without
 * disturbing the preset-based fields (preset_id/palette) the legacy theme
 * picker relies on. Fully additive.
 */

import type { BlockDocument } from "./types";
import { BLOCK_DOC_CONFIG_KEY, BLOCK_EDITOR_VERSION } from "./types";
import { defaultBlockDocument, DEFAULT_PRODUCTS_SOURCE } from "./default-template";

/**
 * Read the block document, migrating the v1 single-source shape
 * (`{ version, source }`) to the v2 two-surface shape transparently.
 */
export function readBlockDocument(themeConfig: Record<string, unknown> | null | undefined): BlockDocument {
  const raw = themeConfig?.[BLOCK_DOC_CONFIG_KEY];
  if (raw && typeof raw === "object") {
    const doc = raw as Partial<BlockDocument> & { source?: string };
    // v2: explicit surfaces
    if (doc.surfaces && typeof doc.surfaces === "object") {
      const landing = typeof doc.surfaces.landing === "string" && doc.surfaces.landing.trim()
        ? doc.surfaces.landing
        : defaultBlockDocument().surfaces.landing;
      const products = typeof doc.surfaces.products === "string" && doc.surfaces.products.trim()
        ? doc.surfaces.products
        : DEFAULT_PRODUCTS_SOURCE;
      return { version: BLOCK_EDITOR_VERSION, surfaces: { landing, products } };
    }
    // v1 migration: a single source becomes the landing surface
    if (typeof doc.source === "string" && doc.source.trim()) {
      return { version: BLOCK_EDITOR_VERSION, surfaces: { landing: doc.source, products: DEFAULT_PRODUCTS_SOURCE } };
    }
  }
  return defaultBlockDocument();
}

export function mergeBlockDocument(
  themeConfig: Record<string, unknown> | null | undefined,
  doc: BlockDocument,
): Record<string, unknown> {
  return { ...(themeConfig ?? {}), [BLOCK_DOC_CONFIG_KEY]: doc };
}

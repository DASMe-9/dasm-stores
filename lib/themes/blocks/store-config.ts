/**
 * Read/merge the block document into the existing `theme_config` JSON without
 * disturbing the preset-based fields (preset_id/palette) the legacy theme
 * picker relies on. Fully additive.
 */

import type { BlockDocument } from "./types";
import { BLOCK_DOC_CONFIG_KEY, BLOCK_EDITOR_VERSION } from "./types";
import { defaultBlockDocument } from "./default-template";

export function readBlockDocument(themeConfig: Record<string, unknown> | null | undefined): BlockDocument {
  const raw = themeConfig?.[BLOCK_DOC_CONFIG_KEY];
  if (raw && typeof raw === "object") {
    const doc = raw as Partial<BlockDocument>;
    if (typeof doc.source === "string" && doc.source.trim()) {
      return { version: typeof doc.version === "number" ? doc.version : BLOCK_EDITOR_VERSION, source: doc.source };
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

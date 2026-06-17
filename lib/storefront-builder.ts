/**
 * Server-side helpers that bridge the saved visual-builder document
 * (theme_config.editor) to the public storefront. Gated so only stores that
 * actually used the builder get block rendering; everything else keeps the
 * existing storefront untouched.
 */

import { readBlockDocument, parseBlocks } from "@/lib/themes/blocks";
import type { Block, ThemeDesign, ThemeSurface } from "@/lib/themes/blocks";

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}

/** True only when the merchant has a saved builder document. */
export function hasBuilderLayout(themeConfig: unknown): boolean {
  if (!isRecord(themeConfig)) return false;
  const editor = themeConfig.editor;
  return isRecord(editor) && (isRecord(editor.surfaces) || typeof editor.source === "string");
}

/** Parse a surface from the saved document into validated blocks + design. */
export function readBuilderSurface(
  themeConfig: unknown,
  surface: ThemeSurface,
): { blocks: Block[]; design: ThemeDesign } {
  const config = isRecord(themeConfig) ? themeConfig : {};
  const doc = readBlockDocument(config);
  return { blocks: parseBlocks(doc.surfaces[surface]).blocks, design: doc.design };
}

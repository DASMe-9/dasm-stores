/**
 * Declarative block DSL for the native DASM store theme editor.
 *
 * Blocks are *data*, never executable code. A block document is an ordered
 * list of typed blocks with a small, fixed set of string/number/boolean/list
 * attributes. There is no JS/HTML/Liquid evaluation path — the renderer maps
 * each block type to a pre-built React preview component. This is the core of
 * the security model: no execution sink means no XSS/SSTI to exploit.
 */

export type BlockType =
  | "navbar"
  | "banner"
  | "hero"
  | "richtext"
  | "featured"
  | "product-grid"
  | "footer";

export type BlockAttrValue = string | number | boolean | string[];

export type Block = {
  /** Stable id for keys/drag — assigned at parse time, not persisted in DSL source. */
  id: string;
  type: BlockType;
  attrs: Record<string, BlockAttrValue>;
};

export type ParseError = {
  line: number;
  message: string;
};

export type ParseResult = {
  blocks: Block[];
  errors: ParseError[];
};

/** The two themeable storefront surfaces (Shopify-style). */
export type ThemeSurface = "landing" | "products";

export const THEME_SURFACES: ThemeSurface[] = ["landing", "products"];

export const SURFACE_LABEL_AR: Record<ThemeSurface, string> = {
  landing: "الواجهة",
  products: "صفحة المنتجات",
};

/**
 * Persisted shape inside `store.theme_config.editor`.
 * Each surface holds its own serialized DSL source (the user-edited source of truth).
 */
export type BlockDocument = {
  version: number;
  surfaces: Record<ThemeSurface, string>;
};

export const BLOCK_EDITOR_VERSION = 2;

/** Key under `theme_config` where the block document lives (additive, non-breaking). */
export const BLOCK_DOC_CONFIG_KEY = "editor";

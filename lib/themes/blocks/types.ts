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
  | "announcement"
  | "banner"
  | "hero"
  | "features"
  | "categories"
  | "image-banner"
  | "image-with-text"
  | "richtext"
  | "featured"
  | "product-grid"
  | "brands"
  | "testimonials"
  | "faq"
  | "newsletter"
  | "spacer"
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
 * Global design controls applied across all surfaces (Canva-style knobs).
 * Stored under `theme_config.editor.design`. All values are constrained to a
 * fixed set — never free CSS — so they can never become an execution sink.
 */
export type ThemeDesign = {
  themeColor: string;
  background: "light" | "soft" | "dark";
  buttonStyle: "solid" | "outline" | "pill";
  cornerRadius: "sharp" | "rounded" | "round";
  layoutWidth: "boxed" | "full";
  productCardStyle: "simple" | "modern" | "premium";
  font: "tajawal" | "cairo" | "system";
};

export const DEFAULT_DESIGN: ThemeDesign = {
  themeColor: "#059669",
  background: "light",
  buttonStyle: "solid",
  cornerRadius: "rounded",
  layoutWidth: "boxed",
  productCardStyle: "modern",
  font: "tajawal",
};

/**
 * Persisted shape inside `store.theme_config.editor`.
 * Each surface holds its own serialized DSL source (the user-edited source of truth).
 */
export type BlockDocument = {
  version: number;
  surfaces: Record<ThemeSurface, string>;
  design: ThemeDesign;
};

export const BLOCK_EDITOR_VERSION = 3;

/** Key under `theme_config` where the block document lives (additive, non-breaking). */
export const BLOCK_DOC_CONFIG_KEY = "editor";

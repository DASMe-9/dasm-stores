/** Native DASM store theme preset — not WordPress. Scales to 100+ entries. */

export type ThemeMarket = "automotive" | "general" | "mixed";

export type ThemePreviewStyle =
  | "luxury-dark"
  | "sport-red"
  | "clean-light"
  | "industrial"
  | "warm-retail"
  | "minimal-boutique"
  | "playful-kids"
  | "jewel-gold"
  | "tech-slate"
  | "marketplace-grid";

export type ThemeHeaderStyle =
  | "centered-logo"
  | "split-nav"
  | "minimal-sticky"
  | "showroom-wide"
  | "boutique-compact";

export type ThemeProductCardStyle =
  | "rounded-shadow"
  | "flat-grid"
  | "luxury-tall"
  | "compact-dense"
  | "highlight-price";

export type ThemeHeroStyle =
  | "aurora"
  | "spotlight"
  | "mesh"
  | "silk"
  | "neon"
  | "showroom-banner";

export type ThemeTypography = {
  fontFamilyAr: string;
  fontFamilyEn: string;
  headingWeight: number;
  bodyWeight: number;
  scale: "comfortable" | "compact" | "display";
};

export type ThemeColors = {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  card: string;
  border: string;
  muted: string;
  mutedForeground: string;
};

export type ThemePreset = {
  id: string;
  nameAr: string;
  nameEn: string;
  market: ThemeMarket;
  category: string;
  previewStyle: ThemePreviewStyle;
  colors: ThemeColors;
  typography: ThemeTypography;
  headerStyle: ThemeHeaderStyle;
  productCardStyle: ThemeProductCardStyle;
  heroStyle: ThemeHeroStyle;
  enabledSections: string[];
  suitableFor: string[];
  sortOrder: number;
};

export type StoreThemePayload = {
  css_variables: Record<string, string>;
  template_config: Record<string, string | string[] | boolean | number>;
};

export const THEME_CATALOG_VERSION = 1;

export const THEME_STORAGE_KEY = "dasm_store_theme_preset_id";

export const THEME_PREVIEW_STORAGE_KEY = "dasm_store_theme_preview_preset_id";

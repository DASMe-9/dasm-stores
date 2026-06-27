import type { ThemePreset } from "./types";

export type StorefrontPresetId = "quiet" | "night" | "vivid" | "auto" | "warm";

export type StorefrontTokens = {
  "--c-bg": string;
  "--c-surface": string;
  "--c-surface-2": string;
  "--c-text": string;
  "--c-muted": string;
  "--c-line": string;
  "--c-brand": string;
  "--c-on-brand": string;
  "--c-accent": string;
  "--c-sale": string;
  "--font-display": string;
  "--font-body": string;
  "--r-sm": string;
  "--r": string;
  "--r-lg": string;
  "--r-pill": string;
  "--space-1": string;
  "--space-2": string;
  "--space-3": string;
  "--space-4": string;
  "--space-5": string;
  "--space-6": string;
  "--space-8": string;
  "--type-body": string;
  "--type-nav": string;
  "--type-trust": string;
  "--type-product-title": string;
  "--type-price": string;
  "--type-section-title": string;
  "--shadow-sm": string;
  "--shadow": string;
  "--shadow-lg": string;
};

export const STOREFRONT_PRESET_IDS = ["quiet", "night", "vivid", "auto", "warm"] as const;

export const STOREFRONT_CATEGORY_PRESET_MAP: Record<string, StorefrontPresetId> = {
  fashion: "quiet",
  accessories: "quiet",
  women: "quiet",
  perfume: "night",
  beauty: "night",
  luxury: "night",
  tech: "vivid",
  electronics: "vivid",
  smarthome: "vivid",
  "smart-home": "vivid",
  "smart home": "vivid",
  auto: "auto",
  "auto-parts": "auto",
  "auto parts": "auto",
  autoparts: "auto",
  tires: "auto",
  batteries: "auto",
  home: "warm",
  kitchen: "warm",
  kids: "warm",
  camping: "warm",
};

export const STOREFRONT_CATEGORY_ID_PRESET_MAP: Record<string, StorefrontPresetId> = {
  automotive: "auto",
  auto: "auto",
  cars: "auto",
  "car-accessories": "auto",
  "auto-accessories": "auto",
  "automotive-accessories": "auto",
  "auto-parts": "auto",
  tires: "auto",
  batteries: "auto",
};

const CATEGORY_ALIAS_PRESET_MAP: Record<string, StorefrontPresetId> = {
  "car accessories": "auto",
  "cars accessories": "auto",
  "auto accessories": "auto",
  "automotive accessories": "auto",
  "accessories cars": "auto",
  "accessories-cars": "auto",
  "اكسسوارات سيارات": "auto",
  "إكسسوارات سيارات": "auto",
  "اكسسوارات السيارات": "auto",
  "إكسسوارات السيارات": "auto",
  "مستلزمات سيارات": "auto",
  "مستلزمات السيارات": "auto",
  "قطع غيار": "auto",
  "قطع غيار سيارات": "auto",
  "اطارات": "auto",
  "إطارات": "auto",
  "بطاريات": "auto",
};

const baseScale = {
  "--font-display": '"Reem Kufi", var(--font-display-loaded), system-ui, sans-serif',
  "--font-body": '"IBM Plex Sans Arabic", var(--font-body-loaded), system-ui, sans-serif',
  "--r-sm": "8px",
  "--r": "14px",
  "--r-lg": "24px",
  "--r-pill": "999px",
  "--space-1": "0.25rem",
  "--space-2": "0.5rem",
  "--space-3": "0.75rem",
  "--space-4": "1rem",
  "--space-5": "1.25rem",
  "--space-6": "1.5rem",
  "--space-8": "2rem",
  "--type-body": "clamp(1rem, 0.96rem + 0.18vw, 1.125rem)",
  "--type-nav": "clamp(0.95rem, 0.9rem + 0.2vw, 1.0625rem)",
  "--type-trust": "clamp(0.875rem, 0.82rem + 0.18vw, 1rem)",
  "--type-product-title": "clamp(1rem, 0.94rem + 0.25vw, 1.125rem)",
  "--type-price": "clamp(1.125rem, 1.04rem + 0.32vw, 1.375rem)",
  "--type-section-title": "clamp(1.25rem, 1.08rem + 0.55vw, 1.75rem)",
  "--shadow-sm": "0 1px 2px color-mix(in srgb, var(--c-text) 7%, transparent)",
  "--shadow": "0 12px 32px color-mix(in srgb, var(--c-text) 10%, transparent)",
  "--shadow-lg": "0 24px 60px color-mix(in srgb, var(--c-text) 14%, transparent)",
} satisfies Omit<StorefrontTokens, `--c-${string}`>;

export const STOREFRONT_TOKEN_PRESETS: Record<StorefrontPresetId, StorefrontTokens> = {
  quiet: {
    "--c-bg": "#F3F0EA",
    "--c-surface": "#FFFFFF",
    "--c-surface-2": "#FAF8F4",
    "--c-text": "#1C2B27",
    "--c-muted": "#5F6A63",
    "--c-line": "#E4DED4",
    "--c-brand": "#1C3A33",
    "--c-on-brand": "#F4F1EB",
    "--c-accent": "#A8763E",
    "--c-sale": "#9C5B3B",
    ...baseScale,
  },
  night: {
    "--c-bg": "#16191A",
    "--c-surface": "#1F2426",
    "--c-surface-2": "#232829",
    "--c-text": "#ECE6DB",
    "--c-muted": "#A7A092",
    "--c-line": "#2E3436",
    "--c-brand": "#C49A5E",
    "--c-on-brand": "#16191A",
    "--c-accent": "#C49A5E",
    "--c-sale": "#CC8259",
    ...baseScale,
  },
  vivid: {
    "--c-bg": "#F5F8FC",
    "--c-surface": "#FFFFFF",
    "--c-surface-2": "#EDF3FA",
    "--c-text": "#11314F",
    "--c-muted": "#5A7186",
    "--c-line": "#DCE6F0",
    "--c-brand": "#0A4B8C",
    "--c-on-brand": "#FFFFFF",
    "--c-accent": "#E8841A",
    "--c-sale": "#D2552E",
    ...baseScale,
  },
  auto: {
    "--c-bg": "#F4F5F6",
    "--c-surface": "#FFFFFF",
    "--c-surface-2": "#EAECEE",
    "--c-text": "#1A2024",
    "--c-muted": "#5B6770",
    "--c-line": "#DCE0E3",
    "--c-brand": "#1F2933",
    "--c-on-brand": "#FFFFFF",
    "--c-accent": "#E0892B",
    "--c-sale": "#C2410C",
    ...baseScale,
  },
  warm: {
    "--c-bg": "#F6F1EA",
    "--c-surface": "#FFFFFF",
    "--c-surface-2": "#FBF6EF",
    "--c-text": "#33271C",
    "--c-muted": "#6E6052",
    "--c-line": "#E8DFD2",
    "--c-brand": "#7A4A2B",
    "--c-on-brand": "#FBF6EF",
    "--c-accent": "#C8843C",
    "--c-sale": "#A85530",
    ...baseScale,
  },
};

export const STOREFRONT_THEME_PRESETS: ThemePreset[] = [
  {
    id: "quiet",
    nameAr: "هادئ",
    nameEn: "Quiet",
    market: "mixed",
    category: "storefront",
    previewStyle: "minimal-boutique",
    colors: {
      primary: STOREFRONT_TOKEN_PRESETS.quiet["--c-brand"],
      accent: STOREFRONT_TOKEN_PRESETS.quiet["--c-accent"],
      background: STOREFRONT_TOKEN_PRESETS.quiet["--c-bg"],
      foreground: STOREFRONT_TOKEN_PRESETS.quiet["--c-text"],
      card: STOREFRONT_TOKEN_PRESETS.quiet["--c-surface"],
      border: STOREFRONT_TOKEN_PRESETS.quiet["--c-line"],
      muted: STOREFRONT_TOKEN_PRESETS.quiet["--c-surface-2"],
      mutedForeground: STOREFRONT_TOKEN_PRESETS.quiet["--c-muted"],
    },
    typography: {
      fontFamilyAr: STOREFRONT_TOKEN_PRESETS.quiet["--font-body"],
      fontFamilyEn: STOREFRONT_TOKEN_PRESETS.quiet["--font-body"],
      headingWeight: 700,
      bodyWeight: 400,
      scale: "comfortable",
    },
    headerStyle: "boutique-compact",
    productCardStyle: "rounded-shadow",
    heroStyle: "silk",
    enabledSections: ["hero", "categories", "featured_products", "trust_badges"],
    suitableFor: ["متاجر عامة", "عطور وهدايا", "تجزئة هادئة"],
    sortOrder: 1,
  },
  {
    id: "night",
    nameAr: "ليلي",
    nameEn: "Night",
    market: "mixed",
    category: "storefront",
    previewStyle: "luxury-dark",
    colors: {
      primary: STOREFRONT_TOKEN_PRESETS.night["--c-brand"],
      accent: STOREFRONT_TOKEN_PRESETS.night["--c-accent"],
      background: STOREFRONT_TOKEN_PRESETS.night["--c-bg"],
      foreground: STOREFRONT_TOKEN_PRESETS.night["--c-text"],
      card: STOREFRONT_TOKEN_PRESETS.night["--c-surface"],
      border: STOREFRONT_TOKEN_PRESETS.night["--c-line"],
      muted: STOREFRONT_TOKEN_PRESETS.night["--c-surface-2"],
      mutedForeground: STOREFRONT_TOKEN_PRESETS.night["--c-muted"],
    },
    typography: {
      fontFamilyAr: STOREFRONT_TOKEN_PRESETS.night["--font-body"],
      fontFamilyEn: STOREFRONT_TOKEN_PRESETS.night["--font-body"],
      headingWeight: 700,
      bodyWeight: 400,
      scale: "comfortable",
    },
    headerStyle: "boutique-compact",
    productCardStyle: "rounded-shadow",
    heroStyle: "spotlight",
    enabledSections: ["hero", "categories", "featured_products", "trust_badges"],
    suitableFor: ["منتجات فاخرة", "مجوهرات", "معارض ليلية"],
    sortOrder: 2,
  },
  {
    id: "vivid",
    nameAr: "حيوي",
    nameEn: "Vivid",
    market: "mixed",
    category: "storefront",
    previewStyle: "marketplace-grid",
    colors: {
      primary: STOREFRONT_TOKEN_PRESETS.vivid["--c-brand"],
      accent: STOREFRONT_TOKEN_PRESETS.vivid["--c-accent"],
      background: STOREFRONT_TOKEN_PRESETS.vivid["--c-bg"],
      foreground: STOREFRONT_TOKEN_PRESETS.vivid["--c-text"],
      card: STOREFRONT_TOKEN_PRESETS.vivid["--c-surface"],
      border: STOREFRONT_TOKEN_PRESETS.vivid["--c-line"],
      muted: STOREFRONT_TOKEN_PRESETS.vivid["--c-surface-2"],
      mutedForeground: STOREFRONT_TOKEN_PRESETS.vivid["--c-muted"],
    },
    typography: {
      fontFamilyAr: STOREFRONT_TOKEN_PRESETS.vivid["--font-body"],
      fontFamilyEn: STOREFRONT_TOKEN_PRESETS.vivid["--font-body"],
      headingWeight: 700,
      bodyWeight: 400,
      scale: "comfortable",
    },
    headerStyle: "split-nav",
    productCardStyle: "rounded-shadow",
    heroStyle: "mesh",
    enabledSections: ["hero", "categories", "featured_products", "trust_badges"],
    suitableFor: ["إلكترونيات", "أزياء", "متجر متعدد الأقسام"],
    sortOrder: 3,
  },
  {
    id: "auto",
    nameAr: "Auto",
    nameEn: "Auto",
    market: "automotive",
    category: "storefront",
    previewStyle: "industrial",
    colors: {
      primary: STOREFRONT_TOKEN_PRESETS.auto["--c-brand"],
      accent: STOREFRONT_TOKEN_PRESETS.auto["--c-accent"],
      background: STOREFRONT_TOKEN_PRESETS.auto["--c-bg"],
      foreground: STOREFRONT_TOKEN_PRESETS.auto["--c-text"],
      card: STOREFRONT_TOKEN_PRESETS.auto["--c-surface"],
      border: STOREFRONT_TOKEN_PRESETS.auto["--c-line"],
      muted: STOREFRONT_TOKEN_PRESETS.auto["--c-surface-2"],
      mutedForeground: STOREFRONT_TOKEN_PRESETS.auto["--c-muted"],
    },
    typography: {
      fontFamilyAr: STOREFRONT_TOKEN_PRESETS.auto["--font-body"],
      fontFamilyEn: STOREFRONT_TOKEN_PRESETS.auto["--font-body"],
      headingWeight: 700,
      bodyWeight: 400,
      scale: "comfortable",
    },
    headerStyle: "showroom-wide",
    productCardStyle: "rounded-shadow",
    heroStyle: "showroom-banner",
    enabledSections: ["hero", "categories", "featured_products", "trust_badges"],
    suitableFor: ["auto parts", "tires", "batteries"],
    sortOrder: 4,
  },
  {
    id: "warm",
    nameAr: "Warm",
    nameEn: "Warm",
    market: "mixed",
    category: "storefront",
    previewStyle: "warm-retail",
    colors: {
      primary: STOREFRONT_TOKEN_PRESETS.warm["--c-brand"],
      accent: STOREFRONT_TOKEN_PRESETS.warm["--c-accent"],
      background: STOREFRONT_TOKEN_PRESETS.warm["--c-bg"],
      foreground: STOREFRONT_TOKEN_PRESETS.warm["--c-text"],
      card: STOREFRONT_TOKEN_PRESETS.warm["--c-surface"],
      border: STOREFRONT_TOKEN_PRESETS.warm["--c-line"],
      muted: STOREFRONT_TOKEN_PRESETS.warm["--c-surface-2"],
      mutedForeground: STOREFRONT_TOKEN_PRESETS.warm["--c-muted"],
    },
    typography: {
      fontFamilyAr: STOREFRONT_TOKEN_PRESETS.warm["--font-body"],
      fontFamilyEn: STOREFRONT_TOKEN_PRESETS.warm["--font-body"],
      headingWeight: 700,
      bodyWeight: 400,
      scale: "comfortable",
    },
    headerStyle: "boutique-compact",
    productCardStyle: "rounded-shadow",
    heroStyle: "silk",
    enabledSections: ["hero", "categories", "featured_products", "trust_badges"],
    suitableFor: ["home", "kitchen", "kids", "camping"],
    sortOrder: 5,
  },
];

export function isStorefrontPresetId(value: string | null | undefined): value is StorefrontPresetId {
  return value === "quiet" || value === "night" || value === "vivid" || value === "auto" || value === "warm";
}

function normalizeCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[_/]+/g, "-")
    .replace(/\s+/g, " ");
}

export function storefrontPresetForCategory(category: string | null | undefined): StorefrontPresetId | null {
  if (!category) return null;
  const normalized = normalizeCategory(category);
  const hyphenated = normalized.replace(/\s+/g, "-");
  return (
    STOREFRONT_CATEGORY_ID_PRESET_MAP[hyphenated] ??
    STOREFRONT_CATEGORY_ID_PRESET_MAP[normalized] ??
    STOREFRONT_CATEGORY_PRESET_MAP[normalized] ??
    STOREFRONT_CATEGORY_PRESET_MAP[hyphenated] ??
    CATEGORY_ALIAS_PRESET_MAP[normalized] ??
    CATEGORY_ALIAS_PRESET_MAP[hyphenated] ??
    null
  );
}

export function storefrontPresetToTokens(id: string | null | undefined): StorefrontTokens {
  return STOREFRONT_TOKEN_PRESETS[isStorefrontPresetId(id) ? id : "quiet"];
}

export function legacyVarsFromTokens(tokens: StorefrontTokens): Record<string, string> {
  return {
    background: tokens["--c-bg"],
    foreground: tokens["--c-text"],
    primary: tokens["--c-brand"],
    "primary-foreground": tokens["--c-on-brand"],
    "primary-text": tokens["--c-brand"],
    accent: tokens["--c-accent"],
    "accent-foreground": tokens["--c-on-brand"],
    muted: tokens["--c-surface-2"],
    "muted-foreground": tokens["--c-muted"],
    card: tokens["--c-surface"],
    border: tokens["--c-line"],
  };
}

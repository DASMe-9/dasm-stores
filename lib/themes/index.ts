export * from "./types";
export { THEME_PRESETS } from "./presets";
export { presetToStoreTheme, presetToThemeConfig, designToChromeThemeConfig } from "./to-store-theme";
export {
  STOREFRONT_PRESET_IDS,
  STOREFRONT_THEME_PRESETS,
  STOREFRONT_TOKEN_PRESETS,
  isStorefrontPresetId,
  legacyVarsFromTokens,
  storefrontPresetForCategory,
  storefrontPresetToTokens,
} from "./storefront-tokens";
export {
  PRESET_TO_LEGACY_THEME_ID,
  resolveLegacyThemeId,
  resolvePresetIdFromLegacyThemeId,
} from "./resolve-theme-id";

/** Prefer theme_preset (slug) over legacy numeric theme_id when saving store settings. */
export function buildThemeStorePayload(preset: { id: string }): {
  theme_preset: string;
} {
  return { theme_preset: preset.id };
}
export { productCardClassName } from "./product-card-class";
export { resolveStoreCssVariables, resolveStoreTemplateConfig } from "./resolve-store-theme";

import type { ThemeMarket, ThemePreset } from "./types";
import { THEME_PRESETS } from "./presets";
import { STOREFRONT_THEME_PRESETS } from "./storefront-tokens";

export function findPresetById(id: string | null | undefined): ThemePreset | undefined {
  if (!id) return undefined;
  return STOREFRONT_THEME_PRESETS.find((p) => p.id === id) ?? THEME_PRESETS.find((p) => p.id === id);
}

export function presetsByMarket(market: ThemeMarket | "all"): ThemePreset[] {
  if (market === "all") return STOREFRONT_THEME_PRESETS;
  return STOREFRONT_THEME_PRESETS.filter((p) => p.market === market || p.market === "mixed");
}

export function detectPresetFromThemeConfig(
  themeConfig: Record<string, unknown> | null | undefined,
): ThemePreset | undefined {
  const presetId = themeConfig?.preset_id;
  if (typeof presetId === "string") return findPresetById(presetId);
  const palette = themeConfig?.palette;
  if (typeof palette === "string") return findPresetById(palette);
  return undefined;
}

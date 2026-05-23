export * from "./types";
export { THEME_PRESETS } from "./presets";
export { presetToStoreTheme, presetToThemeConfig } from "./to-store-theme";
export {
  PRESET_TO_LEGACY_THEME_ID,
  resolveLegacyThemeId,
  resolvePresetIdFromLegacyThemeId,
} from "./resolve-theme-id";
export { productCardClassName } from "./product-card-class";
export { resolveStoreCssVariables, resolveStoreTemplateConfig } from "./resolve-store-theme";

import type { ThemeMarket, ThemePreset } from "./types";
import { THEME_PRESETS } from "./presets";

export function findPresetById(id: string | null | undefined): ThemePreset | undefined {
  if (!id) return undefined;
  return THEME_PRESETS.find((p) => p.id === id);
}

export function presetsByMarket(market: ThemeMarket | "all"): ThemePreset[] {
  if (market === "all") return THEME_PRESETS;
  return THEME_PRESETS.filter((p) => p.market === market || p.market === "mixed");
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

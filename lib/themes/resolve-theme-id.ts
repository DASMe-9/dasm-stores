/**
 * Maps preset slug → public.store_themes.id on DASM-core after seed.
 * Updated when seed order changes; Laravel validates theme_id against this table.
 */
export const PRESET_TO_LEGACY_THEME_ID: Record<string, number> = {
  "auto-luxury-showroom": 1,
  "auto-sport-performance": 2,
  "auto-economy-value": 3,
  "auto-parts-garage": 4,
  "auto-accessories-hub": 5,
  "auto-classic-heritage": 6,
  "auto-trucks-equipment": 7,
  "auto-caravan-travel": 8,
  "auto-official-dealer": 9,
  "auto-service-deals": 10,
  "retail-perfume-luxury": 11,
  "retail-incense-oud": 12,
  "retail-personal-accessories": 13,
  "retail-fashion-abaya": 14,
  "retail-kids-wear": 15,
  "retail-jewelry": 16,
  "retail-gifts-packaging": 17,
  "retail-home-living": 18,
  "retail-electronics-lite": 19,
  "retail-multi-department": 20,
};

export function resolveLegacyThemeId(presetId: string): number | undefined {
  return PRESET_TO_LEGACY_THEME_ID[presetId];
}

export function resolvePresetIdFromLegacyThemeId(
  themeId: number | null | undefined,
): string | undefined {
  if (themeId == null) return undefined;
  return Object.entries(PRESET_TO_LEGACY_THEME_ID).find(([, id]) => id === themeId)?.[0];
}

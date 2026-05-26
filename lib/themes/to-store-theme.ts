import type { StoreThemePayload } from "./types";
import type { ThemePreset } from "./types";
import { pickReadableForeground, pickReadableTextColor } from "./color-contrast";

/** Maps preset → API-compatible theme payload (Laravel store_themes shape). */
export function presetToStoreTheme(preset: ThemePreset): StoreThemePayload {
  const { colors, typography, headerStyle, productCardStyle, heroStyle, enabledSections } =
    preset;
  const primaryForeground = pickReadableForeground(colors.primary, {
    dark: "#111827",
    light: "#ffffff",
  });
  const accentForeground = pickReadableForeground(colors.accent, {
    dark: "#111827",
    light: "#ffffff",
  });
  const primaryText = pickReadableTextColor(
    [colors.primary, colors.accent, colors.foreground],
    [colors.card, colors.background],
    colors.foreground,
  );

  return {
    css_variables: {
      primary: colors.primary,
      "primary-foreground": primaryForeground,
      "primary-text": primaryText,
      accent: colors.accent,
      "accent-foreground": accentForeground,
      background: colors.background,
      foreground: colors.foreground,
      card: colors.card,
      border: colors.border,
      muted: colors.muted,
      "muted-foreground": colors.mutedForeground,
      "font-family-ar": typography.fontFamilyAr,
      "font-family-en": typography.fontFamilyEn,
      "heading-weight": String(typography.headingWeight),
      "product-card-style": productCardStyle,
      "header-style": headerStyle,
    },
    template_config: {
      hero_motion: heroStyle,
      header_style: headerStyle,
      product_card_style: productCardStyle,
      preview_style: preset.previewStyle,
      enabled_sections: enabledSections,
      typography_scale: typography.scale,
      preset_id: preset.id,
      preset_version: 2,
    },
  };
}

export function presetToThemeConfig(preset: ThemePreset) {
  const payload = presetToStoreTheme(preset);
  return {
    preset_id: preset.id,
    preset_version: 1,
    market: preset.market,
    category: preset.category,
    palette: preset.id,
    primary: preset.colors.primary,
    accent: preset.colors.accent,
    ...payload.template_config,
  };
}

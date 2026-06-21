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

/**
 * Maps a preset → theme_config. Non-destructive: any keys already on the
 * store's theme_config (notably the visual builder's `editor` document) are
 * preserved; only the preset/colour keys are overwritten. Without this guard,
 * saving a preset wiped the merchant's saved homepage layout.
 */
export function presetToThemeConfig(
  preset: ThemePreset,
  base?: Record<string, unknown> | null,
) {
  const payload = presetToStoreTheme(preset);
  return {
    ...(base ?? {}),
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

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Bridges the visual builder's `design` to the legacy chrome theme vars.
 * The public storefront chrome (header/footer/buttons) reads colours from
 * top-level theme_config keys via `resolveStoreCssVariables`, which does NOT
 * read `editor.design`. Writing `primary` here keeps the chrome colour in sync
 * with the block theme colour for stores that use only the new editor.
 */
export function designToChromeThemeConfig(
  design: { themeColor?: string | null } | null | undefined,
): Record<string, string> {
  const color = design?.themeColor;
  if (typeof color === "string" && HEX_COLOR.test(color.trim())) {
    return { primary: color.trim() };
  }
  return {};
}

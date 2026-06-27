import type { StoreThemePayload } from "./types";
import type { ThemePreset } from "./types";
import { pickReadableForeground, pickReadableTextColor } from "./color-contrast";
import {
  isStorefrontPresetId,
  legacyVarsFromTokens,
  storefrontPresetToTokens,
  type StorefrontTokens,
} from "./storefront-tokens";

function tokensFromLegacyPreset(preset: ThemePreset): StorefrontTokens {
  const base = storefrontPresetToTokens("quiet");
  return {
    ...base,
    "--c-bg": preset.colors.background,
    "--c-surface": preset.colors.card,
    "--c-surface-2": preset.colors.muted,
    "--c-text": preset.colors.foreground,
    "--c-muted": preset.colors.mutedForeground,
    "--c-line": preset.colors.border,
    "--c-brand": preset.colors.primary,
    "--c-on-brand": pickReadableForeground(preset.colors.primary, { dark: "#111827", light: "#ffffff" }),
    "--c-accent": preset.colors.accent,
    "--c-sale": preset.colors.accent,
  };
}

/** Maps preset → API-compatible theme payload (Laravel store_themes shape). */
export function presetToStoreTheme(preset: ThemePreset): StoreThemePayload {
  const { colors, typography, headerStyle, productCardStyle, heroStyle, enabledSections } =
    preset;
  const tokenPresetId = isStorefrontPresetId(preset.id) ? preset.id : null;
  const storefrontTokens = tokenPresetId ? storefrontPresetToTokens(tokenPresetId) : tokensFromLegacyPreset(preset);
  const tokenLegacyVars = legacyVarsFromTokens(storefrontTokens);
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
      ...storefrontTokens,
      "preset-id": preset.id,
      primary: tokenPresetId ? tokenLegacyVars.primary : colors.primary,
      "primary-foreground": tokenPresetId ? tokenLegacyVars["primary-foreground"] : primaryForeground,
      "primary-text": tokenPresetId ? tokenLegacyVars["primary-text"] : primaryText,
      accent: tokenPresetId ? tokenLegacyVars.accent : colors.accent,
      "accent-foreground": tokenPresetId ? tokenLegacyVars["accent-foreground"] : accentForeground,
      background: tokenPresetId ? tokenLegacyVars.background : colors.background,
      foreground: tokenPresetId ? tokenLegacyVars.foreground : colors.foreground,
      card: tokenPresetId ? tokenLegacyVars.card : colors.card,
      border: tokenPresetId ? tokenLegacyVars.border : colors.border,
      muted: tokenPresetId ? tokenLegacyVars.muted : colors.muted,
      "muted-foreground": tokenPresetId ? tokenLegacyVars["muted-foreground"] : colors.mutedForeground,
      "font-family-ar": storefrontTokens["--font-body"],
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
    preset_version: 3,
    market: preset.market,
    category: preset.category,
    palette: preset.id,
    primary: payload.css_variables.primary,
    accent: payload.css_variables.accent,
    css_variables: {
      ...((base?.css_variables && typeof base.css_variables === "object" && !Array.isArray(base.css_variables)
        ? base.css_variables
        : {}) as Record<string, unknown>),
      ...payload.css_variables,
    },
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
